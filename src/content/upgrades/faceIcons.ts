import { getFaceChainId, getFaceRank, getFaceUpgrade } from './faceRegistry';

/**
 * Pixel-art icons shown on the face of the die when an upgrade occupies the slot.
 *
 * Format: each entry is an array of rows of palette characters from `src/sprites/palette.ts`.
 * '.' = transparent (die body shows through). Icons are rendered centered on the face.
 *
 * Size guideline: up to 14x14 (dies are 30x30 with a 2px outline), though smaller is fine.
 *
 * Common colors used:
 *   '2' dark navy outline · 'h' red · 'u' orange · 'y' yellow · 'm' green
 *   'q' blue · 'H' purple · 'x' gold · 'z' lime · 'v' peach · 'w' pink-purple
 *   'd' bone · 'c' mid gray · 'e' cream · 'I' pale purple · 'r' pale blue · 'n' pale green
 */

export const FACE_ICONS: Record<string, string[]> = {
  // ─── Replacers · base projectiles ──────────────────────────────────────
  // Soldier's steel bullet (also the generic `std_shot` fallback).
  std_shot: [
    '..............',
    '......22......',
    '.....2dd2.....',
    '....2dccd2....',
    '...2dcccd2....',
    '...2cccccc2...',
    '....2cccc2....',
    '.....2cc2.....',
    '.....2cc2.....',
    '.....2cc2.....',
    '.....2cc2.....',
    '......22......',
    '..............',
    '..............',
  ],
  // Gambler's loaded chip (round coin silhouette, gold on gold).
  'std_shot@gambler': [
    '..............',
    '......22......',
    '.....2882.....',
    '....2xxxx2....',
    '...28xyyx82...',
    '..2xyx11xyx2..',
    '..2xy1991yx2..',
    '..2xy1991yx2..',
    '..2xyx11xyx2..',
    '...28xyyx82...',
    '....2xxxx2....',
    '.....2882.....',
    '......22......',
    '..............',
  ],
  // Alchemist's alchemical flask (corked vial, bone glass, green liquid).
  'std_shot@alchemist': [
    '..............',
    '......66......',
    '......66......',
    '.....2dd2.....',
    '.....2dd2.....',
    '....2dmmd2....',
    '...2dmnmmd2...',
    '..2dmnmmmmd2..',
    '..2dmmmnmmd2..',
    '..2dmmmmmmd2..',
    '...2dmmmmd2...',
    '....22222.....',
    '..............',
    '..............',
  ],
  // Necromancer's bone shard (horizontal dumbbell with violet highlights).
  'std_shot@necromancer': [
    '..............',
    '..............',
    '..............',
    '...2......2...',
    '..2d2....2d2..',
    '.2dHd2..2dHd2.',
    '.2dHddddddHd2.',
    '.2dHddddddHd2.',
    '.2dHd2..2dHd2.',
    '..2d2....2d2..',
    '...2......2...',
    '..............',
    '..............',
    '..............',
  ],
  // Berserker's whirling axe (double-bit head with brown haft).
  'std_shot@berserker': [
    '..............',
    '..............',
    '...hh....hh...',
    '..hLLh66hLLh..',
    '.2hLLh66hLLh2.',
    '.2hLLh66hLLh2.',
    '..hLLh66hLLh..',
    '...hh.66.hh...',
    '......66......',
    '......66......',
    '......66......',
    '......22......',
    '..............',
    '..............',
  ],
  fire_bolt: [
    '..............',
    '......2.......',
    '.....2h2......',
    '.....2h2......',
    '....2hih2.....',
    '....2iyi2.....',
    '...2iyyui2....',
    '...2uyyyu2....',
    '...2uyuyu2....',
    '...2huuuh2....',
    '....2hhh2.....',
    '.....222......',
    '..............',
    '..............',
  ],
  aqua_bolt: [
    '..............',
    '......2.......',
    '.....2q2......',
    '.....2q2......',
    '....2qrq2.....',
    '....2rrrq2....',
    '...2qrrrrq....',
    '...2qrrrrq2...',
    '...2qrrrq2....',
    '....2qqq2.....',
    '.....222......',
    '..............',
    '..............',
    '..............',
  ],
  arc_bolt: [
    '..............',
    '.....2y2......',
    '....2yy2......',
    '....2yy22.....',
    '...2yy22......',
    '...2yy2.......',
    '..2yyyyy2.....',
    '...2yyy2......',
    '....2yy2......',
    '....2yy2......',
    '.....2y2......',
    '......2.......',
    '..............',
    '..............',
  ],
  frost_lance: [
    '..............',
    '..2.......2...',
    '.2q2.....2q2..',
    '..2qq...qq2...',
    '...2qrrrq2....',
    '....2rrr2.....',
    '....2rDr2.....',
    '....2rrr2.....',
    '...2qrrrq2....',
    '..2qq...qq2...',
    '.2q2.....2q2..',
    '..2.......2...',
    '..............',
    '..............',
  ],
  poison_dart: [
    '..............',
    '......22......',
    '.....2z2......',
    '....2zz2......',
    '....2zm2......',
    '...2zmm2......',
    '..2zmmmzz.....',
    '..22zmzz2.....',
    '....2zm2......',
    '....2m22......',
    '....2m2.......',
    '....22........',
    '..............',
    '..............',
  ],
  dragon_fang: [
    '..............',
    '.....2..2.....',
    '....2d22d2....',
    '....2dddd2....',
    '...2dwddwd2...',
    '...2dwddwd2...',
    '...2dddddd2...',
    '....2dhhd2....',
    '....2dhhd2....',
    '.....2hh2.....',
    '......22......',
    '......2.......',
    '..............',
    '..............',
  ],
  lance: [
    '..............',
    '...........2..',
    '..........2c2.',
    '.........2cc2.',
    '........2cc2..',
    '.......2cc2...',
    '......2cc2....',
    '.....2cc2.....',
    '....2cc2......',
    '...2cc2.......',
    '..2cc2........',
    '.2cc2.........',
    '.2c2..........',
    '.2............',
  ],
  solar_lance: [
    '..............',
    '......22......',
    '..2..2yy2..2..',
    '..2y2yyyy2y2..',
    '...2yyuyy2....',
    '....2uyyu2....',
    '..2yyyuyyy2...',
    '..2yyuyuyy2...',
    '....2uyyu2....',
    '...2yyuyy2....',
    '..2y2yyyy2y2..',
    '..2..2yy2..2..',
    '......22......',
    '..............',
  ],
  ember: [
    '..............',
    '..............',
    '......2.......',
    '.....2h2......',
    '.....2i2......',
    '....2iyi2.....',
    '....2uyu2.....',
    '...2huyuh2....',
    '...2huuuh2....',
    '....2hhh2.....',
    '.....222......',
    '..............',
    '..............',
    '..............',
  ],
  bolt: [
    '..............',
    '......22......',
    '.....2yy2.....',
    '....2yy22.....',
    '....2yy2......',
    '...2yyy2......',
    '..2yyyyyy2....',
    '...2yyyy2.....',
    '....2yyy2.....',
    '.....2yy2.....',
    '......2yy2....',
    '.......2y2....',
    '........2.....',
    '..............',
  ],

  // ─── Replacers · spread / area / special ───────────────────────────────
  shotgun_blast: [
    '..............',
    '..............',
    '..2........2..',
    '..2d2.....2d2.',
    '...2dd2..2dd..',
    '....2ddd2dd...',
    '.....2ddd2....',
    '....2ddddd2...',
    '....2dcccd2...',
    '...2dccccd2...',
    '...2d22222d...',
    '....2dccd2....',
    '.....2222.....',
    '..............',
  ],
  homing_missile: [
    '..............',
    '......22......',
    '.....2dd2.....',
    '....2dhhd2....',
    '....2dhhd2....',
    '....2dcccd....',
    '...2dcccd2....',
    '...2dcccd2....',
    '...2d2c2d2....',
    '...2h2c2h2....',
    '..2u2..2u2....',
    '..y......y....',
    '..............',
    '..............',
  ],
  prism_ray: [
    '..............',
    '.....222......',
    '....2hhh2.....',
    '...2hyyh2.....',
    '...2yyyyy2....',
    '..2yymmyy2....',
    '..2mmqqmm2....',
    '..2qqHHqq2....',
    '..2HHHHHH2....',
    '...2HHHH2.....',
    '...2HHHH2.....',
    '....2HH2......',
    '.....22.......',
    '..............',
  ],
  pulse_nova: [
    '..............',
    '.2..........2.',
    '..2qq....qq2..',
    '..2rqq..qqr2..',
    '...2qqrrqq2...',
    '....2rr22rr...',
    '....2r2..2r2..',
    '....2r2..2r2..',
    '....2rr22rr...',
    '...2qqrrqq2...',
    '..2rqq..qqr2..',
    '..2qq....qq2..',
    '.2..........2.',
    '..............',
  ],
  thunderstrike: [
    '..............',
    '..2........2..',
    '...2y2.2y2....',
    '....2yyyy2....',
    '.....2yy2.....',
    '.....2yy22....',
    '....2yyy2.....',
    '..2yyyyyy2....',
    '...2yyy2......',
    '....2yy2......',
    '.....2yy2.....',
    '.....2yyyy2...',
    '......2yy2....',
    '.......2......',
  ],
  tempest_strike: [
    '..............',
    '..2ccccccc2...',
    '.2ccccccccc...',
    '..2ccccccc2...',
    '...2ccccc2....',
    '....2cccc.....',
    '.....2cc2.....',
    '.....2cc2.....',
    '.....2c22.....',
    '......22......',
    '.....22.......',
    '..............',
    '..............',
    '..............',
  ],
  black_hole: [
    '..............',
    '.....HHH......',
    '....HHHHHH....',
    '..HHH2222HHH..',
    '..HH222222HH..',
    '.HH22111122HH.',
    '.HH2211112HHH.',
    '.HH22111122HH.',
    '..HH222222HH..',
    '..HHH2222HHH..',
    '....HHHHHH....',
    '.....HHH......',
    '..............',
    '..............',
  ],
  ring_of_fangs: [
    '..............',
    '......2.......',
    '...2d2d2d2....',
    '..2d2ddd2d2...',
    '.2d2d...d2d2..',
    '.2dd.....dd2..',
    '.2d.......d2..',
    '.2d.......d2..',
    '.2dd.....dd2..',
    '.2d2d...d2d2..',
    '..2d2ddd2d2...',
    '...2d2d2d2....',
    '......2.......',
    '..............',
  ],
  starlight_rim: [
    '..............',
    '......22......',
    '......yy......',
    '....2.yy.2....',
    '....yyyyyy....',
    '..2yyyyyyyy2..',
    '..yyyxxxxyy...',
    '..2yyyxxyy2...',
    '....yyyyyy....',
    '....2.yy.2....',
    '......yy......',
    '......22......',
    '..............',
    '..............',
  ],

  // ─── Replacers · utility (dmg/control) ─────────────────────────────────
  aegis: [
    '..............',
    '....22222.....',
    '...2qrrrq2....',
    '..2qrrrrrq2...',
    '..2qrcccrq2...',
    '..2qrcccrq2...',
    '..2qrcccrq2...',
    '..2qrrrrrq2...',
    '...2qrrrq2....',
    '....2qrq2.....',
    '.....2q2......',
    '......2.......',
    '..............',
    '..............',
  ],
  greater_heal: [
    '..............',
    '......22......',
    '.....2mm2.....',
    '.....2mm2.....',
    '...222mm222...',
    '..2mmmmmmmm2..',
    '..2mmmmmmmm2..',
    '...222mm222...',
    '.....2mm2.....',
    '.....2mm2.....',
    '......22......',
    '..............',
    '..............',
    '..............',
  ],
  lucky_coin: [
    '..............',
    '.....2222.....',
    '....2xxyx2....',
    '...2xyyyyx2...',
    '..2yyy22yyy2..',
    '..2yy2yy2yy2..',
    '..2yy.y2.yy2..',
    '..2yy2y2.yy2..',
    '..2yyy2yyyy2..',
    '...2xyyyyx2...',
    '....2xxyx2....',
    '.....2222.....',
    '..............',
    '..............',
  ],
  overwatch: [
    '..............',
    '......2.......',
    '......2.......',
    '..22.2.2.22...',
    '.2qq22222qq2..',
    '.2q2hhyhh2q2..',
    '2.22yhhhy22..2',
    '.2q2hhyhh2q2..',
    '.2qq22222qq2..',
    '..22.2.2.22...',
    '......2.......',
    '......2.......',
    '..............',
    '..............',
  ],
  transmute: [
    '..............',
    '......22......',
    '.....2HH2.....',
    '....2HwwH2....',
    '....2wwww2....',
    '...2wwIIww2...',
    '...2wIHHIw2...',
    '...2wwIIww2...',
    '....2wwww2....',
    '....2HwwH2....',
    '.....2HH2.....',
    '......22......',
    '..............',
    '..............',
  ],
  echo: [
    '..............',
    '......2.......',
    '.....2y2......',
    '...2222222....',
    '..2y2q2q2y2...',
    '.2y2qrrrq2y2..',
    '.2yqrrrrrqy2..',
    '.2y2qrrrq2y2..',
    '..2y2q2q2y2...',
    '...2222222....',
    '.....2y2......',
    '......2.......',
    '..............',
    '..............',
  ],

  // ─── Replacers · summons / harvesters ──────────────────────────────────
  bone_legion: [
    '..............',
    '.....2222.....',
    '....2dQQd2....',
    '...2dQQQQd2...',
    '...2dQ22Qd2...',
    '...2dQQQQd2...',
    '....2d22d2....',
    '.....2dd2.....',
    '....2d2d2.....',
    '...2d2.2d2....',
    '..2d2...2d2...',
    '..22.....22...',
    '..............',
    '..............',
  ],
  spirit_echo: [
    '..............',
    '.....2222.....',
    '....2IIII2....',
    '...2IIHHI2....',
    '...2IH22I2....',
    '...2IH22I2....',
    '...2IHHHI2....',
    '...2IIIII2....',
    '...2IIIII2....',
    '...2I2II2I....',
    '...22.22.22...',
    '..............',
    '..............',
    '..............',
  ],
  soul_harvest: [
    '..............',
    '..............',
    '........22....',
    '......2HH2....',
    '....2HHH2.....',
    '...2HH2.......',
    '..2HH2........',
    '..2H2.........',
    '..2H2.........',
    '...2H2........',
    '....2HH22.....',
    '......22HH2...',
    '........2H2...',
    '.........2....',
  ],
  executioner: [
    '..............',
    '....222.......',
    '...2PPP2......',
    '..2PPPPP2.....',
    '..2PPcPP2.....',
    '.2PP22cP2.....',
    '.2P2..2cP2....',
    '..22...2cP2...',
    '.......2cP2...',
    '........25....',
    '........25....',
    '........25....',
    '........25....',
    '........22....',
  ],
  bloodrush: [
    '..............',
    '......22......',
    '.....2hh2.....',
    '....2hhih2....',
    '....2hihih2...',
    '...2hihihi2...',
    '...2hihhih2...',
    '....2hihh2....',
    '.....2hh2.....',
    '......22......',
    '.......2......',
    '.....2h2......',
    '......2.......',
    '..............',
  ],
  all_in: [
    '..............',
    '...2222222....',
    '..2yyyyyyy2...',
    '..2yxx2xxy2...',
    '..2yx222xy2...',
    '..2y2hhh2y2...',
    '..2y2hih2y2...',
    '..2y2hhh2y2...',
    '..2yx222xy2...',
    '..2yxxxxxy2...',
    '...2222222....',
    '..............',
    '..............',
    '..............',
  ],

  // ─── Supplements · projectile tips & cores ─────────────────────────────
  burn_tip: [
    '..............',
    '......2.......',
    '.....2u2......',
    '.....2y2......',
    '....2u.u2.....',
    '....2.u.2.....',
    '....2.y.2.....',
    '....2uyu2.....',
    '.....2u2......',
    '.....2u2......',
    '.....2u2......',
    '.....2u2......',
    '......2.......',
    '..............',
  ],
  chill_tip: [
    '..............',
    '......2.......',
    '....2.q.2.....',
    '.....2q2......',
    '....2qrq2.....',
    '...2qrDrq2....',
    '...2rDQDr2....',
    '...2qrDrq2....',
    '....2qrq2.....',
    '.....2q2......',
    '....2.q.2.....',
    '......2.......',
    '..............',
    '..............',
  ],
  vampiric_tip: [
    '..............',
    '......22......',
    '.....2hh2.....',
    '....2hihh2....',
    '....2ihhh2....',
    '...2hhhhh2....',
    '...2hhhhh2....',
    '....2hhh2.....',
    '.....2h2......',
    '......2.......',
    '.....2d2......',
    '....2dQd2.....',
    '.....2d2......',
    '..............',
  ],
  crit_edge: [
    '..............',
    '......2.......',
    '....2.2.2.....',
    '.....yyy......',
    '....yyxyy.....',
    '..2yxxyxxy2...',
    '...yyxxxyy....',
    '....yyxyy.....',
    '.....yyy......',
    '....2.2.2.....',
    '......2.......',
    '..............',
    '..............',
    '..............',
  ],
  quantity: [
    '..............',
    '..............',
    '....2..2..2...',
    '...2d22d22d2..',
    '...2dd2dd2d2..',
    '...2dd2dd2d2..',
    '....2..2..2...',
    '....2..2..2...',
    '....2..2..2...',
    '...2dd2dd2d2..',
    '...2dd2dd2d2..',
    '...2d22d22d2..',
    '....2..2..2...',
    '..............',
  ],
  extra_shot: [
    '..............',
    '......22......',
    '......yy......',
    '......yy......',
    '......yy......',
    '...22yyyy22...',
    '..2yyyyyyyy2..',
    '..2yyyyyyyy2..',
    '...22yyyy22...',
    '......yy......',
    '......yy......',
    '......yy......',
    '......22......',
    '..............',
  ],
  piercing_core: [
    '..............',
    '..............',
    '....22222.....',
    '...2cccc2.....',
    '..2cc2222.....',
    '.2cc2..........',
    '2cc2........22',
    '2cc2222222222c',
    '2cc2........22',
    '.2cc2.........',
    '..2cc2222.....',
    '...2cccc2.....',
    '....22222.....',
    '..............',
  ],
  shrapnel: [
    '..............',
    '..2...2...2...',
    '..22.2x2.2c...',
    '...22xyx2c2...',
    '....2xyyxc2...',
    '..222xxxyy22..',
    '.2xxyxyxyyy2..',
    '..222xyxyx22..',
    '....2xxyxy2...',
    '...2xxyxy2....',
    '..2y2xyy22....',
    '..2.y2x2.2....',
    '..2...2...2...',
    '..............',
  ],
  boomerang: [
    '..............',
    '....2222......',
    '...2cccc2.....',
    '..2cc22cc2....',
    '..2c2..2cc2...',
    '..22....2cc2..',
    '..........2c2.',
    '..........2c2.',
    '..........2c2.',
    '..........2c2.',
    '..........22..',
    '..............',
    '..............',
    '..............',
  ],
  ricochet: [
    '..............',
    '....2.........',
    '...2y2........',
    '....2yy2......',
    '......2yy2....',
    '........2y2...',
    '.........2y2..',
    '........2yy2..',
    '......2yy2....',
    '....2yy2......',
    '...2y2........',
    '....2.........',
    '..............',
    '..............',
  ],

  // ─── Supplements · passive mods / effects ──────────────────────────────
  elemental_brand: [
    '..............',
    '......2.......',
    '...2..2..2....',
    '...2u2y2q2....',
    '....2uyq2.....',
    '..2u2uyq2q2...',
    '...2uuyqq2....',
    '...2uyyyq2....',
    '..2H2myyym2H..',
    '...2HmHmH2....',
    '...2mmHHm2....',
    '....2HHm2.....',
    '......2.......',
    '..............',
  ],
  reaction_mastery: [
    '..............',
    '....2222......',
    '...2uuuh2.....',
    '..2uuhh2m2....',
    '..2u22..mm2...',
    '..2u...2mm2...',
    '..2u.....m2...',
    '..2hq....q2...',
    '..2qq2.qqq2...',
    '...2qqqq22....',
    '....2qqq2.....',
    '.....222......',
    '..............',
    '..............',
  ],
  volatile_core: [
    '..............',
    '........2y....',
    '........2y....',
    '........yu....',
    '.......uyy....',
    '....22222.....',
    '...2uuuu2.....',
    '..2uhuhuu2....',
    '..2uhhuhu2....',
    '..2uuhuuh2....',
    '..2uuhuuu2....',
    '...2uuuu2.....',
    '....22222.....',
    '..............',
  ],
  gold_bite: [
    '..............',
    '......22......',
    '.....2xx2.....',
    '....2xyyx2....',
    '....2yyxy2....',
    '...2yxxxyy2...',
    '...2xxxxxx2...',
    '...2xxxxxx2...',
    '...2yxxxyy2...',
    '....2yyxy2....',
    '....2xyyx2....',
    '.....2xx2.....',
    '......22......',
    '..............',
  ],
};

