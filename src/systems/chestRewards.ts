import { BALANCE } from '../config/balance';
import { getCharacter } from '../content/characters/registry';
import { getFaceName } from '../content/upgrades/faceNames';
import { getFaceRank, getFaceUpgrade, listFaceUpgrades } from '../content/upgrades/faceRegistry';
import { listUpgrades } from '../content/upgrades/registry';
import { canPlaceSupplement, isSlotLocked, slotAllowedTags } from './slots';
import type {
  CasinoChestReward,
  CasinoChestTier,
  CasinoGameId,
  CasinoGameResult,
  CasinoIntermissionState,
  CasinoLuckGrade,
  CasinoOutcome,
  CasinoRewardKind,
  MetaState,
  Rarity,
  RunState,
  Upgrade,
} from '../types';
import type { FaceUpgrade } from '../content/upgrades/types';

type Rng = () => number;
type CasinoRewardCategory = CasinoRewardKind;

type ChestRewardPattern = readonly CasinoRewardCategory[];

const CHEST_REWARD_PATTERNS: Record<CasinoChestTier, Record<string, number>> = {
  rusty: {
    gold: 99_000,
    'gold,bauble': 70,
    bauble: 45,
    'gold,face': 10,
    face: 6,
    'gold,relic': 2,
    relic: 1,
    'gold,bauble,face': 1,
  },
  copper: {
    gold: 97_000,
    'gold,gold': 900,
    bauble: 780,
    'gold,bauble': 680,
    heal: 500,
    face: 100,
    'gold,face': 28,
    relic: 6,
    'gold,relic': 4,
    'gold,bauble,face': 2,
  },
  bronze: {
    gold: 94_500,
    'gold,gold': 2_000,
    bauble: 1_650,
    'gold,bauble': 1_400,
    heal: 350,
    face: 55,
    'gold,face': 30,
    relic: 8,
    'gold,relic': 5,
    'gold,bauble,face': 2,
  },
  iron: {
    gold: 73_000,
    'gold,gold': 11_000,
    bauble: 8_000,
    'gold,bauble': 5_200,
    heal: 520,
    face: 115,
    'gold,face': 60,
    relic: 14,
    'gold,relic': 8,
    'gold,bauble,face': 2,
  },
  silver: {
    gold: 54_000,
    'gold,gold': 22_000,
    bauble: 14_000,
    'gold,bauble': 9_200,
    heal: 500,
    face: 180,
    'gold,face': 90,
    relic: 18,
    'gold,relic': 10,
    'gold,bauble,face': 2,
  },
  gold: {
    'gold,bauble': 39_000,
    face: 25_000,
    'gold,face': 24_000,
    gold: 7_000,
    bauble: 4_000,
    'gold,bauble,face': 820,
    relic: 80,
    'gold,relic': 60,
    'gold,face,relic': 25,
    'gold,bauble,relic': 15,
  },
  diamond: {
    'gold,bauble,face': 24_000,
    'gold,face': 22_000,
    'gold,bauble': 21_000,
    'gold,gold,bauble,face': 8_000,
    face: 12_000,
    bauble: 8_000,
    gold: 3_800,
    'gold,bauble,face,heal': 1_000,
    relic: 150,
    'gold,relic': 110,
    'gold,face,relic': 65,
    'gold,bauble,relic': 45,
  },
  jackpot: {
    'gold,bauble,face': 35_000,
    'gold,face': 19_000,
    'gold,bauble': 18_000,
    'gold,gold,bauble,face': 12_000,
    face: 6_000,
    'gold,bauble,face,heal': 5_000,
    'gold,bauble,face,relic': 500,
    'gold,face,relic': 240,
    relic: 160,
    'gold,bauble,relic': 100,
  },
};

const CHEST_BUNDLE_GOLD_MUL: Record<CasinoChestTier, number> = {
  rusty: 0.55,
  copper: 0.55,
  bronze: 0.55,
  iron: 0.58,
  silver: 0.6,
  gold: 0.62,
  diamond: 0.64,
  jackpot: 0.65,
};

