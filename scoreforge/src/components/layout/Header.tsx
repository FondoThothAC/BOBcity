import React, { useRef, useMemo } from 'react';
import { Play, Pause, Square, Cloud, Download, Upload, Cpu, Music, Key, Gauge, ArrowUpDown } from 'lucide-react';
import { useAppStore } from '../../store';
import { translations } from '../../locales';
import { Language } from '../../types';
import { audioEngine } from '../../lib/AudioEngine';
import { detectKey } from '../../lib/KeyDetector';

export const Header: React.FC = () => {
  const { 
    score, setScore, isPlaying, setIsPlaying, language, setLanguage,
    playbackSpeed, setPlaybackSpeed, transpositionSemitones, transposeScore
  } = useAppStore();
  const t = translations[language];
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Detección automática del Tono Base utilizando el algoritmo Krumhansl-Schmuckler
  const detectedKeyInfo = useMemo(() => detectKey(score), [score]);

  // Manejador de importación de archivos MIDI
  const handleImportMidi = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsedScore = await audioEngine.parseMidiFile(file);
      setScore(parsedScore);
    } catch (err) {
      console.error("Error al importar MIDI:", err);
      alert("No se pudo procesar el archivo MIDI ingresado.");
    }
  };

  // Manejador de exportación a archivo audio WAV
  const handleExportWav = async () => {
    try {
      const wavBlob = await audioEngine.exportWav(score);
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${score.title.replace(/[^a-zA-Z0-9]/g, '_')}_ScoreForge.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error al exportar WAV:", err);
      alert("Error durante la síntesis y exportación de WAV.");
    }
  };

  return (
    <header className="h-14 border-b border-white/10 bg-[#0F111A] flex items-center justify-between px-4 sm:px-6 shrink-0 sticky top-0 z-10 text-white/70 flex-wrap gap-2">
      {/* Input Oculto para Selección de Archivos MIDI */}
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept=".mid,.midi" 
        onChange={handleImportMidi} 
      />

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-cyan-400" />
          <h1 className="text-base sm:text-lg font-semibold text-white tracking-tight truncate max-w-[200px] sm:max-w-[280px]">
            {score.title}
          </h1>
        </div>

        {/* Tono Base Detectado */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold" title="Tono base detectado automáticamente">
          <Key className="w-3.5 h-3.5 text-purple-400" />
          <span>Tono: {detectedKeyInfo.rootNote} {detectedKeyInfo.scaleType === 'Major' ? 'Mayor' : 'Menor'}</span>
        </div>
      </div>

      {/* Controles Principales de Transporte, Velocidad y Transposición */}
      <div className="flex items-center gap-3 bg-white/5 rounded-full px-4 py-1 border border-white/10">
        <button className="p-1.5 hover:text-cyan-400 transition-colors" title={t.stop} onClick={() => setIsPlaying(false)}>
          <Square className="w-4 h-4 fill-current" />
        </button>
        <button 
          className="p-1.5 hover:text-cyan-400 transition-colors text-white" 
          title={isPlaying ? t.pause : t.play}
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
        </button>
        
        <div className="w-px h-5 bg-white/10" />

        {/* Selector de Velocidad de Reproducción */}
        <div className="flex items-center gap-1 text-xs" title="Velocidad de reproducción">
          <Gauge className="w-3.5 h-3.5 text-cyan-400" />
          <select
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
            className="bg-[#1a1c23] border border-white/10 rounded px-1.5 py-0.5 text-xs text-cyan-400 font-bold outline-none cursor-pointer hover:border-cyan-500/50"
          >
            <option value="0.25">0.25x</option>
            <option value="0.5">0.5x</option>
            <option value="0.75">0.75x</option>
            <option value="1">1.0x (Normal)</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
            <option value="2.0">2.0x</option>
          </select>
        </div>

        <div className="w-px h-5 bg-white/10" />

        {/* Controles de Transposición de Tono */}
        <div className="flex items-center gap-1 text-xs" title="Transposición de Tono (Semitonos)">
          <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
          <button 
            onClick={() => transposeScore(-1)}
            className="px-1.5 py-0.5 bg-white/10 hover:bg-white/20 rounded font-bold text-white text-[11px]"
            title="Bajar 1 semitono"
          >
            -1
          </button>
          <span className="text-amber-300 font-bold px-1 min-w-[28px] text-center">
            {transpositionSemitones > 0 ? `+${transpositionSemitones}` : transpositionSemitones} st
          </span>
          <button 
            onClick={() => transposeScore(1)}
            className="px-1.5 py-0.5 bg-white/10 hover:bg-white/20 rounded font-bold text-white text-[11px]"
            title="Subir 1 semitono"
          >
            +1
          </button>
        </div>

        <div className="w-px h-5 bg-white/10" />
        
        <div className="flex items-center gap-1 text-xs font-mono">
          <span className="text-white/40">{t.bpm}</span>
          <span className="text-cyan-400 w-8 text-right font-bold">{Math.round(score.bpm * playbackSpeed)}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="hidden md:flex items-center gap-1.5 text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/20">
          <Cpu className="w-3.5 h-3.5" />
          <span>{t.aiAnalysis}</span>
        </button>
      
        <div className="flex items-center gap-2.5 text-white/50">
          <button 
            className="hover:text-cyan-400 transition-colors" 
            title="Importar Archivo MIDI"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4" />
          </button>

          <button 
            className="hover:text-cyan-400 transition-colors" 
            title="Exportar Audio WAV"
            onClick={handleExportWav}
          >
            <Download className="w-4 h-4" />
          </button>

          <div className="hidden lg:flex items-center gap-1 text-xs text-white/40">
            <Cloud className="w-3.5 h-3.5" />
            <span>{t.synced}</span>
          </div>
        </div>
        
        <div className="w-px h-5 bg-white/10" />
        
        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value as Language)}
          className="bg-transparent text-sm text-white/50 focus:outline-none cursor-pointer hover:text-white"
        >
          <option value="es">ES</option>
          <option value="en">EN</option>
        </select>
      </div>
    </header>
  );
};
