import type { AnimationSpec } from '../types';

const RELICS: AnimationSpec[] = [
  { id: 'relic_excalibur_slash', kind: 'beam', color: '#f0ecd8', secondaryColor: '#ffe466', size: 18, duration: 0.42, particles: 16, shake: 0.14 },
  { id: 'relic_holy_grail', kind: 'pulse', color: '#b8e0ff', secondaryColor: '#ffc56b', size: 28, duration: 0.65, particles: 18, ringThickness: 4, shake: 0.08 },
  { id: 'relic_mjolnir_storm', kind: 'columns', color: '#ffe466', secondaryColor: '#66eaff', size: 20, duration: 0.55, particles: 20, shake: 0.18 },
  { id: 'relic_aegis_guard', kind: 'pulse', color: '#d4a24a', secondaryColor: '#66eaff', size: 30, duration: 0.5, particles: 14, ringThickness: 3, shake: 0.12 },
  { id: 'relic_philosopher_stone', kind: 'glow', color: '#ff3a3a', secondaryColor: '#ffc56b', size: 18, duration: 0.5, particles: 14 },
  { id: 'relic_necronomicon_page', kind: 'burst', color: '#89e53a', secondaryColor: '#e5c8ff', size: 16, duration: 0.48, particles: 14, shake: 0.07 },
  { id: 'relic_gungnir_mark', kind: 'trail', color: '#d6dde8', secondaryColor: '#ff6a7a', size: 9, duration: 0.38, particles: 8, trailLength: 10 },
  { id: 'relic_yata_mirror', kind: 'glow', color: '#d4a24a', secondaryColor: '#ffffff', size: 20, duration: 0.45, particles: 12 },
];

export default RELICS;
