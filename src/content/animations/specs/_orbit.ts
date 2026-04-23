import type { AnimationSpec } from '../types';

const BONE = '#baf0b8';
const IVORY = '#f0ecd8';
const BLOOD = '#e23c4c';

const ORBIT: AnimationSpec[] = [
  { id: 'orbit_cast', kind: 'aura', color: IVORY, secondaryColor: BONE, size: 12, duration: 0.28, particles: 9, spin: 5 },
  { id: 'fang_orbit', kind: 'trail', color: IVORY, secondaryColor: BONE, size: 4, duration: 0.35, particles: 6, trailLength: 6, spin: 4 },
  { id: 'fang_bite', kind: 'burst', color: IVORY, secondaryColor: BLOOD, size: 9, duration: 0.3, particles: 8, shake: 0.06 },
  { id: 'eternal_circle', kind: 'pulse', color: IVORY, secondaryColor: BONE, size: 24, duration: 0.6, particles: 18, ringThickness: 2, spin: 10 },
];

export default ORBIT;
