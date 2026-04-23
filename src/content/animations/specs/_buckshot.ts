import type { AnimationSpec } from '../types';

const STEEL = '#d6dde8';
const WHITE = '#f0ecd8';
const SPARK = '#ffe466';

const BUCKSHOT: AnimationSpec[] = [
  { id: 'buck_proj', kind: 'trail', color: STEEL, secondaryColor: WHITE, size: 3, duration: 0.16, particles: 3, trailLength: 4 },
  { id: 'buck_spread', kind: 'burst', color: STEEL, secondaryColor: SPARK, size: 9, duration: 0.26, particles: 10, spread: Math.PI / 3, shake: 0.06 },
  { id: 'slug_punch', kind: 'burst', color: SPARK, secondaryColor: STEEL, size: 18, duration: 0.45, particles: 14, shake: 0.16 },
];

export default BUCKSHOT;
