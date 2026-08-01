// Package crypto implementa OSINT para blockchain y criptomonedas.
package crypto

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

// CryptoResult resultado de análisis cripto
type CryptoResult struct {
	Target    string            `json:"target"` // address, tx hash, or domain
	Type      string            `json:"type"`   // address, transaction, domain
	Balance   float64           `json:"balance,omitempty"`
	TxCount   int               `json:"tx_count,omitempty"`
	FirstTx   string            `json:"first_tx,omitempty"`
	LastTx    string            `json:"last_tx,omitempty"`
	Labels    []string          `json:"labels,omitempty"`
	Exchanges []string          `json:"exchanges,omitempty"`
	Metadata  map[string]string `json:"metadata,omitempty"`
}

type Scanner interface {
	Name() string
	Scan(ctx context.Context, target, scanType string) (*CryptoResult, error)
}

type Engine struct {
	scanners []Scanner
}

func NewEngine() *Engine {
	e := &Engine{
		scanners: make([]Scanner, 0),
	}
	e.Register(&BlockchainInfoScraper{})
	e.Register(&ETHExplorerScraper{})
	e.Register(&BTCExplorerScraper{})
	return e
}

func (e *Engine) Register(s Scanner) {
	e.scanners = append(e.scanners, s)
}

func (e *Engine) Scan(ctx context.Context, target, scanType string) *CryptoResult {
	result := &CryptoResult{
		Target:   target,
		Type:     scanType,
		Metadata: make(map[string]string),
	}

	for _, s := range e.scanners {
		select {
		case <-ctx.Done():
			return result
		default:
		}
		partial, err := s.Scan(ctx, target, scanType)
		if err == nil && partial != nil {
			result.Balance = partial.Balance
			result.TxCount = partial.TxCount
			result.FirstTx = partial.FirstTx
			result.LastTx = partial.LastTx
			result.Labels = append(result.Labels, partial.Labels...)
			result.Exchanges = append(result.Exchanges, partial.Exchanges...)
		}
	}

	return result
}

// --- Blockchain.com Scraper ---
type BlockchainInfoScraper struct{}

func (s *BlockchainInfoScraper) Name() string { return "BlockchainInfo" }

func (s *BlockchainInfoScraper) Scan(ctx context.Context, target, scanType string) (*CryptoResult, error) {
	if scanType != "btc_address" {
		return nil, fmt.Errorf("not BTC address")
	}

	url := fmt.Sprintf("https://blockchain.info/rawaddr/%s?limit=5", target)
	req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)
	req.Header.Set("User-Agent", "OSINT-Go/1.0")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("blockchain.info returned %d", resp.StatusCode)
	}

	var data struct {
		Address    string  `json:"address"`
		Balance    float64 `json:"balance"`
		NTx        int     `json:"n_tx"`
		Txs        []struct {
			Time int64 `json:"time"`
		} `json:"txs"`
	}

	body, _ := io.ReadAll(io.LimitReader(resp.Body, 50000))
	if err := json.Unmarshal(body, &data); err != nil {
		return nil, err
	}

	result := &CryptoResult{
		Target:  target,
		Type:    "btc_address",
		Balance: float64(data.Balance) / 100000000, // Convert satoshis to BTC
		TxCount: data.NTx,
		Metadata: map[string]string{
			"currency":    "BTC",
			"explorer":    "blockchain.info",
			"balance_sats": fmt.Sprintf("%d", int(data.Balance)),
		},
	}

	if len(data.Txs) > 0 {
		result.FirstTx = time.Unix(data.Txs[len(data.Txs)-1].Time, 0).Format(time.RFC3339)
		result.LastTx = time.Unix(data.Txs[0].Time, 0).Format(time.RFC3339)
	}

	return result, nil
}

// --- ETH Explorer Scraper ---
type ETHExplorerScraper struct{}

func (s *ETHExplorerScraper) Name() string { return "ETHExplorer" }

func (s *ETHExplorerScraper) Scan(ctx context.Context, target, scanType string) (*CryptoResult, error) {
	if scanType != "eth_address" {
		return nil, fmt.Errorf("not ETH address")
	}

	// Use Etherscan public API (no key required for basic info)
	url := fmt.Sprintf("https://api.etherscan.io/api?module=account&action=balance&address=%s&tag=latest", target)
	req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var data struct {
		Status  string `json:"status"`
		Message string `json:"message"`
		Result  string `json:"result"`
	}

	body, _ := io.ReadAll(io.LimitReader(resp.Body, 5000))
	if err := json.Unmarshal(body, &data); err != nil {
		return nil, err
	}

	if data.Status != "1" {
		return nil, fmt.Errorf("etherscan error: %s", data.Message)
	}

	// Convert wei to ETH
	var balance float64
	fmt.Sscanf(data.Result, "%f", &balance)
	balance = balance / 1e18

	return &CryptoResult{
		Target:  target,
		Type:    "eth_address",
		Balance: balance,
		Metadata: map[string]string{
			"currency": "ETH",
			"explorer": "etherscan.io",
			"wei":      data.Result,
		},
	}, nil
}

// --- BTC Explorer (Blockstream) ---
type BTCExplorerScraper struct{}

func (s *BTCExplorerScraper) Name() string { return "Blockstream" }

func (s *BTCExplorerScraper) Scan(ctx context.Context, target, scanType string) (*CryptoResult, error) {
	if scanType != "btc_address" {
		return nil, fmt.Errorf("not BTC address")
	}

	url := fmt.Sprintf("https://blockstream.info/api/address/%s", target)
	req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("blockstream returned %d", resp.StatusCode)
	}

	var data struct {
		Address struct {
			Address string `json:"address"`
		} `json:"address"`
		ChainStats struct {
			FundedTxoSum int `json:"funded_txo_sum"`
			TxCount      int `json:"tx_count"`
		} `json:"chain_stats"`
	}

	body, _ := io.ReadAll(io.LimitReader(resp.Body, 10000))
	if err := json.Unmarshal(body, &data); err != nil {
		return nil, err
	}

	return &CryptoResult{
		Target:  target,
		Type:    "btc_address",
		Balance: float64(data.ChainStats.FundedTxoSum) / 100000000,
		TxCount: data.ChainStats.TxCount,
		Metadata: map[string]string{
			"currency": "BTC",
			"explorer": "blockstream.info",
		},
	}, nil
}

// DetectCryptoType detecta el tipo de目标 cripto
func DetectCryptoType(target string) string {
	target = strings.TrimSpace(target)

	// BTC address (1, 3, or bc1)
	if strings.HasPrefix(target, "1") || strings.HasPrefix(target, "3") || strings.HasPrefix(target, "bc1") {
		return "btc_address"
	}

	// ETH address (0x)
	if strings.HasPrefix(target, "0x") && len(target) == 42 {
		return "eth_address"
	}

	// TX hash (64 hex chars)
	if len(target) == 64 {
		return "transaction"
	}

	return "unknown"
}
