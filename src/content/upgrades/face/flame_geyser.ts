import type { FaceUpgrade } from '../types';
import { BALANCE } from '../../../config/balance';

const { weaponTempo: tempo, weaponPrices: prices } = BALANCE.faceUpgrade;
const basePrice = { rare: prices.premiumRare };

const upgrades: FaceUpgrade[] = [
  {
    id: "flame_geyser",
    name: "Flame Geyser",
    description: "Calls fire eruptions under the enemy pack.",
    chainId: "flame_geyser",
    rank: 1,
    upgradesTo: "flame_geyser_ii",
    kind: 'replacer',
    rarity: 'rare',
    tags: ['fire', 'elemental', 'aoe', 'column'],
    animation: { cast: 'fire_cast', projectile: 'fire_proj', hit: 'fire_burst', evolution: 'phoenix_split' },
    icon: ['..............','......u.......','.....uuu......','....uhuhu.....','...uuhyhuu....','....uhuhu.....','.....uuu......','......u.......','.....uuu......','....u...u.....','...u.....u....','..............','..............','..............'],
    effect: { effects: [{ verb: 'flamePillar', count: 1, radius: 18, damageMul: 0.9, duration: 0.8, burnDps: 4, burnDur: 2 }], damageMul: 1.0, timing: tempo.deliberate },
    basePrice,
  },
  {
    id: "flame_geyser_ii",
    name: "Inferno Geyser",
    description: "Calls fire eruptions under the enemy pack. Refined into Inferno Geyser.",
    chainId: "flame_geyser",
    rank: 2,
    upgradesFrom: "flame_geyser",
    upgradesTo: "flame_geyser_iii",
    kind: 'replacer',
    rarity: 'rare',
    tags: ['fire', 'elemental', 'aoe', 'column'],
    animation: { cast: 'fire_cast', projectile: 'fire_proj', hit: 'fire_burst', evolution: 'phoenix_split' },
    icon: ['..............','......u.......','.....uuu......','....uhuhu.....','...uuhyhuu....','....uhuhu.....','.....uuu......','......u.......','.....uuu......','....u...u.....','...u.....u....','..............','..............','..............'],
    effect: { effects: [{ verb: 'flamePillar', count: 2, radius: 21, damageMul: 0.88, duration: 1.0, delay: 0.16, burnDps: 6, burnDur: 3 }], damageMul: 1.0, timing: tempo.heavy },
    basePrice,
  },
  {
    id: "flame_geyser_iii",
    name: "Magma Line",
    description: "Staggered geysers walk up the lane.",
    chainId: "flame_geyser",
    rank: 3,
    upgradesFrom: "flame_geyser_ii",
    kind: 'replacer',
    rarity: 'rare',
    tags: ['fire', 'elemental', 'aoe', 'column'],
    animation: { cast: 'fire_cast', projectile: 'fire_proj', hit: 'fire_burst', evolution: 'phoenix_split' },
    icon: ['..............','......u.......','.....uuu......','....uhuhu.....','...uuhyhuu....','....uhuhu.....','.....uuu......','......u.......','.....uuu......','....u...u.....','...u.....u....','..............','..............','..............'],
    effect: { effects: [{ verb: 'flamePillar', count: 4, radius: 24, damageMul: 0.9, duration: 1.2, delay: 0.15, burnDps: 8, burnDur: 4 }, { verb: 'flamePillar', count: 2, radius: 22, damageMul: 0.5, duration: 1.0, delay: 0.18, burnDps: 7, burnDur: 3 }], damageMul: 1.05, timing: tempo.artillery, note: 'Magma Line' },
    basePrice,
  }
];

export default upgrades;
