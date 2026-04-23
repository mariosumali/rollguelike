import { palHex } from './palette';
import { buildPaletteCanvas } from './sprite';

const DIE_SIZE = 24;

export interface DieSpriteSet {
  /** Full face sprites (body + default pips) indexed 0..5 for values 1..6. */
  faces: HTMLCanvasElement[];
  /** Shake animation frames (body + faint pips). */
  shake: HTMLCanvasElement[];
  /** Body-only sprite used when a face should render an upgrade icon in place of the pips. */
  blank: HTMLCanvasElement;
  size: number;
}

/** Optional per-face icon overlays. Index 0..5 corresponds to die values 1..6. */
export type DieFaceIcons = ReadonlyArray<HTMLCanvasElement | null | undefined>;

type DiePattern =
  | 'plain'
  | 'inlay'
  | 'rivets'
  | 'scale'
  | 'rune'
  | 'constellation'
  | 'cracked'
  | 'crystalline'
  | 'laurel'
  | 'takeout'
  | 'rainbow'
  | 'checker'
  | 'neon'
  | 'galaxy'
  | 'marble';

type DiePipStyle =
  | 'dot'
  | 'skull'
  | 'slit'
  | 'diamond'
  | 'star'
  | 'flame'
  | 'gem';

interface DieTheme {
  body: string;
  highlight: string;
  shadow: string;
  pip: string;
  pipHl: string;
  outline: string;
  pattern?: DiePattern;
  pipStyle?: DiePipStyle;
  accent?: string;
  accentHl?: string;
  glow?: string;
  /** Extra palette used by multi-color patterns (e.g. rainbow bands). */
  palette?: string[];
}

export const DIE_THEME_IDS = [
  'ivory',
  'crimson',
  'obsidian',
  'bone',
  'brass',
  'emerald',
  'ember',
  'frost',
  'arcane',
  'gold',
  'eclipse',
  'dragon',
  'celestial',
  'infernal',
  'runic',
  'champion',
  'takeout',
  'checker',
  'marble',
  'neon',
  'galaxy',
  'rainbow',
] as const;
export type DieThemeId = (typeof DIE_THEME_IDS)[number];

export const DIE_THEME_LABELS: Record<DieThemeId, string> = {
  ivory: 'Ivory',
  crimson: 'Crimson',
  obsidian: 'Obsidian',
  bone: 'Bone',
  brass: 'Brass',
  emerald: 'Emerald',
  ember: 'Ember',
  frost: 'Frost',
  arcane: 'Arcane',
  gold: 'Gold',
  eclipse: 'Eclipse',
  dragon: 'Dragon',
  celestial: 'Celestial',
  infernal: 'Infernal',
  runic: 'Runic',
  champion: 'Champion',
  takeout: 'Takeout',
  checker: 'Checker',
  marble: 'Marble',
  neon: 'Neon',
  galaxy: 'Galaxy',
  rainbow: 'Prism',
};

