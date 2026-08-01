import React, { useState } from 'react';
import { Plus, Trash2, Volume2, VolumeX } from 'lucide-react';
import { useAppStore } from '../../store';

const INSTRUMENT_ICON: Record<string, string> = {
  piano:    '🎹',
  guitar:   '🎸',
  bass:     '🎵',
  drums:    '🥁',
  strings:  '🎻',
  'synth pad': '🎛️',
};

const INSTRUMENT_GRADIENT: Record<string, string> = {
  piano:    'from-cyan-500 to-blue-600',
  guitar:   'from-orange-500 to-red-600',
  bass:     'from-green-500 to-teal-600',
  drums:    'from-red-500 to-pink-600',
  strings:  'from-purple-500 to-violet-600',
  'synth pad': 'from-yellow-500 to-amber-600',
};

export const TrackList: React.FC = () => {
  const { score, setScore, activeTrackId, setActiveTrackId } = useAppStore();
  const [hoverTrackId, setHoverTrackId] = useState<string | null>(null);

  // Alterna Mute de una pista
  const toggleMute = (e: React.MouseEvent, trackId: string) => {
    e.stopPropagation();
    setScore(prev => ({
      ...prev,
      tracks: prev.tracks.map(t =>
        t.id === trackId ? { ...t, isMuted: !t.isMuted } : t
      )
    }));
  };

  // Alterna Solo de una pista
  const toggleSolo = (e: React.MouseEvent, trackId: string) => {
    e.stopPropagation();
    setScore(prev => ({
      ...prev,
      tracks: prev.tracks.map(t =>
        t.id === trackId ? { ...t, isSolo: !t.isSolo } : t
      )
    }));
  };

  // Cambia volumen de una pista (0 - 100)
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>, trackId: string) => {
    e.stopPropagation();
    const newVol = parseInt(e.target.value, 10);
    setScore(prev => ({
      ...prev,
      tracks: prev.tracks.map(t =>
        t.id === trackId ? { ...t, volume: newVol } : t
      )
    }));
  };

  // Elimina una pista del score
  const removeTrack = (e: React.MouseEvent, trackId: string) => {
    e.stopPropagation();
    if (score.tracks.length <= 1) return;
    setScore(prev => ({
      ...prev,
      tracks: prev.tracks.filter(t => t.id !== trackId)
    }));
    if (activeTrackId === trackId && score.tracks.length > 1) {
      const remaining = score.tracks.filter(t => t.id !== trackId);
      setActiveTrackId(remaining[0].id);
    }
  };

  // Añade una nueva pista vacía
  const addTrack = () => {
    const newTrack = {
      id: `track-${Date.now()}`,
      name: `Pista ${score.tracks.length + 1}`,
      instrument: 'piano' as const,
      color: ['#22d3ee', '#4ade80', '#a78bfa', '#f472b6', '#fbbf24'][score.tracks.length % 5],
      isMuted: false,
      isSolo: false,
      volume: 100,
      notes: []
    };
    setScore(prev => ({ ...prev, tracks: [...prev.tracks, newTrack] }));
    setActiveTrackId(newTrack.id);
  };

  return (
    <div className="w-[230px] shrink-0 bg-[#0A0B10] border-r border-white/5 flex flex-col h-full overflow-hidden select-none">
      {/* Encabezado */}
      <div className="h-12 flex items-center justify-between px-3 border-b border-white/5 shrink-0">
        <span className="text-[10px] font-extrabold tracking-[0.2em] text-white/40 uppercase">
          MEZCLADOR ({score.tracks.length})
        </span>
        <button
          onClick={addTrack}
          className="w-6 h-6 rounded bg-cyan-500/15 hover:bg-cyan-500/30 text-cyan-400 flex items-center justify-center transition-all hover:scale-110 border border-cyan-500/20"
          title="Añadir pista"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Lista de pistas de mezclador */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-1.5 scrollbar-thin scrollbar-thumb-white/10">
        {score.tracks.map((track, index) => {
          const isActive = activeTrackId === track.id;
          const isHovered = hoverTrackId === track.id;
          const gradient = INSTRUMENT_GRADIENT[track.instrument] || 'from-cyan-500 to-blue-600';
          const icon = INSTRUMENT_ICON[track.instrument] || '🎵';
          const currentVol = track.volume !== undefined ? track.volume : 100;

          return (
            <div
              key={track.id}
              onClick={() => setActiveTrackId(track.id)}
              onMouseEnter={() => setHoverTrackId(track.id)}
              onMouseLeave={() => setHoverTrackId(null)}
              className={`relative rounded-xl cursor-pointer overflow-hidden transition-all duration-200 border ${
                isActive
                  ? 'border-white/20 bg-white/5 shadow-[0_0_20px_rgba(0,0,0,0.6)]'
                  : 'border-white/5 hover:border-white/10 hover:bg-white/[0.02]'
              } ${track.isMuted ? 'opacity-40' : ''}`}
              style={{ borderLeft: `4px solid ${track.color}` }}
            >
              <div className="p-2.5">
                {/* Top Row: Icon, Name, Track # */}
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-sm shrink-0 shadow-md`}>
                    <span>{icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-bold text-white/90 truncate leading-tight">{track.name}</div>
                    <div className="text-[9px] text-white/30 capitalize leading-tight">{track.instrument}</div>
                  </div>
                  <span className="text-[9px] text-white/20 font-mono">#{index + 1}</span>
                </div>

                {/* Slider de Volumen del Mezclador */}
                <div className="flex items-center gap-2 mb-2 bg-black/40 rounded px-2 py-1 border border-white/5">
                  <button 
                    onClick={(e) => toggleMute(e, track.id)}
                    className="text-white/40 hover:text-cyan-400"
                    title={track.isMuted ? 'Desmutear' : 'Mutear'}
                  >
                    {track.isMuted || currentVol === 0 ? <VolumeX className="w-3 h-3 text-red-400" /> : <Volume2 className="w-3 h-3 text-cyan-400" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={currentVol}
                    onChange={(e) => handleVolumeChange(e, track.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                  <span className="text-[9px] font-mono font-bold text-cyan-300 min-w-[24px] text-right">
                    {currentVol}%
                  </span>
                </div>

                {/* Bottom Row: Mute & Solo Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {/* Mute Button */}
                    <button
                      onClick={(e) => toggleMute(e, track.id)}
                      className={`h-5 px-2.5 rounded text-[9px] font-extrabold tracking-widest transition-all border ${
                        track.isMuted
                          ? 'bg-red-500/30 text-red-400 border-red-500/50 shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                          : 'bg-white/5 text-white/30 border-white/10 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      M
                    </button>
                    {/* Solo Button */}
                    <button
                      onClick={(e) => toggleSolo(e, track.id)}
                      className={`h-5 px-2.5 rounded text-[9px] font-extrabold tracking-widest transition-all border ${
                        track.isSolo
                          ? 'bg-amber-500/30 text-amber-400 border-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                          : 'bg-white/5 text-white/30 border-white/10 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      S
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] text-white/20 font-mono">
                      {track.notes.length}n
                    </span>
                    {(isHovered || isActive) && score.tracks.length > 1 && (
                      <button
                        onClick={(e) => removeTrack(e, track.id)}
                        className="p-0.5 text-white/20 hover:text-red-400 transition-colors rounded"
                        title="Eliminar pista"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
