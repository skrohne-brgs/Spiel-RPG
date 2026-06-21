// ── 16-bit Chiptune Engine (Web Audio API) ────────────────────────────────────
// Procedural synthesis — no audio files needed.

const Hz: Record<string, number> = {
  C3:130.81, D3:146.83, Eb3:155.56, E3:164.81, F3:174.61,
  G3:196.00, Ab3:207.65, A3:220.00, Bb3:233.08, B3:246.94,
  C4:261.63, D4:293.66, Eb4:311.13, E4:329.63, F4:349.23,
  G4:392.00, Ab4:415.30, A4:440.00, Bb4:466.16, B4:493.88,
  C5:523.25, D5:587.33, Eb5:622.25, E5:659.25, F5:698.46,
  G5:783.99, A5:880.00, Bb5:932.33,
  _: 0, // rest
};

interface Song {
  bpm:    number;
  loop:   boolean;
  mel:    number[];  // melody frequencies (0 = rest)
  bass:   number[];
  drums:  number[];  // 0=rest 1=kick 2=snare 3=hihat
}

const SONGS: Record<string, Song> = {

  // ── Hauptmenü: episch, C-Moll, BPM 100 ──────────────────────────────────
  menu: {
    bpm: 100, loop: true,
    mel: [
      Hz.G4, Hz.Eb5, Hz.D5, Hz.C5,  Hz.Bb4, Hz.G4,  Hz.Eb4, Hz.D4,
      Hz.C4, Hz.G4,  Hz.Ab4,Hz.Bb4, Hz.C5,  Hz.Bb4, Hz.Ab4, Hz.G4,
      Hz.Eb4,Hz.G4,  Hz.Bb4,Hz.C5,  Hz.D5,  Hz.C5,  Hz.Bb4, Hz.G4,
      Hz.C5, Hz.D5,  Hz.Eb5,Hz.D5,  Hz.C5,  Hz._,   Hz._,   Hz._,
    ],
    bass: [
      Hz.C3, Hz.C3, Hz.C3, Hz.G3,  Hz.G3, Hz.G3, Hz.G3, Hz.Bb3,
      Hz.Ab3,Hz.Ab3,Hz.Ab3,Hz.Eb3, Hz.G3, Hz.G3, Hz.G3, Hz.G3,
      Hz.Eb3,Hz.Eb3,Hz.G3, Hz.G3,  Hz.G3, Hz.G3, Hz.Bb3,Hz.Bb3,
      Hz.C3, Hz.C3, Hz.C3, Hz.G3,  Hz.C3, Hz.C3, Hz.C3, Hz.C3,
    ],
    drums: [
      1,0,3,0, 2,0,3,0, 1,0,3,0, 2,0,3,3,
      1,0,3,0, 2,0,3,0, 1,0,3,0, 2,0,3,3,
    ],
  },

  // ── Abenteuer-Karte: ruhig, F-Dur, BPM 72 ───────────────────────────────
  map: {
    bpm: 72, loop: true,
    mel: [
      Hz.F4, Hz._,  Hz.A4, Hz._,   Hz.C5, Hz._,  Hz.A4, Hz._,
      Hz.F4, Hz._,  Hz.G4, Hz._,   Hz.Bb4,Hz._,  Hz.A4, Hz._,
      Hz.C5, Hz._,  Hz.Bb4,Hz._,   Hz.A4, Hz._,  Hz.G4, Hz._,
      Hz.F4, Hz.G4, Hz.A4, Hz.Bb4, Hz.C5, Hz._,  Hz._,  Hz._,
    ],
    bass: [
      Hz.F3, Hz._, Hz.F3, Hz._,  Hz.C3, Hz._, Hz.C3, Hz._,
      Hz.F3, Hz._, Hz.Bb3,Hz._,  Hz.F3, Hz._, Hz.F3, Hz._,
      Hz.C3, Hz._, Hz.C3, Hz._,  Hz.F3, Hz._, Hz.A3, Hz._,
      Hz.F3, Hz._, Hz.F3, Hz._,  Hz.F3, Hz._, Hz.F3, Hz._,
    ],
    drums: [
      1,0,0,3, 0,0,3,0, 1,0,0,3, 0,0,3,0,
      1,0,0,3, 0,0,3,0, 1,0,0,3, 0,0,3,0,
    ],
  },

  // ── Kampf: intensiv, D-Moll, BPM 145 ────────────────────────────────────
  combat: {
    bpm: 145, loop: true,
    mel: [
      Hz.D4, Hz.F4, Hz.A4, Hz._,   Hz.G4, Hz.F4, Hz.E4, Hz.D4,
      Hz.C4, Hz.D4, Hz.E4, Hz.F4,  Hz.G4, Hz.A4, Hz.D4, Hz._,
      Hz.Bb4,Hz.A4, Hz.G4, Hz.F4,  Hz.E4, Hz.D4, Hz.C4, Hz.D4,
      Hz.E4, Hz.F4, Hz.G4, Hz.A4,  Hz.D5, Hz._,  Hz.A4, Hz._,
    ],
    bass: [
      Hz.D3, Hz.D3, Hz.A3, Hz.A3,  Hz.G3, Hz.G3, Hz.G3, Hz.A3,
      Hz.C3, Hz.C3, Hz.C3, Hz.C3,  Hz.G3, Hz.G3, Hz.D3, Hz.D3,
      Hz.Bb3,Hz.Bb3,Hz.F3, Hz.F3,  Hz.C3, Hz.C3, Hz.C3, Hz.C3,
      Hz.G3, Hz.G3, Hz.A3, Hz.A3,  Hz.D3, Hz.D3, Hz.D3, Hz.D3,
    ],
    drums: [
      1,2,3,2, 1,3,2,3, 1,2,3,2, 1,3,2,3,
      1,2,3,2, 1,3,2,3, 1,2,3,2, 1,3,2,3,
    ],
  },

  // ── Sieg: C-Dur-Fanfare, BPM 120, kein Loop ─────────────────────────────
  victory: {
    bpm: 120, loop: false,
    mel: [
      Hz.C4, Hz.E4, Hz.G4, Hz.C5,  Hz.G4, Hz.E4, Hz.C4, Hz.G3,
      Hz.C4, Hz.E4, Hz.G4, Hz.C5,  Hz.E5, Hz.G5, Hz._,  Hz._,
      Hz.G4, Hz.A4, Hz.B4, Hz.C5,  Hz.G5, Hz._,  Hz._,  Hz._,
    ],
    bass: [
      Hz.C3, Hz._, Hz.G3, Hz._,  Hz.E3, Hz._, Hz.C3, Hz._,
      Hz.C3, Hz._, Hz.G3, Hz._,  Hz.C3, Hz._, Hz.C3, Hz._,
      Hz.G3, Hz._, Hz.G3, Hz._,  Hz.C3, Hz._, Hz.C3, Hz._,
    ],
    drums: [
      1,0,2,0, 1,0,2,0, 1,0,2,0, 1,3,3,3,
      1,0,2,0, 1,0,2,0, 1,0,2,3, 0,0,0,0,
    ],
  },

  // ── Niederlage: C-Moll, langsam, kein Loop ──────────────────────────────
  gameover: {
    bpm: 55, loop: false,
    mel: [
      Hz.C4, Hz.Eb4, Hz.G4, Hz.F4,  Hz.Eb4,Hz.D4, Hz.C4, Hz._,
      Hz.Ab3,Hz.Bb3, Hz.C4, Hz._,   Hz.G3,  Hz._, Hz._,  Hz._,
    ],
    bass: [
      Hz.C3, Hz._, Hz.C3, Hz._,  Hz.G3, Hz._, Hz.C3, Hz._,
      Hz.Ab3,Hz._, Hz.Ab3,Hz._,  Hz.G3, Hz._, Hz.G3, Hz._,
    ],
    drums: [
      1,0,0,0, 0,0,2,0, 0,0,0,0, 1,0,0,0,
    ],
  },
};

