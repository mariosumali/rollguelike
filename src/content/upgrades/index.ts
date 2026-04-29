import { registerUpgrades } from './registry';
import { initShopServiceContent } from './meta/registry';
import { LANDMARK_UPGRADES } from './landmark';
import { LANDMARK_EXPANSION_UPGRADES } from './landmark_expansion';
import { MORE_LANDMARK_UPGRADES } from './landmark_more';

let initialized = false;

export function initUpgradeContent(): void {
  if (initialized) return;
  initialized = true;
  registerUpgrades([
    ...LANDMARK_UPGRADES,
    ...LANDMARK_EXPANSION_UPGRADES,
    ...MORE_LANDMARK_UPGRADES,
  ]);
  initShopServiceContent();
}
