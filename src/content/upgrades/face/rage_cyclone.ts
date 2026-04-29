import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'rage_cyclone',
  name: 'Rage Cyclone',
  kind: 'replacer',
  rarity: 'epic',
  description: 'Berserker only. Spins a brutal orbit that ends in a rage pulse.',
  tags: ['berserker', 'rage', 'orbit', 'pulse'],
  characterExclusive: 'berserker',
  animation: { cast: 'rage_flame', projectile: 'fang_orbit', hit: 'impact_smash', evolution: 'rage_flame_max' },
  evolution: { name: 'Red Tempest', flavor: 'The cyclone detonates with a larger shove.', extraEffects: [{ verb: 'pulse', radius: 56, damageMul: 0.8, element: 'fire', knockback: 44 }] },
  tiers: [
    { effects: [{ verb: 'orbit', count: 3, radius: 32, rpm: 160, damageMul: 0.8, duration: 3.0, pierce: 1 }, { verb: 'pulse', radius: 26, damageMul: 0.3, knockback: 18 }], damageMul: 1.0 },
    { effects: [{ verb: 'orbit', count: 4, radius: 38, rpm: 190, damageMul: 1.0, duration: 3.8, pierce: 2 }, { verb: 'pulse', radius: 38, damageMul: 0.5, knockback: 28 }], damageMul: 1.05 },
    { effects: [{ verb: 'orbit', count: 6, radius: 44, rpm: 230, damageMul: 1.15, duration: 4.8, pierce: 2 }, { verb: 'pulse', radius: 52, damageMul: 0.75, element: 'fire', knockback: 40 }], damageMul: 1.1, note: 'Red Tempest' },
  ],
  icon: ['..............','...h......h...','.....h..h.....','..h...hh...h..','...hhhhhhhh...','..h...hh...h..','.....h..h.....','...h......h...','......h.......','.....h.h......','..............','..............','..............','..............'],
};

export default upgrade;
