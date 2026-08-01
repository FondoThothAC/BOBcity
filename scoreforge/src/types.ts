export type Language = 'en' | 'es';

export interface Note {
  id: string;
  pitch: number; // MIDI note number (e.g., 60 = Middle C)
  start: number; // Start time in beats
  duration: number; // Duration in beats
  velocity: number; // 0-127
}

export interface Track {
  id: string;
  name: string;
  instrument: 'piano' | 'guitar' | 'bass' | 'drums' | 'strings' | 'synth pad';
  notes: Note[];
  color: string;
  isMuted: boolean;
  isSolo: boolean;
  volume?: number; // 0 to 100 (Default 100)
  sustainEvents?: { time: number; value: number }[];
}

export interface Score {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  timeSignature: [number, number];
  tracks: Track[];
}

export type ViewMode = 'editor' | 'community' | 'library' | 'settings';
export type EditorSplit = 'notation' | 'piano-roll' | 'fretboard';
