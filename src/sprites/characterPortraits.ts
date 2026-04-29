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
// NECROMANCER — just a crowned skull: huge hollow sockets, cracked nasal
// cavity, exposed teeth, and tarnished gold crown. No robe/body rows.
//   6/8/9: tarnished gold crown   c/d/e: aged bone
//   0/1: hollow socket/crack shadow
// ──────────────────────────────────────────────────────────────────────────
const necromancerPortrait: string[] = [
  blank(),
  blank(),
  r('9...9...9'),
  r('99999999999'),
  r('98e88888e89'),
  r('66eeeeeee66'),
  r('6eeddddddee6'),
  r('6ed000000de6'),
  r('6ed00dd00de6'),
  r('6ed001100de6'),
  r('6ed000000de6'),
  r('6eddd11ddde6'),
  r('66edd11dde66'),
  r('666ed111de666'),
  r('66ed111111de66'),
  r('6ed1d1d1d1de6'),
  r('6ed11111111de6'),
  r('66ed1d1d1de66'),
  r('666eeeeeee666'),
  r('..666666666..'),
  blank(),
  blank(),
  blank(),
  blank(),
];

// ──────────────────────────────────────────────────────────────────────────
// BERSERKER — Viking face close-up: iron helm, bone horns, red rage slit,
// and a heavy beard. No torso/legs in character select portraits.
//   a: dark seam / outline   4: helmet steel (dark blue-grey)
//   P: horn base (grey)   Q: horn highlight (near-white)
//   J/L: dark → bright rage marks   0/1: eye-slot shadow
//   5/6/7: dark → light brown beard
// ──────────────────────────────────────────────────────────────────────────
const berserkerPortrait: string[] = [
  r('aa..............aa'),
  r('aQQa..........aQQa'),
  r('aQQPa........aPQQa'),
  r('aaQPPa......aPPQaa'),
  r('.aPPPaa4444aaPPPa.'),
  r('..aaP44444444Paa..'),
  r('...a4444LL4444a...'),
  r('...a444LLLL444a...'),
  r('..a44aa4444aa44a..'),
  r('..a440011110044a..'),
  r('..a4400JLLJ0044a..'),
  r('...aa00111100aa...'),
  r('....aa666666aa....'),
  r('...a566666665a...'),
  r('..a56667776665a..'),
  r('.a5667777776665a.'),
  r('.556677777776655.'),
  r('.a5667777776655a.'),
  r('..a55666666655a..'),
  r('...aa555555aa...'),
  r('....a55555a....'),
  r('.....a555a.....'),
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
