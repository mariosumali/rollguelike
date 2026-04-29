import type { FaceUpgrade } from '../types';

const upgrades: FaceUpgrade[] = [
  {
    id: "kindling_core",
    name: "Kindling Core",
    description: "Adds hot impact seeds and small flame pillars to this slot.",
    chainId: "kindling_core",
    rank: 1,
    upgradesTo: "kindling_core_ii",
    kind: 'supplement',
    rarity: 'rare',
    tags: ['supplement', 'fire', 'burn', 'aoe', 'elemental'],
    animation: { cast: 'fire_cast', projectile: 'fire_proj', hit: 'fire_burst', evolution: 'wildfire_spread' },
    icon: ['..............','......u.......','.....u.u......','....uhyhu.....','...uhyyyhu....','....uhyhu.....','.....u.u......','......u.......','..............','....u....u....','.....uuuu.....','..............','..............','..............'],
    effect: { effects: [{ verb: 'modifyProjectile', burnDps: 4, burnDur: 2 }, { verb: 'flamePillar', count: 1, radius: 14, damageMul: 0.25, duration: 0.45 }], damageMul: 1.0 },
  },
  {
    id: "kindling_core_ii",
    name: "Blazing Core",
    description: "Adds hot impact seeds and small flame pillars to this slot. Refined into Blazing Core.",
    chainId: "kindling_core",
    rank: 2,
    upgradesFrom: "kindling_core",
    upgradesTo: "kindling_core_iii",
    kind: 'supplement',
    rarity: 'rare',
    tags: ['supplement', 'fire', 'burn', 'aoe', 'elemental'],
    animation: { cast: 'fire_cast', projectile: 'fire_proj', hit: 'fire_burst', evolution: 'wildfire_spread' },
    icon: ['..............','......u.......','.....u.u......','....uhyhu.....','...uhyyyhu....','....uhyhu.....','.....u.u......','......u.......','..............','....u....u....','.....uuuu.....','..............','..............','..............'],
    effect: { effects: [{ verb: 'modifyProjectile', burnDps: 6, burnDur: 3 }, { verb: 'flamePillar', count: 1, radius: 18, damageMul: 0.4, duration: 0.7, burnDps: 4, burnDur: 2 }], damageMul: 1.0 },
  },
  {
    id: "kindling_core_iii",
    name: "Coal Bed",
    description: "Every cast leaves two burning pillars.",
    chainId: "kindling_core",
    rank: 3,
    upgradesFrom: "kindling_core_ii",
    kind: 'supplement',
    rarity: 'rare',
    tags: ['supplement', 'fire', 'burn', 'aoe', 'elemental'],
    animation: { cast: 'fire_cast', projectile: 'fire_proj', hit: 'fire_burst', evolution: 'wildfire_spread' },
    icon: ['..............','......u.......','.....u.u......','....uhyhu.....','...uhyyyhu....','....uhyhu.....','.....u.u......','......u.......','..............','....u....u....','.....uuuu.....','..............','..............','..............'],
    effect: { effects: [{ verb: 'modifyProjectile', burnDps: 9, burnDur: 4 }, { verb: 'flamePillar', count: 2, radius: 20, damageMul: 0.45, duration: 0.9, delay: 0.16, burnDps: 5, burnDur: 3 }, { verb: 'flamePillar', count: 1, radius: 18, damageMul: 0.35, duration: 0.8, burnDps: 4, burnDur: 2 }], damageMul: 1.0, note: 'Coal Bed' },
  }
];

export default upgrades;
