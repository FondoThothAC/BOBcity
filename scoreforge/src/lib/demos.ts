import { Score, Track } from '../types';

export const generateDemos = (): Score[] => {
  const demos: Score[] = [];

  const instruments: ('piano' | 'guitar' | 'bass' | 'drums' | 'strings' | 'synth pad')[] = 
    ['piano', 'guitar', 'bass', 'strings', 'synth pad'];

  // Some basic scales/chords to use for generating content
  const chords = [
    [60, 64, 67], // C major
    [65, 69, 72], // F major
    [67, 71, 74], // G major
    [57, 60, 64], // A minor
    [62, 65, 69], // D minor
    [64, 67, 71], // E minor
  ];

  for (let i = 1; i <= 20; i++) {
    const isArpeggio = i % 2 === 0;
    const isChords = i % 3 === 0;
    
    const bpm = 90 + (i * 5) % 60; // 90 to 145
    const inst1 = instruments[i % instruments.length];
    const inst2 = instruments[(i + 1) % instruments.length];

    const tracks: Track[] = [];

    // Track 1
    const track1: Track = {
      id: `demo-${i}-track-1`,
      name: `Melody ${i}`,
      instrument: inst1,
      color: '#22d3ee',
      isMuted: false,
      isSolo: false,
      notes: [],
    };

    // Track 2
    const track2: Track = {
      id: `demo-${i}-track-2`,
      name: `Harmony ${i}`,
      instrument: inst2,
      color: '#4ade80',
      isMuted: false,
      isSolo: false,
      notes: [],
    };

    let time = 0;
    for (let c = 0; c < 4; c++) {
      const chord = chords[(i + c) % chords.length];
      
      if (isArpeggio) {
        // Arpeggiated melody
        for (let j = 0; j < 4; j++) {
          track1.notes.push({
            id: `n1-${c}-${j}`,
            pitch: chord[j % chord.length] + 12,
            start: time + (j * 0.5),
            duration: 0.5,
            velocity: 90 + Math.random() * 20
          });
        }
      } else {
        // Block melody
        track1.notes.push({
          id: `n1-${c}`,
          pitch: chord[1] + 12,
          start: time,
          duration: 1,
          velocity: 100
        });
        track1.notes.push({
          id: `n1b-${c}`,
          pitch: chord[2] + 12,
          start: time + 1,
          duration: 1,
          velocity: 90
        });
      }

      if (isChords) {
        // Block chords
        chord.forEach((note, j) => {
          track2.notes.push({
            id: `n2-${c}-${j}`,
            pitch: note - 12,
            start: time,
            duration: 2,
            velocity: 70
          });
        });
      } else {
        // Simple bass
        track2.notes.push({
          id: `n2-${c}`,
          pitch: chord[0] - 24,
          start: time,
          duration: 2,
          velocity: 80
        });
      }

      time += 2;
    }

    tracks.push(track1);
    tracks.push(track2);

    demos.push({
      id: `demo-score-${i}`,
      title: `Demo Composition ${i}`,
      artist: 'AI Composer',
      bpm,
      timeSignature: [4, 4],
      tracks
    });
  }

  return demos;
};

export const demoScores = generateDemos();
