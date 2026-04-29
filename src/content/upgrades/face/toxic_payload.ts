import type { FaceUpgrade } from '../types';

const upgrades: FaceUpgrade[] = [
  {
    id: "toxic_payload",
    name: "Toxic Payload",
    description: "Adds poison clouds and stronger rot to this slot.",
    chainId: "toxic_payload",
    rank: 1,
    upgradesTo: "toxic_payload_ii",
    kind: 'supplement',
    rarity: 'rare',
    tags: ['supplement', 'poison', 'dot', 'aoe', 'elemental'],
    animation: { cast: 'toxin_cast', projectile: 'toxin_proj', hit: 'toxin_drip', evolution: 'plague_cloud' },
    icon: ['..............','.....zzzz.....','....zmmmmz....','...zmmnnmmz...','...zmmnnmmz...','....zmmmmz....','.....zzzz.....','......z.......','.....z.z......','....z...z.....','..............','..............','..............','..............'],
    effect: { effects: [{ verb: 'applyStatus', status: 'poison', power: 3, duration: 3 }, { verb: 'groundZone', radius: 24, dps: 3, duration: 0.9, element: 'poison', slow: 0.05 }], damageMul: 1.0 },
  },
  {
    id: "toxic_payload_ii",
    name: "Toxic Canister",
    description: "Adds poison clouds and stronger rot to this slot. Refined into Toxic Canister.",
    chainId: "toxic_payload",
    rank: 2,
    upgradesFrom: "toxic_payload",
    upgradesTo: "toxic_payload_iii",
    kind: 'supplement',
    rarity: 'rare',
    tags: ['supplement', 'poison', 'dot', 'aoe', 'elemental'],
    animation: { cast: 'toxin_cast', projectile: 'toxin_proj', hit: 'toxin_drip', evolution: 'plague_cloud' },
    icon: ['..............','.....zzzz.....','....zmmmmz....','...zmmnnmmz...','...zmmnnmmz...','....zmmmmz....','.....zzzz.....','......z.......','.....z.z......','....z...z.....','..............','..............','..............','..............'],
    effect: { effects: [{ verb: 'statusAura', status: 'poison', radius: 40, power: 4, duration: 4 }, { verb: 'groundZone', radius: 34, dps: 4, duration: 1.2, element: 'poison', slow: 0.1 }], damageMul: 1.0 },
  },
  {
    id: "toxic_payload_iii",
    name: "Spore Burst",
    description: "The cloud blooms wider and lingers.",
    chainId: "toxic_payload",
    rank: 3,
    upgradesFrom: "toxic_payload_ii",
    kind: 'supplement',
    rarity: 'rare',
    tags: ['supplement', 'poison', 'dot', 'aoe', 'elemental'],
    animation: { cast: 'toxin_cast', projectile: 'toxin_proj', hit: 'toxin_drip', evolution: 'plague_cloud' },
    icon: ['..............','.....zzzz.....','....zmmmmz....','...zmmnnmmz...','...zmmnnmmz...','....zmmmmz....','.....zzzz.....','......z.......','.....z.z......','....z...z.....','..............','..............','..............','..............'],
    effect: { effects: [{ verb: 'statusAura', status: 'poison', radius: 56, power: 6, duration: 5 }, { verb: 'groundZone', radius: 46, dps: 6, duration: 1.6, element: 'poison', slow: 0.18 }, { verb: 'statusAura', status: 'poison', radius: 54, power: 3, duration: 4 }], damageMul: 1.0, note: 'Spore Burst' },
  }
];

export default upgrades;