/**
 * Lookup the palette-row icon for a face upgrade.
 *
 * Resolution order:
 *   1. Explicit `icon` override on the upgrade definition (if provided).
 *      Copied tier icons still evolve so rank 2/3 do not reuse rank 1 art.
 *   2. Character-scoped variant `FACE_ICONS[`${upgradeId}@${characterId}`]`
 *      — used so shared upgrades like `std_shot` can reflect each character's
 *      distinct base projectile (bullet vs chip vs flask vs bone vs axe).
 *   3. Generic `FACE_ICONS[upgradeId]`.
 *   4. Evolved rank art derived from the base chain icon.
 */
export function getFaceIconRows(
  upgradeId: string,
  explicit?: string[],
  characterId?: string | null,
): string[] | null {
  const upgrade = getFaceUpgrade(upgradeId);
  const rank = getFaceRank(upgrade);
  if (explicit && explicit.length > 0) {
    return shouldEvolveExplicitIcon(upgradeId, explicit) ? evolvedTierIconRows(explicit, rank, upgradeId) : explicit;
  }
  if (characterId) {
    const variant = FACE_ICONS[`${upgradeId}@${characterId}`];
    if (variant) return variant;
    const chainVariant = upgrade ? FACE_ICONS[`${getFaceChainId(upgrade)}@${characterId}`] : undefined;
    if (chainVariant) return evolvedTierIconRows(chainVariant, rank, `${upgradeId}@${characterId}`);
  }
  const direct = FACE_ICONS[upgradeId];
  if (direct) return direct;
  const chain = upgrade ? FACE_ICONS[getFaceChainId(upgrade)] : undefined;
  return chain ? evolvedTierIconRows(chain, rank, upgradeId) : null;
}

