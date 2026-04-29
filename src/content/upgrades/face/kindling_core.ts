import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'kindling_core',
  name: 'Kindling Core',
  kind: 'supplement',
  rarity: 'rare',
  description: 'Adds hot impact seeds and small flame pillars to this slot.',
  tags: ['supplement', 'fire', 'burn', 'aoe', 'elemental'],
  animation: { cast: 'fire_cast', projectile: 'fire_proj', hit: 'fire_burst', evolution: 'wildfire_spread' },
  evolution: { name: 'Coal Bed', flavor: 'Every cast leaves two burning pillars.', extraEffects: [{ verb: 'flamePillar', count: 1, radius: 18, damageMul: 0.35, duration: 0.8, burnDps: 4, burnDur: 2 }] },
  tiers: [
    { effects: [{ verb: 'modifyProjectile', burnDps: 4, burnDur: 2 }, { verb: 'flamePillar', count: 1, radius: 14, damageMul: 0.25, duration: 0.45 }], damageMul: 1.0 },
    { effects: [{ verb: 'modifyProjectile', burnDps: 6, burnDur: 3 }, { verb: 'flamePillar', count: 1, radius: 18, damageMul: 0.4, duration: 0.7, burnDps: 4, burnDur: 2 }], damageMul: 1.0 },
    { effects: [{ verb: 'modifyProjectile', burnDps: 9, burnDur: 4 }, { verb: 'flamePillar', count: 2, radius: 20, damageMul: 0.45, duration: 0.9, delay: 0.16, burnDps: 5, burnDur: 3 }], damageMul: 1.0, note: 'Coal Bed' },
  ],
  icon: ['..............','......u.......','.....u.u......','....uhyhu.....','...uhyyyhu....','....uhyhu.....','.....u.u......','......u.......','..............','....u....u....','.....uuuu.....','..............','..............','..............'],
};

export default upgrade;
