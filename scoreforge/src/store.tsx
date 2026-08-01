import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Score, ViewMode, Language, Track, Note } from './types';
import { audioEngine } from './lib/AudioEngine';

interface AppState {
  score: Score;
  setScore: (score: Score) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  activeTrackId: string;
  setActiveTrackId: (id: string) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  playbackSpeed: number;
  setPlaybackSpeed: (speed: number) => void;
  transpositionSemitones: number;
  transposeScore: (semitones: number) => void;
  selectedNoteIds: string[];
  setSelectedNoteIds: (ids: string[] | ((prev: string[]) => string[])) => void;
  deleteSelectedNotes: () => void;
  addNote: (trackId: string, note: Omit<Note, 'id'>) => void;
  removeNote: (trackId: string, noteId: string) => void;
  updateNote: (trackId: string, noteId: string, updates: Partial<Note>, commit?: boolean) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const defaultScore: Score = {
  id: 'new-score',
  title: 'Untitled Composition',
  artist: 'Unknown Artist',
  bpm: 120,
  timeSignature: [4, 4],
  tracks: [
    {
      id: 'track-1',
      name: 'Lead Melody',
      instrument: 'piano',
      color: '#22d3ee',
      isMuted: false,
      isSolo: false,
      volume: 100,
      notes: [
        { id: 'n1', pitch: 72, start: 0, duration: 0.5, velocity: 100 },
        { id: 'n2', pitch: 76, start: 0.5, duration: 0.5, velocity: 100 },
        { id: 'n3', pitch: 79, start: 1, duration: 0.5, velocity: 100 },
        { id: 'n4', pitch: 84, start: 1.5, duration: 0.5, velocity: 100 },
        { id: 'n5', pitch: 79, start: 2, duration: 0.5, velocity: 100 },
        { id: 'n6', pitch: 76, start: 2.5, duration: 0.5, velocity: 100 },
        { id: 'n7', pitch: 72, start: 3, duration: 1, velocity: 100 },
      ],
    },
    {
      id: 'track-2',
      name: 'Chords',
      instrument: 'piano',
      color: '#4ade80',
      isMuted: false,
      isSolo: false,
      volume: 90,
      notes: [
        { id: 'n8', pitch: 48, start: 0, duration: 2, velocity: 80 },
        { id: 'n9', pitch: 52, start: 0, duration: 2, velocity: 80 },
        { id: 'n10', pitch: 55, start: 0, duration: 2, velocity: 80 },
        { id: 'n11', pitch: 43, start: 2, duration: 2, velocity: 80 },
        { id: 'n12', pitch: 47, start: 2, duration: 2, velocity: 80 },
        { id: 'n13', pitch: 50, start: 2, duration: 2, velocity: 80 },
      ],
    }
  ]
};

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [score, setScore] = useState<Score>(defaultScore);
  const [viewMode, setViewMode] = useState<ViewMode>('editor');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [language, setLanguage] = useState<Language>('es');
  const [activeTrackId, setActiveTrackId] = useState<string>(defaultScore.tracks[0].id);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeedState] = useState<number>(1.0);
  const [transpositionSemitones, setTranspositionSemitones] = useState<number>(0);
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);

  const [history, setHistory] = useState<Score[]>([defaultScore]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const setScoreAndHistory = (newScore: Score | ((prev: Score) => Score)) => {
    setScore(prev => {
      const updatedScore = typeof newScore === 'function' ? newScore(prev) : newScore;
      
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(updatedScore);
      
      if (newHistory.length > 50) {
        newHistory.shift();
      } else {
        setHistoryIndex(newHistory.length - 1);
      }
      
      setHistory(newHistory);
      return updatedScore;
    });
  };

  const setPlaybackSpeed = (speed: number) => {
    setPlaybackSpeedState(speed);
    audioEngine.setPlaybackSpeed(speed);
  };

  const transposeScore = (semitones: number) => {
    setTranspositionSemitones(prev => prev + semitones);
    setScoreAndHistory(prev => ({
      ...prev,
      tracks: prev.tracks.map(t => ({
        ...t,
        notes: t.notes.map(n => ({
          ...n,
          pitch: Math.max(0, Math.min(127, n.pitch + semitones))
        }))
      }))
    }));
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setScore(history[newIndex]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setScore(history[newIndex]);
    }
  };

  const addNote = (trackId: string, note: Omit<Note, 'id'>) => {
    setScoreAndHistory(prev => ({
      ...prev,
      tracks: prev.tracks.map(t => {
        if (t.id === trackId) {
          return {
            ...t,
            notes: [...t.notes, { ...note, id: `note-${Date.now()}-${Math.random()}` }]
          };
        }
        return t;
      })
    }));
  };

  const removeNote = (trackId: string, noteId: string) => {
    setScoreAndHistory(prev => ({
      ...prev,
      tracks: prev.tracks.map(t => {
        if (t.id === trackId) {
          return {
            ...t,
            notes: t.notes.filter(n => n.id !== noteId)
          };
        }
        return t;
      })
    }));
  };

  const updateNote = (trackId: string, noteId: string, updates: Partial<Note>, commit: boolean = true) => {
    if (commit) {
      setScoreAndHistory(prev => ({
        ...prev,
        tracks: prev.tracks.map(t => {
          if (t.id === trackId) {
            return {
              ...t,
              notes: t.notes.map(n => n.id === noteId ? { ...n, ...updates } : n)
            };
          }
          return t;
        })
      }));
    } else {
      setScore(prev => ({
        ...prev,
        tracks: prev.tracks.map(t => {
          if (t.id === trackId) {
            return {
              ...t,
              notes: t.notes.map(n => n.id === noteId ? { ...n, ...updates } : n)
            };
          }
          return t;
        })
      }));
    }
  };

  const deleteSelectedNotes = () => {
    if (selectedNoteIds.length === 0) return;
    setScoreAndHistory(prev => ({
      ...prev,
      tracks: prev.tracks.map(t => ({
        ...t,
        notes: t.notes.filter(n => !selectedNoteIds.includes(n.id))
      }))
    }));
    setSelectedNoteIds([]);
  };

  // Conectar el getter de score vivo al AudioEngine en cada render
  useEffect(() => {
    audioEngine.getLiveScore = () => score;
  });

  useEffect(() => {
    if (isPlaying) {
      audioEngine.playScore(score);
    } else {
      audioEngine.stopAll();
    }
  }, [isPlaying]);

  return (
    <AppContext.Provider value={{
      score, setScore: setScoreAndHistory,
      viewMode, setViewMode,
      sidebarCollapsed, setSidebarCollapsed,
      language, setLanguage,
      activeTrackId, setActiveTrackId,
      isPlaying, setIsPlaying,
      playbackSpeed, setPlaybackSpeed,
      transpositionSemitones, transposeScore,
      selectedNoteIds, setSelectedNoteIds,
      deleteSelectedNotes,
      addNote, removeNote, updateNote,
      undo, redo,
      canUndo: historyIndex > 0,
      canRedo: historyIndex < history.length - 1
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
};
