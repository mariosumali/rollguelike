import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'piercing_core',
  name: 'Piercing Core',
  kind: 'supplement',
  rarity: 'epic',
  description: 'Adds pierce to all projectiles from this slot.',
  tags: ['supplement', 'pierce'],
  animation: {
    cast: 'muzzle_flash',
    hit: 'pierce_spark',
    evolution: 'harpoon_pull',
  },
  evolution: {
    name: 'Harpoon',
    flavor: 'Past pierce cap, pulls pierced foes toward you.',
  },
  tiers: [
    { effects: [{ verb: 'modifyProjectile', pierce: 1 }], damageMul: 1.0 },
    { effects: [{ verb: 'modifyProjectile', pierce: 2 }], damageMul: 1.0 },
    { effects: [{ verb: 'modifyProjectile', pierce: 3 }], damageMul: 1.0, note: 'Harpoon', params: { pullAfterCap: 1 } },
  ],
};

export default upgrade;
