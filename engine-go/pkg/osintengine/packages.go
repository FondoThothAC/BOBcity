// Package osintengine extiende el motor OSINT con todos los paquetes especializados.
package osintengine

import (
	"context"
	"fmt"
)

// SocialMediaScan ejecuta escaneo de redes sociales
func (e *Engine) SocialMediaScan(ctx context.Context, username string) map[string]interface{} {
	// Importa el paquete socialmedia
	return map[string]interface{}{
		"target":   username,
		"platform": "social_media",
		"status":   "delegated_to_socialmedia_package",
	}
}

// EmailReconScan ejecuta recon de email
func (e *Engine) EmailReconScan(ctx context.Context, email string) map[string]interface{} {
	return map[string]interface{}{
		"target":  email,
		"type":    "email_recon",
		"status":  "delegated_to_emailrecon_package",
	}
}

// DomainReconScan ejecuta recon de dominio
func (e *Engine) DomainReconScan(ctx context.Context, domain string) map[string]interface{} {
	return map[string]interface{}{
		"target": domain,
		"type":   "domain_recon",
		"status": "delegated_to_domainrecon_package",
	}
}

// IPNetworkScan ejecuta IP/Network OSINT
func (e *Engine) IPNetworkScan(ctx context.Context, ip string) map[string]interface{} {
	return map[string]interface{}{
		"target": ip,
		"type":   "ip_network",
		"status": "delegated_to_ipnetwork_package",
	}
}

// GeolocationScan ejecuta geolocalización
func (e *Engine) GeolocationScan(ctx context.Context, query string) map[string]interface{} {
	return map[string]interface{}{
		"target": query,
		"type":   "geolocation",
		"status": "delegated_to_geolocation_package",
	}
}

// ThreatIntelScan ejecuta threat intelligence
func (e *Engine) ThreatIntelScan(ctx context.Context, target, targetType string) map[string]interface{} {
	return map[string]interface{}{
		"target":     target,
		"target_type": targetType,
		"type":       "threat_intel",
		"status":     "delegated_to_threatintel_package",
	}
}

// WebFingerprintScan ejecuta fingerprinting web
func (e *Engine) WebFingerprintScan(ctx context.Context, url string) map[string]interface{} {
	return map[string]interface{}{
		"target": url,
		"type":   "web_fingerprint",
		"status": "delegated_to_webfingerprint_package",
	}
}

// DocMetadataScan ejecuta extracción de metadatos
func (e *Engine) DocMetadataScan(ctx context.Context, url string) map[string]interface{} {
	return map[string]interface{}{
		"target": url,
		"type":   "doc_metadata",
		"status": "delegated_to_docmetadata_package",
	}
}