/**
 * Build the cache key used by `buildFaceIconCanvas` for a given upgrade + character.
 * Mirrors the resolution order in `getFaceIconRows`, so callers that key their
 * raster cache on this string won't collide between character variants.
 */
export function getFaceIconCacheKey(
  upgradeId: string,
  characterId?: string | null,
): string {
  const upgrade = getFaceUpgrade(upgradeId);
  if (characterId && FACE_ICONS[`${upgradeId}@${characterId}`]) {
    return `${upgradeId}@${characterId}`;
  }
  if (upgrade && characterId && FACE_ICONS[`${getFaceChainId(upgrade)}@${characterId}`]) {
    return `${upgradeId}@${characterId}`;
  }
  return upgradeId;
}

const TIER_ICON_ROW_CACHE = new Map<string, string[]>();

function shouldEvolveExplicitIcon(upgradeId: string, rows: string[]): boolean {
  const upgrade = getFaceUpgrade(upgradeId);
  if (getFaceRank(upgrade) <= 1) return false;

  const predecessor = upgrade?.upgradesFrom ? getFaceUpgrade(upgrade.upgradesFrom) : undefined;
  if (predecessor?.icon && sameIconRows(rows, predecessor.icon)) return true;

  const chainRows = upgrade ? FACE_ICONS[getFaceChainId(upgrade)] : undefined;
  return Boolean(chainRows && sameIconRows(rows, chainRows));
}

