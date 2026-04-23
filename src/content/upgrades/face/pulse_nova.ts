import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'pulse_nova',
  name: 'Pulse Nova',
  kind: 'replacer',
  rarity: 'epic',
  description: 'Concentric AoE. Scales with tier.',
  tags: ['aoe', 'pulse'],
  animation: {
    cast: 'pulse_windup',
    hit: 'pulse_ring',
    evolution: 'supernova_ring',
  },
  evolution: {
    name: 'Supernova',
    flavor: 'Second delayed pulse.',
    extraEffects: [{ verb: 'pulse', radius: 90, damageMul: 1.0, delay: 0.5 }],
  },
  tiers: [
    { effects: [{ verb: 'pulse', radius: 45, damageMul: 1.0 }], damageMul: 1.0 },
    { effects: [{ verb: 'pulse', radius: 55, damageMul: 1.2 }], damageMul: 1.0 },
    { effects: [{ verb: 'pulse', radius: 65, damageMul: 1.4, knockback: 20 }], damageMul: 1.0 },
    { effects: [{ verb: 'pulse', radius: 75, damageMul: 1.6, knockback: 30 }], damageMul: 1.0 },
    { effects: [{ verb: 'pulse', radius: 90, damageMul: 2.0, knockback: 40, repeat: 2, delay: 0.5 }], damageMul: 1.0, note: 'Supernova' },
  ],
};

export default upgrade;
