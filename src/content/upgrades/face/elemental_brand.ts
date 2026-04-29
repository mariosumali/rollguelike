import type { FaceUpgrade } from '../types';

const upgrades: FaceUpgrade[] = [
  {
    id: "elemental_brand",
    name: "Elemental Brand",
    description: "Marks enemies; the next slot resolve deals double damage on mark.",
    chainId: "elemental_brand",
    rank: 1,
    upgradesTo: "elemental_brand_ii",
    kind: 'supplement',
    rarity: 'rare',
    tags: ['supplement', 'mark', 'combo'],
    animation: {
    cast: 'spark_cast',
    hit: 'pierce_spark',
    evolution: 'triplet_flash',
  },
    effect: { effects: [{ verb: 'applyStatus', status: 'mark', power: 1, duration: 2.5 }], damageMul: 1.0, params: { markMul: 2.0 } },
  },
  {
    id: "elemental_brand_ii",
    name: "Catalyst Brand",
    description: "Marks enemies; the next slot resolve deals double damage on mark. Refined into Catalyst Brand.",
    chainId: "elemental_brand",
    rank: 2,
    upgradesFrom: "elemental_brand",
    upgradesTo: "elemental_brand_iii",
    kind: 'supplement',
    rarity: 'rare',
    tags: ['supplement', 'mark', 'combo'],
    animation: {
    cast: 'spark_cast',
    hit: 'pierce_spark',
    evolution: 'triplet_flash',
  },
    effect: { effects: [{ verb: 'applyStatus', status: 'mark', power: 2, duration: 3 }], damageMul: 1.0, params: { markMul: 2.2 } },
  },
  {
    id: "elemental_brand_iii",
    name: "Signature Brand",
    description: "Marks can stack to triple damage; resets on detonation.",
    chainId: "elemental_brand",
    rank: 3,
    upgradesFrom: "elemental_brand_ii",
    kind: 'supplement',
    rarity: 'rare',
    tags: ['supplement', 'mark', 'combo'],
    animation: {
    cast: 'spark_cast',
    hit: 'pierce_spark',
    evolution: 'triplet_flash',
  },
    effect: { effects: [{ verb: 'applyStatus', status: 'mark', power: 3, duration: 4 }], damageMul: 1.0, params: { markMul: 3.0 }, note: 'Signature Brand' },
  }
];

export default upgrades;