function evolvedTierIconRows(rows: string[], rank: number, cacheKey: string): string[] {
  if (rank <= 1 || rows.length === 0) return rows;
  const tierKey = `${cacheKey}#${rank}`;
  const cached = TIER_ICON_ROW_CACHE.get(tierKey);
  if (cached) return cached;

  const evolved = buildEvolvedTierIconRows(rows, rank, cacheKey);
  TIER_ICON_ROW_CACHE.set(tierKey, evolved);
  return evolved;
}

function buildEvolvedTierIconRows(rows: string[], rank: number, cacheKey: string): string[] {
  const width = Math.max(...rows.map((row) => row.length));
  const out = rows.map((row) => row.padEnd(width, '.').split(''));
  const bounds = getIconBounds(out);
  if (!bounds) return rows;

  const accent = getTierAccent(rows, cacheKey);
  addOffsetGlow(out, bounds, accent, rank);
  addTierSparks(out, bounds, accent, rank);
  if (rank >= 3) {
    addInnerHighlights(out, bounds, accent, cacheKey);
    addOuterHalo(out, bounds, accent);
  }

  return out.map((rowChars) => rowChars.join(''));
}

function sameIconRows(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((row, index) => row === b[index]);
}

type IconBounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

type TierAccent = {
  shadow: string;
  main: string;
  light: string;
};

