import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'gold_bite',
  name: 'Gold Bite',
  kind: 'supplement',
  rarity: 'rare',
  description: 'Kills from this slot drop bonus gold.',
  tags: ['supplement', 'gold', 'economy'],
  animation: {
    cast: 'muzzle_flash',
    hit: 'coin_sparkle',
    evolution: 'midas_glow',
  },
  evolution: {
    name: 'Midas Touch',
    flavor: 'Guaranteed +1g on any kill from this slot.',
  },
  tiers: [
    { effects: [{ verb: 'spawnPickup', kind: 'gold', amount: 1, chance: 0.1 }], damageMul: 1.0 },
    { effects: [{ verb: 'spawnPickup', kind: 'gold', amount: 2, chance: 0.3 }], damageMul: 1.0 },
    { effects: [{ verb: 'spawnPickup', kind: 'gold', amount: 3, chance: 0.55 }, { verb: 'spawnPickup', kind: 'gold', amount: 1, chance: 1.0 }], damageMul: 1.0, note: 'Midas Touch' },
  ],
};

export default upgrade;