export const DIE_THEMES: Record<DieThemeId, DieTheme> = {
  ivory: {
    body: palHex('e')!,
    highlight: palHex('d')!,
    shadow: palHex('b')!,
    pip: palHex('2')!,
    pipHl: palHex('a')!,
    outline: palHex('1')!,
  },
  crimson: {
    body: palHex('h')!,
    highlight: palHex('i')!,
    shadow: palHex('g')!,
    pip: palHex('e')!,
    pipHl: palHex('d')!,
    outline: palHex('f')!,
  },
  obsidian: {
    body: palHex('3')!,
    highlight: palHex('4')!,
    shadow: palHex('1')!,
    pip: palHex('x')!,
    pipHl: palHex('v')!,
    outline: palHex('0')!,
  },
  bone: {
    body: palHex('9')!,
    highlight: palHex('e')!,
    shadow: palHex('7')!,
    pip: palHex('J')!,
    pipHl: palHex('K')!,
    outline: palHex('5')!,
  },
  brass: {
    body: palHex('8')!,
    highlight: palHex('v')!,
    shadow: palHex('7')!,
    pip: palHex('2')!,
    pipHl: palHex('5')!,
    outline: palHex('5')!,
  },
  emerald: {
    body: palHex('m')!,
    highlight: palHex('n')!,
    shadow: palHex('l')!,
    pip: palHex('1')!,
    pipHl: palHex('T')!,
    outline: palHex('T')!,
  },
  ember: {
    body: palHex('u')!,
    highlight: palHex('v')!,
    shadow: palHex('t')!,
    pip: palHex('1')!,
    pipHl: palHex('s')!,
    outline: palHex('s')!,
  },
  frost: {
    body: palHex('q')!,
    highlight: palHex('r')!,
    shadow: palHex('p')!,
    pip: palHex('1')!,
    pipHl: palHex('A')!,
    outline: palHex('o')!,
  },
  arcane: {
    body: palHex('H')!,
    highlight: palHex('I')!,
    shadow: palHex('G')!,
    pip: palHex('E')!,
    pipHl: palHex('F')!,
    outline: palHex('E')!,
  },
  gold: {
    body: palHex('y')!,
    highlight: palHex('e')!,
    shadow: palHex('x')!,
    pip: palHex('5')!,
    pipHl: palHex('s')!,
    outline: palHex('s')!,
  },

  // --- Intricate, challenge-locked themes -----------------------------------

  /** Obsidian black with a purple-tinted starfield and golden plus-stars for pips. */
  eclipse: {
    body: palHex('1')!,
    highlight: palHex('3')!,
    shadow: palHex('0')!,
    pip: palHex('y')!,
    pipHl: palHex('Q')!,
    outline: palHex('0')!,
    pattern: 'constellation',
    pipStyle: 'star',
    accent: palHex('w')!,
    accentHl: palHex('I')!,
    glow: palHex('S')!,
  },

  /** Deep forest green with scale rows and ember-orange reptilian slit pips. */
  dragon: {
    body: palHex('U')!,
    highlight: palHex('l')!,
    shadow: palHex('T')!,
    pip: palHex('u')!,
    pipHl: palHex('y')!,
    outline: palHex('0')!,
    pattern: 'scale',
    pipStyle: 'slit',
    accent: palHex('T')!,
    accentHl: palHex('m')!,
  },

  /** Deep violet with a sparse constellation + golden faceted gem pips. */
  celestial: {
    body: palHex('E')!,
    highlight: palHex('F')!,
    shadow: palHex('R')!,
    pip: palHex('x')!,
    pipHl: palHex('S')!,
    outline: palHex('R')!,
    pattern: 'constellation',
    pipStyle: 'gem',
    accent: palHex('D')!,
    accentHl: palHex('S')!,
    glow: palHex('I')!,
  },

  /** Cracked, glowing basalt with hot flame pips. */
  infernal: {
    body: palHex('J')!,
    highlight: palHex('g')!,
    shadow: palHex('0')!,
    pip: palHex('u')!,
    pipHl: palHex('y')!,
    outline: palHex('0')!,
    pattern: 'cracked',
    pipStyle: 'flame',
    accent: palHex('t')!,
    glow: palHex('u')!,
  },

  /** Stone die etched with four glowing arcane runes + cyan diamond pips. */
  runic: {
    body: palHex('a')!,
    highlight: palHex('b')!,
    shadow: palHex('1')!,
    pip: palHex('C')!,
    pipHl: palHex('D')!,
    outline: palHex('0')!,
    pattern: 'rune',
    pipStyle: 'diamond',
    accent: palHex('B')!,
    accentHl: palHex('D')!,
    glow: palHex('D')!,
  },

  /** Royal purple wrapped in a gold laurel — reserved for champions. */
  champion: {
    body: palHex('F')!,
    highlight: palHex('G')!,
    shadow: palHex('E')!,
    pip: palHex('x')!,
    pipHl: palHex('y')!,
    outline: palHex('R')!,
    pattern: 'laurel',
    pipStyle: 'gem',
    accent: palHex('x')!,
    accentHl: palHex('y')!,
  },

  /** White box wrapped in the iconic red Chinese-takeout pagoda silhouette. */
  takeout: {
    body: palHex('Q')!,
    highlight: palHex('S')!,
    shadow: palHex('c')!,
    pip: palHex('K')!,
    pipHl: palHex('L')!,
    outline: palHex('K')!,
    pattern: 'takeout',
    pipStyle: 'dot',
    accent: palHex('K')!,
    accentHl: palHex('L')!,
  },

  /** Pixel-sharp black/white checkerboard with crimson pips. */
  checker: {
    body: palHex('Q')!,
    highlight: palHex('S')!,
    shadow: palHex('P')!,
    pip: palHex('h')!,
    pipHl: palHex('j')!,
    outline: palHex('R')!,
    pattern: 'checker',
    pipStyle: 'dot',
    accent: palHex('R')!,
    accentHl: palHex('a')!,
  },

  /** Ivory stone with grey veining — timeless sculpture energy. */
  marble: {
    body: palHex('e')!,
    highlight: palHex('S')!,
    shadow: palHex('c')!,
    pip: palHex('1')!,
    pipHl: palHex('a')!,
    outline: palHex('2')!,
    pattern: 'marble',
    pipStyle: 'dot',
    accent: palHex('a')!,
    accentHl: palHex('c')!,
  },

  /** Midnight synthwave: magenta/cyan grid + bright pink pips. */
  neon: {
    body: palHex('0')!,
    highlight: palHex('E')!,
    shadow: palHex('R')!,
    pip: palHex('i')!,
    pipHl: palHex('j')!,
    outline: palHex('R')!,
    pattern: 'neon',
    pipStyle: 'diamond',
    accent: palHex('w')!,
    accentHl: palHex('D')!,
    glow: palHex('j')!,
  },

  /** Swirling deep-space nebula with scattered white stars. */
  galaxy: {
    body: palHex('E')!,
    highlight: palHex('F')!,
    shadow: palHex('R')!,
    pip: palHex('S')!,
    pipHl: palHex('r')!,
    outline: palHex('R')!,
    pattern: 'galaxy',
    pipStyle: 'star',
    accent: palHex('H')!,
    accentHl: palHex('D')!,
    glow: palHex('i')!,
  },

  /** Full prism rainbow bands — the collector's reward. */
  rainbow: {
    body: palHex('e')!,
    highlight: palHex('S')!,
    shadow: palHex('c')!,
    pip: palHex('0')!,
    pipHl: palHex('S')!,
    outline: palHex('0')!,
    pattern: 'rainbow',
    pipStyle: 'dot',
    palette: [
      palHex('L')!,
      palHex('u')!,
      palHex('y')!,
      palHex('z')!,
      palHex('q')!,
      palHex('H')!,
    ],
  },
};

