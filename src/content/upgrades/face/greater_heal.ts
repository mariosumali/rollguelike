import type { FaceUpgrade } from '../types';

const upgrades: FaceUpgrade[] = [
  {
    id: "greater_heal",
    name: "Greater Heal",
    description: "Restore HP. Higher tiers cleanse.",
    chainId: "greater_heal",
    rank: 1,
    upgradesTo: "greater_heal_ii",
    kind: 'replacer',
    rarity: 'rare',
    tags: ['heal', 'utility'],
    animation: {
    cast: 'heal_cast',
    hit: 'heal_glow',
    evolution: 'fountain_overflow',
  },
    effect: { effects: [{ verb: 'heal', amount: 8 }, { verb: 'pulse', radius: 28, damageMul: 0.3, element: 'arcane', knockback: 12 }], damageMul: 1.0, params: { perFace: 3 } },
  },
  {
    id: "greater_heal_ii",
    name: "Cleansing Heal",
    description: "Restore HP. Higher tiers cleanse. Refined into Cleansing Heal.",
    chainId: "greater_heal",
    rank: 2,
    upgradesFrom: "greater_heal",
    upgradesTo: "greater_heal_iii",
    kind: 'replacer',
    rarity: 'rare',
    tags: ['heal', 'utility'],
    animation: {
    cast: 'heal_cast',
    hit: 'heal_glow',
    evolution: 'fountain_overflow',
  },
    effect: { effects: [{ verb: 'heal', amount: 16, cleanse: true }, { verb: 'pulse', radius: 40, damageMul: 0.48, element: 'arcane', knockback: 20 }], damageMul: 1.0, params: { perFace: 5 } },
  },
  {
    id: "greater_heal_iii",
    name: "Fountain",
    description: "Overheal converts to shield.",
    chainId: "greater_heal",
    rank: 3,
    upgradesFrom: "greater_heal_ii",
    kind: 'replacer',
    rarity: 'rare',
    tags: ['heal', 'utility'],
    animation: {
    cast: 'heal_cast',
    hit: 'heal_glow',
    evolution: 'fountain_overflow',
  },
    effect: { effects: [{ verb: 'heal', amount: 24, cleanse: true, overflowToShield: true }, { verb: 'pulse', radius: 56, damageMul: 0.75, element: 'arcane', knockback: 32 }, { verb: 'heal', amount: 0, overflowToShield: true }], damageMul: 1.0, params: { perFace: 7 }, note: 'Fountain' },
  }
];

export default upgrades;
