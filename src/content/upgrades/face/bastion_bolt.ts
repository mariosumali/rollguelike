import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'bastion_bolt',
  name: 'Bastion Bolt',
  kind: 'replacer',
  rarity: 'rare',
  description: 'Knight only. Fires a sturdy piercing bolt and raises shield on impact.',
  tags: ['soldier', 'projectile', 'pierce', 'shield'],
  characterExclusive: 'soldier',
  animation: { cast: 'shield_cast', projectile: 'lance_trail', hit: 'impact_smash', evolution: 'bulwark_reflect' },
  evolution: { name: 'Bulwark Shot', flavor: 'The shot kicks enemies back and adds a reflect flash.', extraEffects: [{ verb: 'reflect', duration: 0.45, multiplier: 0.35, radius: 44 }] },
  tiers: [
    { effects: [{ verb: 'fireProjectile', count: 1, pierce: 2, speed: 0.9, size: 1.2 }, { verb: 'shield', stacks: 1 }], damageMul: 1.2 },
    { effects: [{ verb: 'fireProjectile', count: 2, pierce: 3, speed: 0.95, spread: Math.PI / 18, size: 1.25 }, { verb: 'shield', stacks: 1, reflect: 0.15 }], damageMul: 1.25 },
    { effects: [{ verb: 'fireProjectile', count: 3, pierce: 4, speed: 1.0, spread: Math.PI / 14, size: 1.35 }, { verb: 'shield', stacks: 2, reflect: 0.3 }, { verb: 'pulse', radius: 36, damageMul: 0.35, knockback: 28 }], damageMul: 1.3, note: 'Bulwark Shot' },
  ],
  icon: ['..............','.....rrrr.....','....rddddr....','...rddddddr...','...rddrrddr...','...rddddddr...','....rddddr....','.....rrrr.....','......dd......','......dd......','......dd......','..............','..............','..............'],
};

export default upgrade;
