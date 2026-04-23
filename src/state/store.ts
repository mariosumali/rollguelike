import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { Screen, RunState, MetaState } from '../types';

interface UpgradeOffer {
  id: string;
  rarity: import('../types').Rarity;
}

export interface Settings {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  haptics: boolean;
  reduceShake: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  masterVolume: 0.8,
  sfxVolume: 1,
  musicVolume: 0.6,
  haptics: true,
  reduceShake: false,
};

interface StoreState {
  screen: Screen;
  hasRun: boolean;

  hud: {
    wave: number;
    score: number;
    streak: number;
    hp: number;
    maxHp: number;
    shield: number;
    souls: number;
    rage: number;
    gold: number;
    gambitStacks: number;
    characterId: string;
    isBossWave: boolean;
    waveProgress: number;
  };

  upgradeOffers: UpgradeOffer[];
  upgradePicksRemaining: number;
  activeUpgrades: { id: string; stacks: number }[];

  bossWarnTypeId: string | null;

  meta: MetaState;
  settings: Settings;
  onboarded: boolean;

  setScreen: (screen: Screen) => void;
  setHud: (hud: Partial<StoreState['hud']>) => void;
  setUpgradeOffers: (offers: UpgradeOffer[], picksRemaining: number) => void;
  setActiveUpgrades: (u: { id: string; stacks: number }[]) => void;
  setBossWarn: (id: string | null) => void;
  setMeta: (meta: MetaState) => void;
  setHasRun: (v: boolean) => void;
  setSettings: (patch: Partial<Settings>) => void;
  setOnboarded: (v: boolean) => void;
}

export const useStore = create<StoreState>()(
  subscribeWithSelector((set) => ({
    screen: 'menu',
    hasRun: false,
    hud: {
      wave: 1,
      score: 0,
      streak: 0,
      hp: 100,
      maxHp: 100,
      shield: 0,
      souls: 0,
      rage: 0,
      gold: 0,
      gambitStacks: 0,
      characterId: 'soldier',
      isBossWave: false,
      waveProgress: 0,
    },
    upgradeOffers: [],
    upgradePicksRemaining: 0,
    activeUpgrades: [],
    bossWarnTypeId: null,
    meta: {
      highScores: {},
      unlockedCharacters: ['soldier', 'gambler', 'alchemist', 'necromancer', 'berserker'],
      totalRunsCompleted: 0,
      totalWavesCleared: 0,
      unlockedArsenal: ['ars_firebolt', 'ars_arc_bolt', 'ars_frost_shard', 'ars_pulse_shot', 'ars_aqua_bolt'],
      totalKills: 0,
      maxWaveReached: 0,
      pendingArsenalUnlocks: [],
    },
    settings: { ...DEFAULT_SETTINGS },
    onboarded: false,
    setScreen: (screen) => set({ screen }),
    setHud: (hud) => set((s) => ({ hud: { ...s.hud, ...hud } })),
    setUpgradeOffers: (offers, picksRemaining) =>
      set({ upgradeOffers: offers, upgradePicksRemaining: picksRemaining }),
    setActiveUpgrades: (activeUpgrades) => set({ activeUpgrades }),
    setBossWarn: (id) => set({ bossWarnTypeId: id }),
    setMeta: (meta) => set({ meta }),
    setHasRun: (hasRun) => set({ hasRun }),
    setSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
    setOnboarded: (onboarded) => set({ onboarded }),
  })),
);

export const runStateRef: { current: RunState | null } = { current: null };

export function getRunState(): RunState | null {
  return runStateRef.current;
}

export function setRunState(s: RunState | null): void {
  runStateRef.current = s;
  useStore.getState().setHasRun(s !== null);
}
