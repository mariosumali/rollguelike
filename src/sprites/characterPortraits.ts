import { defineSprite } from './sprite';

// 24x24 face-close-up portraits. Each row is a full 24-character string
// so asymmetric designs (plumes, handles) render correctly. `.` = the
// transparent cell. The helper `r()` is still used to center shorter
// rows for the simpler symmetric portraits (necromancer, alchemist).
const W = 24;

function r(content: string, width = W): string {
  const clean = content.replace(/\s+/g, '');
  if (clean.length >= width) return clean.slice(0, width);
  const pad = width - clean.length;
  const l = Math.floor(pad / 2);
  return '.'.repeat(l) + clean + '.'.repeat(pad - l);
}

function blank(): string {
  return '.'.repeat(W);
}

// ──────────────────────────────────────────────────────────────────────────
// KNIGHT — closed great-helm with a horizontal visor slit, vertical nose
// guard, and a thick curved red plume that rises above the crown and
// sweeps down behind the helmet on the left.
//   a/b/c/d: dark → bright steel gradient
//   0: visor slit (near-black)   1: nose guard seam (darkest)
//   g: dark blood-red plume shadow   h: bright crimson plume
// ──────────────────────────────────────────────────────────────────────────
const knightPortrait: string[] = [
  '........................',
  '...ggg..................',
  '..ghhhg...aaaaaaaa......',
  '.ghhhhg.aabbbbbbbbbbaa..',
  'ghhhhhg.abbccccccccccbba',
  'ghhhhhg.abccddddddddddcba',
  'ghhhhhg.abcdddddddddddcba',
  'ghhhhg..abcdddddddddddcba',
  '.ghhhg..abcdddddddddddcba',
  '.ghhg...abcdd00000000dcba',
  '..ghg...abcd0000000000dcba',
  '..ghhg..abcdd00000000dcba',
  '..ghhg..abcddd111111ddcba',
  '..gghg..abcddddd11ddddcba',
  '...gghg.abcdddddddddddcba',
  '....ghg.abcdddddddddddcba',
  '.....gg.abccdddddddddccba',
  '......g.abbcccccccccbba.',
  '........aabbbbbbbbbbaa..',
  '..........aaaaaaaaaa....',
  '........................',
  '........................',
  '........................',
  '........................',
];

// ──────────────────────────────────────────────────────────────────────────
// GAMBLER — a slot machine with a face. Purple dome with a red gem on
// top and a studded crimson banner below, cobalt cabinet with a big
// gold-trimmed screen showing two round eyes and a 777 mouth. A silver
// pull-handle extends from the right side, brass pedestal at the base.
//   w/H/I: dark → bright violet dome   y: gold   J/h: red banner
//   o: dark navy frame   p: cabinet blue
//   R: near-black screen interior   S/d: eye whites   1: dark pupils
//   P/Q: silver handle   6: brass pedestal
// ──────────────────────────────────────────────────────────────────────────
const gamblerPortrait: string[] = [
  '........................',
  '...........hhh..........',
  '...........hhh..........',
  '.........yoooooy........',
  '........owwHHHHwwo......',
  '.......owHHIIIIIHHwo....',
  '......owHIIyyIyyIIHwo...',
  '......owHIIyIIyyIIIHwo..',
  '......owHHIIIIIIIIHHwo..',
  '......oooooooooooooooo..',
  '......ohhhhhhhhhhhhhho..',
  '......ohyhhyhhyhhyhhho..',
  '......ohhhhhhhhhhhhhho..',
  '......oyyyyyyyyyyyyyyo..',
  '......oyppppppppppppyo..',
  '......oypoRRRRRRRRopyo..',
  '......oypoRSSRRSSRopyoPP',
  '......oypoRS1RRS1RopyoP.',
  '......oypoRSSRRSSRopyoP.',
  '......oypoRRRRRRRRopyo..',
  '......oypoyyRRRRyyopyo..',
  '......oypoRRRRRRRRopyo..',
  '......oyyyyyyyyyyyyyyo..',
  '.....666666666666666666.',
];

