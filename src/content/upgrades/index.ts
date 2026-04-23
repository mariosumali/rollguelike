import { registerUpgrades } from './registry';
import { DICE_UPGRADES } from './dice';
import { PROJECTILE_UPGRADES } from './projectile';
import { PASSIVE_UPGRADES } from './passive';
import { AOE_UPGRADES } from './aoe';
import { LANDMARK_UPGRADES } from './landmark';
import { ARSENAL_UPGRADES } from './arsenal';

let initialized = false;

export function initUpgradeContent(): void {
  if (initialized) return;
  initialized = true;
  registerUpgrades([
    ...DICE_UPGRADES,
    ...PROJECTILE_UPGRADES,
    ...PASSIVE_UPGRADES,
    ...AOE_UPGRADES,
    ...LANDMARK_UPGRADES,
    ...ARSENAL_UPGRADES,
  ]);
}
