import type { AnimationSpec } from '../types';

const GOLD = '#ffc56b';
const YELLOW = '#ffe466';
const EMER = '#6ae07a';
const PRISM = '#c77cff';
const LILAC = '#e5c8ff';
const WHITE = '#f0ecd8';
const RED = '#e23c4c';
const ORANGE = '#ff7a2b';
const CYAN = '#66eaff';
const ROSE = '#ff6a7a';

const EXCLUSIVES: AnimationSpec[] = [
  { id: 'transmute_glow', kind: 'glow', color: EMER, secondaryColor: GOLD, size: 10, duration: 0.35, particles: 9 },
  { id: 'fortune_swirl', kind: 'aura', color: GOLD, secondaryColor: PRISM, size: 13, duration: 0.35, particles: 12, spin: 4 },
  { id: 'jackpot_crack', kind: 'burst', color: GOLD, secondaryColor: WHITE, size: 18, duration: 0.5, particles: 18, shake: 0.18 },
  { id: 'nova_bloom', kind: 'pulse', color: PRISM, secondaryColor: LILAC, size: 22, duration: 0.6, particles: 18, ringThickness: 3, shake: 0.12 },
  { id: 'rage_flame', kind: 'burst', color: RED, secondaryColor: ORANGE, size: 9, duration: 0.28, particles: 8 },
  { id: 'rage_flame_max', kind: 'pulse', color: RED, secondaryColor: YELLOW, size: 24, duration: 0.55, particles: 20, ringThickness: 3, shake: 0.18 },
  { id: 'mirror_flash', kind: 'burst', color: CYAN, secondaryColor: WHITE, size: 10, duration: 0.28, particles: 8 },
  { id: 'midas_shower', kind: 'burst', color: GOLD, secondaryColor: YELLOW, size: 14, duration: 0.5, particles: 16, gravity: 30 },
  { id: 'tempest_spiral', kind: 'columns', color: YELLOW, secondaryColor: CYAN, size: 20, duration: 0.55, particles: 18, spin: 6, shake: 0.16 },
  { id: 'phoenix_heart_burst', kind: 'pulse', color: ORANGE, secondaryColor: ROSE, size: 28, duration: 0.7, particles: 22, ringThickness: 4, shake: 0.22 },
  { id: 'event_mirror', kind: 'pulse', color: CYAN, secondaryColor: WHITE, size: 24, duration: 0.55, particles: 16, ringThickness: 3 },
];

export default EXCLUSIVES;
