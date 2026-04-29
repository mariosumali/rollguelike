import type { FaceUpgrade } from '../types';

const upgrades: FaceUpgrade[] = [
  {
    id: "frostwake",
    name: "Frostwake",
    description: "This slot leaves icy wakes that visibly slow pursuit.",
    chainId: "frostwake",
    rank: 1,
    upgradesTo: "frostwake_ii",
    kind: 'supplement',
    rarity: 'rare',
    tags: ['supplement', 'ice', 'slow', 'elemental'],
    animation: { cast: 'frost_cast', projectile: 'frost_proj', hit: 'frost_shatter', evolution: 'zero_freeze' },
    icon: ['..............','..q.......q...','...q.....q....','....qqrqq.....','......q.......','....qqrqq.....','...q.....q....','..q.......q...','..............','....q....q....','.....qqqq.....','..............','..............','..............'],
    effect: { effects: [{ verb: 'groundZone', radius: 28, dps: 2, duration: 1.0, element: 'ice', slow: 0.25 }], damageMul: 1.0 },
  },
  {
    id: "frostwake_ii",
    name: "Glacial Wake",
    description: "This slot leaves icy wakes that visibly slow pursuit. Refined into Glacial Wake.",
    chainId: "frostwake",
    rank: 2,
    upgradesFrom: "frostwake",
    upgradesTo: "frostwake_iii",
    kind: 'supplement',
    rarity: 'rare',
    tags: ['supplement', 'ice', 'slow', 'elemental'],
    animation: { cast: 'frost_cast', projectile: 'frost_proj', hit: 'frost_shatter', evolution: 'zero_freeze' },
    icon: ['..............','..q.......q...','...q.....q....','....qqrqq.....','......q.......','....qqrqq.....','...q.....q....','..q.......q...','..............','....q....q....','.....qqqq.....','..............','..............','..............'],
    effect: { effects: [{ verb: 'groundZone', radius: 38, dps: 3, duration: 1.4, element: 'ice', slow: 0.4 }, { verb: 'statusAura', status: 'slow', radius: 46, power: 0.4, duration: 1.2 }], damageMul: 1.0 },
  },
  {
    id: "frostwake_iii",
    name: "Whiteout Wake",
    description: "A burst of frost freezes the closest cluster.",
    chainId: "frostwake",
    rank: 3,
    upgradesFrom: "frostwake_ii",
    kind: 'supplement',
    rarity: 'rare',
    tags: ['supplement', 'ice', 'slow', 'elemental'],
    animation: { cast: 'frost_cast', projectile: 'frost_proj', hit: 'frost_shatter', evolution: 'zero_freeze' },
    icon: ['..............','..q.......q...','...q.....q....','....qqrqq.....','......q.......','....qqrqq.....','...q.....q....','..q.......q...','..............','....q....q....','.....qqqq.....','..............','..............','..............'],
    effect: { effects: [{ verb: 'groundZone', radius: 48, dps: 4, duration: 1.8, element: 'ice', slow: 0.55 }, { verb: 'frostBurst', radius: 38, damageMul: 0.28, freezeDur: 0.4, slow: 0.6 }, { verb: 'frostBurst', radius: 44, damageMul: 0.35, freezeDur: 0.5, slow: 0.65 }], damageMul: 1.0, note: 'Whiteout Wake' },
  }
];

export default upgrades;
