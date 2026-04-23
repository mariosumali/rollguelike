import type { ShopService } from '../types';

const service: ShopService = {
  id: 'forge_loyalty',
  name: 'Forge Loyalty',
  description: 'Permanent shop discount. T1: −5%, T2: −10%, T3: −15%.',
  rarity: 'rare',
  maxTier: 3,
  basePriceByTier: [80, 140, 220],
  effect: {
    kind: 'priceDiscount',
    tiers: [0.05, 0.1, 0.15],
  },
  tags: ['economy'],
};

export default service;
