import type { ShopService } from '../types';

const service: ShopService = {
  id: 'slot_expansion_bundle',
  name: 'Slot Expansion Bundle',
  description:
    'Raises the supplement cap across all six slots. T1: +1, T2: +2, T3: +3. Hard cap 4.',
  rarity: 'legendary',
  maxTier: 3,
  basePriceByTier: [150, 260, 380],
  effect: {
    kind: 'slotCapBundle',
    tier: 1,
    slotCapBoost: 1,
  },
  tags: ['slot-capacity'],
};

export default service;
