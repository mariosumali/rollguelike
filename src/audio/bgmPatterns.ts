import type { BgmTrackId } from '../state/store';

/**
 * Non-selectable tracks played on non-gameplay screens (menu / select / gameover).
 * Several genre variants exist — one is chosen at random on each menu entry so the
 * landing theme feels fresh between runs.
 */
export const MENU_TRACK_IDS = [
  'menu',
  'menu-chiptune',
  'menu-synthwave',
  'menu-lofi',
  'menu-celtic',
  'menu-march',
] as const;
export type MenuTrackId = (typeof MENU_TRACK_IDS)[number];
/** Stable default used as a fallback; prefer `pickRandomMenuTrack()` for actual playback. */
export const MENU_TRACK_ID: MenuTrackId = 'menu';

let lastMenuPick: MenuTrackId | null = null;
/** Pick a random menu variant, avoiding an immediate repeat of the previous pick. */
export function pickRandomMenuTrack(): MenuTrackId {
  const ids = MENU_TRACK_IDS;
  if (ids.length <= 1) return ids[0];
  let pick: MenuTrackId;
  do {
    pick = ids[Math.floor(Math.random() * ids.length)];
  } while (pick === lastMenuPick);
  lastMenuPick = pick;
  return pick;
}

export type BgmPatternKey = BgmTrackId | MenuTrackId;

export type BgmLayerPattern = {
  bpm: number;
  stepMul: number;
  /** Triangle: roots */
  bass: number[];
  /** Square: main “theme” (catchy) */
  lead: number[];
  /** Square: harmony or response */
  counter: number[];
  /** Harp: broken chords, short */
  arp: number[];
  /** String pad: chord tones (sustained feel) */
  strings: number[];
  /** Short brass stabs, downbeats + accents */
  brass: number[];
  kick: boolean[];
  snare: boolean[];
  hihat: boolean[];
};

// --- phrase helpers ---------------------------------------------------------
// Each seed below is a 16-step "phrase A". `expandSong()` (at the bottom of
// this file) turns it into a 64-step song of the form  A – A' – B – A''  so
// tracks don't repeat the same 4 bars every few seconds. See `expandSong` for
// the exact transformations.

function offsetLayer(arr: number[], semi: number): number[] {
  return arr.map((n) => (n > 0 ? Math.max(1, n + semi) : 0));
}

function rotateArr<T>(arr: T[], n: number): T[] {
  if (arr.length === 0) return arr;
  const len = arr.length;
  const k = ((n % len) + len) % len;
  return arr.slice(k).concat(arr.slice(0, k));
}

function swapHalves<T>(arr: T[]): T[] {
  const half = (arr.length / 2) | 0;
  return arr.slice(half).concat(arr.slice(0, half));
}

function fillEnd(snare: boolean[]): boolean[] {
  const out = snare.slice();
  if (out.length >= 1) out[out.length - 1] = true;
  if (out.length >= 2) out[out.length - 2] = true;
  return out;
}

/**
 * ①–③ Adventure tone (field / woods / fanfare).
 * ④ Omen — D minor, half-time, grave.
 * ⑤ Stormwall — E minor, driving kit.
 * ⑥ Throne — G minor, slow & wide, coronation weight.
 * + `menu` — non-selectable title-screen theme (plays on menu/select/gameover).
 *
 * These are the 16-step *seed* phrases; `BGM_SETS` (exported below) expands
 * them into full 64-step songs so the landing page and gameplay don't hammer
 * the same 4-bar loop on repeat.
 */
const BGM_SEEDS: Record<
  BgmPatternKey,
  { normal: BgmLayerPattern; boss: BgmLayerPattern }
