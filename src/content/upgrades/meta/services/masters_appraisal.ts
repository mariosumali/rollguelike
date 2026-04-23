import type { ShopService } from '../types';

const service: ShopService = {
  id: 'masters_appraisal',
  name: "Master's Appraisal",
  description: 'Unlocks a second shop row of 4 Rare+ cards for 40g per visit.',
  rarity: 'epic',
  maxTier: 1,
  basePriceByTier: [220],
  effect: {
    kind: 'rarePlusRow',
    visitCost: 40,
    cardCount: 4,
  },
  tags: ['shop-expansion'],
};

export default service;
