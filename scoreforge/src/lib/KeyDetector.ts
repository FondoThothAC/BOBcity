import { Score, Note } from '../types';

const NOTE_NAMES_ES = ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'];
const NOTE_NAMES_EN = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Perfiles tónicos Krumhansl-Schmuckler
const MAJOR_PROFILE = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const MINOR_PROFILE = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 2.69, 3.34, 3.17, 3.18];

function correlation(x: number[], y: number[]): number {
  const n = x.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
    sumXY += x[i] * y[i];
    sumX2 += x[i] * x[i];
    sumY2 += y[i] * y[i];
  }
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  return denominator === 0 ? 0 : numerator / denominator;
}

export interface DetectedKey {
  rootNote: string;
  scaleType: 'Major' | 'Minor';
  keyName: string;
  confidence: number;
}

export function detectKey(score: Score): DetectedKey {
  const pitchHistogram = new Array(12).fill(0);

  score.tracks.forEach(track => {
    if (track.isMuted) return;
    track.notes.forEach(note => {
      const pc = note.pitch % 12;
      const weight = note.duration * (note.velocity / 100);
      pitchHistogram[pc] += weight;
    });
  });

  let bestKey = { rootIndex: 0, isMajor: true, score: -1 };

  for (let root = 0; root < 12; root++) {
    // Rotar histograma según la raíz
    const rotatedHist = new Array(12);
    for (let i = 0; i < 12; i++) {
      rotatedHist[i] = pitchHistogram[(root + i) % 12];
    }

    const majScore = correlation(rotatedHist, MAJOR_PROFILE);
    if (majScore > bestKey.score) {
      bestKey = { rootIndex: root, isMajor: true, score: majScore };
    }

    const minScore = correlation(rotatedHist, MINOR_PROFILE);
    if (minScore > bestKey.score) {
      bestKey = { rootIndex: root, isMajor: false, score: minScore };
    }
  }

  const rootName = NOTE_NAMES_ES[bestKey.rootIndex];
  const rootNameEn = NOTE_NAMES_EN[bestKey.rootIndex];
  const scaleName = bestKey.isMajor ? 'Mayor' : 'Menor';
  const scaleNameEn = bestKey.isMajor ? 'Major' : 'Minor';

  return {
    rootNote: rootName,
    scaleType: bestKey.isMajor ? 'Major' : 'Minor',
    keyName: `${rootName} ${scaleName} (${rootNameEn} ${scaleNameEn})`,
    confidence: Math.min(100, Math.round(Math.max(0, bestKey.score) * 100))
  };
}

export function detectCurrentChord(activeNotes: Note[]): string {
  if (!activeNotes || activeNotes.length === 0) return 'Silencio';

  const pitchClasses = Array.from(new Set(activeNotes.map(n => n.pitch % 12))).sort((a, b) => a - b);
  if (pitchClasses.length === 1) {
    return `${NOTE_NAMES_ES[pitchClasses[0]]}`;
  }

  const root = pitchClasses[0];
  const rootName = NOTE_NAMES_ES[root];

  // Verificar intervalos desde la raíz
  const intervals = pitchClasses.map(p => (p - root + 12) % 12);
  
  if (intervals.includes(4) && intervals.includes(7)) return `${rootName} Mayor`;
  if (intervals.includes(3) && intervals.includes(7)) return `${rootName} Menor`;
  if (intervals.includes(4) && intervals.includes(7) && intervals.includes(10)) return `${rootName}7`;
  if (intervals.includes(4) && intervals.includes(7) && intervals.includes(11)) return `${rootName}maj7`;
  if (intervals.includes(3) && intervals.includes(7) && intervals.includes(10)) return `${rootName}m7`;

  return `${rootName} (${pitchClasses.map(p => NOTE_NAMES_ES[p]).join('-')})`;
}
