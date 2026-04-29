import type { FaceUpgrade } from '../types';

const upgrades: FaceUpgrade[] = [
  {
    id: "crit_edge",
    name: "Crit Edge",
    description: "Sharpens this slot for a chance to land devastating hits.",
    chainId: "crit_edge",
    rank: 1,
    upgradesTo: "crit_edge_ii",
    kind: 'supplement',
    rarity: 'common',
    tags: ['supplement', 'crit'],
    animation: {
    cast: 'muzzle_flash',
    hit: 'pierce_spark',
    evolution: 'pierce_spark',
  },
    effect: { effects: [{ verb: 'modifyProjectile', crit: 0.04 }], damageMul: 1.0 },
  },
  {
    id: "crit_edge_ii",
    name: "Keen Edge",
    description: "Sharpens this slot for a chance to land devastating hits. Refined into Keen Edge.",
    chainId: "crit_edge",
    rank: 2,
    upgradesFrom: "crit_edge",
    upgradesTo: "crit_edge_iii",
    kind: 'supplement',
    rarity: 'common',
    tags: ['supplement', 'crit'],
    animation: {
    cast: 'muzzle_flash',
    hit: 'pierce_spark',
    evolution: 'pierce_spark',
  },
    effect: { effects: [{ verb: 'modifyProjectile', crit: 0.11 }], damageMul: 1.0 },
  },
  {
    id: "crit_edge_iii",
    name: "Deadly Edge",
    description: "Crits ignore armor entirely.",
    chainId: "crit_edge",
    rank: 3,
    upgradesFrom: "crit_edge_ii",
    kind: 'supplement',
    rarity: 'common',
    tags: ['supplement', 'crit'],
    animation: {
    cast: 'muzzle_flash',
    hit: 'pierce_spark',
    evolution: 'pierce_spark',
  },
    effect: { effects: [{ verb: 'modifyProjectile', crit: 0.22 }, { verb: 'modifyProjectile', crit: 0.08 }], damageMul: 1.0, note: 'Deadly Edge' },
  }
];

export default upgrades;
