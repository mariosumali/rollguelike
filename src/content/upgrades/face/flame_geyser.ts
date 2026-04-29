import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'flame_geyser',
  name: 'Flame Geyser',
  kind: 'replacer',
  rarity: 'rare',
  description: 'Calls fire eruptions under the enemy pack.',
  tags: ['fire', 'elemental', 'aoe', 'column'],
  animation: { cast: 'fire_cast', projectile: 'fire_proj', hit: 'fire_burst', evolution: 'phoenix_split' },
  evolution: {
    name: 'Magma Line',
    flavor: 'Staggered geysers walk up the lane.',
    extraEffects: [{ verb: 'flamePillar', count: 2, radius: 22, damageMul: 0.65, duration: 1.0, delay: 0.18, burnDps: 7, burnDur: 3 }],
  },
  tiers: [
    { effects: [{ verb: 'flamePillar', count: 1, radius: 18, damageMul: 1.0, duration: 0.8, burnDps: 4, burnDur: 2 }], damageMul: 1.0 },
    { effects: [{ verb: 'flamePillar', count: 2, radius: 21, damageMul: 1.0, duration: 1.0, delay: 0.16, burnDps: 6, burnDur: 3 }], damageMul: 1.05 },
    { effects: [{ verb: 'flamePillar', count: 4, radius: 24, damageMul: 1.05, duration: 1.2, delay: 0.15, burnDps: 8, burnDur: 4 }], damageMul: 1.1, note: 'Magma Line' },
  ],
  icon: ['..............','......u.......','.....uuu......','....uhuhu.....','...uuhyhuu....','....uhuhu.....','.....uuu......','......u.......','.....uuu......','....u...u.....','...u.....u....','..............','..............','..............'],
};

export default upgrade;
