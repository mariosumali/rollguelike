import { defineCharacterSprites } from './characters';
import { defineCharacterPortraits } from './characterPortraits';
import { defineEnemySprites } from './enemies';
import { defineBossSprites } from './bosses';

let initialized = false;

export function initSprites(): void {
  if (initialized) return;
  initialized = true;
  defineCharacterSprites();
  defineCharacterPortraits();
  defineEnemySprites();
  defineBossSprites();
}
