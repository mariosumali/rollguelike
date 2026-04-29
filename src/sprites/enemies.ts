import { defineSprite } from './sprite';

const rusherA = [
  '....222....',
  '...22222...',
  '..2JJLJJ2..',
  '.2JLLhLLJ2.',
  '.2JhhihhJ2.',
  '2JhiieiihJ2',
  '2JhhihhihJ2',
  '2JJhhhhhJJ2',
  '.2JhhhhhJ2.',
  '..2JJJJJ2..',
  '...2.2.2...',
];

const rusherB = [
  '....222....',
  '...2JJJ2...',
  '..2JJLJJ2..',
  '.2JLLhLLJ2.',
  '.2JhhihhJ2.',
  '2JhiieiihJ2',
  '2JhhiehhihJ',
  '2JJhhhhhJJ2',
  '.2JhhhhhJ2.',
  '..2J.J.J2..',
  '...2...2...',
];

const rusherDie = [
  '....222....',
  '...2JJJ2...',
  '..2JggJJ2..',
  '.2JJggJgJ2.',
  '.2JgggggJ2.',
  '2JgggggggJ2',
  '2JgggggggJ2',
  '.2JgggggJ2.',
  '..2JgggJ2..',
  '...2JJJ2...',
  '....222....',
];

const tankA = [
  '.555555555...',
  '5MM5MMMM5MM5.',
  '5MM555555MM5.',
  '5MM5aaaa5MM5.',
  '5MMaPPPPa55M.',
  '5MMaPccPaM5M.',
  '5MMaPccPaMPM.',
  '5MMaPaaaaM5M.',
  '5MM5aaaa5MM5.',
  '5MM555555MM5.',
  '5MM5MMMMMMM5.',
  '5MM55555555..',
];

const tankB = [
  '.555555555...',
  '5MM5MMMM5MM5.',
  '5MMM555555M5.',
  '5MM5aaaa5MM5.',
  '5MMaPPPPa55M.',
  '5MMaPccPaMPM.',
  '5MMaPccPaM5M.',
  '5MMaPaaaaM5M.',
  '5MM5aaaa5MM5.',
  '5MMM555555M5.',
  '5MM5MMMMM5M5.',
  '5MM55555555..',
];

const tankDie = [
  '.555555555...',
  '5MMM555M5MM5.',
  '.5MMMMM5MM5M.',
  '.5MMaaaaMM5..',
  '.5MaaaaaaM5..',
  '.5MaaaaaaM5..',
  '.5MaaaaaaM5..',
  '.5MM5aaaa5M..',
  '.5555MM555...',
  '...55555555..',
  '.....55555...',
  '.............',
];

const splitterA = [
  '....111.....',
  '...11o11....',
  '..1oppop1...',
  '.1oppppop1..',
  '1opppyypop1.',
  '1opyyoyyop1.',
  '1opyoyoypo1.',
  '1opppyypop1.',
  '.1oppppop1..',
  '..1oopopo1..',
  '...11o11....',
  '....111.....',
];

const splitterB = [
  '....111.....',
  '...11o11....',
  '..1oppop1...',
  '.1oppppop1..',
  '1oppyyyppo1.',
  '1opyyyyyyop1',
  '1opyyyyoyyo1',
  '1opppyypop1.',
  '.1oppppop1..',
  '..1oopooo1..',
  '...11o11....',
  '....111.....',
];

const splitterDie = [
  '............',
  '.....o......',
  '....ooo.....',
  '...opppo....',
  '...opyyo....',
  '...opyyo....',
  '...opppo....',
  '....ooo.....',
  '.....o......',
  '............',
  '............',
  '............',
];

const swarmA = [
  '...222...',
  '..2NNN2..',
  '.2NNOOO2.',
  '2NOOxxO2.',
  '2NOxxxO2.',
  '.2NNOON2.',
  '..2NNN2..',
  '...2.2...',
];

const swarmB = [
  '...222...',
  '..2NON2..',
  '.2NNOOO2.',
  '2NOxxxO2.',
  '2NOxxxO2.',
  '.2NNOON2.',
  '..2NNN2..',
  '...222...',
];

const swarmDie = [
  '.........',
  '...NN....',
  '..NNO....',
  '..NOx....',
  '...xO....',
  '....N....',
  '.........',
  '.........',
];

const drifterA = [
  '..22222...',
  '.2wwwww2..',
  '2wHwwwHw2.',
  '2wHIIHwI2.',
  '2wIdddHw2.',
  '2wHddddw2.',
  '2wIddHIw2.',
  '2wwIIIIw2.',
  '.2wwwww2..',
  '..2ww2....',
  '...22.....',
];

