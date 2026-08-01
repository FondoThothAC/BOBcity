import React, { useState, useEffect } from 'react';
import { Search, Heart, MessageSquare, Share2, Play, Square, Check, Music } from 'lucide-react';
import { useAppStore } from '../../store';
import { translations } from '../../locales';
import { audioEngine } from '../../lib/AudioEngine';
import { demoScores } from '../../lib/demos';

interface CatalogMidi {
  id: number;
  title: string;
  artist: string;
  genre: string;
  tags: string[];
  url?: string;
  score?: any;
  likes: number;
  comments: number;
}

export const CommunityFeed: React.FC = () => {
  const { language, setScore, setViewMode } = useAppStore();
  const t = translations[language];
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [playingPreviewId, setPlayingPreviewId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState('popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingMidiId, setLoadingMidiId] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      if (playingPreviewId !== null) {
        audioEngine.stop();
      }
    };
  }, [playingPreviewId]);

  const catalogPosts: CatalogMidi[] = [
    {
      id: 1,
      title: 'Castlevania II - Bloody Tears',
      artist: 'Konami / VGM',
      genre: 'VGM / Metal',
      tags: ['Castlevania', 'Rock', 'MIDI'],
      url: '/midis/Bloody_Tears_DoS.mid',
      likes: 1420,
      comments: 94
    },
    {
      id: 2,
      title: "Can't Help Falling in Love",
      artist: 'Elvis Presley',
      genre: 'Balada / Clásica',
      tags: ['Elvis', 'Romántica', 'Piano'],
      url: '/midis/ELVIS_PRESLEY_-_I_cant_help_falling_in_love_1.mid',
      likes: 1280,
      comments: 73
    },
    {
      id: 3,
      title: 'Mortal Kombat Theme',
      artist: 'The Immortals',
      genre: 'Electrónica / Synth',
      tags: ['Mortal Kombat', 'Synth', '90s'],
      url: '/midis/Mortal Kombat - Theme.mid',
      likes: 980,
      comments: 51
    },
    {
      id: 4,
      title: 'Zelda: Ocarina of Time - Title Theme',
      artist: 'Koji Kondo / Nintendo',
      genre: 'VGM / Orquestal',
      tags: ['Zelda', 'Nintendo', 'Ocarina'],
      url: '/midis/Ocarina_of_Time_-_Title_Theme.mid',
      likes: 1650,
      comments: 112
    },
    {
      id: 5,
      title: 'Undertale - Megalovania',
      artist: 'Toby Fox',
      genre: 'VGM / Rock',
      tags: ['Undertale', 'Sans', 'Boss Theme'],
      url: '/midis/MIDIlovania.mid',
      likes: 2100,
      comments: 180
    },
    {
      id: 6,
      title: 'Undertale - ASGORE',
      artist: 'Toby Fox',
      genre: 'VGM / Orquestal',
      tags: ['Undertale', 'Asgore', 'Metal'],
      url: '/midis/ASGORE.mid',
      likes: 890,
      comments: 45
    },
    {
      id: 7,
      title: 'Metal Slug 3 - Desert Theme',
      artist: 'SNK',
      genre: 'VGM / Arcade',
      tags: ['Metal Slug', 'Arcade', 'Action'],
      url: '/midis/Metal Slug 3 - Desert (MIDI).mid',
      likes: 740,
      comments: 38
    },
    {
      id: 8,
      title: 'F-Zero - Mute City',
      artist: 'Nintendo',
      genre: 'VGM / Speed Metal',
      tags: ['F-Zero', 'Racing', 'Synth'],
      url: '/midis/mute city.mid',
      likes: 1120,
      comments: 62
    },
    {
      id: 9,
      title: 'Super Mario - Final Bowser Theme',
      artist: 'Koji Kondo / Nintendo',
      genre: 'VGM / Epic Orquestal',
      tags: ['Mario', 'Boss', 'Epic'],
      url: '/midis/final-bowser-theme.mid',
      likes: 950,
      comments: 41
    },
    {
      id: 10,
      title: 'Composición de Ejemplo (Polyphia Style)',
      artist: 'AI Studio Composer',
      genre: 'Progressive Rock',
      tags: ['Demo', 'DAW', 'Preset'],
      score: demoScores[0],
      likes: 530,
      comments: 18
    }
  ];

  const filteredPosts = catalogPosts.filter(post => {
    const query = searchQuery.toLowerCase();
    return post.title.toLowerCase().includes(query) ||
           post.artist.toLowerCase().includes(query) ||
           post.genre.toLowerCase().includes(query) ||
           post.tags.some(tag => tag.toLowerCase().includes(query));
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === 'popular') return b.likes - a.likes;
    if (sortBy === 'newest') return b.id - a.id;
    if (sortBy === 'alphabetical') return a.title.localeCompare(b.title);
    return 0;
  });

  const handleShare = async (e: React.MouseEvent, postId: number) => {
    e.stopPropagation();
    try {
      const url = `${window.location.origin}${window.location.pathname}?post=${postId}`;
      await navigator.clipboard.writeText(url);
      setCopiedId(postId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Carga de Canción en la DAW / Editor de ScoreForge
  const handleLoadSongToEditor = async (post: CatalogMidi) => {
    setLoadingMidiId(post.id);
    try {
      if (post.url) {
        const res = await fetch(encodeURI(post.url));
        const arrayBuffer = await res.arrayBuffer();
        const file = new File([arrayBuffer], `${post.title}.mid`, { type: 'audio/midi' });
        const parsedScore = await audioEngine.parseMidiFile(file);
        parsedScore.title = post.title;
        parsedScore.artist = post.artist;
        setScore(parsedScore);
      } else if (post.score) {
        setScore(post.score);
      }
      setViewMode('editor');
    } catch (err) {
      console.error("Error al cargar canción MIDI:", err);
      alert("No se pudo cargar el archivo MIDI en la DAW.");
    } finally {
      setLoadingMidiId(null);
    }
  };

  const togglePreview = async (e: React.MouseEvent, post: CatalogMidi) => {
    e.stopPropagation();
    if (playingPreviewId === post.id) {
      audioEngine.stop();
      setPlayingPreviewId(null);
    } else {
      audioEngine.stop();
      if (post.url) {
        try {
          const res = await fetch(encodeURI(post.url));
          const arrayBuffer = await res.arrayBuffer();
          const file = new File([arrayBuffer], `${post.title}.mid`, { type: 'audio/midi' });
          const parsedScore = await audioEngine.parseMidiFile(file);
          audioEngine.playScore(parsedScore);
          setPlayingPreviewId(post.id);
        } catch (err) {
          console.error("Preview error:", err);
        }
      } else if (post.score) {
        audioEngine.playScore(post.score);
        setPlayingPreviewId(post.id);
      }
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-transparent p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-light tracking-tight text-white">Catálogo & Librería MIDI ScoreForge</h2>
            <p className="text-xs text-stone-400 mt-1">
              Selecciona una canción para editar sus notas en el Piano Roll, Pentagrama y Mástil.
            </p>
          </div>
          
          <div className="flex items-center gap-4 flex-wrap">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
            >
              <option value="popular" className="bg-[#1a1c23]">Más Populares</option>
              <option value="newest" className="bg-[#1a1c23]">Más Recientes</option>
              <option value="alphabetical" className="bg-[#1a1c23]">Alfabético</option>
            </select>

            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input 
                type="text" 
                placeholder="Buscar canciones, MIDI o géneros..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 w-64 transition-colors placeholder:text-white/30"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {sortedPosts.map((post) => (
            <div 
              key={post.id} 
              onClick={() => handleLoadSongToEditor(post)}
              className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-cyan-500/40 transition-all group cursor-pointer shadow-lg shadow-black/20 relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-1 group-hover:text-cyan-400 transition-colors flex items-center gap-2">
                    <Music className="w-5 h-5 text-cyan-400" />
                    {post.title}
                  </h3>
                  <p className="text-white/50 text-sm">por <span className="text-purple-400 font-medium">{post.artist}</span></p>
                </div>
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={(e) => togglePreview(e, post)}
                    className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 hover:bg-cyan-500 hover:text-[#05060A] transition-colors"
                    title="Vista Previa de Audio"
                  >
                    {playingPreviewId === post.id ? (
                      <Square className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-5 h-5 ml-1 fill-current" />
                    )}
                  </button>

                  <button 
                    onClick={() => handleLoadSongToEditor(post)}
                    className="px-4 py-2 rounded-lg bg-cyan-500 text-black font-bold text-xs hover:bg-cyan-400 transition-colors shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                  >
                    {loadingMidiId === post.id ? 'Cargando...' : 'Abrir en DAW ⚡'}
                  </button>
                </div>
              </div>

              <div className="flex gap-2 mb-4 flex-wrap">
                <span className="px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-wider">
                  {post.genre}
                </span>
                {post.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 rounded bg-white/10 text-white/70 text-[10px] font-bold uppercase tracking-wider">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-6 text-sm text-white/40">
                <button className="flex items-center gap-1.5 hover:text-pink-400 transition-colors">
                  <Heart className="w-4 h-4" /> {post.likes}
                </button>
                <button className="flex items-center gap-1.5 hover:text-white transition-colors">
                  <MessageSquare className="w-4 h-4" /> {post.comments}
                </button>
                <button 
                  className={`flex items-center gap-1.5 transition-colors ml-auto ${copiedId === post.id ? 'text-green-400' : 'hover:text-white'}`}
                  onClick={(e) => handleShare(e, post.id)}
                >
                  {copiedId === post.id ? (
                    <>
                      <Check className="w-4 h-4" /> ¡Enlace Copiado!
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" /> Compartir
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
