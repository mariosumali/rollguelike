export type Theme =
  | 'castle'
  | 'mountain'
  | 'pirateCove'
  | 'graveyard'
  | 'cave'
  | 'enchantedForest'
  | 'volcano'
  | 'wizardTower'
  | 'skyTemple'
  | 'ironFoundry'
  | 'abyssalTrench'
  | 'sunbleachedDunes'
  | 'stormBalcony';

export const ALL_THEMES: readonly Theme[] = [
  'castle',
  'mountain',
  'pirateCove',
  'graveyard',
  'cave',
  'enchantedForest',
  'volcano',
  'wizardTower',
  'skyTemple',
  'ironFoundry',
  'abyssalTrench',
  'sunbleachedDunes',
  'stormBalcony',
] as const;

export interface TorchPalette {
  core: string;
  hot: string;
  mid: string;
  outer: string;
  ember: string;
  hotSpot: string;
}

export interface MenuEngine {
  readonly ctx: CanvasRenderingContext2D;
  readonly W: number;
  readonly H: number;
  spawnEmber(x: number, y: number, color: string): void;
}

export interface TorchMount {
  x: number;
  y: number;
}

export interface ThemeController {
  /** Palette used for the flanking torches. */
  torchPal: TorchPalette;
  /** Flame-center anchors for theme-specific torch holders. */
  torchMounts?: readonly TorchMount[];
  /** Whether twinkling stars fill the upper sky. */
  stars: boolean;
  /** Whether occasional shooting stars streak across the sky. */
  shootingStars: boolean;
  /** Optional override for the magic-circle accent color. */
  magicCircleKey?: string;
  /** Distant backdrop — sky, horizon, far features. */
  drawBackdrop(t: number, dt: number): void;
  /** Middle-ground — architecture, silhouettes, the scene's focus. */
  drawMidground(t: number, dt: number): void;
  /** Ground plane — tiles, planks, dirt, plus the magic circle. */
  drawFloor(t: number, dt: number): void;
  /** Optional overlay layer drawn last (in-air particles, light shafts…). */
  drawOverlay?(t: number, dt: number): void;
}

export type ThemeFactory = (engine: MenuEngine) => ThemeController;