/**
 * Per-theme unlock requirement. Themes without an entry (e.g. `ivory`) are
 * unlocked by default. `check(meta)` runs against the MetaState recorded
 * between runs. Do not reference in-run counters here.
 */
export interface DieThemeUnlock {
  description: string;
  check: (meta: DiceUnlockMeta) => boolean;
}

/** Subset of MetaState fields consulted by dice unlock predicates. */
export interface DiceUnlockMeta {
  totalRunsCompleted: number;
  totalWavesCleared: number;
  totalKills: number;
  maxGoldSpentInRun: number;
  maxWaveReached: number;
  bestSingleRunKills: number;
  highScores: Record<string, number>;
  unlockedCharacters: string[];
  unlockedArsenal: string[];
  unlockedDiceThemes: string[];
}

function bestHighScore(meta: DiceUnlockMeta): number {
  let best = 0;
  for (const v of Object.values(meta.highScores ?? {})) {
    if (typeof v === 'number' && v > best) best = v;
  }
  return best;
}

export const DIE_THEME_UNLOCKS: Partial<Record<DieThemeId, DieThemeUnlock>> = {
  crimson: {
    description: 'Complete your first run.',
    check: (m) => m.totalRunsCompleted >= 1,
  },
  obsidian: {
    description: 'Clear 5 waves in a single run.',
    check: (m) => m.maxWaveReached >= 5,
  },
  bone: {
    description: 'Defeat 100 enemies across all runs.',
    check: (m) => m.totalKills >= 100,
  },
  brass: {
    description: 'Spend 500+ gold in a single run.',
    check: (m) => m.maxGoldSpentInRun >= 500,
  },
  emerald: {
    description: 'Clear 25 waves across all runs.',
    check: (m) => m.totalWavesCleared >= 25,
  },
  ember: {
    description: 'Reach wave 10 in a single run.',
    check: (m) => m.maxWaveReached >= 10,
  },
  frost: {
    description: 'Clear 50 waves across all runs.',
    check: (m) => m.totalWavesCleared >= 50,
  },
  arcane: {
    description: 'Complete 5 runs.',
    check: (m) => m.totalRunsCompleted >= 5,
  },
  gold: {
    description: 'Score 1,000+ in a single run.',
    check: (m) => bestHighScore(m) >= 1000,
  },
  eclipse: {
    description: 'Reach wave 15 in a single run.',
    check: (m) => m.maxWaveReached >= 15,
  },
  dragon: {
    description: 'Defeat 250 enemies across all runs.',
    check: (m) => m.totalKills >= 250,
  },
  celestial: {
    description: 'Reach wave 20 in a single run.',
    check: (m) => m.maxWaveReached >= 20,
  },
  infernal: {
    description: 'Score 100 kills in a single run.',
    check: (m) => m.bestSingleRunKills >= 100,
  },
  runic: {
    description: 'Unlock 3 new arsenal upgrades.',
    check: (m) => ((m.unlockedArsenal?.length ?? 0) - 5) >= 3,
  },
  champion: {
    description: 'Unlock all 6 characters.',
    check: (m) => (m.unlockedCharacters?.length ?? 0) >= 6,
  },
  takeout: {
    description: 'Defeat 500 enemies across all runs.',
    check: (m) => m.totalKills >= 500,
  },
  checker: {
    description: 'Complete 10 runs.',
    check: (m) => m.totalRunsCompleted >= 10,
  },
  marble: {
    description: 'Score 2,000+ in a single run.',
    check: (m) => bestHighScore(m) >= 2000,
  },
  neon: {
    description: 'Reach wave 25 in a single run.',
    check: (m) => m.maxWaveReached >= 25,
  },
  galaxy: {
    description: 'Clear 100 waves across all runs.',
    check: (m) => m.totalWavesCleared >= 100,
  },
  rainbow: {
    description: 'Unlock 15 other dice themes.',
    check: (m) =>
      (m.unlockedDiceThemes?.filter((id) => id !== 'rainbow').length ?? 0) >= 15,
  },
};