// ──────────────────────────────────────────────────────────────────────────
// ALCHEMIST — a deep hooded cowl. Everything inside the hood is a pool of
// black shadow, pierced only by two pinprick toxic-green eye points. The
// face is hidden; the hood does all the talking.
//   F/G/H: dark → bright violet hood
//   R: shadow (pure black inside the hood)
//   z: bright toxic-green eye dots   m: green glow shadow
//   T/U: deep teal robe shoulders
// ──────────────────────────────────────────────────────────────────────────
const alchemistPortrait: string[] = [
  '........................',
  '..........HHHHHH........',
  '........HHGGGGGGGHH.....',
  '.......HGGFFFFFFFGGH....',
  '......HGGFFFFFFFFFFGH...',
  '.....HGGFFFFFFFFFFFFGH..',
  '.....HGFFFRRRRRRRRFFFGH.',
  '....HGFFRRRRRRRRRRRFFGH.',
  '....HGFRRRRRRRRRRRRRFGH.',
  '....HGFRRRzRRRRRRzRRFGH.',
  '....HGFRRRzRRRRRRzRRFGH.',
  '....HGFRRRRRRRRRRRRRFGH.',
  '....HGFFRRRRRRRRRRRFFGH.',
  '....HGFFFRRRRRRRRRFFFGH.',
  '.....HGGFFRRRRRRFFGGH...',
  '.....HHGGGFFFFFFGGGH....',
  '......HHGGGGGGGGGGGH....',
  '.......HHHGGGGGGGHH.....',
  '........TTUUUUUUUTT.....',
  '.......TUUUUUUUUUUUT....',
  '.......TDDUUUUUUUDDT....',
  '......TTDDDUUUUDDDTT....',
  '.......TTTTTTTTTTT......',
  '........................',
];

// ──────────────────────────────────────────────────────────────────────────
// NECROMANCER — a cyan-boned skull, no hood. Deep black eye sockets with
// bright green pupils burning inside. Jagged carved teeth line the jaw.
//   A/B/C/D: dark → bright cyan bone gradient
//   e: bone highlight   R: black (eye pits, mouth)
//   z: bright green eye pupils   m: mid green soul-fire
// ──────────────────────────────────────────────────────────────────────────
const necromancerPortrait: string[] = [
  '........................',
  '........BBDDDDDDBB......',
  '......BBDDCCCCCCDDBB....',
  '.....BDDCCDDDDDDCCDDB...',
  '....BDCCDDDDDDDDDDCCDB..',
  '....BDCDDDeeeeeeeDDDCDB.',
  '....BDCDDDDDDDDDDDDDCDB.',
  '....BDCDDRRRRDDRRRRDDCDB',
  '....BDCDRRzzRDRRzzRRDCDB',
  '....BDCDRmzzzRRmzzzRDCDB',
  '....BDCDRRzzRRRRzzRRDCDB',
  '....BDCDDRRRRDDRRRRDDCDB',
  '....BDCCDDDDDDDDDDDCCDB.',
  '.....BDCDDDeeeeeeeDDCDB.',
  '.....BDCCDDDeeeDDDCCDB..',
  '.....BDCCDDDDDDDDDCCDB..',
  '......BDDCDDDDDDDCCDDB..',
  '......BDDCRRRRRRRRDDCB..',
  '.....BBDDRDRRDRRDRRDDBB.',
  '.....BDDRRDRRDRRDRRDDB..',
  '......BBDDDDDDDDDDDDBB..',
  '........BBDDDDDDDBB.....',
  '..........BBBBBBB.......',
  '........................',
];