> = {
  overworld: {
    normal: {
      bpm: 156,
      stepMul: 1,
      bass: [
        48, 48, 48, 48, 43, 43, 43, 43, 45, 45, 45, 45, 41, 41, 41, 41,
      ],
      lead: [
        72, 76, 79, 84, 79, 76, 72, 76, 77, 79, 81, 84, 79, 76, 74, 72,
      ],
      counter: [
        68, 0, 74, 79, 76, 72, 68, 72, 72, 74, 76, 79, 76, 72, 69, 68,
      ],
      arp: [
        72, 76, 79, 84, 71, 67, 72, 76, 69, 72, 76, 81, 65, 69, 72, 77,
      ],
      strings: [
        60, 60, 60, 60, 55, 55, 55, 55, 57, 57, 57, 57, 53, 53, 53, 53,
      ],
      brass: [
        60, 0, 0, 0, 55, 0, 0, 0, 57, 0, 0, 0, 53, 0, 0, 0,
      ],
      kick: [
        true, false, false, false, false, false, true, false, true, false, false, false, false, false, true, false,
      ],
      snare: [
        false, false, false, false, true, false, false, true, false, false, false, false, true, false, false, true,
      ],
      hihat: [
        true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false,
      ],
    },
    boss: {
      bpm: 158,
      stepMul: 0.9,
      bass: [
        45, 45, 0, 45, 40, 40, 0, 40, 45, 45, 0, 45, 41, 41, 0, 41,
      ],
      lead: [
        69, 0, 72, 0, 68, 0, 65, 0, 70, 72, 74, 0, 72, 68, 65, 68,
      ],
      counter: [
        0, 64, 0, 64, 0, 60, 0, 60, 0, 64, 0, 64, 0, 60, 0, 0,
      ],
      arp: [
        64, 68, 72, 76, 59, 64, 67, 71, 64, 68, 72, 77, 60, 64, 67, 72,
      ],
      strings: [
        57, 57, 57, 57, 52, 52, 52, 52, 55, 55, 55, 55, 50, 50, 50, 50,
      ],
      brass: [
        45, 0, 0, 0, 40, 0, 0, 0, 45, 0, 0, 0, 41, 0, 0, 0,
      ],
      kick: [
        true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false,
      ],
      snare: [
        false, false, true, false, false, true, false, true, false, false, true, false, false, true, false, true,
      ],
      hihat: [
        true, true, false, true, true, true, false, true, true, true, false, true, true, true, false, true,
      ],
    },
  },
  ancient: {
    normal: {
      bpm: 150,
      stepMul: 1,
      bass: [
        40, 0, 40, 0, 38, 0, 38, 0, 36, 36, 0, 36, 35, 0, 0, 35,
      ],
      lead: [
        64, 66, 67, 69, 67, 64, 62, 60, 64, 66, 67, 72, 67, 64, 62, 64,
      ],
      counter: [
        0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 60, 0, 0,
      ],
      arp: [
        64, 68, 71, 76, 62, 66, 69, 74, 60, 64, 67, 72, 59, 62, 66, 71,
      ],
      strings: [
        55, 55, 55, 55, 52, 52, 52, 52, 48, 48, 48, 48, 47, 47, 47, 47,
      ],
      brass: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ],
      kick: [
        true, false, false, true, false, false, true, false, true, false, false, true, false, false, true, false,
      ],
      snare: [
        false, false, true, false, false, true, false, true, false, false, true, false, true, false, false, true,
      ],
      hihat: [
        true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true,
      ],
    },
    boss: {
      bpm: 152,
      stepMul: 0.88,
      bass: [
        40, 39, 40, 41, 38, 37, 38, 40, 36, 0, 36, 38, 35, 0, 35, 37,
      ],
      lead: [
        63, 0, 65, 0, 62, 0, 60, 0, 65, 67, 68, 0, 65, 63, 62, 63,
      ],
      counter: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ],
      arp: [
        63, 67, 70, 75, 60, 64, 67, 72, 62, 65, 68, 74, 59, 62, 65, 70,
      ],
      strings: [
        51, 51, 51, 51, 48, 48, 48, 48, 46, 46, 46, 46, 45, 45, 45, 45,
      ],
      brass: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ],
      kick: [
        true, false, true, false, true, false, true, true, true, false, true, false, true, false, true, true,
      ],
      snare: [
        false, true, false, true, false, true, false, true, false, true, false, true, false, true, false, true,
      ],
      hihat: [
        true, true, false, true, true, true, false, true, true, true, true, true, true, true, false, true,
      ],
    },
  },
  courage: {
    normal: {
      bpm: 162,
      stepMul: 1,
      bass: [
        50, 0, 50, 0, 45, 0, 45, 0, 47, 0, 47, 0, 42, 0, 42, 0,
      ],
      lead: [
        69, 74, 73, 71, 69, 0, 69, 73, 71, 73, 76, 78, 81, 78, 76, 74,
      ],
      counter: [
        0, 66, 0, 0, 0, 0, 0, 0, 0, 66, 0, 0, 0, 66, 0, 0,
      ],
      arp: [
        74, 78, 81, 86, 69, 74, 78, 81, 76, 81, 85, 90, 66, 69, 74, 78,
      ],
      strings: [
        62, 62, 62, 62, 57, 57, 57, 57, 59, 59, 59, 59, 54, 54, 54, 54,
      ],
      brass: [
        50, 0, 0, 0, 45, 0, 0, 0, 47, 0, 0, 0, 42, 0, 0, 0,
      ],
      kick: [
        true, false, false, false, true, false, true, false, true, false, false, true, true, false, true, false,
      ],
      snare: [
        false, false, false, false, true, false, false, true, false, false, true, false, true, false, false, true,
      ],
      hihat: [
        true, false, true, false, true, true, true, false, true, false, true, true, true, false, true, true,
      ],
    },
    boss: {
      bpm: 166,
      stepMul: 0.9,
      bass: [
        50, 49, 50, 51, 45, 44, 45, 47, 47, 0, 47, 50, 42, 41, 42, 45,
      ],
      lead: [
        69, 0, 73, 0, 68, 0, 71, 0, 73, 76, 78, 0, 76, 73, 71, 69,
      ],
      counter: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 66, 0, 0, 0, 0, 0, 0,
      ],
      arp: [
        73, 77, 80, 85, 68, 73, 77, 82, 75, 80, 84, 89, 65, 68, 73, 77,
      ],
      strings: [
        60, 60, 60, 60, 57, 57, 57, 57, 59, 59, 59, 59, 55, 55, 55, 55,
      ],
      brass: [
        50, 0, 0, 0, 45, 0, 0, 0, 50, 0, 0, 0, 45, 0, 0, 0,
      ],
      kick: [
        true, false, true, false, true, false, true, true, true, false, true, false, true, false, true, true,
      ],
      snare: [
        false, true, false, true, false, true, false, true, false, true, false, true, false, true, false, true,
      ],
      hihat: [
        true, true, false, true, true, true, true, true, true, true, false, true, true, true, true, true,
      ],
    },
  },
  omen: {
    normal: {
      bpm: 142,
      stepMul: 1.04,
      bass: [
        38, 0, 0, 0, 34, 0, 0, 0, 41, 0, 0, 0, 36, 0, 0, 0,
      ],
      lead: [
        62, 0, 64, 0, 65, 0, 67, 0, 69, 0, 67, 0, 65, 0, 64, 0,
      ],
      counter: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 57, 0, 0, 0, 0, 0, 0,
      ],
      arp: [
        62, 65, 69, 65, 58, 62, 65, 58, 65, 69, 72, 69, 60, 64, 67, 64,
      ],
      strings: [
        62, 62, 62, 62, 58, 58, 58, 58, 65, 65, 65, 65, 60, 60, 60, 60,
      ],
      brass: [
        50, 0, 0, 0, 46, 0, 0, 0, 49, 0, 0, 0, 45, 0, 0, 0,
      ],
      kick: [
        true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false,
      ],
      snare: [
        false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false,
      ],
      hihat: [
        false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false,
      ],
    },
    boss: {
      bpm: 146,
      stepMul: 0.9,
      bass: [
        37, 0, 38, 0, 34, 0, 33, 0, 40, 0, 39, 0, 35, 0, 36, 0,
      ],
      lead: [
        61, 0, 62, 0, 64, 0, 65, 0, 68, 0, 65, 0, 63, 0, 62, 0,
      ],
      counter: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 56, 0, 0, 0, 0, 0, 0,
      ],
      arp: [
        61, 64, 68, 64, 58, 61, 64, 58, 64, 68, 71, 68, 59, 63, 66, 63,
      ],
      strings: [
        60, 60, 60, 60, 57, 57, 57, 57, 64, 64, 64, 64, 59, 59, 59, 59,
      ],
      brass: [
        49, 0, 0, 0, 45, 0, 0, 0, 48, 0, 0, 0, 44, 0, 0, 0,
      ],
      kick: [
        true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false,
      ],
      snare: [
        false, true, false, true, false, true, false, true, false, true, false, true, false, true, false, true,
      ],
      hihat: [
        true, true, false, true, true, true, false, true, true, true, false, true, true, true, false, true,
      ],
    },
  },
  storm: {
    normal: {
      bpm: 152,
      stepMul: 1,
      bass: [
        40, 0, 40, 0, 38, 0, 0, 38, 36, 36, 0, 36, 40, 0, 0, 40,
      ],
      lead: [
        64, 0, 66, 0, 68, 0, 69, 0, 71, 0, 69, 0, 68, 0, 66, 0,
      ],
      counter: [
        0, 59, 0, 59, 0, 0, 0, 0, 0, 0, 0, 0, 0, 59, 0, 0,
      ],
      arp: [
        64, 68, 71, 76, 62, 66, 69, 74, 61, 64, 68, 73, 64, 68, 71, 76,
      ],
      strings: [
        55, 55, 55, 55, 52, 52, 52, 52, 48, 48, 48, 48, 55, 55, 55, 55,
      ],
      brass: [
        40, 0, 0, 0, 40, 0, 0, 0, 35, 0, 0, 0, 40, 0, 0, 0,
      ],
      kick: [
        true, false, false, false, true, false, true, false, true, false, false, true, true, false, true, false,
      ],
      snare: [
        false, false, true, false, false, true, false, true, false, false, true, false, true, false, false, true,
      ],
      hihat: [
        true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true,
      ],
    },
    boss: {
      bpm: 158,
      stepMul: 0.88,
      bass: [
        40, 39, 40, 41, 38, 0, 38, 40, 36, 0, 36, 38, 40, 39, 40, 41,
      ],
      lead: [
        64, 65, 66, 0, 66, 0, 68, 0, 71, 0, 69, 0, 68, 66, 65, 64,
      ],
      counter: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ],
      arp: [
        63, 66, 70, 75, 61, 64, 68, 73, 60, 63, 67, 72, 64, 67, 71, 76,
      ],
      strings: [
        50, 50, 50, 50, 48, 48, 48, 48, 46, 46, 46, 46, 50, 50, 50, 50,
      ],
      brass: [
        40, 0, 0, 0, 40, 0, 0, 0, 40, 0, 0, 0, 40, 0, 0, 0,
      ],
      kick: [
        true, false, true, false, true, false, true, true, true, false, true, false, true, false, true, true,
      ],
      snare: [
        false, true, false, true, false, true, false, true, false, true, false, true, false, true, false, true,
      ],
      hihat: [
        true, true, false, true, true, true, true, true, true, true, false, true, true, true, true, true,
      ],
    },
  },
  throne: {
    normal: {
      bpm: 132,
      stepMul: 1.12,
      bass: [
        43, 0, 0, 0, 41, 0, 0, 0, 36, 0, 0, 0, 38, 0, 0, 0,
      ],
      lead: [
        67, 0, 0, 0, 65, 0, 64, 0, 62, 0, 0, 0, 64, 65, 67, 0,
      ],
      counter: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 60, 0, 0,
      ],
      arp: [
        67, 0, 65, 0, 62, 0, 60, 0, 64, 0, 67, 0, 64, 0, 60, 0,
      ],
      strings: [
        55, 55, 55, 55, 53, 53, 53, 53, 48, 48, 48, 48, 50, 50, 50, 50,
      ],
      brass: [
        43, 0, 0, 0, 41, 0, 0, 0, 36, 0, 0, 0, 38, 0, 0, 0,
      ],
      kick: [
        true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false,
      ],
      snare: [
        false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false,
      ],
      hihat: [
        false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false,
      ],
    },
    boss: {
      bpm: 136,
      stepMul: 0.92,
      bass: [
        42, 0, 43, 0, 41, 0, 0, 41, 36, 0, 35, 0, 38, 0, 0, 38,
      ],
      lead: [
        66, 0, 67, 0, 65, 0, 0, 0, 62, 0, 64, 0, 66, 0, 64, 0,
      ],
      counter: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ],
      arp: [
        65, 0, 62, 0, 60, 0, 64, 0, 65, 67, 60, 0, 64, 0, 65, 0,
      ],
      strings: [
        50, 50, 50, 50, 48, 48, 48, 48, 44, 44, 44, 44, 46, 46, 46, 46,
      ],
      brass: [
        42, 0, 0, 0, 41, 0, 0, 0, 35, 0, 0, 0, 38, 0, 0, 0,
      ],
      kick: [
        true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false,
      ],
      snare: [
        false, true, false, true, false, true, false, true, false, true, false, true, false, true, false, true,
      ],
      hihat: [
        true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true,
      ],
    },
  },
  // Title-screen theme: D minor / F major gleam. Slow, stately, hopeful.
  // Motif: F–A–C–D rising harp with a sparse bell-like lead; warm string pad.
  // Boss layer reused as an identical copy (no boss state on menu).
  menu: {
    normal: {
      bpm: 126,
      stepMul: 1.1,
      bass: [
        41, 0, 0, 0, 36, 0, 0, 0, 43, 0, 0, 0, 38, 0, 0, 0,
      ],
      lead: [
        77, 0, 0, 0, 74, 0, 72, 0, 70, 0, 0, 0, 74, 0, 72, 0,
      ],
      counter: [
        0, 0, 65, 0, 0, 0, 0, 60, 0, 0, 67, 0, 0, 0, 0, 62,
      ],
      arp: [
        65, 69, 72, 77, 60, 65, 69, 72, 67, 72, 74, 79, 62, 67, 70, 74,
      ],
      strings: [
        53, 53, 53, 53, 48, 48, 48, 48, 55, 55, 55, 55, 50, 50, 50, 50,
      ],
      brass: [
        41, 0, 0, 0, 36, 0, 0, 0, 43, 0, 0, 0, 38, 0, 0, 0,
      ],
      kick: [
        true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false,
      ],
      snare: [
        false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false,
      ],
      hihat: [
        false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false,
      ],
    },
    boss: {
      bpm: 126,
      stepMul: 1.1,
      bass: [
        41, 0, 0, 0, 36, 0, 0, 0, 43, 0, 0, 0, 38, 0, 0, 0,
      ],
      lead: [
        77, 0, 0, 0, 74, 0, 72, 0, 70, 0, 0, 0, 74, 0, 72, 0,
      ],
      counter: [
        0, 0, 65, 0, 0, 0, 0, 60, 0, 0, 67, 0, 0, 0, 0, 62,
      ],
      arp: [
        65, 69, 72, 77, 60, 65, 69, 72, 67, 72, 74, 79, 62, 67, 70, 74,
      ],
      strings: [
        53, 53, 53, 53, 48, 48, 48, 48, 55, 55, 55, 55, 50, 50, 50, 50,
      ],
      brass: [
        41, 0, 0, 0, 36, 0, 0, 0, 43, 0, 0, 0, 38, 0, 0, 0,
      ],
      kick: [
        true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false,
      ],
      snare: [
        false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false,
      ],
      hihat: [
        false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false,
      ],
    },
  },
  // Chiptune boot theme: bouncy C major NES adventure. I–vi–IV–V doo-wop,
  // punchy square lead with root–fifth alternating bass and constant 16th hats.
  'menu-chiptune': {
    normal: {
      bpm: 168,
      stepMul: 1,
      bass: [
        36, 0, 43, 0, 45, 0, 52, 0, 41, 0, 48, 0, 43, 0, 50, 0,
      ],
      lead: [
        72, 76, 79, 76, 69, 72, 76, 72, 65, 69, 72, 69, 67, 71, 74, 74,
      ],
      counter: [
        0, 72, 0, 76, 0, 69, 0, 72, 0, 65, 0, 69, 0, 67, 0, 0,
      ],
      arp: [
        60, 64, 67, 72, 57, 60, 64, 69, 53, 57, 60, 65, 55, 59, 62, 67,
      ],
      strings: [
        48, 48, 48, 48, 45, 45, 45, 45, 41, 41, 41, 41, 43, 43, 43, 43,
      ],
      brass: [
        48, 0, 0, 0, 45, 0, 0, 0, 41, 0, 0, 0, 43, 0, 0, 0,
      ],
      kick: [
        true, false, false, false, true, false, true, false, true, false, false, false, true, false, true, false,
      ],
      snare: [
        false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, true,
      ],
      hihat: [
        true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true,
      ],
    },
    boss: {
      bpm: 168,
      stepMul: 1,
      bass: [
        36, 0, 43, 0, 45, 0, 52, 0, 41, 0, 48, 0, 43, 0, 50, 0,
      ],
      lead: [
        72, 76, 79, 76, 69, 72, 76, 72, 65, 69, 72, 69, 67, 71, 74, 74,
      ],
      counter: [
        0, 72, 0, 76, 0, 69, 0, 72, 0, 65, 0, 69, 0, 67, 0, 0,
      ],
      arp: [
        60, 64, 67, 72, 57, 60, 64, 69, 53, 57, 60, 65, 55, 59, 62, 67,
      ],
      strings: [
        48, 48, 48, 48, 45, 45, 45, 45, 41, 41, 41, 41, 43, 43, 43, 43,
      ],
      brass: [
        48, 0, 0, 0, 45, 0, 0, 0, 41, 0, 0, 0, 43, 0, 0, 0,
      ],
      kick: [
        true, false, false, false, true, false, true, false, true, false, false, false, true, false, true, false,
      ],
      snare: [
        false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, true,
      ],
      hihat: [
        true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true,
      ],
    },
  },
  // Synthwave neon drive: F# minor i–VI–III–VII, octave-jumping bass,
  // gated snare on 2 & 4, four-on-the-floor kick. No brass — it's all synths.
  'menu-synthwave': {
    normal: {
      bpm: 100,
      stepMul: 1,
      bass: [
        30, 42, 30, 42, 26, 38, 26, 38, 33, 45, 33, 45, 28, 40, 28, 40,
      ],
      lead: [
        66, 0, 68, 0, 64, 0, 66, 0, 69, 0, 68, 0, 66, 0, 64, 61,
      ],
      counter: [
        62, 0, 0, 0, 0, 0, 62, 0, 61, 0, 0, 0, 0, 0, 61, 0,
      ],
      arp: [
        54, 66, 61, 66, 50, 62, 57, 62, 57, 69, 61, 69, 52, 64, 59, 64,
      ],
      strings: [
        42, 42, 42, 42, 38, 38, 38, 38, 45, 45, 45, 45, 40, 40, 40, 40,
      ],
      brass: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ],
      kick: [
        true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false,
      ],
      snare: [
        false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false,
      ],
      hihat: [
        true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false,
      ],
    },
    boss: {
      bpm: 100,
      stepMul: 1,
      bass: [
        30, 42, 30, 42, 26, 38, 26, 38, 33, 45, 33, 45, 28, 40, 28, 40,
      ],
      lead: [
        66, 0, 68, 0, 64, 0, 66, 0, 69, 0, 68, 0, 66, 0, 64, 61,
      ],
      counter: [
        62, 0, 0, 0, 0, 0, 62, 0, 61, 0, 0, 0, 0, 0, 61, 0,
      ],
      arp: [
        54, 66, 61, 66, 50, 62, 57, 62, 57, 69, 61, 69, 52, 64, 59, 64,
      ],
      strings: [
        42, 42, 42, 42, 38, 38, 38, 38, 45, 45, 45, 45, 40, 40, 40, 40,
      ],
      brass: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ],
      kick: [
        true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false,
      ],
      snare: [
        false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false,
      ],
      hihat: [
        true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false,
      ],
    },
  },
  // Lofi hip-hop study: A minor ii–V–I extensions (Am7–Dm7–Fmaj7–E7). Swung
  // hats, boom-bap kit, sparse sax-like lead, warm 7th-chord arp.
  'menu-lofi': {
    normal: {
      bpm: 78,
      stepMul: 1,
      bass: [
        45, 0, 0, 52, 0, 0, 50, 0, 41, 0, 0, 48, 40, 0, 0, 47,
      ],
      lead: [
        0, 0, 67, 0, 69, 0, 0, 65, 0, 0, 72, 0, 67, 0, 0, 64,
      ],
      counter: [
        71, 0, 0, 0, 0, 0, 74, 0, 0, 0, 0, 0, 68, 0, 0, 0,
      ],
      arp: [
        57, 60, 64, 67, 50, 53, 57, 60, 53, 57, 60, 64, 52, 56, 59, 62,
      ],
      strings: [
        45, 45, 45, 45, 50, 50, 50, 50, 41, 41, 41, 41, 40, 40, 40, 40,
      ],
      brass: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ],
      kick: [
        true, false, false, false, false, false, true, true, true, false, false, false, false, false, true, false,
      ],
      snare: [
        false, false, false, true, true, false, false, false, false, false, false, true, true, false, false, false,
      ],
      hihat: [
        true, false, true, false, true, false, true, true, true, false, true, false, true, false, true, true,
      ],
    },
    boss: {
      bpm: 78,
      stepMul: 1,
      bass: [
        45, 0, 0, 52, 0, 0, 50, 0, 41, 0, 0, 48, 40, 0, 0, 47,
      ],
      lead: [
        0, 0, 67, 0, 69, 0, 0, 65, 0, 0, 72, 0, 67, 0, 0, 64,
      ],
      counter: [
        71, 0, 0, 0, 0, 0, 74, 0, 0, 0, 0, 0, 68, 0, 0, 0,
      ],
      arp: [
        57, 60, 64, 67, 50, 53, 57, 60, 53, 57, 60, 64, 52, 56, 59, 62,
      ],
      strings: [
        45, 45, 45, 45, 50, 50, 50, 50, 41, 41, 41, 41, 40, 40, 40, 40,
      ],
      brass: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ],
      kick: [
        true, false, false, false, false, false, true, true, true, false, false, false, false, false, true, false,
      ],
      snare: [
        false, false, false, true, true, false, false, false, false, false, false, true, true, false, false, false,
      ],
      hihat: [
        true, false, true, false, true, false, true, true, true, false, true, false, true, false, true, true,
      ],
    },
  },
  // Celtic festival: D dorian i–VII–iv–v, dancing root–fifth bass,
  // whistle-style lilting lead, flowing harp 16ths, bodhrán kick.
  'menu-celtic': {
    normal: {
      bpm: 148,
      stepMul: 1,
      bass: [
        38, 0, 45, 0, 36, 0, 43, 0, 43, 0, 50, 0, 45, 0, 52, 0,
      ],
      lead: [
        69, 72, 74, 72, 69, 67, 65, 67, 69, 72, 71, 69, 67, 65, 64, 62,
      ],
      counter: [
        0, 65, 0, 0, 62, 0, 0, 60, 0, 64, 0, 0, 60, 0, 0, 0,
      ],
      arp: [
        62, 65, 69, 74, 60, 64, 67, 72, 62, 67, 71, 74, 64, 69, 72, 76,
      ],
      strings: [
        50, 50, 50, 50, 48, 48, 48, 48, 55, 55, 55, 55, 57, 57, 57, 57,
      ],
      brass: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ],
      kick: [
        true, false, false, true, false, false, true, false, true, false, false, true, false, false, true, false,
      ],
      snare: [
        false, false, true, false, false, true, false, true, false, false, true, false, false, true, false, true,
      ],
      hihat: [
        true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true,
      ],
    },
    boss: {
      bpm: 148,
      stepMul: 1,
      bass: [
        38, 0, 45, 0, 36, 0, 43, 0, 43, 0, 50, 0, 45, 0, 52, 0,
      ],
      lead: [
        69, 72, 74, 72, 69, 67, 65, 67, 69, 72, 71, 69, 67, 65, 64, 62,
      ],
      counter: [
        0, 65, 0, 0, 62, 0, 0, 60, 0, 64, 0, 0, 60, 0, 0, 0,
      ],
      arp: [
        62, 65, 69, 74, 60, 64, 67, 72, 62, 67, 71, 74, 64, 69, 72, 76,
      ],
      strings: [
        50, 50, 50, 50, 48, 48, 48, 48, 55, 55, 55, 55, 57, 57, 57, 57,
      ],
      brass: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ],
      kick: [
        true, false, false, true, false, false, true, false, true, false, false, true, false, false, true, false,
      ],
      snare: [
        false, false, true, false, false, true, false, true, false, false, true, false, false, true, false, true,
      ],
      hihat: [
        true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true,
      ],
    },
  },
  // Iron standard march: C minor i–VI–iv–V, stomping kick, heavy brass stabs,
  // stiff fanfare arp, dotted hihat rolls. Cold, regal, slightly menacing.
  'menu-march': {
    normal: {
      bpm: 108,
      stepMul: 1,
      bass: [
        36, 0, 36, 0, 44, 0, 44, 0, 41, 0, 41, 0, 43, 0, 43, 47,
      ],
      lead: [
        72, 0, 70, 0, 68, 0, 67, 0, 65, 0, 63, 0, 62, 63, 67, 0,
      ],
      counter: [
        0, 63, 0, 0, 0, 60, 0, 0, 0, 60, 0, 0, 0, 55, 0, 0,
      ],
      arp: [
        60, 63, 67, 72, 56, 60, 63, 68, 53, 56, 60, 65, 55, 59, 62, 67,
      ],
      strings: [
        48, 48, 48, 48, 44, 44, 44, 44, 41, 41, 41, 41, 43, 43, 43, 43,
      ],
      brass: [
        48, 0, 0, 0, 56, 0, 0, 0, 53, 0, 0, 0, 55, 0, 0, 0,
      ],
      kick: [
        true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false,
      ],
      snare: [
        false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, true,
      ],
      hihat: [
        true, true, false, false, true, true, false, false, true, true, false, false, true, true, false, true,
      ],
    },
    boss: {
      bpm: 108,
      stepMul: 1,
      bass: [
        36, 0, 36, 0, 44, 0, 44, 0, 41, 0, 41, 0, 43, 0, 43, 47,
      ],
      lead: [
        72, 0, 70, 0, 68, 0, 67, 0, 65, 0, 63, 0, 62, 63, 67, 0,
      ],
      counter: [
        0, 63, 0, 0, 0, 60, 0, 0, 0, 60, 0, 0, 0, 55, 0, 0,
      ],
      arp: [
        60, 63, 67, 72, 56, 60, 63, 68, 53, 56, 60, 65, 55, 59, 62, 67,
      ],
      strings: [
        48, 48, 48, 48, 44, 44, 44, 44, 41, 41, 41, 41, 43, 43, 43, 43,
      ],
      brass: [
        48, 0, 0, 0, 56, 0, 0, 0, 53, 0, 0, 0, 55, 0, 0, 0,
      ],
      kick: [
        true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false,
      ],
      snare: [
        false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, true,
      ],
      hihat: [
        true, true, false, false, true, true, false, false, true, true, false, false, true, true, false, true,
      ],
    },
  },
};

