export type Screen = 'menu' | 'select' | 'game' | 'upgrade' | 'forge' | 'boss-warn' | 'pause' | 'gameover';

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';
export type UpgradeCategory = 'dice' | 'projectile' | 'passive' | 'aoe' | 'landmark';

export type Element = 'none' | 'fire' | 'ice' | 'poison' | 'lightning' | 'arcane';

export type FaceKind =
  | 'SHOT'
  | 'BURST'
  | 'PULSE'
  | 'SHIELD'
  | 'HEAL'
  | 'BLANK'
  | 'WILD'
  | 'SOUL_DRAIN'
  | 'RAGE_SMASH'
  | 'CHARGED_BOLT'
  | 'BOMB';

export interface Face {
  value: number;
  kind: FaceKind;
  element: Element;
  modifiers?: FaceModifiers;
  damageMul?: number;
  projectileCount?: number;
}

export interface FaceModifiers {
  pierce?: number;
  bounce?: number;
  chain?: number;
  split?: number;
  homing?: boolean;
  aoeOnHit?: number;
  lifesteal?: number;
  explode?: number;
  freeze?: number;
  poison?: number;
}

export interface DieConfig {
  id: string;
  faces: Face[];
  rollDuration: number;
  bias?: number[];
}

export type ProjectileShape = 'bullet' | 'chip' | 'flask' | 'bone' | 'axe' | 'gear';
export type ProjectileRotation = 'none' | 'velocity' | 'spin';

export interface ProjectileArchetype {
  id: string;
  name: string;
  shape: ProjectileShape;
  baseColor: string;
  glowColor: string;
  trailColor?: string;
  radius: number;
  speedMul?: number;
  lifeMul?: number;
  rotate: ProjectileRotation;
  rotateSpeed?: number;
  tintWithElement?: boolean;
  basePierce?: number;
  baseAoeOnHit?: number;
  baseHoming?: boolean;
  baseLifesteal?: number;
  onSpawn?: (p: Projectile, face: Face, run: RunState, rng: () => number) => void;
  onHit?: (p: Projectile, enemy: Enemy, run: RunState) => void;
}

export interface Projectile {
  alive: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  pierce: number;
  bounces: number;
  chain: number;
  split: number;
  homing: boolean;
  aoeOnHit: number;
  lifesteal: number;
  element: Element;
  hitIds: Set<number>;
  age: number;
  maxAge: number;
  trail: { x: number; y: number; a: number }[];
  color: string;
  sourceFaceValue: number;
  archetype: ProjectileArchetype | null;
  rotation: number;
  tags: Set<string>;
  tagT: number;
  orbit?: { angle: number; radius: number; omega: number; cx: number; cy: number; ttl: number; reHitTimers?: Map<number, number> };
  minion?: boolean;
  animTrailId?: string;
}

export interface Enemy {
  id: number;
  alive: boolean;
  typeId: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  speed: number;
  radius: number;
  age: number;
  state: 'walk' | 'hit' | 'die' | 'invisible' | 'charging';
  flashT: number;
  dieT: number;
  data: Record<string, number | boolean>;
  element: Element;
  hitFlash: number;
  slow: number;
  freeze: number;
  poisonT: number;
  poisonDps: number;
  absorbed: number;
  corrode: number;
  chill: number;
  voidMark: number;
  radiance: number;
  charged: number;
  elite?: boolean;
  isBoss?: boolean;
}

export interface SoulPickup {
  alive: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  collected: boolean;
}

export interface VfxParticle {
  alive: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  color: string;
  size: number;
  kind: VfxKind;
  angle: number;
  rot: number;
  data?: number;
}

export type VfxKind =
  | 'spark'
  | 'ring'
  | 'muzzle'
  | 'explosion'
  | 'heal'
  | 'shield'
  | 'popup'
  | 'poison'
  | 'freeze'
  | 'lightning'
  | 'slash'
  | 'soul'
  | 'trail'
  | 'reaction';

export interface NumberPopup {
  alive: boolean;
  x: number;
  y: number;
  vy: number;
  age: number;
  life: number;
  text: string;
  color: string;
  size: number;
}

export interface HookCtx {
  wave: number;
  rng: () => number;
}

