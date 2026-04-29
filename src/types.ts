export type Screen =
  | 'menu'
  | 'select'
  | 'game'
  | 'upgrade'
  | 'forge'
  | 'casino'
  | 'boss-warn'
  | 'pause'
  | 'gameover'
  | 'den';

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';
export type UpgradeCategory = 'dice' | 'projectile' | 'passive' | 'aoe' | 'landmark' | 'relic' | 'bauble';
export type CasinoGameId = 'slots' | 'roulette' | 'blackjack' | 'coinFlip';
export type CasinoPhase = 'choose' | 'play' | 'chest' | 'reward';
export type CasinoLuckGrade = 'COLD' | 'WARM' | 'HOT' | 'LUCKY' | 'JACKPOT';
export type CasinoChestTier = 'rusty' | 'copper' | 'bronze' | 'iron' | 'silver' | 'gold' | 'diamond' | 'jackpot';
export type CasinoOutcome = 'miss' | 'small' | 'big' | 'jackpot';

export interface CasinoGameResult {
  outcome: CasinoOutcome;
  label: string;
  chestDelta: number;
}

export type CasinoRewardKind = 'gold' | 'heal' | 'face' | 'bauble' | 'relic' | 'forgeDiscount';

export type CasinoChestReward =
  | {
      kind: 'gold';
      amount: number;
      tier: CasinoChestTier;
      label: string;
    }
  | {
      kind: 'heal';
      amount: number;
      tier: CasinoChestTier;
      label: string;
    }
  | {
      kind: 'face' | 'bauble' | 'relic';
      id: string;
      rarity: Rarity;
      tier: CasinoChestTier;
      label: string;
      convertGold: number;
    }
  | {
      kind: 'forgeDiscount';
      amount: number;
      tier: CasinoChestTier;
      label: string;
    };

export interface CasinoIntermissionState {
  wave: number;
  phase: CasinoPhase;
  game: CasinoGameId | null;
  offeredGames: CasinoGameId[];
  luckGrade: CasinoLuckGrade;
  luckScore: number;
  chestTier: CasinoChestTier;
  baseChestTier: CasinoChestTier;
  result?: CasinoGameResult;
  rewards?: CasinoChestReward[];
  reward?: CasinoChestReward;
  rewardClaimed?: boolean;
  seed: number;
}

export type Element = 'none' | 'fire' | 'ice' | 'poison' | 'lightning' | 'arcane';
export type WaveArchetypeId =
  | 'mixed'
  | 'rush'
  | 'escort'
  | 'splitterFlood'
  | 'puzzle'
  | 'ambush'
  | 'eliteDuel';
export type EliteKind = 'swift' | 'armored' | 'volatile' | 'twin' | 'golden';
export type DamageSourceKind =
  | 'projectile'
  | 'orbit'
  | 'beam'
  | 'pulse'
  | 'pull'
  | 'ground'
  | 'strike'
  | 'chain'
  | 'status'
  | 'landmark'
  | 'minion'
  | 'unknown';

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
  critChance?: number;
  burnDps?: number;
  burnDur?: number;
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
  slowT: number;
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
  eliteKind?: EliteKind;
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
  | 'flamePillar'
  | 'slow'
  | 'void'
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

export interface BaubleEffect {
  allDamageMul?: number;
  damageToFrozenMul?: number;
  damageToSlowedMul?: number;
  damageToPoisonedMul?: number;
  damageToBurningMul?: number;
  damageToEliteBossMul?: number;
  lowFaceDamageMul?: number;
  highFaceDamageMul?: number;
  lowHpDamageMul?: number;
  fireDamageMul?: number;
  lightningDamageMul?: number;
  arcaneDamageMul?: number;
  poisonApplicationDpsMul?: number;
  poisonDurationMul?: number;
  poisonTickDamageMul?: number;
  burnTickDamageMul?: number;
  freezeDurationMul?: number;
  stunDurationMul?: number;
  chainDamageMul?: number;
  chainRangeMul?: number;
  projectileDamageMul?: number;
  projectileSpeedMul?: number;
  projectileRadiusMul?: number;
  projectileLifetimeMul?: number;
  projectileCritChance?: number;
  frozenCritChance?: number;
  fireProjectileCritChance?: number;
  pulseDamageMul?: number;
  beamDamageMul?: number;
  orbitDamageMul?: number;
  strikeDamageMul?: number;
  healingReceivedMul?: number;
  waveStartShield?: number;
  goldGainMul?: number;
  cooldownReductionMul?: number;
}