function getIconBounds(rows: string[][]): IconBounds | null {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  rows.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell === '.') return;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    });
  });

  if (!Number.isFinite(minX)) return null;
  return { minX, minY, maxX, maxY };
}

function getTierAccent(rows: string[], cacheKey: string): TierAccent {
  const key = cacheKey.toLowerCase();
  const art = rows.join('');

  if (key.includes('poison') || key.includes('venom') || key.includes('toxic') || /[zmn]/.test(art)) {
    return { shadow: 'm', main: 'z', light: 'n' };
  }
  if (
    key.includes('fire') ||
    key.includes('flame') ||
    key.includes('burn') ||
    key.includes('ember') ||
    key.includes('kindling') ||
    key.includes('volatile') ||
    key.includes('dragon') ||
    /[huiu]/.test(art)
  ) {
    return { shadow: 'h', main: 'u', light: 'y' };
  }
  if (key.includes('frost') || key.includes('chill') || key.includes('ice') || key.includes('glacier') || /[qDr]/.test(art)) {
    return { shadow: 'q', main: 'r', light: 'D' };
  }
  if (
    key.includes('arc') ||
    key.includes('thunder') ||
    key.includes('tesla') ||
    key.includes('conductive') ||
    key.includes('tempest')
  ) {
    return { shadow: 'q', main: 'y', light: 'r' };
  }
  if (key.includes('gold') || key.includes('coin') || key.includes('transmute') || key.includes('jackpot') || key.includes('all_in')) {
    return { shadow: '8', main: 'x', light: 'y' };
  }
  if (
    key.includes('bone') ||
    key.includes('fang') ||
    key.includes('grave') ||
    key.includes('soul') ||
    key.includes('spirit') ||
    key.includes('executioner')
  ) {
    return { shadow: 'H', main: 'd', light: 'I' };
  }
  if (key.includes('heal') || key.includes('aegis') || key.includes('guardian')) {
    return { shadow: 'q', main: 'm', light: 'n' };
  }
  if (/[HIw]/.test(art)) return { shadow: 'H', main: 'w', light: 'I' };
  if (/[xy]/.test(art)) return { shadow: '8', main: 'x', light: 'y' };
  return { shadow: '2', main: 'c', light: 'd' };
}