/** Die themes that require no challenge. */
export const DIE_THEME_DEFAULT_UNLOCKS: DieThemeId[] = DIE_THEME_IDS.filter(
  (id) => !DIE_THEME_UNLOCKS[id],
);

const PIP_POSITIONS: Record<number, Array<[number, number]>> = {
  1: [[0.5, 0.5]],
  2: [
    [0.28, 0.28],
    [0.72, 0.72],
  ],
  3: [
    [0.26, 0.26],
    [0.5, 0.5],
    [0.74, 0.74],
  ],
  4: [
    [0.28, 0.28],
    [0.72, 0.28],
    [0.28, 0.72],
    [0.72, 0.72],
  ],
  5: [
    [0.26, 0.26],
    [0.74, 0.26],
    [0.5, 0.5],
    [0.26, 0.74],
    [0.74, 0.74],
  ],
  6: [
    [0.27, 0.22],
    [0.27, 0.5],
    [0.27, 0.78],
    [0.73, 0.22],
    [0.73, 0.5],
    [0.73, 0.78],
  ],
};

function drawDieBody(ctx: CanvasRenderingContext2D, size: number, theme: DieTheme, tumble = 0): void {
  const s = size;
  const o = theme.outline;
  const b = theme.body;
  const h = theme.highlight;
  const sh = theme.shadow;

  ctx.fillStyle = b;
  ctx.fillRect(2, 2, s - 4, s - 4);
  ctx.fillRect(1, 3, s - 2, s - 6);
  ctx.fillRect(3, 1, s - 6, s - 2);

  ctx.fillStyle = o;
  ctx.fillRect(4, 0, s - 8, 1);
  ctx.fillRect(4, s - 1, s - 8, 1);
  ctx.fillRect(0, 4, 1, s - 8);
  ctx.fillRect(s - 1, 4, 1, s - 8);
  ctx.fillRect(2, 1, 2, 1);
  ctx.fillRect(s - 4, 1, 2, 1);
  ctx.fillRect(1, 2, 1, 2);
  ctx.fillRect(s - 2, 2, 1, 2);
  ctx.fillRect(2, s - 2, 2, 1);
  ctx.fillRect(s - 4, s - 2, 2, 1);
  ctx.fillRect(1, s - 4, 1, 2);
  ctx.fillRect(s - 2, s - 4, 1, 2);

  ctx.fillStyle = h;
  ctx.fillRect(3, 2, s - 10, 1);
  ctx.fillRect(2, 3, 1, s - 10);
  ctx.fillRect(4, 1, s - 12, 1);

  ctx.fillStyle = sh;
  ctx.fillRect(7, s - 3, s - 10, 1);
  ctx.fillRect(s - 3, 7, 1, s - 10);
  ctx.fillRect(8, s - 2, s - 12, 1);

  if (theme.pattern && theme.pattern !== 'plain') {
    drawPattern(ctx, s, theme);
  }

  if (tumble !== 0) {
    ctx.fillStyle = h;
    const bandY = 4 + (tumble % 3);
    ctx.fillRect(3, bandY, s - 6, 1);
  }
}

