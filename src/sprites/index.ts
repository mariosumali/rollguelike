import { defineCharacterSprites } from './characters';
import { defineEnemySprites } from './enemies';
import { defineBossSprites } from './bosses';

let initialized = false;

export function initSprites(): void {
  if (initialized) return;
  initialized = true;
  defineCharacterSprites();
  defineEnemySprites();
  defineBossSprites();
}
