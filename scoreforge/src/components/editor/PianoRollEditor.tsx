import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../../store';
import { audioEngine } from '../../lib/AudioEngine';
import { demoScores } from '../../lib/demos';
import { Upload, Play, Square, Pause, Repeat, Undo, Redo, Download } from 'lucide-react';

export const PianoRollEditor: React.FC = () => {
  const { 
    score, setScore, activeTrackId, setActiveTrackId, isPlaying, setIsPlaying, 
    addNote, removeNote, updateNote, undo, redo, canUndo, canRedo,
    selectedNoteIds, setSelectedNoteIds, deleteSelectedNotes
  } = useAppStore();
  const activeTrack = score.tracks.find(t => t.id === activeTrackId);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [zoomX, setZoomX] = useState(60);
  const zoomY = 20;
  const velocityHeight = 80;

  const MIN_PITCH = 36;
  const MAX_PITCH = 96;
  const totalKeys = MAX_PITCH - MIN_PITCH + 1;

  const [currentBeat, setCurrentBeat] = useState(0);

  // Efecto Guitar Hero: mapa de pitches con flash activo y color
  const [guitarHeroFlashes, setGuitarHeroFlashes] = useState<Map<number, string>>(new Map());

  // Suscribir al callback del motor de audio para efectos visuales
  useEffect(() => {
    audioEngine.onNoteStart = (pitch: number, _instrument: string, trackColor: string) => {
      setGuitarHeroFlashes(prev => {
        const next = new Map(prev);
        next.set(pitch, trackColor);
        return next;
      });
      // Apagar el destello después de 180ms
      setTimeout(() => {
        setGuitarHeroFlashes(prev => {
          const next = new Map(prev);
          next.delete(pitch);
          return next;
        });
      }, 180);
    };
    return () => { audioEngine.onNoteStart = undefined; };
  }, []);

  useEffect(() => {
    let frameId: number;
    const update = () => {
      if (isPlaying) {
        setCurrentBeat(audioEngine.getPlaybackTime() * (score.bpm / 60));
      } else {
        setCurrentBeat(audioEngine.getPlaybackTime() * (score.bpm / 60));
      }
      frameId = requestAnimationFrame(update);
    };
    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, score.bpm]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (isPlaying) {
          audioEngine.pause();
          setIsPlaying(false);
        } else {
          setIsPlaying(true);
        }
      } else if (e.code === 'Delete' || e.code === 'Backspace') {
        e.preventDefault();
        deleteSelectedNotes();
      } else if (e.ctrlKey || e.metaKey) {
        if (e.code === 'KeyZ') {
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
        } else if (e.code === 'KeyY') {
          e.preventDefault();
          redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, deleteSelectedNotes, undo, redo]);

  const totalBeats = Math.max(32, Math.ceil(
    score.tracks.reduce((maxTrack, t) => {
      const maxNote = t.notes.reduce((max, n) => Math.max(max, n.start + n.duration), 0);
      return Math.max(maxTrack, maxNote);
    }, 0)
  ) + 16);

  const isBlackKey = (pitch: number) => {
    const note = pitch % 12;
    return [1, 3, 6, 8, 10].includes(note);
  };

  const handleKeyClick = (pitch: number) => {
    audioEngine.playNote(pitch, 100, activeTrack?.instrument === 'guitar' ? 'guitar' : 'piano');
  };

  const handleGridClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!activeTrack) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const beat = Math.floor(x / zoomX);
    const pitchIndex = Math.floor(y / zoomY);
    const pitch = MAX_PITCH - pitchIndex;

    const existingNote = activeTrack.notes.find(n => 
      n.pitch === pitch && 
      beat >= n.start && 
      beat < n.start + n.duration
    );

    if (existingNote) {
      audioEngine.playNote(existingNote.pitch, existingNote.velocity, activeTrack.instrument === 'guitar' ? 'guitar' : 'piano', 0, 0.3);
      if (e.shiftKey) {
        setSelectedNoteIds(prev => 
          prev.includes(existingNote.id) 
            ? prev.filter(id => id !== existingNote.id)
            : [...prev, existingNote.id]
        );
      } else {
        setSelectedNoteIds([existingNote.id]);
      }
    } else {
      setSelectedNoteIds([]);
      audioEngine.playNote(pitch, 100, activeTrack.instrument === 'guitar' ? 'guitar' : 'piano', 0, 0.3);
      addNote(activeTrack.id, {
        pitch,
        start: beat,
        duration: 1,
        velocity: 100
      });
    }
  };

  const handleScoreLoad = (newScore: any) => {
    audioEngine.stop();
    setIsPlaying(false);
    setCurrentBeat(0);
    setScore(newScore);
    if (newScore.tracks.length > 0) {
      setActiveTrackId(newScore.tracks[0].id);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const newScore = await audioEngine.parseMidiFile(file);
      handleScoreLoad(newScore);
    } catch (error) {
      console.error('Failed to parse MIDI file:', error);
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExportWav = async () => {
    try {
      const blob = await audioEngine.exportWav(score);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${score.title || 'mix'}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to export wav:', e);
    }
  };

  const handleExportMidi = async () => {
    try {
      const blob = await audioEngine.exportMidi(score);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${score.title || 'export'}.mid`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to export midi:', e);
    }
  };

  const handleVelocityDrag = (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    if (!activeTrack) return;

    const startY = e.clientY;
    const initialNote = activeTrack.notes.find(n => n.id === noteId);
    if (!initialNote) return;
    const initialVel = initialNote.velocity;

    // Auditory feedback
    audioEngine.playNote(initialNote.pitch, initialVel, activeTrack.instrument === 'guitar' ? 'guitar' : 'piano', 0, 0.3);

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = startY - moveEvent.clientY; // moving up increases velocity
      let newVel = initialVel + deltaY;
      newVel = Math.max(0, Math.min(127, newVel));
      updateNote(activeTrack.id, noteId, { velocity: newVel }, false); // Don't commit history yet
    };

    const onMouseUp = (upEvent: MouseEvent) => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      
      const deltaY = startY - upEvent.clientY;
      let finalVel = initialVel + deltaY;
      finalVel = Math.max(0, Math.min(127, finalVel));
      updateNote(activeTrack.id, noteId, { velocity: finalVel }, true); // Commit history
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleSoundFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await audioEngine.loadSoundFont(file);
    } catch (error) {
      console.error('Failed to load SoundFont:', error);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#05060A] overflow-hidden">
      {/* Toolbar */}
      <div className="h-14 border-b border-white/5 bg-[#0F111A] flex items-center px-6 justify-between shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="text-xs font-bold text-white/50 tracking-widest uppercase">Grid Editor</div>
            <select
              value={score.id}
              onChange={(e) => {
                const demo = demoScores.find(d => d.id === e.target.value);
                if (demo) {
                  handleScoreLoad(demo);
                }
              }}
              className="bg-[#1a1c23] border border-white/10 rounded px-2 py-1 text-xs text-white/70 outline-none hover:border-white/20 focus:border-cyan-500/50 max-w-[150px] truncate"
            >
              <option value={score.id} disabled>{score.title}</option>
              <optgroup label="Demo Library">
                {demoScores.map(demo => (
                  <option key={demo.id} value={demo.id}>{demo.title}</option>
                ))}
              </optgroup>
            </select>
          </div>
          
          <div className="h-6 w-px bg-white/10" />
          
          {/* Instrument Select */}
          {activeTrack && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40 font-medium uppercase tracking-wider">Instr</span>
              <select 
                value={activeTrack.instrument}
                onChange={(e) => {
                  setScore(prev => ({
                    ...prev,
                    tracks: prev.tracks.map(t => 
                      t.id === activeTrack.id ? { ...t, instrument: e.target.value as any } : t
                    )
                  }));
                }}
                className="bg-[#1a1c23] border border-white/10 rounded px-2 py-1 text-xs text-white/70 outline-none hover:border-white/20 focus:border-cyan-500/50"
              >
                <option value="piano">Piano</option>
                <option value="guitar">Guitar</option>
                <option value="bass">Bass</option>
                <option value="drums">Drums</option>
                <option value="strings">Strings</option>
                <option value="synth pad">Synth Pad</option>
              </select>
              
              <label className="flex items-center gap-1.5 px-3 py-1 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded text-xs font-bold tracking-wide transition-colors border border-white/5 cursor-pointer ml-2">
                <Upload className="w-3 h-3" />
                SF2
                <input type="file" accept=".sf2" className="hidden" onChange={handleSoundFontUpload} />
              </label>
            </div>
          )}

          <div className="h-6 w-px bg-white/10" />
          
          {/* Transport */}
          <div className="flex items-center gap-1">
            <button 
              onClick={() => {
                if (isPlaying) {
                  audioEngine.pause();
                  setIsPlaying(false);
                } else {
                  setIsPlaying(true);
                }
              }}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isPlaying ? 'bg-cyan-500/20 text-cyan-400' : 'hover:bg-white/10 text-white/70 hover:text-white'}`}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>
            <button 
              onClick={() => {
                audioEngine.stop();
                setIsPlaying(false);
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>
            <button 
              onClick={() => {
                const looping = !audioEngine.isLooping;
                audioEngine.setLooping(looping, 0, totalBeats);
                // force re-render for button state
              }}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${audioEngine.isLooping ? 'bg-purple-500/20 text-purple-400' : 'hover:bg-white/10 text-white/70 hover:text-white'}`}
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          <div className="h-6 w-px bg-white/10" />

          {/* Undo/Redo */}
          <div className="flex items-center gap-1">
            <button 
              onClick={undo}
              disabled={!canUndo}
              className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${canUndo ? 'hover:bg-white/10 text-white/70 hover:text-white' : 'text-white/20 cursor-not-allowed'}`}
            >
              <Undo className="w-4 h-4" />
            </button>
            <button 
              onClick={redo}
              disabled={!canRedo}
              className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${canRedo ? 'hover:bg-white/10 text-white/70 hover:text-white' : 'text-white/20 cursor-not-allowed'}`}
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <input 
              type="file" 
              accept=".mid,.midi" 
              onChange={handleFileUpload}
              ref={fileInputRef}
              className="hidden"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded text-xs font-bold tracking-wide transition-colors border border-white/5"
            >
              <Upload className="w-3.5 h-3.5" />
              Import MIDI
            </button>
            <button 
              onClick={handleExportMidi}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 hover:text-purple-300 rounded text-xs font-bold tracking-wide transition-colors border border-purple-500/20"
            >
              <Download className="w-3.5 h-3.5" />
              Export MIDI
            </button>
            <button 
              onClick={handleExportWav}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 hover:text-cyan-300 rounded text-xs font-bold tracking-wide transition-colors border border-cyan-500/20"
            >
              <Download className="w-3.5 h-3.5" />
              Export WAV
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-white/40 font-medium">Zoom X</span>
            <input 
              type="range" 
              min="20" 
              max="150" 
              value={zoomX}
              onChange={(e) => setZoomX(Number(e.target.value))}
              className="w-24 accent-cyan-500"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-auto relative" ref={containerRef}>
        <div className="min-w-max min-h-max flex flex-col relative">
          
          {/* Main Grid Row */}
          <div className="flex">
            {/* Keyboard (Left Side) */}
            <div className="sticky left-0 z-20 w-16 bg-[#0A0B10] border-r border-white/10 flex flex-col shrink-0 shadow-[2px_0_10px_rgba(0,0,0,0.5)]">
              {Array.from({ length: totalKeys }).map((_, idx) => {
                const pitch = MAX_PITCH - idx;
                const black = isBlackKey(pitch);
                const flashColor = guitarHeroFlashes.get(pitch);
                return (
                  <div 
                    key={pitch}
                    onMouseDown={() => handleKeyClick(pitch)}
                    className={`w-full flex items-center justify-center cursor-pointer border-b border-white/5 select-none transition-colors font-bold relative overflow-hidden
                      ${black ? 'bg-[#111216] text-white/20 hover:bg-[#1a1c23]' : 'bg-[#1a1c23] text-white/60 hover:bg-[#252830]'}`}
                    style={{
                      height: zoomY,
                      backgroundColor: flashColor
                        ? flashColor
                        : undefined,
                      boxShadow: flashColor
                        ? `0 0 12px ${flashColor}, 0 0 24px ${flashColor}88`
                        : undefined,
                      transition: flashColor ? 'none' : 'background-color 0.18s, box-shadow 0.18s'
                    }}
                  >
                    {/* Efecto de resplandor Guitar Hero */}
                    {flashColor && (
                      <div
                        className="absolute inset-0 animate-ping"
                        style={{ backgroundColor: `${flashColor}44`, borderRadius: '2px' }}
                      />
                    )}
                    {pitch % 12 === 0 && <span className="text-[9px] scale-75 relative z-10" style={{ color: flashColor ? 'white' : undefined }}>C{Math.floor(pitch / 12) - 1}</span>}
                  </div>
                );
              })}
            </div>

            {/* Grid Area */}
            <div 
              className="relative bg-[#05060A]"
              style={{ 
                width: totalBeats * zoomX, 
                height: totalKeys * zoomY,
                backgroundImage: `
                  linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
                `,
                backgroundSize: `${zoomX}px ${zoomY}px`
              }}
              onClick={handleGridClick}
            >
              {/* Playhead */}
              <div 
                className="absolute top-0 bottom-0 w-px bg-cyan-400 z-10 shadow-[0_0_10px_rgba(34,211,238,0.8)] pointer-events-none"
                style={{ left: currentBeat * zoomX }}
              />

              {/* Beat Markers (vertical lines for beats) */}
              {Array.from({ length: totalBeats + 1 }).map((_, i) => (
                <div 
                  key={`beat-${i}`} 
                  className={`absolute top-0 bottom-0 w-px pointer-events-none ${i % 4 === 0 ? 'bg-white/10 shadow-[0_0_5px_rgba(255,255,255,0.1)]' : 'bg-transparent'}`}
                  style={{ left: i * zoomX }}
                />
              ))}

              {/* Row backgrounds (darker for black keys) */}
              {Array.from({ length: totalKeys }).map((_, idx) => {
                const pitch = MAX_PITCH - idx;
                const black = isBlackKey(pitch);
                if (!black) return null;
                return (
                  <div
                    key={`row-${pitch}`}
                    className="absolute left-0 right-0 pointer-events-none bg-white/[0.02]"
                    style={{
                      top: idx * zoomY,
                      height: zoomY
                    }}
                  />
                )
              })}

              {/* Notes */}
              {activeTrack?.notes.map(note => {
                if (note.pitch > MAX_PITCH || note.pitch < MIN_PITCH) return null;
                const top = (MAX_PITCH - note.pitch) * zoomY;
                const left = note.start * zoomX;
                const width = note.duration * zoomX;
                
                const isSelected = selectedNoteIds.includes(note.id);
                return (
                  <div
                    key={note.id}
                    className={`absolute rounded-sm border transition-all cursor-pointer z-10 ${isSelected ? 'border-white shadow-[0_0_15px_rgba(255,255,255,0.6)] z-20' : 'border-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.3)] hover:brightness-125'}`}
                    style={{
                      top: top + 1,
                      left,
                      width,
                      height: zoomY - 2,
                      backgroundColor: isSelected ? '#ffffff' : activeTrack.color,
                      opacity: Math.max(0.2, note.velocity / 127)
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Velocity Lane Row */}
          <div className="sticky bottom-0 z-30 flex bg-[#0A0B10] border-t border-white/10 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]" style={{ height: velocityHeight }}>
            {/* Velocity Header */}
            <div className="sticky left-0 z-40 w-16 bg-[#0F111A] border-r border-white/10 shrink-0 flex flex-col items-center justify-center shadow-[2px_0_10px_rgba(0,0,0,0.5)]">
              <span className="text-[9px] text-white/30 font-bold uppercase tracking-widest -rotate-90">Velocity</span>
            </div>
            
            {/* Velocity Grid */}
            <div className="relative" style={{ width: totalBeats * zoomX }}>
              {/* Grid Lines */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.2) 1px, transparent 1px)`,
                  backgroundSize: `${zoomX}px 100%`
                }}
              />
              {Array.from({ length: totalBeats + 1 }).map((_, i) => (
                <div 
                  key={`beat-vel-${i}`} 
                  className={`absolute top-0 bottom-0 w-px pointer-events-none ${i % 4 === 0 ? 'bg-white/20' : 'bg-transparent'}`}
                  style={{ left: i * zoomX }}
                />
              ))}

              {/* Playhead in Velocity */}
              <div 
                className="absolute top-0 bottom-0 w-px bg-cyan-400 z-10 opacity-50 pointer-events-none"
                style={{ left: currentBeat * zoomX }}
              />

              {/* Velocity Bars */}
              {activeTrack?.notes.map(note => {
                const left = note.start * zoomX;
                const barHeight = (note.velocity / 127) * (velocityHeight - 10);
                
                return (
                  <div
                    key={`vel-${note.id}`}
                    className="absolute bottom-0 w-2 ml-1 cursor-ns-resize group"
                    style={{
                      left,
                      height: velocityHeight
                    }}
                    onMouseDown={(e) => handleVelocityDrag(e, note.id)}
                  >
                    <div 
                      className="absolute bottom-0 w-full rounded-t-sm transition-colors group-hover:bg-white"
                      style={{
                        height: barHeight,
                        backgroundColor: activeTrack.color,
                      }}
                    >
                      <div className="w-full h-1 bg-white/50 absolute top-0 rounded-t-sm" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sustain Lane Row */}
          <div className="sticky bottom-0 z-30 flex bg-[#0A0B10] border-t border-white/10 shadow-[0_-5px_20px_rgba(0,0,0,0.5)] mt-1" style={{ height: 60 }}>
            {/* Sustain Header */}
            <div className="sticky left-0 z-40 w-16 bg-[#0F111A] border-r border-white/10 shrink-0 flex flex-col items-center justify-center shadow-[2px_0_10px_rgba(0,0,0,0.5)]">
              <span className="text-[9px] text-white/30 font-bold uppercase tracking-widest -rotate-90">Sustain</span>
            </div>
            
            {/* Sustain Grid */}
            <div className="relative" style={{ width: totalBeats * zoomX }}>
              {/* Grid Lines */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.2) 1px, transparent 1px)`,
                  backgroundSize: `${zoomX}px 100%`
                }}
              />
              {Array.from({ length: totalBeats + 1 }).map((_, i) => (
                <div 
                  key={`beat-sus-${i}`} 
                  className={`absolute top-0 bottom-0 w-px pointer-events-none ${i % 4 === 0 ? 'bg-white/20' : 'bg-transparent'}`}
                  style={{ left: i * zoomX }}
                />
              ))}

              {/* Playhead in Sustain */}
              <div 
                className="absolute top-0 bottom-0 w-px bg-cyan-400 z-10 opacity-50 pointer-events-none"
                style={{ left: currentBeat * zoomX }}
              />

              {/* Sustain Events */}
              {activeTrack?.sustainEvents?.map((ev, idx) => {
                const left = ev.time * zoomX;
                // If value >= 64, sustain is ON (draw a block until the next event)
                let width = 4;
                if (ev.value >= 64) {
                  const nextEv = activeTrack.sustainEvents?.[idx + 1];
                  const endTime = nextEv ? nextEv.time : totalBeats;
                  width = (endTime - ev.time) * zoomX;
                }
                
                if (ev.value < 64) return null; // Only draw the "ON" blocks

                return (
                  <div
                    key={`sus-${idx}`}
                    className="absolute bottom-0 h-4 rounded bg-purple-500/50 border border-purple-400 opacity-80"
                    style={{ left, width }}
                  />
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
