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
// ALCHEMIST — face-only hooded flask-master: black cowl void and two toxic
// eye sparks. No body rows here; character select portraits stay close-up.
//   F/G/H: dark → bright violet hood   R: cowl shadow
//   z/m: toxic glow
// ──────────────────────────────────────────────────────────────────────────
const alchemistPortrait: string[] = [
  blank(),
  blank(),
  r('HHHHHHHH'),
  r('HGGGGGGGGH'),
  r('HGGFFFFFFGGH'),
  r('HGFFFFFFFFFGH'),
  r('HGFFRRRRFFGH'),
  r('HGFERRRREFGH'),
  r('HGFRRRRRRFGH'),
  r('HGFRzRRzRFGH'),
  r('HGFRmRRmRFGH'),
  r('HGFRzRRzRFGH'),
  r('HGFRRRRRRFGH'),
  r('HGGFRRRRFGGH'),
  r('HHGGFFFFGGHH'),
  r('..HHGGGGHH..'),
  r('....HHHH....'),
  blank(),
  blank(),
  blank(),
  blank(),
  blank(),
  blank(),
  blank(),
];

// ──────────────────────────────────────────────────────────────────────────
// NECROMANCER — hooded skull with a tarnished gold face trim and cold cyan
// pendant, matching the reference cloak silhouette instead of a bare crown.
//   E/F: dark violet hood   8/9: tarnished gold trim
//   d/e: aged bone   0/1: hollow socket/crack shadow   C/D: pendant glow
// ──────────────────────────────────────────────────────────────────────────
const necromancerPortrait: string[] = [
  '........................',
  '....EEE.................',
  '...EEFFEE..............',
  '..EEFFFFEE..............',
  '.EEFFFFFFEE.............',
  'EEFFFFFFFFFFEE..........',
  '.EEFFFFF9999FFEE........',
  '.EFFFF99988999FFE.......',
  'EEFFF998eeee899FFE......',
  'EFFFF98eeeeee89FFE......',
  'EFFF998ee00ee899FFE.....',
  'EFFF98ee0110ee89FFE.....',
  'EFFF98eee11eee89FFE.....',
  '.EFFF998eeeee899FFE.....',
  '.EEFFFF99999999FFEE.....',
  '..EEFFFFFFFFFFFFEE......',
  '...EEFFF99ee99FFFEE.....',
  '...EFFFF99DD99FFFFE.....',
  '....EFFFFFDDFFFFFFE.....',
  '.....EEFFFFCCFFFFEE.....',
  '......EEEFFCCFFEEE......',
  '........EECCCCEE........',
  '.........EEDDEE.........',
  '........................',
];

// ──────────────────────────────────────────────────────────────────────────
// BERSERKER — horned axe-helm close-up: black outline, pale horn sweep,
// blue-grey plates, cyan inlay, and a heavy brown beard.
//   R: hard black outline   4: helmet steel (dark blue-grey)
//   b/c/d: horn shadow → highlight   B/C/D/S: cyan inlay shine
//   5/6: dark → light brown beard
// ──────────────────────────────────────────────────────────────────────────
const berserkerPortrait: string[] = [
  blank(),
  r('RRR............RRR'),
  r('RdddR........RdddR'),
  r('RdccdR......RdccdR'),
  r('RdbcddR.RR.RddcbdR'),
  r('RdbbccRR44RRccbbdR'),
  r('RRbbR444444RbbRR'),
  r('RRR44444444RRR'),
  r('R4444CCC4444R'),
  r('R444CSDSC444R'),
  r('R444CSSSC444R'),
  r('R44BBBBBBBB44R'),
  r('R44BCCBBCB44R'),
  r('RR4466666644RR'),
  r('R444665566444R'),
  r('R444666666444R'),
  r('R446665566644R'),
  r('R466555555664R'),
  r('R665555555566R'),
  r('RR655555556RR'),
  r('..RR555555RR..'),
  r('....RR55RR....'),
  blank(),
  blank(),
];

// ──────────────────────────────────────────────────────────────────────────
// CLOCKMAKER — face-only brass tinker: raised goggles, monocle, stern face,
// and silver mustache. No gear-collar/body rows in character select.
//   5/6/7/8/9: dark → bright brass gradient   y: brass highlight
//   a: dark seam   c/d: aged skin   2: eye / mouth / brow shadow
//   b: iron rim (monocle)   Q/S: lens shine   P: steel mustache
// ──────────────────────────────────────────────────────────────────────────
const clockmakerPortrait: string[] = [
  blank(),
  r('666666666666'),
  r('688888888886'),
  r('68999yy99986'),
  r('6898yyyy8986'),
  r('689QSS88SSQ986'),
  r('688QSS88SSQ886'),
  r('6688888888866'),
  r('..aacddddcaa..'),
  r('.acdd2222ddca.'),
  r('acdd22bb22ddca'),
  r('acdd11QQ11ddca'),
  r('acddd1bb1dddca'),
  r('acddddd22dddca'),
  r('aacdddPPdddccaa'),
  r('.aaPPPPPPPPaa.'),
  r('..aaPPPPPPaa..'),
  blank(),
  blank(),
  blank(),
  blank(),
  blank(),
  blank(),
  blank(),
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