type Phrase = Omit<BgmLayerPattern, 'bpm' | 'stepMul'>;

function phraseOf(p: BgmLayerPattern): Phrase {
  return {
    bass: p.bass,
    lead: p.lead,
    counter: p.counter,
    arp: p.arp,
    strings: p.strings,
    brass: p.brass,
    kick: p.kick,
    snare: p.snare,
    hihat: p.hihat,
  };
}

function concatPhrases(parts: Phrase[]): Phrase {
  return {
    bass: parts.flatMap((p) => p.bass),
    lead: parts.flatMap((p) => p.lead),
    counter: parts.flatMap((p) => p.counter),
    arp: parts.flatMap((p) => p.arp),
    strings: parts.flatMap((p) => p.strings),
    brass: parts.flatMap((p) => p.brass),
    kick: parts.flatMap((p) => p.kick),
    snare: parts.flatMap((p) => p.snare),
    hihat: parts.flatMap((p) => p.hihat),
  };
}

/**
 * Expand a 16-step seed phrase into a 64-step song so tracks have a real
 * arrangement instead of a 3–5-second loop. Form is A – A' – B – A'':
 *
 *   A   – the original seed, unchanged.
 *   A'  – lead halves swapped (call-and-response), counter + arp rotated
 *         4 steps. Same harmony and drums; feels like an "answer" to A.
 *   B   – all pitched layers shifted down a perfect 4th. In every key used
 *         here that lands on the V (or bVII) chord, giving a classic
 *         dominant-prep "bridge" before resolving back to A''. Drums stay
 *         the same so the bridge reads as harmonic, not rhythmic.
 *   A'' – recap of A with the arp rotated half a bar and a two-step snare
 *         fill leading into the loop reset.
 */
