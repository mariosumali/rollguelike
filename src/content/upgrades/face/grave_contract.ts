import type { FaceUpgrade } from '../types';
import { BALANCE } from '../../../config/balance';

const { weaponTempo: tempo, weaponPrices: prices } = BALANCE.faceUpgrade;
const basePrice = { epic: prices.standardEpic };

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
    effect: { effects: [{ verb: 'summonMinion', kind: 'wraith', count: 2, hp: 6, duration: 3.8, damagePerHit: 8, trigger: 'onResolve' }, { verb: 'statusAura', status: 'mark', radius: 46, power: 1.25, duration: 2.5 }, { verb: 'pulse', radius: 28, damageMul: 0.32, element: 'arcane' }], damageMul: 1.0, timing: tempo.deliberate },
    basePrice,
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
    effect: { effects: [{ verb: 'summonMinion', kind: 'wraith', count: 3, hp: 9, duration: 4.8, damagePerHit: 11, trigger: 'onResolve' }, { verb: 'statusAura', status: 'mark', radius: 62, power: 1.45, duration: 3 }, { verb: 'pulse', radius: 40, damageMul: 0.5, element: 'arcane' }], damageMul: 1.06, timing: tempo.heavy },
    basePrice,
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
    effect: { effects: [{ verb: 'summonMinion', kind: 'wraith', count: 5, hp: 12, duration: 6.0, damagePerHit: 15, trigger: 'onResolve' }, { verb: 'statusAura', status: 'mark', radius: 82, power: 1.85, duration: 3.5 }, { verb: 'pulse', radius: 58, damageMul: 0.78, element: 'arcane', knockback: 20 }], damageMul: 1.12, timing: tempo.artillery, note: 'Debt Collector' },
    basePrice,
  }
];

export default upgrades;
