import type { AnimationSpec } from '../types';

const POISON = '#89e53a';
const BILE = '#4fa82e';
const BONE = '#baf0b8';

const TOXIN: AnimationSpec[] = [
  { id: 'toxin_cast', kind: 'aura', color: POISON, secondaryColor: BILE, size: 10, duration: 0.22, particles: 8 },
  { id: 'toxin_proj', kind: 'trail', color: POISON, secondaryColor: BILE, size: 4, duration: 0.28, particles: 6, trailLength: 7, gravity: 20 },
  { id: 'toxin_drip', kind: 'burst', color: POISON, secondaryColor: BILE, size: 8, duration: 0.3, particles: 7 },
  { id: 'plague_cloud', kind: 'pulse', color: POISON, secondaryColor: BONE, size: 22, duration: 0.65, particles: 16, ringThickness: 3, shake: 0.08 },
];

export default TOXIN;
