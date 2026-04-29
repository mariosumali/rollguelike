import type { FaceUpgrade } from '../types';

const upgrades: FaceUpgrade[] = [
  {
    id: "grave_contract",
    name: "Grave Contract",
    description: "Necromancer only. Signs away souls for wraith volleys and marked prey.",
    chainId: "grave_contract",
    rank: 1,
    upgradesTo: "grave_contract_ii",
    kind: 'replacer',
    rarity: 'epic',
    tags: ['necromancer', 'summon', 'arcane', 'mark'],
    characterExclusive: 'necromancer',
    animation: { cast: 'wraith_bloom', projectile: 'minion_trail', hit: 'wraith_strike', evolution: 'lich_march' },
    icon: ['..............','....HHHHHH....','...HddddddH...','..HddHddHddH..','..HddddddddH..','..HddHHHHddH..','..HddddddddH..','...HddddddH...','....HHHHHH....','......H.......','......H.......','..............','..............','..............'],
    effect: { effects: [{ verb: 'summonMinion', kind: 'wraith', count: 1, hp: 5, duration: 3.2, damagePerHit: 6, trigger: 'onResolve' }, { verb: 'statusAura', status: 'mark', radius: 38, power: 1.1, duration: 2 }], damageMul: 1.0 },
  },
  {
    id: "grave_contract_ii",
    name: "Wraith Contract",
    description: "Necromancer only. Signs away souls for wraith volleys and marked prey. Refined into Wraith Contract.",
    chainId: "grave_contract",
    rank: 2,
    upgradesFrom: "grave_contract",
    upgradesTo: "grave_contract_iii",
    kind: 'replacer',
    rarity: 'epic',
    tags: ['necromancer', 'summon', 'arcane', 'mark'],
    characterExclusive: 'necromancer',
    animation: { cast: 'wraith_bloom', projectile: 'minion_trail', hit: 'wraith_strike', evolution: 'lich_march' },
    icon: ['..............','....HHHHHH....','...HddddddH...','..HddHddHddH..','..HddddddddH..','..HddHHHHddH..','..HddddddddH..','...HddddddH...','....HHHHHH....','......H.......','......H.......','..............','..............','..............'],
    effect: { effects: [{ verb: 'summonMinion', kind: 'wraith', count: 2, hp: 7, duration: 4.0, damagePerHit: 8, trigger: 'onResolve' }, { verb: 'statusAura', status: 'mark', radius: 52, power: 1.25, duration: 2.5 }], damageMul: 1.0 },
  },
  {
    id: "grave_contract_iii",
    name: "Debt Collector",
    description: "Marked enemies are swarmed by extra wraiths.",
    chainId: "grave_contract",
    rank: 3,
    upgradesFrom: "grave_contract_ii",
    kind: 'replacer',
    rarity: 'epic',
    tags: ['necromancer', 'summon', 'arcane', 'mark'],
    characterExclusive: 'necromancer',
    animation: { cast: 'wraith_bloom', projectile: 'minion_trail', hit: 'wraith_strike', evolution: 'lich_march' },
    icon: ['..............','....HHHHHH....','...HddddddH...','..HddHddHddH..','..HddddddddH..','..HddHHHHddH..','..HddddddddH..','...HddddddH...','....HHHHHH....','......H.......','......H.......','..............','..............','..............'],
    effect: { effects: [{ verb: 'summonMinion', kind: 'wraith', count: 3, hp: 9, duration: 5.0, damagePerHit: 10, trigger: 'onResolve' }, { verb: 'statusAura', status: 'mark', radius: 70, power: 1.45, duration: 3 }, { verb: 'statusAura', status: 'mark', radius: 70, power: 1.4, duration: 3 }], damageMul: 1.0, note: 'Debt Collector' },
  }
];

export default upgrades;
