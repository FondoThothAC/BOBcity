import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { useStore } from '@/lib/store'

export function Settings() {
  const { connected } = useStore()
  const [engineStatus, setEngineStatus] = useState<any>(null)
  const [aiProvider, setAiProvider] = useState('ollama')

  useEffect(() => {
    api.healthCheck().then(setEngineStatus).catch(() => {})
  }, [])

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Configuración</h1>
        <p className="text-sm text-gray-500 mt-1">Estado del motor y preferencias</p>
      </div>

      {/* Engine Status */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <h2 className="text-sm font-semibold text-white mb-4">Estado del Motor Go</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-gray-500">Estado:</span>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className={`text-sm ${connected ? 'text-green-400' : 'text-red-400'}`}>
                {connected ? 'Conectado' : 'Desconectado'}
              </span>
            </div>
          </div>
          <div>
            <span className="text-xs text-gray-500">Versión:</span>
            <div className="text-sm text-white mt-1">{engineStatus?.version || '—'}</div>
          </div>
          <div>
            <span className="text-xs text-gray-500">Motores OSINT:</span>
            <div className="text-sm text-white mt-1">{engineStatus?.osint_engines || 7}</div>
          </div>
          <div>
            <span className="text-xs text-gray-500">Clientes WS:</span>
            <div className="text-sm text-white mt-1">{engineStatus?.ws_clients || 0}</div>
          </div>
        </div>
      </div>

      {/* AI Provider */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <h2 className="text-sm font-semibold text-white mb-4">Proveedor de IA</h2>
        <div className="space-y-2">
          {[
            { value: 'ollama', label: 'Ollama (Local, Gratis)', desc: 'Modelo local sin costo' },
            { value: 'gemini', label: 'Gemini Flash (Económico)', desc: 'API de Google, bajo costo' },
            { value: 'openrouter', label: 'OpenRouter (Premium)', desc: 'Claude Sonnet 5 vía OpenRouter' },
          ].map((opt) => (
            <label
              key={opt.value}
              className={`flex items-center gap-3 p-3 rounded border cursor-pointer transition-colors ${
                aiProvider === opt.value
                  ? 'border-cyan-500/50 bg-cyan-500/10'
                  : 'border-gray-700 bg-gray-800 hover:bg-gray-750'
              }`}
            >
              <input
                type="radio"
                name="ai_provider"
                value={opt.value}
                checked={aiProvider === opt.value}
                onChange={(e) => setAiProvider(e.target.value)}
                className="accent-cyan-500"
              />
              <div>
                <div className="text-sm text-white">{opt.label}</div>
                <div className="text-xs text-gray-500">{opt.desc}</div>
              </div>
            </label>
          ))}
        </div>
        <p className="text-[10px] text-gray-600 mt-3">
          La API key se configura en el archivo .env del servidor. Nunca se expone al frontend.
        </p>
      </div>

      {/* Circuit Breaker */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <h2 className="text-sm font-semibold text-white mb-4">Circuit Breaker</h2>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="text-xs text-gray-500 mb-1">Umbral de uso de tokens</div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div className="bg-cyan-500 h-2 rounded-full" style={{ width: '45%' }} />
            </div>
            <div className="flex justify-between text-[10px] text-gray-600 mt-1">
              <span>0%</span>
              <span className="text-amber-400">⚠ Alerta: 90%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Al alcanzar 90% de uso de tokens, el sistema alerta al usuario y cambia automáticamente a Ollama.
        </p>
      </div>
    </div>
  )
}
