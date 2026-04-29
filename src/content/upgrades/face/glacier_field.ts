import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'glacier_field',
  name: 'Glacier Field',
  kind: 'replacer',
  rarity: 'rare',
  description: 'Spreads a frozen field that slows and locks groups.',
  tags: ['ice', 'elemental', 'aoe', 'slow'],
  animation: { cast: 'frost_cast', projectile: 'frost_proj', hit: 'frost_shatter', evolution: 'zero_freeze' },
  evolution: {
    name: 'Permafrost',
    flavor: 'A wide frost bloom freezes clustered enemies.',
    extraEffects: [{ verb: 'frostBurst', radius: 68, damageMul: 0.75, freezeDur: 1.1, slow: 0.7 }],
  },
  tiers: [
    { effects: [{ verb: 'groundZone', radius: 38, dps: 4, duration: 1.5, element: 'ice', slow: 0.35 }], damageMul: 1.0 },
    { effects: [{ verb: 'groundZone', radius: 50, dps: 5, duration: 2.0, element: 'ice', slow: 0.5 }, { verb: 'frostBurst', radius: 34, damageMul: 0.45, freezeDur: 0.45, slow: 0.5 }], damageMul: 1.05 },
    { effects: [{ verb: 'groundZone', radius: 64, dps: 7, duration: 2.4, element: 'ice', slow: 0.65 }, { verb: 'frostBurst', radius: 58, damageMul: 0.65, freezeDur: 0.9, slow: 0.7 }], damageMul: 1.1, note: 'Permafrost' },
  ],
  icon: ['..............','......q.......','....qqrqq.....','...qr...rq....','..qr..q..rq...','...qr...rq....','....qqrqq.....','......q.......','....q...q.....','...q.....q....','..q.......q...','..............','..............','..............'],
};

export default upgrade;
