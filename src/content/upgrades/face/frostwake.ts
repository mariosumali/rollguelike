import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'frostwake',
  name: 'Frostwake',
  kind: 'supplement',
  rarity: 'rare',
  description: 'This slot leaves icy wakes that visibly slow pursuit.',
  tags: ['supplement', 'ice', 'slow', 'elemental'],
  animation: { cast: 'frost_cast', projectile: 'frost_proj', hit: 'frost_shatter', evolution: 'zero_freeze' },
  evolution: { name: 'Whiteout Wake', flavor: 'A burst of frost freezes the closest cluster.', extraEffects: [{ verb: 'frostBurst', radius: 44, damageMul: 0.35, freezeDur: 0.5, slow: 0.65 }] },
  tiers: [
    { effects: [{ verb: 'groundZone', radius: 28, dps: 2, duration: 1.0, element: 'ice', slow: 0.25 }], damageMul: 1.0 },
    { effects: [{ verb: 'groundZone', radius: 38, dps: 3, duration: 1.4, element: 'ice', slow: 0.4 }, { verb: 'statusAura', status: 'slow', radius: 46, power: 0.4, duration: 1.2 }], damageMul: 1.0 },
    { effects: [{ verb: 'groundZone', radius: 48, dps: 4, duration: 1.8, element: 'ice', slow: 0.55 }, { verb: 'frostBurst', radius: 38, damageMul: 0.28, freezeDur: 0.4, slow: 0.6 }], damageMul: 1.0, note: 'Whiteout Wake' },
  ],
  icon: ['..............','..q.......q...','...q.....q....','....qqrqq.....','......q.......','....qqrqq.....','...q.....q....','..q.......q...','..............','....q....q....','.....qqqq.....','..............','..............','..............'],
};

export default upgrade;
