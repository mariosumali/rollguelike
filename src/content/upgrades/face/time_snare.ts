import type { FaceUpgrade } from '../types';

const upgrades: FaceUpgrade[] = [
  {
    id: "time_snare",
    name: "Time Snare",
    description: "Clockmaker only. Delayed frost fields lock enemies in place.",
    chainId: "time_snare",
    rank: 1,
    upgradesTo: "time_snare_ii",
    kind: 'replacer',
    rarity: 'epic',
    tags: ['clockmaker', 'ice', 'slow', 'freeze', 'control'],
    characterExclusive: 'clockmaker',
    animation: { cast: 'mirror_flash', projectile: 'frost_proj', hit: 'zero_freeze', evolution: 'event_mirror' },
    icon: ['..............','....rrrrrr....','...r..qq..r...','..r.qrrrrq.r..','..r.qr..rq.r..','..r.qr..rq.r..','..r.qrrrrq.r..','...r..qq..r...','....rrrrrr....','......q.......','......q.......','..............','..............','..............'],
    effect: { effects: [{ verb: 'groundZone', radius: 34, dps: 3, duration: 1.3, element: 'ice', slow: 0.45 }, { verb: 'applyStatus', status: 'slow', power: 0.45, duration: 1.5 }], damageMul: 1.0 },
  },
  {
    id: "time_snare_ii",
    name: "Time Latch",
    description: "Clockmaker only. Delayed frost fields lock enemies in place. Refined into Time Latch.",
    chainId: "time_snare",
    rank: 2,
    upgradesFrom: "time_snare",
    upgradesTo: "time_snare_iii",
    kind: 'replacer',
    rarity: 'epic',
    tags: ['clockmaker', 'ice', 'slow', 'freeze', 'control'],
    characterExclusive: 'clockmaker',
    animation: { cast: 'mirror_flash', projectile: 'frost_proj', hit: 'zero_freeze', evolution: 'event_mirror' },
    icon: ['..............','....rrrrrr....','...r..qq..r...','..r.qrrrrq.r..','..r.qr..rq.r..','..r.qr..rq.r..','..r.qrrrrq.r..','...r..qq..r...','....rrrrrr....','......q.......','......q.......','..............','..............','..............'],
    effect: { effects: [{ verb: 'groundZone', radius: 48, dps: 4, duration: 1.8, element: 'ice', slow: 0.6 }, { verb: 'frostBurst', radius: 38, damageMul: 0.35, freezeDur: 0.55, slow: 0.65 }], damageMul: 1.0 },
  },
  {
    id: "time_snare_iii",
    name: "Stopped Moment",
    description: "A delayed pulse freezes the snared pack.",
    chainId: "time_snare",
    rank: 3,
    upgradesFrom: "time_snare_ii",
    kind: 'replacer',
    rarity: 'epic',
    tags: ['clockmaker', 'ice', 'slow', 'freeze', 'control'],
    characterExclusive: 'clockmaker',
    animation: { cast: 'mirror_flash', projectile: 'frost_proj', hit: 'zero_freeze', evolution: 'event_mirror' },
    icon: ['..............','....rrrrrr....','...r..qq..r...','..r.qrrrrq.r..','..r.qr..rq.r..','..r.qr..rq.r..','..r.qrrrrq.r..','...r..qq..r...','....rrrrrr....','......q.......','......q.......','..............','..............','..............'],
    effect: { effects: [{ verb: 'groundZone', radius: 62, dps: 6, duration: 2.4, element: 'ice', slow: 0.75 }, { verb: 'frostBurst', radius: 54, damageMul: 0.5, freezeDur: 0.9, slow: 0.8 }, { verb: 'pulse', radius: 46, damageMul: 0.35, element: 'ice', delay: 0.2, repeat: 2 }, { verb: 'pulse', radius: 50, damageMul: 0.45, element: 'ice', delay: 0.25, repeat: 2, knockback: 8 }], damageMul: 1.0, note: 'Stopped Moment' },
  }
];

export default upgrades;