const drifterB = [
  '...22222..',
  '..2wwwww2.',
  '.2wHwwwHw2',
  '.2wIHHIHw2',
  '.2wHddddw2',
  '.2wddddIw2',
  '.2wHdddHw2',
  '.2wwIIIIw2',
  '..2wwwww2.',
  '....2ww2..',
  '.....22...',
];

const drifterDie = [
  '...22222..',
  '..2wwIIw2.',
  '..2wIIIw2.',
  '.2wIIIIIw2',
  '.2wIIddIw2',
  '..2wIIIw2.',
  '...2wwI2..',
  '....222...',
  '..........',
  '..........',
  '..........',
];

const oddOnlyA = [
  '..3333333..',
  '.3FFFFFFF3.',
  '3FGGGGGGGF3',
  '3FGHHH1GGF3',
  '3FGH1H1HGF3',
  '3FGHH1HHGF3',
  '3FGHHHHHGF3',
  '3FGwwHwwGF3',
  '3FGGGGGGGF3',
  '.3FFFFFFF3.',
  '..3333333..',
];

const oddOnlyB = [
  '..3333333..',
  '.3FFFFFFF3.',
  '3FGGGGGGGF3',
  '3FG1H1H1GF3',
  '3FGH1H1HGF3',
  '3FG1HHH1GF3',
  '3FGHHHHHGF3',
  '3FGwHHwHwGF',
  '3FGGGGGGGF3',
  '.3FFFFFFF3.',
  '..3333333..',
];

const copierA = [
  '..11111....',
  '.1aaaaa1...',
  '1aPPPPPa1..',
  '1aPQQQPa1..',
  '1aPQ1QPa1..',
  '1aPQQQPa1..',
  '1aPPPPPa1..',
  '1aaaaaaa1..',
  '.1aacaa1...',
  '..1..1.....',
];

const copierB = [
  '..11111....',
  '.1aaaaa1...',
  '1aPPPPPa1..',
  '1aPQ1QPa1..',
  '1aPQQQPa1..',
  '1aPQ1QPa1..',
  '1aPPPPPa1..',
  '1aaaaaaa1..',
  '.1a.c.a1...',
  '..1...1....',
];

const debufferA = [
  '...22222...',
  '..2TTTTT2..',
  '.2TUUUUUT2.',
  '2TUmmzzmUT2',
  '2TUmzlzmUT2',
  '2TUzllzzUT2',
  '2TUmzzzmUT2',
  '.2TUzmzUT2.',
  '..2TTTTT2..',
  '...2z.z2...',
  '....2.2....',
];

const debufferB = [
  '...22222...',
  '..2TTTTT2..',
  '.2TUUUUUT2.',
  '2TUmzlzmUT2',
  '2TUlllllUT2',
  '2TUzllzzUT2',
  '2TUmlzlmUT2',
  '.2TUzmzUT2.',
  '..2TTTTT2..',
  '...2zzz2...',
  '....2.2....',
];

const absorberA = [
  '....22222....',
  '...2AAAAA2..',
  '..2ABBBBBA2.',
  '.2ABCCCCCBA2',
  '.2ABCDDDCBA2',
  '.2ABCD1DCBA2',
  '.2ABCDDDCBA2',
  '.2ABCCCCCBA2',
  '.2ABBBBBBBA2',
  '..2AAAAAAA2.',
  '...22222.2..',
];

const absorberB = [
  '....22222....',
  '...2AAAAA2..',
  '..2ABBBBBA2.',
  '.2ABCCDDCBA2',
  '.2ABCDDDCBA2',
  '.2ABCD1DCBA2',
  '.2ABCDDDCBA2',
  '.2ABCCDDCBA2',
  '.2ABBBBBBBA2',
  '..2AAAAAAA2.',
  '...2.222.2..',
];

const healerA = [
  '....kkkkk....',
  '...kUUUUUk...',
  '..kUmmTmmUk..',
  '.kUmmzzzmmUk.',
  '.kUmzmmmzmUk.',
  '.kUmzmzmzmUk.',
  '.kUmzzzzzmUk.',
  '.kUmmmzmmmUk.',
  '..kUUmmmUUk..',
  '...kkUUUkk...',
  '....kkkkk....',
];

const healerB = [
  '....kkkkk....',
  '...kUUUUUk...',
  '..kUmzmmzUk..',
  '.kUmzzmzzmUk.',
  '.kUmzmmmzmUk.',
  '.kUzmzmzmzUk.',
  '.kUmzmmmzmUk.',
  '.kUmmzzzmmUk.',
  '..kUUmmmUUk..',
  '...kkUUUkk...',
  '....kkkkk....',
];