export const CASINO_GAME_LABELS: Record<CasinoGameId, string> = {
  slots: 'Slot Machine',
  roulette: 'Roulette',
  blackjack: 'Blackjack',
  coinFlip: 'Coin Flip',
};

export const CHEST_TIER_LABELS: Record<CasinoChestTier, string> = {
  rusty: 'Rusty Chest',
  copper: 'Copper Chest',
  bronze: 'Bronze Chest',
  iron: 'Iron Chest',
  silver: 'Silver Chest',
  gold: 'Gold Chest',
  diamond: 'Diamond Chest',
  jackpot: 'Jackpot Chest',
};

export const LUCK_GRADE_LABELS: Record<CasinoLuckGrade, string> = {
  COLD: 'Cold',
  WARM: 'Warm',
  HOT: 'Hot',
  LUCKY: 'Lucky',
  JACKPOT: 'Jackpot',
};

export interface RoundPerformanceInput {
  clearRatio: number;
  hpPct: number;
  damageTaken: number;
  eliteKills: number;
}

function pickWeighted<T extends string>(rng: Rng, weights: Record<T, number>): T {
  const entries = Object.entries(weights) as [T, number][];
  const total = entries.reduce((sum, [, w]) => sum + Math.max(0, w), 0);
  let roll = rng() * total;
  for (const [id, weight] of entries) {
    roll -= Math.max(0, weight);
    if (roll <= 0) return id;
  }
  return entries[0]![0];
}

function intRange(rng: Rng, range: readonly [number, number]): number {
  const [min, max] = range;
  return min + Math.floor(rng() * (max - min + 1));
}

function scaledRange(range: readonly [number, number], mul: number): readonly [number, number] {
  return [
    Math.max(1, Math.floor(range[0] * mul)),
    Math.max(1, Math.floor(range[1] * mul)),
  ];
}

function parseRewardPattern(raw: string): ChestRewardPattern {
  return raw.split(',') as CasinoRewardCategory[];
}

function tierIndex(tier: CasinoChestTier): number {
  return BALANCE.casino.chestTierOrder.indexOf(tier);
}

export function adjustChestTier(tier: CasinoChestTier, delta: number): CasinoChestTier {
  const order = BALANCE.casino.chestTierOrder;
  const next = Math.max(0, Math.min(order.length - 1, tierIndex(tier) + delta));
  return order[next]!;
}

export function computeCasinoLuck(input: RoundPerformanceInput): {
  grade: CasinoLuckGrade;
  score: number;
} {
  const speedScore = Math.max(0, Math.min(35, (1.35 - input.clearRatio) * 35));
  const hpScore = Math.max(0, Math.min(35, input.hpPct * 35));
  const noDamageBonus = input.damageTaken <= 0 ? 18 : Math.max(0, 14 - input.damageTaken * 0.45);
  const eliteBonus = Math.min(12, input.eliteKills * 4);
  const score = Math.max(0, Math.min(100, Math.round(speedScore + hpScore + noDamageBonus + eliteBonus)));
  const grade: CasinoLuckGrade =
    score >= 92 ? 'JACKPOT' :
      score >= 76 ? 'LUCKY' :
        score >= 58 ? 'HOT' :
          score >= 38 ? 'WARM' :
            'COLD';
  return { grade, score };
}

export function createCasinoIntermission(
  run: RunState,
  rng: Rng,
  performance: RoundPerformanceInput,
): CasinoIntermissionState {
  const luck = computeCasinoLuck(performance);
  const baseChestTier = pickWeighted(rng, BALANCE.casino.baseChestWeightsByLuck[luck.grade]);
  const offeredGames = [...BALANCE.casino.offeredGames];
  const game = offeredGames[Math.floor(rng() * offeredGames.length)] ?? 'slots';
  return {
    wave: run.wave,
    phase: 'play',
    game,
    offeredGames,
    luckGrade: luck.grade,
    luckScore: luck.score,
    chestTier: baseChestTier,
    baseChestTier,
    seed: Math.floor(rng() * 0x7fffffff),
  };
}