export interface Upgrade {
  id: string;
  name: string;
  desc: string;
  rarity: Rarity;
  category: UpgradeCategory;
  maxStack: number;
  /** Optional relic/item pixel art rows. Uses the shared palette keys from sprites/palette.ts. */
  icon?: string[];
  /** Short lore line used by relic presentation surfaces. */
  lore?: string;
  /** Primary proc animation id for special relic feedback. */
  procAnimation?: string;
  /** Optional direct forge price override for rare purchasable relic offers. */
  forgePrice?: number;
  /** Stack-additive minor passive effect used by baubles. */
  bauble?: BaubleEffect;
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

export type HouseEnemyFamily =
  | 'debt'
  | 'vault'
  | 'brood'
  | 'mirror'
  | 'null'
  | 'grave'
  | 'court'
  | 'suture'
  | 'furnace';

export interface BossDossier {
  title: string;
  rule: string;
  weakness: string;
  lore: string;
  phaseLines?: [string, string, string];
  rewardLine?: string;
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
  mechanicDesc?: string;
  family?: HouseEnemyFamily;
  role?: string;
  lore?: string;
  tell?: string;
  threat?: string;
  weakness?: string;
  spawnLine?: string;
  deathLine?: string;
  bossDossier?: BossDossier;
  bossMechanic?: (e: Enemy, dt: number) => void;
}

export interface DamageContext {
  source: DamageSourceKind;
  face?: Face;
  dieId?: string;
  projectile?: Projectile;
}

export interface RunMutatorModifiers {
  enemyHpMul?: number;
  enemyCountMul?: number;
  enemySpeedMul?: number;
  playerDamageMul?: number;
  playerDamageTakenMul?: number;
  highRollDamageMul?: number;
  lowRollCooldownMul?: number;
  goldMul?: number;
  forgeRarityBonus?: number;
  eliteChanceBonus?: number;
  forceOddEvenEarly?: boolean;
}

export interface RunMutator {
  id: string;
  name: string;
  shortName: string;
  desc: string;
  premise?: string;
  entryLine?: string;
  rewardLine?: string;
  enemyFamilyBias?: Partial<Record<HouseEnemyFamily, number>>;
  modifiers: RunMutatorModifiers;
}

export interface BiomeRule {
  id: string;
  name: string;
  shortName: string;
  desc: string;
  roomTitle?: string;
  roomLine?: string;
  enemyFamilyBias?: Partial<Record<HouseEnemyFamily, number>>;
  enemyHpMul?: number;
  enemySpeedMul?: number;
  eliteChanceBonus?: number;
  archetypeWeights?: Partial<Record<WaveArchetypeId, number>>;
  enemyWeights?: Record<string, number>;
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
  encounteredEnemyIds: string[];
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
  casinoWaveDamageTaken?: number;
  casinoWaveEliteKills?: number;

  // Dice Forge rework (new)
  gold: number;
  ownedFaceUpgrades: Record<string, number>;
  slotLayout: import('./content/upgrades/types').SlotState[];
  gambitStacks: number;

  // Per-run meta counter (feeds MetaState.maxGoldSpentInRun at run end).
  goldSpent: number;

  // Run identity and encounter pacing.
  runMutatorId?: string;
  currentWaveArchetypeId?: WaveArchetypeId;
  currentBiomeRuleId?: string;
  nextForgeDiscount?: number;
  guaranteedForgeRarity?: Rarity;
  pendingCasino?: CasinoIntermissionState;
}

export interface SpawnEvent {
  typeId: string;
  t: number;
  x: number;
  elite?: boolean;
  eliteKind?: EliteKind;
}

export interface WaveScript {
  wave: number;
  isBoss: boolean;
  events: SpawnEvent[];
  duration: number;
  bossTypeId?: string;
  archetypeId?: WaveArchetypeId;
  biomeRuleId?: string;
}
