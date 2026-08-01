import { useRef, useEffect } from 'react'
import { useStore } from '@/lib/store'

export function LiveLogs() {
  const { logs, clearLogs, connected } = useStore()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Logs en Tiempo Real</h1>
          <p className="text-sm text-gray-500 mt-1">
            Stream del motor Go vía WebSocket · {logs.length} entradas
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            <span className={connected ? 'text-green-400' : 'text-red-400'}>
              {connected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
          <button
            onClick={clearLogs}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs border border-gray-700"
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Terminal */}
      <div className="bg-gray-950 border border-gray-800 rounded-lg overflow-hidden">
        {/* Terminal Header */}
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 border-b border-gray-800">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="text-xs text-gray-500 font-mono ml-2">
            osint-engine@go ~ /ws/logs
          </span>
        </div>

        {/* Log Content */}
        <div className="p-4 h-[calc(100vh-280px)] overflow-y-auto font-mono text-xs">
          {logs.length === 0 ? (
            <div className="text-gray-600 space-y-2">
              <div>$ osint-engine --start</div>
              <div className="text-cyan-400">Motor Go v2.0 iniciado</div>
              <div className="text-cyan-400">7 motores nativos registrados</div>
              <div className="text-cyan-400">WebSocket hub activo en /ws/logs</div>
              <div className="text-gray-500 mt-4">Esparando conexiones...</div>
              <div className="text-gray-500">Los logs aparecerán aquí cuando se ejecute una investigación.</div>
              <div className="text-gray-500 mt-2">Motores disponibles:</div>
              <div className="text-gray-400 ml-2">• Sherlock Go (300+ sitios)</div>
              <div className="text-gray-400 ml-2">• Subfinder Go (crt.sh)</div>
              <div className="text-gray-400 ml-2">• Amass Go (DNS/ASN)</div>
              <div className="text-gray-400 ml-2">• Gobuster Go (Directorios)</div>
              <div className="text-gray-400 ml-2">• Gitleaks Go (Secrets)</div>
              <div className="text-gray-400 ml-2">• PhoneInfoga Go (Teléfonos)</div>
              <div className="text-gray-400 ml-2">• Harvester Go (Emails)</div>
              <div className="text-cyan-400 mt-4 animate-pulse">▋</div>
            </div>
          ) : (
            <div className="space-y-0.5">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-2 hover:bg-gray-900/50 px-1">
                  <span className="text-gray-600 shrink-0 w-20">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span className={`shrink-0 w-12 ${
                    log.level === 'error' ? 'text-red-400' :
                    log.level === 'warn' ? 'text-amber-400' :
                    log.level === 'success' ? 'text-green-400' :
                    'text-cyan-400'
                  }`}>
                    {log.level.toUpperCase()}
                  </span>
                  <span className="text-gray-500 shrink-0 w-28 truncate">
                    [{log.tool}]
                  </span>
                  <span className="text-gray-300">{log.message}</span>
                </div>
              ))}
              <div className="text-cyan-400 animate-pulse mt-1">▋</div>
              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
