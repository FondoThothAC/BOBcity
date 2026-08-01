import type { OSTool, ScanReport, InvestigationRequest, InvestigationResponse } from '@/types'

const API_BASE = '/osint/api'

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl
  }

  private async fetch<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Error desconocido' }))
      throw new Error(error.error || `HTTP ${res.status}`)
    }
    return res.json()
  }

  async getTools(): Promise<{ tools: OSTool[]; total: number }> {
    return this.fetch('/osint/tools')
  }

  async investigate(req: InvestigationRequest): Promise<InvestigationResponse> {
    return this.fetch('/v1/agent/investigate', {
      method: 'POST',
      body: JSON.stringify(req),
    })
  }

  async runTool(target: string, tool: string): Promise<ScanReport> {
    return this.fetch('/osint/run', {
      method: 'POST',
      body: JSON.stringify({ target, tool }),
    })
  }

  async healthCheck(): Promise<{ status: string; engine: string; version: string; ws_clients: number; osint_engines: number }> {
    return this.fetch('/health')
  }
}

export const api = new ApiClient()