const invisibleA = [
  '....22222....',
  '...2wwwww2...',
  '..2wwHHHww2..',
  '.2wHwwwwwHw2.',
  '.2wH1www1Hw2.',
  '.2wHHwwwHHw2.',
  '.2wwHHHHHww2.',
  '.2wwwHHHww2..',
  '..2wwHHHw2...',
  '...2www2.....',
  '....222......',
];

const invisibleB = [
  '................',
  '....22....2.....',
  '..2.......2.....',
  '.....ww.........',
  '...w..Hw...w....',
  '....H1...H......',
  '..w..H....Hw....',
  '....wHHHw.......',
  '.....H..H.......',
  '....2...........',
  '................',
];

const inverterA = [
  '....33333....',
  '...3FFFFF3...',
  '..3FHHHHHF3..',
  '.3FHIIIIIHF3.',
  '.3FHIw22wIHF3',
  '.3FHIw22wIHF3',
  '.3FHIwwwwIHF3',
  '.3FHIIwwIIHF3',
  '..3FHHIIHHF3.',
  '...3FFHHFF3..',
  '....3FFFF3...',
  '.....3333....',
];

const inverterB = [
  '....33333....',
  '...3FFFFF3...',
  '..3FIIIIIF3..',
  '.3FIHHHHHIF3.',
  '.3FIH22w2HIF3',
  '.3FIHww2wHIF3',
  '.3FIHwwwwHIF3',
  '.3FIIHwwHIIF3',
  '..3FIHHIIHF3.',
  '...3FIIHIF3..',
  '....3FFFF3...',
  '.....3333....',
];

const reflectorA = [
  '.....qqq.....',
  '....qrrrq....',
  '...qrDDDrq...',
  '..qrDCCCDrq..',
  '.qrDCBBBCDrq.',
  'qrDCBAABCDrq.',
  'qrDCBAABCDrq.',
  '.qrDCBBBCDrq.',
  '..qrDCCCDrq..',
  '...qrDDDrq...',
  '....qrrrq....',
  '.....qqq.....',
];

const reflectorB = [
  '.....qqq.....',
  '....qrrDq....',
  '...qDDDrDq...',
  '..qrDCCDDrq..',
  '.qrDCBBBCDrq.',
  'qrDCBAABCDrq.',
  'qrDCBAABCDrq.',
  '.qrDCBBBCDrq.',
  '..qrDDCDDrq..',
  '...qDrDrDq...',
  '....qDrrq....',
  '.....qqq.....',
];

const resurrectorA = [
  '....00000....',
  '...0VVVVV0...',
  '..0VWWWWWV0..',
  '.0VWHHHHHWV0.',
  '.0VWHwwwHWV0.',
  '.0VWw1w1wWV0.',
  '.0VWHwwwHWV0.',
  '.0VWHHHHHWV0.',
  '.0VWwwwwwWV0.',
  '.0VWHwwwHWV0.',
  '..0VVVVVVV0..',
  '...0VV.VV0...',
];

const resurrectorB = [
  '....00000....',
  '...0VVVVV0...',
  '..0VWWwWWV0..',
  '.0VWHwwwHWV0.',
  '.0VWwHwHwWV0.',
  '.0VWw1w1wWV0.',
  '.0VWwHwHwWV0.',
  '.0VWHHHHHWV0.',
  '.0VWHwwwHWV0.',
  '.0VWwwwwwWV0.',
  '..0VVwwwVV0..',
  '...0V...V0...',
];

const immuneA = [
  '....22222....',
  '...2BBBBB2...',
  '..2BDDDDDB2..',
  '.2BDCCCCCDB2.',
  '2BDCAAAAACDB2',
  '2BDCARRACDB22',
  '2BDCAAAACDB22',
  '2BDCCCCCCDB2.',
  '.2BDDDDDDB2..',
  '..2BBBBBBB2..',
  '...2222222...',
];

const immuneB = [
  '....22222....',
  '...2BBBBB2...',
  '..2BDDDDDB2..',
  '.2BDCCCCCDB2.',
  '2BDCAAAAACDB2',
  '2BDCARAACDB22',
  '2BDCAAARCDB22',
  '2BDCCCCCCDB2.',
  '.2BDDDDDDB2..',
  '..2BBBBBBB2..',
  '...2222222...',
];

const generalDie = [
  '.............',
  '...222222....',
  '..2aaaaaa2...',
  '..2aPPPPa2...',
  '.2aPPaPPa2...',
  '.2aaaaaaa2...',
  '..2aaaaa2....',
  '..22222......',
  '.............',
];

function remapRows(rows: string[], palette: Record<string, string>): string[] {
  return rows.map((row) => Array.from(row, (ch) => palette[ch] ?? ch).join(''));
}

