import type { CasinoChestReward, CasinoChestTier, MetaState, RunState } from '../types';
import {
  useStore,
  setRunState,
  DEFAULT_SETTINGS,
  BGM_TRACK_IDS,
  PARTICLE_DENSITY_VALUES,
  ENEMY_HP_BAR_VALUES,
  HAPTIC_STRENGTH_VALUES,
  GAME_SPEED_MULTIPLIERS,
  DIE_THEME_IDS,
} from './store';
import type {
  Settings,
  BgmTrackId,
  ParticleDensity,
  EnemyHpBarMode,
  HapticStrength,
  GameSpeedMultiplier,
  DieThemeId,
} from './store';
import { listUpgrades } from '../content/upgrades/registry';
import {
  getFaceChainId,
  getFaceRank,
  getFaceUpgrade,
  listFaceUpgrades,
} from '../content/upgrades/faceRegistry';
import { MAX_TIER } from '../content/upgrades/types';
import { DIE_THEME_DEFAULT_UNLOCKS, DIE_THEME_UNLOCKS } from '../sprites/dice';
import type { SlotState } from '../content/upgrades/types';

const KEY_META = 'rollguelike.meta.v1';
const KEY_RUN = 'rollguelike.run.v1';
const KEY_SETTINGS = 'rollguelike.settings.v1';
const KEY_ONBOARDED = 'rollguelike.onboarded.v1';
const CASINO_CHEST_TIERS = ['rusty', 'copper', 'bronze', 'iron', 'silver', 'gold', 'diamond', 'jackpot'] as const satisfies readonly CasinoChestTier[];

export function loadMeta(): MetaState {
  try {
    const raw = localStorage.getItem(KEY_META);
    if (!raw) return defaultMeta();
    const parsed = JSON.parse(raw) as Partial<MetaState>;
    const base = defaultMeta();
    const merged: MetaState = { ...base, ...parsed };
    const starter = new Set(base.unlockedArsenal);
    const existing = new Set(merged.unlockedArsenal ?? []);
    for (const id of starter) existing.add(id);
    merged.unlockedArsenal = Array.from(existing);
    merged.pendingArsenalUnlocks = merged.pendingArsenalUnlocks ?? [];
    merged.encounteredEnemyIds = uniqueStringArray(merged.encounteredEnemyIds);
    merged.houseClears = merged.houseClears ?? 0;
    merged.clockmakerRewindsUsed = merged.clockmakerRewindsUsed ?? 0;
    merged.objectivesCompleted = merged.objectivesCompleted ?? 0;
    merged.elementalSetMilestones = uniqueStringArray(merged.elementalSetMilestones);
    merged.contractClears = merged.contractClears ?? {};
    // Dice themes: always grant defaults; retroactively re-check challenges so
    // new themes light up for returning players who already met the criteria.
    const diceStarter = new Set(base.unlockedDiceThemes);
    const diceExisting = new Set(merged.unlockedDiceThemes ?? []);
    for (const id of diceStarter) diceExisting.add(id);
    merged.unlockedDiceThemes = Array.from(diceExisting);
    merged.pendingDiceThemeUnlocks = merged.pendingDiceThemeUnlocks ?? [];
    const retroactive = checkDiceThemeUnlocks(merged);
    if (retroactive.length > 0) {
      merged.unlockedDiceThemes = [...merged.unlockedDiceThemes, ...retroactive];
      merged.pendingDiceThemeUnlocks = [...merged.pendingDiceThemeUnlocks, ...retroactive];
    }
    return merged;
  } catch {
    return defaultMeta();
  }
}

export function saveMeta(meta: MetaState): void {
  try {
    localStorage.setItem(KEY_META, JSON.stringify(meta));
  } catch {}
}

export function loadRun(): RunState | null {
  try {
    const raw = localStorage.getItem(KEY_RUN);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<RunState>;
    return migrateRun(parsed);
  } catch {
    return null;
  }
}

