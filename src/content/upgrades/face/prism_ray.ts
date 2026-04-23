import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'prism_ray',
  name: 'Prism Ray',
  kind: 'replacer',
  rarity: 'epic',
  description: 'Continuous refracted beam that ticks damage through pierced foes.',
  tags: ['beam', 'pierce', 'arcane'],
  animation: {
    cast: 'prism_cast',
    hit: 'prism_hit',
    evolution: 'rainbow_lance',
  },
  evolution: {
    name: 'Rainbow Lance',
    flavor: 'Beam widens and splits across the spectrum.',
    extraEffects: [{ verb: 'beam', width: 8, dps: 18, duration: 0.8, pierce: 10, element: 'arcane' }],
  },
  tiers: [
    { effects: [{ verb: 'beam', width: 3, dps: 8, duration: 0.4, pierce: 3, element: 'arcane' }], damageMul: 1.0 },
    { effects: [{ verb: 'beam', width: 4, dps: 10, duration: 0.45, pierce: 4, element: 'arcane' }], damageMul: 1.05 },
    { effects: [{ verb: 'beam', width: 5, dps: 12, duration: 0.5, pierce: 5, element: 'arcane' }], damageMul: 1.1 },
    { effects: [{ verb: 'beam', width: 6, dps: 14, duration: 0.6, pierce: 7, element: 'arcane' }], damageMul: 1.15 },
    { effects: [{ verb: 'beam', width: 7, dps: 16, duration: 0.7, pierce: 8, element: 'arcane' }], damageMul: 1.25, note: 'Rainbow Lance' },
  ],
};

export default upgrade;
