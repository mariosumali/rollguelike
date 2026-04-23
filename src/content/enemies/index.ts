import { ENEMY_TYPES } from './types';
import { BOSS_TYPES } from './bosses';
import { registerEnemies } from './registry';

let initialized = false;

export function initEnemyContent(): void {
  if (initialized) return;
  initialized = true;
  registerEnemies([...ENEMY_TYPES, ...BOSS_TYPES]);
}
