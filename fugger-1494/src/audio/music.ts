// Prozedurale Hintergrundmusik: eine ruhige Lauten-Schleife nach Art
// des Passamezzo antico (a-Moll), komplett über WebAudio synthetisiert.
// Start erst nach einer Nutzer-Geste (Autoplay-Richtlinie).

const STORE_KEY = 'fugger1494-music';
const BEAT = 0.55; // Sekunden je Schlag
const BAR = BEAT * 4;

// Je Takt: Basston und Arpeggio (MIDI-Noten), Achtel-Zupfmuster.
const BARS: { bass: number; arp: number[] }[] = [
  { bass: 45, arp: [57, 64, 60, 64, 57, 64, 60, 64] }, // Am
  { bass: 43, arp: [55, 62, 59, 62, 55, 62, 59, 62] }, // G
  { bass: 41, arp: [53, 60, 57, 60, 53, 60, 57, 60] }, // F
  { bass: 40, arp: [52, 59, 56, 59, 52, 59, 56, 59] }, // E
  { bass: 45, arp: [57, 64, 60, 64, 57, 64, 60, 64] }, // Am
  { bass: 43, arp: [55, 62, 59, 62, 55, 62, 59, 62] }, // G
  { bass: 40, arp: [52, 59, 56, 59, 52, 59, 56, 59] }, // E
  { bass: 45, arp: [57, 60, 64, 69, 64, 60, 57, 57] }, // Am (Schluss)
];

// Schlichte Oberstimme, Viertelnoten je Takt (0 = Pause).
const MELODY: number[][] = [
  [69, 0, 72, 71], [71, 0, 67, 71], [69, 0, 65, 69], [68, 0, 64, 68],
  [69, 0, 72, 76], [74, 0, 71, 74], [71, 68, 64, 68], [69, 0, 0, 0],
];

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let running = false;
let loopTimer: number | null = null;

function midi(n: number): number {
  return 440 * 2 ** ((n - 69) / 12);
}

function pluck(freq: number, at: number, dur: number, vol: number): void {
  if (!ctx || !master) return;
  const osc = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc2.type = 'sine';
  osc.frequency.value = freq;
  osc2.frequency.value = freq * 2.002; // leiser Oberton, leicht verstimmt
  const g2 = ctx.createGain();
  g2.gain.value = 0.25;
  gain.gain.setValueAtTime(vol, at);
  gain.gain.exponentialRampToValueAtTime(0.0008, at + dur);
  osc.connect(gain);
  osc2.connect(g2).connect(gain);
  gain.connect(master);
  osc.start(at); osc2.start(at);
  osc.stop(at + dur); osc2.stop(at + dur);
}

// Plant eine komplette Schleife ab dem Zeitpunkt t0 und stößt danach
// rechtzeitig die nächste an.
function scheduleLoop(t0: number): void {
  if (!ctx || !running) return;
  BARS.forEach((bar, b) => {
    const barStart = t0 + b * BAR;
    pluck(midi(bar.bass), barStart, BEAT * 3, 0.055);
    bar.arp.forEach((n, i) => {
      pluck(midi(n), barStart + i * (BEAT / 2), BEAT * 0.9, 0.028);
    });
    MELODY[b].forEach((n, i) => {
      if (n > 0) pluck(midi(n), barStart + i * BEAT, BEAT * 1.6, 0.038);
    });
  });
  const loopEnd = t0 + BARS.length * BAR;
  loopTimer = window.setTimeout(
    () => scheduleLoop(loopEnd),
    (loopEnd - ctx.currentTime - 0.5) * 1000,
  );
}

export function musicEnabled(): boolean {
  try {
    return localStorage.getItem(STORE_KEY) !== 'off';
  } catch {
    return true;
  }
}

// Nach einer Nutzer-Geste aufrufen: startet die Musik, falls gewünscht.
export function ensureMusic(): void {
  if (!musicEnabled() || running) return;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    master ??= ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
    running = true;
    scheduleLoop(ctx.currentTime + 0.1);
  } catch {
    // Kein Audio verfügbar – Spiel läuft stumm weiter.
  }
}

export function toggleMusic(): boolean {
  const nowOn = !musicEnabled();
  try {
    localStorage.setItem(STORE_KEY, nowOn ? 'on' : 'off');
  } catch { /* egal */ }
  if (nowOn) {
    ensureMusic();
  } else {
    running = false;
    if (loopTimer !== null) window.clearTimeout(loopTimer);
    loopTimer = null;
    // Laufende Töne sanft abwürgen
    if (master && ctx) {
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.1);
      const old = master;
      window.setTimeout(() => old.disconnect(), 600);
      master = null;
    }
  }
  return nowOn;
}
