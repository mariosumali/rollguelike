import type { MetaState, RunState } from '../types';
import {
  useStore,
  setRunState,
  DEFAULT_SETTINGS,
  BGM_TRACK_IDS,
  PARTICLE_DENSITY_VALUES,
  ENEMY_HP_BAR_VALUES,
  HAPTIC_STRENGTH_VALUES,
  DIE_THEME_IDS,
} from './store';
import type {
  Settings,
  BgmTrackId,
  ParticleDensity,
  EnemyHpBarMode,
  HapticStrength,
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
    ownedFaceUpgrades[resolveLegacyFaceUpgradeId(id, safeTier)] = 1;
  }
  const slotLayout = migrateSlotLayout(parsed.slotLayout, legacyTiers, ownedFaceUpgrades);
  return {
    characterId: parsed.characterId ?? 'soldier',
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

function migrateSlotLayout(
  parsedSlots: RunState['slotLayout'] | undefined,
  legacyTiers: Record<string, number>,
  ownedFaceUpgrades: Record<string, number>,
): SlotState[] {
  const rawSlots = Array.isArray(parsedSlots) ? parsedSlots : [];
  const slots: SlotState[] = rawSlots.map((slot, index) => ({
    index: typeof slot?.index === 'number' ? slot.index : index,
    replacerId: slot?.replacerId ? resolveLegacyFaceUpgradeId(slot.replacerId, legacyTiers[slot.replacerId] ?? 1) : null,
    supplementIds: Array.isArray(slot?.supplementIds)
      ? slot.supplementIds
          .filter((id): id is string => typeof id === 'string')
          .map((id) => resolveLegacyFaceUpgradeId(id, legacyTiers[id] ?? 1))
      : [],
    supplementCap: typeof slot?.supplementCap === 'number' ? slot.supplementCap : 0,
  }));

  const bestByChain = new Map<string, { id: string; rank: number; order: number }>();
  let order = 0;
  for (const slot of slots) {
    for (const id of [slot.replacerId, ...slot.supplementIds]) {
      if (!id) continue;
      const upgrade = getFaceUpgrade(id);
      if (!upgrade) continue;
      const chainId = getFaceChainId(upgrade);
      const rank = getFaceRank(upgrade);
      const current = bestByChain.get(chainId);
      if (!current || rank > current.rank) {
        bestByChain.set(chainId, { id, rank, order });
      }
      order++;
    }
  }

  const keptChains = new Set<string>();
  for (const slot of slots) {
    if (slot.replacerId) {
      const upgrade = getFaceUpgrade(slot.replacerId);
      const chainId = upgrade ? getFaceChainId(upgrade) : '';
      const best = bestByChain.get(chainId);
      if (!upgrade || !best || best.id !== slot.replacerId || keptChains.has(chainId)) {
        slot.replacerId = null;
      } else {
        keptChains.add(chainId);
        ownedFaceUpgrades[slot.replacerId] = 1;
      }
    }
    slot.supplementIds = slot.supplementIds.filter((id) => {
      const upgrade = getFaceUpgrade(id);
      if (!upgrade) return false;
      const chainId = getFaceChainId(upgrade);
      const best = bestByChain.get(chainId);
      if (!best || best.id !== id || keptChains.has(chainId)) return false;
      keptChains.add(chainId);
      ownedFaceUpgrades[id] = 1;
      return true;
    });
  }

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

function isDieThemeId(v: unknown): v is DieThemeId {
  return typeof v === 'string' && (DIE_THEME_IDS as readonly string[]).includes(v);
}

function clamp01(v: unknown, fallback: number): number {
  if (typeof v !== 'number' || !Number.isFinite(v)) return fallback;
  if (v < 0) return 0;
  if (v > 1) return 1;
  return v;
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
}

export function incrementRunsCompleted(summary: RunSummary): MetaState {
  const {
    wavesCleared,
    finalScore,
    characterId,
    kills = 0,
    goldSpent = 0,
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

function defaultMeta(): MetaState {
  return {
    highScores: {},
    // Only the Knight ships unlocked. The rest must be earned via challenges
    // defined on each character's `unlockCondition` (see src/content/characters/index.ts).
    unlockedCharacters: ['soldier'],
    totalRunsCompleted: 0,
    totalWavesCleared: 0,
    unlockedArsenal: ['ars_firebolt', 'ars_arc_bolt', 'ars_frost_shard', 'ars_pulse_shot', 'ars_aqua_bolt'],
    totalKills: 0,
    maxWaveReached: 0,
    pendingArsenalUnlocks: [],
    maxGoldSpentInRun: 0,
    bestSingleRunKills: 0,
    unlockedDiceThemes: [...DIE_THEME_DEFAULT_UNLOCKS],
    pendingDiceThemeUnlocks: [],
  };
}
