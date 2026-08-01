import { create } from 'zustand'
import type { OSTool, WSLogMessage } from '@/types'

interface AppState {
  tools: OSTool[]
  setTools: (tools: OSTool[]) => void
  logs: WSLogMessage[]
  addLog: (log: WSLogMessage) => void
  clearLogs: () => void
  connected: boolean
  setConnected: (connected: boolean) => void
  selectedTarget: string
  setSelectedTarget: (target: string) => void
  sidebarOpen: boolean
  toggleSidebar: () => void
}

export const useStore = create<AppState>((set) => ({
  tools: [],
  setTools: (tools) => set({ tools }),
  logs: [],
  addLog: (log) => set((state) => ({
    logs: [...state.logs.slice(-500), log],
  })),
  clearLogs: () => set({ logs: [] }),
  connected: false,
  setConnected: (connected) => set({ connected }),
  selectedTarget: '',
  setSelectedTarget: (selectedTarget) => set({ selectedTarget }),
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}))
