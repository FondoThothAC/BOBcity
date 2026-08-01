import React from 'react';
import { useAppStore } from '../../store';
import { audioEngine } from '../../lib/AudioEngine';

export const Fretboard: React.FC = () => {
  const { activeTrackId, score } = useAppStore();
  const activeTrack = score.tracks.find(t => t.id === activeTrackId);
  
  // Standard tuning E2, A2, D3, G3, B3, E4
  const strings = [64, 59, 55, 50, 45, 40]; 
  const frets = 22;

  const getNoteName = (pitch: number) => {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    return notes[pitch % 12];
  };

  const handleFretClick = (stringPitch: number, fret: number) => {
    const pitch = stringPitch + fret;
    audioEngine.playNote(pitch, 100, 'guitar');
  };

  return (
    <div className="h-48 bg-[#0A0B10] border-t border-white/10 flex flex-col">
      <div className="px-4 py-2 bg-white/5 border-b border-white/10 flex justify-between items-center text-xs text-white/50 font-medium">
        <span>Fretboard</span>
        {activeTrack && <span className="text-cyan-400">{activeTrack.name}</span>}
      </div>
      
      <div className="flex-1 flex overflow-x-auto items-center px-4 relative py-2">
        <div className="relative flex flex-col justify-between w-max min-w-full h-full bg-[#1A1512] border-4 border-[#05060A] rounded-sm shadow-inner">
          
          {/* Fret Markers */}
          <div className="absolute inset-0 flex pointer-events-none">
            {Array.from({ length: frets + 1 }).map((_, fret) => (
              <div key={`fret-${fret}`} className="flex-1 border-r-2 border-white/20 relative flex justify-center items-center">
                {[3, 5, 7, 9, 15, 17, 19, 21].includes(fret) && (
                  <div className="w-4 h-4 rounded-full bg-white/20 absolute top-1/2 -translate-y-1/2" />
                )}
                {fret === 12 && (
                  <div className="flex flex-col gap-8 absolute top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 rounded-full bg-white/20" />
                    <div className="w-4 h-4 rounded-full bg-white/20" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Strings */}
          {strings.map((basePitch, stringIdx) => (
            <div key={`string-${stringIdx}`} className="flex-1 flex items-center relative z-10 group">
              {/* Actual String Line */}
              <div className="absolute w-full h-[2px] bg-cyan-500/50 shadow-[0_0_5px_rgba(6,182,212,0.5)] pointer-events-none" style={{ height: `${1 + (5 - stringIdx) * 0.3}px` }} />
              
              {/* Clickable Frets */}
              {Array.from({ length: frets + 1 }).map((_, fret) => {
                const pitch = basePitch + fret;
                return (
                  <div 
                    key={`pos-${stringIdx}-${fret}`}
                    onClick={() => handleFretClick(basePitch, fret)}
                    className="flex-1 h-full flex justify-center items-center cursor-pointer hover:bg-cyan-500/10 transition-colors"
                  >
                    {/* Hover indicator */}
                    <div className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-full bg-purple-500/80 shadow-[0_0_10px_rgba(168,85,247,0.8)] flex items-center justify-center text-[10px] text-white font-bold transform scale-0 hover:scale-100 transition-all duration-75">
                      {getNoteName(pitch)}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
