import { palHex } from '../../sprites/palette';

export type ParticleKind =
  | 'stars'
  | 'embers'
  | 'snow'
  | 'bubblesToxic'
  | 'sand'
  | 'bubblesOcean'
  | 'spirits'
  | 'petals'
  | 'cogs'
  | 'drips'
  | 'rain'
  | 'ash';

export type SilhouetteKind =
  | 'mountains'
  | 'spires'
  | 'crystals'
  | 'thorns'
  | 'dunes'
  | 'coral'
  | 'trees'
  | 'flowers'
  | 'gears'
  | 'ruins'
  | 'stormSpires'
  | 'pillars';

export type WallStyle = 'brick' | 'obsidian' | 'ice' | 'vine' | 'sandstone' | 'reef' | 'bone' | 'bloom' | 'metal' | 'cursed' | 'stormsteel' | 'magma';

export interface StageTheme {
  id: string;
  name: string;
  subtitle: string;
  skyTop: string;
  skyMid: string;
  skyBot: string;
  starColor: string;
  starCount: number;
  floatColor: string;
  particleKind: ParticleKind;
  silhouette: SilhouetteKind;
  silhouetteColor: string;
  silhouetteShade: string;
  groundTop: string;
  groundBot: string;
  groundSpeckle: string;
  wallStyle: WallStyle;
  wallBase: string;
  wallTop: string;
  wallAccent: string;
  wallShade: string;
}

function c(k: string): string {
  return palHex(k)!;
}

