import type { AnimationSpec } from '../types';

const BONE = '#baf0b8';
const IVORY = '#f0ecd8';
const GRAVE = '#8a7a55';
const SHADE = '#6a2eaa';
const GHOST = '#e5c8ff';

const BONES: AnimationSpec[] = [
  { id: 'necro_rise', kind: 'aura', color: GRAVE, secondaryColor: BONE, size: 12, duration: 0.35, particles: 10, shake: 0.05 },
  { id: 'bone_path', kind: 'trail', color: BONE, secondaryColor: IVORY, size: 4, duration: 0.3, particles: 5, trailLength: 5 },
  { id: 'bone_crack', kind: 'burst', color: IVORY, secondaryColor: GRAVE, size: 10, duration: 0.28, particles: 9, shake: 0.07 },
  { id: 'lich_march', kind: 'columns', color: SHADE, secondaryColor: IVORY, size: 18, duration: 0.55, particles: 18, shake: 0.14 },

  { id: 'wraith_bloom', kind: 'aura', color: GHOST, secondaryColor: SHADE, size: 11, duration: 0.3, particles: 9 },
  { id: 'wraith_strike', kind: 'burst', color: GHOST, secondaryColor: IVORY, size: 9, duration: 0.3, particles: 8, shake: 0.06 },
];

export default BONES;