function result(outcome: CasinoOutcome, label: string, chestDelta: number): CasinoGameResult {
  return { outcome, label, chestDelta };
}

function blackjackChoiceResult(choice?: string): CasinoGameResult | null {
  if (!choice?.startsWith('blackjack:')) return null;
  const [, action, playerRaw, dealerRaw, playerCardsRaw, dealerCardsRaw] = choice.split(':');
  const playerTotal = Number(playerRaw);
  const dealerTotal = Number(dealerRaw);
  const playerCards = Number(playerCardsRaw);
  const dealerCards = Number(dealerCardsRaw);
  if (
    !Number.isFinite(playerTotal) ||
    !Number.isFinite(dealerTotal) ||
    !Number.isFinite(playerCards) ||
    !Number.isFinite(dealerCards)
  ) {
    return null;
  }
  const natural = playerCards === 2 && playerTotal === 21;
  const dealerNatural = dealerCards === 2 && dealerTotal === 21;
  if (playerTotal > 21) return result('miss', action === 'hit' ? 'Hit bust' : 'Bust hand', -1);
  if (natural && !dealerNatural) return result('jackpot', 'Blackjack', 2);
  if (dealerTotal > 21) return result('big', 'Dealer busts', 1);
  if (dealerTotal === playerTotal) return result('small', 'Push hand', 0);
  if (playerTotal > dealerTotal) return result('big', 'Beat the dealer', 1);
  return result('miss', 'Dealer wins', -1);
}

export function rollCasinoGameResult(
  game: CasinoGameId,
  luckScore: number,
  rng: Rng,
  choice?: string,
): CasinoGameResult {
  const luck = Math.max(0, Math.min(1, luckScore / 100));
  const roll = rng();
  switch (game) {
    case 'slots': {
      if (roll < 0.025 + luck * 0.06) return result('jackpot', 'Triple sevens', 2);
      if (roll < 0.16 + luck * 0.16) return result('big', 'Matched reels', 1);
      if (roll < 0.48 + luck * 0.18) return result('small', 'Cherry pair', 0);
      return result('miss', 'Cold reels', -1);
    }
    case 'roulette': {
      const bet = choice === 'green' ? 'green' : choice === 'black' ? 'black' : 'red';
      const winChance = bet === 'green' ? 0.085 + luck * 0.05 : 0.46 + luck * 0.12;
      if (roll < winChance && bet === 'green') return result('jackpot', 'Green zero hit', 2);
      if (roll < winChance) return result('big', `${bet.toUpperCase()} pays`, 1);
      if (roll < winChance + 0.2 + luck * 0.08) return result('small', 'Near miss rebate', 0);
      return result('miss', 'House wins', -1);
    }
    case 'blackjack': {
      const blackjackResult = blackjackChoiceResult(choice);
      if (blackjackResult) return blackjackResult;
      if (roll < 0.08 + luck * 0.08) return result('jackpot', 'Natural twenty-one', 2);
      if (roll < 0.36 + luck * 0.2) return result('big', 'Dealer busts', 1);
      if (roll < 0.66 + luck * 0.18) return result('small', 'Push hand', 0);
      return result('miss', 'Bust hand', -1);
    }
    case 'coinFlip': {
      if (roll < 0.05 + luck * 0.05) return result('jackpot', 'Coin lands on edge', 2);
      if (roll < 0.5 + luck * 0.18) return result('big', 'Called it', 1);
      if (roll < 0.64 + luck * 0.1) return result('small', 'House rebate', 0);
      return result('miss', 'Bad call', -1);
    }
  }
}