export const STAGES: StageTheme[] = [
  {
    id: 'void_spire',
    name: 'VOID SPIRE',
    subtitle: 'Waves 1-10',
    skyTop: c('2'),
    skyMid: c('1'),
    skyBot: c('0'),
    starColor: c('I'),
    starCount: 34,
    floatColor: c('H'),
    particleKind: 'stars',
    silhouette: 'mountains',
    silhouetteColor: c('E'),
    silhouetteShade: c('F'),
    groundTop: c('1'),
    groundBot: c('0'),
    groundSpeckle: c('2'),
    wallStyle: 'brick',
    wallBase: c('5'),
    wallTop: c('6'),
    wallAccent: c('7'),
    wallShade: c('0'),
  },
  {
    id: 'ember_forge',
    name: 'EMBER FORGE',
    subtitle: 'Waves 11-20',
    skyTop: c('J'),
    skyMid: c('f'),
    skyBot: c('0'),
    starColor: c('O'),
    starCount: 18,
    floatColor: c('u'),
    particleKind: 'embers',
    silhouette: 'spires',
    silhouetteColor: c('J'),
    silhouetteShade: c('K'),
    groundTop: c('J'),
    groundBot: c('0'),
    groundSpeckle: c('t'),
    wallStyle: 'obsidian',
    wallBase: c('J'),
    wallTop: c('f'),
    wallAccent: c('K'),
    wallShade: c('0'),
  },
  {
    id: 'frozen_tundra',
    name: 'FROZEN TUNDRA',
    subtitle: 'Waves 21-30',
    skyTop: c('r'),
    skyMid: c('q'),
    skyBot: c('o'),
    starColor: c('S'),
    starCount: 42,
    floatColor: c('S'),
    particleKind: 'snow',
    silhouette: 'crystals',
    silhouetteColor: c('B'),
    silhouetteShade: c('C'),
    groundTop: c('d'),
    groundBot: c('c'),
    groundSpeckle: c('S'),
    wallStyle: 'ice',
    wallBase: c('c'),
    wallTop: c('d'),
    wallAccent: c('r'),
    wallShade: c('A'),
  },
  {
    id: 'toxic_marsh',
    name: 'TOXIC MARSH',
    subtitle: 'Waves 31-40',
    skyTop: c('U'),
    skyMid: c('T'),
    skyBot: c('0'),
    starColor: c('z'),
    starCount: 14,
    floatColor: c('z'),
    particleKind: 'bubblesToxic',
    silhouette: 'thorns',
    silhouetteColor: c('T'),
    silhouetteShade: c('k'),
    groundTop: c('T'),
    groundBot: c('0'),
    groundSpeckle: c('l'),
    wallStyle: 'vine',
    wallBase: c('k'),
    wallTop: c('l'),
    wallAccent: c('z'),
    wallShade: c('0'),
  },
  {
    id: 'sunbleached_dunes',
    name: 'SUNBLEACHED DUNES',
    subtitle: 'Waves 41-50',
    skyTop: c('v'),
    skyMid: c('u'),
    skyBot: c('N'),
    starColor: c('y'),
    starCount: 8,
    floatColor: c('v'),
    particleKind: 'sand',
    silhouette: 'dunes',
    silhouetteColor: c('N'),
    silhouetteShade: c('M'),
    groundTop: c('7'),
    groundBot: c('5'),
    groundSpeckle: c('v'),
    wallStyle: 'sandstone',
    wallBase: c('7'),
    wallTop: c('8'),
    wallAccent: c('9'),
    wallShade: c('5'),
  },
  {
    id: 'abyssal_trench',
    name: 'ABYSSAL TRENCH',
    subtitle: 'Waves 51-60',
    skyTop: c('B'),
    skyMid: c('A'),
    skyBot: c('0'),
    starColor: c('D'),
    starCount: 26,
    floatColor: c('D'),
    particleKind: 'bubblesOcean',
    silhouette: 'coral',
    silhouetteColor: c('F'),
    silhouetteShade: c('G'),
    groundTop: c('A'),
    groundBot: c('0'),
    groundSpeckle: c('B'),
    wallStyle: 'reef',
    wallBase: c('A'),
    wallTop: c('B'),
    wallAccent: c('C'),
    wallShade: c('0'),
  },
  {
    id: 'shadow_glade',
    name: 'SHADOW GLADE',
    subtitle: 'Waves 61-70',
    skyTop: c('F'),
    skyMid: c('E'),
    skyBot: c('0'),
    starColor: c('I'),
    starCount: 22,
    floatColor: c('H'),
    particleKind: 'spirits',
    silhouette: 'trees',
    silhouetteColor: c('E'),
    silhouetteShade: c('0'),
    groundTop: c('T'),
    groundBot: c('0'),
    groundSpeckle: c('E'),
    wallStyle: 'bone',
    wallBase: c('a'),
    wallTop: c('c'),
    wallAccent: c('d'),
    wallShade: c('0'),
  },
  {
    id: 'celestial_garden',
    name: 'CELESTIAL GARDEN',
    subtitle: 'Waves 71-80',
    skyTop: c('j'),
    skyMid: c('I'),
    skyBot: c('F'),
    starColor: c('S'),
    starCount: 28,
    floatColor: c('j'),
    particleKind: 'petals',
    silhouette: 'flowers',
    silhouetteColor: c('h'),
    silhouetteShade: c('w'),
    groundTop: c('I'),
    groundBot: c('F'),
    groundSpeckle: c('j'),
    wallStyle: 'bloom',
    wallBase: c('G'),
    wallTop: c('H'),
    wallAccent: c('j'),
    wallShade: c('E'),
  },
  {
    id: 'iron_foundry',
    name: 'IRON FOUNDRY',
    subtitle: 'Waves 81-90',
    skyTop: c('a'),
    skyMid: c('3'),
    skyBot: c('0'),
    starColor: c('u'),
    starCount: 12,
    floatColor: c('u'),
    particleKind: 'cogs',
    silhouette: 'gears',
    silhouetteColor: c('a'),
    silhouetteShade: c('5'),
    groundTop: c('a'),
    groundBot: c('0'),
    groundSpeckle: c('u'),
    wallStyle: 'metal',
    wallBase: c('a'),
    wallTop: c('b'),
    wallAccent: c('u'),
    wallShade: c('0'),
  },
  {
    id: 'blood_moon',
    name: 'BLOOD MOON',
    subtitle: 'Waves 91-100',
    skyTop: c('K'),
    skyMid: c('J'),
    skyBot: c('0'),
    starColor: c('L'),
    starCount: 20,
    floatColor: c('L'),
    particleKind: 'drips',
    silhouette: 'ruins',
    silhouetteColor: c('J'),
    silhouetteShade: c('f'),
    groundTop: c('J'),
    groundBot: c('0'),
    groundSpeckle: c('K'),
    wallStyle: 'cursed',
    wallBase: c('f'),
    wallTop: c('g'),
    wallAccent: c('L'),
    wallShade: c('0'),
  },
  {
    id: 'stormwall',
    name: 'STORMWALL',
    subtitle: 'Waves 101-110',
    skyTop: c('a'),
    skyMid: c('3'),
    skyBot: c('2'),
    starColor: c('r'),
    starCount: 16,
    floatColor: c('r'),
    particleKind: 'rain',
    silhouette: 'stormSpires',
    silhouetteColor: c('o'),
    silhouetteShade: c('a'),
    groundTop: c('3'),
    groundBot: c('0'),
    groundSpeckle: c('r'),
    wallStyle: 'stormsteel',
    wallBase: c('a'),
    wallTop: c('b'),
    wallAccent: c('r'),
    wallShade: c('0'),
  },
  {
    id: 'hellfire_core',
    name: 'HELLFIRE CORE',
    subtitle: 'Waves 111-120',
    skyTop: c('L'),
    skyMid: c('K'),
    skyBot: c('J'),
    starColor: c('O'),
    starCount: 10,
    floatColor: c('O'),
    particleKind: 'ash',
    silhouette: 'pillars',
    silhouetteColor: c('J'),
    silhouetteShade: c('O'),
    groundTop: c('K'),
    groundBot: c('J'),
    groundSpeckle: c('O'),
    wallStyle: 'magma',
    wallBase: c('J'),
    wallTop: c('K'),
    wallAccent: c('O'),
    wallShade: c('0'),
  },
];

export function stageIndexForWave(wave: number): number {
  const w = Math.max(1, wave | 0);
  return Math.floor((w - 1) / 10) % STAGES.length;
}

export function stageForWave(wave: number): StageTheme {
  return STAGES[stageIndexForWave(wave)]!;
}

export function isStageStart(wave: number): boolean {
  return Math.max(1, wave | 0) % 10 === 1;
}
