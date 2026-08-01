import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useAppStore } from '../../store';
import { audioEngine } from '../../lib/AudioEngine';

// Nombre de nota MIDI completo
const NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

function midiToName(pitch: number): string {
  const octave = Math.floor(pitch / 12) - 1;
  return `${NOTE_NAMES[pitch % 12]}${octave}`;
}

function isBlackKey(pitch: number): boolean {
  return [1,3,6,8,10].includes(pitch % 12);
}

// Constantes de layout SVG
const STAFF_LINE_GAP = 12;
const STAFF_LINES = 5;
const CLEF_W = 48;
const TIME_SIG_W = 28;
const NOTE_SPACING = 44;
const STAFF_TOP = 24;
const STAFF_H = (STAFF_LINES - 1) * STAFF_LINE_GAP;
const BAR_LINE_Y1 = STAFF_TOP;
const BAR_LINE_Y2 = STAFF_TOP + STAFF_H;

// Posición vertical de una nota MIDI en la pentagrama (sistema de clave de sol)
// Referencia: C4(60) = línea o espacio adecuado bajo la segunda línea
function noteY(pitch: number): number {
  // Pasos de la escala diatónica en relación al C4 (MIDI 60)
  const diatonicMap: Record<number, number> = {
    0: 0, 2: 1, 4: 2, 5: 3, 7: 4, 9: 5, 11: 6,
    1: 0.5, 3: 1.5, 6: 3.5, 8: 4.5, 10: 5.5 // sostenidos (entre el diatónico inferior)
  };
  const note = pitch % 12;
  const octave = Math.floor(pitch / 12) - 1;
  const c4Octave = 4;
  const octaveDiff = octave - c4Octave;
  const diatonicPos = diatonicMap[note] + octaveDiff * 7;

  // Mapear posición diatónica relativa a C4 a píxeles en el pentagrama
  // En clave de sol, el mi de la primera línea es MIDI 64 (E4) → pos 0 en la 1era línea
  // La 1era línea del pentagrama = E4(64) en clave de sol
  const e4Pitch = 64;
  const e4Diatonic = diatonicMap[e4Pitch % 12] + (Math.floor(e4Pitch / 12) - 1 - c4Octave) * 7;
  const relPos = diatonicPos - e4Diatonic;

  // Posición en píxeles (hacia arriba = positivo)
  return STAFF_TOP + STAFF_H - relPos * (STAFF_LINE_GAP / 2);
}

interface MeasureNote {
  pitch: number;
  duration: number;
  start: number;
}

function getDurationName(beats: number): string {
  if (beats >= 4) return 'whole';
  if (beats >= 2) return 'half';
  if (beats >= 1) return 'quarter';
  if (beats >= 0.5) return 'eighth';
  return 'sixteenth';
}

