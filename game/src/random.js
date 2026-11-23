// random.js — a small seeded rng (mulberry32) so screenshot scenes and
// tests reproduce the same shuffle from the same seed.

export function makeRng(seed) {
  // mulberry32: a 32-bit state advanced by a golden-ratio increment.
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
