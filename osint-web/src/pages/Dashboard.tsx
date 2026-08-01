import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '@/lib/store'
import { api } from '@/lib/api'
import type { OSTool } from '@/types'

const statCards = [
  { label: 'Herramientas Activas', key: 'tools', icon: '⚙', color: 'cyan' },
  { label: 'Motores Go Nativos', key: 'engines', icon: '◈', color: 'green' },
  { label: 'Sitios en Base de Datos', key: 'sites', icon: '◎', color: 'purple' },
  { label: 'Clientes WebSocket', key: 'clients', icon: '▤', color: 'amber' },
]

const engineIcons: Record<string, string> = {
  'Sherlock_Go (300+ sitios)': '🔍',
  'Subfinder_Go (crt.sh)': '🌐',
  'Amass_Go (DNS/ASN)': '📡',
  'Gobuster_Go (Directorios)': '📁',
  'Gitleaks_Go (Secrets)': '🔐',
  'PhoneInfoga_Go (Teléfonos)': '📱',
  'Harvester_Go (Emails)': '✉',
}

export function Dashboard() {
  const { tools, setTools, logs } = useStore()
  const [stats, setStats] = useState({ tools: 0, engines: 7, sites: 300, clients: 0 })

  useEffect(() => {
    api.getTools().then(({ tools: t }) => {
      setTools(t)
      setStats(s => ({ ...s, tools: t.length }))
    }).catch(() => {})
    api.healthCheck().then(h => {
      setStats(s => ({ ...s, clients: h.ws_clients }))
    }).catch(() => {})
  }, [setTools])

  const recentLogs = logs.slice(-5)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Centro de comando OSINT en tiempo real</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.key} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl">{card.icon}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full bg-${card.color}-500/10 text-${card.color}-400`}>
                ACTIVO
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-white">{stats[card.key as keyof typeof stats]}</div>
              <div className="text-xs text-gray-500 mt-1">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Investigación Rápida */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
          <h2 className="text-sm font-semibold text-white mb-3">⚡ Investigación Rápida</h2>
          <Link
            to="/investigate"
            className="block w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-500 text-white text-center rounded font-medium transition-colors"
          >
            Abrir Agente de Investigación
          </Link>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Tier 1: 5s · Tier 2: 2min · Tier 3: 1h
          </p>
        </div>

        {/* Motores Activos */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
          <h2 className="text-sm font-semibold text-white mb-3">🔧 Motores Go Nativos</h2>
          <div className="space-y-2">
            {Object.entries(engineIcons).map(([name, icon]) => (
              <div key={name} className="flex items-center gap-2 text-xs">
                <span>{icon}</span>
                <span className="text-gray-300">{name}</span>
                <span className="ml-auto text-green-400 text-[10px]">✓</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Logs */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white">📡 Logs en Tiempo Real</h2>
          <Link to="/logs" className="text-xs text-cyan-400 hover:text-cyan-300">Ver todos →</Link>
        </div>
        <div className="space-y-1 font-mono text-xs">
          {recentLogs.length === 0 ? (
            <div className="text-gray-600 text-center py-4">Esperando logs del motor Go...</div>
          ) : (
            recentLogs.map((log, i) => (
              <div key={i} className="flex gap-2 text-gray-400">
                <span className="text-gray-600">{new Date(log.timestamp).toLocaleTimeString()}</span>
                <span className={`text-${log.level === 'error' ? 'red' : log.level === 'warn' ? 'amber' : log.level === 'success' ? 'green' : 'cyan'}-400`}>
                  [{log.tool}]
                </span>
                <span>{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
