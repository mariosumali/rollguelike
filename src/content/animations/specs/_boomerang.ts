import type { AnimationSpec } from '../types';

const JADE = '#6ae07a';
const LEAF = '#baf0b8';
const GHOST = '#e5c8ff';

const BOOMERANG: AnimationSpec[] = [
  { id: 'whirl_cast', kind: 'aura', color: JADE, secondaryColor: LEAF, size: 10, duration: 0.2, particles: 7, spin: 6 },
  { id: 'boomer_proj', kind: 'trail', color: JADE, secondaryColor: LEAF, size: 5, duration: 0.45, particles: 10, trailLength: 12, spin: 4 },
  { id: 'whirl_hit', kind: 'burst', color: JADE, secondaryColor: LEAF, size: 9, duration: 0.28, particles: 8 },
  { id: 'phantom_loop', kind: 'beam', color: GHOST, secondaryColor: JADE, size: 14, duration: 0.5, particles: 14, spin: 8, shake: 0.1 },
];

export default BOOMERANG;
