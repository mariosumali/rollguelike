import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'overclocked_spring',
  name: 'Overclocked Spring',
  kind: 'supplement',
  rarity: 'epic',
  description: 'Crits more often and releases extra weaker shots.',
  tags: ['supplement', 'crit', 'speed', 'precision'],
  animation: { cast: 'salvo_home', projectile: 'bolt_proj', hit: 'pierce_spark', evolution: 'triplet_flash' },
  evolution: { name: 'Hair Trigger', flavor: 'A guaranteed bonus shot releases with the slot.', extraEffects: [{ verb: 'modifyProjectile', extra: 1, damageMul: 0.9 }] },
  tiers: [
    { effects: [{ verb: 'modifyProjectile', crit: 0.15, damageMul: 0.95, speedMul: 1.15 }], damageMul: 1.0 },
    { effects: [{ verb: 'modifyProjectile', crit: 0.25, extra: 1, damageMul: 0.88, speedMul: 1.25 }], damageMul: 1.0 },
    { effects: [{ verb: 'modifyProjectile', crit: 0.4, extra: 1, damageMul: 0.82, speedMul: 1.35 }], damageMul: 1.0, note: 'Hair Trigger' },
  ],
  icon: ['..............','...cccccccc...','....c....c....','...cccccccc...','....c....c....','...cccccccc...','....c....c....','...cccccccc...','......yy......','.....y..y.....','......yy......','..............','..............','..............'],
};

export default upgrade;
