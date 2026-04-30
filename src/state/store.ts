import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { Screen, RunState, MetaState, CasinoIntermissionState } from '../types';
import { DIE_THEME_DEFAULT_UNLOCKS, DIE_THEME_IDS, type DieThemeId } from '../sprites/dice';
import type { MenuTrackId } from '../audio/bgmPatterns';
import type { Theme as MenuTheme } from '../ui/menu/types';

interface UpgradeOffer {
  id: string;
  rarity: import('../types').Rarity;
}

export interface ForgeShopOffer {
  id: string;
  kind: 'face' | 'relic' | 'bauble';
  slotIndex: number;
  rank: number;
  price: number;
}

export const BGM_TRACK_IDS = [
  'overture',
  'overworld',
  'ancient',
  'courage',
  'omen',
  'storm',
  'throne',
] as const;
export type BgmTrackId = (typeof BGM_TRACK_IDS)[number];

/** Short labels in Settings; long descriptions for testing picks. */
export const BGM_TRACK_CHOICES: { id: BgmTrackId; label: string; blurb: string }[] = [
  { id: 'overture', label: 'Dice Overture', blurb: 'Playable title motif — harp, horns, and heroic D minor' },
  { id: 'overworld', label: 'Front Foyer', blurb: 'Bright House entry arrangement of the title hook' },
  { id: 'ancient', label: 'Ledger Grove', blurb: 'Hushed lower-register variation with old-wood ceremony' },
  { id: 'courage', label: 'Gold & Steel', blurb: 'Major-key fanfare variation with brass answers' },
  { id: 'omen', label: 'Omen Ledger', blurb: 'Grave half-time title statement with low brass' },
  { id: 'storm', label: 'Stormwall', blurb: 'Driving transposed siege variation of the title hook' },
  { id: 'throne', label: 'Throne Room', blurb: 'Slow, wide coronation variation with heavy cadence' },
];

export const PARTICLE_DENSITY_VALUES = ['low', 'normal', 'high'] as const;
export type ParticleDensity = (typeof PARTICLE_DENSITY_VALUES)[number];

export const ENEMY_HP_BAR_VALUES = ['off', 'damaged', 'always'] as const;
export type EnemyHpBarMode = (typeof ENEMY_HP_BAR_VALUES)[number];

export const HAPTIC_STRENGTH_VALUES = ['low', 'normal', 'high'] as const;
export type HapticStrength = (typeof HAPTIC_STRENGTH_VALUES)[number];

export const GAME_SPEED_MULTIPLIERS = [1, 2, 4] as const;
export type GameSpeedMultiplier = (typeof GAME_SPEED_MULTIPLIERS)[number];

export { DIE_THEME_IDS };
export type { DieThemeId };

export interface Settings {
  // Audio
  /** When true, all audio buses are silenced without changing volume sliders. */
  audioMuted: boolean;
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  /** Independent volume for UI click sounds (menus, buttons). */
  uiVolume: number;
  /** Procedural adventure BGM arrangement. */
  bgmTrack: BgmTrackId;
  /** When true, master volume is silenced while the tab/window is unfocused. */
  muteWhenUnfocused: boolean;

  // Haptics
  haptics: boolean;
  hapticStrength: HapticStrength;

  // Visuals / feel
  /** Camera-shake multiplier in [0..1]. Replaces the old reduceShake toggle. */
  shakeIntensity: number;
  /** Fullscreen red/white flashes on damage, boss kills, etc. */
  screenFlashes: boolean;
  /** Floating damage numbers on hits. */
  damageNumbers: boolean;
  /** Scales particle counts spawned by animation specs. */
  particleDensity: ParticleDensity;
  /** When to draw tiny HP bars above non-boss enemies. */
  enemyHpBars: EnemyHpBarMode;
  /** When true, dice always render pips for their value instead of equipped face icons. */
  showDiceNumbers: boolean;
  /** High-contrast UI palette toggled via a body data attribute. */
  highContrast: boolean;
  /** Larger UI text for readability. */
  largeText: boolean;
  /** Dampens intense VFX beyond just shake (iframes blink, boss warns, etc.). */
  reduceMotion: boolean;

  // Cosmetics
  /** Selected die theme used on the menu altar and in-run dice. */
  dieTheme: DieThemeId;

  // Gameplay
  /** Auto-pause gameplay when the tab/window loses focus. */
  autoPauseOnBlur: boolean;
  /** Show a confirmation before abandoning an in-progress run. */
  confirmQuit: boolean;
  /** Show extra tooltips/descriptions (e.g., BGM track blurbs). */
  showTooltips: boolean;
  /** Automatically roll dice when idle so the player doesn't have to tap. */
  autoRoll: boolean;
  /** Multiplies fixed-step simulation speed during active gameplay. */
  gameSpeedMultiplier: GameSpeedMultiplier;