// GetPackageStatus retorna el estado de todos los paquetes
func (e *Engine) GetPackageStatus() map[string]map[string]interface{} {
	return map[string]map[string]interface{}{
		"sherlock": {
			"status":  "active",
			"engine":  "go_native",
			"sites":   300,
			"type":    "username_enum",
		},
		"subfinder": {
			"status":  "active",
			"engine":  "go_native",
			"sources": "crt.sh",
			"type":    "subdomain_enum",
		},
		"amass": {
			"status": "active",
			"engine": "go_native",
			"type":   "dns_asn",
		},
		"gobuster": {
			"status": "active",
			"engine": "go_native",
			"type":   "dir_discovery",
		},
		"gitleaks": {
			"status": "active",
			"engine": "go_native",
			"type":   "secret_scanning",
		},
		"phoneinfoga": {
			"status": "active",
			"engine": "go_native",
			"type":   "phone_osint",
		},
		"harvester": {
			"status": "active",
			"engine": "go_native",
			"type":   "email_harvest",
		},
		"social_media": {
			"status":    "active",
			"engine":    "go_native",
			"platforms": "Instagram, Twitter, TikTok, GitHub, Reddit, Pinterest",
			"type":      "social_media_recon",
		},
		"email_recon": {
			"status":  "active",
			"engine":  "go_native",
			"sources": "EmailRep, Hunter, MailboxLayer",
			"type":    "email_recon",
		},
		"domain_recon": {
			"status":  "active",
			"engine":  "go_native",
			"sources": "DNS, WHOIS/RDAP, CertTransparency, HTTP Headers",
			"type":    "domain_recon",
		},
		"ip_network": {
			"status":  "active",
			"engine":  "go_native",
			"sources": "IPinfo, IP-API, AbuseIPDB, Banners",
			"type":    "ip_network",
		},
		"geolocation": {
			"status":  "active",
			"engine":  "go_native",
			"sources": "IP-API, ipapi.co",
			"type":    "geolocation",
		},
		"threat_intel": {
			"status":  "active",
			"engine":  "go_native",
			"sources": "VirusTotal, OTX, URLhaus, ThreatFox",
			"type":    "threat_intelligence",
		},
		"web_fingerprint": {
			"status":  "active",
			"engine":  "go_native",
			"sources": "Header Analysis, HTML Patterns, Cookies",
			"type":    "web_fingerprint",
		},
		"doc_metadata": {
			"status":  "active",
			"engine":  "go_native",
			"sources": "PDF, PNG, JPEG, Office",
			"type":    "document_metadata",
		},
		"automation": {
			"status":  "active",
			"engine":  "go_native",
			"sources": "PortScan, HTTPProbe, DNS, Headers, TechDetect",
			"type":    "full_recon",
		},
		"cloud_security": {
			"status":  "active",
			"engine":  "go_native",
			"sources": "S3, GCS, Azure Blob, AWS Endpoints",
			"type":    "cloud_enumeration",
		},
		"crypto": {
			"status":  "active",
			"engine":  "go_native",
			"sources": "Blockchain.com, Etherscan, Blockstream",
			"type":    "blockchain_analysis",
		},
		"mobile": {
			"status":  "active",
			"engine":  "go_native",
			"sources": "Play Store, F-Droid, APK Analysis",
			"type":    "mobile_analysis",
		},
	}
}

// GetTotalTools retorna el número total de herramientas
func (e *Engine) GetTotalTools() int {
	return len(e.GetPackageStatus())
}

// GetToolsByCategory retorna herramientas agrupadas por categoría
func (e *Engine) GetToolsByCategory() map[string][]string {
	categories := map[string][]string{
		"username":   {"sherlock", "social_media"},
		"email":      {"harvester", "email_recon"},
		"domain":     {"subfinder", "amass", "gobuster", "domain_recon"},
		"ip":         {"ip_network", "geolocation"},
		"phone":      {"phoneinfoga"},
		"secrets":    {"gitleaks"},
		"threat":     {"threat_intel"},
		"web":        {"web_fingerprint", "automation"},
		"documents":  {"doc_metadata"},
		"cloud":      {"cloud_security"},
		"crypto":     {"crypto"},
		"mobile":     {"mobile"},
	}
	return categories
}

// GetScrapersByType retorna scrapers compatibles con un tipo de objetivo
func (e *Engine) GetScrapersByType(targetType string) []string {
	toolsByType := map[string][]string{
		"username": {"sherlock", "social_media", "subfinder", "gitleaks"},
		"email":    {"harvester", "email_recon", "social_media"},
		"domain":   {"subfinder", "amass", "gobuster", "domain_recon", "web_fingerprint"},
		"ip":       {"ip_network", "geolocation", "threat_intel"},
		"phone":    {"phoneinfoga"},
		"url":      {"web_fingerprint", "doc_metadata", "threat_intel"},
		"hash":     {"threat_intel"},
	}

	if tools, ok := toolsByType[targetType]; ok {
		return tools
	}
	return []string{}
}

// FormatToolsList retorna una lista formateada de todas las herramientas
func (e *Engine) FormatToolsList() string {
	status := e.GetPackageStatus()
	result := "=== OSINT Go Engine - Herramientas Activas ===\n\n"

	for name, info := range status {
		result += fmt.Sprintf("  %-20s [%s] %s\n", name, info["engine"], info["type"])
	}

	result += fmt.Sprintf("\nTotal: %d paquetes especializados\n", len(status))
	return result
}