function addOffsetGlow(rows: string[][], bounds: IconBounds, accent: TierAccent, rank: number): void {
  const source = rows.map((row) => [...row]);
  const offsets = rank >= 3 ? [[1, -1], [-1, 1]] : [[1, -1]];

  source.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell === '.' || cell === '2') return;
      offsets.forEach(([dx, dy], oi) => {
        if ((x + y + oi) % 3 !== 0) return;
        paintIfEmpty(rows, x + dx, y + dy, oi === 0 ? accent.main : accent.shadow);
      });
    });
  });

  const midX = Math.round((bounds.minX + bounds.maxX) / 2);
  paintIfEmpty(rows, midX - 1, bounds.minY - 1, accent.main);
  paintIfEmpty(rows, midX, bounds.minY - 1, accent.light);
  paintIfEmpty(rows, midX + 1, bounds.minY - 1, accent.main);
}

function addTierSparks(rows: string[][], bounds: IconBounds, accent: TierAccent, rank: number): void {
  const midX = Math.round((bounds.minX + bounds.maxX) / 2);
  const midY = Math.round((bounds.minY + bounds.maxY) / 2);
  const rankTwoSparks = [
    [bounds.minX - 1, bounds.minY + 1],
    [bounds.maxX + 1, bounds.maxY - 1],
    [midX, bounds.maxY + 1],
  ];
  const rankThreeSparks = [
    [bounds.maxX + 1, bounds.minY + 1],
    [bounds.minX - 1, bounds.maxY - 1],
    [bounds.minX - 1, midY],
    [bounds.maxX + 1, midY],
  ];

  for (const [x, y] of rankTwoSparks) {
    paintSpark(rows, x, y, accent);
  }
  if (rank >= 3) {
    for (const [x, y] of rankThreeSparks) {
      paintSpark(rows, x, y, accent);
    }
  }
}

