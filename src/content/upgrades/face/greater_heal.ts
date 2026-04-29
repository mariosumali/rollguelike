import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'greater_heal',
  name: 'Greater Heal',
  kind: 'replacer',
  rarity: 'rare',
  description: 'Restore HP. Higher tiers cleanse.',
  tags: ['heal', 'utility'],
  animation: {
    cast: 'heal_cast',
    hit: 'heal_glow',
    evolution: 'fountain_overflow',
  },
  evolution: {
    name: 'Fountain',
    flavor: 'Overheal converts to shield.',
    extraEffects: [{ verb: 'heal', amount: 0, overflowToShield: true }],
  },
  tiers: [
    { effects: [{ verb: 'heal', amount: 8 }], damageMul: 1.0, params: { perFace: 3 } },
    { effects: [{ verb: 'heal', amount: 16, cleanse: true }], damageMul: 1.0, params: { perFace: 5 } },
    { effects: [{ verb: 'heal', amount: 24, cleanse: true, overflowToShield: true }], damageMul: 1.0, params: { perFace: 7 }, note: 'Fountain' },
  ],
};

export default upgrade;
