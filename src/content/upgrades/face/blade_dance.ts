import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'blade_dance',
  name: 'Blade Dance',
  kind: 'replacer',
  rarity: 'epic',
  description: 'Summons spinning blades around the die for close-range control.',
  tags: ['orbit', 'persistent', 'physical'],
  animation: { cast: 'orbit_cast', projectile: 'fang_orbit', hit: 'fang_bite', evolution: 'eternal_circle' },
  evolution: { name: 'Whirling Guard', flavor: 'Blades linger longer and bite harder.', extraEffects: [{ verb: 'shield', stacks: 1 }] },
  tiers: [
    { effects: [{ verb: 'orbit', count: 3, radius: 30, rpm: 140, damageMul: 0.75, duration: 3.2, pierce: 1 }], damageMul: 1.0 },
    { effects: [{ verb: 'orbit', count: 4, radius: 35, rpm: 165, damageMul: 0.9, duration: 4.0, pierce: 1 }], damageMul: 1.05 },
    { effects: [{ verb: 'orbit', count: 6, radius: 40, rpm: 190, damageMul: 1.05, duration: 5.0, pierce: 2 }, { verb: 'shield', stacks: 1 }], damageMul: 1.1, note: 'Whirling Guard' },
  ],
  icon: ['..............','...e......e...','.....e..e.....','......ee......','..e..eeee..e..','......ee......','.....e..e.....','...e......e...','......e.......','.....e.e......','..............','..............','..............','..............'],
};

export default upgrade;
