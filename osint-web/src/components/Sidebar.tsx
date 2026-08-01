import { Link, useLocation } from 'react-router-dom'
import { useStore } from '@/lib/store'

const navItems = [
  { path: '/', label: 'Dashboard', icon: '◈' },
  { path: '/tools', label: 'Herramientas', icon: '⚙' },
  { path: '/investigate', label: 'Investigar', icon: '◎' },
  { path: '/logs', label: 'Logs Vivo', icon: '▤' },
  { path: '/settings', label: 'Config', icon: '⬡' },
]

export function Sidebar() {
  const location = useLocation()
  const { connected, sidebarOpen } = useStore()

  if (!sidebarOpen) return null

  return (
    <aside className="w-56 bg-gray-900 border-r border-gray-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-sm">
            OS
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">OSINT Command</h1>
            <p className="text-[10px] text-gray-500">CívicaOS v2.0</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => {
          const active = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
                active
                  ? 'bg-cyan-500/10 text-cyan-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Status Footer */}
      <div className="p-3 border-t border-gray-800">
        <div className="flex items-center gap-2 text-xs">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
          <span className="text-gray-500">
            {connected ? 'Motor Go conectado' : 'Desconectado'}
          </span>
        </div>
        <div className="mt-2 text-[10px] text-gray-600">
          7 motores nativos · 300+ sitios
        </div>
      </div>
    </aside>
  )
}