// ── Engine ────────────────────────────────────────────────────────────────────

class ChiptuneEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private timerId: ReturnType<typeof setInterval> | null = null;
  private currentSong = '';
  private beatIdx = 0;
  private nextBeat = 0;
  private readonly LOOKAHEAD = 0.12;  // seconds
  private readonly INTERVAL  = 30;    // ms

  play(songName: string): void {
    if (songName === this.currentSong) return;
    this.stop();
    try {
      this.ctx = new AudioContext();
    } catch { return; }

    this.master = this.ctx.createGain();
    this.master.gain.value = 0.55;
    this.master.connect(this.ctx.destination);

    this.currentSong = songName;
    this.beatIdx = 0;
    this.nextBeat = this.ctx.currentTime + 0.05;
    this.timerId = setInterval(() => this.tick(), this.INTERVAL);
  }

  stop(): void {
    if (this.timerId !== null) { clearInterval(this.timerId); this.timerId = null; }
    try { this.ctx?.close(); } catch { /* ignore */ }
    this.ctx = null;
    this.master = null;
    this.currentSong = '';
  }

  private tick(): void {
    if (!this.ctx || !this.master) return;
    const song = SONGS[this.currentSong];
    if (!song) return;
    const beatLen = 60 / song.bpm;

    while (this.nextBeat < this.ctx.currentTime + this.LOOKAHEAD) {
      const b = this.beatIdx % song.mel.length;

      const mf = song.mel[b];
      if (mf > 0) this.tone(mf, this.nextBeat, beatLen * 0.82, 'square', 0.12);

      const bf = song.bass[b % song.bass.length];
      if (bf > 0) this.tone(bf, this.nextBeat, beatLen * 1.6, 'triangle', 0.07);

      const dr = song.drums[b % song.drums.length];
      if (dr > 0) this.drum(dr, this.nextBeat);

      this.nextBeat += beatLen;
      this.beatIdx++;

      if (this.beatIdx >= song.mel.length) {
        if (song.loop) { this.beatIdx = 0; }
        else           { this.stop(); return; }
      }
    }
  }

  private tone(
    freq: number, start: number, dur: number,
    type: OscillatorType, vol: number,
  ): void {
    if (!this.ctx || !this.master) return;
    const osc = this.ctx.createOscillator();
    const g   = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(vol, start + 0.008);
    g.gain.setValueAtTime(vol, start + dur * 0.65);
    g.gain.linearRampToValueAtTime(0, start + dur);
    osc.connect(g); g.connect(this.master);
    osc.start(start); osc.stop(start + dur + 0.01);
  }

  private drum(type: number, start: number): void {
    if (!this.ctx || !this.master) return;
    if (type === 1) {
      // Kick: oscillator mit Frequenz-Drop
      const osc = this.ctx.createOscillator();
      const g   = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, start);
      osc.frequency.exponentialRampToValueAtTime(28, start + 0.1);
      g.gain.setValueAtTime(0.55, start);
      g.gain.exponentialRampToValueAtTime(0.001, start + 0.14);
      osc.connect(g); g.connect(this.master);
      osc.start(start); osc.stop(start + 0.16);
    } else {
      // Snare / HiHat: gefiltertes Rauschen
      const len = Math.ceil(this.ctx.sampleRate * 0.12);
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d   = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      const flt = this.ctx.createBiquadFilter();
      const g   = this.ctx.createGain();
      if (type === 2) {
        flt.type = 'bandpass'; flt.frequency.value = 1200; flt.Q.value = 0.8;
        g.gain.setValueAtTime(0.18, start);
        g.gain.exponentialRampToValueAtTime(0.001, start + 0.14);
      } else {
        flt.type = 'highpass'; flt.frequency.value = 7500;
        g.gain.setValueAtTime(0.07, start);
        g.gain.exponentialRampToValueAtTime(0.001, start + 0.04);
      }
      src.connect(flt); flt.connect(g); g.connect(this.master);
      src.start(start); src.stop(start + 0.15);
    }
  }
}

export const music = new ChiptuneEngine();
