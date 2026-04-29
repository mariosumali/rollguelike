import type { Theme, ThemeFactory } from '../types';
import { createAbyssalTrenchTheme } from './abyssalTrench';
import { createCastleTheme } from './castle';
import { createCaveTheme } from './cave';
import { createEnchantedForestTheme } from './enchantedForest';
import { createGraveyardTheme } from './graveyard';
import { createIronFoundryTheme } from './ironFoundry';
import { createMountainTheme } from './mountain';
import { createPirateCoveTheme } from './pirateCove';
import { createSkyTempleTheme } from './skyTemple';
import { createStormBalconyTheme } from './stormBalcony';
import { createSunbleachedDunesTheme } from './sunbleachedDunes';
import { createVolcanoTheme } from './volcano';
import { createWizardTowerTheme } from './wizardTower';

export const THEME_FACTORIES: Record<Theme, ThemeFactory> = {
  castle: createCastleTheme,
  mountain: createMountainTheme,
  pirateCove: createPirateCoveTheme,
  graveyard: createGraveyardTheme,
  cave: createCaveTheme,
  enchantedForest: createEnchantedForestTheme,
  volcano: createVolcanoTheme,
  wizardTower: createWizardTowerTheme,
  skyTemple: createSkyTempleTheme,
  ironFoundry: createIronFoundryTheme,
  abyssalTrench: createAbyssalTrenchTheme,
  sunbleachedDunes: createSunbleachedDunesTheme,
  stormBalcony: createStormBalconyTheme,
};
