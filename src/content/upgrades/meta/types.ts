import type { Rarity } from '../../../types';

export type ShopServiceEffect =
  | { kind: 'priceDiscount'; tiers: number[] }
  | { kind: 'freeTierUp'; perVisit: number }
  | { kind: 'rarePlusRow'; visitCost: number; cardCount: number }
  | { kind: 'slotCapBundle'; tier: 1 | 2 | 3; slotCapBoost: number };

export interface ShopService {
  id: string;
  name: string;
  description: string;
  rarity: Rarity;
  maxTier: number;
  basePriceByTier: number[];
  effect: ShopServiceEffect;
  tags?: string[];
}
