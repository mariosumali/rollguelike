import type { FaceUpgrade } from '../types';

const upgrades: FaceUpgrade[] = [
  {
    id: "glacier_field",
    name: "Glacier Field",
    description: "Spreads a frozen field that slows and locks groups.",
    chainId: "glacier_field",
    rank: 1,
    upgradesTo: "glacier_field_ii",
    kind: 'replacer',
    rarity: 'rare',
    tags: ['ice', 'elemental', 'aoe', 'slow'],
    animation: { cast: 'frost_cast', projectile: 'frost_proj', hit: 'frost_shatter', evolution: 'zero_freeze' },
    icon: ['..............','......q.......','....qqrqq.....','...qr...rq....','..qr..q..rq...','...qr...rq....','....qqrqq.....','......q.......','....q...q.....','...q.....q....','..q.......q...','..............','..............','..............'],
    effect: { effects: [{ verb: 'groundZone', radius: 38, dps: 4, duration: 1.5, element: 'ice', slow: 0.35 }], damageMul: 1.0 },
  },
  {
    id: "glacier_field_ii",
    name: "Frostfield",
    description: "Spreads a frozen field that slows and locks groups. Refined into Frostfield.",
    chainId: "glacier_field",
    rank: 2,
    upgradesFrom: "glacier_field",
    upgradesTo: "glacier_field_iii",
    kind: 'replacer',
    rarity: 'rare',
    tags: ['ice', 'elemental', 'aoe', 'slow'],
    animation: { cast: 'frost_cast', projectile: 'frost_proj', hit: 'frost_shatter', evolution: 'zero_freeze' },
    icon: ['..............','......q.......','....qqrqq.....','...qr...rq....','..qr..q..rq...','...qr...rq....','....qqrqq.....','......q.......','....q...q.....','...q.....q....','..q.......q...','..............','..............','..............'],
    effect: { effects: [{ verb: 'groundZone', radius: 50, dps: 5, duration: 2.0, element: 'ice', slow: 0.5 }, { verb: 'frostBurst', radius: 34, damageMul: 0.45, freezeDur: 0.45, slow: 0.5 }], damageMul: 1.05 },
  },
  {
    id: "glacier_field_iii",
    name: "Permafrost",
    description: "A wide frost bloom freezes clustered enemies.",
    chainId: "glacier_field",
    rank: 3,
    upgradesFrom: "glacier_field_ii",
    kind: 'replacer',
    rarity: 'rare',
    tags: ['ice', 'elemental', 'aoe', 'slow'],
    animation: { cast: 'frost_cast', projectile: 'frost_proj', hit: 'frost_shatter', evolution: 'zero_freeze' },
    icon: ['..............','......q.......','....qqrqq.....','...qr...rq....','..qr..q..rq...','...qr...rq....','....qqrqq.....','......q.......','....q...q.....','...q.....q....','..q.......q...','..............','..............','..............'],
    effect: { effects: [{ verb: 'groundZone', radius: 64, dps: 7, duration: 2.4, element: 'ice', slow: 0.65 }, { verb: 'frostBurst', radius: 58, damageMul: 0.65, freezeDur: 0.9, slow: 0.7 }, { verb: 'frostBurst', radius: 68, damageMul: 0.75, freezeDur: 1.1, slow: 0.7 }], damageMul: 1.1, note: 'Permafrost' },
  }
];

export default upgrades;
