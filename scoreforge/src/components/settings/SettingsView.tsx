import React, { useState } from 'react';
import { useAppStore } from '../../store';
import { Settings, Volume2, Sliders, Globe, Cpu, Music2, ShieldCheck, Check } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { language, setLanguage, playbackSpeed, setPlaybackSpeed } = useAppStore();
  const [masterVolume, setMasterVolume] = useState<number>(90);
  const [selectedSoundfont, setSelectedSoundfont] = useState<string>('Sonivox General MIDI (.sf2)');
  const [latencyMode, setLatencyMode] = useState<'low' | 'balanced' | 'safe'>('balanced');
  const [notationSystem, setNotationSystem] = useState<'latin' | 'english'>('latin');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0A0B10] p-6 overflow-y-auto font-sans max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="text-cyan-400 w-7 h-7" /> Ajustes del Motor de Audio & Render
        </h1>
        <p className="text-stone-400 text-sm">
          Configura los parámetros del sintetizador Soundfont, latencia MIDI y notación musical.
        </p>
      </div>

      <div className="space-y-6">
        {/* Audio Engine Configuration */}
        <div className="bg-[#12141F] border border-stone-800 rounded-xl p-5">
          <h2 className="text-base font-semibold text-white flex items-center gap-2 mb-4">
            <Volume2 className="w-5 h-5 text-cyan-400" /> Sintetizador & Soundfont
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs text-stone-400 mb-1 font-medium">Volumen Maestro ({masterVolume}%)</label>
              <input
                type="range"
                min="0"
                max="100"
                value={masterVolume}
                onChange={(e) => setMasterVolume(Number(e.target.value))}
                className="w-full accent-cyan-400 bg-stone-800 rounded-lg h-2"
              />
            </div>

            <div>
              <label className="block text-xs text-stone-400 mb-1 font-medium">Banco Soundfont SF2 Activo</label>
              <select
                value={selectedSoundfont}
                onChange={(e) => setSelectedSoundfont(e.target.value)}
                className="w-full bg-[#0A0B10] border border-stone-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Sonivox General MIDI (.sf2)">Sonivox General MIDI (.sf2) [Predeterminado]</option>
                <option value="FluidR3 GM SoundFont">FluidR3 GM SoundFont (Alta Fidelidad)</option>
                <option value="GeneralUser GS SoundFont">GeneralUser GS SoundFont</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-stone-400 mb-1 font-medium">Modo de Latencia de Audio</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'low', name: 'Ultra Baja (10ms)', desc: 'Para interpretación MIDI en tiempo real' },
                  { id: 'balanced', name: 'Balanceado (25ms)', desc: 'Recomendado para la mayoría de sistemas' },
                  { id: 'safe', name: 'Seguro (50ms)', desc: 'Evita saltos en computadoras de bajos recursos' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setLatencyMode(mode.id as any)}
                    className={`p-3 rounded-lg border text-left transition ${
                      latencyMode === mode.id
                        ? 'border-cyan-500 bg-cyan-500/10 text-white'
                        : 'border-stone-800 bg-[#0A0B10] text-stone-400 hover:border-stone-700'
                    }`}
                  >
                    <div className="text-xs font-semibold text-cyan-400">{mode.name}</div>
                    <div className="text-[11px] text-stone-500 mt-0.5">{mode.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Notation & Language Configuration */}
        <div className="bg-[#12141F] border border-stone-800 rounded-xl p-5">
          <h2 className="text-base font-semibold text-white flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-cyan-400" /> Idioma & Notación Musical
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-stone-400 mb-1 font-medium">Idioma de la Interfaz</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="w-full bg-[#0A0B10] border border-stone-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="es">Español Neutro (América Latina)</option>
                <option value="en">English (United States)</option>
                <option value="de">Deutsch</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-stone-400 mb-1 font-medium">Nomenclatura de Notas</label>
              <select
                value={notationSystem}
                onChange={(e) => setNotationSystem(e.target.value as any)}
                className="w-full bg-[#0A0B10] border border-stone-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="latin">Solfeo Latino (Do, Re, Mi, Fa, Sol, La, Si)</option>
                <option value="english">Cifrado Anglosajón (C, D, E, F, G, A, B)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex justify-end items-center gap-3">
          {savedSuccess && (
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <Check className="w-4 h-4" /> Ajustes guardados correctamente
            </span>
          )}
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-sm rounded-lg transition flex items-center gap-2"
          >
            Guardar Configuración
          </button>
        </div>
      </div>
    </div>
  );
};
