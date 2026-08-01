import { useEffect, useRef, useCallback, useState } from 'react'
import type { WSLogMessage } from '@/types'

interface UseWebSocketOptions {
  url?: string
  onMessage?: (msg: WSLogMessage) => void
  onConnect?: () => void
  onDisconnect?: () => void
  autoConnect?: boolean
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    url = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/logs`,
    onMessage,
    onConnect,
    onDisconnect,
    autoConnect = true,
  } = options

  const wsRef = useRef<WebSocket | null>(null)
  const [connected, setConnected] = useState(false)
  const [logs, setLogs] = useState<WSLogMessage[]>([])

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      setConnected(true)
      onConnect?.()
    }

    ws.onmessage = (event) => {
      try {
        const msg: WSLogMessage = JSON.parse(event.data)
        setLogs(prev => [...prev.slice(-500), msg]) // Keep last 500 logs
        onMessage?.(msg)
      } catch {}
    }

    ws.onclose = () => {
      setConnected(false)
      onDisconnect?.()
      // Auto-reconnect after 3s
      setTimeout(connect, 3000)
    }

    ws.onerror = () => {
      ws.close()
    }
  }, [url, onMessage, onConnect, onDisconnect])

  const disconnect = useCallback(() => {
    wsRef.current?.close()
    wsRef.current = null
  }, [])

  const clearLogs = useCallback(() => {
    setLogs([])
  }, [])

  useEffect(() => {
    if (autoConnect) connect()
    return disconnect
  }, [autoConnect, connect, disconnect])

  return { connected, logs, connect, disconnect, clearLogs }
}
