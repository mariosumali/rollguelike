import type { Theme, ThemeFactory } from '../types';
import { createCastleTheme } from './castle';
import { createCaveTheme } from './cave';
import { createEnchantedForestTheme } from './enchantedForest';
import { createGraveyardTheme } from './graveyard';
import { createMountainTheme } from './mountain';
import { createPirateCoveTheme } from './pirateCove';
import { createSkyTempleTheme } from './skyTemple';
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
};
