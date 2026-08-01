import React from 'react';
import { Music, Users, FolderOpen, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppStore } from '../../store';
import { translations } from '../../locales';

export const Sidebar: React.FC = () => {
  const { viewMode, setViewMode, sidebarCollapsed, setSidebarCollapsed, language } = useAppStore();
  const t = translations[language];

  const navItems = [
    { id: 'editor', icon: Music, label: t.editor },
    { id: 'community', icon: Users, label: t.community },
    { id: 'library', icon: FolderOpen, label: t.library },
  ] as const;

  return (
    <aside 
      className={`h-screen bg-[#0F111A]/90 border-r border-white/10 flex flex-col justify-between text-white/70 transition-all duration-300 relative shrink-0 z-30 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div>
        {/* Header / Logo */}
        <div className="p-4 flex items-center justify-between border-b border-white/5 mb-4">
          <div className="flex items-center gap-3 text-white overflow-hidden">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
              <span className="font-black text-white text-[9px] tracking-tighter">TNS</span>
            </div>
            {!sidebarCollapsed && (
              <span className="font-bold text-sm tracking-tight truncate text-white">ThothNeuralScore</span>
            )}
          </div>

          {/* Toggle Expand / Collapse Button */}
          <button
            onClick={() => setSidebarCollapsed(prev => !prev)}
            className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition-colors border border-white/5"
            title={sidebarCollapsed ? 'Expandir barra lateral' : 'Contraer barra lateral'}
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
        
        {/* Navigation Items */}
        <nav className="space-y-1 px-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setViewMode(item.id as any)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                viewMode === item.id 
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.15)] font-bold' 
                  : 'hover:bg-white/5 hover:text-white'
              }`}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium text-sm truncate">{item.label}</span>}
            </button>
          ))}
        </nav>
      </div>

      {/* Footer / Settings */}
      <div className="p-2 border-t border-white/5 space-y-1">
        <button
          onClick={() => setViewMode('settings')}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
            viewMode === 'settings' 
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold' 
              : 'hover:bg-white/5 hover:text-white'
          }`}
          title={sidebarCollapsed ? t.settings : undefined}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!sidebarCollapsed && <span className="font-medium text-sm truncate">{t.settings}</span>}
        </button>

        {/* Quick Collapse Button at Bottom next to Settings */}
        {!sidebarCollapsed && (
          <div className="pt-2 px-1 text-center">
            <button 
              onClick={() => setSidebarCollapsed(true)}
              className="text-[10px] text-white/30 hover:text-cyan-400 font-bold tracking-wider uppercase transition-colors"
            >
              ◀ Contraer Menú
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
