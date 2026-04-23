import type { AnimationSpec } from '../types';

const PRISM = '#c77cff';
const RAINBOW = '#ffe466';
const SUN = '#ffc56b';
const SOLAR = '#ff7a2b';
const WHITE = '#f0ecd8';

const PRISM_SOLAR: AnimationSpec[] = [
  { id: 'prism_cast', kind: 'aura', color: PRISM, secondaryColor: RAINBOW, size: 11, duration: 0.25, particles: 8 },
  { id: 'prism_hit', kind: 'beam', color: PRISM, secondaryColor: WHITE, size: 8, duration: 0.32, particles: 10 },
  { id: 'rainbow_lance', kind: 'beam', color: RAINBOW, secondaryColor: PRISM, size: 14, duration: 0.55, particles: 18, shake: 0.12 },

  { id: 'sun_charge', kind: 'aura', color: SUN, secondaryColor: SOLAR, size: 14, duration: 0.4, particles: 11, shake: 0.08 },
  { id: 'solar_scorch', kind: 'burst', color: SUN, secondaryColor: SOLAR, size: 14, duration: 0.4, particles: 12, shake: 0.1 },
  { id: 'corona_flare', kind: 'pulse', color: SUN, secondaryColor: WHITE, size: 26, duration: 0.65, particles: 20, ringThickness: 3, shake: 0.18 },
];

export default PRISM_SOLAR;
