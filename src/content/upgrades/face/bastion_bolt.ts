import type { FaceUpgrade } from '../types';

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
    effect: { effects: [{ verb: 'fireProjectile', count: 1, pierce: 2, speed: 0.9, size: 1.2 }, { verb: 'shield', stacks: 1 }], damageMul: 1.2 },
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
    effect: { effects: [{ verb: 'fireProjectile', count: 2, pierce: 3, speed: 0.95, spread: Math.PI / 18, size: 1.25 }, { verb: 'shield', stacks: 1, reflect: 0.15 }], damageMul: 1.25 },
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
    effect: { effects: [{ verb: 'fireProjectile', count: 3, pierce: 4, speed: 1.0, spread: Math.PI / 14, size: 1.35 }, { verb: 'shield', stacks: 2, reflect: 0.3 }, { verb: 'pulse', radius: 36, damageMul: 0.35, knockback: 28 }, { verb: 'reflect', duration: 0.45, multiplier: 0.35, radius: 44 }], damageMul: 1.3, note: 'Bulwark Shot' },
  }
];

export default upgrades;
