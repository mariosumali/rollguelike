export const ARENA_W = 180;
export const ARENA_H = 260;
export const HUD_H = 28;
export const PLAYER_H = 72;
export const CANVAS_W = ARENA_W;
export const CANVAS_H = HUD_H + ARENA_H + PLAYER_H;

export const WALL_Y = HUD_H + ARENA_H;
export const PLAYER_X = ARENA_W / 2;
// Footer strip — character stood below the wall (commented per layout tweak)
// export const PLAYER_Y = WALL_Y + 34;
// export const DIE_Y = WALL_Y + 20;
/** Feet / sprite anchor just above the enemy contact line (WALL_Y - 4). */
export const PLAYER_Y = WALL_Y - 10;
/** Rolled dice HUD — sits on the wall line (DIE_SIZE=24, so center is half-height above). */
export const DIE_Y = WALL_Y - 12;
export const PROJECTILE_SPAWN_Y = WALL_Y - 10;

export const LOGICAL_W = CANVAS_W;
export const LOGICAL_H = CANVAS_H;

export const FIXED_DT = 1 / 60;

export const LAYER = {
  BG: 0,
  ENEMY: 1,
  PROJECTILE: 2,
  VFX: 3,
  WALL: 4,
  PLAYER: 5,
  UI: 6,
} as const;