  // Legacy — retained only for backwards-compatible migration.
  /** @deprecated superseded by shakeIntensity. */
  reduceShake?: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  audioMuted: false,
  masterVolume: 0.8,
  sfxVolume: 1,
  musicVolume: 0.6,
  uiVolume: 1,
  bgmTrack: 'overture',
  muteWhenUnfocused: true,
  haptics: true,
  hapticStrength: 'normal',
  shakeIntensity: 1,
  screenFlashes: true,
  damageNumbers: true,
  particleDensity: 'normal',
  enemyHpBars: 'damaged',
  showDiceNumbers: false,
  highContrast: false,
  largeText: false,
  reduceMotion: false,
  dieTheme: 'ivory',
  autoPauseOnBlur: true,
  confirmQuit: true,
  showTooltips: true,
  autoRoll: false,
  gameSpeedMultiplier: 1,
};

interface StoreState {
  screen: Screen;
  hasRun: boolean;

  hud: {
    wave: number;
    score: number;
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
    runMutatorName: string;
    runMutatorShortName: string;
    waveArchetypeName: string;
    biomeName: string;
    encounterLine: string;
    roomLine: string;
    omenLine: string;
    forgeBonusLabel: string;
    objectiveLabel: string;
    objectiveStatus: string;
    elementalSetLabel: string;
    elementalSetDesc: string;
    houseClearLabel: string;
  };

  upgradeOffers: UpgradeOffer[];
  upgradePicksRemaining: number;
  activeUpgrades: { id: string; stacks: number }[];

  forgeShopOffers: ForgeShopOffer[];
  forgeShopPurchased: boolean;
  casinoState: CasinoIntermissionState | null;

  bossWarnTypeId: string | null;

  meta: MetaState;
  settings: Settings;
  onboarded: boolean;

  /** When true, exposes a floating debug UI (activated via the TERMINAL cheat). */
  debugMode: boolean;
  /** When non-null, forces the menu background to this theme (debug override). */
  debugMenuTheme: MenuTheme | null;
  /** When non-null, forces the menu BGM to this track (debug override). */
  debugMenuTrack: MenuTrackId | null;

  setScreen: (screen: Screen) => void;
  setHud: (hud: Partial<StoreState['hud']>) => void;
  setUpgradeOffers: (offers: UpgradeOffer[], picksRemaining: number) => void;
  setForgeShopOffers: (offers: ForgeShopOffer[]) => void;
  setForgeShopPurchased: (v: boolean) => void;
  setCasinoState: (v: CasinoIntermissionState | null) => void;
  setActiveUpgrades: (u: { id: string; stacks: number }[]) => void;
  setBossWarn: (id: string | null) => void;
  setMeta: (meta: MetaState) => void;
  setHasRun: (v: boolean) => void;
  setSettings: (patch: Partial<Settings>) => void;
  setOnboarded: (v: boolean) => void;
  setDebugMode: (v: boolean) => void;
  setDebugMenuTheme: (t: MenuTheme | null) => void;
  setDebugMenuTrack: (t: MenuTrackId | null) => void;
}

export const useStore = create<StoreState>()(
  subscribeWithSelector((set) => ({
    screen: 'menu',
    hasRun: false,
    hud: {
      wave: 1,
      score: 0,
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
      runMutatorName: '',
      runMutatorShortName: '',
      waveArchetypeName: '',
      biomeName: '',
      encounterLine: '',
      roomLine: '',
      omenLine: '',
      forgeBonusLabel: '',
      objectiveLabel: '',
      objectiveStatus: '',
      elementalSetLabel: '',
      elementalSetDesc: '',
      houseClearLabel: '',
    },
    upgradeOffers: [],
    upgradePicksRemaining: 0,
    activeUpgrades: [],
    forgeShopOffers: [],
    forgeShopPurchased: false,
    casinoState: null,
    bossWarnTypeId: null,
    meta: {
      highScores: {},
      // Keep in sync with defaultMeta() in state/persistence.ts.
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
    },
    settings: { ...DEFAULT_SETTINGS },
    onboarded: false,
    debugMode: false,
    debugMenuTheme: null,
    debugMenuTrack: null,
    setScreen: (screen) => set({ screen }),
    setHud: (hud) => set((s) => ({ hud: { ...s.hud, ...hud } })),
    setUpgradeOffers: (offers, picksRemaining) =>
      set({ upgradeOffers: offers, upgradePicksRemaining: picksRemaining }),
    setForgeShopOffers: (offers) => set({ forgeShopOffers: offers }),
    setForgeShopPurchased: (forgeShopPurchased) => set({ forgeShopPurchased }),
    setCasinoState: (casinoState) => set({ casinoState }),
    setActiveUpgrades: (activeUpgrades) => set({ activeUpgrades }),
    setBossWarn: (id) => set({ bossWarnTypeId: id }),
    setMeta: (meta) => set({ meta }),
    setHasRun: (hasRun) => set({ hasRun }),
    setSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
    setOnboarded: (onboarded) => set({ onboarded }),
    setDebugMode: (debugMode) => set({ debugMode }),
    setDebugMenuTheme: (debugMenuTheme) => set({ debugMenuTheme }),
    setDebugMenuTrack: (debugMenuTrack) => set({ debugMenuTrack }),
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
