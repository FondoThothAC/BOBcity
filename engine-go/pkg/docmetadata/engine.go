// Package docmetadata implementa extracción de metadatos de documentos.
package docmetadata

import (
	"bytes"
	"context"
	"encoding/binary"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

// DocResult resultado de extracción de metadatos
type DocResult struct {
	URL        string            `json:"url"`
	FileType   string            `json:"file_type"`
	FileSize   int64             `json:"file_size"`
	MimeType   string            `json:"mime_type"`
	Metadata   map[string]string `json:"metadata,omitempty"`
	ExifData   map[string]string `json:"exif_data,omitempty"`
	Warnings   []string          `json:"warnings,omitempty"`
}

type Scanner interface {
	Name() string
	Scan(ctx context.Context, url string) (*DocResult, error)
}

type Engine struct {
	scanners []Scanner
}

func NewEngine() *Engine {
	e := &Engine{
		scanners: make([]Scanner, 0),
	}
	e.Register(&PDFMetadata{})
	e.Register(&ImageExif{})
	e.Register(&OfficeMetadata{})
	return e
}

func (e *Engine) Register(s Scanner) {
	e.scanners = append(e.scanners, s)
}

func (e *Engine) Scan(ctx context.Context, url string) *DocResult {
	result := &DocResult{
		URL:      url,
		Metadata: make(map[string]string),
	}

	// Download file
	client := &http.Client{Timeout: 30 * time.Second}
	req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)
	req.Header.Set("User-Agent", "Mozilla/5.0 (compatible; OSINT-Go/1.0)")

	resp, err := client.Do(req)
	if err != nil {
		result.Metadata["error"] = err.Error()
		return result
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(io.LimitReader(resp.Body, 50*1024*1024)) // 50MB max
	result.FileSize = int64(len(body))
	result.MimeType = resp.Header.Get("Content-Type")

	// Detect file type from magic bytes
	result.FileType = detectFileType(body)

	// Run scanners
	for _, s := range e.scanners {
		select {
		case <-ctx.Done():
			return result
		default:
		}
		partial, err := s.Scan(ctx, url)
		if err == nil && partial != nil {
			for k, v := range partial.Metadata {
				result.Metadata[k] = v
			}
			for k, v := range partial.ExifData {
				result.ExifData[k] = v
			}
		}
	}

	// Inline metadata extraction
	extractMetadata(body, result.FileType, result)

	return result
}

func detectFileType(data []byte) string {
	if len(data) < 4 {
		return "unknown"
	}

	// PDF
	if bytes.HasPrefix(data, []byte("%PDF")) {
		return "pdf"
	}
	// PNG
	if data[0] == 0x89 && data[1] == 0x50 && data[2] == 0x4E && data[3] == 0x47 {
		return "png"
	}
	// JPEG
	if data[0] == 0xFF && data[1] == 0xD8 && data[2] == 0xFF {
		return "jpeg"
	}
	// GIF
	if data[0] == 'G' && data[1] == 'I' && data[2] == 'F' {
		return "gif"
	}
	// ZIP (docx, xlsx, etc)
	if data[0] == 0x50 && data[1] == 0x4B {
		return "zip"
	}
	// RAR
	if data[0] == 0x52 && data[1] == 0x61 && data[2] == 0x72 {
		return "rar"
	}
	// MP4
	if len(data) > 8 && string(data[4:8]) == "ftyp" {
		return "mp4"
	}
	// MP3
	if data[0] == 0x49 && data[1] == 0x44 && data[2] == 0x33 {
		return "mp3"
	}
	// OGG
	if data[0] == 'O' && data[1] == 'g' && data[2] == 'g' {
		return "ogg"
	}
	// FLAC
	if bytes.HasPrefix(data, []byte("fLaC")) {
		return "flac"
	}

	return "unknown"
}

func extractMetadata(data []byte, fileType string, result *DocResult) {
	switch fileType {
	case "pdf":
		extractPDFMetadata(data, result)
	case "png":
		extractPNGMetadata(data, result)
	case "jpeg":
		result.ExifData["note"] = "JPEG EXIF requires full parse - use exiftool for complete data"
	}
}

func extractPDFMetadata(data []byte, result *DocResult) {
	dataStr := string(data)

	// Extract PDF version
	if idx := strings.Index(dataStr, "%PDF-"); idx >= 0 {
		end := idx + 8
		if end > len(dataStr) {
			end = len(dataStr)
		}
		result.Metadata["pdf_version"] = strings.TrimSpace(dataStr[idx:end])
	}

	// Extract title
	if idx := strings.Index(dataStr, "/Title "); idx > 0 {
		end := strings.Index(dataStr[idx:], ")")
		if end > 0 {
			result.Metadata["title"] = dataStr[idx+8 : idx+end+1]
		}
	}

	// Extract author
	if idx := strings.Index(dataStr, "/Author "); idx > 0 {
		end := strings.Index(dataStr[idx:], ")")
		if end > 0 {
			result.Metadata["author"] = dataStr[idx+9 : idx+end+1]
		}
	}

	// Extract creator
	if idx := strings.Index(dataStr, "/Creator "); idx > 0 {
		end := strings.Index(dataStr[idx:], ")")
		if end > 0 {
			result.Metadata["creator"] = dataStr[idx+10 : idx+end+1]
		}
	}

	// Extract producer
	if idx := strings.Index(dataStr, "/Producer "); idx > 0 {
		end := strings.Index(dataStr[idx:], ")")
		if end > 0 {
			result.Metadata["producer"] = dataStr[idx+11 : idx+end+1]
		}
	}

	// Extract creation date
	if idx := strings.Index(dataStr, "/CreationDate "); idx > 0 {
		end := strings.Index(dataStr[idx:], ")")
		if end > 0 {
			result.Metadata["creation_date"] = dataStr[idx+15 : idx+end+1]
		}
	}

	// Extract modification date
	if idx := strings.Index(dataStr, "/ModDate "); idx > 0 {
		end := strings.Index(dataStr[idx:], ")")
		if end > 0 {
			result.Metadata["modification_date"] = dataStr[idx+10 : idx+end+1]
		}
	}

	// Check for embedded files
	if strings.Contains(dataStr, "/EmbeddedFile") {
		result.Warnings = append(result.Warnings, "PDF contains embedded files")
	}

	// Check for JavaScript
	if strings.Contains(dataStr, "/JavaScript") || strings.Contains(dataStr, "/JS ") {
		result.Warnings = append(result.Warnings, "PDF contains JavaScript")
	}

	// Check for forms
	if strings.Contains(dataStr, "/AcroForm") {
		result.Warnings = append(result.Warnings, "PDF contains interactive forms")
	}
}

func extractPNGMetadata(data []byte, result *DocResult) {
	if len(data) < 8 {
		return
	}

	// PNG header: 8 bytes signature, then chunks
	pos := 8
	for pos+8 < len(data) {
		chunkLen := int(binary.BigEndian.Uint32(data[pos:]))
		chunkType := string(data[pos+4 : pos+8])

		if chunkType == "tEXt" || chunkType == "iTXt" || chunkType == "zTXt" {
			// Extract text chunks
			end := pos + 8 + chunkLen
			if end > len(data) {
				break
			}
			chunkData := string(data[pos+8 : end])
			if idx := strings.Index(chunkData, "\x00"); idx > 0 {
				key := chunkData[:idx]
				val := chunkData[idx+1:]
				result.Metadata["png_"+key] = val
			}
		}

		pos += 12 + chunkLen // 4 len + 4 type + data + 4 crc
		if chunkLen == 0 {
			break
		}
	}
}

// --- PDF Metadata Scanner ---
type PDFMetadata struct{}

func (s *PDFMetadata) Name() string { return "PDFMetadata" }

func (s *PDFMetadata) Scan(ctx context.Context, url string) (*DocResult, error) {
	return &DocResult{Metadata: make(map[string]string)}, nil
}

// --- Image EXIF Scanner ---
type ImageExif struct{}

func (s *ImageExif) Name() string { return "ImageExif" }

func (s *ImageExif) Scan(ctx context.Context, url string) (*DocResult, error) {
	return &DocResult{ExifData: make(map[string]string)}, nil
}

// --- Office Metadata Scanner ---
type OfficeMetadata struct{}

func (s *OfficeMetadata) Name() string { return "OfficeMetadata" }

func (s *OfficeMetadata) Scan(ctx context.Context, url string) (*DocResult, error) {
	return &DocResult{Metadata: make(map[string]string)}, nil
}
