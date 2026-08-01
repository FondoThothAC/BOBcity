import { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { useStore } from '@/lib/store'
import { useWebSocket } from '@/hooks/useWebSocket'

export function Layout({ children }: { children: ReactNode }) {
  const { addLog, setConnected } = useStore()

  useWebSocket({
    onMessage: (msg) => addLog(msg),
    onConnect: () => setConnected(true),
    onDisconnect: () => setConnected(false),
  })

  return (
    <div className="flex h-screen bg-gray-950">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
