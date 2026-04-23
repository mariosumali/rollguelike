import type { AnimationSpec } from '../types';

const BEAM_WHITE = '#f0ecd8';
const BEAM_CYAN = '#66eaff';
const ORBIT_BONE = '#baf0b8';
const MINION_GHOST = '#e5c8ff';
const MINION_BLUE = '#62b8ff';

const VERB_PRIMITIVES: AnimationSpec[] = [
  { id: 'beam_segment', kind: 'beam', color: BEAM_WHITE, secondaryColor: BEAM_CYAN, size: 6, duration: 0.2, particles: 4 },
  { id: 'orbit_body', kind: 'trail', color: ORBIT_BONE, secondaryColor: BEAM_WHITE, size: 3, duration: 0.3, particles: 4, trailLength: 5, spin: 3 },
  { id: 'minion_trail', kind: 'trail', color: MINION_GHOST, secondaryColor: MINION_BLUE, size: 3, duration: 0.28, particles: 4, trailLength: 6 },
  { id: 'minion_path', kind: 'glow', color: MINION_BLUE, secondaryColor: MINION_GHOST, size: 8, duration: 0.3, particles: 6 },
];

export default VERB_PRIMITIVES;