// SVG head/stem de nota simplificado
function NoteGlyph({ x, y, dur, accidental, color }: {
  x: number, y: number, dur: string, accidental?: '#' | 'b' | null, color: string
}) {
  const filled = dur !== 'whole' && dur !== 'half';
  const hasStem = dur !== 'whole';
  const stemUp = y > STAFF_TOP + STAFF_H / 2;
  const stemX = stemUp ? x + 6 : x - 6;
  const stemY1 = stemUp ? y - 2 : y + 2;
  const stemY2 = stemUp ? y - 28 : y + 28;

  // Líneas adicionales
  const ledgerLines: number[] = [];
  const bottomLine = STAFF_TOP + STAFF_H; // E4
  const topLine = STAFF_TOP;              // F5
  if (y > bottomLine + 2) {
    for (let ly = bottomLine + STAFF_LINE_GAP; ly <= y + 4; ly += STAFF_LINE_GAP) {
      ledgerLines.push(ly);
    }
  }
  if (y < topLine - 2) {
    for (let ly = topLine - STAFF_LINE_GAP; ly >= y - 4; ly -= STAFF_LINE_GAP) {
      ledgerLines.push(ly);
    }
  }

  return (
    <g>
      {/* Líneas adicionales */}
      {ledgerLines.map((ly, i) => (
        <line key={i} x1={x - 10} y1={ly} x2={x + 10} y2={ly} stroke={color} strokeWidth="1.5" />
      ))}
      {/* Accidentales */}
      {accidental === '#' && (
        <text x={x - 13} y={y + 4} fontSize="11" fill={color} fontFamily="serif">#</text>
      )}
      {accidental === 'b' && (
        <text x={x - 11} y={y + 5} fontSize="13" fill={color} fontFamily="serif">♭</text>
      )}
      {/* Cabeza de nota */}
      <ellipse
        cx={x} cy={y} rx={6} ry={5}
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth="1.5"
        transform={`rotate(-15, ${x}, ${y})`}
      />
      {/* Plica */}
      {hasStem && (
        <line x1={stemX} y1={stemY1} x2={stemX} y2={stemY2} stroke={color} strokeWidth="1.5" />
      )}
      {/* Corchea: una barra */}
      {dur === 'eighth' && (
        <path
          d={stemUp
            ? `M${stemX} ${stemY2} C${stemX + 12} ${stemY2 + 8} ${stemX + 8} ${stemY2 + 14} ${stemX + 4} ${stemY2 + 20}`
            : `M${stemX} ${stemY2} C${stemX - 12} ${stemY2 - 8} ${stemX - 8} ${stemY2 - 14} ${stemX - 4} ${stemY2 - 20}`
          }
          stroke={color} strokeWidth="1.5" fill="none"
        />
      )}
      {/* Semicorchea: dos barras */}
      {dur === 'sixteenth' && (
        <>
          <path
            d={stemUp
              ? `M${stemX} ${stemY2} C${stemX + 12} ${stemY2 + 8} ${stemX + 8} ${stemY2 + 14} ${stemX + 4} ${stemY2 + 20}`
              : `M${stemX} ${stemY2} C${stemX - 12} ${stemY2 - 8} ${stemX - 8} ${stemY2 - 14} ${stemX - 4} ${stemY2 - 20}`
            }
            stroke={color} strokeWidth="1.5" fill="none"
          />
          <path
            d={stemUp
              ? `M${stemX} ${stemY2 + 8} C${stemX + 10} ${stemY2 + 16} ${stemX + 7} ${stemY2 + 22} ${stemX + 3} ${stemY2 + 28}`
              : `M${stemX} ${stemY2 - 8} C${stemX - 10} ${stemY2 - 16} ${stemX - 7} ${stemY2 - 22} ${stemX - 3} ${stemY2 - 28}`
            }
            stroke={color} strokeWidth="1.5" fill="none"
          />
        </>
      )}
    </g>
  );
}

// Silencio (resto) simplificado
function RestGlyph({ x, dur }: { x: number, dur: string }) {
  const y = STAFF_TOP + STAFF_LINE_GAP * 1.5;
  if (dur === 'whole') return <rect x={x - 8} y={y + STAFF_LINE_GAP * 1.5} width={16} height={6} fill="#666" rx={1} />;
  if (dur === 'half') return <rect x={x - 8} y={y + STAFF_LINE_GAP * 1.5 - 7} width={16} height={6} fill="none" stroke="#666" strokeWidth="1.5" rx={1} />;
  return <text x={x - 5} y={y + 18} fontSize="18" fill="#666" fontFamily="serif">𝄽</text>;
}

