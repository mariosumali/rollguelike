import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'venom_bloom',
  name: 'Venom Bloom',
  kind: 'replacer',
  rarity: 'rare',
  description: 'Plants toxic blooms that rot enemies inside the cloud.',
  tags: ['poison', 'elemental', 'dot', 'aoe', 'nature'],
  animation: { cast: 'toxin_cast', projectile: 'toxin_proj', hit: 'toxin_drip', evolution: 'plague_cloud' },
  evolution: { name: 'Plague Garden', flavor: 'Two clouds bloom and slow the pack.', extraEffects: [{ verb: 'groundZone', radius: 46, dps: 7, duration: 2.0, element: 'poison', slow: 0.25 }] },
  tiers: [
    { effects: [{ verb: 'groundZone', radius: 34, dps: 5, duration: 1.4, element: 'poison', slow: 0.1 }, { verb: 'applyStatus', status: 'poison', power: 3, duration: 3 }], damageMul: 1.0 },
    { effects: [{ verb: 'groundZone', radius: 44, dps: 7, duration: 1.9, element: 'poison', slow: 0.2 }, { verb: 'statusAura', status: 'poison', radius: 52, power: 4, duration: 4 }], damageMul: 1.05 },
    { effects: [{ verb: 'groundZone', radius: 58, dps: 10, duration: 2.4, element: 'poison', slow: 0.3 }, { verb: 'statusAura', status: 'poison', radius: 70, power: 6, duration: 5 }], damageMul: 1.1, note: 'Plague Garden' },
  ],
  icon: ['..............','......z.......','....zzzzz.....','...z.m.m.z....','..zz..z..zz...','...z.m.m.z....','....zzzzz.....','......z.......','.....z.z......','....z...z.....','...z.....z....','..............','..............','..............'],
};

export default upgrade;
