import type { MetaState, RunState } from '../types';
import { useStore, setRunState, DEFAULT_SETTINGS } from './store';
import type { Settings } from './store';
import { listUpgrades } from '../content/upgrades/registry';

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
  return {
    characterId: parsed.characterId ?? 'soldier',
    wave: parsed.wave ?? 1,
    score: parsed.score ?? 0,
    streak: parsed.streak ?? 0,
    streakFace: parsed.streakFace ?? null,
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
    ownedFaceUpgrades: parsed.ownedFaceUpgrades ?? {},
    slotLayout: parsed.slotLayout ?? [],
    gambitStacks: parsed.gambitStacks ?? 0,
  };
}

export function saveRun(run: RunState | null): void {
  try {
    if (run === null) localStorage.removeItem(KEY_RUN);
    else localStorage.setItem(KEY_RUN, JSON.stringify(run));
  } catch {}
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY_SETTINGS);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return { ...DEFAULT_SETTINGS, ...parsed };
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

export function incrementRunsCompleted(
  wavesCleared: number,
  finalScore: number,
  characterId: string,
  kills = 0,
): MetaState {
  const meta = { ...useStore.getState().meta };
  meta.totalRunsCompleted += 1;
  meta.totalWavesCleared += wavesCleared;
  meta.totalKills = (meta.totalKills ?? 0) + kills;
  meta.maxWaveReached = Math.max(meta.maxWaveReached ?? 0, wavesCleared);
  meta.highScores = { ...meta.highScores };
  const prev = meta.highScores[characterId] ?? 0;
  if (finalScore > prev) meta.highScores[characterId] = finalScore;
  if (
    meta.totalRunsCompleted >= 3 &&
    !meta.unlockedCharacters.includes('clockmaker')
  ) {
    meta.unlockedCharacters = [...meta.unlockedCharacters, 'clockmaker'];
  }
  const newUnlocks = checkArsenalUnlocks(meta);
  if (newUnlocks.length > 0) {
    meta.unlockedArsenal = [...meta.unlockedArsenal, ...newUnlocks];
    meta.pendingArsenalUnlocks = [...meta.pendingArsenalUnlocks, ...newUnlocks];
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

export function consumePendingArsenalUnlocks(): string[] {
  const meta = { ...useStore.getState().meta };
  const pending = meta.pendingArsenalUnlocks ?? [];
  if (pending.length === 0) return [];
  meta.pendingArsenalUnlocks = [];
  saveMeta(meta);
  useStore.getState().setMeta(meta);
  return pending;
}

function defaultMeta(): MetaState {
  return {
    highScores: {},
    unlockedCharacters: ['soldier', 'gambler', 'alchemist', 'necromancer', 'berserker'],
    totalRunsCompleted: 0,
    totalWavesCleared: 0,
    unlockedArsenal: ['ars_firebolt', 'ars_arc_bolt', 'ars_frost_shard', 'ars_pulse_shot', 'ars_aqua_bolt'],
    totalKills: 0,
    maxWaveReached: 0,
    pendingArsenalUnlocks: [],
  };
}
