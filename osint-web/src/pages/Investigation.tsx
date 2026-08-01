import { useState } from 'react'
import { useStore } from '@/lib/store'
import { api } from '@/lib/api'
import type { InvestigationResponse } from '@/types'

const tiers = [
  { value: 1, label: 'Tier 1 - Scout', desc: 'Resultado instantáneo (5s)', icon: '⚡' },
  { value: 2, label: 'Tier 2 - Interactive', desc: 'Investigación intermedia (2min)', icon: '🔍' },
  { value: 3, label: 'Tier 3 - Deep', desc: 'Investigación profunda (1h)', icon: '🧠' },
]

const targetTypeOptions = [
  { value: '', label: 'Auto-detectar' },
  { value: 'username', label: 'Usuario' },
  { value: 'email', label: 'Email' },
  { value: 'domain', label: 'Dominio' },
  { value: 'ip', label: 'IP' },
  { value: 'phone', label: 'Teléfono' },
]

export function Investigation() {
  const { logs } = useStore()
  const [target, setTarget] = useState('')
  const [tier, setTier] = useState<1 | 2 | 3>(1)
  const [targetType, setTargetType] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<InvestigationResponse | null>(null)

  const handleInvestigate = async () => {
    if (!target.trim()) return
    setLoading(true)
    try {
      const res = await api.investigate({
        prompt: target.trim(),
        tier,
        target_type: targetType || undefined,
      })
      setResult(res)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const recentLogs = logs.slice(-20)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Agente de Investigación</h1>
        <p className="text-sm text-gray-500 mt-1">Motor multi-nativo Go con 7 motores de escaneo</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <div className="lg:col-span-1 space-y-4">
          {/* Target Input */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
            <label className="text-sm font-medium text-gray-300 block mb-2">Objetivo</label>
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="usuario, email, dominio, IP..."
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 text-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleInvestigate()}
            />
          </div>

          {/* Target Type */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
            <label className="text-sm font-medium text-gray-300 block mb-2">Tipo de Objetivo</label>
            <select
              value={targetType}
              onChange={(e) => setTargetType(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
            >
              {targetTypeOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Tier Selection */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
            <label className="text-sm font-medium text-gray-300 block mb-3">Nivel de Investigación</label>
            <div className="space-y-2">
              {tiers.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTier(t.value as 1 | 2 | 3)}
                  className={`w-full text-left p-3 rounded border transition-colors ${
                    tier === t.value
                      ? 'border-cyan-500/50 bg-cyan-500/10'
                      : 'border-gray-700 bg-gray-800 hover:bg-gray-750'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{t.icon}</span>
                    <span className="text-sm font-medium text-white">{t.label}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Launch Button */}
          <button
            onClick={handleInvestigate}
            disabled={loading || !target.trim()}
            className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded font-medium transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⟳</span> Investigando...
              </span>
            ) : (
              '▶ Iniciar Investigación'
            )}
          </button>
        </div>

        {/* Results / Logs Panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Response */}
          {result && (
            <div className="bg-gray-900 border border-cyan-500/30 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-green-400">✓</span>
                <span className="text-sm font-semibold text-white">Investigación Iniciada</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-500">Objetivo:</span>
                  <span className="ml-2 text-white">{result.target}</span>
                </div>
                <div>
                  <span className="text-gray-500">Tier:</span>
                  <span className="ml-2 text-white">{result.tier}</span>
                </div>
                <div>
                  <span className="text-gray-500">Estimado:</span>
                  <span className="ml-2 text-white">{result.estimated_time_seconds}s</span>
                </div>
                <div>
                  <span className="text-gray-500">WebSocket:</span>
                  <span className="ml-2 text-cyan-400">{result.ws_endpoint}</span>
                </div>
              </div>
              <div className="mt-3">
                <span className="text-xs text-gray-500">Motores activos:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {result.engines_active.map((e, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-700">
                      {e}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Live Logs */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-white mb-3">📡 Logs en Vivo</h2>
            <div className="font-mono text-xs space-y-1 max-h-96 overflow-y-auto">
              {recentLogs.length === 0 ? (
                <div className="text-gray-600 text-center py-8">
                  Los logs del motor Go aparecerán aquí cuando inicies una investigación
                </div>
              ) : (
                recentLogs.map((log, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-gray-600 shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className={`shrink-0 ${
                      log.level === 'error' ? 'text-red-400' :
                      log.level === 'warn' ? 'text-amber-400' :
                      log.level === 'success' ? 'text-green-400' :
                      'text-cyan-400'
                    }`}>
                      [{log.tool}]
                    </span>
                    <span className="text-gray-300">{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
