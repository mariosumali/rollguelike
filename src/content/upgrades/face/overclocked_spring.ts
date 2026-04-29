import type { FaceUpgrade } from '../types';

const upgrades: FaceUpgrade[] = [
  {
    id: "overclocked_spring",
    name: "Overclocked Spring",
    description: "Crits more often and releases extra weaker shots.",
    chainId: "overclocked_spring",
    rank: 1,
    upgradesTo: "overclocked_spring_ii",
    kind: 'supplement',
    rarity: 'epic',
    tags: ['supplement', 'crit', 'speed', 'precision'],
    animation: { cast: 'salvo_home', projectile: 'bolt_proj', hit: 'pierce_spark', evolution: 'triplet_flash' },
    icon: ['..............','...cccccccc...','....c....c....','...cccccccc...','....c....c....','...cccccccc...','....c....c....','...cccccccc...','......yy......','.....y..y.....','......yy......','..............','..............','..............'],
    effect: { effects: [{ verb: 'modifyProjectile', crit: 0.15, damageMul: 0.95, speedMul: 1.15 }], damageMul: 1.0 },
  },
  {
    id: "overclocked_spring_ii",
    name: "Tension Spring",
    description: "Crits more often and releases extra weaker shots. Refined into Tension Spring.",
    chainId: "overclocked_spring",
    rank: 2,
    upgradesFrom: "overclocked_spring",
    upgradesTo: "overclocked_spring_iii",
    kind: 'supplement',
    rarity: 'epic',
    tags: ['supplement', 'crit', 'speed', 'precision'],
    animation: { cast: 'salvo_home', projectile: 'bolt_proj', hit: 'pierce_spark', evolution: 'triplet_flash' },
    icon: ['..............','...cccccccc...','....c....c....','...cccccccc...','....c....c....','...cccccccc...','....c....c....','...cccccccc...','......yy......','.....y..y.....','......yy......','..............','..............','..............'],
    effect: { effects: [{ verb: 'modifyProjectile', crit: 0.25, extra: 1, damageMul: 0.88, speedMul: 1.25 }], damageMul: 1.0 },
  },
  {
    id: "overclocked_spring_iii",
    name: "Hair Trigger",
    description: "A guaranteed bonus shot releases with the slot.",
    chainId: "overclocked_spring",
    rank: 3,
    upgradesFrom: "overclocked_spring_ii",
    kind: 'supplement',
    rarity: 'epic',
    tags: ['supplement', 'crit', 'speed', 'precision'],
    animation: { cast: 'salvo_home', projectile: 'bolt_proj', hit: 'pierce_spark', evolution: 'triplet_flash' },
    icon: ['..............','...cccccccc...','....c....c....','...cccccccc...','....c....c....','...cccccccc...','....c....c....','...cccccccc...','......yy......','.....y..y.....','......yy......','..............','..............','..............'],
    effect: { effects: [{ verb: 'modifyProjectile', crit: 0.4, extra: 1, damageMul: 0.82, speedMul: 1.35 }, { verb: 'modifyProjectile', extra: 1, damageMul: 0.9 }], damageMul: 1.0, note: 'Hair Trigger' },
  }
];

export default upgrades;