function canOfferRunUpgrade(run: RunState, meta: MetaState, u: Upgrade): boolean {
  if (u.category !== 'bauble' && u.category !== 'relic') return false;
  if (u.characterExclusive && u.characterExclusive !== run.characterId) return false;
  const applied = run.upgrades.find((a) => a.id === u.id);
  if (applied && applied.stacks >= u.maxStack) return false;
  if (u.unlockCondition && !u.unlockCondition(meta)) return false;
  return true;
}

function canHostFace(run: RunState, upgrade: FaceUpgrade, slotIndex: number): boolean {
  const ch = getCharacter(run.characterId);
  if (!ch) return false;
  if (slotIndex < 0 || slotIndex >= run.slotLayout.length) return false;
  if (isSlotLocked(ch, slotIndex)) return false;
  const slot = run.slotLayout[slotIndex];
  if (!slot) return false;
  if (upgrade.upgradesFrom && slot.replacerId !== upgrade.upgradesFrom) return false;
  if (upgrade.bindsTo && upgrade.bindsTo.length > 0 && !upgrade.bindsTo.includes(slotIndex + 1)) return false;
  const allowed = slotAllowedTags(ch, slotIndex);
  const tags = new Set(upgrade.tags ?? []);
  if (allowed && allowed.length > 0 && !allowed.some((tag) => tags.has(tag))) return false;
  const replacesCurrentReplacer = Boolean(upgrade.upgradesFrom && slot.replacerId === upgrade.upgradesFrom);
  if (upgrade.kind === 'replacer' && ch.defaultFaces?.[slotIndex]?.restrictedReplacement && !replacesCurrentReplacer) return false;
  if (upgrade.kind === 'supplement' && !canPlaceSupplement(slot)) return false;
  return true;
}

export function casinoFaceSlotOptions(run: RunState, upgradeId: string): number[] {
  const upgrade = getFaceUpgrade(upgradeId);
  if (!upgrade) return [];
  return run.slotLayout
    .filter((slot) => canHostFace(run, upgrade, slot.index))
    .map((slot) => slot.index);
}

function facePool(run: RunState, rarity: Rarity): FaceUpgrade[] {
  return listFaceUpgrades().filter((upgrade) => {
    if (upgrade.kind !== 'replacer') return false;
    if (upgrade.rarity !== rarity) return false;
    if (upgrade.characterExclusive && upgrade.characterExclusive !== run.characterId) return false;
    return casinoFaceSlotOptions(run, upgrade.id).length > 0;
  });
}

function runUpgradePool(run: RunState, meta: MetaState, category: 'bauble' | 'relic', rarity: Rarity): Upgrade[] {
  return listUpgrades().filter((upgrade) => {
    if (upgrade.category !== category) return false;
    if (upgrade.rarity !== rarity) return false;
    return canOfferRunUpgrade(run, meta, upgrade);
  });
}

function pickRarityForPool<T extends { rarity: Rarity }>(
  rng: Rng,
  tier: CasinoChestTier,
  poolForRarity: (rarity: Rarity) => T[],
): T | null {
  const attempted = new Set<Rarity>();
  while (attempted.size < 4) {
    const rarity = pickWeighted(rng, BALANCE.casino.rarityWeightsByTier[tier]);
    attempted.add(rarity);
    const pool = poolForRarity(rarity);
    if (pool.length > 0) return pool[Math.floor(rng() * pool.length)]!;
  }
  const fallback = (['common', 'rare', 'epic', 'legendary'] as Rarity[])
    .flatMap((rarity) => poolForRarity(rarity));
  if (fallback.length === 0) return null;
  return fallback[Math.floor(rng() * fallback.length)]!;
}

function convertGold(rarity: Rarity, tier: CasinoChestTier): number {
  const tierBonus = tierIndex(tier) * 8;
  return BALANCE.casino.convertGoldByRarity[rarity] + tierBonus;
}