function expandSong(seed: BgmLayerPattern): BgmLayerPattern {
  const a = phraseOf(seed);
  const aPrime: Phrase = {
    ...a,
    lead: swapHalves(seed.lead),
    counter: rotateArr(seed.counter, 4),
    arp: rotateArr(seed.arp, 4),
  };
  const b: Phrase = {
    bass: offsetLayer(seed.bass, -5),
    lead: offsetLayer(seed.lead, -5),
    counter: offsetLayer(seed.counter, -5),
    arp: offsetLayer(seed.arp, -5),
    strings: offsetLayer(seed.strings, -5),
    brass: offsetLayer(seed.brass, -5),
    kick: seed.kick,
    snare: seed.snare,
    hihat: seed.hihat,
  };
  const aFinal: Phrase = {
    ...a,
    arp: rotateArr(seed.arp, 8),
    snare: fillEnd(seed.snare),
  };
  return {
    bpm: seed.bpm,
    stepMul: seed.stepMul,
    ...concatPhrases([a, aPrime, b, aFinal]),
  };
}

export const BGM_SETS: Record<
  BgmPatternKey,
  { normal: BgmLayerPattern; boss: BgmLayerPattern }
> = (() => {
  const out = {} as Record<
    BgmPatternKey,
    { normal: BgmLayerPattern; boss: BgmLayerPattern }
  >;
  for (const key of Object.keys(BGM_SEEDS) as BgmPatternKey[]) {
    const s = BGM_SEEDS[key];
    out[key] = { normal: expandSong(s.normal), boss: expandSong(s.boss) };
  }
  return out;
})();
