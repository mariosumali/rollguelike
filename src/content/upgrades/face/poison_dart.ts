import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'poison_dart',
  name: 'Poison Dart',
  kind: 'replacer',
  rarity: 'common',
  description: 'Toxin darts leave visible poison clouds and plague zones.',
  tags: ['projectile', 'poison', 'elemental', 'dot'],
  animation: {
    cast: 'toxin_cast',
    projectile: 'toxin_proj',
    hit: 'toxin_drip',
    evolution: 'plague_cloud',
  },
  evolution: {
    name: 'Plague Carrier',
    flavor: 'A venom cloud blooms under the enemy pack.',
    extraEffects: [{ verb: 'groundZone', radius: 52, dps: 8, duration: 2.2, element: 'poison', slow: 0.2 }],
  },
  tiers: [
    { effects: [{ verb: 'fireProjectile', count: 1, element: 'poison' }, { verb: 'applyStatus', status: 'poison', power: 2, duration: 3 }], damageMul: 1.0 },
    { effects: [{ verb: 'fireProjectile', count: 2, element: 'poison', spread: Math.PI / 12 }, { verb: 'applyStatus', status: 'poison', power: 4, duration: 4 }, { verb: 'groundZone', radius: 30, dps: 4, duration: 1.4, element: 'poison', slow: 0.15 }], damageMul: 1.1 },
    { effects: [{ verb: 'fireProjectile', count: 3, element: 'poison', spread: Math.PI / 8 }, { verb: 'applyStatus', status: 'poison', power: 7, duration: 5 }, { verb: 'groundZone', radius: 48, dps: 7, duration: 2.2, element: 'poison', slow: 0.25 }], damageMul: 1.2, note: 'Plague Carrier' },
  ],
};

export default upgrade;
