import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'time_snare',
  name: 'Time Snare',
  kind: 'replacer',
  rarity: 'epic',
  description: 'Clockmaker only. Delayed frost fields lock enemies in place.',
  tags: ['clockmaker', 'ice', 'slow', 'freeze', 'control'],
  characterExclusive: 'clockmaker',
  animation: { cast: 'mirror_flash', projectile: 'frost_proj', hit: 'zero_freeze', evolution: 'event_mirror' },
  evolution: { name: 'Stopped Moment', flavor: 'A delayed pulse freezes the snared pack.', extraEffects: [{ verb: 'pulse', radius: 50, damageMul: 0.45, element: 'ice', delay: 0.25, repeat: 2, knockback: 8 }] },
  tiers: [
    { effects: [{ verb: 'groundZone', radius: 34, dps: 3, duration: 1.3, element: 'ice', slow: 0.45 }, { verb: 'applyStatus', status: 'slow', power: 0.45, duration: 1.5 }], damageMul: 1.0 },
    { effects: [{ verb: 'groundZone', radius: 48, dps: 4, duration: 1.8, element: 'ice', slow: 0.6 }, { verb: 'frostBurst', radius: 38, damageMul: 0.35, freezeDur: 0.55, slow: 0.65 }], damageMul: 1.0 },
    { effects: [{ verb: 'groundZone', radius: 62, dps: 6, duration: 2.4, element: 'ice', slow: 0.75 }, { verb: 'frostBurst', radius: 54, damageMul: 0.5, freezeDur: 0.9, slow: 0.8 }, { verb: 'pulse', radius: 46, damageMul: 0.35, element: 'ice', delay: 0.2, repeat: 2 }], damageMul: 1.0, note: 'Stopped Moment' },
  ],
  icon: ['..............','....rrrrrr....','...r..qq..r...','..r.qrrrrq.r..','..r.qr..rq.r..','..r.qr..rq.r..','..r.qrrrrq.r..','...r..qq..r...','....rrrrrr....','......q.......','......q.......','..............','..............','..............'],
};

export default upgrade;