function drawPattern(ctx: CanvasRenderingContext2D, size: number, theme: DieTheme): void {
  const s = size;
  const accent = theme.accent ?? theme.shadow;
  const accentHl = theme.accentHl ?? theme.highlight;
  const glow = theme.glow;
  switch (theme.pattern) {
    case 'inlay': {
      ctx.fillStyle = accent;
      ctx.fillRect(4, 2, s - 8, 1);
      ctx.fillRect(4, s - 3, s - 8, 1);
      ctx.fillRect(2, 4, 1, s - 8);
      ctx.fillRect(s - 3, 4, 1, s - 8);
      ctx.fillRect(3, 3, 1, 1);
      ctx.fillRect(s - 4, 3, 1, 1);
      ctx.fillRect(3, s - 4, 1, 1);
      ctx.fillRect(s - 4, s - 4, 1, 1);
      ctx.fillStyle = accentHl;
      ctx.fillRect(4, 2, 2, 1);
      ctx.fillRect(2, 4, 1, 2);
      break;
    }
    case 'rivets': {
      const dots: Array<[number, number]> = [
        [4, 4], [s - 6, 4], [4, s - 6], [s - 6, s - 6],
      ];
      for (const [x, y] of dots) {
        ctx.fillStyle = accent;
        ctx.fillRect(x, y, 2, 2);
        ctx.fillStyle = accentHl;
        ctx.fillRect(x, y, 1, 1);
      }
      break;
    }
    case 'scale': {
      // Staggered scale rows — sparse enough to let pips punch through.
      for (let row = 0; row < 5; row++) {
        const y = 4 + row * 3;
        if (y >= s - 3) break;
        const offset = row & 1 ? 0 : 2;
        for (let x = 3 + offset; x < s - 4; x += 4) {
          ctx.fillStyle = accent;
          ctx.fillRect(x, y, 2, 1);
          ctx.fillRect(x, y + 1, 1, 1);
          ctx.fillStyle = accentHl;
          ctx.fillRect(x + 1, y, 1, 1);
        }
      }
      break;
    }
    case 'rune': {
      const drawRune = (x: number, y: number, variant: number) => {
        ctx.fillStyle = accent;
        if (variant === 0) {
          ctx.fillRect(x, y, 3, 1);
          ctx.fillRect(x + 1, y + 1, 1, 2);
        } else if (variant === 1) {
          ctx.fillRect(x, y, 1, 3);
          ctx.fillRect(x + 1, y + 1, 2, 1);
        } else if (variant === 2) {
          ctx.fillRect(x, y, 2, 1);
          ctx.fillRect(x, y + 1, 1, 1);
          ctx.fillRect(x + 1, y + 2, 2, 1);
        } else {
          ctx.fillRect(x, y, 3, 1);
          ctx.fillRect(x, y + 1, 1, 1);
          ctx.fillRect(x + 2, y + 1, 1, 1);
          ctx.fillRect(x, y + 2, 3, 1);
        }
        if (glow) {
          ctx.fillStyle = glow;
          ctx.fillRect(x + 1, y + 1, 1, 1);
        }
      };
      drawRune(3, 3, 0);
      drawRune(s - 6, 3, 1);
      drawRune(3, s - 6, 2);
      drawRune(s - 6, s - 6, 3);
      break;
    }
    case 'constellation': {
      // Sparse starfield kept out of the central pip zones.
      const stars: Array<[number, number, number]> = [
        [4, 3, 0], [7, 6, 1], [s - 5, 4, 1], [s - 4, 8, 0],
        [5, s - 5, 0], [s - 6, s - 4, 1], [3, 10, 0], [s - 3, 13, 0],
        [10, 3, 1], [s - 10, s - 3, 1],
      ];
      for (const [x, y, big] of stars) {
        ctx.fillStyle = accent;
        ctx.fillRect(x, y, 1, 1);
        if (big) {
          ctx.fillRect(x - 1, y, 1, 1);
          ctx.fillRect(x + 1, y, 1, 1);
          ctx.fillRect(x, y - 1, 1, 1);
          ctx.fillRect(x, y + 1, 1, 1);
          ctx.fillStyle = accentHl;
          ctx.fillRect(x, y, 1, 1);
        }
      }
      break;
    }
    case 'cracked': {
      const cracks: Array<Array<[number, number]>> = [
        [[3, 2], [4, 3], [5, 3], [6, 4], [7, 5]],
        [[s - 4, 2], [s - 5, 3], [s - 6, 3], [s - 7, 4]],
        [[3, s - 3], [4, s - 4], [5, s - 4], [6, s - 5]],
        [[s - 4, s - 3], [s - 5, s - 4], [s - 6, s - 4], [s - 7, s - 5]],
      ];
      for (const crack of cracks) {
        ctx.fillStyle = accent;
        for (const [x, y] of crack) {
          ctx.fillRect(x, y, 1, 1);
        }
        if (glow) {
          const mid = crack[Math.floor(crack.length / 2)]!;
          ctx.fillStyle = glow;
          ctx.fillRect(mid[0], mid[1], 1, 1);
        }
      }
      break;
    }
    case 'crystalline': {
      ctx.fillStyle = accent;
      for (let i = 0; i < 7; i++) {
        ctx.fillRect(2 + i, s - 3 - i, 1, 1);
        ctx.fillRect(s - 3 - i, 2 + i, 1, 1);
      }
      ctx.fillStyle = accentHl;
      ctx.fillRect(3, s - 4, 1, 1);
      ctx.fillRect(s - 4, 3, 1, 1);
      break;
    }
    case 'laurel': {
      ctx.fillStyle = accent;
      const topY = 3;
      const botY = s - 4;
      const xs = [5, 9, 13, 17];
      for (const x of xs) {
        if (x >= s - 3) break;
        ctx.fillRect(x, topY, 2, 1);
        ctx.fillRect(x + 1, topY - 1, 1, 1);
        ctx.fillRect(x, botY, 2, 1);
        ctx.fillRect(x + 1, botY + 1, 1, 1);
      }
      ctx.fillStyle = accentHl;
      for (const x of xs) {
        if (x >= s - 3) break;
        ctx.fillRect(x, topY, 1, 1);
        ctx.fillRect(x + 1, botY, 1, 1);
      }
      break;
    }
    case 'takeout': {
      // Red pagoda-style peaks on the top and bottom edges.
      const tips = [5, 9, 13, 17];
      ctx.fillStyle = accent;
      for (const x of tips) {
        if (x > s - 4) break;
        // top pagoda peak
        ctx.fillRect(x, 2, 1, 1);
        ctx.fillRect(x - 1, 3, 3, 1);
        // bottom pagoda peak (mirrored)
        ctx.fillRect(x - 1, s - 4, 3, 1);
        ctx.fillRect(x, s - 3, 1, 1);
      }
      // Small side ticks — evokes a folded paper box.
      ctx.fillRect(3, 11, 1, 2);
      ctx.fillRect(s - 4, 11, 1, 2);
      ctx.fillStyle = accentHl;
      for (const x of tips) {
        if (x > s - 4) break;
        ctx.fillRect(x, 3, 1, 1);
        ctx.fillRect(x, s - 4, 1, 1);
      }
      break;
    }
    case 'rainbow': {
      const pal = theme.palette ?? [accent, accentHl, theme.pip, theme.pipHl];
      if (pal.length === 0) break;
      // Diagonal 3-pixel bands across the inner face.
      for (let y = 2; y < s - 2; y++) {
        for (let x = 2; x < s - 2; x++) {
          const idx = Math.floor((x + y) / 3) % pal.length;
          const color = pal[idx];
          if (!color) continue;
          ctx.fillStyle = color;
          ctx.fillRect(x, y, 1, 1);
        }
      }
      break;
    }
    case 'checker': {
      // 5x5 tile grid of 4x4 checkered squares.
      for (let ty = 0; ty < 5; ty++) {
        for (let tx = 0; tx < 5; tx++) {
          if ((tx + ty) & 1) {
            ctx.fillStyle = accent;
            ctx.fillRect(2 + tx * 4, 2 + ty * 4, 4, 4);
          }
        }
      }
      // Subtle top-left pixel highlight per accent tile.
      ctx.fillStyle = accentHl;
      for (let ty = 0; ty < 5; ty++) {
        for (let tx = 0; tx < 5; tx++) {
          if ((tx + ty) & 1) {
            ctx.fillRect(2 + tx * 4, 2 + ty * 4, 1, 1);
          }
        }
      }
      break;
    }
    case 'neon': {
      // Magenta vertical gridlines.
      ctx.fillStyle = accent;
      for (const x of [5, 11, 17]) {
        if (x > s - 3) break;
        ctx.fillRect(x, 3, 1, s - 6);
      }
      // Cyan horizontal gridlines.
      ctx.fillStyle = accentHl;
      for (const y of [5, 11, 17]) {
        if (y > s - 3) break;
        ctx.fillRect(3, y, s - 6, 1);
      }
      // Hot intersections.
      if (glow) {
        ctx.fillStyle = glow;
        for (const x of [5, 11, 17]) {
          for (const y of [5, 11, 17]) {
            if (x > s - 3 || y > s - 3) continue;
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
      break;
    }
    case 'galaxy': {
      const drawCloud = (cx: number, cy: number, a: string, b: string) => {
        ctx.fillStyle = a;
        ctx.fillRect(cx - 1, cy, 3, 1);
        ctx.fillRect(cx, cy - 1, 1, 3);
        ctx.fillRect(cx + 2, cy - 1, 1, 2);
        ctx.fillRect(cx - 2, cy + 1, 2, 1);
        ctx.fillStyle = b;
        ctx.fillRect(cx, cy, 1, 1);
      };
      drawCloud(7, 6, accent, accentHl);
      drawCloud(16, 17, accent, accentHl);
      if (glow) drawCloud(16, 7, glow, accentHl);
      // Scattered stars.
      ctx.fillStyle = accentHl;
      const stars: Array<[number, number]> = [
        [4, 4], [10, 11], [14, 4], [19, 9],
        [5, 18], [11, 16], [20, 14], [17, 10],
      ];
      for (const [x, y] of stars) {
        if (x < 2 || x > s - 3 || y < 2 || y > s - 3) continue;
        ctx.fillRect(x, y, 1, 1);
      }
      break;
    }
    case 'marble': {
      // Primary zig-zag vein from top-left toward bottom-right.
      ctx.fillStyle = accent;
      const vein: Array<[number, number]> = [
        [3, 5], [4, 6], [5, 6], [6, 7], [7, 8], [8, 8], [9, 9],
        [10, 10], [11, 10], [12, 11], [13, 12], [14, 12], [15, 13],
        [16, 14], [17, 14], [18, 15], [19, 16],
      ];
      for (const [x, y] of vein) {
        if (x < 2 || x > s - 3 || y < 2 || y > s - 3) continue;
        ctx.fillRect(x, y, 1, 1);
      }
      // Branching secondary vein.
      const vein2: Array<[number, number]> = [
        [9, 4], [10, 5], [11, 6], [12, 6], [13, 7], [14, 8],
      ];
      for (const [x, y] of vein2) {
        if (x < 2 || x > s - 3 || y < 2 || y > s - 3) continue;
        ctx.fillRect(x, y, 1, 1);
      }
      // A couple of lighter crystal glints along the main vein.
      ctx.fillStyle = accentHl;
      ctx.fillRect(6, 7, 1, 1);
      ctx.fillRect(14, 12, 1, 1);
      break;
    }
  }
}

function drawPipAt(ctx: CanvasRenderingContext2D, cx: number, cy: number, theme: DieTheme): void {
  const style = theme.pipStyle ?? 'dot';
  ctx.fillStyle = theme.pip;
  switch (style) {
    case 'skull': {
      ctx.fillRect(cx - 2, cy - 2, 5, 1);
      ctx.fillRect(cx - 2, cy - 1, 5, 1);
      ctx.fillRect(cx - 2, cy, 5, 1);
      ctx.fillRect(cx - 1, cy + 1, 3, 1);
      ctx.fillStyle = theme.pipHl;
      ctx.fillRect(cx - 1, cy - 1, 1, 1);
      ctx.fillRect(cx + 1, cy - 1, 1, 1);
      ctx.fillRect(cx, cy + 1, 1, 1);
      break;
    }
    case 'slit': {
      ctx.fillRect(cx, cy - 2, 1, 5);
      ctx.fillRect(cx - 1, cy - 1, 3, 3);
      ctx.fillStyle = theme.pipHl;
      ctx.fillRect(cx, cy - 1, 1, 3);
      break;
    }
    case 'diamond': {
      ctx.fillRect(cx, cy - 2, 1, 1);
      ctx.fillRect(cx - 1, cy - 1, 3, 1);
      ctx.fillRect(cx - 2, cy, 5, 1);
      ctx.fillRect(cx - 1, cy + 1, 3, 1);
      ctx.fillRect(cx, cy + 2, 1, 1);
      ctx.fillStyle = theme.pipHl;
      ctx.fillRect(cx, cy, 1, 1);
      break;
    }
    case 'star': {
      ctx.fillRect(cx, cy - 2, 1, 5);
      ctx.fillRect(cx - 2, cy, 5, 1);
      ctx.fillRect(cx - 1, cy - 1, 1, 1);
      ctx.fillRect(cx + 1, cy - 1, 1, 1);
      ctx.fillRect(cx - 1, cy + 1, 1, 1);
      ctx.fillRect(cx + 1, cy + 1, 1, 1);
      ctx.fillStyle = theme.pipHl;
      ctx.fillRect(cx, cy, 1, 1);
      break;
    }
    case 'flame': {
      ctx.fillRect(cx, cy - 2, 1, 1);
      ctx.fillRect(cx - 1, cy - 1, 3, 1);
      ctx.fillRect(cx - 2, cy, 5, 1);
      ctx.fillRect(cx - 2, cy + 1, 5, 1);
      ctx.fillRect(cx - 1, cy + 2, 3, 1);
      ctx.fillStyle = theme.pipHl;
      ctx.fillRect(cx, cy - 1, 1, 1);
      ctx.fillRect(cx, cy, 1, 1);
      break;
    }
    case 'gem': {
      ctx.fillRect(cx - 1, cy - 2, 3, 1);
      ctx.fillRect(cx - 2, cy - 1, 5, 1);
      ctx.fillRect(cx - 2, cy, 5, 1);
      ctx.fillRect(cx - 1, cy + 1, 3, 1);
      ctx.fillRect(cx, cy + 2, 1, 1);
      ctx.fillStyle = theme.pipHl;
      ctx.fillRect(cx - 1, cy - 1, 1, 1);
      ctx.fillRect(cx, cy, 1, 1);
      break;
    }
    default: {
      ctx.fillRect(cx - 1, cy - 2, 3, 1);
      ctx.fillRect(cx - 2, cy - 1, 5, 3);
      ctx.fillRect(cx - 1, cy + 2, 3, 1);
      ctx.fillStyle = theme.pipHl;
      ctx.fillRect(cx - 1, cy - 1, 1, 1);
    }
  }
}

function drawPips(ctx: CanvasRenderingContext2D, size: number, value: number, theme: DieTheme): void {
  const positions = PIP_POSITIONS[value];
  if (!positions) return;
  for (const [fx, fy] of positions) {
    const cx = Math.round(fx * size);
    const cy = Math.round(fy * size);
    drawPipAt(ctx, cx, cy, theme);
  }
}

export function getDieTheme(id: DieThemeId | string | undefined | null): DieTheme {
  if (id && (DIE_THEMES as Record<string, DieTheme>)[id]) {
    return (DIE_THEMES as Record<string, DieTheme>)[id]!;
  }
  return DIE_THEMES.ivory!;
}

export function buildDieSpriteSet(theme: DieTheme = DIE_THEMES.ivory!): DieSpriteSet {
  const size = DIE_SIZE;
  const faces: HTMLCanvasElement[] = [];
  for (let v = 1; v <= 6; v++) {
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const ctx = c.getContext('2d')!;
    drawDieBody(ctx, size, theme);
    drawPips(ctx, size, v, theme);
    faces.push(c);
  }
  const shake: HTMLCanvasElement[] = [];
  for (let i = 0; i < 6; i++) {
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const ctx = c.getContext('2d')!;
    drawDieBody(ctx, size, theme, i + 1);
    const fakeVal = (i % 6) + 1;
    ctx.globalAlpha = 0.35;
    drawPips(ctx, size, fakeVal, theme);
    ctx.globalAlpha = 1;
    shake.push(c);
  }
  const blank = document.createElement('canvas');
  blank.width = size;
  blank.height = size;
  drawDieBody(blank.getContext('2d')!, size, theme);
  return { faces, shake, blank, size };
}

const iconCache = new WeakMap<string[], HTMLCanvasElement>();
const iconCacheById = new Map<string, HTMLCanvasElement>();

/**
 * Rasterize palette-row icon data into a canvas, cached by row identity or cache key.
 * Rows wider or taller than the die face are cropped when drawn; authoring should stay <= 14x14.
 */
export function buildFaceIconCanvas(rows: string[], cacheKey?: string): HTMLCanvasElement | null {
  if (!rows || rows.length === 0) return null;
  if (cacheKey) {
    const cached = iconCacheById.get(cacheKey);
    if (cached) return cached;
  }
  const identityCached = iconCache.get(rows);
  if (identityCached) {
    if (cacheKey) iconCacheById.set(cacheKey, identityCached);
    return identityCached;
  }
  const canvas = buildPaletteCanvas(rows);
  iconCache.set(rows, canvas);
  if (cacheKey) iconCacheById.set(cacheKey, canvas);
  return canvas;
}

function drawFaceIcon(
  ctx: CanvasRenderingContext2D,
  icon: HTMLCanvasElement,
  dieX: number,
  dieY: number,
  dieSize: number,
): void {
  const iw = icon.width;
  const ih = icon.height;
  const ox = Math.round(dieX + (dieSize - iw) / 2);
  const oy = Math.round(dieY + (dieSize - ih) / 2);
  ctx.drawImage(icon, ox, oy);
}

export function drawDie(
  ctx: CanvasRenderingContext2D,
  set: DieSpriteSet,
  value: number,
  x: number,
  y: number,
  shaking: boolean,
  shakeFrame: number,
  wobble = 0,
  faceIcons?: DieFaceIcons,
): void {
  const clampedValue = Math.max(0, Math.min(5, value - 1));
  const wobbleX = shaking ? Math.round(Math.sin(wobble * 30) * 1) : 0;
  const wobbleY = shaking ? Math.round(Math.cos(wobble * 25) * 1) : 0;
  const ox = Math.round(x - set.size / 2) + wobbleX;
  const oy = Math.round(y - set.size / 2) + wobbleY;

  if (shaking) {
    ctx.drawImage(set.shake[shakeFrame % set.shake.length]!, ox, oy);
    return;
  }

  const icon = faceIcons ? faceIcons[clampedValue] : null;
  if (icon) {
    ctx.drawImage(set.blank, ox, oy);
    drawFaceIcon(ctx, icon, ox, oy, set.size);
    return;
  }

  ctx.drawImage(set.faces[clampedValue]!, ox, oy);
}