function goldReward(run: RunState, rng: Rng, tier: CasinoChestTier): CasinoChestReward {
  const amount = intRange(rng, BALANCE.casino.goldByTier[tier]) + Math.floor(run.wave * 1.8);
  return { kind: 'gold', amount, tier, label: `${amount} gold` };
}

function goldDripReward(run: RunState, rng: Rng, tier: CasinoChestTier): CasinoChestReward {
  const amount = intRange(rng, scaledRange(BALANCE.casino.goldByTier[tier], CHEST_BUNDLE_GOLD_MUL[tier])) + Math.floor(run.wave * 0.75);
  return { kind: 'gold', amount, tier, label: `${amount} gold` };
}

function healReward(run: RunState, rng: Rng, tier: CasinoChestTier): CasinoChestReward {
  const amount = intRange(rng, BALANCE.casino.healByTier[tier]) + Math.floor(run.wave * 0.45);
  return { kind: 'heal', amount, tier, label: `${amount} HP` };
}

function rewardForCategory(
  run: RunState,
  meta: MetaState,
  rng: Rng,
  tier: CasinoChestTier,
  category: CasinoRewardCategory,
): CasinoChestReward | null {
  if (category === 'gold') return goldReward(run, rng, tier);
  if (category === 'heal') return healReward(run, rng, tier);
  if (category === 'forgeDiscount') {
    const amount = BALANCE.casino.forgeDiscountByTier[tier];
    return { kind: 'forgeDiscount', amount, tier, label: `${Math.round(amount * 100)}% forge discount` };
  }
  if (category === 'face') {
    const face = pickRarityForPool(rng, tier, (rarity) => facePool(run, rarity));
    if (!face) return null;
    const name = getFaceName(face.id, run.characterId, face.name);
    return {
      kind: 'face',
      id: face.id,
      rarity: face.rarity,
      tier,
      label: `${name} R${getFaceRank(face)}`,
      convertGold: convertGold(face.rarity, tier),
    };
  }
  const upgrade = pickRarityForPool(rng, tier, (rarity) => runUpgradePool(run, meta, category, rarity));
  if (!upgrade) return null;
  return {
    kind: category,
    id: upgrade.id,
    rarity: upgrade.rarity,
    tier,
    label: upgrade.name,
    convertGold: convertGold(upgrade.rarity, tier),
  };
}

function addBundleReward(rewards: CasinoChestReward[], reward: CasinoChestReward | null): boolean {
  if (!reward) return false;
  if (reward.kind === 'gold') {
    const existing = rewards.find((r): r is Extract<CasinoChestReward, { kind: 'gold' }> => r.kind === 'gold');
    if (existing) {
      existing.amount += reward.amount;
      existing.label = `${existing.amount} gold`;
      return true;
    }
  }
  rewards.push(reward);
  return true;
}

export function rollCasinoReward(
  run: RunState,
  meta: MetaState,
  rng: Rng,
  tier: CasinoChestTier,
): CasinoChestReward {
  const category = pickWeighted(rng, BALANCE.casino.categoryWeightsByTier[tier]) as CasinoRewardCategory;
  return rewardForCategory(run, meta, rng, tier, category) ?? goldReward(run, rng, tier);
}

export function rollCasinoRewards(
  run: RunState,
  meta: MetaState,
  rng: Rng,
  tier: CasinoChestTier,
): CasinoChestReward[] {
  const pattern = parseRewardPattern(pickWeighted(rng, CHEST_REWARD_PATTERNS[tier]));
  const rewards: CasinoChestReward[] = [];
  const isBundle = pattern.length > 1;

  for (const category of pattern) {
    const reward = category === 'gold' && isBundle
      ? goldDripReward(run, rng, tier)
      : rewardForCategory(run, meta, rng, tier, category);
    addBundleReward(rewards, reward);
  }

  return rewards.length > 0 ? rewards : [goldReward(run, rng, tier)];
}
