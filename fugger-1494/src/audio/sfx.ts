// Kleine synthetische Soundeffekte über WebAudio – keine Asset-Dateien.
// Alle Aufrufe passieren in Klick-Handlern, damit der AudioContext
// von der Autoplay-Richtlinie der Browser zugelassen wird.

let ctx: AudioContext | null = null;

function ac(): AudioContext | null {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(
  freq: number, start: number, duration: number,
  type: OscillatorType, volume: number,
): void {
  const c = ac();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t = c.currentTime + start;
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
  osc.connect(gain).connect(c.destination);
  osc.start(t);
  osc.stop(t + duration);
}

// Münzklimpern bei Kauf/Verkauf/Bankgeschäft.
export function sfxCoins(): void {
  tone(1320, 0, 0.09, 'square', 0.05);
  tone(1760, 0.05, 0.12, 'square', 0.04);
}

// Sanfter Glockenton, wenn ein Ereignis erscheint.
export function sfxEvent(): void {
  tone(660, 0, 0.5, 'sine', 0.08);
  tone(990, 0.02, 0.4, 'sine', 0.04);
}

// Dumpfes Rollen beim Aufbruch in eine andere Stadt.
export function sfxTravel(): void {
  tone(150, 0, 0.25, 'triangle', 0.09);
  tone(110, 0.12, 0.3, 'triangle', 0.07);
}
