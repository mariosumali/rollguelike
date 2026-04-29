import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'guardian_rim',
  name: 'Guardian Rim',
  kind: 'supplement',
  rarity: 'epic',
  description: 'Adds a defensive rim: shots grant shield and briefly reflect danger.',
  tags: ['supplement', 'shield', 'reflect', 'defense'],
  animation: { cast: 'shield_cast', projectile: 'std_proj', hit: 'shield_click', evolution: 'bulwark_reflect' },
  evolution: { name: 'Aegis Rim', flavor: 'The rim reflects with a wider flash.', extraEffects: [{ verb: 'reflect', duration: 0.8, multiplier: 0.5, radius: 58 }] },
  tiers: [
    { effects: [{ verb: 'shield', stacks: 1 }], damageMul: 1.0 },
    { effects: [{ verb: 'shield', stacks: 1, reflect: 0.2 }, { verb: 'reflect', duration: 0.35, multiplier: 0.25, radius: 38 }], damageMul: 1.0 },
    { effects: [{ verb: 'shield', stacks: 2, reflect: 0.35 }, { verb: 'reflect', duration: 0.65, multiplier: 0.45, radius: 54 }], damageMul: 1.0, note: 'Aegis Rim' },
  ],
  icon: ['..............','....rrrrrr....','...r......r...','..r..rrrr..r..','.r..r....r..r.','.r..r....r..r.','..r..rrrr..r..','...r......r...','....rrrrrr....','......r.......','......r.......','..............','..............','..............'],
};

export default upgrade;