function def(id: string, idleA: string[], idleB: string[], die: string[]): void {
  defineSprite({
    id,
    frames: [idleA, idleB, die],
    anchor: 'center',
    anim: {
      walk: { name: 'walk', frames: [0, 1], frameDuration: 0.25, loop: true },
      die: { name: 'die', frames: [2], frameDuration: 0.3, loop: false },
    },
  });
}

export function defineEnemySprites(): void {
  def('enemy_rusher', rusherA, rusherB, rusherDie);
  def('enemy_tank', tankA, tankB, tankDie);
  def('enemy_splitter', splitterA, splitterB, splitterDie);
  def('enemy_swarm', swarmA, swarmB, swarmDie);
  def('enemy_drifter', drifterA, drifterB, drifterDie);
  def('enemy_oddonly', oddOnlyA, oddOnlyB, generalDie);
  def('enemy_copier', copierA, copierB, generalDie);
  def('enemy_debuffer', debufferA, debufferB, generalDie);
  def('enemy_absorber', absorberA, absorberB, generalDie);
  def('enemy_healer', healerA, healerB, generalDie);
  def('enemy_invisible', invisibleA, invisibleB, generalDie);
  def('enemy_inverter', inverterA, inverterB, generalDie);
  def('enemy_reflector', reflectorA, reflectorB, generalDie);
  def('enemy_resurrector', resurrectorA, resurrectorB, generalDie);
  def('enemy_immune', immuneA, immuneB, generalDie);

  def('house_debt_hound', remapRows(rusherA, { J: 'O', L: 'y', h: 'v', i: 'O' }), remapRows(rusherB, { J: 'O', L: 'y', h: 'v', i: 'O' }), rusherDie);
  def('house_vaultback', remapRows(tankA, { M: 'a', P: 'b', c: 'u' }), remapRows(tankB, { M: 'a', P: 'b', c: 'u' }), tankDie);
  def('house_loaded_larva', remapRows(splitterA, { p: 'P', y: 'Q', o: 'p' }), remapRows(splitterB, { p: 'P', y: 'Q', o: 'p' }), splitterDie);
  def('house_pip_rat', remapRows(swarmA, { N: 'O', O: 'y', x: '1' }), remapRows(swarmB, { N: 'O', O: 'y', x: '1' }), swarmDie);
  def('house_chandelier_wisp', remapRows(drifterA, { w: 'I', H: 'S', d: 'q' }), remapRows(drifterB, { w: 'I', H: 'S', d: 'q' }), drifterDie);
  def('house_odd_apostle', remapRows(oddOnlyA, { F: 'G', G: 'H', H: 'y', w: '1' }), remapRows(oddOnlyB, { F: 'G', G: 'H', H: 'y', w: '1' }), generalDie);
  def('house_mirror_clerk', remapRows(copierA, { a: 'H', P: 'I', Q: 'S', c: 'w' }), remapRows(copierB, { a: 'H', P: 'I', Q: 'S', c: 'w' }), generalDie);
  def('house_tithe_drainer', remapRows(debufferA, { T: 'U', U: 'z', m: 'l' }), remapRows(debufferB, { T: 'U', U: 'z', m: 'l' }), generalDie);
  def('house_null_maw', remapRows(absorberA, { A: 'E', B: 'F', C: 'R', D: 'S' }), remapRows(absorberB, { A: 'E', B: 'F', C: 'R', D: 'S' }), generalDie);
  def('house_surgeon', remapRows(healerA, { m: 'K', z: 'L', l: 'f' }), remapRows(healerB, { m: 'K', z: 'L', l: 'f' }), generalDie);
  def('house_curtain_shade', remapRows(invisibleA, { w: 'E', I: 'H', d: '0' }), remapRows(invisibleB, { w: 'E', I: 'H', d: '0' }), generalDie);
  def('house_flip_jester', remapRows(inverterA, { F: 'O', G: 'v', H: 'u' }), remapRows(inverterB, { F: 'O', G: 'v', H: 'u' }), generalDie);
  def('house_mirror_bailiff', remapRows(reflectorA, { C: 'q', D: 'r', B: 'S' }), remapRows(reflectorB, { C: 'q', D: 'r', B: 'S' }), generalDie);
  def('house_grave_usher', remapRows(resurrectorA, { V: 'T', T: 'E', z: 'H' }), remapRows(resurrectorB, { V: 'T', T: 'E', z: 'H' }), generalDie);
  def('house_six_seal_guard', remapRows(immuneA, { A: 'a', B: 'b', C: 'u' }), remapRows(immuneB, { A: 'a', B: 'b', C: 'u' }), generalDie);
}
