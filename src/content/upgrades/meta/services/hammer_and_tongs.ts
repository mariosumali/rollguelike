import type { ShopService } from '../types';

const service: ShopService = {
  id: 'hammer_and_tongs',
  name: 'Hammer and Tongs',
  description: 'Each shop visit, bump one owned upgrade by one tier for free.',
  rarity: 'epic',
  maxTier: 1,
  basePriceByTier: [180],
  effect: {
    kind: 'freeTierUp',
    perVisit: 1,
  },
  tags: ['tiering'],
};

export default service;
