import type { FaceUpgrade } from '../types';

const upgrades: FaceUpgrade[] = [
  {
    id: "pulse_nova",
    name: "Pulse Nova",
    description: "Concentric AoE. Scales with tier.",
    chainId: "pulse_nova",
    rank: 1,
    upgradesTo: "pulse_nova_ii",
    kind: 'replacer',
    rarity: 'epic',
    tags: ['aoe', 'pulse'],
    animation: {
    cast: 'pulse_windup',
    hit: 'pulse_ring',
    evolution: 'supernova_ring',
  },
    effect: { effects: [{ verb: 'pulse', radius: 45, damageMul: 1.0 }], damageMul: 1.0 },
  },
  {
    id: "pulse_nova_ii",
    name: "Surging Nova",
    description: "Concentric AoE. Scales with tier. Refined into Surging Nova.",
    chainId: "pulse_nova",
    rank: 2,
    upgradesFrom: "pulse_nova",
    upgradesTo: "pulse_nova_iii",
    kind: 'replacer',
    rarity: 'epic',
    tags: ['aoe', 'pulse'],
    animation: {
    cast: 'pulse_windup',
    hit: 'pulse_ring',
    evolution: 'supernova_ring',
  },
    effect: { effects: [{ verb: 'pulse', radius: 65, damageMul: 1.4, knockback: 20 }], damageMul: 1.0 },
  },
  {
    id: "pulse_nova_iii",
    name: "Supernova",
    description: "Second delayed pulse.",
    chainId: "pulse_nova",
    rank: 3,
    upgradesFrom: "pulse_nova_ii",
    kind: 'replacer',
    rarity: 'epic',
    tags: ['aoe', 'pulse'],
    animation: {
    cast: 'pulse_windup',
    hit: 'pulse_ring',
    evolution: 'supernova_ring',
  },
    effect: { effects: [{ verb: 'pulse', radius: 90, damageMul: 2.0, knockback: 40, repeat: 2, delay: 0.5 }, { verb: 'pulse', radius: 90, damageMul: 1.0, delay: 0.5 }], damageMul: 1.0, note: 'Supernova' },
  }
];

export default upgrades;
