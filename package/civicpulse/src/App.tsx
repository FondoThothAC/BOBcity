import { useState } from 'react';
import {
  LayoutDashboard,
  MapPin,
  FlaskConical,
  BrainCircuit,
  BarChart3,
  Database,
  Menu,
  X,
  ChevronRight,
  Activity,
  TrendingUp,
  Users,
  Shield
} from 'lucide-react';
import './index.css';

// Components
import { PainPointsMap } from './components/PainPointsMap';
import { ABMSimulator } from './components/ABMSimulator';
import { PredictorEngine } from './components/PredictorEngine';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { DataHub } from './components/DataHub';

// ============================================================
// Navigation Items
// ============================================================

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard size={20} />,
    component: <AnalyticsDashboard />
  },
  {
    id: 'map',
    label: 'Mapa de Dolor',
    icon: <MapPin size={20} />,
    component: <PainPointsMap />
  },
  {
    id: 'simulation',
    label: 'Simulación ABM',
    icon: <FlaskConical size={20} />,
    component: <ABMSimulator />
  },
  {
    id: 'predictor',
    label: 'Predictor Electoral',
    icon: <BrainCircuit size={20} />,
    component: <PredictorEngine />
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: <BarChart3 size={20} />,
    component: <AnalyticsDashboard />
  },
  {
    id: 'data',
    label: 'Centro de Datos',
    icon: <Database size={20} />,
    component: <DataHub />
  }
];

// ============================================================
// Header Component
// ============================================================

function Header({
  activeView,
  onViewChange
}: {
  activeView: string;
  onViewChange: (id: string) => void;
}) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
            <Activity className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">CivicPulse</h1>
            <p className="text-xs text-gray-500">Inteligencia Cívica</p>
          </div>
        </div>

        {/* Nav Tabs */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeView === item.id
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.icon}
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Status Indicators */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-gray-400">Live</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2 text-gray-400">
              <Users size={16} />
              <span>2,834</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

// ============================================================
// Sidebar Component
// ============================================================

function Sidebar({
  isOpen,
  onClose,
  activeView,
  onViewChange
}: {
  isOpen: boolean;
  onClose: () => void;
  activeView: string;
  onViewChange: (id: string) => void;
}) {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-black/90 backdrop-blur-xl border-r border-white/10 z-50 transform transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:static lg:block`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <Activity className="text-white" size={18} />
              </div>
              <span className="font-bold text-white">CivicPulse</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white lg:hidden"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  onViewChange(item.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeView === item.id
                    ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-l-2 border-emerald-500 text-emerald-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
                {activeView === item.id && (
                  <ChevronRight size={16} className="ml-auto" />
                )}
              </button>
            ))}
          </nav>

          {/* Quick Stats */}
          <div className="p-4 border-t border-white/10">
            <p className="text-xs text-gray-500 uppercase mb-3">Resumen Rápido</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className="text-emerald-400" />
                  <span className="text-sm text-gray-400">Engagement</span>
                </div>
                <span className="text-sm text-white font-medium">+15.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield size={14} className="text-red-400" />
                  <span className="text-sm text-gray-400">Dolores</span>
                </div>
                <span className="text-sm text-white font-medium">18</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-blue-400" />
                  <span className="text-sm text-gray-400">Usuarios</span>
                </div>
                <span className="text-sm text-white font-medium">2,834</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10">
            <p className="text-xs text-gray-600 text-center">
              Powered by CívicaOS · v1.0
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

// ============================================================
// Main Content Area
// ============================================================

function MainContent({
  activeView
}: {
  activeView: string;
}) {
  const activeComponent = NAV_ITEMS.find(item => item.id === activeView)?.component;

  return (
    <main className="flex-1 overflow-auto p-6 lg:p-8">
      <div className="max-w-[1800px] mx-auto">
        {activeComponent}
      </div>
    </main>
  );
}

// ============================================================
// Main App Component
// ============================================================

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Header activeView={activeView} onViewChange={setActiveView} />

      <div className="flex">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeView={activeView}
          onViewChange={setActiveView}
        />

        <div className="flex-1 lg:ml-72">
          <div className="pt-16">
            <MainContent activeView={activeView} />
          </div>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 flex items-center justify-center lg:hidden z-30"
      >
        <Menu size={24} />
      </button>
    </div>
  );
}

export default App;