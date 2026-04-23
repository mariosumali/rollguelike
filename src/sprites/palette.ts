export const PAL = {
  '.': null,
  '0': '#05050c',
  '1': '#0a0a18',
  '2': '#12122a',
  '3': '#1b1b3a',
  '4': '#2c2f55',

  '5': '#3e2a1a',
  '6': '#6b4b2a',
  '7': '#a0732c',
  '8': '#d4a24a',
  '9': '#f0d488',

  a: '#3b3f4c',
  b: '#6a7082',
  c: '#9fa7bd',
  d: '#d6dde8',
  e: '#f0ecd8',

  f: '#4a1a1a',
  g: '#8a1e1e',
  h: '#e23c4c',
  i: '#ff6a7a',
  j: '#ffb3bb',

  k: '#1a3a1a',
  l: '#2e6a2e',
  m: '#6ae07a',
  n: '#baf0b8',

  o: '#1a1a4a',
  p: '#2e4aa0',
  q: '#62b8ff',
  r: '#b8e0ff',

  s: '#4a2a00',
  t: '#aa4400',
  u: '#ff7a2b',
  v: '#ffc56b',

  w: '#c77cff',
  x: '#ffd86b',
  y: '#ffe466',
  z: '#89e53a',

  A: '#00222a',
  B: '#005566',
  C: '#00a0b0',
  D: '#66eaff',

  E: '#1c102c',
  F: '#3a1e5c',
  G: '#6a2eaa',
  H: '#b77aff',
  I: '#e5c8ff',

  J: '#3a0a0a',
  K: '#a00a0a',
  L: '#ff3a3a',

  M: '#2a1800',
  N: '#553200',
  O: '#ffa21f',

  P: '#9a9a9a',
  Q: '#eeeeee',
  R: '#000000',
  S: '#ffffff',

  T: '#0f2a1a',
  U: '#1e4d33',

  V: '#330a33',
  W: '#661a66',
} as const satisfies Record<string, string | null>;

export type PalKey = keyof typeof PAL;

export function palHex(k: string): string | null {
  const v = (PAL as Record<string, string | null>)[k];
  return v ?? null;
}