export interface RollResult {
  face: Face;
  dieId: string;
}

export interface Upgrade {
  id: string;
  name: string;
  desc: string;
  rarity: Rarity;
  category: UpgradeCategory;
  maxStack: number;
  characterExclusive?: string;
  minWave?: number;
  hooks?: Partial<UpgradeHooks>;
  unlockCondition?: (meta: MetaState) => boolean;
  unlockHint?: string;
}

export interface UpgradeHooks {
  onApply: (ctx: HookCtx) => void;
  onRoll: (ctx: HookCtx & { face: Face; dieId: string }) => void;
  onProjectileSpawn: (ctx: HookCtx & { projectile: Projectile; face: Face }) => void;
  onProjectileHit: (ctx: HookCtx & { projectile: Projectile; enemy: Enemy }) => void;
  onKill: (ctx: HookCtx & { enemy: Enemy }) => void;
  onDamaged: (ctx: HookCtx & { amount: number }) => number | void;
  onWaveStart: (ctx: HookCtx & { wave: number }) => void;
  onWaveEnd: (ctx: HookCtx & { wave: number }) => void;
  onTick: (ctx: HookCtx & { dt: number }) => void;
}

export interface EnemyType {
  id: string;
  name: string;
  spriteId: string;
  color: string;
  baseHp: number;
  baseSpeed: number;
  radius: number;
  minWave: number;
  weight: (wave: number) => number;
  touchDamage: number;
  scoreValue: number;
  behavior?: (e: Enemy, dt: number) => void;
  onDeath?: (e: Enemy) => void;
  onHit?: (e: Enemy, projectile: Projectile) => void;
  damageFilter?: (roll: RollResult) => boolean;
  elite?: boolean;
  isBoss?: boolean;
  bossMechanic?: (e: Enemy, dt: number) => void;
}

export interface Character {
  id: string;
  name: string;
  spriteId: string;
  tagline: string;
  description: string;
  color: string;
  startingDice: DieConfig[];
  baseProjectile: ProjectileArchetype;
  passive?: Partial<UpgradeHooks>;
  exclusiveUpgrades: string[];
  unlockCondition?: (meta: MetaState) => boolean;
  unlockHint?: string;

  // Dice Forge rework (new, optional)
  defaultFaces?: import('./content/upgrades/types').CharacterDefaultFace[];
  lockedSlots?: number[];
  restrictedKinds?: import('./content/upgrades/types').SlotRestriction[];
}

export interface MetaState {
  highScores: Record<string, number>;
  unlockedCharacters: string[];
  totalRunsCompleted: number;
  totalWavesCleared: number;
  unlockedArsenal: string[];
  totalKills: number;
  maxWaveReached: number;
  pendingArsenalUnlocks: string[];
  // Stats for challenge-based character unlocks.
  maxGoldSpentInRun: number;
  bestSingleRunKills: number;
  // Cosmetic dice unlocks (IDs from DIE_THEME_IDS).
  unlockedDiceThemes: string[];
  pendingDiceThemeUnlocks: string[];
}

export interface AppliedUpgrade {
  id: string;
  stacks: number;
}

export interface RunState {
  characterId: string;
  wave: number;
  score: number;
  hp: number;
  maxHp: number;
  shield: number;
  souls: number;
  rage: number;
  upgrades: AppliedUpgrade[];
  dice: DieConfig[];
  seed: number;
  kills: number;
  waveStartedAt: number;
  rerolls: number;
  pickCount: number;
  lockedFaceValue?: number;
  lockedFaceTimer?: number;
  momentum?: number;
  momentumT?: number;

  // Dice Forge rework (new)
  gold: number;
  ownedFaceUpgrades: Record<string, number>;
  slotLayout: import('./content/upgrades/types').SlotState[];
  gambitStacks: number;

  // Per-run meta counter (feeds MetaState.maxGoldSpentInRun at run end).
  goldSpent: number;
}

export interface SpawnEvent {
  typeId: string;
  t: number;
  x: number;
  elite?: boolean;
}

export interface WaveScript {
  wave: number;
  isBoss: boolean;
  events: SpawnEvent[];
  duration: number;
  bossTypeId?: string;
}
