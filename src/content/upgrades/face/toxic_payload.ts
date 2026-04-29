import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'toxic_payload',
  name: 'Toxic Payload',
  kind: 'supplement',
  rarity: 'rare',
  description: 'Adds poison clouds and stronger rot to this slot.',
  tags: ['supplement', 'poison', 'dot', 'aoe', 'elemental'],
  animation: { cast: 'toxin_cast', projectile: 'toxin_proj', hit: 'toxin_drip', evolution: 'plague_cloud' },
  evolution: { name: 'Spore Burst', flavor: 'The cloud blooms wider and lingers.', extraEffects: [{ verb: 'statusAura', status: 'poison', radius: 54, power: 3, duration: 4 }] },
  tiers: [
    { effects: [{ verb: 'applyStatus', status: 'poison', power: 3, duration: 3 }, { verb: 'groundZone', radius: 24, dps: 3, duration: 0.9, element: 'poison', slow: 0.05 }], damageMul: 1.0 },
    { effects: [{ verb: 'statusAura', status: 'poison', radius: 40, power: 4, duration: 4 }, { verb: 'groundZone', radius: 34, dps: 4, duration: 1.2, element: 'poison', slow: 0.1 }], damageMul: 1.0 },
    { effects: [{ verb: 'statusAura', status: 'poison', radius: 56, power: 6, duration: 5 }, { verb: 'groundZone', radius: 46, dps: 6, duration: 1.6, element: 'poison', slow: 0.18 }], damageMul: 1.0, note: 'Spore Burst' },
  ],
  icon: ['..............','.....zzzz.....','....zmmmmz....','...zmmnnmmz...','...zmmnnmmz...','....zmmmmz....','.....zzzz.....','......z.......','.....z.z......','....z...z.....','..............','..............','..............','..............'],
};

export default upgrade;