function addInnerHighlights(rows: string[][], bounds: IconBounds, accent: TierAccent, cacheKey: string): void {
  const seed = hashString(cacheKey);
  for (let y = bounds.minY; y <= bounds.maxY; y++) {
    for (let x = bounds.minX; x <= bounds.maxX; x++) {
      const cell = rows[y]?.[x];
      if (!cell || cell === '.' || cell === '2') continue;
      if ((x * 13 + y * 17 + seed) % 7 === 0) {
        rows[y]![x] = accent.light;
      }
    }
  }
}

function addOuterHalo(rows: string[][], bounds: IconBounds, accent: TierAccent): void {
  const midX = Math.round((bounds.minX + bounds.maxX) / 2);
  const midY = Math.round((bounds.minY + bounds.maxY) / 2);
  const radiusX = Math.max(3, Math.ceil((bounds.maxX - bounds.minX) / 2) + 1);
  const radiusY = Math.max(3, Math.ceil((bounds.maxY - bounds.minY) / 2) + 1);
  const points = [
    [midX, midY - radiusY],
    [midX + 1, midY - radiusY + 1],
    [midX + radiusX, midY],
    [midX + 1, midY + radiusY - 1],
    [midX, midY + radiusY],
    [midX - 1, midY + radiusY - 1],
    [midX - radiusX, midY],
    [midX - 1, midY - radiusY + 1],
  ];

  points.forEach(([x, y], i) => {
    paintIfEmpty(rows, x, y, i % 2 === 0 ? accent.light : accent.main);
  });
}

function paintSpark(rows: string[][], x: number, y: number, accent: TierAccent): void {
  paintIfEmpty(rows, x, y, accent.light);
  paintIfEmpty(rows, x - 1, y, accent.main);
  paintIfEmpty(rows, x + 1, y, accent.main);
  paintIfEmpty(rows, x, y - 1, accent.shadow);
  paintIfEmpty(rows, x, y + 1, accent.shadow);
}

function paintIfEmpty(rows: string[][], x: number, y: number, color: string): void {
  if (y < 0 || y >= rows.length || x < 0 || x >= (rows[y]?.length ?? 0)) return;
  if (rows[y]![x] !== '.') return;
  rows[y]![x] = color;
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}
