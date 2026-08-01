import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { ToolsExplorer } from './pages/ToolsExplorer'
import { Investigation } from './pages/Investigation'
import { LiveLogs } from './pages/LiveLogs'
import { Settings } from './pages/Settings'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tools" element={<ToolsExplorer />} />
        <Route path="/investigate" element={<Investigation />} />
        <Route path="/logs" element={<LiveLogs />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  )
}
