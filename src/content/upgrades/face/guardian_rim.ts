import type { FaceUpgrade } from '../types';

const upgrades: FaceUpgrade[] = [
  {
    id: "guardian_rim",
    name: "Guardian Rim",
    description: "Adds a defensive rim: shots grant shield and briefly reflect danger.",
    chainId: "guardian_rim",
    rank: 1,
    upgradesTo: "guardian_rim_ii",
    kind: 'supplement',
    rarity: 'epic',
    tags: ['supplement', 'shield', 'reflect', 'defense'],
    animation: { cast: 'shield_cast', projectile: 'std_proj', hit: 'shield_click', evolution: 'bulwark_reflect' },
    icon: ['..............','....rrrrrr....','...r......r...','..r..rrrr..r..','.r..r....r..r.','.r..r....r..r.','..r..rrrr..r..','...r......r...','....rrrrrr....','......r.......','......r.......','..............','..............','..............'],
    effect: { effects: [{ verb: 'shield', stacks: 1 }], damageMul: 1.0 },
  },
  {
    id: "guardian_rim_ii",
    name: "Warding Rim",
    description: "Adds a defensive rim: shots grant shield and briefly reflect danger. Refined into Warding Rim.",
    chainId: "guardian_rim",
    rank: 2,
    upgradesFrom: "guardian_rim",
    upgradesTo: "guardian_rim_iii",
    kind: 'supplement',
    rarity: 'epic',
    tags: ['supplement', 'shield', 'reflect', 'defense'],
    animation: { cast: 'shield_cast', projectile: 'std_proj', hit: 'shield_click', evolution: 'bulwark_reflect' },
    icon: ['..............','....rrrrrr....','...r......r...','..r..rrrr..r..','.r..r....r..r.','.r..r....r..r.','..r..rrrr..r..','...r......r...','....rrrrrr....','......r.......','......r.......','..............','..............','..............'],
    effect: { effects: [{ verb: 'shield', stacks: 1, reflect: 0.2 }, { verb: 'reflect', duration: 0.35, multiplier: 0.25, radius: 38 }], damageMul: 1.0 },
  },
  {
    id: "guardian_rim_iii",
    name: "Aegis Rim",
    description: "The rim reflects with a wider flash.",
    chainId: "guardian_rim",
    rank: 3,
    upgradesFrom: "guardian_rim_ii",
    kind: 'supplement',
    rarity: 'epic',
    tags: ['supplement', 'shield', 'reflect', 'defense'],
    animation: { cast: 'shield_cast', projectile: 'std_proj', hit: 'shield_click', evolution: 'bulwark_reflect' },
    icon: ['..............','....rrrrrr....','...r......r...','..r..rrrr..r..','.r..r....r..r.','.r..r....r..r.','..r..rrrr..r..','...r......r...','....rrrrrr....','......r.......','......r.......','..............','..............','..............'],
    effect: { effects: [{ verb: 'shield', stacks: 2, reflect: 0.35 }, { verb: 'reflect', duration: 0.65, multiplier: 0.45, radius: 54 }, { verb: 'reflect', duration: 0.8, multiplier: 0.5, radius: 58 }], damageMul: 1.0, note: 'Aegis Rim' },
  }
];

export default upgrades;
