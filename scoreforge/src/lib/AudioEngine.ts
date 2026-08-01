import { Score, Track, Note } from '../types';
import { Midi } from '@tonejs/midi';

/**
 * Motor de audio WebAudio API mejorado:
 * - Multi-oscilador por instrumento (hasta 3 osciladores para riqueza armónica)
 * - Compresor dinámico global
 * - Reverberación convolutiva (syntética con ruido filtrado)
 * - Lookahead Scheduler (ventana de 3 segundos / 100ms)
 * - Callback onNoteStart para efectos visuales tipo Guitar Hero
 */
export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private reverbNode: ConvolverNode | null = null;
  private reverbGain: GainNode | null = null;
  private dryGain: GainNode | null = null;
  private activeNodes: Map<string, { oscs: OscillatorNode[]; gain: GainNode }> = new Map();
  private scheduledNoteIds: Set<string> = new Set();
  private _startTime: number = 0;
  private _isPlaying: boolean = false;
  private _isLooping: boolean = false;
  private _pauseTime: number = 0;
  private _loopStart: number = 0;
  private _loopEnd: number = 1000;
  private _playbackSpeed: number = 1.0;
  private currentScore: Score | null = null;
  private checkInterval: number | null = null;

  // Callback para efecto visual Guitar Hero
  public onNoteStart?: (pitch: number, instrument: string, trackColor: string) => void;

  // Función para obtener el score vivo (con mute/solo/volume actualizados desde React)
  public getLiveScore?: () => Score | null;

  init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass();

    // Compresor dinámico global (evita clipping en canciones densas)
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -18;
    this.compressor.knee.value = 8;
    this.compressor.ratio.value = 6;
    this.compressor.attack.value = 0.005;
    this.compressor.release.value = 0.15;

    // Ganancia maestra
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.72;

  // Cadena: compressor → masterGain → destination
    this.compressor.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);

    // Reverb sintético (impulse de ruido filtrado con filtro de paso alto)
    this._createReverb();
  }

  private _createReverb() {
    if (!this.ctx || !this.compressor) return;
    const sampleRate = this.ctx.sampleRate;
    const length = sampleRate * 1.5; // 1.5 segundos de reverb
    const impulse = this.ctx.createBuffer(2, length, sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.5);
      }
    }
    this.reverbNode = this.ctx.createConvolver();
    this.reverbNode.buffer = impulse;

    this.reverbGain = this.ctx.createGain();
    this.reverbGain.gain.value = 0.18; // Mezcla de reverb (18%)

    this.dryGain = this.ctx.createGain();
    this.dryGain.gain.value = 1.0; // Señal seca (100%)

    // Fuente → dryGain → compressor (señal seca)
    // Fuente → reverbNode → reverbGain → compressor (reverb)
    this.reverbNode.connect(this.reverbGain);
    this.reverbGain.connect(this.compressor);
  }

  setPlaybackSpeed(speed: number) {
    this._playbackSpeed = Math.max(0.25, Math.min(3.0, speed));
  }

  get playbackSpeed() { return this._playbackSpeed; }

  setLooping(looping: boolean, startBeat: number = 0, endBeat: number = 1000) {
    this._isLooping = looping;
    this._loopStart = startBeat;
    this._loopEnd = endBeat;
  }

  get isPlaying() { return this._isPlaying; }
  get isLooping() { return this._isLooping; }

  midiToFreq(midiNote: number) {
    return 440 * Math.pow(2, (midiNote - 69) / 12);
  }

  async parseMidiFile(file: File): Promise<Score> {
    const arrayBuffer = await file.arrayBuffer();
    const midi = new Midi(arrayBuffer);
    
    const bpm = midi.header.tempos.length > 0 ? midi.header.tempos[0].bpm : 120;
    const timeSignature = midi.header.timeSignatures.length > 0 
      ? [midi.header.timeSignatures[0].timeSignature[0], midi.header.timeSignatures[0].timeSignature[1]] as [number, number]
      : [4, 4] as [number, number];

    const tracks: Track[] = midi.tracks.map((track, i) => {
      const family = (track.instrument.family || '').toLowerCase();
      const name = (track.name || '').toLowerCase();
      let instrumentType: 'piano' | 'guitar' | 'bass' | 'drums' | 'strings' | 'synth pad' = 'piano';

      if (track.channel === 9 || family.includes('drum') || family.includes('percussion') || name.includes('drum') || name.includes('perc')) {
        instrumentType = 'drums';
      } else if (family.includes('bass') || name.includes('bass')) {
        instrumentType = 'bass';
      } else if (family.includes('guitar') || name.includes('guitar') || name.includes('gt')) {
        instrumentType = 'guitar';
      } else if (family.includes('string') || family.includes('ensemble') || name.includes('string') || name.includes('violin') || name.includes('cello')) {
        instrumentType = 'strings';
      } else if (family.includes('synth') || family.includes('pad') || family.includes('lead') || family.includes('organ') || name.includes('synth') || name.includes('organ')) {
        instrumentType = 'synth pad';
      }

      const sustainEvents = track.controlChanges[64]?.map(cc => ({
        time: cc.time * (bpm / 60),
        value: Math.round(cc.value * 127)
      })) || [];

      return {
        id: `track-${Date.now()}-${i}`,
        name: track.name || `Pista ${i + 1}`,
        instrument: instrumentType,
        color: ['#22d3ee','#4ade80','#a78bfa','#f472b6','#fbbf24','#f97316','#38bdf8'][i % 7],
        isMuted: false,
        isSolo: false,
        notes: track.notes.map((note, j) => ({
          id: `note-${Date.now()}-${i}-${j}`,
          pitch: note.midi,
          start: note.time * (bpm / 60),
          duration: note.duration * (bpm / 60),
          velocity: note.velocity * 127
        })),
        sustainEvents
      };
    }).filter(t => t.notes.length > 0);

    return {
      id: `score-${Date.now()}`,
      title: midi.header.name || file.name.replace(/\.midi?$/, '') || 'Canción MIDI',
      artist: 'Importado',
      bpm,
      timeSignature,
      tracks: tracks.length > 0 ? tracks : [{
        id: `empty-track-${Date.now()}`,
        name: 'Pista Vacía',
        instrument: 'piano',
        color: '#22d3ee',
        isMuted: false,
        isSolo: false,
        notes: []
      }]
    };
  }

  /**
   * Síntesis multi-oscilador mejorada por timbre.
   * Devuelve el GainNode que puede conectarse al destino.
   */
  private _createSynthVoice(
    ctx: AudioContext,
    pitch: number,
    velocity: number,
    instrument: string,
    startTime: number,
    duration: number
  ): GainNode {
    const vol = (velocity / 127) * 0.7;
    const freq = this.midiToFreq(pitch);
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    let oscs: OscillatorNode[] = [];

    if (instrument === 'guitar') {
      // Guitar: serruchado principal + cuarta armónica ligera
      const o1 = ctx.createOscillator(); o1.type = 'sawtooth'; o1.frequency.value = freq;
      const o2 = ctx.createOscillator(); o2.type = 'sawtooth'; o2.frequency.value = freq * 2;
      const g1 = ctx.createGain(); g1.gain.value = 0.8;
      const g2 = ctx.createGain(); g2.gain.value = 0.15;
      o1.connect(g1); o2.connect(g2); g1.connect(gain); g2.connect(gain);
      filter.type = 'peaking'; filter.frequency.value = 1800; filter.gain.value = 4; filter.Q.value = 1;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(vol, startTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + Math.max(0.1, duration * 0.9));
      oscs = [o1, o2];
    } else if (instrument === 'bass') {
      // Bass: triángulo + sine sub-octava
      const o1 = ctx.createOscillator(); o1.type = 'triangle'; o1.frequency.value = freq;
      const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = freq * 0.5;
      const g1 = ctx.createGain(); g1.gain.value = 0.7;
      const g2 = ctx.createGain(); g2.gain.value = 0.4;
      o1.connect(g1); o2.connect(g2); g1.connect(gain); g2.connect(gain);
      filter.type = 'lowpass'; filter.frequency.value = 600; filter.Q.value = 0.8;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(vol * 1.1, startTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + Math.max(0.1, duration));
      oscs = [o1, o2];
    } else if (instrument === 'drums') {
      // Percusión: pulse corto + ruido (usando osciladores)
      const o1 = ctx.createOscillator(); o1.type = 'square'; o1.frequency.value = freq < 50 ? 60 : freq;
      o1.frequency.exponentialRampToValueAtTime(40, startTime + 0.04);
      const g1 = ctx.createGain(); g1.gain.value = 1;
      o1.connect(g1); g1.connect(gain);
      filter.type = 'bandpass'; filter.frequency.value = freq < 80 ? 160 : 2000; filter.Q.value = 2;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(vol, startTime + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + Math.min(0.18, duration));
      oscs = [o1];
    } else if (instrument === 'strings') {
      // Cuerdas: serruchado + legero detune (3 osciladores con vibrato)
      const o1 = ctx.createOscillator(); o1.type = 'sawtooth'; o1.frequency.value = freq;
      const o2 = ctx.createOscillator(); o2.type = 'sawtooth'; o2.frequency.value = freq * 1.003; // ligero detune
      const o3 = ctx.createOscillator(); o3.type = 'sawtooth'; o3.frequency.value = freq * 0.997;
      const g1 = ctx.createGain(); g1.gain.value = 0.5;
      const g2 = ctx.createGain(); g2.gain.value = 0.3;
      const g3 = ctx.createGain(); g3.gain.value = 0.25;
      o1.connect(g1); o2.connect(g2); o3.connect(g3);
      g1.connect(gain); g2.connect(gain); g3.connect(gain);
      filter.type = 'lowpass'; filter.frequency.value = 2800; filter.Q.value = 0.5;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(vol * 0.55, startTime + 0.12); // ataque lento (arco)
      gain.gain.setValueAtTime(vol * 0.55, startTime + Math.max(0.12, duration - 0.06));
      gain.gain.linearRampToValueAtTime(0.001, startTime + duration + 0.15);
      oscs = [o1, o2, o3];
    } else if (instrument === 'synth pad') {
      // Synth Pad: triángulo + sine suave con ataque lento
      const o1 = ctx.createOscillator(); o1.type = 'triangle'; o1.frequency.value = freq;
      const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = freq * 2;
      const g1 = ctx.createGain(); g1.gain.value = 0.65;
      const g2 = ctx.createGain(); g2.gain.value = 0.2;
      o1.connect(g1); o2.connect(g2); g1.connect(gain); g2.connect(gain);
      filter.type = 'lowpass'; filter.frequency.value = 1200; filter.Q.value = 1.5;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(vol * 0.6, startTime + 0.08);
      gain.gain.setValueAtTime(vol * 0.6, startTime + Math.max(0.1, duration - 0.1));
      gain.gain.linearRampToValueAtTime(0.001, startTime + duration + 0.25);
      oscs = [o1, o2];
    } else {
      // Piano: sine + ligero detuneados (mellow piano)
      const o1 = ctx.createOscillator(); o1.type = 'sine'; o1.frequency.value = freq;
      const o2 = ctx.createOscillator(); o2.type = 'triangle'; o2.frequency.value = freq * 2.001;
      const o3 = ctx.createOscillator(); o3.type = 'sine'; o3.frequency.value = freq * 3.0;
      const g1 = ctx.createGain(); g1.gain.value = 0.7;
      const g2 = ctx.createGain(); g2.gain.value = 0.2;
      const g3 = ctx.createGain(); g3.gain.value = 0.08;
      o1.connect(g1); o2.connect(g2); o3.connect(g3);
      g1.connect(gain); g2.connect(gain); g3.connect(gain);
      filter.type = 'lowpass'; filter.frequency.value = 3500; filter.Q.value = 0.3;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(vol, startTime + 0.008);
      gain.gain.setTargetAtTime(vol * 0.28, startTime + 0.04, 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + Math.max(0.15, duration * 1.1));
      oscs = [o1, o2, o3];
    }

    gain.connect(filter);
    filter.connect(this.compressor!);

    // Conexión a reverb (wet)
    if (this.reverbNode && instrument !== 'drums') {
      filter.connect(this.reverbNode);
    }

    const stopTime = startTime + duration + 0.5;
    oscs.forEach(o => { o.start(startTime); o.stop(stopTime); });

    return gain;
  }

  playNote(
    pitch: number,
    velocity: number = 100,
    instrument: string = 'piano',
    timeOffset: number = 0,
    duration: number = 0.5,
    trackColor: string = '#22d3ee'
  ) {
    this.init();
    if (!this.ctx || !this.compressor) return;
    const startTime = this.ctx.currentTime + timeOffset;
    const gain = this._createSynthVoice(this.ctx, pitch, velocity, instrument, startTime, duration);

    const noteId = `${pitch}-${startTime.toFixed(4)}-${Math.random()}`;
    const oscsRef: OscillatorNode[] = [];
    this.activeNodes.set(noteId, { oscs: oscsRef, gain });

    // Efecto visual Guitar Hero (llamamos al callback si existe)
    if (timeOffset <= 0.02 && this.onNoteStart) {
      this.onNoteStart(pitch, instrument, trackColor);
    }

    gain.gain.addEventListener?.('ended', () => this.activeNodes.delete(noteId));
    setTimeout(() => this.activeNodes.delete(noteId), (duration + 1) * 1000);
  }

  playScore(score: Score, startPositionInSeconds: number = 0) {
    this.init();
    this.resume();
    this.stopAll();
    this._isPlaying = true;
    this.currentScore = score;
    this.scheduledNoteIds.clear();
    
    let maxBeat = 32;
    score.tracks.forEach(track => {
      track.notes.forEach(note => {
        const end = note.start + note.duration;
        if (end > maxBeat) maxBeat = end;
      });
    });
    this._loopEnd = maxBeat + 4;

    const effectiveBpm = score.bpm * this._playbackSpeed;
    const bps = effectiveBpm / 60;
    const spb = 1 / bps;

    this._startTime = this.ctx!.currentTime - (startPositionInSeconds * spb) + 0.05;
    this.scheduleNotesLookahead(startPositionInSeconds, startPositionInSeconds + 6);

    if (this.checkInterval) window.clearInterval(this.checkInterval);

    this.checkInterval = window.setInterval(() => {
      if (!this._isPlaying || !this.ctx) return;
      const beat = this.getPlaybackTime() * bps;
      this.scheduleNotesLookahead(beat, beat + 6);

      if (this._isLooping && beat >= this._loopEnd) {
        this.stopAllNodes();
        this.scheduledNoteIds.clear();
        this._startTime = this.ctx.currentTime - (this._loopStart * spb) + 0.05;
        this.scheduleNotesLookahead(this._loopStart, this._loopStart + 6);
      } else if (beat >= this._loopEnd && !this._isLooping) {
        this.pause();
        this._pauseTime = 0;
      }
    }, 80);
  }

  private scheduleNotesLookahead(startBeat: number, endBeat: number) {
    if (!this.currentScore || !this.ctx) return;

    // Usar score vivo si está disponible (para que mute/solo/volume reaccionen en tiempo real)
    const activeScore = (this.getLiveScore && this.getLiveScore()) || this.currentScore;
    
    const effectiveBpm = activeScore.bpm * this._playbackSpeed;
    const bps = effectiveBpm / 60;
    const spb = 1 / bps;
    const hasSoloTrack = activeScore.tracks.some(t => t.isSolo);

    // Iterar sobre notas del score original (para IDs de scheduling) pero filtrar por estado vivo
    const liveTrackMap = new Map(activeScore.tracks.map(t => [t.id, t]));

    this.currentScore.tracks.forEach(track => {
      const liveTrack = liveTrackMap.get(track.id) || track;
      if (liveTrack.isMuted) return;
      if (hasSoloTrack && !liveTrack.isSolo) return;

      const trackVolRatio = liveTrack.volume !== undefined ? liveTrack.volume / 100 : 1.0;
      if (trackVolRatio <= 0) return;

      track.notes.forEach(note => {
        if (note.start >= startBeat && note.start < endBeat) {
          const scheduleKey = `${note.id}-${note.start}`;
          if (!this.scheduledNoteIds.has(scheduleKey)) {
            this.scheduledNoteIds.add(scheduleKey);
            const nowInScore = this.getPlaybackTime() * bps;
            const timeUntilNote = (note.start - nowInScore) * spb;
            const offset = Math.max(0, timeUntilNote);
            const duration = note.duration * spb;
            const effectiveVel = Math.round(note.velocity * trackVolRatio);
            this.playNote(note.pitch, effectiveVel, liveTrack.instrument, offset, duration, liveTrack.color);
          }
        }
      });
    });
  }

  pause() {
    this._isPlaying = false;
    this._pauseTime = this.getPlaybackTime();
    this.stopAllNodes();
    if (this.checkInterval) { window.clearInterval(this.checkInterval); this.checkInterval = null; }
  }

  stop() {
    this._isPlaying = false;
    this._pauseTime = 0;
    this.scheduledNoteIds.clear();
    this.stopAllNodes();
    if (this.checkInterval) { window.clearInterval(this.checkInterval); this.checkInterval = null; }
  }

  play() {
    if (!this.currentScore || this._isPlaying) return;
    this.playScore(this.currentScore, this._pauseTime);
  }

  stopAll() { this.stop(); }

  private stopAllNodes() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    this.activeNodes.forEach(({ oscs, gain }) => {
      try {
        gain.gain.cancelScheduledValues(now);
        gain.gain.linearRampToValueAtTime(0.0001, now + 0.025);
        oscs.forEach(o => { try { o.stop(now + 0.03); } catch(e) {} });
      } catch(e) {}
    });
    this.activeNodes.clear();
  }

  getPlaybackTime(): number {
    if (!this.ctx) return 0;
    if (!this._isPlaying) return this._pauseTime;
    return Math.max(0, this.ctx.currentTime - this._startTime);
  }

  resume() {
    if (this.ctx?.state === 'suspended') this.ctx.resume();
  }

  async loadSoundFont(_file: File) {
    // Placeholder: en el futuro puede cargar SF2 con soundfont-player
    console.log('SF2 loading no implementado aún en modo sintetizador nativo.');
  }

  scoreToMidiBytes(score: Score): Uint8Array {
    const midi = new Midi();
    const trackBpm = score.bpm || 120;
    midi.header.tempos.push({ ticks: 0, bpm: trackBpm, time: 0 });
    if (score.timeSignature) {
      midi.header.timeSignatures.push({
        ticks: 0,
        timeSignature: score.timeSignature,
        measures: 0,
        time: 0
      });
    }
    const bps = trackBpm / 60;
    score.tracks.forEach((trackData, index) => {
      const track = midi.addTrack();
      track.name = trackData.name;
      track.channel = index % 16;
      trackData.notes.forEach(note => {
        track.addNote({
          midi: note.pitch,
          time: note.start / bps,
          duration: note.duration / bps,
          velocity: note.velocity / 127
        });
      });
    });
    return midi.toArray();
  }

  async exportMidi(score: Score): Promise<Blob> {
    return new Blob([this.scoreToMidiBytes(score)], { type: 'audio/midi' });
  }

  async exportWav(score: Score): Promise<Blob> {
    const effectiveBpm = score.bpm * this._playbackSpeed;
    const bps = effectiveBpm / 60;
    const spb = 1 / bps;
    let maxBeat = 0;
    score.tracks.forEach(track => {
      if (track.isMuted) return;
      track.notes.forEach(note => {
        const end = note.start + note.duration;
        if (end > maxBeat) maxBeat = end;
      });
    });

    const totalDuration = (maxBeat * spb) + 2.5;
    const sampleRate = 44100;
    const offlineCtx = new OfflineAudioContext(2, Math.ceil(sampleRate * totalDuration), sampleRate);

    // Compresor en offline
    const compressor = offlineCtx.createDynamicsCompressor();
    compressor.threshold.value = -18; compressor.ratio.value = 6;
    compressor.connect(offlineCtx.destination);

    // Reverb offline
    const impulseLen = sampleRate;
    const impulse = offlineCtx.createBuffer(2, impulseLen, sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = impulse.getChannelData(ch);
      for (let i = 0; i < impulseLen; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / impulseLen, 2.5);
    }
    const reverb = offlineCtx.createConvolver();
    reverb.buffer = impulse;
    const reverbGain = offlineCtx.createGain(); reverbGain.gain.value = 0.15;
    reverb.connect(reverbGain); reverbGain.connect(compressor);

    score.tracks.forEach(track => {
      if (track.isMuted) return;
      track.notes.forEach(note => {
        const t0 = note.start * spb;
        const dur = note.duration * spb;
        const freq = this.midiToFreq(note.pitch);
        const vol = (note.velocity / 127) * 0.4;

        const osc = offlineCtx.createOscillator();
        const gain = offlineCtx.createGain();
        const filt = offlineCtx.createBiquadFilter();

        if (track.instrument === 'bass') {
          osc.type = 'triangle'; filt.type = 'lowpass'; filt.frequency.value = 700;
        } else if (track.instrument === 'guitar') {
          osc.type = 'sawtooth'; filt.type = 'bandpass'; filt.frequency.value = 1800;
        } else if (track.instrument === 'drums') {
          osc.type = 'square'; filt.type = 'highpass'; filt.frequency.value = 1500;
        } else if (track.instrument === 'strings') {
          osc.type = 'sawtooth'; filt.type = 'lowpass'; filt.frequency.value = 2800;
        } else if (track.instrument === 'synth pad') {
          osc.type = 'triangle'; filt.type = 'lowpass'; filt.frequency.value = 1200;
        } else {
          osc.type = 'sine'; filt.type = 'lowpass'; filt.frequency.value = 3500;
        }

        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, t0);
        gain.gain.linearRampToValueAtTime(vol, t0 + 0.02);
        gain.gain.setValueAtTime(vol, t0 + Math.max(0.02, dur - 0.05));
        gain.gain.linearRampToValueAtTime(0, t0 + dur + 0.08);

        osc.connect(filt); filt.connect(gain); gain.connect(compressor);
        if (track.instrument !== 'drums') filt.connect(reverb);
        osc.start(t0); osc.stop(t0 + dur + 0.1);
      });
    });

    const rendered = await offlineCtx.startRendering();
    return this._bufferToWav(rendered);
  }

  private _bufferToWav(abuffer: AudioBuffer): Blob {
    const numOfChan = abuffer.numberOfChannels;
    const length = abuffer.length * numOfChan * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);
    const channels: Float32Array[] = [];
    let pos = 0, offset = 0;

    const setUint16 = (d: number) => { view.setUint16(pos, d, true); pos += 2; };
    const setUint32 = (d: number) => { view.setUint32(pos, d, true); pos += 4; };

    setUint32(0x46464952); setUint32(length - 8); setUint32(0x45564157);
    setUint32(0x20746d66); setUint32(16); setUint16(1); setUint16(numOfChan);
    setUint32(abuffer.sampleRate);
    setUint32(abuffer.sampleRate * 2 * numOfChan);
    setUint16(numOfChan * 2); setUint16(16);
    setUint32(0x61746164); setUint32(length - pos - 4);

    for (let i = 0; i < numOfChan; i++) channels.push(abuffer.getChannelData(i));
    while (pos < length) {
      for (let i = 0; i < numOfChan; i++) {
        let s = Math.max(-1, Math.min(1, channels[i][offset]));
        s = (s < 0 ? s * 32768 : s * 32767) | 0;
        view.setInt16(pos, s, true); pos += 2;
      }
      offset++;
    }
    return new Blob([buffer], { type: 'audio/wav' });
  }
}

export const audioEngine = new AudioEngine();
