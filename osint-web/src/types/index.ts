export interface OSTool {
  id: string
  name: string
  category: 'username' | 'email' | 'domain' | 'ip' | 'phone' | 'multi'
  description: string
  engine: 'go_native' | 'python' | 'hybrid'
  status: 'active' | 'inactive' | 'error'
  icon?: string
  package?: string
}

export interface OSINTMatch {
  category: string
  source: string
  url?: string
  confidence: number
  metadata?: Record<string, string>
}

export interface ScanReport {
  target: string
  target_type: string
  execution_time_ms: number
  matches_count: number
  matches: OSINTMatch[]
}

export interface WSLogMessage {
  type: 'log' | 'scan_complete' | 'error'
  tool: string
  level: 'info' | 'warn' | 'error' | 'success'
  message: string
  timestamp: string
}

export interface InvestigationRequest {
  prompt: string
  tier: 1 | 2 | 3
  target_type?: string
}

export interface InvestigationResponse {
  status: string
  tier: number
  target: string
  message: string
  ws_endpoint: string
  estimated_time_seconds: number
  engines_active: string[]
}

export type TargetType = 'username' | 'email' | 'domain' | 'ip' | 'phone'
