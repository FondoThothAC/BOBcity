// Package cloudsecurity implementa OSINT para infraestructura cloud pública.
package cloudsecurity

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

// CloudResult resultado de investigación cloud
type CloudResult struct {
	Target    string            `json:"target"`
	Provider  string            `json:"provider"` // aws, gcp, azure, generic
	Services  []CloudService    `json:"services,omitempty"`
	Buckets   []S3Bucket        `json:"buckets,omitempty"`
	Metadata  map[string]string `json:"metadata,omitempty"`
}

type CloudService struct {
	Name     string `json:"name"`
	Endpoint string `json:"endpoint"`
	Status   string `json:"status"`
	Type     string `json:"type"` // storage, compute, database, etc
}

type S3Bucket struct {
	Name   string `json:"name"`
	URL    string `json:"url"`
	Public bool   `json:"public"`
	Files  int    `json:"files,omitempty"`
}

type Scanner interface {
	Name() string
	Scan(ctx context.Context, target string) (*CloudResult, error)
}

type Engine struct {
	scanners []Scanner
}

func NewEngine() *Engine {
	e := &Engine{
		scanners: make([]Scanner, 0),
	}
	e.Register(&S3Scanner{})
	e.Register(&GCPStorageScanner{})
	e.Register(&AzureBlobScanner{})
	e.Register(&AWSEndpointScanner{})
	return e
}

func (e *Engine) Register(s Scanner) {
	e.scanners = append(e.scanners, s)
}

func (e *Engine) Scan(ctx context.Context, target string) *CloudResult {
	result := &CloudResult{
		Target:   target,
		Metadata: make(map[string]string),
	}

	for _, s := range e.scanners {
		select {
		case <-ctx.Done():
			return result
		default:
		}
		partial, err := s.Scan(ctx, target)
		if err == nil && partial != nil {
			result.Services = append(result.Services, partial.Services...)
			result.Buckets = append(result.Buckets, partial.Buckets...)
		}
	}

	return result
}

// --- S3 Bucket Scanner ---
type S3Scanner struct{}

func (s *S3Scanner) Name() string { return "S3Scanner" }

func (s *S3Scanner) Scan(ctx context.Context, target string) (*CloudResult, error) {
	// Try common S3 bucket naming patterns
	patterns := []string{
		"%s", "%s-assets", "%s-media", "%s-uploads",
		"%s-backup", "%s-data", "%s-public", "%s-static",
		"%s-cdn", "%s-files", "%s-images", "%s-content",
	}

	result := &CloudResult{
		Target:   target,
		Provider: "aws",
		Metadata: make(map[string]string),
	}

	baseName := strings.TrimPrefix(target, "www.")
	baseName = strings.TrimSuffix(baseName, ".com")
	baseName = strings.TrimSuffix(baseName, ".io")
	baseName = strings.TrimSuffix(baseName, ".net")

	for _, pattern := range patterns {
		select {
		case <-ctx.Done():
			return result, ctx.Err()
		default:
		}

		bucketName := fmt.Sprintf(pattern, baseName)
		url := fmt.Sprintf("https://%s.s3.amazonaws.com/", bucketName)

		client := &http.Client{Timeout: 5 * time.Second}
		req, _ := http.NewRequestWithContext(ctx, "HEAD", url, nil)

		resp, err := client.Do(req)
		if err != nil {
			continue
		}
		resp.Body.Close()

		bucket := S3Bucket{
			Name:   bucketName,
			URL:    url,
			Public: resp.StatusCode == 200,
		}

		if resp.StatusCode == 200 {
			// Try to list objects
			listURL := fmt.Sprintf("https://%s.s3.amazonaws.com/?max-keys=10", bucketName)
			req2, _ := http.NewRequestWithContext(ctx, "GET", listURL, nil)
			resp2, err := client.Do(req2)
			if err == nil {
				defer resp2.Body.Close()
				body, _ := io.ReadAll(io.LimitReader(resp2.Body, 10000))
				// Count objects in XML response
				count := strings.Count(string(body), "<Key>")
				bucket.Files = count
				resp2.Body.Close()
			}
		}

		result.Buckets = append(result.Buckets, bucket)
	}

	result.Metadata["buckets_found"] = fmt.Sprintf("%d", len(result.Buckets))
	return result, nil
}

