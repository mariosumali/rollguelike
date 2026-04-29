import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'elemental_brand',
  name: 'Elemental Brand',
  kind: 'supplement',
  rarity: 'rare',
  description: 'Marks enemies; the next slot resolve deals double damage on mark.',
  tags: ['supplement', 'mark', 'combo'],
  animation: {
    cast: 'spark_cast',
    hit: 'pierce_spark',
    evolution: 'triplet_flash',
  },
  evolution: {
    name: 'Signature Brand',
    flavor: 'Marks can stack to triple damage; resets on detonation.',
  },
  tiers: [
    { effects: [{ verb: 'applyStatus', status: 'mark', power: 1, duration: 2.5 }], damageMul: 1.0, params: { markMul: 2.0 } },
    { effects: [{ verb: 'applyStatus', status: 'mark', power: 2, duration: 3 }], damageMul: 1.0, params: { markMul: 2.2 } },
    { effects: [{ verb: 'applyStatus', status: 'mark', power: 3, duration: 4 }], damageMul: 1.0, params: { markMul: 3.0 }, note: 'Signature Brand' },
  ],
};

export default upgrade;
