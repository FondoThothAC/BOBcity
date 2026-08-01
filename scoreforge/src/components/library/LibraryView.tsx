import React, { useState } from 'react';
import { useAppStore } from '../../store';
import { demoScores } from '../../lib/demos';
import { Score } from '../../types';
import { Music, Play, Plus, Search, Folder, FileMusic, Sparkles, Award } from 'lucide-react';

export const LibraryView: React.FC = () => {
  const { setScore, setViewMode } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'demos' | 'classics'>('classics');

  const publicMidiDemos = [
    { title: 'Undertale - Megalovania', file: '/MIDIlovania.mid', category: 'Game OST', bpm: 120 },
    { title: 'Undertale - ASGORE Theme', file: '/ASGORE.mid', category: 'Game OST', bpm: 115 },
    { title: 'Castlevania II - Bloody Tears', file: '/Bloody_Tears_DoS.mid', category: 'Game OST', bpm: 140 },
    { title: 'Metal Slug 3 - Desert Theme', file: '/Metal Slug 3 - Desert (MIDI).mid', category: 'Game OST', bpm: 130 },
    { title: 'Zelda Ocarina of Time - Title Theme', file: '/Ocarina_of_Time_-_Title_Theme.mid', category: 'Game OST', bpm: 90 },
    { title: 'Mortal Kombat - Main Theme', file: '/Mortal Kombat - Theme.mid', category: 'Game OST', bpm: 135 },
    { title: 'Super Mario - Final Bowser Theme', file: '/final-bowser-theme.mid', category: 'Game OST', bpm: 145 },
    { title: 'Elvis Presley - Can\'t Help Falling in Love', file: '/ELVIS_PRESLEY_-_I_cant_help_falling_in_love_1.mid', category: 'Classic', bpm: 75 },
    { title: 'F-Zero - Mute City', file: '/mute city.mid', category: 'Game OST', bpm: 160 },
  ];

  const filteredDemos = demoScores.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredClassics = publicMidiDemos.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectScore = (score: Score) => {
    setScore(score);
    setViewMode('editor');
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0A0B10] p-6 overflow-y-auto font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Music className="text-cyan-400 w-7 h-7" /> Score Library & Templates
          </h1>
          <p className="text-stone-400 text-sm">
            Explora partituras de demostración, clásicos en MIDI y plantillas compuestas por IA.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-500" />
          <input
            type="text"
            placeholder="Buscar partitura o artista..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#12141F] border border-stone-800 rounded-lg text-sm text-white placeholder-stone-500 focus:outline-none focus:border-cyan-500 transition"
          />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-stone-800 mb-6 gap-6">
        <button
          onClick={() => setActiveTab('classics')}
          className={`pb-3 text-sm font-medium transition flex items-center gap-2 border-b-2 ${
            activeTab === 'classics'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-stone-400 hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" /> Clásicos & Videojuegos ({publicMidiDemos.length})
        </button>
        <button
          onClick={() => setActiveTab('demos')}
          className={`pb-3 text-sm font-medium transition flex items-center gap-2 border-b-2 ${
            activeTab === 'demos'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-stone-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" /> Plantillas IA Generativas ({demoScores.length})
        </button>
      </div>

      {/* Grid Content */}
      {activeTab === 'classics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClassics.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#12141F] border border-stone-800/80 hover:border-cyan-500/50 rounded-xl p-4 transition group flex flex-col justify-between hover:shadow-lg hover:shadow-cyan-500/5"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {item.category}
                  </span>
                  <span className="text-xs text-stone-500">{item.bpm} BPM</span>
                </div>
                <h3 className="font-semibold text-white group-hover:text-cyan-400 transition text-base mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-stone-400 flex items-center gap-1">
                  <FileMusic className="w-3.5 h-3.5 text-stone-500" /> Archivo MIDI de alta fidelidad
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-800/60 flex justify-between items-center">
                <span className="text-xs text-stone-500">MIDI Direct</span>
                <a
                  href={item.file}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
                >
                  <Play className="w-3.5 h-3.5 fill-black" /> Abrir MIDI
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'demos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDemos.map((score) => (
            <div
              key={score.id}
              onClick={() => handleSelectScore(score)}
              className="bg-[#12141F] border border-stone-800/80 hover:border-cyan-500/50 rounded-xl p-4 cursor-pointer transition group flex flex-col justify-between hover:shadow-lg hover:shadow-cyan-500/5"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    {score.tracks.length} Pistas
                  </span>
                  <span className="text-xs text-stone-500">{score.bpm} BPM</span>
                </div>
                <h3 className="font-semibold text-white group-hover:text-cyan-400 transition text-base mb-1">
                  {score.title}
                </h3>
                <p className="text-xs text-stone-400">{score.artist}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-800/60 flex justify-between items-center">
                <span className="text-xs text-stone-500">ScoreForge Composition</span>
                <button
                  onClick={() => handleSelectScore(score)}
                  className="px-3 py-1.5 bg-stone-800 group-hover:bg-cyan-500 group-hover:text-black text-stone-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
                >
                  <Play className="w-3.5 h-3.5" /> Cargar en Editor
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
