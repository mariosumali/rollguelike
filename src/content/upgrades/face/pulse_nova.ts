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
    effect: { effects: [{ verb: 'pulse', radius: 45, damageMul: 0.9 }], damageMul: 1.0, timing: tempo.deliberate },
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
    effect: { effects: [{ verb: 'pulse', radius: 65, damageMul: 1.2, knockback: 20 }], damageMul: 1.0, timing: tempo.heavy },
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
    effect: { effects: [{ verb: 'pulse', radius: 88, damageMul: 1.55, knockback: 40, repeat: 2, delay: 0.45 }], damageMul: 1.0, timing: tempo.artillery, note: 'Supernova' },
    basePrice,
  }
];

export default upgrades;
