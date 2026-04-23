import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'poison_dart',
  name: 'Poison Dart',
  kind: 'replacer',
  rarity: 'common',
  description: 'Toxin-coated dart. Poison stacks rot enemies over time.',
  tags: ['projectile', 'poison', 'elemental', 'dot'],
  animation: {
    cast: 'toxin_cast',
    projectile: 'toxin_proj',
    hit: 'toxin_drip',
    evolution: 'plague_cloud',
  },
  evolution: {
    name: 'Plague Carrier',
    flavor: 'Kills release a venom cloud that spreads stacks.',
    extraEffects: [{ verb: 'pulse', radius: 28, damageMul: 0.6, element: 'poison' }],
  },
  tiers: [
    { effects: [{ verb: 'fireProjectile', count: 1, element: 'poison' }, { verb: 'applyStatus', status: 'poison', power: 2, duration: 3 }], damageMul: 1.0 },
    { effects: [{ verb: 'fireProjectile', count: 2, element: 'poison' }, { verb: 'applyStatus', status: 'poison', power: 3, duration: 3 }], damageMul: 1.0 },
    { effects: [{ verb: 'fireProjectile', count: 2, element: 'poison' }, { verb: 'applyStatus', status: 'poison', power: 4, duration: 4 }], damageMul: 1.1 },
    { effects: [{ verb: 'fireProjectile', count: 3, element: 'poison' }, { verb: 'applyStatus', status: 'poison', power: 5, duration: 4 }], damageMul: 1.1 },
    { effects: [{ verb: 'fireProjectile', count: 3, element: 'poison' }, { verb: 'applyStatus', status: 'poison', power: 7, duration: 5 }], damageMul: 1.2, note: 'Plague Carrier' },
  ],
};

export default upgrade;
