import type { FaceUpgrade } from '../types';
import { BALANCE } from '../../../config/balance';

const { weaponTempo: tempo, weaponPrices: prices } = BALANCE.faceUpgrade;
const basePrice = { epic: prices.standardEpic };

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
    effect: { effects: [{ verb: 'pulse', radius: 54, damageMul: 1.35, knockback: 18 }], damageMul: 1.0, timing: tempo.deliberate },
    basePrice,
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
    effect: { effects: [{ verb: 'pulse', radius: 76, damageMul: 1.75, knockback: 32 }], damageMul: 1.04, timing: tempo.heavy },
    basePrice,
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
    effect: { effects: [{ verb: 'pulse', radius: 104, damageMul: 2.15, knockback: 50, repeat: 2, delay: 0.38 }], damageMul: 1.08, timing: tempo.artillery, note: 'Supernova' },
    basePrice,
  }
];

export default upgrades;
