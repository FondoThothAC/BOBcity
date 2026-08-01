import React, { useState } from 'react';
import { TrackList } from './TrackList';
import { NotationView } from './NotationView';
import { PianoRoll } from './PianoRoll';
import { PianoRollEditor } from './PianoRollEditor';
import { Fretboard } from './Fretboard';
import { useAppStore } from '../../store';
import { Music, Grid, Eye, Maximize2, Minimize2 } from 'lucide-react';

export const Editor: React.FC = () => {
  const { score, activeTrackId } = useAppStore();
  const activeTrack = score.tracks.find(t => t.id === activeTrackId);
  const [topView, setTopView] = useState<'grid' | 'notation'>('grid');
  const [showBottomPanel, setShowBottomPanel] = useState<boolean>(true);
  const [panelExpanded, setPanelExpanded] = useState<boolean>(false);

  return (
    <div className="flex-1 flex overflow-hidden bg-[#05060A]">
      {/* Mezclador de Pistas */}
      <TrackList />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0A0B10]">
        {/* Main Editor Header Bar */}
        <div className="flex items-center justify-between px-6 pt-3 pb-2 shrink-0 border-b border-white/5 bg-[#0F111A]">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setTopView('grid')}
              className={`px-4 py-1.5 rounded-md text-[11px] font-bold tracking-wider transition-colors border flex items-center gap-1.5 ${topView === 'grid' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' : 'bg-white/5 text-white/40 border-white/10 hover:text-white/80'}`}
            >
              <Grid className="w-3.5 h-3.5" />
              GRID EDITOR
            </button>
            <button 
              onClick={() => setTopView('notation')}
              className={`px-4 py-1.5 rounded-md text-[11px] font-bold tracking-wider transition-colors border flex items-center gap-1.5 ${topView === 'notation' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-white/5 text-white/40 border-white/10 hover:text-white/80'}`}
            >
              <Music className="w-3.5 h-3.5" />
              PARTITURA & TAB
            </button>
          </div>

          <div className="flex items-center gap-2">
            {showBottomPanel && (
              <button
                onClick={() => setPanelExpanded(!panelExpanded)}
                className="px-2.5 py-1.5 rounded text-[11px] font-bold tracking-wider border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors flex items-center gap-1.5"
                title={panelExpanded ? 'Reducir tamaño del visualizador' : 'Ampliar tamaño del visualizador'}
              >
                {panelExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                <span>{panelExpanded ? 'REDUCIR' : 'AMPLIAR'}</span>
              </button>
            )}

            <button
              onClick={() => setShowBottomPanel(!showBottomPanel)}
              className={`px-3 py-1.5 rounded text-[11px] font-bold tracking-wider border transition-colors flex items-center gap-1.5 ${showBottomPanel ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-white/5 text-white/40 border-white/10 hover:text-white'}`}
            >
              <Eye className="w-3.5 h-3.5" />
              {showBottomPanel ? 'Ocultar Visualizador Synthesia' : 'Mostrar Visualizador Synthesia'}
            </button>
          </div>
        </div>

        {/* Main Workspace Area */}
        <div className="flex-1 overflow-hidden flex flex-col p-3">
          <div className="flex-1 bg-[#05060A] rounded-xl border border-white/5 relative overflow-hidden flex shadow-2xl">
            {topView === 'grid' ? <PianoRollEditor /> : <NotationView />}
          </div>
        </div>
        
        {/* Expanded / Large Synthesia Piano Roll Bottom Panel */}
        {showBottomPanel && (
          <div 
            className={`shrink-0 border-t border-cyan-500/20 flex flex-col bg-[#0A0B10] transition-all duration-300 ${
              panelExpanded ? 'h-[460px]' : 'h-[320px]'
            }`}
          >
            {activeTrack?.instrument === 'guitar' || activeTrack?.instrument === 'bass' ? (
              <Fretboard />
            ) : (
              <PianoRoll />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