export const NotationView: React.FC = () => {
  const { score, activeTrackId } = useAppStore();
  const activeTrack = score.tracks.find(t => t.id === activeTrackId);

  const notes = useMemo(() => {
    if (!activeTrack?.notes?.length) return [];
    return [...activeTrack.notes]
      .filter(n => n.pitch >= 40 && n.pitch <= 96)
      .sort((a, b) => a.start - b.start)
      .slice(0, 120);
  }, [activeTrack]);

  // Agrupa las notas en compases de 4/4
  const [numerator, denominator] = score.timeSignature || [4, 4];
  const beatsPerBar = numerator;

  // Construye compases lógicos
  const measures = useMemo(() => {
    const bars: MeasureNote[][] = [];
    let currentBar: MeasureNote[] = [];
    let beatInBar = 0;

    notes.forEach(n => {
      const dur = Math.max(0.25, n.duration);
      if (beatInBar + dur > beatsPerBar + 0.01) {
        bars.push([...currentBar]);
        currentBar = [];
        beatInBar = 0;
      }
      currentBar.push({ pitch: n.pitch, duration: dur, start: n.start });
      beatInBar += dur;
    });
    if (currentBar.length > 0) bars.push(currentBar);
    return bars;
  }, [notes, beatsPerBar]);

  // Dimensiones del SVG
  const notesPerLine = 8;
  const measuresPerLine = Math.max(1, Math.floor(notesPerLine / 4));
  const measureLines = Math.ceil(measures.length / measuresPerLine);
  const rowH = 110;
  const svgW = '100%';
  const svgH = Math.max(160, measureLines * rowH + 40);
  const lineW = 900;

  const trackColor = activeTrack?.color || '#22d3ee';

  return (
    <div className="flex-1 bg-transparent overflow-auto p-4 flex flex-col gap-4">
      {/* Encabezado de partitura */}
      <div className="text-center">
        <h2 className="text-2xl font-light tracking-tight text-white">
          {score.title}
          <span className="text-cyan-400/60 italic text-lg"> / {score.artist}</span>
        </h2>
        <p className="text-xs text-white/30 mt-0.5">
          Pista: <span className="font-bold" style={{ color: trackColor }}>{activeTrack?.name || '—'}</span>
          {' · '}{numerator}/{denominator} · {score.bpm} BPM · {notes.length} notas visibles
        </p>
      </div>

      {/* Área de partitura */}
      <div className="bg-white rounded-2xl shadow-[0_0_40px_rgba(34,211,238,0.08)] overflow-auto">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-stone-400">
            <span className="text-5xl mb-3">🎼</span>
            <p className="text-sm">Esta pista no tiene notas.</p>
            <p className="text-xs mt-1 text-stone-300">Carga un MIDI o añade notas en el Grid Editor.</p>
          </div>
        ) : (
          <svg
            width={svgW}
            viewBox={`0 0 ${lineW} ${svgH}`}
            style={{ fontFamily: 'serif', userSelect: 'none', minHeight: svgH }}
          >
            {/* Título */}
            <text x={lineW / 2} y={20} textAnchor="middle" fontSize="14" fill="#333" fontWeight="bold">
              {score.title}
            </text>

            {Array.from({ length: measureLines }).map((_, lineIndex) => {
              const lineY = lineIndex * rowH + 36;
              const barsInLine = measures.slice(
                lineIndex * measuresPerLine,
                (lineIndex + 1) * measuresPerLine
              );

              // Calcula el ancho disponible por compás
              const leftPad = lineIndex === 0 ? CLEF_W + TIME_SIG_W + 10 : CLEF_W + 10;
              const availableW = lineW - leftPad - 20;
              const barW = barsInLine.length > 0 ? availableW / barsInLine.length : availableW;

              return (
                <g key={lineIndex} transform={`translate(10, ${lineY})`}>
                  {/* 5 líneas del pentagrama */}
                  {Array.from({ length: STAFF_LINES }).map((_, si) => (
                    <line
                      key={si}
                      x1={0} y1={STAFF_TOP + si * STAFF_LINE_GAP}
                      x2={lineW - 20} y2={STAFF_TOP + si * STAFF_LINE_GAP}
                      stroke="#ccc" strokeWidth="1"
                    />
                  ))}

                  {/* Clave de Sol (simplificada) */}
                  <text x={4} y={STAFF_TOP + STAFF_H - 2} fontSize="46" fill="#555" fontFamily="serif">𝄞</text>

                  {/* Indicación de compás (solo primera línea) */}
                  {lineIndex === 0 && (
                    <>
                      <text x={CLEF_W} y={STAFF_TOP + STAFF_LINE_GAP + 1} fontSize="14" fill="#444" fontFamily="serif" fontWeight="bold">{numerator}</text>
                      <text x={CLEF_W} y={STAFF_TOP + STAFF_H} fontSize="14" fill="#444" fontFamily="serif" fontWeight="bold">{denominator}</text>
                    </>
                  )}

                  {/* Compases */}
                  {barsInLine.map((barNotes, barIndex) => {
                    const barX = leftPad + barIndex * barW;
                    const noteStep = barW / Math.max(barNotes.length, 1);

                    return (
                      <g key={barIndex}>
                        {/* Línea de barra al inicio */}
                        <line x1={barX} y1={BAR_LINE_Y1} x2={barX} y2={BAR_LINE_Y2} stroke="#999" strokeWidth="1.2" />

                        {/* Número de compás */}
                        <text x={barX + 2} y={STAFF_TOP - 4} fontSize="8" fill="#bbb">{lineIndex * measuresPerLine + barIndex + 1}</text>

                        {/* Notas del compás */}
                        {barNotes.map((note, ni) => {
                          const nx = barX + (ni + 0.5) * noteStep;
                          const ny = noteY(note.pitch);
                          const dur = getDurationName(note.duration);
                          const semitone = note.pitch % 12;
                          const isSharp = [1,3,6,8,10].includes(semitone);
                          const accidental = isSharp ? '#' : null;

                          return (
                            <NoteGlyph
                              key={ni}
                              x={nx}
                              y={ny}
                              dur={dur}
                              accidental={accidental}
                              color={trackColor}
                            />
                          );
                        })}
                      </g>
                    );
                  })}

                  {/* Línea de barra al final de la línea */}
                  <line x1={lineW - 21} y1={BAR_LINE_Y1} x2={lineW - 21} y2={BAR_LINE_Y2} stroke="#999" strokeWidth="1.2" />
                </g>
              );
            })}

            {/* Doble barra final */}
            <line x1={lineW - 23} y1={36 + (measureLines - 1) * rowH + BAR_LINE_Y1} x2={lineW - 23} y2={36 + (measureLines - 1) * rowH + BAR_LINE_Y2} stroke="#555" strokeWidth="1.5" />
            <line x1={lineW - 20} y1={36 + (measureLines - 1) * rowH + BAR_LINE_Y1} x2={lineW - 20} y2={36 + (measureLines - 1) * rowH + BAR_LINE_Y2} stroke="#555" strokeWidth="4" />
          </svg>
        )}
      </div>

      {/* Mini piano roll de referencia */}
      <div className="bg-[#0F111A] rounded-xl border border-white/5 p-4">
        <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mb-3">Perfil de notas · Pista activa</p>
        <div className="flex items-end gap-px h-14">
          {Array.from({ length: 88 }).map((_, i) => {
            const pitch = i + 21;
            const count = notes.filter(n => n.pitch === pitch).length;
            const maxCount = Math.max(1, ...notes.map(n => 1));
            const h = count > 0 ? Math.min(56, 8 + (count / maxCount) * 48) : 2;
            return (
              <div
                key={pitch}
                title={midiToName(pitch)}
                style={{
                  height: h,
                  background: count > 0 ? trackColor : '#1a1c23',
                  width: '100%',
                  opacity: count > 0 ? 0.7 + (count / Math.max(1, notes.length)) * 0.3 : 0.3,
                  borderRadius: 2,
                  transition: 'height 0.3s'
                }}
              />
            );
          })}
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[8px] text-white/20">A0</span>
          <span className="text-[8px] text-white/20">C4</span>
          <span className="text-[8px] text-white/20">C8</span>
        </div>
      </div>
    </div>
  );
};