function migrateRun(parsed: Partial<RunState>): RunState {
  const legacyTiers: Record<string, number> = {};
  const ownedFaceUpgrades: Record<string, number> = {};
  for (const [id, tier] of Object.entries(parsed.ownedFaceUpgrades ?? {})) {
    if (typeof tier !== 'number' || !Number.isFinite(tier)) continue;
    const safeTier = Math.max(1, Math.min(MAX_TIER, Math.floor(tier)));
    legacyTiers[id] = safeTier;
  }
  const characterId = parsed.characterId ?? 'soldier';
  const slotLayout = migrateSlotLayout(characterId, parsed.slotLayout, legacyTiers, ownedFaceUpgrades);
  return {
    characterId,
    wave: parsed.wave ?? 1,
    score: parsed.score ?? 0,
    hp: parsed.hp ?? 100,
    maxHp: parsed.maxHp ?? 100,
    shield: parsed.shield ?? 0,
    souls: parsed.souls ?? 0,
    rage: parsed.rage ?? 0,
    upgrades: parsed.upgrades ?? [],
    dice: parsed.dice ?? [],
    seed: parsed.seed ?? Date.now(),
    kills: parsed.kills ?? 0,
    waveStartedAt: parsed.waveStartedAt ?? 0,
    rerolls: parsed.rerolls ?? 0,
    pickCount: parsed.pickCount ?? 0,
    lockedFaceValue: parsed.lockedFaceValue,
    lockedFaceTimer: parsed.lockedFaceTimer,
    momentum: parsed.momentum,
    momentumT: parsed.momentumT,
    casinoWaveDamageTaken: parsed.casinoWaveDamageTaken ?? 0,
    casinoWaveEliteKills: parsed.casinoWaveEliteKills ?? 0,
    easyWaveStreak: parsed.easyWaveStreak ?? 0,
    adaptivePressure: parsed.adaptivePressure ?? 0,
    gold: parsed.gold ?? 0,
    ownedFaceUpgrades,
    slotLayout,
    gambitStacks: parsed.gambitStacks ?? 0,
    goldSpent: parsed.goldSpent ?? 0,
    runMutatorId: parsed.runMutatorId,
    currentWaveArchetypeId: parsed.currentWaveArchetypeId,
    currentBiomeRuleId: parsed.currentBiomeRuleId,
    nextForgeDiscount: parsed.nextForgeDiscount,
    guaranteedForgeRarity: parsed.guaranteedForgeRarity,
    pendingCasino: migratePendingCasino(parsed.pendingCasino),
    clockmakerRewindUsed: parsed.clockmakerRewindUsed ?? false,
    clockmakerRewindFromWave: parsed.clockmakerRewindFromWave,
    maxWaveThisRun: parsed.maxWaveThisRun ?? parsed.wave ?? 1,
    houseCleared: parsed.houseCleared ?? false,
    selectedContractId: parsed.selectedContractId ?? parsed.runMutatorId,
    objectivesCompleted: parsed.objectivesCompleted ?? 0,
    objectiveState: undefined,
    elementalMeters: parsed.elementalMeters ?? {},
    elementalCooldowns: parsed.elementalCooldowns ?? {},
    elementalMilestonesSeen: uniqueStringArray(parsed.elementalMilestonesSeen),
  };
}

function isCasinoChestTier(v: unknown): v is CasinoChestTier {
  return typeof v === 'string' && (CASINO_CHEST_TIERS as readonly string[]).includes(v);
}

function safeCasinoChestTier(v: unknown, fallback: CasinoChestTier): CasinoChestTier {
  return isCasinoChestTier(v) ? v : fallback;
}

function migrateCasinoRewardTier(reward: CasinoChestReward, fallback: CasinoChestTier): CasinoChestReward {
  return { ...reward, tier: safeCasinoChestTier(reward.tier, fallback) };
}

function migratePendingCasino(casino: RunState['pendingCasino']): RunState['pendingCasino'] {
  if (!casino) return undefined;
  const baseChestTier = safeCasinoChestTier(casino.baseChestTier, 'bronze');
  const chestTier = safeCasinoChestTier(casino.chestTier, baseChestTier);
  return {
    ...casino,
    chestTier,
    baseChestTier,
    rewards: casino.rewards?.map((reward) => migrateCasinoRewardTier(reward, chestTier)),
    reward: casino.reward ? migrateCasinoRewardTier(casino.reward, chestTier) : undefined,
  };
}

function resolveLegacyFaceUpgradeId(id: string, tier: number): string {
  const upgrade = getFaceUpgrade(id);
  if (!upgrade) return id;
  const targetRank = Math.max(1, Math.min(MAX_TIER, Math.floor(tier || getFaceRank(upgrade))));
  const chainId = getFaceChainId(upgrade);
  const ranked = listFaceUpgrades().find((u) => getFaceChainId(u) === chainId && getFaceRank(u) === targetRank);
  return ranked?.id ?? id;
}

