import { useEffect, useState } from 'react'
import { useStore } from '@/lib/store'
import { api } from '@/lib/api'
import type { OSTool } from '@/types'

const categoryColors: Record<string, string> = {
  username: 'cyan',
  email: 'green',
  domain: 'purple',
  ip: 'amber',
  phone: 'pink',
  multi: 'gray',
}

const categoryLabels: Record<string, string> = {
  username: 'Usuarios',
  email: 'Emails',
  domain: 'Dominios',
  ip: 'IPs/Red',
  phone: 'Teléfonos',
  multi: 'Multi-objeto',
}

const toolIcons: Record<string, string> = {
  sherlock: '🔍',
  subfinder: '🌐',
  amass: '📡',
  gobuster: '📁',
  gitleaks: '🔐',
  phoneinfoga: '📱',
  harvester: '✉',
  social_media: '💬',
  email_recon: '📧',
  domain_recon: '🌍',
  ip_network: '🖥',
  geolocation: '📍',
  threat_intel: '🛡',
  web_fingerprint: '🕸',
  doc_metadata: '📄',
  automation: '⚡',
  cloud_security: '☁',
  crypto: '₿',
  mobile: '📲',
  ghunt: '🔍',
  spiderfoot: '🕷',
}

export function ToolsExplorer() {
  const { tools, setTools } = useStore()
  const [filter, setFilter] = useState<string>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (tools.length === 0) {
      api.getTools().then(({ tools: t }) => setTools(t)).catch(() => {})
    }
  }, [tools.length, setTools])

  const filtered = tools.filter(t => {
    if (filter !== 'all' && t.category !== filter) return false
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const categories = ['all', ...new Set(tools.map(t => t.category))]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Catálogo de Herramientas</h1>
        <p className="text-sm text-gray-500 mt-1">{tools.length} herramientas OSINT disponibles</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Buscar herramienta..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 w-64"
        />
        <div className="flex gap-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                filter === cat
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700'
              }`}
            >
              {cat === 'all' ? 'Todos' : categoryLabels[cat] || cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((tool) => {
          const color = categoryColors[tool.category] || 'gray'
          return (
            <div
              key={tool.id}
              className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2">
                  <span className="text-xl">{toolIcons[tool.id] || '⚙'}</span>
                  <div>
                    <h3 className="font-semibold text-white">{tool.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{tool.description}</p>
                  </div>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded bg-${color}-500/10 text-${color}-400`}>
                  {tool.engine === 'go_native' ? 'Go' : 'Py'}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full border border-${color}-500/20 text-${color}-400`}>
                  {categoryLabels[tool.category] || tool.category}
                </span>
                <span className={`text-[10px] ${tool.status === 'active' ? 'text-green-400' : 'text-gray-500'}`}>
                  ● {tool.status === 'active' ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center text-gray-600 py-12">
          No se encontraron herramientas con los filtros seleccionados
        </div>
      )}
    </div>
  )
}