// --- GCP Storage Scanner ---
type GCPStorageScanner struct{}

func (s *GCPStorageScanner) Name() string { return "GCPStorage" }

func (s *GCPStorageScanner) Scan(ctx context.Context, target string) (*CloudResult, error) {
	result := &CloudResult{
		Target:   target,
		Provider: "gcp",
		Metadata: make(map[string]string),
	}

	baseName := strings.TrimPrefix(target, "www.")
	baseName = strings.TrimSuffix(baseName, ".com")

	// Try common GCS bucket patterns
	patterns := []string{"%s", "%s.appspot.com", "%s-prod", "%s-staging"}

	for _, pattern := range patterns {
		select {
		case <-ctx.Done():
			return result, ctx.Err()
		default:
		}

		bucketName := fmt.Sprintf(pattern, baseName)
		url := fmt.Sprintf("https://storage.googleapis.com/%s/", bucketName)

		client := &http.Client{Timeout: 5 * time.Second}
		req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)

		resp, err := client.Do(req)
		if err != nil {
			continue
		}
		resp.Body.Close()

		if resp.StatusCode == 200 {
			result.Services = append(result.Services, CloudService{
				Name:     bucketName,
				Endpoint: url,
				Status:   "accessible",
				Type:     "storage",
			})
		}
	}

	return result, nil
}

// --- Azure Blob Scanner ---
type AzureBlobScanner struct{}

func (s *AzureBlobScanner) Name() string { return "AzureBlob" }

func (s *AzureBlobScanner) Scan(ctx context.Context, target string) (*CloudResult, error) {
	result := &CloudResult{
		Target:   target,
		Provider: "azure",
		Metadata: make(map[string]string),
	}

	baseName := strings.TrimPrefix(target, "www.")
	baseName = strings.TrimSuffix(baseName, ".com")

	// Try common Azure blob patterns
	patterns := []string{"%s", "%s-prod", "%s-backup", "%s-public"}

	for _, pattern := range patterns {
		select {
		case <-ctx.Done():
			return result, ctx.Err()
		default:
		}

		accountName := fmt.Sprintf(pattern, baseName)
		url := fmt.Sprintf("https://%s.blob.core.windows.net/?comp=list", accountName)

		client := &http.Client{Timeout: 5 * time.Second}
		req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)

		resp, err := client.Do(req)
		if err != nil {
			continue
		}
		resp.Body.Close()

		if resp.StatusCode == 200 || resp.StatusCode == 403 {
			result.Services = append(result.Services, CloudService{
				Name:     accountName,
				Endpoint: url,
				Status:   "exists",
				Type:     "blob_storage",
			})
		}
	}

	return result, nil
}

// --- AWS Endpoint Scanner ---
type AWSEndpointScanner struct{}

func (s *AWSEndpointScanner) Name() string { return "AWSEndpoints" }

func (s *AWSEndpointScanner) Scan(ctx context.Context, target string) (*CloudResult, error) {
	result := &CloudResult{
		Target:   target,
		Provider: "aws",
		Metadata: make(map[string]string),
	}

	// Check for AWS-related DNS records
	// This is a basic check - full implementation would use AWS APIs
	endpoints := []struct {
		Name string
		URL  string
	}{
		{"CloudFront", fmt.Sprintf("https://%s.cloudfront.net/", target)},
		{"ElasticBeanstalk", fmt.Sprintf("https://%s.elasticbeanstalk.com/", target)},
		{"AppSync", fmt.Sprintf("https://%s.appsync-api.us-east-1.amazonaws.com/graphql", target)},
	}

	client := &http.Client{Timeout: 5 * time.Second}

	for _, ep := range endpoints {
		select {
		case <-ctx.Done():
			return result, ctx.Err()
		default:
		}

		req, _ := http.NewRequestWithContext(ctx, "HEAD", ep.URL, nil)
		resp, err := client.Do(req)
		if err != nil {
			continue
		}
		resp.Body.Close()

		if resp.StatusCode == 200 || resp.StatusCode == 403 || resp.StatusCode == 301 {
			result.Services = append(result.Services, CloudService{
				Name:     ep.Name,
				Endpoint: ep.URL,
				Status:   "exists",
				Type:     "cloud_service",
			})
		}
	}

	result.Metadata["services_found"] = fmt.Sprintf("%d", len(result.Services))
	return result, nil
}