const LEGACY_DEFAULT_REPLACERS: Record<string, readonly (string | null)[]> = {
  soldier: [null, null, 'std_shot', 'std_shot', 'std_shot', 'std_shot'],
  gambler: ['std_shot', 'std_shot', 'std_shot', 'std_shot', 'std_shot', 'std_shot'],
  alchemist: [null, 'aqua_bolt', null, 'arc_bolt', 'std_shot', 'std_shot'],
  necromancer: [null, null, 'std_shot', 'std_shot', 'std_shot', 'std_shot'],
  berserker: [null, null, 'std_shot', 'std_shot', 'pulse_nova', 'pulse_nova'],
  clockmaker: [null, null, 'std_shot', 'std_shot', 'std_shot', 'pulse_nova'],
};

function isLegacyDefaultReplacer(characterId: string, slotIndex: number, id: string): boolean {
  return LEGACY_DEFAULT_REPLACERS[characterId]?.[slotIndex] === id;
}

function migrateSlotLayout(
  characterId: string,
  parsedSlots: RunState['slotLayout'] | undefined,
  legacyTiers: Record<string, number>,
  ownedFaceUpgrades: Record<string, number>,
): SlotState[] {
  const rawSlots = Array.isArray(parsedSlots) ? parsedSlots : [];
  const slots: SlotState[] = Array.from({ length: 6 }, (_, index) => {
    const slot = rawSlots[index];
    const rawId = slot?.replacerId ?? null;
    let replacerId = rawId ? resolveLegacyFaceUpgradeId(rawId, legacyTiers[rawId] ?? 1) : null;
    if (rawId && isLegacyDefaultReplacer(characterId, index, rawId)) replacerId = null;
    if (replacerId && !getFaceUpgrade(replacerId)) replacerId = null;
    if (replacerId) {
      ownedFaceUpgrades[replacerId] = (ownedFaceUpgrades[replacerId] ?? 0) + 1;
    }
    return {
      index,
      replacerId,
      // Existing saved supplements are intentionally dropped in the relics branch.
      // The content remains in source, but per-slot supplement state is no longer active.
      supplementIds: [],
      supplementCap: 0,
    };
  });

  return slots;
}

export function saveRun(run: RunState | null): void {
  try {
    if (run === null) localStorage.removeItem(KEY_RUN);
    else localStorage.setItem(KEY_RUN, JSON.stringify(run));
  } catch {}
}

function isBgmTrackId(v: unknown): v is BgmTrackId {
  return typeof v === 'string' && (BGM_TRACK_IDS as readonly string[]).includes(v);
}

function isParticleDensity(v: unknown): v is ParticleDensity {
  return typeof v === 'string' && (PARTICLE_DENSITY_VALUES as readonly string[]).includes(v);
}

function isEnemyHpBarMode(v: unknown): v is EnemyHpBarMode {
  return typeof v === 'string' && (ENEMY_HP_BAR_VALUES as readonly string[]).includes(v);
}

function isHapticStrength(v: unknown): v is HapticStrength {
  return typeof v === 'string' && (HAPTIC_STRENGTH_VALUES as readonly string[]).includes(v);
}

function isGameSpeedMultiplier(v: unknown): v is GameSpeedMultiplier {
  return typeof v === 'number' && (GAME_SPEED_MULTIPLIERS as readonly number[]).includes(v);
}

function isDieThemeId(v: unknown): v is DieThemeId {
  return typeof v === 'string' && (DIE_THEME_IDS as readonly string[]).includes(v);
}

function clamp01(v: unknown, fallback: number): number {
  if (typeof v !== 'number' || !Number.isFinite(v)) return fallback;
  if (v < 0) return 0;
  if (v > 1) return 1;
  return v;
}

function uniqueStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const item of v) {
    if (typeof item !== 'string' || item.length === 0 || seen.has(item)) continue;
    seen.add(item);
    out.push(item);
  }
  return out;
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY_SETTINGS);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<Settings>;
    const merged: Settings = { ...DEFAULT_SETTINGS, ...parsed };

    merged.masterVolume = clamp01(parsed.masterVolume, DEFAULT_SETTINGS.masterVolume);
    merged.sfxVolume = clamp01(parsed.sfxVolume, DEFAULT_SETTINGS.sfxVolume);
    merged.musicVolume = clamp01(parsed.musicVolume, DEFAULT_SETTINGS.musicVolume);
    merged.uiVolume = clamp01(parsed.uiVolume, DEFAULT_SETTINGS.uiVolume);

    if (!isBgmTrackId(merged.bgmTrack)) merged.bgmTrack = DEFAULT_SETTINGS.bgmTrack;
    if (!isParticleDensity(merged.particleDensity)) merged.particleDensity = DEFAULT_SETTINGS.particleDensity;
    if (!isEnemyHpBarMode(merged.enemyHpBars)) merged.enemyHpBars = DEFAULT_SETTINGS.enemyHpBars;
    if (!isHapticStrength(merged.hapticStrength)) merged.hapticStrength = DEFAULT_SETTINGS.hapticStrength;
    if (!isGameSpeedMultiplier(merged.gameSpeedMultiplier)) merged.gameSpeedMultiplier = DEFAULT_SETTINGS.gameSpeedMultiplier;
    if (!isDieThemeId(merged.dieTheme)) merged.dieTheme = DEFAULT_SETTINGS.dieTheme;

    // Legacy `reduceShake` toggle → new `shakeIntensity` slider.
    if (parsed.shakeIntensity == null && parsed.reduceShake === true) {
      merged.shakeIntensity = 0.35;
    } else {
      merged.shakeIntensity = clamp01(parsed.shakeIntensity, DEFAULT_SETTINGS.shakeIntensity);
    }
    delete merged.reduceShake;

    return merged;
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(KEY_SETTINGS, JSON.stringify(settings));
  } catch {}
}

export function loadOnboarded(): boolean {
  try {
    return localStorage.getItem(KEY_ONBOARDED) === '1';
  } catch {
    return false;
  }
}

export function saveOnboarded(v: boolean): void {
  try {
    localStorage.setItem(KEY_ONBOARDED, v ? '1' : '0');
  } catch {}
}

export function hydrate(): void {
  const meta = loadMeta();
  const run = loadRun();
  const settings = loadSettings();
  const onboarded = loadOnboarded();
  useStore.getState().setMeta(meta);
  useStore.getState().setSettings(settings);
  useStore.getState().setOnboarded(onboarded);
  if (run) {
    setRunState(run);
  }
}

export interface RunSummary {
  wavesCleared: number;
  finalScore: number;
  characterId: string;
  kills?: number;
  goldSpent?: number;
  houseCleared?: boolean;
  clockmakerRewindsUsed?: number;
  objectivesCompleted?: number;
  elementalSetMilestones?: string[];
  contractId?: string;
}

export function incrementRunsCompleted(summary: RunSummary): MetaState {
  const {
    wavesCleared,
    finalScore,
    characterId,
    kills = 0,
    goldSpent = 0,
    houseCleared = false,
    clockmakerRewindsUsed = 0,
    objectivesCompleted = 0,
    elementalSetMilestones = [],
    contractId,
  } = summary;
  const meta = { ...useStore.getState().meta };
  meta.totalRunsCompleted += 1;
  meta.totalWavesCleared += wavesCleared;
  meta.totalKills = (meta.totalKills ?? 0) + kills;
  meta.maxWaveReached = Math.max(meta.maxWaveReached ?? 0, wavesCleared);
  meta.maxGoldSpentInRun = Math.max(
    meta.maxGoldSpentInRun ?? 0,
    Math.max(0, goldSpent),
  );
  meta.bestSingleRunKills = Math.max(meta.bestSingleRunKills ?? 0, kills);
  meta.houseClears = (meta.houseClears ?? 0) + (houseCleared ? 1 : 0);
  meta.clockmakerRewindsUsed = (meta.clockmakerRewindsUsed ?? 0) + clockmakerRewindsUsed;
  meta.objectivesCompleted = (meta.objectivesCompleted ?? 0) + objectivesCompleted;
  const milestoneSet = new Set(meta.elementalSetMilestones ?? []);
  for (const id of elementalSetMilestones) milestoneSet.add(id);
  meta.elementalSetMilestones = Array.from(milestoneSet);
  if (contractId) {
    meta.contractClears = { ...(meta.contractClears ?? {}) };
    if (houseCleared) meta.contractClears[contractId] = (meta.contractClears[contractId] ?? 0) + 1;
  }
  meta.highScores = { ...meta.highScores };
  const prev = meta.highScores[characterId] ?? 0;
  if (finalScore > prev) meta.highScores[characterId] = finalScore;
  const newUnlocks = checkArsenalUnlocks(meta);
  if (newUnlocks.length > 0) {
    meta.unlockedArsenal = [...meta.unlockedArsenal, ...newUnlocks];
    meta.pendingArsenalUnlocks = [...meta.pendingArsenalUnlocks, ...newUnlocks];
  }
  const freshDice = checkDiceThemeUnlocks(meta);
  if (freshDice.length > 0) {
    meta.unlockedDiceThemes = [...meta.unlockedDiceThemes, ...freshDice];
    meta.pendingDiceThemeUnlocks = [...meta.pendingDiceThemeUnlocks, ...freshDice];
  }
  saveMeta(meta);
  useStore.getState().setMeta(meta);
  return meta;
}