// ──────────────────────────────────────────────────────────────────────────
// BERSERKER — dark iron viking helmet with two large curving silver horns
// sweeping up and outward, a cyan inlaid cross on the centerline, and a
// thick braided brown beard below the face-gap.
//   a: dark seam / outline   4: helmet steel (dark blue-grey)
//   P: horn base (grey)   Q: horn highlight (near-white)
//   C: cyan inlay   D: bright cyan accent
//   0/1: shadow (eye-slot under helmet rim)
//   5/6/7: dark → light brown beard
// ──────────────────────────────────────────────────────────────────────────
const berserkerPortrait: string[] = [
  '..aaa..............aaa..',
  '..aQQa............aQQa..',
  '.aQQPa............aPQQa.',
  '.aQQPa............aPQQa.',
  '.aPPPa............aPPPa.',
  '.aPPPaa..........aaPPPa.',
  '.aaPPPa..aaaaaa..aPPPaa.',
  '..aPPPaaa444444aaaPPPa..',
  '..aaPPa4444CC4444aPPaa..',
  '...aaa4444CCCC4444aaa...',
  '....a44444CCCC44444a....',
  '....a44aa44CCCC44aa44a..',
  '....a44a0044CC4400a44a..',
  '....a44a001111110a44a...',
  '....aa4a011DDDD110a44a..',
  '.....aaa0011111100aaa...',
  '......aa55555555aa......',
  '.....a55556666655555a...',
  '....a55666677766665555a.',
  '....55666777777766665a..',
  '....a5667777777766655...',
  '....a55667777776665a....',
  '.....a5556666666655a....',
  '......aa555555555aa.....',
];

// ──────────────────────────────────────────────────────────────────────────
// CLOCKMAKER — brass-plated tinker helm, goggles pushed up showing copper
// lenses, stern aged face with a simple monocle, neatly-groomed mustache.
// (Kept from previous pass — user did not ask to change it.)
//   5/6/7/8/9: dark → bright brass gradient   y: brass highlight
//   a: dark seam   c/d: aged skin   2: eye / mouth / brow shadow
//   b: iron rim (monocle)   Q/S: lens shine   P: steel mustache
// ──────────────────────────────────────────────────────────────────────────
const clockmakerPortrait: string[] = [
  blank(),
  r('66666666666666'),
  r('66888888888888866'),
  r('688999888888999886'),
  r('6899988888888999986'),
  r('6898877yyyyyy778986'),
  r('6898y77yy77yy77y986'),
  r('6898y7QSSy7ySSQ7y986'),
  r('6898y7SSSy7ySSS7y986'),
  r('6898y77yy77yy77y986'),
  r('.68888yyyyyyyyyy8886.'),
  r('..aacccddddddddcaa..'),
  r('.acdddddd22dddddddca.'),
  r('acdddd22dbbdd22dddca'),
  r('acddd11QQdbbbdQQ11dca'),
  r('acdddd11dbbbd11dddca'),
  r('acddddddd2bb2ddddddca'),
  r('acddddddddbbddddddca'),
  r('acddddddd1111dddddca'),
  r('aacddddPPPPPPPPddccaa'),
  r('.aaPPPP888888PPPPaa.'),
  r('..PPP8888yy8888PPP..'),
  r('..0088888yy8888800..'),
  r('....00PPPPPPPP00....'),
];

// Pad or truncate any loose rows to exactly 24 characters so every sprite
// is a clean grid even if a hand-written row is off by a char or two.
function normalize(rows: string[]): string[] {
  return rows.map((row) => {
    if (row.length === W) return row;
    if (row.length > W) return row.slice(0, W);
    return row + '.'.repeat(W - row.length);
  });
}

export function defineCharacterPortraits(): void {
  const defs: { id: string; rows: string[] }[] = [
    { id: 'portrait_soldier', rows: normalize(knightPortrait) },
    { id: 'portrait_gambler', rows: normalize(gamblerPortrait) },
    { id: 'portrait_alchemist', rows: normalize(alchemistPortrait) },
    { id: 'portrait_necromancer', rows: normalize(necromancerPortrait) },
    { id: 'portrait_berserker', rows: normalize(berserkerPortrait) },
    { id: 'portrait_clockmaker', rows: normalize(clockmakerPortrait) },
  ];
  for (const d of defs) {
    defineSprite({
      id: d.id,
      frames: [d.rows],
      anchor: 'center',
      anim: {
        idle: { name: 'idle', frames: [0], frameDuration: 1, loop: true },
      },
    });
  }
}
