/**
 * Per-character display-name overrides for shared face upgrades.
 *
 * Mirrors the `FACE_ICONS` variant pattern (`${upgradeId}@${characterId}`): the
 * `std_shot` upgrade is shared, but each character's base projectile has its
 * own flavor (bullet / chip / flask / bone / axe). Use these overrides to show
 * a character-appropriate label in dossiers, shop cards, pause menus, etc.,
 * while the underlying upgrade id stays stable.
 */

export const FACE_NAMES: Record<string, string> = {
  'std_shot@soldier': 'Steel Bolt',
  'std_shot@gambler': 'Loaded Chip',
  'std_shot@alchemist': 'Alchemical Flask',
  'std_shot@necromancer': 'Bone Shard',
  'std_shot@berserker': 'Whirling Axe',
};

/**
 * Resolve a display name for a face upgrade, preferring a character-scoped
 * variant when one is registered.
 *
 * Resolution order:
 *   1. `FACE_NAMES[`${upgradeId}@${characterId}`]` (character-specific flavor)
 *   2. `fallback` (typically the upgrade's generic `name`)
 *   3. `upgradeId` prettified as a last resort.
 */
export function getFaceName(
  upgradeId: string,
  characterId?: string | null,
  fallback?: string,
): string {
  if (characterId) {
    const variant = FACE_NAMES[`${upgradeId}@${characterId}`];
    if (variant) return variant;
  }
  if (fallback) return fallback;
  return upgradeId.replace(/_/g, ' ');
}
