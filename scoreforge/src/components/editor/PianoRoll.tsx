import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { useAppStore } from '../../store';
import { audioEngine } from '../../lib/AudioEngine';

// Tipo para destellos activos de Guitar Hero
interface FlashEntry {
  color: string;
  intensity: number;
  timeoutId: ReturnType<typeof setTimeout>;
}

export const PianoRoll: React.FC = () => {
  const { score, isPlaying, setIsPlaying } = useAppStore();
  const containerRef = useRef<HTMLDivElement>(null);

  const MIN_PITCH = 36; // C2
  const MAX_PITCH = 96; // C7

  const isBlackKey = (pitch: number) => [1, 3, 6, 8, 10].includes(pitch % 12);

  // Layout del teclado (pitches → posición en el teclado)
  const pitchLayout = useMemo(() => {
    const layout = new Map<number, { black: boolean; whiteKeyIndex: number }>();
    let currentWhiteKey = 0;
    for (let pitch = MIN_PITCH; pitch <= MAX_PITCH; pitch++) {
      const black = isBlackKey(pitch);
      layout.set(pitch, { black, whiteKeyIndex: currentWhiteKey });
      if (!black) currentWhiteKey++;
    }
    return { layout, totalWhiteKeys: currentWhiteKey };
  }, []);

  const [currentTime, setCurrentTime] = useState(0);

  // Estado de destellos Guitar Hero: map de pitch → FlashEntry
  const [flashes, setFlashes] = useState<Map<number, FlashEntry>>(new Map());
  const flashesRef = useRef<Map<number, FlashEntry>>(new Map());

  // Suscripción al callback de nota del motor de audio
  useEffect(() => {
    audioEngine.onNoteStart = (pitch: number, _instrument: string, trackColor: string) => {
      setFlashes(prev => {
        const next = new Map(prev);
        // Cancelar timeout anterior si existe
        const existing = next.get(pitch);
        if (existing) clearTimeout(existing.timeoutId);

        const timeoutId = setTimeout(() => {
          setFlashes(p => {
            const n = new Map(p);
            n.delete(pitch);
            return n;
          });
        }, 220);

        next.set(pitch, { color: trackColor, intensity: 1.0, timeoutId });
        return next;
      });
    };
    return () => {
      audioEngine.onNoteStart = undefined;
    };
  }, []);

  // Animación de posición de reproducción
  useEffect(() => {
    let frameId: number;
    const animate = () => {
      if (isPlaying) {
        const audioTime = audioEngine.getPlaybackTime();
        setCurrentTime(audioTime * (score.bpm / 60));
      } else {
        setCurrentTime(0);
      }
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, score.bpm]);

  const handleKeyClick = useCallback((pitch: number) => {
    const activeTrack = score.tracks.find(t => t.id);
    audioEngine.playNote(pitch, 100, activeTrack?.instrument || 'piano', 0, 0.5, activeTrack?.color || '#22d3ee');
  }, [score.tracks]);

  const whiteKeyWidthPercent = 100 / pitchLayout.totalWhiteKeys;
  const pixelsPerBeat = 148;

  return (
    <div className="flex-1 flex flex-col bg-[#07080D] border-t border-white/10 relative overflow-hidden select-none" ref={containerRef}>
      
      {/* Zona de Caída de Notas (Synthesia Stage) */}
      <div className="flex-1 relative overflow-hidden">

        {/* Rejilla de fondo en movimiento */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.25) 1px, transparent 1px)',
            backgroundSize: `100% ${pixelsPerBeat}px`,
            backgroundPosition: `0 ${(currentTime % 1) * pixelsPerBeat}px`
          }}
        />

        {/* === EFECTOS NEON GUITAR HERO: Rayos de luz hacia arriba === */}
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
          {Array.from(flashes.entries()).map(([pitch, flash]) => {
            const layout = pitchLayout.layout.get(pitch);
            if (!layout) return null;
            const cx = (layout.whiteKeyIndex + (layout.black ? 0 : 0.5)) * whiteKeyWidthPercent;
            const beamW = layout.black ? whiteKeyWidthPercent * 1.2 : whiteKeyWidthPercent * 1.8;

            return (
              <React.Fragment key={`flash-${pitch}`}>
                {/* Rayo vertical principal */}
                <div
                  className="absolute bottom-0 top-0 pointer-events-none"
                  style={{
                    left: `${cx}%`,
                    width: `${beamW}%`,
                    transform: 'translateX(-50%)',
                    background: `linear-gradient(to top, ${flash.color} 0%, ${flash.color}99 20%, ${flash.color}33 60%, transparent 100%)`,
                    boxShadow: `0 0 40px 8px ${flash.color}`,
                    opacity: flash.intensity,
                  }}
                />
                {/* Explosión circular en la base (golpe de nota) */}
                <div
                  className="absolute pointer-events-none"
                  style={{
                    left: `${cx}%`,
                    bottom: '112px', // Justo encima del teclado
                    transform: 'translate(-50%, 50%)',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: `radial-gradient(circle, #ffffff 0%, ${flash.color} 40%, transparent 70%)`,
                    boxShadow: `0 0 60px 20px ${flash.color}, 0 0 120px 40px ${flash.color}66`,
                    opacity: flash.intensity * 0.9,
                    animation: 'ping 0.22s ease-out forwards',
                  }}
                />
              </React.Fragment>
            );
          })}
        </div>

        {/* Overlay de inicio si está pausado */}
        {!isPlaying && currentTime === 0 && (
          <div 
            className="absolute inset-0 flex items-center justify-center z-30 cursor-pointer bg-black/50 backdrop-blur-sm"
            onClick={() => setIsPlaying(true)}
          >
            <div className="flex items-center gap-3 text-cyan-300 font-extrabold tracking-widest px-8 py-4 bg-[#0F111A]/90 rounded-full border border-cyan-500/30 hover:scale-105 transition-all shadow-[0_0_40px_rgba(34,211,238,0.2)] select-none">
              <span className="w-9 h-9 rounded-full bg-cyan-500/20 flex items-center justify-center text-base border border-cyan-400">▶</span>
              REPRODUCIR (ESPACIO)
            </div>
          </div>
        )}

        {/* Notas cayendo */}
        <div className="absolute inset-x-0 bottom-0 top-0 z-10">
          {score.tracks.map(track => {
            if (track.isMuted) return null;
            const hasSolo = score.tracks.some(t => t.isSolo);
            if (hasSolo && !track.isSolo) return null;
            const volRatio = track.volume !== undefined ? track.volume / 100 : 1;
            if (volRatio <= 0) return null;

            return track.notes.map(note => {
              const layout = pitchLayout.layout.get(note.pitch);
              if (!layout) return null;

              const bottomPos = (note.start - currentTime) * pixelsPerBeat;
              const noteHeight = Math.max(8, note.duration * pixelsPerBeat);
              if (bottomPos > 1800 || bottomPos + noteHeight < -50) return null;

              const leftPos = `${layout.whiteKeyIndex * whiteKeyWidthPercent}%`;
              const noteWidth = layout.black ? whiteKeyWidthPercent * 0.65 : whiteKeyWidthPercent * 0.85;
              const transformLeft = layout.black ? `translateX(-50%)` : `translateX(8%)`;
              const isHitting = currentTime >= note.start - 0.06 && currentTime <= note.start + note.duration + 0.06;
              const isFlashing = flashes.has(note.pitch);

              return (
                <div
                  key={note.id}
                  className="absolute rounded-lg border overflow-hidden"
                  style={{
                    bottom: `${bottomPos}px`,
                    height: `${noteHeight}px`,
                    left: leftPos,
                    width: `${noteWidth}%`,
                    transform: transformLeft,
                    backgroundColor: track.color,
                    borderColor: (isHitting || isFlashing) ? '#ffffff' : `${track.color}AA`,
                    boxShadow: (isHitting || isFlashing)
                      ? `0 0 25px ${track.color}, 0 0 50px ${track.color}88, inset 0 0 10px rgba(255,255,255,0.5)`
                      : `0 0 8px ${track.color}40`,
                    opacity: 0.97,
                    transition: 'box-shadow 0.05s ease'
                  }}
                >
                  {/* Borde luminoso en la punta de la nota (frente de impacto) */}
                  <div
                    className="absolute bottom-0 inset-x-0 h-1.5 rounded-b-lg"
                    style={{
                      background: `rgba(255,255,255,${(isHitting || isFlashing) ? 0.9 : 0.5})`,
                      boxShadow: (isHitting || isFlashing) ? `0 0 12px #ffffff` : undefined
                    }}
                  />
                </div>
              );
            });
          })}
        </div>
      </div>

      {/* Teclado Piano 3D grande */}
      <div className="h-32 bg-[#07080D] border-t-2 border-cyan-500/20 relative flex w-full shrink-0 shadow-[0_-15px_40px_rgba(0,0,0,0.9)] z-30">
        {/* Teclas Blancas */}
        {Array.from({ length: pitchLayout.totalWhiteKeys }).map((_, i) => {
          const entry = Array.from(pitchLayout.layout.entries()).find(([_, l]) => !l.black && l.whiteKeyIndex === i);
          const pitch = entry ? entry[0] : null;
          const flash = pitch !== null ? flashes.get(pitch) : null;

          return (
            <div
              key={`white-${i}`}
              onClick={() => pitch !== null && handleKeyClick(pitch)}
              className="h-full border-r border-black/40 flex-1 rounded-b-md cursor-pointer relative overflow-hidden transition-all duration-75"
              style={{
                background: flash
                  ? `linear-gradient(to bottom, ${flash.color} 0%, ${flash.color}CC 30%, #e2e8f0 100%)`
                  : 'linear-gradient(to bottom, #e2e8f0 0%, #ffffff 70%, #cbd5e1 100%)',
                boxShadow: flash
                  ? `0 0 40px ${flash.color}, inset 0 -6px 16px ${flash.color}99`
                  : 'inset 0 -3px 6px rgba(0,0,0,0.15)',
              }}
            >
              {/* Brillo de impacto Guitar Hero en teclas blancas */}
              {flash && (
                <div
                  className="absolute inset-0 rounded-b-md"
                  style={{
                    background: `linear-gradient(to bottom, rgba(255,255,255,0.6) 0%, ${flash.color}80 100%)`,
                    animation: 'ping 0.22s ease-out'
                  }}
                />
              )}
            </div>
          );
        })}

        {/* Teclas Negras */}
        {Array.from(pitchLayout.layout.entries()).map(([pitch, layout]) => {
          if (!layout.black) return null;
          const flash = flashes.get(pitch);

          return (
            <div
              key={`black-${pitch}`}
              onClick={() => handleKeyClick(pitch)}
              className="absolute top-0 rounded-b border-x border-b border-[#000] cursor-pointer z-10 transition-all duration-75"
              style={{
                left: `${layout.whiteKeyIndex * whiteKeyWidthPercent}%`,
                width: `${whiteKeyWidthPercent * 0.65}%`,
                height: '65%',
                transform: 'translateX(-50%)',
                background: flash
                  ? `linear-gradient(to bottom, ${flash.color} 0%, #ffffff 100%)`
                  : 'linear-gradient(to bottom, #1e293b 0%, #0f172a 100%)',
                boxShadow: flash
                  ? `0 0 30px ${flash.color}, 0 0 60px ${flash.color}, inset 0 0 15px ${flash.color}`
                  : '2px 3px 8px rgba(0,0,0,0.8)',
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
