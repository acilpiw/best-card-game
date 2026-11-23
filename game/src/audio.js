// audio.js — tiny WebAudio synth for DUEL 21: card swishes, chip clicks and
// win/lose stingers. No audio files, everything is oscillators, and every
// call is safe before the first user gesture (it resumes lazily).

let context = null;

function audioContext() {
  if (typeof window === 'undefined' || !window.AudioContext) return null;
  if (!context) context = new window.AudioContext();
  if (context.state === 'suspended') context.resume();
  return context;
}

function tone(freq, start, duration, type, gainValue) {
  const ac = audioContext();
  if (!ac) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(gainValue, ac.currentTime + start);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + start + duration);
  osc.connect(gain).connect(ac.destination);
  osc.start(ac.currentTime + start);
  osc.stop(ac.currentTime + start + duration);
}

export function playCardSound() {
  // A short two-note swish: up a fourth, quieter on the second note.
  tone(620, 0, 0.07, 'triangle', 0.12);
  tone(880, 0.05, 0.07, 'triangle', 0.08);
}

export function playChipSound() {
  tone(1320, 0, 0.05, 'square', 0.06);
  tone(1560, 0.04, 0.05, 'square', 0.05);
}

export function playWinSound() {
  tone(523, 0, 0.14, 'triangle', 0.14);
  tone(659, 0.1, 0.14, 'triangle', 0.14);
  tone(784, 0.2, 0.22, 'triangle', 0.16);
}

export function playLoseSound() {
  tone(392, 0, 0.16, 'sawtooth', 0.08);
  tone(311, 0.12, 0.16, 'sawtooth', 0.08);
  tone(233, 0.24, 0.26, 'sawtooth', 0.09);
}
