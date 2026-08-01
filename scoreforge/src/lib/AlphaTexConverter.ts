import { Score, Track, Note } from '../types';

/**
 * Mapeo de número de nota MIDI a nombre de nota AlphaTex (ej. 60 -> c4)
 */
const MIDI_NOTE_NAMES = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'];

export function midiNoteToAlphaTex(pitch: number): string {
  const octave = Math.floor(pitch / 12) - 1;
  const noteName = MIDI_NOTE_NAMES[pitch % 12];
  return `${noteName}${octave}`;
}

/**
 * Convierte un objeto Score y Track activo de ScoreForge a código de notación AlphaTex para AlphaTab.
 */
export function convertScoreToAlphaTex(score: Score, activeTrack?: Track): string {
  const bpm = score.bpm || 120;
  const timeSigNumerator = score.timeSignature ? score.timeSignature[0] : 4;
  const timeSigDenominator = score.timeSignature ? score.timeSignature[1] : 4;

  const safeTitle = (score.title || 'ScoreForge DAW').replace(/"/g, '');
  const safeArtist = (score.artist || 'Composición').replace(/"/g, '');

  let alphaTex = `\\title "${safeTitle}"\n`;
  alphaTex += `\\subtitle "${safeArtist}"\n`;
  alphaTex += `\\bpm ${bpm}\n`;
  alphaTex += `\\ts ${timeSigNumerator} ${timeSigDenominator}\n`;
  alphaTex += `.\n`;

  const trackToRender = activeTrack || (score.tracks && score.tracks.length > 0 ? score.tracks[0] : null);

  if (!trackToRender || !trackToRender.notes || trackToRender.notes.length === 0) {
    return alphaTex + `:4 c4 e4 g4 c5 |`;
  }

  // Filtrar y ordenar notas válidas dentro del rango estándar de notación
  const validNotes = trackToRender.notes
    .filter(n => n.pitch >= 21 && n.pitch <= 108)
    .sort((a, b) => a.start - b.start);

  if (validNotes.length === 0) {
    return alphaTex + `:4 c4 e4 g4 c5 |`;
  }

  // Limitar número de notas para garantizar renderizado instantáneo y fluido de AlphaTab
  const displayNotes = validNotes.slice(0, 150);

  let barTokens: string[] = [];
  let notesInMeasure = 0;

  displayNotes.forEach((note) => {
    const noteName = midiNoteToAlphaTex(note.pitch);
    
    let durPrefix = ':4';
    if (note.duration <= 0.25) durPrefix = ':16';
    else if (note.duration <= 0.5) durPrefix = ':8';
    else if (note.duration >= 2) durPrefix = ':2';
    else if (note.duration >= 4) durPrefix = ':1';

    barTokens.push(`${durPrefix} ${noteName}`);
    notesInMeasure++;

    if (notesInMeasure >= 4) {
      barTokens.push('|');
      notesInMeasure = 0;
    }
  });

  if (notesInMeasure > 0) {
    barTokens.push('|');
  }

  return alphaTex + ' ' + barTokens.join(' ');
}
