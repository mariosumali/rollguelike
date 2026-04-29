import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'grave_contract',
  name: 'Grave Contract',
  kind: 'replacer',
  rarity: 'epic',
  description: 'Necromancer only. Signs away souls for wraith volleys and marked prey.',
  tags: ['necromancer', 'summon', 'arcane', 'mark'],
  characterExclusive: 'necromancer',
  animation: { cast: 'wraith_bloom', projectile: 'minion_trail', hit: 'wraith_strike', evolution: 'lich_march' },
  evolution: { name: 'Debt Collector', flavor: 'Marked enemies are swarmed by extra wraiths.', extraEffects: [{ verb: 'statusAura', status: 'mark', radius: 70, power: 1.4, duration: 3 }] },
  tiers: [
    { effects: [{ verb: 'summonMinion', kind: 'wraith', count: 1, hp: 5, duration: 3.2, damagePerHit: 6, trigger: 'onResolve' }, { verb: 'statusAura', status: 'mark', radius: 38, power: 1.1, duration: 2 }], damageMul: 1.0 },
    { effects: [{ verb: 'summonMinion', kind: 'wraith', count: 2, hp: 7, duration: 4.0, damagePerHit: 8, trigger: 'onResolve' }, { verb: 'statusAura', status: 'mark', radius: 52, power: 1.25, duration: 2.5 }], damageMul: 1.0 },
    { effects: [{ verb: 'summonMinion', kind: 'wraith', count: 3, hp: 9, duration: 5.0, damagePerHit: 10, trigger: 'onResolve' }, { verb: 'statusAura', status: 'mark', radius: 70, power: 1.45, duration: 3 }], damageMul: 1.0, note: 'Debt Collector' },
  ],
  icon: ['..............','....HHHHHH....','...HddddddH...','..HddHddHddH..','..HddddddddH..','..HddHHHHddH..','..HddddddddH..','...HddddddH...','....HHHHHH....','......H.......','......H.......','..............','..............','..............'],
};

export default upgrade;