export function checkArsenalUnlocks(meta: MetaState): string[] {
  const unlocked = new Set(meta.unlockedArsenal);
  const fresh: string[] = [];
  for (const u of listUpgrades()) {
    if (!u.id.startsWith('ars_')) continue;
    if (unlocked.has(u.id)) continue;
    if (!u.unlockCondition) continue;
    if (u.unlockCondition(meta)) fresh.push(u.id);
  }
  return fresh;
}

export function checkDiceThemeUnlocks(meta: MetaState): string[] {
  const unlocked = new Set(meta.unlockedDiceThemes ?? []);
  const fresh: string[] = [];
  // Fixed-point loop: some themes (e.g. rainbow) gate on the current count of
  // unlocked themes, so a cascade of unlocks from a single run-end should
  // propagate until no new themes come in.
  let changed = true;
  while (changed) {
    changed = false;
    const view = { ...meta, unlockedDiceThemes: Array.from(unlocked) };
    for (const [id, rule] of Object.entries(DIE_THEME_UNLOCKS)) {
      if (!rule) continue;
      if (unlocked.has(id)) continue;
      if (rule.check(view)) {
        unlocked.add(id);
        fresh.push(id);
        changed = true;
      }
    }
  }
  return fresh;
}

export function consumePendingArsenalUnlocks(): string[] {
  const meta = { ...useStore.getState().meta };
  const pending = meta.pendingArsenalUnlocks ?? [];
  if (pending.length === 0) return [];
  meta.pendingArsenalUnlocks = [];
  saveMeta(meta);
  useStore.getState().setMeta(meta);
  return pending;
}

export function consumePendingDiceThemeUnlocks(): string[] {
  const meta = { ...useStore.getState().meta };
  const pending = meta.pendingDiceThemeUnlocks ?? [];
  if (pending.length === 0) return [];
  meta.pendingDiceThemeUnlocks = [];
  saveMeta(meta);
  useStore.getState().setMeta(meta);
  return pending;
}

export function recordEnemyEncounters(typeIds: Iterable<string>): void {
  const state = useStore.getState();
  const known = new Set(state.meta.encounteredEnemyIds ?? []);
  let changed = false;

  for (const typeId of typeIds) {
    if (!typeId || known.has(typeId)) continue;
    known.add(typeId);
    changed = true;
  }

  if (!changed) return;
  const meta: MetaState = {
    ...state.meta,
    encounteredEnemyIds: Array.from(known),
  };
  saveMeta(meta);
  state.setMeta(meta);
}

function defaultMeta(): MetaState {
  return {
    highScores: {},
    // Only the Knight ships unlocked. The rest must be earned via challenges
    // defined on each character's `unlockCondition` (see src/content/characters/index.ts).
    unlockedCharacters: ['soldier'],
    totalRunsCompleted: 0,
    totalWavesCleared: 0,
    unlockedArsenal: ['ars_firebolt', 'ars_arc_bolt', 'ars_frost_shard', 'ars_pulse_shot', 'ars_aqua_bolt'],
    encounteredEnemyIds: [],
    totalKills: 0,
    maxWaveReached: 0,
    pendingArsenalUnlocks: [],
    maxGoldSpentInRun: 0,
    bestSingleRunKills: 0,
    unlockedDiceThemes: [...DIE_THEME_DEFAULT_UNLOCKS],
    pendingDiceThemeUnlocks: [],
    houseClears: 0,
    clockmakerRewindsUsed: 0,
    objectivesCompleted: 0,
    elementalSetMilestones: [],
    contractClears: {},
  };
}
