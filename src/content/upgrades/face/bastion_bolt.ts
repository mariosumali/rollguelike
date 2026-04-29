import type { FaceUpgrade } from '../types';
import { BALANCE } from '../../../config/balance';

const { weaponTempo: tempo, weaponPrices: prices } = BALANCE.faceUpgrade;
const basePrice = { rare: prices.premiumRare };

const upgrades: FaceUpgrade[] = [
  {
    id: "bastion_bolt",
    name: "Bastion Bolt",
    description: "Knight only. Fires a sturdy piercing bolt and raises shield on impact.",
    chainId: "bastion_bolt",
    rank: 1,
    upgradesTo: "bastion_bolt_ii",
    kind: 'replacer',
    rarity: 'rare',
    tags: ['soldier', 'projectile', 'pierce', 'shield'],
    characterExclusive: 'soldier',
    animation: { cast: 'shield_cast', projectile: 'lance_trail', hit: 'impact_smash', evolution: 'bulwark_reflect' },
    icon: ['..............','.....rrrr.....','....rddddr....','...rddddddr...','...rddrrddr...','...rddddddr...','....rddddr....','.....rrrr.....','......dd......','......dd......','......dd......','..............','..............','..............'],
    effect: { effects: [{ verb: 'fireProjectile', count: 1, pierce: 2, speed: 1.1, size: 1.1 }, { verb: 'shield', stacks: 1 }], damageMul: 1.05, timing: tempo.deliberate },
    basePrice,
  },
  {
    id: "bastion_bolt_ii",
    name: "Shieldbreaker Bolt",
    description: "Knight only. Fires a sturdy piercing bolt and raises shield on impact. Refined into Shieldbreaker Bolt.",
    chainId: "bastion_bolt",
    rank: 2,
    upgradesFrom: "bastion_bolt",
    upgradesTo: "bastion_bolt_iii",
    kind: 'replacer',
    rarity: 'rare',
    tags: ['soldier', 'projectile', 'pierce', 'shield'],
    characterExclusive: 'soldier',
    animation: { cast: 'shield_cast', projectile: 'lance_trail', hit: 'impact_smash', evolution: 'bulwark_reflect' },
    icon: ['..............','.....rrrr.....','....rddddr....','...rddddddr...','...rddrrddr...','...rddddddr...','....rddddr....','.....rrrr.....','......dd......','......dd......','......dd......','..............','..............','..............'],
    effect: { effects: [{ verb: 'fireProjectile', count: 2, pierce: 3, speed: 1.15, spread: Math.PI / 18, size: 1.18 }, { verb: 'shield', stacks: 1, reflect: 0.15 }], damageMul: 1.08, timing: tempo.heavy },
    basePrice,
  },
  {
    id: "bastion_bolt_iii",
    name: "Bulwark Shot",
    description: "The shot kicks enemies back and adds a reflect flash.",
    chainId: "bastion_bolt",
    rank: 3,
    upgradesFrom: "bastion_bolt_ii",
    kind: 'replacer',
    rarity: 'rare',
    tags: ['soldier', 'projectile', 'pierce', 'shield'],
    characterExclusive: 'soldier',
    animation: { cast: 'shield_cast', projectile: 'lance_trail', hit: 'impact_smash', evolution: 'bulwark_reflect' },
    icon: ['..............','.....rrrr.....','....rddddr....','...rddddddr...','...rddrrddr...','...rddddddr...','....rddddr....','.....rrrr.....','......dd......','......dd......','......dd......','..............','..............','..............'],
    effect: { effects: [{ verb: 'fireProjectile', count: 3, pierce: 4, speed: 1.2, spread: Math.PI / 14, size: 1.25 }, { verb: 'shield', stacks: 2, reflect: 0.3 }, { verb: 'pulse', radius: 34, damageMul: 0.3, knockback: 28 }, { verb: 'reflect', duration: 0.45, multiplier: 0.35, radius: 44 }], damageMul: 1.12, timing: tempo.artillery, note: 'Bulwark Shot' },
    basePrice,
  }
];

export default upgrades;
