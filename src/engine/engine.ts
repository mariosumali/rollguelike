import type {
  RunState,
  Enemy,
  Projectile,
  VfxParticle,
  NumberPopup,
  SoulPickup,
  Face,
  DieConfig,
  HookCtx,
  WaveScript,
  SpawnEvent,
  RollResult,
  Element,
  DamageContext,
  HouseEnemyFamily,
  CasinoChestReward,
} from '../types';
import { BALANCE } from '../config/balance';
import {
  ARENA_H,
  ARENA_W,
  CANVAS_W,
  CANVAS_H,
  HUD_H,
  WALL_Y,
  PLAYER_X,
  PLAYER_Y,
  DIE_Y,
  PROJECTILE_SPAWN_Y,
  FIXED_DT,
} from '../config/constants';
import { mulberry32 } from './rng';
import {
  createProjectilePool,
  createEnemyPool,
  createVfxPool,
  createPopupPool,
  createSoulPool,
  acquire,
  resetProjectile,
  resetEnemy,
  makeEnemy,
  makeProjectile,
  makeVfx,
  makePopup,
  makeSoul,
} from './pools';
import {
  onApply,
  onRoll as fireOnRoll,
  onProjectileHit,
  onKill as fireOnKill,
  onDamaged,
  onWaveStart as fireOnWaveStart,
  onWaveEnd as fireOnWaveEnd,
  onTick as fireOnTick,
  onProjectileSpawn,
} from './hooks';
import { emitEvent } from './events';
import { addTrauma, updateShake, getShakeOffset, resetShake } from './shake';
import { drawArenaBackground, drawWall, drawGroundBelow } from '../sprites/environment';
import { stageForWave, stageIndexForWave, STAGES } from '../content/stages/themes';
import {
  drawExplosion,
  drawHealParticle,
  drawLightningBolt,
  drawMuzzleFlash,
  drawNumberPopup,
  drawPoisonCloud,
  drawArchetypeProjectile,
  drawArchetypeProjectileTrail,
  drawReactionPop,
  drawShieldBubble,
  drawSoulPickup,
  drawSpark,
  drawFreezeCrystal,
  drawFlamePillar,
  drawSlowAura,
  drawVoidRune,
  drawStatusEmbers,
  ELEMENT_COLORS,
} from '../sprites/effects';
import { buildDieSpriteSet, drawDie, getDieTheme, buildFaceIconCanvas, type DieSpriteSet, type DieFaceIcons } from '../sprites/dice';
import { getFaceIconRows, getFaceIconCacheKey } from '../content/upgrades/faceIcons';
import { getSprite, drawSprite } from '../sprites/sprite';
import { initSprites } from '../sprites';
import { makeAnimState, setAnim, stepAnim, type AnimState } from '../sprites/animation';
import { getCharacter, listCharacters } from '../content/characters/registry';
import { getEnemyType } from '../content/enemies/registry';
import { listUpgrades, getUpgrade } from '../content/upgrades/registry';
import {
  getFaceChainId,
  getFaceRank,
  listFaceUpgrades,
  getFaceUpgrade,
} from '../content/upgrades/faceRegistry';
import { MAX_TIER } from '../content/upgrades/types';
import type { FaceUpgradeTiming } from '../content/upgrades/types';
import { resolveFace, deriveProjectileColor, findNearestEnemyXY, DEFAULT_AIM } from '../systems/faceResolve';
import { createSlotLayout, canPlaceSupplement, expandSlot, slotAllowedTags, isSlotLocked } from '../systems/slots';
import { baubleMul, collectBaubleStats } from '../systems/baubles';
import {
  adjustChestTier,
  casinoFaceSlotOptions,
  createCasinoIntermission,
  rollCasinoGameResult,
  rollCasinoRewards,
} from '../systems/chestRewards';
import { getAnimationSpec } from '../content/animations/registry';
import type { TierIntensity } from '../content/animations/types';
import { DEFAULT_PROJECTILE_ARCHETYPE } from '../content/characters/projectiles';
import { getReaction, elementalDotDps, reactionEffectElement } from '../systems/elemental';
import { playSfx } from '../audio/sfx';
import { haptic, HAPTIC } from '../audio/haptics';
import {
  getScreenFlashesEnabled,
  getDamageNumbersEnabled,
  getEnemyHpBarMode,
  getParticleMultiplier,
  getAutoRollEnabled,
} from '../state/prefsRuntime';
import { useStore, setRunState, type ForgeShopOffer } from '../state/store';
import { saveRun, incrementRunsCompleted, saveMeta, recordEnemyEncounters } from '../state/persistence';
import { DIE_THEME_IDS as ALL_DIE_THEME_IDS } from '../sprites/dice';
import { palHex } from '../sprites/palette';
import { weighted } from './rng';
import { generateWave } from '../content/waves/generator';
import { pick } from './rng';
import { getRunMutator, pickRunMutator } from '../content/runMutators';
import { getBiomeRule } from '../content/stages/biomeRules';

export interface DieInstance {
  config: DieConfig;
  value: number;
  rolling: boolean;
  rollT: number;
  rollDuration: number;
  shakeFrame: number;
  landedAt: number;
  chargeT: number;
  charging: boolean;
  offsetX: number;
}

interface PendingAttack {
  face: Face;
  dieId: string;
  t: number;
  delay: number;
}

const DEFAULT_FACE_TIMING: Required<Pick<FaceUpgradeTiming, 'castDelay' | 'recovery'>> = {
  castDelay: 0.04,
  recovery: 0,
};

interface PendingShot {
  t: number;
  delay: number;
  x: number;
  y: number;
  damage: number;
  face: Face;
  postSpawn?: (p: Projectile) => void;
}

type PoseKind =
  | 'none'
  | 'attack'
  | 'burst'
  | 'bomb'
  | 'rage'
  | 'pulse'
  | 'drain'
  | 'shield'
  | 'heal'
  | 'wild'
  | 'blank'
  | 'charged';

interface PlayerPose {
  kind: PoseKind;
  t: number;
  dur: number;
}

interface PullZone {
  x: number;
  y: number;
  radius: number;
  strength: number;
  dps: number;
  t: number;
  duration: number;
  element: string;
}

interface GroundZone {
  x: number;
  y: number;
  radius: number;
  dps: number;
  t: number;
  duration: number;
  element: Element;
  slow: number;
  kind: 'ground' | 'flame' | 'frost';
  burnDps?: number;
  burnDur?: number;
}

interface TimedStrike {
  t: number;
  delay: number;
  damage: number;
  element: Element;
  radius: number;
  stunDur: number;
  chainToExtra: number;
  kind: 'column' | 'flame';
  duration?: number;
  burnDps?: number;
  burnDur?: number;
}

interface PendingPulse {
  t: number;
  delay: number;
  radius: number;
  damage: number;
  element: Element;
  knockback: number;
}

interface ReflectState {
  t: number;
  duration: number;
  multiplier: number;
  radius: number;
}

// Frenzy mode kicks in as a safety net whenever a wave has fully spawned but
// no enemy has died (or reached the wall) for FRENZY_TRIGGER_DELAY seconds.
// While active, simulation time is multiplied by FRENZY_SPEED_MUL so the
// stalemate resolves quickly; when FRENZY_DURATION elapses any remaining
// enemies are force-killed so the round can end. Tuned small because most
// healthy waves never see this ring appear.
const FRENZY_TRIGGER_DELAY = 8;
const FRENZY_DURATION = 6;
const FRENZY_SPEED_MUL = 2;
const TWIN_DICE_UPGRADE_ID = 'landmark_twin_dice';
const TWIN_DICE_SUFFIX = '__twin';
const TWIN_DICE_DAMAGE_MUL = 0.5;
let knownEncounteredEnemyIds = new Set<string>();

interface EngineState {
  run: RunState | null;
  rng: () => number;
  dice: DieInstance[];
  enemies: Enemy[];
  projectiles: Projectile[];
  vfx: VfxParticle[];
  popups: NumberPopup[];
  souls: SoulPickup[];
  wave: WaveScript | null;
  waveT: number;
  nextSpawnIdx: number;
  waveClearedT: number;
  paused: boolean;
  paused_upgrade: boolean;
  iframeT: number;
  time: number;
  dieSprites: DieSpriteSet;
  playerAnim: AnimState;
  playerPose: PlayerPose;
  pendingAttacks: PendingAttack[];
  pendingShots: PendingShot[];
  pullZones: PullZone[];
  groundZones: GroundZone[];
  timedStrikes: TimedStrike[];
  pendingPulses: PendingPulse[];
  reflect: ReflectState | null;
  lastRolled: Face | null;
  spawnedForWave: boolean;
  screenFlashT: number;
  screenFlashColor: string;
  hitStopT: number;
  rollCount: number;
  tapQueued: boolean;
  bossWarnT: number;
  deathT: number;
  saveT: number;
  hitAnimT: number;
  stageBannerT: number;
  stageBannerIdx: number;
  announcedStageIdx: number;
  lastKillTime: number;
  frenzyActive: boolean;
  frenzyT: number;
  lastHud: {
    wave: number; score: number; hp: number; maxHp: number;
    shield: number; souls: number; rage: number; gold: number; gambitStacks: number; characterId: string;
    isBossWave: boolean; waveProgress: number; runMutatorName: string; runMutatorShortName: string;
    waveArchetypeName: string; biomeName: string; encounterLine: string; roomLine: string; omenLine: string; forgeBonusLabel: string;
  } | null;
}

const state: EngineState = {
  run: null,
  rng: mulberry32(1),
  dice: [],
  enemies: createEnemyPool(64),
  projectiles: createProjectilePool(256),
  vfx: createVfxPool(256),
  popups: createPopupPool(64),
  souls: createSoulPool(64),
  wave: null,
  waveT: 0,
  nextSpawnIdx: 0,
  waveClearedT: -1,
  paused: false,
  paused_upgrade: false,
  iframeT: 0,
  time: 0,
  dieSprites: null as unknown as DieSpriteSet,
  playerAnim: makeAnimState('idle'),
  playerPose: { kind: 'none', t: 0, dur: 0 },
  pendingAttacks: [],
  pendingShots: [],
  pullZones: [],
  groundZones: [],
  timedStrikes: [],
  pendingPulses: [],
  reflect: null,
  lastRolled: null,
  spawnedForWave: false,
  screenFlashT: 0,
  screenFlashColor: '#fff',
  hitStopT: 0,
  rollCount: 0,
  tapQueued: false,
  bossWarnT: 0,
  deathT: 0,
  saveT: 10,
  hitAnimT: 0,
  stageBannerT: 0,
  stageBannerIdx: -1,
  announcedStageIdx: -1,
  lastKillTime: 0,
  frenzyActive: false,
  frenzyT: 0,
  lastHud: null,
};

export function initEngine(): void {
  initSprites();
  const themeId = useStore.getState().settings.dieTheme;
  state.dieSprites = buildDieSpriteSet(getDieTheme(themeId));
  knownEncounteredEnemyIds = new Set(useStore.getState().meta.encounteredEnemyIds ?? []);
}

export function startRun(characterId: string, resumeRun?: RunState): void {
  initEngine();
  const ch = getCharacter(characterId);
  if (!ch) {
    console.error('Unknown character', characterId);
    return;
  }
  resetShake();
  state.enemies.forEach((e) => (e.alive = false));
  state.projectiles.forEach((p) => (p.alive = false));
  state.vfx.forEach((v) => (v.alive = false));
  state.popups.forEach((p) => (p.alive = false));
  state.souls.forEach((s) => (s.alive = false));
  state.pendingAttacks = [];
  state.pendingShots = [];
  state.pullZones = [];
  state.groundZones = [];
  state.timedStrikes = [];
  state.pendingPulses = [];
  state.reflect = null;
  state.lastRolled = null;
  state.wave = null;
  state.waveT = 0;
  state.nextSpawnIdx = 0;
  state.waveClearedT = -1;
  state.spawnedForWave = false;
  state.paused = false;
  state.paused_upgrade = false;
  state.iframeT = 0;
  state.time = 0;
  state.screenFlashT = 0;
  state.hitStopT = 0;
  state.rollCount = 0;
  state.tapQueued = false;
  state.bossWarnT = 0;
  state.deathT = 0;
  state.saveT = 10;
  state.hitAnimT = 0;
  state.stageBannerT = 0;
  state.stageBannerIdx = -1;
  state.announcedStageIdx = -1;
  state.lastKillTime = 0;
  state.frenzyActive = false;
  state.frenzyT = 0;
  state.lastHud = null;

  const run: RunState =
    resumeRun ??
    {
      characterId,
      wave: 1,
      score: 0,
      hp: BALANCE.player.startingHp,
      maxHp: BALANCE.player.startingHp,
      shield: 0,
      souls: 0,
      rage: 0,
      upgrades: [],
      dice: ch.startingDice.map((d) => cloneDie(d)),
      seed: (Math.random() * 0x7fffffff) | 0,
      kills: 0,
      waveStartedAt: 0,
      rerolls: 0,
      pickCount: 0,
      casinoWaveDamageTaken: 0,
      casinoWaveEliteKills: 0,
      gold: 0,
      ownedFaceUpgrades: {},
      slotLayout: createSlotLayout(ch),
      gambitStacks: 0,
      goldSpent: 0,
    };

  state.run = run;
  setRunState(run);
  state.rng = mulberry32(run.seed);
  if (!run.runMutatorId) {
    run.runMutatorId = pickRunMutator(state.rng).id;
  }
  ensureTwinDice(run);
  state.dice = buildDieInstances(run.dice);

  setAnim(state.playerAnim, 'idle');
  state.playerPose = { kind: 'none', t: 0, dur: 0 };

  const env = envFor(run);
  onApply(env);
  syncActiveUpgradesToStore();
  useStore.getState().setCasinoState(null);
  if (run.pendingCasino) {
    normalizeCasinoIntermission(run);
    state.paused_upgrade = true;
    state.paused = true;
    useStore.getState().setCasinoState(run.pendingCasino);
    useStore.getState().setScreen('casino');
    syncHudToStore();
    return;
  }
  setupWave(run.wave);
  syncHudToStore();
}

export function continueRun(run: RunState): void {
  if (state.run === run && state.wave) {
    initEngine();
    state.paused_upgrade = Boolean(run.pendingCasino) || state.paused_upgrade;
    state.paused = state.paused_upgrade;
    state.tapQueued = false;
    syncActiveUpgradesToStore();
    syncHudToStore();
    if (run.pendingCasino) {
      normalizeCasinoIntermission(run);
      useStore.getState().setCasinoState(run.pendingCasino);
      useStore.getState().setScreen('casino');
    } else {
      useStore.getState().setScreen('game');
    }
    return;
  }

  startRun(run.characterId, run);
}

function cloneDie(d: DieConfig): DieConfig {
  return {
    id: d.id,
    faces: d.faces.map((f) => ({ ...f, modifiers: f.modifiers ? { ...f.modifiers } : undefined })),
    rollDuration: d.rollDuration,
    bias: d.bias ? d.bias.slice() : undefined,
  };
}

function buildDieInstances(dice: DieConfig[]): DieInstance[] {
  return dice.map((d, idx) => createDieInstance(d, dice.length, idx));
}

function createDieInstance(d: DieConfig, total: number, idx = state.dice.length): DieInstance {
  const spacing = 24;
  const ox = total === 1 ? 0 : (idx - (total - 1) / 2) * spacing;
  return {
    config: d,
    value: 1,
    rolling: false,
    rollT: 0,
    rollDuration: d.rollDuration,
    shakeFrame: 0,
    landedAt: 0,
    chargeT: 0,
    charging: false,
    offsetX: ox,
  };
}

function hasUpgrade(run: RunState, id: string): boolean {
  return run.upgrades.some((u) => u.id === id && u.stacks > 0);
}

function makeTwinDie(source: DieConfig): DieConfig {
  const die = cloneDie(source);
  die.id = source.id.endsWith(TWIN_DICE_SUFFIX)
    ? source.id
    : `${source.id}${TWIN_DICE_SUFFIX}`;
  return die;
}

function ensureTwinDice(run: RunState): boolean {
  if (!hasUpgrade(run, TWIN_DICE_UPGRADE_ID)) return false;
  if (run.dice.length !== 1) return false;
  const source = run.dice[0];
  if (!source) return false;
  run.dice.push(makeTwinDie(source));
  return true;
}

function envFor(run: RunState) {
  return {
    run,
    rng: state.rng,
    ctx: { wave: run.wave, rng: state.rng } satisfies HookCtx,
  };
}

function baubleHealingAmount(run: RunState, amount: number): number {
  return Math.max(0, amount * baubleMul(collectBaubleStats(run).healingReceivedMul));
}

function baubleGoldAmount(
  run: RunState,
  amount: number,
  rounding: 'floor' | 'round' = 'round',
  min = 0,
): number {
  const boosted = amount * baubleMul(collectBaubleStats(run).goldGainMul);
  const value = rounding === 'floor' ? Math.floor(boosted) : Math.round(boosted);
  return Math.max(min, value);
}

function setupWave(waveNum: number): void {
  const isBoss = waveNum % BALANCE.waves.bossEvery === 0;
  const run = state.run!;
  state.wave = generateWave(waveNum, state.rng, isBoss, run);
  run.currentWaveArchetypeId = state.wave.archetypeId;
  run.currentBiomeRuleId = state.wave.biomeRuleId;
  state.waveT = 0;
  state.nextSpawnIdx = 0;
  state.spawnedForWave = false;
  state.waveClearedT = -1;
  state.tapQueued = false;
  state.lastKillTime = state.time;
  state.frenzyActive = false;
  state.frenzyT = 0;
  run.waveStartedAt = state.time;
  run.casinoWaveDamageTaken = 0;
  run.casinoWaveEliteKills = 0;
  fireOnWaveStart(envFor(run), waveNum);
  const baubleShield = Math.floor(collectBaubleStats(run).waveStartShield);
  if (baubleShield > 0) {
    run.shield = Math.min(BALANCE.combat.shieldMax, run.shield + baubleShield);
    spawnShieldVfx();
  }

  const stageIdx = stageIndexForWave(waveNum);
  if (stageIdx !== state.announcedStageIdx) {
    state.announcedStageIdx = stageIdx;
    state.stageBannerIdx = stageIdx;
    state.stageBannerT = 2.8;
  }

  useStore.getState().setHud({ wave: waveNum, isBossWave: isBoss });
  if (isBoss) {
    const bossId = state.wave.bossTypeId ?? 'boss_facelocker';
    useStore.getState().setBossWarn(bossId);
    useStore.getState().setScreen('boss-warn');
    playSfx('boss_warn');
    haptic([40, 60, 40]);
    state.bossWarnT = 2.0;
  } else {
    useStore.getState().setBossWarn(null);
    useStore.getState().setScreen('game');
    state.bossWarnT = 0;
  }
}

export function update(dt: number): void {
  const run = state.run;
  if (!run) return;

  if (state.deathT > 0) {
    state.deathT -= dt;
    if (state.deathT <= 0) {
      state.deathT = 0;
      setRunState(null);
      useStore.getState().setScreen('gameover');
      emitEvent('player-died');
    }
    return;
  }

  if (state.hitAnimT > 0) {
    state.hitAnimT -= dt;
    if (state.hitAnimT <= 0) {
      setAnim(state.playerAnim, 'idle');
    }
  }

  if (state.bossWarnT > 0) {
    state.bossWarnT -= dt;
    if (state.bossWarnT <= 0 && useStore.getState().screen === 'boss-warn') {
      useStore.getState().setScreen('game');
    }
  }

  if (state.stageBannerT > 0) {
    state.stageBannerT = Math.max(0, state.stageBannerT - dt);
  }

  if (state.paused) return;

  if (state.hitStopT > 0) {
    state.hitStopT -= dt;
    return;
  }

  // Frenzy safety-net: detect stalled waves (spawns done but enemies neither
  // dying nor reaching the wall) and accelerate time. The trigger/tick runs on
  // real dt BEFORE we scale; simulation dt below is multiplied when active.
  tickFrenzy(dt, run);
  if (state.frenzyActive) dt *= FRENZY_SPEED_MUL;

  state.time += dt;
  state.iframeT = Math.max(0, state.iframeT - dt);
  state.screenFlashT = Math.max(0, state.screenFlashT - dt);
  updateShake(dt);

  const env = envFor(run);

  stepAnim(getSprite(spriteIdFor(run.characterId))!, state.playerAnim, dt);

  if (state.playerPose.kind !== 'none') {
    state.playerPose.t += dt;
    if (state.playerPose.t >= state.playerPose.dur) {
      state.playerPose = { kind: 'none', t: 0, dur: 0 };
    }
  }

  for (const die of state.dice) {
    updateDie(die, dt, run);
  }

  if (
    state.tapQueued &&
    !state.dice.some((d) => d.rolling) &&
    !state.dice.some((d) => d.charging) &&
    !state.paused_upgrade &&
    diceReadyToRoll()
  ) {
    state.tapQueued = false;
    tap();
  } else if (
    getAutoRollEnabled() &&
    !state.dice.some((d) => d.rolling) &&
    !state.dice.some((d) => d.charging) &&
    !state.paused_upgrade &&
    diceReadyToRoll()
  ) {
    tap();
  }

  for (let i = state.pendingAttacks.length - 1; i >= 0; i--) {
    const pa = state.pendingAttacks[i]!;
    pa.t += dt;
    if (pa.t >= pa.delay) {
      executeFace(pa.face, pa.dieId, run);
      state.pendingAttacks.splice(i, 1);
    }
  }

  for (let i = state.pendingShots.length - 1; i >= 0; i--) {
    const ps = state.pendingShots[i]!;
    ps.t += dt;
    if (ps.t >= ps.delay) {
      const target = findNearestEnemyXY(state.enemies);
      const angle = target
        ? Math.atan2(target.y - ps.y, target.x - ps.x)
        : DEFAULT_AIM;
      const p = spawnProjectile(ps.x, ps.y, Math.cos(angle), Math.sin(angle), ps.damage, ps.face);
      ps.postSpawn?.(p);
      state.pendingShots.splice(i, 1);
    }
  }

  if (state.wave && !state.spawnedForWave) {
    state.waveT += dt;
    while (state.nextSpawnIdx < state.wave.events.length) {
      const ev = state.wave.events[state.nextSpawnIdx]!;
      if (state.waveT >= ev.t) {
        spawnEnemy(ev);
        state.nextSpawnIdx++;
      } else break;
    }
    if (state.nextSpawnIdx >= state.wave.events.length) state.spawnedForWave = true;
  }

  tickPullZones(dt, run);
  tickGroundZones(dt, run);
  tickTimedStrikes(dt, run);
  tickPendingPulses(dt, run);
  if (state.reflect) {
    state.reflect.t += dt;
    if (state.reflect.t >= state.reflect.duration) state.reflect = null;
  }

  for (const e of state.enemies) {
    if (!e.alive) continue;
    updateEnemy(e, dt, run);
  }
  recordAliveEnemyEncounters();

  for (const p of state.projectiles) {
    if (!p.alive) continue;
    updateProjectile(p, dt, run);
  }

  for (const s of state.souls) {
    if (!s.alive) continue;
    updateSoul(s, dt, run);
  }

  for (const v of state.vfx) {
    if (!v.alive) continue;
    v.age += dt;
    if (v.age >= v.life) {
      v.alive = false;
      continue;
    }
    v.x += v.vx * dt;
    v.y += v.vy * dt;
    v.vy += (v.kind === 'poison' ? -8 : v.kind === 'heal' ? -20 : 0) * dt;
    v.vx *= 0.96;
    v.vy *= 0.96;
    v.angle += v.rot * dt;
  }

  for (const p of state.popups) {
    if (!p.alive) continue;
    p.age += dt;
    if (p.age >= p.life) {
      p.alive = false;
      continue;
    }
    p.y += p.vy * dt;
    p.vy += 30 * dt;
  }

  fireOnTick(env, dt);

  if (run.characterId === 'berserker') updateRage(run, dt);
  if (run.characterId === 'clockmaker') applyClockmakerSlow();
  updateMomentum(run, dt);

  // Safety clamp: non-boss enemies must never be shoved above their spawn
  // line. Pull-zones, graviton projectiles, and knockback effects mutate e.y
  // directly and could otherwise launch rushers over the HUD where bullets
  // (which despawn at y < HUD_H) can never reach them — softlocking the wave.
  // Bosses are exempt because they manage their own target-Y logic.
  for (const e of state.enemies) {
    if (!e.alive || e.isBoss) continue;
    const minY = HUD_H - 12;
    if (e.y < minY) e.y = minY;
  }

  if (state.spawnedForWave && allEnemiesDead() && state.waveClearedT < 0) {
    state.waveClearedT = state.time;
    endWave(run);
  }

  syncHudToStore();

  state.saveT -= dt;
  if (state.saveT <= 0) {
    saveRun(run);
    state.saveT = 10;
  }
}

function updateDie(die: DieInstance, dt: number, run: RunState): void {
  if (die.charging) {
    die.chargeT = Math.min(2.5, die.chargeT + dt);
    return;
  }
  if (die.rolling) {
    die.rollT += dt;
    die.shakeFrame = (die.shakeFrame + dt * 24) % 6;
    if (die.rollT >= die.rollDuration) {
      die.rolling = false;
      die.landedAt = state.time;
      const face = pickFace(die, run);
      die.value = face.value;
      const timing = getTimingForFace(face, run);
      die.landedAt += Math.max(0, timing.recovery ?? 0);
      resolveRoll(die, face, run, timing);
      const lowRollCooldownMul = getRunMutator(run.runMutatorId)?.modifiers.lowRollCooldownMul;
      if (lowRollCooldownMul && face.value <= 2) {
        die.landedAt -= BALANCE.die.postRollCooldown * (1 - lowRollCooldownMul);
      }
      playSfx('roll_land');
      haptic(HAPTIC.land);
    }
  }
}

function pickFace(die: DieInstance, run: RunState): Face {
  if (run.lockedFaceValue !== undefined && run.lockedFaceValue > 0) {
    const candidates = die.config.faces.filter((f) => f.value !== run.lockedFaceValue);
    if (candidates.length > 0) return pick(state.rng, candidates);
  }
  const bias = die.config.bias;
  if (bias && bias.length === die.config.faces.length) {
    const entries: [Face, number][] = die.config.faces.map((f, i) => [f, bias[i] ?? 1]);
    return weighted(state.rng, entries);
  }
  return pick(state.rng, die.config.faces);
}

function getTimingForFace(face: Face, run: RunState): FaceUpgradeTiming {
  if (face.value < 1) return DEFAULT_FACE_TIMING;
  const slotIndex = Math.max(0, Math.min(5, face.value - 1));
  const slot = run.slotLayout?.[slotIndex];
  const upgrade = slot?.replacerId ? getFaceUpgrade(slot.replacerId) : undefined;
  return upgrade?.effect.timing ?? DEFAULT_FACE_TIMING;
}

function resolveRoll(die: DieInstance, face: Face, run: RunState, timing: FaceUpgradeTiming): void {
  state.rollCount++;
  fireOnRoll(envFor(run), face, die.config.id);
  emitEvent('roll-land', { face });
  state.pendingAttacks.push({
    face,
    dieId: die.config.id,
    t: 0,
    delay: Math.max(0, timing.castDelay ?? DEFAULT_FACE_TIMING.castDelay),
  });

  if (run.characterId === 'alchemist' && state.lastRolled && state.lastRolled.element !== face.element) {
    const reaction = getReaction(state.lastRolled.element, face.element);
    if (reaction) triggerReaction(reaction, run);
  }
  state.lastRolled = face;
}

function gambitDamageMul(run: RunState): number {
  if (run.characterId !== 'gambler') return 1;
  const stacks = Math.min(BALANCE.gambler.gambitMaxStacks, run.gambitStacks);
  return 1 + stacks * BALANCE.gambler.gambitBonusPerStack;
}

const FACE_POSE: Record<string, { kind: PoseKind; dur: number }> = {
  SHOT: { kind: 'attack', dur: 0.2 },
  BURST: { kind: 'burst', dur: 0.24 },
  CHARGED_BOLT: { kind: 'charged', dur: 0.28 },
  RAGE_SMASH: { kind: 'rage', dur: 0.26 },
  BOMB: { kind: 'bomb', dur: 0.24 },
  PULSE: { kind: 'pulse', dur: 0.3 },
  SOUL_DRAIN: { kind: 'drain', dur: 0.32 },
  SHIELD: { kind: 'shield', dur: 0.32 },
  HEAL: { kind: 'heal', dur: 0.36 },
  WILD: { kind: 'wild', dur: 0.22 },
  BLANK: { kind: 'blank', dur: 0.3 },
};

function triggerPoseForFace(face: Face): void {
  const p = FACE_POSE[face.kind] ?? { kind: 'attack' as PoseKind, dur: 0.2 };
  state.playerPose = { kind: p.kind, t: 0, dur: p.dur };
}

function announceFace(face: Face): void {
  const x = PLAYER_X;
  const y = DIE_Y - 2;
  switch (face.kind) {
    case 'CHARGED_BOLT':
      spawnVfx({ x, y, life: 0.3, kind: 'ring', color: palHex('y')!, size: 6 });
      break;
    case 'BOMB':
      spawnVfx({ x, y, life: 0.3, kind: 'ring', color: palHex('u')!, size: 5 });
      spawnVfx({ x, y, life: 0.25, kind: 'spark', color: palHex('v')!, size: 2 });
      addTrauma(0.05);
      break;
    case 'RAGE_SMASH':
      spawnVfx({ x, y, life: 0.35, kind: 'ring', color: palHex('h')!, size: 8 });
      spawnVfx({ x, y, life: 0.3, kind: 'explosion', color: palHex('L')!, size: 5 });
      addTrauma(0.12);
      break;
    case 'SOUL_DRAIN':
      spawnVfx({ x, y, life: 0.45, kind: 'ring', color: palHex('H')!, size: 10 });
      for (let i = 0; i < 4; i++) {
        const ang = (i / 4) * Math.PI * 2;
        spawnVfx({
          x: x + Math.cos(ang) * 10,
          y: y + Math.sin(ang) * 10,
          vx: -Math.cos(ang) * 40,
          vy: -Math.sin(ang) * 40,
          life: 0.4,
          kind: 'spark',
          color: palHex('H')!,
          size: 2,
        });
      }
      break;
    case 'WILD': {
      const hues = ['u', 'y', 'q', 'z', 'H', 'h'];
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2;
        spawnVfx({
          x,
          y,
          vx: Math.cos(ang) * 30,
          vy: Math.sin(ang) * 30,
          life: 0.4,
          kind: 'spark',
          color: palHex(hues[i % hues.length]!)!,
          size: 2,
        });
      }
      spawnVfx({ x, y, life: 0.4, kind: 'reaction', color: palHex('H')!, size: 6 });
      break;
    }
    case 'BLANK':
      spawnPopup(x, y - 18, 'BLANK', palHex('c')!, 8);
      for (let i = 0; i < 4; i++) {
        const ang = state.rng() * Math.PI * 2;
        spawnVfx({
          x,
          y,
          vx: Math.cos(ang) * 20,
          vy: Math.sin(ang) * 20 - 10,
          life: 0.45,
          kind: 'spark',
          color: palHex('b')!,
          size: 1,
        });
      }
      playSfx('ui_reroll');
      break;
    default:
      break;
  }
}

function executeFace(face: Face, dieId: string, run: RunState): void {
  const slotIndex = Math.max(0, Math.min(5, face.value - 1));
  const slot = face.value >= 1 ? run.slotLayout?.[slotIndex] : undefined;
  const slotActive = !!slot?.replacerId;
  const baselineActive = !!getCharacter(run.characterId)?.defaultFaces?.[slotIndex];
  // The die renders the slot replacer icon based on face.value, so for BLANK
  // faces where a replacer is installed we must play the active pose and let
  // the upgrade's cast animation speak for itself instead of the BLANK popup.
  if (face.kind === 'BLANK' && slotActive) {
    state.playerPose = { kind: 'none', t: 0, dur: 0 };
  } else {
    triggerPoseForFace(face);
    announceFace(face);
  }
  if ((face.kind === 'BLANK' || face.value < 1) && !slotActive && !baselineActive) {
    state.lastRolled = face;
    return;
  }
  const baseDmg =
    (BALANCE.combat.baseFaceDamage[face.value] ?? 10) *
    gambitDamageMul(run) *
    (face.damageMul ?? 1) *
    (hasUpgrade(run, TWIN_DICE_UPGRADE_ID) ? TWIN_DICE_DAMAGE_MUL : 1);
  const roll: RollResult = { face, dieId };
  resolveFace(face, baseDmg, roll, run, {
    spawnProjectile,
    queueShot: (delay, x, y, damage, f, postSpawn) => {
      state.pendingShots.push({ t: 0, delay, x, y, damage, face: f, postSpawn });
    },
    pulse: (r, dmg, el, knockback) => doPulse(r, dmg, el, run, knockback ?? 0),
    delayedPulse: (params) => {
      state.pendingPulses.push({ ...params, t: 0 });
    },
    addShield: (n) => {
      run.shield = Math.min(BALANCE.combat.shieldMax, run.shield + n);
      spawnShieldVfx();
      playSfx('shield');
      haptic(HAPTIC.shield);
    },
    heal: (amt) => {
      run.hp = Math.min(run.maxHp, run.hp + baubleHealingAmount(run, amt));
      for (let i = 0; i < 5; i++) spawnHealParticle();
      playSfx('heal');
      haptic(HAPTIC.shield);
    },
    consumeSouls: (n) => {
      if (run.souls >= n) {
        run.souls -= n;
        return true;
      }
      return false;
    },
    repeatPrev: () => {
      if (state.lastRolled && state.lastRolled.kind !== 'WILD' && state.lastRolled.kind !== 'BLANK') {
        executeFace(state.lastRolled, dieId, run);
      }
    },
    applyStatusNearest: (status, power, duration) => {
      const target = findNearestEnemyXY(state.enemies);
      if (!target) return;
      for (const e of state.enemies) {
        if (!e.alive || e.state === 'die') continue;
        if (e.x !== target.x || e.y !== target.y) continue;
        applyEnemyStatus(e, status, power, duration);
        break;
      }
    },
    applyStatusArea: (status, power, duration, radius) => {
      const r2 = radius * radius;
      for (const e of state.enemies) {
        if (!e.alive || e.state === 'die') continue;
        const dx = e.x - PLAYER_X;
        const dy = e.y - PLAYER_Y;
        if (dx * dx + dy * dy <= r2) applyEnemyStatus(e, status, power, duration);
      }
    },
    addGold: (amount) => {
      run.gold += baubleGoldAmount(run, amount, 'floor');
    },
    startOrbit: (params) => {
      spawnOrbiters(params);
    },
    startBeam: (params) => {
      doBeam(params, run);
    },
    startPull: (params) => {
      state.pullZones.push({
        x: PLAYER_X,
        y: PLAYER_Y - 8,
        radius: params.radius,
        strength: params.strength,
        dps: params.dps,
        duration: params.duration,
        t: 0,
        element: params.element,
      });
      spawnVfx({ x: PLAYER_X, y: PLAYER_Y - 8, life: 0.35, kind: 'ring', color: ELEMENT_COLORS[params.element as 'none'] ?? '#fff', size: params.radius });
    },
    startGroundZone: (params) => {
      const target = findNearestEnemyXY(state.enemies) ?? { x: PLAYER_X, y: PLAYER_Y - 28 };
      state.groundZones.push({
        x: target.x,
        y: target.y,
        radius: params.radius,
        dps: params.dps,
        t: 0,
        duration: params.duration,
        element: params.element,
        slow: params.slow,
        kind: params.element === 'fire' ? 'flame' : params.element === 'ice' ? 'frost' : 'ground',
      });
      spawnVfx({ x: target.x, y: target.y, life: 0.35, kind: 'ring', color: ELEMENT_COLORS[params.element], size: params.radius });
    },
    strikeColumn: (params) => {
      state.timedStrikes.push({ ...params, t: 0, kind: 'column' });
    },
    flamePillar: (params) => {
      state.timedStrikes.push({
        t: 0,
        delay: params.delay,
        damage: params.damage,
        element: 'fire',
        radius: params.radius,
        stunDur: 0,
        chainToExtra: 0,
        kind: 'flame',
        duration: params.duration,
        burnDps: params.burnDps,
        burnDur: params.burnDur,
      });
    },
    frostBurst: (params) => {
      doPulse(params.radius, params.damage, 'ice', run, 20);
      for (const e of state.enemies) {
        if (!e.alive || e.state === 'die') continue;
        const dx = e.x - PLAYER_X;
        const dy = e.y - PLAYER_Y;
        if (dx * dx + dy * dy <= params.radius * params.radius) {
          const freezeDur = params.freezeDur * baubleMul(collectBaubleStats(run).freezeDurationMul);
          e.freeze = Math.max(e.freeze, freezeDur);
          e.slow = Math.max(e.slow, params.slow);
          e.slowT = Math.max(e.slowT, freezeDur + 0.8);
        }
      }
      spawnVfx({ x: PLAYER_X, y: PLAYER_Y - 8, life: 0.55, kind: 'freeze', color: palHex('q')!, size: params.radius });
    },
    chainLightning: (params) => {
      doChainLightning(params, run);
    },
    summonMinion: (params) => {
      spawnMinions(params);
    },
    startReflect: (params) => {
      state.reflect = { t: 0, duration: params.duration, multiplier: params.multiplier, radius: params.radius };
      spawnVfx({ x: PLAYER_X, y: PLAYER_Y - 6, life: 0.4, kind: 'shield', color: palHex('q')!, size: 14 });
    },
    playAnim: (animId, x, y, intens) => {
      playAnimationSpec(animId, x, y, intens);
    },
  });
}

function playAnimationSpec(animId: string | undefined, x: number, y: number, intens: TierIntensity): void {
  if (!animId) return;
  const spec = getAnimationSpec(animId);
  if (!spec) return;
  const color = spec.color;
  const sz = spec.size * intens.scale;
  const life = spec.duration;
  const kinds = spec.kind;
  if (kinds === 'burst') {
    spawnVfx({ x, y, life, kind: 'explosion', color, size: sz });
    const n = Math.max(1, Math.floor(spec.particles * intens.particles));
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * Math.PI * 2 + state.rng() * 0.4;
      const sp = 40 + state.rng() * 40;
      spawnVfx({ x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, life: life * 0.9, kind: 'spark', color: spec.secondaryColor ?? color, size: Math.max(1, sz * 0.3) });
    }
  } else if (kinds === 'pulse') {
    spawnVfx({ x, y, life, kind: 'ring', color, size: sz });
    if (spec.secondaryColor) spawnVfx({ x, y, life: life * 0.8, kind: 'ring', color: spec.secondaryColor, size: sz * 0.7 });
  } else if (kinds === 'aura' || kinds === 'glow') {
    spawnVfx({ x, y, life, kind: 'ring', color, size: sz });
    const n = Math.max(1, Math.floor(spec.particles * intens.particles * 0.5));
    for (let i = 0; i < n; i++) {
      const ang = state.rng() * Math.PI * 2;
      spawnVfx({ x, y, vx: Math.cos(ang) * 20, vy: Math.sin(ang) * 20, life: life * 0.7, kind: 'spark', color: spec.secondaryColor ?? color, size: 2 });
    }
  } else if (kinds === 'beam') {
    // handled by doBeam; fallback fires a short spark
    spawnVfx({ x, y, life, kind: 'spark', color, size: sz });
  } else if (kinds === 'trail') {
    spawnVfx({ x, y, life, kind: 'trail', color, size: Math.max(1, sz * 0.5) });
  } else if (kinds === 'columns') {
    for (let i = 0; i < 3; i++) {
      const ox = (i - 1) * 18;
      spawnVfx({ x: x + ox, y, life, kind: 'lightning', color, size: sz, data: encodePos(x + ox, HUD_H + 2) });
      spawnVfx({ x: x + ox, y, life: life * 0.7, kind: 'explosion', color, size: sz });
    }
  } else {
    spawnVfx({ x, y, life, kind: 'spark', color, size: sz });
  }
  if (spec.shake) addTrauma(spec.shake * intens.brightness);
}

export function playRelicAnimation(animId: string | undefined, x = PLAYER_X, y = PLAYER_Y - 8, scale = 1.8): void {
  playAnimationSpec(animId, x, y, { scale, particles: 1.5, brightness: 1.25 });
}

function spawnOrbiters(params: { count: number; radius: number; rpm: number; damage: number; duration: number; pierce: number; element: Element; face: Face }): void {
  const cx = PLAYER_X;
  const cy = PLAYER_Y - 4;
  const omega = (params.rpm / 60) * Math.PI * 2;
  const ch = getCharacter(state.run!.characterId);
  const archetype = ch?.baseProjectile ?? DEFAULT_PROJECTILE_ARCHETYPE;
  for (let i = 0; i < params.count; i++) {
    const p = acquire(state.projectiles, makeProjectile);
    resetProjectile(p);
    const angle = (i / params.count) * Math.PI * 2;
    p.x = cx + Math.cos(angle) * params.radius;
    p.y = cy + Math.sin(angle) * params.radius;
    p.vx = 0;
    p.vy = 0;
    p.radius = archetype.radius;
    p.damage = params.damage;
    p.maxAge = params.duration;
    p.element = params.element;
    p.color = ELEMENT_COLORS[params.element as 'none'] ?? archetype.baseColor;
    p.sourceFaceValue = params.face.value;
    p.archetype = archetype;
    p.pierce = 9999;
    p.rotation = angle;
    p.orbit = {
      angle,
      radius: params.radius,
      omega,
      cx,
      cy,
      ttl: params.duration,
      reHitTimers: new Map<number, number>(),
    };
  }
}

function doBeam(params: { width: number; dps: number; duration: number; pierce: number; element: Element; lifesteal: number; face: Face; baseDamage: number }, run: RunState): void {
  const total = params.dps * params.duration + params.baseDamage;
  const originX = PLAYER_X;
  const originY = PROJECTILE_SPAWN_Y;
  const topY = HUD_H + 4;
  const target = findNearestEnemyXY(state.enemies);
  let dirX = 0;
  let dirY = -1;
  if (target) {
    const dx = target.x - originX;
    const dy = target.y - originY;
    const len = Math.hypot(dx, dy);
    if (len > 0.001) {
      dirX = dx / len;
      dirY = dy / len;
    }
  }

  const reachCandidates: number[] = [];
  if (dirY < -0.001) reachCandidates.push((topY - originY) / dirY);
  if (dirX > 0.001) reachCandidates.push((ARENA_W - originX) / dirX);
  else if (dirX < -0.001) reachCandidates.push((0 - originX) / dirX);
  const maxReach = Math.min(...reachCandidates.filter((t) => t > 0));
  const beamReach = Number.isFinite(maxReach) ? maxReach : originY - topY;
  const sortedEnemies = state.enemies
    .filter((e) => e.alive && e.state !== 'die')
    .map((enemy) => {
      const dx = enemy.x - originX;
      const dy = enemy.y - originY;
      const along = dx * dirX + dy * dirY;
      const closestX = originX + dirX * along;
      const closestY = originY + dirY * along;
      const dist = Math.hypot(enemy.x - closestX, enemy.y - closestY);
      return { enemy, along, dist };
    })
    .filter(({ enemy, along, dist }) => along >= -enemy.radius && along <= beamReach + enemy.radius && dist <= params.width / 2 + enemy.radius)
    .sort((a, b) => a.along - b.along);

  const maxHits = Math.max(1, Math.floor(params.pierce) + 1);
  const hitCount = Math.min(maxHits, sortedEnemies.length);
  let farthestAlong = 0;
  for (let i = 0; i < hitCount; i++) {
    const e = sortedEnemies[i]!.enemy;
    const damaged = hitEnemy(e, total, params.element, run, undefined, { source: 'beam', face: params.face });
    if (damaged && params.lifesteal > 0) {
      run.hp = Math.min(run.maxHp, run.hp + baubleHealingAmount(run, params.lifesteal));
    }
    farthestAlong = Math.max(farthestAlong, sortedEnemies[i]!.along);
  }

  const endAlong = Math.max(farthestAlong, Math.min(beamReach, target ? Math.hypot(target.x - originX, target.y - originY) : beamReach));
  const endX = originX + dirX * endAlong;
  const endY = originY + dirY * endAlong;
  for (let t = 0; t < endAlong; t += 12) {
    spawnVfx({ x: originX + dirX * t, y: originY + dirY * t, life: params.duration * 0.8, kind: 'spark', color: ELEMENT_COLORS[params.element as 'none'] ?? '#fff', size: Math.max(2, params.width / 4) });
  }
  spawnVfx({ x: originX, y: originY, life: params.duration, kind: 'lightning', color: ELEMENT_COLORS[params.element as 'none'] ?? '#fff', size: 0, data: encodePos(endX, Math.max(0, endY)) });
  addTrauma(0.1);
  playSfx('pulse');
}

function tickPullZones(dt: number, run: RunState): void {
  for (let i = state.pullZones.length - 1; i >= 0; i--) {
    const pz = state.pullZones[i]!;
    pz.t += dt;
    if (pz.t >= pz.duration) {
      state.pullZones.splice(i, 1);
      continue;
    }
    const r2 = pz.radius * pz.radius;
    for (const e of state.enemies) {
      if (!e.alive || e.state === 'die') continue;
      const dx = pz.x - e.x;
      const dy = pz.y - e.y;
      const d2 = dx * dx + dy * dy;
      if (d2 > r2) continue;
      const d = Math.sqrt(d2) || 1;
      const falloff = 1 - Math.min(1, d / pz.radius);
      const pull = pz.strength * falloff * dt;
      e.x += (dx / d) * pull;
      e.y += (dy / d) * pull;
      if (pz.dps > 0) {
        hitEnemy(e, pz.dps * dt, pz.element, run, undefined, { source: 'pull' });
      }
    }
    if (Math.floor(pz.t * 8) !== Math.floor((pz.t - dt) * 8)) {
      spawnVfx({ x: pz.x, y: pz.y, life: 0.2, kind: 'ring', color: ELEMENT_COLORS[pz.element as 'none'] ?? '#fff', size: pz.radius * (0.6 + state.rng() * 0.4) });
    }
  }
}

function tickGroundZones(dt: number, run: RunState): void {
  for (let i = state.groundZones.length - 1; i >= 0; i--) {
    const z = state.groundZones[i]!;
    z.t += dt;
    if (z.t >= z.duration) {
      state.groundZones.splice(i, 1);
      continue;
    }
    const r2 = z.radius * z.radius;
    for (const e of state.enemies) {
      if (!e.alive || e.state === 'die') continue;
      const dx = e.x - z.x;
      const dy = e.y - z.y;
      if (dx * dx + dy * dy > r2) continue;
      if (z.dps > 0) hitEnemy(e, z.dps * dt, z.element, run, undefined, { source: 'ground' });
      if (z.slow > 0) {
        e.slow = Math.max(e.slow, z.slow);
        e.slowT = Math.max(e.slowT, 0.2);
      }
      if (z.burnDps && z.burnDur) {
        if (z.burnDps >= e.poisonDps) e.data['dotKind'] = 2;
        e.poisonDps = Math.max(e.poisonDps, z.burnDps);
        e.poisonT = Math.max(e.poisonT, z.burnDur);
      }
    }
    const waveRate = z.kind === 'ground' ? 3 : 10;
    const waveLife = z.kind === 'ground' ? 0.45 : 0.28;
    if (Math.floor(z.t * waveRate) !== Math.floor((z.t - dt) * waveRate)) {
      spawnVfx({
        x: z.x,
        y: z.y,
        life: waveLife,
        kind: z.kind === 'flame' ? 'flamePillar' : z.kind === 'frost' ? 'freeze' : 'ring',
        color: ELEMENT_COLORS[z.element],
        size: z.radius,
      });
    }
  }
}

function tickTimedStrikes(dt: number, run: RunState): void {
  for (let i = state.timedStrikes.length - 1; i >= 0; i--) {
    const s = state.timedStrikes[i]!;
    s.t += dt;
    if (s.t < s.delay) continue;
    state.timedStrikes.splice(i, 1);
    const target = findNearestEnemyXY(state.enemies) ?? { x: PLAYER_X, y: PLAYER_Y - 34 };
    if (s.kind === 'flame') {
      spawnFlameZone(target.x, target.y, s, run);
    } else {
      strikeAt(target.x, target.y, s, run);
    }
  }
}

function tickPendingPulses(dt: number, run: RunState): void {
  for (let i = state.pendingPulses.length - 1; i >= 0; i--) {
    const p = state.pendingPulses[i]!;
    p.t += dt;
    if (p.t < p.delay) continue;
    doPulse(p.radius, p.damage, p.element, run, p.knockback);
    state.pendingPulses.splice(i, 1);
  }
}

function strikeAt(x: number, y: number, s: TimedStrike, run: RunState): void {
  spawnVfx({ x, y, life: 0.35, kind: 'lightning', color: ELEMENT_COLORS[s.element], size: s.radius, data: encodePos(x, HUD_H + 2) });
  spawnVfx({ x, y, life: 0.3, kind: 'explosion', color: ELEMENT_COLORS[s.element], size: s.radius * 1.5 });
  addTrauma(0.12);
  let hitCount = 0;
  for (const e of state.enemies) {
    if (!e.alive || e.state === 'die') continue;
    const dx = e.x - x;
    const dy = e.y - y;
    if (dx * dx + dy * dy > s.radius * s.radius) continue;
    hitEnemy(e, s.damage, s.element, run, undefined, { source: 'strike' });
    if (s.stunDur > 0) {
      e.freeze = Math.max(e.freeze, s.stunDur * baubleMul(collectBaubleStats(run).stunDurationMul));
    }
    hitCount++;
  }
  if (s.chainToExtra > 0 && hitCount > 0) {
    doChainLightning({ jumps: s.chainToExtra, damage: s.damage * 0.35, radius: 70, stunDur: s.stunDur, element: s.element, fromDie: false }, run);
  }
  playSfx('pulse');
}

function spawnFlameZone(x: number, y: number, s: TimedStrike, run: RunState): void {
  spawnVfx({ x, y, life: Math.max(0.35, s.duration ?? 0.6), kind: 'flamePillar', color: palHex('u')!, size: s.radius });
  state.groundZones.push({
    x,
    y,
    radius: s.radius,
    dps: s.duration && s.duration > 0 ? s.damage / s.duration : s.damage,
    t: 0,
    duration: s.duration ?? 0.8,
    element: 'fire',
    slow: 0,
    kind: 'flame',
    burnDps: s.burnDps,
    burnDur: s.burnDur,
  });
  for (const e of state.enemies) {
    if (!e.alive || e.state === 'die') continue;
    const dx = e.x - x;
    const dy = e.y - y;
    if (dx * dx + dy * dy <= s.radius * s.radius) hitEnemy(e, s.damage, 'fire', run, undefined, { source: 'strike' });
  }
}

function doChainLightning(
  params: { jumps: number; damage: number; radius: number; stunDur: number; element: Element; fromDie: boolean },
  run: RunState,
): void {
  const stats = collectBaubleStats(run);
  const radius = params.radius * baubleMul(stats.chainRangeMul);
  const stunDur = params.stunDur * baubleMul(stats.stunDurationMul);
  const used = new Set<number>();
  let fromX = params.fromDie ? PLAYER_X : PLAYER_X;
  let fromY = params.fromDie ? DIE_Y : PLAYER_Y - 16;
  for (let i = 0; i < params.jumps; i++) {
    const next = findNearestEnemy(fromX, fromY, used);
    if (!next) break;
    const dx = next.x - fromX;
    const dy = next.y - fromY;
    if (dx * dx + dy * dy > radius * radius && used.size > 0) break;
    drawChainLightning(fromX, fromY, next.x, next.y);
    hitEnemy(next, params.damage * Math.pow(0.82, i), params.element, run, undefined, { source: 'chain' });
    if (stunDur > 0) {
      next.freeze = Math.max(next.freeze, stunDur);
      next.slow = Math.max(next.slow, 0.45);
      next.slowT = Math.max(next.slowT, stunDur + 0.3);
    }
    next.charged = Math.max(next.charged, 1.5);
    used.add(next.id);
    fromX = next.x;
    fromY = next.y;
  }
  if (used.size > 0) {
    addTrauma(0.08);
    playSfx('hit');
  }
}

function spawnMinions(params: { kind: 'bone' | 'wraith' | 'spirit' | 'ember'; count: number; hp: number; duration: number; damagePerHit: number; face: Face; baseDamage: number; trigger: 'onResolve' | 'onKill' | 'onProjectileExpire' }): void {
  const ch = getCharacter(state.run!.characterId);
  const archetype = ch?.baseProjectile ?? DEFAULT_PROJECTILE_ARCHETYPE;
  const minionColors: Record<typeof params.kind, string> = {
    bone: palHex('d')!,
    wraith: palHex('H')!,
    spirit: palHex('q')!,
    ember: palHex('u')!,
  };
  const color = minionColors[params.kind] ?? palHex('c')!;
  for (let i = 0; i < params.count; i++) {
    const p = acquire(state.projectiles, makeProjectile);
    resetProjectile(p);
    const ang = -Math.PI / 2 + (i - (params.count - 1) / 2) * 0.3 + (state.rng() - 0.5) * 0.2;
    const speed = BALANCE.combat.projectileSpeed * 0.55;
    p.x = PLAYER_X + (state.rng() - 0.5) * 8;
    p.y = PROJECTILE_SPAWN_Y;
    p.vx = Math.cos(ang) * speed;
    p.vy = Math.sin(ang) * speed;
    p.radius = archetype.radius + 0.5;
    p.damage = params.damagePerHit + params.baseDamage * 0.35;
    p.maxAge = params.duration;
    p.element = params.face.element;
    p.color = color;
    p.sourceFaceValue = params.face.value;
    p.archetype = archetype;
    p.pierce = Math.max(1, Math.floor(params.hp / 20));
    p.homing = true;
    p.minion = true;
    p.rotation = ang;
  }
}

function applyEnemyStatus(
  e: Enemy,
  status: 'burn' | 'poison' | 'slow' | 'freeze' | 'stun' | 'mark',
  power: number,
  duration: number,
): void {
  const stats = collectBaubleStats(state.run);
  if (status === 'burn' || status === 'poison') {
    const dpsMul = status === 'poison' ? baubleMul(stats.poisonApplicationDpsMul) : 1;
    const durationMul = status === 'poison' ? baubleMul(stats.poisonDurationMul) : 1;
    const dps = power * dpsMul;
    if (dps >= e.poisonDps) e.data['dotKind'] = status === 'burn' ? 2 : 1;
    e.poisonDps = Math.max(e.poisonDps, dps);
    e.poisonT = Math.max(e.poisonT, duration * durationMul);
  } else if (status === 'freeze' || status === 'stun') {
    const durationMul = baubleMul(status === 'freeze' ? stats.freezeDurationMul : stats.stunDurationMul);
    const adjustedDuration = duration * durationMul;
    e.freeze = Math.max(e.freeze, adjustedDuration);
    if (status === 'freeze') e.slowT = Math.max(e.slowT, adjustedDuration + 0.5);
  } else if (status === 'slow') {
    e.slow = Math.max(e.slow, Math.min(0.85, power));
    e.slowT = Math.max(e.slowT, duration);
  } else if (status === 'mark') {
    e.voidMark = Math.max(e.voidMark, power);
  }
  e.hitFlash = Math.max(e.hitFlash, 0.15);
}

function spawnProjectile(x: number, y: number, dx: number, dy: number, damage: number, face: Face): Projectile {
  const run = state.run!;
  const ch = getCharacter(run.characterId);
  const archetype = ch?.baseProjectile ?? DEFAULT_PROJECTILE_ARCHETYPE;
  const p = acquire(state.projectiles, makeProjectile);
  resetProjectile(p);
  const len = Math.hypot(dx, dy) || 1;
  const stats = collectBaubleStats(run);
  const speed = BALANCE.combat.projectileSpeed * (archetype.speedMul ?? 1) * baubleMul(stats.projectileSpeedMul);
  p.x = x;
  p.y = y;
  p.vx = (dx / len) * speed;
  p.vy = (dy / len) * speed;
  p.radius = archetype.radius * baubleMul(stats.projectileRadiusMul);
  p.damage = damage * baubleMul(stats.projectileDamageMul);
  p.maxAge = BALANCE.combat.projectileLife * (archetype.lifeMul ?? 1) * baubleMul(stats.projectileLifetimeMul);
  p.element = face.element;
  p.color = deriveProjectileColor(face);
  p.sourceFaceValue = face.value;
  p.archetype = archetype;
  p.pierce = archetype.basePierce ?? 0;
  p.aoeOnHit = archetype.baseAoeOnHit ?? 0;
  p.homing = archetype.baseHoming ?? false;
  p.lifesteal = archetype.baseLifesteal ?? 0;
  const m = face.modifiers;
  if (m) {
    p.pierce += m.pierce ?? 0;
    p.bounces += m.bounce ?? 0;
    p.chain += m.chain ?? 0;
    p.split += m.split ?? 0;
    p.homing = p.homing || (m.homing ?? false);
    p.aoeOnHit = Math.max(p.aoeOnHit, m.aoeOnHit ?? 0);
    p.lifesteal += m.lifesteal ?? 0;
  }
  p.rotation = archetype.rotate === 'velocity' ? Math.atan2(p.vy, p.vx) : state.rng() * Math.PI * 2;
  archetype.onSpawn?.(p, face, run, state.rng);
  onProjectileSpawn(envFor(run), p, face);
  const baubleCrit = stats.projectileCritChance + (p.element === 'fire' ? stats.fireProjectileCritChance : 0);
  if (baubleCrit > 0) p.critChance = Math.min(0.85, (p.critChance ?? 0) + baubleCrit);
  const muzAngle = Math.atan2(dy, dx);
  spawnVfx({ x, y, vx: Math.cos(muzAngle) * 40, vy: Math.sin(muzAngle) * 40, life: 0.12, kind: 'muzzle', color: p.color, size: 2, angle: muzAngle });
  return p;
}

function updateProjectile(p: Projectile, dt: number, run: RunState): void {
  p.age += dt;
  if (p.age > p.maxAge) {
    p.alive = false;
    return;
  }
  if (p.orbit) {
    const ob = p.orbit;
    ob.angle += ob.omega * dt;
    p.x = ob.cx + Math.cos(ob.angle) * ob.radius;
    p.y = ob.cy + Math.sin(ob.angle) * ob.radius;
    p.rotation = ob.angle + Math.PI / 2;
    p.trail.push({ x: p.x, y: p.y, a: 1 });
    if (p.trail.length > 6) p.trail.shift();
    for (let i = 0; i < p.trail.length; i++) {
      p.trail[i]!.a = (i + 1) / p.trail.length;
    }
    if (ob.reHitTimers) {
      for (const [eid, t] of ob.reHitTimers) {
        const nt = t - dt;
        if (nt <= 0) ob.reHitTimers.delete(eid);
        else ob.reHitTimers.set(eid, nt);
      }
    }
    for (const e of state.enemies) {
      if (!e.alive || e.state === 'die') continue;
      if (ob.reHitTimers?.has(e.id)) continue;
      const dx = e.x - p.x;
      const dy = e.y - p.y;
      const r = e.radius + p.radius;
      if (dx * dx + dy * dy <= r * r) {
        hitEnemy(e, p.damage, p.element, run, p, { source: 'orbit', projectile: p });
        ob.reHitTimers?.set(e.id, 0.35);
      }
    }
    return;
  }
  if (p.homing) {
    const target = findNearestEnemy(p.x, p.y, p.hitIds);
    if (target) {
      const dx = target.x - p.x;
      const dy = target.y - p.y;
      const len = Math.hypot(dx, dy) || 1;
      const speed = Math.hypot(p.vx, p.vy);
      const tx = (dx / len) * speed;
      const ty = (dy / len) * speed;
      p.vx += (tx - p.vx) * 0.12;
      p.vy += (ty - p.vy) * 0.12;
    }
  }
  p.trail.push({ x: p.x, y: p.y, a: 1 });
  if (p.trail.length > 6) p.trail.shift();
  for (let i = 0; i < p.trail.length; i++) {
    p.trail[i]!.a = (i + 1) / p.trail.length;
  }
  p.x += p.vx * dt;
  p.y += p.vy * dt;

  if (p.animTrailId) {
    const spec = getAnimationSpec(p.animTrailId);
    if (spec && state.rng() < Math.min(1, (spec.particles ?? 2) * dt * 8)) {
      spawnVfx({ x: p.x, y: p.y, life: (spec.duration ?? 0.2) * 0.6, kind: 'trail', color: spec.color, size: Math.max(1, spec.size * 0.25) });
    }
  }

  if (p.tags.size > 0) tickProjectileTags(p, dt, run);

  const arc = p.archetype;
  if (arc) {
    if (arc.rotate === 'velocity') p.rotation = Math.atan2(p.vy, p.vx);
    else if (arc.rotate === 'spin') p.rotation += (arc.rotateSpeed ?? 8) * dt;
  }

  if (p.x < 0) {
    if (p.bounces > 0) {
      p.vx = Math.abs(p.vx);
      p.bounces--;
    } else p.alive = false;
  } else if (p.x > ARENA_W) {
    if (p.bounces > 0) {
      p.vx = -Math.abs(p.vx);
      p.bounces--;
    } else p.alive = false;
  }
  if (p.y < HUD_H) {
    if (p.bounces > 0) {
      p.vy = Math.abs(p.vy);
      p.bounces--;
    } else p.alive = false;
  } else if (p.y > CANVAS_H) {
    p.alive = false;
  }

  if (!p.alive) return;

  for (const e of state.enemies) {
    if (!e.alive || e.state === 'die') continue;
    if (p.hitIds.has(e.id)) continue;
    const dx = e.x - p.x;
    const dy = e.y - p.y;
    const r = e.radius + p.radius;
    if (dx * dx + dy * dy <= r * r) {
      if (e.typeId === 'absorber') {
        const extra = p.damage;
        e.absorbed += extra;
        if (e.absorbed >= 45 + run.wave * 4) {
          e.hp -= e.absorbed * 0.75;
          e.hitFlash = 0.2;
          spawnPopup(e.x, e.y - 8, 'OVERLOAD', palHex('y')!, 9);
          spawnVfx({ x: e.x, y: e.y, life: 0.45, kind: 'explosion', color: palHex('y')!, size: 18 });
          doPulseAt(e.x, e.y, 42, e.absorbed * 0.35, 'arcane', run);
          p.alive = false;
          if (e.hp <= 0) killEnemy(e, run, p);
          return;
        }
        e.hp = Math.min(e.maxHp + 40, e.hp + extra * 0.5);
        e.maxHp = Math.max(e.maxHp, e.hp);
        e.hitFlash = 0.1;
        spawnPopup(e.x, e.y - 6, '+hp', '#6ae07a', 8);
        playSfx('hit');
        p.alive = false;
        return;
      }
      if (e.typeId === 'reflector' && !p.hitIds.has(-1)) {
        p.hitIds.add(-1);
        p.vx = -p.vx;
        p.vy = -p.vy;
        spawnVfx({ x: p.x, y: p.y, life: 0.2, kind: 'spark', color: palHex('q')!, size: 2 });
        playSfx('reflect');
        continue;
      }
      p.hitIds.add(e.id);
      p.archetype?.onHit?.(p, e, run);
      let hitDamage = p.damage;
      const baubleCrit = e.freeze > 0 ? collectBaubleStats(run).frozenCritChance : 0;
      const critChance = Math.min(0.85, (p.critChance ?? 0) + baubleCrit);
      if (critChance > 0 && state.rng() < critChance) {
        hitDamage *= 2.35;
        spawnPopup(e.x, e.y - 18, 'CRIT', palHex('y')!, 9);
        spawnVfx({ x: e.x, y: e.y, life: 0.28, kind: 'reaction', color: palHex('y')!, size: 8 });
      }
      const damaged = hitEnemy(e, hitDamage, p.element, run, p, { source: 'projectile', projectile: p });
      if (!damaged) {
        if (p.pierce > 0) p.pierce--;
        else p.alive = false;
        if (!p.alive) return;
        continue;
      }
      if ((p.burnDps ?? 0) > 0) {
        if ((p.burnDps ?? 0) >= e.poisonDps) e.data['dotKind'] = 2;
        e.poisonDps = Math.max(e.poisonDps, p.burnDps ?? 0);
        e.poisonT = Math.max(e.poisonT, p.burnDur ?? 2);
        spawnVfx({ x: e.x, y: e.y, life: 0.35, kind: 'flamePillar', color: palHex('u')!, size: Math.max(8, e.radius) });
      }
      onProjectileHit(envFor(run), p, e);
      if (p.aoeOnHit > 0) {
        doPulseAt(p.x, p.y, p.aoeOnHit, p.damage * 0.6, p.element, run);
      }
      if (p.chain > 0) {
        const next = findNearestEnemy(p.x, p.y, p.hitIds);
        if (next) {
          const dx2 = next.x - p.x;
          const dy2 = next.y - p.y;
          const ang = Math.atan2(dy2, dx2);
          p.vx = Math.cos(ang) * BALANCE.combat.projectileSpeed;
          p.vy = Math.sin(ang) * BALANCE.combat.projectileSpeed;
          drawChainLightning(p.x, p.y, next.x, next.y);
          p.chain--;
        }
      }
      if (p.split > 0) {
        const splitAng = Math.atan2(p.vy, p.vx);
        const speed = Math.hypot(p.vx, p.vy);
        for (const off of [-0.4, 0.4]) {
          const np = acquire(state.projectiles, makeProjectile);
          Object.assign(np, p);
          np.hitIds = new Set();
          np.trail = [];
          np.split = 0;
          np.vx = Math.cos(splitAng + off) * speed;
          np.vy = Math.sin(splitAng + off) * speed;
          np.alive = true;
          np.age = 0;
        }
        p.split = 0;
      }
      if (p.lifesteal > 0) {
        run.hp = Math.min(run.maxHp, run.hp + baubleHealingAmount(run, p.lifesteal));
        spawnHealParticle();
      }
      if (p.pierce > 0) {
        p.pierce--;
      } else {
        p.alive = false;
        return;
      }
    }
  }
}

export function hitEnemy(
  e: Enemy,
  damage: number,
  element: string,
  run: RunState,
  p?: Projectile,
  ctx?: DamageContext,
): boolean {
  const damageCtx = normalizeDamageContext(element, p, ctx);
  if (!canDamageEnemy(e, damageCtx)) {
    showImmuneFeedback(e, damageCtx);
    return false;
  }
  let dmg = damage * BALANCE.combat.globalDamageMul;
  const mutator = getRunMutator(run.runMutatorId);
  dmg *= mutator?.modifiers.playerDamageMul ?? 1;
  const faceValue = damageCtx.face?.value ?? 0;
  if (faceValue >= 5) dmg *= mutator?.modifiers.highRollDamageMul ?? 1;
  const mom = run.momentum ?? 0;
  if (mom > 0) dmg *= 1 + Math.min(0.6, mom * 0.04);
  if (e.corrode > 0) dmg *= 1 + Math.min(0.75, e.corrode * 0.12);
  if (e.charged > 0 && element === 'lightning') dmg *= 1.3;
  if (e.voidMark > 0) {
    const bonus = e.voidMark * 10;
    dmg += bonus;
    spawnVfx({ x: e.x, y: e.y, life: 0.35, kind: 'reaction', color: palHex('v')!, size: 10 });
    spawnPopup(e.x, e.y - 18, `VOID +${bonus | 0}`, palHex('v')!, 9);
    e.voidMark = 0;
  }
  const type = getEnemyType(e.typeId);
  if (e.typeId === 'tank') {
    if ((damageCtx.source === 'projectile' || damageCtx.source === 'orbit') && faceValue < 5) {
      dmg *= 0.68;
    } else if (damageCtx.source === 'pulse' || damageCtx.source === 'beam') {
      dmg *= 1.15;
    }
  }
  if (e.typeId === 'reflectorboss' && e.data['mirrorShield']) {
    if (damageCtx.source === 'pulse' || damageCtx.source === 'beam') {
      dmg *= 1.25;
      spawnPopup(e.x, e.y - 18, 'CRACK', palHex('q')!, 9);
    } else {
      dmg *= 0.25;
      spawnPopup(e.x, e.y - 18, 'MIRROR', palHex('C')!, 9);
      if (p) {
        p.vx = -p.vx;
        p.vy = Math.abs(p.vy);
        p.hitIds.add(-3);
      }
    }
  }
  if (e.eliteKind === 'armored' && !e.isBoss) dmg *= 0.85;
  dmg = applyBaubleDamageModifiers(dmg, e, element, run, damageCtx);
  e.hp -= dmg;
  e.hitFlash = 0.12;
  const trauma = damageTraumaForSource(damageCtx.source);
  if (trauma > 0) addTrauma(trauma);
  spawnVfx({ x: e.x, y: e.y, life: 0.24, kind: 'spark', color: ELEMENT_COLORS[element as 'none'] ?? '#fff', size: 2 });
  spawnPopup(e.x, e.y - 8, Math.floor(dmg).toString(), popupColor(dmg), dmg > 25 ? 10 : 8);
  if (element === 'fire') {
    e.poisonT = Math.max(e.poisonT, 2);
    const fireDps = elementalDotDps('fire', dmg);
    if (fireDps >= e.poisonDps) e.data['dotKind'] = 2;
    e.poisonDps = Math.max(e.poisonDps, fireDps);
  } else if (element === 'poison') {
    const stats = collectBaubleStats(run);
    const poisonDps = elementalDotDps('poison', dmg) * baubleMul(stats.poisonApplicationDpsMul);
    if (poisonDps >= e.poisonDps) e.data['dotKind'] = 1;
    e.poisonT = Math.max(e.poisonT, 3 * baubleMul(stats.poisonDurationMul));
    e.poisonDps = Math.max(e.poisonDps, poisonDps);
  } else if (element === 'ice') {
    const freezeDur = 1.2 * baubleMul(collectBaubleStats(run).freezeDurationMul);
    e.freeze = Math.max(e.freeze, freezeDur);
    e.slow = Math.max(e.slow, 0.5);
    e.slowT = Math.max(e.slowT, freezeDur + 0.4);
  } else if (element === 'lightning') {
    const stunDur = BALANCE.combat.lightningStunT * baubleMul(collectBaubleStats(run).stunDurationMul);
    e.freeze = Math.max(e.freeze, stunDur);
    e.slow = Math.max(e.slow, 0.6);
    e.slowT = Math.max(e.slowT, stunDur + 0.45);
    const exclude = new Set<number>([e.id]);
    const next = findNearestEnemy(e.x, e.y, exclude);
    if (next) {
      drawChainLightning(e.x, e.y, next.x, next.y);
      const chainDmg = dmg * BALANCE.combat.lightningChainDamageMul;
      hitEnemy(next, chainDmg, 'none', run, undefined, { source: 'chain', face: damageCtx.face });
    }
  }
  if (e.chill >= 2 && e.hp > 0) {
    e.chill = 0;
    const freezeDur = 1.5 * baubleMul(collectBaubleStats(run).freezeDurationMul);
    e.freeze = Math.max(e.freeze, freezeDur);
    e.slow = Math.max(e.slow, 0.65);
    e.slowT = Math.max(e.slowT, freezeDur + 0.5);
    spawnVfx({ x: e.x, y: e.y, life: 0.4, kind: 'freeze', color: palHex('q')!, size: 8 });
  }
  if (e.radiance >= 5 && e.hp > 0) {
    const exec = e.maxHp * 0.22 * BALANCE.combat.globalDamageMul;
    e.hp -= exec;
    spawnPopup(e.x, e.y - 22, `RADIANT -${exec | 0}`, palHex('y')!, 10);
    spawnVfx({ x: e.x, y: e.y, life: 0.45, kind: 'ring', color: palHex('y')!, size: 14 });
    e.radiance = 0;
  }
  if (p) type?.onHit?.(e, p);
  if (shouldPlayHitSfx(damageCtx.source)) playSfx('hit');
  if (e.hp <= 0) killEnemy(e, run, p);
  return true;
}

function damageTraumaForSource(source: DamageContext['source']): number {
  switch (source) {
    case 'ground':
    case 'pull':
    case 'status':
      return 0;
    default:
      return 0.06;
  }
}

function shouldPlayHitSfx(source: DamageContext['source']): boolean {
  switch (source) {
    case 'ground':
    case 'pull':
    case 'status':
      return false;
    default:
      return true;
  }
}

function normalizeDamageContext(element: string, p?: Projectile, ctx?: DamageContext): DamageContext {
  if (ctx?.face) return ctx;
  if (p) {
    return {
      ...ctx,
      source: ctx?.source ?? (p.orbit ? 'orbit' : p.minion ? 'minion' : 'projectile'),
      projectile: p,
      face: {
        value: p.sourceFaceValue,
        kind: 'SHOT',
        element: (p.element as Element) ?? 'none',
      },
    };
  }
  if (state.lastRolled) {
    return { ...ctx, source: ctx?.source ?? 'unknown', face: state.lastRolled };
  }
  return {
    ...ctx,
    source: ctx?.source ?? 'unknown',
    face: { value: 3, kind: 'SHOT', element: (element as Element) ?? 'none' },
  };
}

function canDamageEnemy(e: Enemy, ctx: DamageContext): boolean {
  const type = getEnemyType(e.typeId);
  if (!type?.damageFilter || !ctx.face) return true;
  return type.damageFilter({ face: ctx.face, dieId: ctx.dieId ?? '' });
}

function showImmuneFeedback(e: Enemy, ctx: DamageContext): void {
  if (ctx.source === 'status') return;
  spawnPopup(e.x, e.y - 6, 'IMM', '#9fa7bd', 8);
  spawnVfx({ x: e.x, y: e.y, life: 0.2, kind: 'spark', color: '#9fa7bd', size: 1 });
}

function applyBaubleDamageModifiers(
  dmg: number,
  e: Enemy,
  element: string,
  run: RunState,
  damageCtx: DamageContext,
): number {
  const stats = collectBaubleStats(run);
  let additive = stats.allDamageMul;
  if (e.freeze > 0) additive += stats.damageToFrozenMul;
  if (e.slow > 0 || e.chill > 0) additive += stats.damageToSlowedMul;
  if (e.poisonT > 0 && e.poisonDps > 0) {
    additive += stats.damageToPoisonedMul + stats.damageToBurningMul;
  }
  if (e.elite || e.isBoss) additive += stats.damageToEliteBossMul;
  if (run.hp <= run.maxHp * 0.5) additive += stats.lowHpDamageMul;
  if (damageCtx.face && damageCtx.face.value <= 2) additive += stats.lowFaceDamageMul;
  if (damageCtx.face && damageCtx.face.value >= 5) additive += stats.highFaceDamageMul;
  if (element === 'fire') additive += stats.fireDamageMul;
  if (element === 'lightning') additive += stats.lightningDamageMul;
  if (element === 'arcane') additive += stats.arcaneDamageMul;
  if (damageCtx.source === 'chain') additive += stats.chainDamageMul;
  if (damageCtx.source === 'pulse') additive += stats.pulseDamageMul;
  if (damageCtx.source === 'beam') additive += stats.beamDamageMul;
  if (damageCtx.source === 'orbit') additive += stats.orbitDamageMul;
  if (damageCtx.source === 'strike') additive += stats.strikeDamageMul;
  return dmg * baubleMul(additive);
}

function killEnemy(e: Enemy, run: RunState, _p?: Projectile): void {
  if (e.state === 'die') return;
  e.state = 'die';
  e.dieT = 0.3;
  e.hp = 0;
  e.poisonT = 0;
  e.poisonDps = 0;
  delete e.data['dotKind'];
  e.hitFlash = 0;
  state.lastKillTime = state.time;
  run.kills++;
  if (e.elite) run.casinoWaveEliteKills = (run.casinoWaveEliteKills ?? 0) + 1;
  run.score += BALANCE.scoring.perKill(run.wave);
  const mutator = getRunMutator(run.runMutatorId);
  const baseGoldAward = e.isBoss
    ? BALANCE.gold.bossKill(run.wave)
    : e.elite
      ? BALANCE.gold.eliteKill(run.wave)
      : BALANCE.gold.perKill(run.wave);
  const eliteGoldMul = e.eliteKind === 'golden' ? 2 : 1;
  run.gold += baubleGoldAmount(run, baseGoldAward * eliteGoldMul * (mutator?.modifiers.goldMul ?? 1), 'round', 1);
  addTrauma(0.08);
  spawnVfx({ x: e.x, y: e.y, life: 0.35, kind: 'ring', color: '#fff', size: 4 });
  for (let i = 0; i < 6; i++) {
    const ang = state.rng() * Math.PI * 2;
    const spd = 20 + state.rng() * 40;
    spawnVfx({
      x: e.x,
      y: e.y,
      vx: Math.cos(ang) * spd,
      vy: Math.sin(ang) * spd,
      life: 0.5,
      kind: 'spark',
      color: ELEMENT_COLORS[e.element] ?? '#fff',
      size: 2,
    });
  }
  const type = getEnemyType(e.typeId);
  if (type?.family) spawnHouseDeathVfx(e, type.family);
  if (e.eliteKind === 'volatile') {
    doPulseAt(e.x, e.y, 46, Math.max(10, e.maxHp * 0.18), 'fire', run);
  } else if (e.eliteKind === 'twin' && !e.isBoss) {
    spawnEliteTwinRemnants(e);
  }
  type?.onDeath?.(e);
  fireOnKill(envFor(run), e);
  if (run.characterId === 'necromancer') spawnSoul(e.x, e.y);
  if (run.characterId === 'berserker') {
    run.rage = Math.min(BALANCE.berserker.rageMax, run.rage + 1);
  }
  playSfx(e.isBoss ? 'boss_kill' : 'kill');
  if (e.isBoss) {
    run.score += BALANCE.scoring.bossClearBonus(run.wave);
    state.hitStopT = 0.18;
    haptic(HAPTIC.bossKill);
    addTrauma(0.35);
  }
}

function spawnHouseDeathVfx(e: Enemy, family: HouseEnemyFamily): void {
  const color = houseFamilyColor(family);
  const kind = family === 'suture' ? 'heal' : family === 'null' ? 'reaction' : family === 'mirror' ? 'ring' : 'spark';
  spawnVfx({
    x: e.x,
    y: e.y,
    life: e.isBoss ? 0.7 : 0.38,
    kind,
    color,
    size: e.isBoss ? 26 : Math.max(5, e.radius * 0.8),
  });
}

function spawnEliteTwinRemnants(parent: Enemy): void {
  for (let i = 0; i < 2; i++) {
    const child = acquire(state.enemies, makeEnemy);
    resetEnemy(child);
    child.typeId = 'swarm';
    rememberEnemyType(child.typeId);
    child.x = parent.x + (i === 0 ? -10 : 10);
    child.y = parent.y;
    child.vx = i === 0 ? -18 : 18;
    child.vy = Math.max(20, parent.speed * 1.15);
    child.maxHp = Math.max(8, Math.round(parent.maxHp * 0.18));
    child.hp = child.maxHp;
    child.radius = 5;
    child.speed = Math.max(18, parent.speed * 1.1);
    child.data = { split: 1 };
    child.element = 'none';
  }
}

function findNearestEnemy(x: number, y: number, exclude: Set<number>): Enemy | null {
  let best: Enemy | null = null;
  let bd = Infinity;
  for (const e of state.enemies) {
    if (!e.alive || e.state === 'die') continue;
    if (exclude.has(e.id)) continue;
    if (e.state === 'invisible' && e.y < WALL_Y - 80) continue;
    const dx = e.x - x;
    const dy = e.y - y;
    const d = dx * dx + dy * dy;
    if (d < bd) {
      bd = d;
      best = e;
    }
  }
  return best;
}

function drawChainLightning(x1: number, y1: number, x2: number, y2: number): void {
  const v = acquire(state.vfx, makeVfx);
  v.alive = true;
  v.age = 0;
  v.life = 0.25;
  v.kind = 'lightning';
  v.x = x1;
  v.y = y1;
  v.vx = 0;
  v.vy = 0;
  v.color = palHex('y')!;
  v.size = 0;
  v.data = encodePos(x2, y2);
  v.angle = 0;
  v.rot = 0;
}

function encodePos(x: number, y: number): number {
  return (x & 0x3ff) | ((y & 0x3ff) << 10);
}

function decodePos(v: number): { x: number; y: number } {
  return { x: v & 0x3ff, y: (v >> 10) & 0x3ff };
}

function doPulse(radius: number, damage: number, element: string, run: RunState, knockback = 0): void {
  doPulseAt(PLAYER_X, PLAYER_Y - 6, radius, damage, element, run, knockback);
  spawnVfx({ x: PLAYER_X, y: PLAYER_Y - 6, life: 0.45, kind: 'ring', color: ELEMENT_COLORS[element as 'none'] ?? '#fff', size: radius });
  playSfx('pulse');
}

function doPulseAt(cx: number, cy: number, radius: number, damage: number, element: string, run: RunState, knockback = 0): void {
  for (const e of state.enemies) {
    if (!e.alive || e.state === 'die') continue;
    const dx = e.x - cx;
    const dy = e.y - cy;
    if (dx * dx + dy * dy <= radius * radius) {
      hitEnemy(e, damage, element, run, undefined, { source: 'pulse' });
      if (knockback > 0) {
        const d = Math.hypot(dx, dy) || 1;
        e.x += (dx / d) * knockback;
        e.y += (dy / d) * knockback;
      }
    }
  }
  spawnVfx({ x: cx, y: cy, life: 0.35, kind: 'explosion', color: ELEMENT_COLORS[element as 'none'] ?? '#fff', size: radius });
}

function triggerReaction(reaction: ReturnType<typeof getReaction>, run: RunState): void {
  if (!reaction) return;
  addTrauma(0.15);
  const element = reactionEffectElement(reaction.effect);
  doPulseAt(PLAYER_X, PLAYER_Y - 20, reaction.radius, reaction.damage, element, run);
  spawnVfx({ x: PLAYER_X, y: PLAYER_Y - 20, life: 0.55, kind: 'reaction', color: reaction.color, size: reaction.radius });
  spawnPopup(PLAYER_X, PLAYER_Y - 40, reaction.name.toUpperCase(), reaction.color, 10);
  playSfx('reaction');
}

function spawnShieldVfx(): void {
  spawnVfx({ x: PLAYER_X, y: PLAYER_Y - 6, life: 0.4, kind: 'shield', color: palHex('q')!, size: 12 });
}

function spawnHealParticle(): void {
  spawnVfx({
    x: PLAYER_X + (state.rng() - 0.5) * 10,
    y: PLAYER_Y - 2,
    vy: -20 - state.rng() * 10,
    vx: (state.rng() - 0.5) * 10,
    life: 0.7,
    kind: 'heal',
    color: palHex('m')!,
    size: 2,
  });
}

function spawnSoul(x: number, y: number): void {
  const s = acquire(state.souls, makeSoul);
  s.alive = true;
  s.collected = false;
  s.x = x;
  s.y = y;
  s.vx = (state.rng() - 0.5) * 30;
  s.vy = -20 - state.rng() * 20;
  s.age = 0;
}

function updateSoul(s: SoulPickup, dt: number, run: RunState): void {
  s.age += dt;
  if (!s.collected) {
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    s.vy += 40 * dt;
    s.vx *= 0.98;
    if (s.y > WALL_Y - 4) {
      s.y = WALL_Y - 4;
      s.vy = 0;
      s.vx *= 0.8;
    }
    if (s.age > 0.4) {
      const dx = PLAYER_X - s.x;
      const dy = DIE_Y - s.y;
      const d = Math.hypot(dx, dy);
      if (d < 40) {
        const sp = 120;
        s.vx = (dx / d) * sp;
        s.vy = (dy / d) * sp;
      }
      if (d < 6) {
        run.souls = Math.min(BALANCE.necromancer.soulsMax, run.souls + 1);
        s.alive = false;
        spawnVfx({ x: PLAYER_X, y: DIE_Y, life: 0.3, kind: 'soul', color: palHex('H')!, size: 3 });
        playSfx('soul');
        return;
      }
    }
  }
  if (s.age > 8) s.alive = false;
}

type VfxInit = { x: number; y: number; life: number; kind: VfxParticle['kind']; color: string; size: number; vx?: number; vy?: number; angle?: number; rot?: number; data?: number };
function spawnVfx(v: VfxInit): void {
  // Small "filler" particles honor the Visuals > Particle Density pref so
  // players on Low machines or who prefer calmer VFX see fewer stray sparks.
  // Structural effects (rings, explosions, muzzle, beams, reactions) always
  // play so readability is preserved.
  if (v.kind === 'spark' || v.kind === 'trail') {
    const mul = getParticleMultiplier();
    if (mul <= 0) return;
    if (mul < 1 && Math.random() >= mul) return;
  }
  const p = acquire(state.vfx, makeVfx);
  p.alive = true;
  p.age = 0;
  p.x = v.x;
  p.y = v.y;
  p.vx = v.vx ?? 0;
  p.vy = v.vy ?? 0;
  p.life = v.life;
  p.kind = v.kind;
  p.color = v.color;
  p.size = v.size;
  p.angle = v.angle ?? 0;
  p.rot = v.rot ?? 0;
  p.data = v.data;
}

// Purely numeric popups are "damage numbers" and get suppressed by the
// Visuals > Damage Numbers pref. Labelled popups (BLANK, VOID +12, etc.)
// carry information so they always show.
function isPureNumericPopup(text: string): boolean {
  return /^\d+$/.test(text);
}

function spawnPopup(x: number, y: number, text: string, color: string, size: number): void {
  if (isPureNumericPopup(text) && !getDamageNumbersEnabled()) return;
  const p = acquire(state.popups, makePopup);
  p.alive = true;
  p.age = 0;
  p.x = x;
  p.y = y;
  p.vy = -40;
  p.life = 0.75;
  p.text = text;
  p.color = color;
  p.size = size;
}

function popupColor(dmg: number): string {
  if (dmg >= 40) return palHex('y')!;
  if (dmg >= 20) return palHex('u')!;
  return palHex('e')!;
}

function spawnEnemy(ev: SpawnEvent): void {
  const type = getEnemyType(ev.typeId);
  if (!type) {
    console.warn('Unknown enemy', ev.typeId);
    return;
  }
  const e = acquire(state.enemies, makeEnemy);
  resetEnemy(e);
  e.typeId = type.id;
  rememberEnemyType(type.id);
  e.x = ev.x;
  e.y = HUD_H - (type.isBoss ? 30 : 12);
  e.vy = 0;
  e.vx = 0;
  e.radius = type.radius;
  e.elite = !!ev.elite && !type.isBoss;
  e.eliteKind = e.elite ? ev.eliteKind ?? 'swift' : undefined;
  const run = state.run!;
  const mutator = getRunMutator(run.runMutatorId);
  const biome = getBiomeRule(run.currentBiomeRuleId);
  let hpMul = type.isBoss ? BALANCE.enemy.bossHpMul(run.wave) : 1;
  hpMul *= mutator?.modifiers.enemyHpMul ?? 1;
  hpMul *= biome?.enemyHpMul ?? 1;
  hpMul *= BALANCE.enemy.earlyHpMul(run.wave);
  if (e.elite) {
    hpMul *= BALANCE.enemy.eliteHpMul;
    if (e.eliteKind === 'armored') hpMul *= 1.3;
    if (e.eliteKind === 'volatile') hpMul *= 0.82;
  }
  e.maxHp = Math.round(type.baseHp * BALANCE.enemy.hpScale(run.wave) * hpMul);
  e.hp = e.maxHp;
  let speedMul = (mutator?.modifiers.enemySpeedMul ?? 1) * (biome?.enemySpeedMul ?? 1);
  if (e.elite) {
    speedMul *= BALANCE.enemy.eliteSpeedMul;
    if (e.eliteKind === 'swift') speedMul *= 1.28;
    if (e.eliteKind === 'armored') speedMul *= 0.88;
  }
  e.speed = type.baseSpeed * BALANCE.enemy.speedScale(run.wave) * speedMul;
  e.isBoss = type.isBoss ?? false;
}

function rememberEnemyType(typeId: string): void {
  if (!typeId || knownEncounteredEnemyIds.has(typeId)) return;
  knownEncounteredEnemyIds.add(typeId);
  recordEnemyEncounters([typeId]);
}

function recordAliveEnemyEncounters(): void {
  for (const e of state.enemies) {
    if (!e.alive) continue;
    rememberEnemyType(e.typeId);
  }
}

function updateEnemy(e: Enemy, dt: number, run: RunState): void {
  e.age += dt;
  e.hitFlash = Math.max(0, e.hitFlash - dt);
  if (state.run?.lockedFaceTimer !== undefined && state.run.lockedFaceTimer > 0) {
    state.run.lockedFaceTimer -= dt;
    if (state.run.lockedFaceTimer <= 0) state.run.lockedFaceValue = undefined;
  }
  if (e.poisonT > 0) {
    const POISON_TICK = 0.25;
    const prevTickBucket = Math.ceil(e.poisonT / POISON_TICK);
    e.poisonT -= dt;
    const nextTickBucket = Math.ceil(Math.max(0, e.poisonT) / POISON_TICK);
    const ticks = Math.max(0, prevTickBucket - nextTickBucket);
    if (ticks > 0 && canDamageEnemy(e, normalizeDamageContext('poison', undefined, { source: 'status' }))) {
      const stats = collectBaubleStats(run);
      const dotKind = e.data['dotKind'];
      const tickMul = dotKind === 2 ? stats.burnTickDamageMul : stats.poisonTickDamageMul;
      const tickDmg = e.poisonDps * POISON_TICK * ticks * baubleMul(tickMul);
      e.hp -= tickDmg;
      e.hitFlash = Math.max(e.hitFlash, 0.08);
      spawnVfx({ x: e.x + (state.rng() - 0.5) * 6, y: e.y - 2, life: 0.45, kind: 'poison', color: palHex('z')!, size: 2 });
      if (e.hp <= 0) {
        killEnemy(e, run);
        return;
      }
    }
  }
  if (e.freeze > 0) {
    e.freeze -= dt;
    if (e.freeze <= 0) e.slow = Math.max(0, e.slow - 0.5);
  }
  if (e.slowT > 0) {
    e.slowT = Math.max(0, e.slowT - dt);
    if (e.slowT <= 0 && e.freeze <= 0) e.slow = 0;
  }
  if (e.charged > 0) e.charged = Math.max(0, e.charged - dt);
  if (e.chill > 0) e.chill = Math.max(0, e.chill - dt * 0.5);
  if (e.corrode > 0) e.corrode = Math.max(0, e.corrode - dt * 0.3);
  if (e.state === 'die') {
    e.dieT -= dt;
    if (e.dieT <= 0) e.alive = false;
    return;
  }
  const type = getEnemyType(e.typeId);
  const freezeMul = e.freeze > 0 ? 0.15 : Math.max(0.15, 1 - e.slow);
  if (type?.behavior) type.behavior(e, dt);
  if (type?.bossMechanic) type.bossMechanic(e, dt);
  e.y += e.vy * freezeMul * dt;
  e.x += e.vx * freezeMul * dt;
  e.vy = Math.max(e.vy, e.speed);
  if (e.x < 8) e.x = 8;
  if (e.x > ARENA_W - 8) e.x = ARENA_W - 8;
  if (e.y >= WALL_Y - 4) {
    const dmg = type?.touchDamage ?? 10;
    damagePlayer(dmg, run);
    e.alive = false;
    // Enemies that reach the wall also count as "progress" for frenzy gating;
    // frenzy only exists to unstick softlocked waves, not punish players who
    // are letting mobs through on purpose.
    state.lastKillTime = state.time;
    spawnVfx({ x: e.x, y: WALL_Y - 4, life: 0.3, kind: 'explosion', color: palHex('h')!, size: 8 });
    spawnVfx({ x: e.x, y: WALL_Y - 2, life: 0.35, kind: 'ring', color: palHex('f')!, size: 6 });
    for (let i = 0; i < 4; i++) {
      const ang = -Math.PI / 2 + (state.rng() - 0.5) * 1.6;
      const sp = 40 + state.rng() * 30;
      spawnVfx({
        x: e.x,
        y: WALL_Y - 2,
        vx: Math.cos(ang) * sp,
        vy: Math.sin(ang) * sp,
        life: 0.45,
        kind: 'spark',
        color: palHex('f')!,
        size: 1,
      });
    }
    addTrauma(0.15);
  }
}

function damagePlayer(raw: number, run: RunState): void {
  if (state.iframeT > 0) return;
  if (state.reflect) {
    const reflectDmg = raw * state.reflect.multiplier;
    doPulseAt(PLAYER_X, PLAYER_Y - 6, state.reflect.radius, reflectDmg, 'none', run);
    spawnVfx({ x: PLAYER_X, y: PLAYER_Y - 6, life: 0.3, kind: 'ring', color: palHex('q')!, size: state.reflect.radius });
    playSfx('reflect');
    state.iframeT = 0.2;
    return;
  }
  if (run.shield > 0) {
    run.shield--;
    spawnShieldVfx();
    playSfx('shield_block');
    haptic(HAPTIC.shield);
    state.iframeT = 0.3;
    return;
  }
  const mutator = getRunMutator(run.runMutatorId);
  let amt = onDamaged(envFor(run), raw * (mutator?.modifiers.playerDamageTakenMul ?? 1));
  if (amt <= 0) return;
  run.hp -= amt;
  run.casinoWaveDamageTaken = (run.casinoWaveDamageTaken ?? 0) + amt;
  state.iframeT = BALANCE.player.iframeDuration;
  if (getScreenFlashesEnabled()) {
    state.screenFlashT = 0.2;
    state.screenFlashColor = palHex('h')!;
  }
  addTrauma(0.25);
  setAnim(state.playerAnim, 'hit');
  state.hitAnimT = 0.2;
  playSfx('damage');
  haptic(HAPTIC.damage);
  emitEvent('player-damaged', { amount: amt });
  if (run.hp <= 0) {
    run.hp = 0;
    onPlayerDied(run);
  }
}

function onPlayerDied(run: RunState): void {
  setAnim(state.playerAnim, 'death');
  state.paused = true;
  state.hitAnimT = 0;
  state.tapQueued = false;
  playSfx('game_over');
  haptic(HAPTIC.gameOver);
  addTrauma(0.5);
  saveRun(null);
  incrementRunsCompleted({
    wavesCleared: run.wave - 1,
    finalScore: run.score,
    characterId: run.characterId,
    kills: run.kills,
    goldSpent: run.goldSpent,
  });
  state.deathT = 1.4;
}

function allEnemiesDead(): boolean {
  for (const e of state.enemies) if (e.alive) return false;
  return true;
}

/**
 * Frenzy state machine. Always called with real (unscaled) dt. Activates when
 * a wave has stalled past FRENZY_TRIGGER_DELAY; expires after FRENZY_DURATION
 * by force-killing survivors so `allEnemiesDead` flips and the wave ends
 * normally through the standard endWave path.
 */
function tickFrenzy(realDt: number, run: RunState): void {
  const waveOngoing =
    state.spawnedForWave && !state.wave?.isBoss && state.waveClearedT < 0 && !allEnemiesDead();
  if (!waveOngoing) {
    state.frenzyActive = false;
    state.frenzyT = 0;
    return;
  }
  if (!state.frenzyActive) {
    if (state.time - state.lastKillTime > FRENZY_TRIGGER_DELAY) {
      state.frenzyActive = true;
      state.frenzyT = 0;
      playSfx('boss_warn');
      haptic(HAPTIC.bossKill);
      addTrauma(0.18);
    }
    return;
  }
  state.frenzyT = Math.min(FRENZY_DURATION, state.frenzyT + realDt);
  if (state.frenzyT >= FRENZY_DURATION) {
    // Force end: instant-kill every survivor. Use the full kill pathway so
    // score/gold/hooks/character rewards still fire for each one.
    for (const e of state.enemies) {
      if (!e.alive || e.state === 'die') continue;
      e.hp = 0;
      killEnemy(e, run);
      spawnVfx({ x: e.x, y: e.y, life: 0.4, kind: 'explosion', color: palHex('h')!, size: 8 });
    }
    state.frenzyActive = false;
    state.frenzyT = 0;
    addTrauma(0.3);
    if (getScreenFlashesEnabled()) {
      state.screenFlashT = 0.25;
      state.screenFlashColor = palHex('h')!;
    }
  }
}

function endWave(run: RunState): void {
  run.score += BALANCE.scoring.waveClearBonus(run.wave);
  const isBoss = run.wave % BALANCE.waves.bossEvery === 0;
  const mutator = getRunMutator(run.runMutatorId);
  run.gold += baubleGoldAmount(run, BALANCE.gold.waveClearBonus(run.wave) * (mutator?.modifiers.goldMul ?? 1), 'round');
  fireOnWaveEnd(envFor(run), run.wave);
  playSfx('wave_clear');
  state.paused_upgrade = true;
  state.paused = true;

  if (isBoss) {
    run.nextForgeDiscount = BALANCE.shop.postBossDiscount;
    run.guaranteedForgeRarity = run.wave >= BALANCE.shop.rarityMinWave.epic ? 'epic' : 'rare';
    const offers = generateRunRewardOffers(run);
    if (offers.length > 0) {
      run.pickCount = BALANCE.upgrade.picksOnBoss;
      useStore.getState().setUpgradeOffers(offers, run.pickCount);
      useStore.getState().setScreen('upgrade');
      syncActiveUpgradesToStore();
      saveRun(run);
      return;
    }
    // Fallback: no landmark pool available → forge shop with bonus gold.
    run.gold += baubleGoldAmount(run, BALANCE.gold.bossKill(run.wave), 'round');
  }

  if (isBoss) openForge(run);
  else openCasinoReward(run);
}

function openForge(run: RunState): void {
  run.pendingCasino = undefined;
  useStore.getState().setCasinoState(null);
  const offers = generateForgeShopOffers(run);
  useStore.getState().setForgeShopOffers(offers);
  useStore.getState().setForgeShopPurchased(false);
  useStore.getState().setScreen('forge');
  syncActiveUpgradesToStore();
  saveRun(run);
}

function openCasinoReward(run: RunState): void {
  const duration = Math.max(1, state.wave?.duration ?? Math.max(1, state.waveT));
  const casino = createCasinoIntermission(run, state.rng, {
    clearRatio: Math.max(0, state.waveT / duration),
    hpPct: run.maxHp > 0 ? Math.max(0, Math.min(1, run.hp / run.maxHp)) : 0,
    damageTaken: run.casinoWaveDamageTaken ?? 0,
    eliteKills: run.casinoWaveEliteKills ?? 0,
  });
  run.pendingCasino = casino;
  useStore.getState().setCasinoState(casino);
  useStore.getState().setScreen('casino');
  syncActiveUpgradesToStore();
  saveRun(run);
}

function syncCasinoToStore(run: RunState): void {
  useStore.getState().setCasinoState(run.pendingCasino ? { ...run.pendingCasino } : null);
}

function normalizeCasinoIntermission(run: RunState): void {
  const casino = run.pendingCasino;
  if (!casino) return;
  if (casino.offeredGames.length === 0) {
    casino.offeredGames = [...BALANCE.casino.offeredGames];
  }
  if (!casino.game || casino.phase === 'choose') {
    casino.game = casino.offeredGames[Math.floor(state.rng() * casino.offeredGames.length)] ?? 'slots';
    casino.phase = 'play';
    saveRun(run);
  }
}

export function resolveCasinoGame(choice?: string): void {
  const run = state.run;
  const casino = run?.pendingCasino;
  if (!run || !casino || casino.phase !== 'play' || !casino.game) return;
  const result = rollCasinoGameResult(casino.game, casino.luckScore, state.rng, choice);
  casino.result = result;
  casino.chestTier = adjustChestTier(casino.baseChestTier, result.chestDelta);
  casino.phase = 'chest';
  syncCasinoToStore(run);
  saveRun(run);
  playSfx(result.outcome === 'miss' ? 'ui_click' : 'upgrade_pick');
  haptic(result.outcome === 'miss' ? HAPTIC.tap : HAPTIC.upgrade);
}

export function openCasinoChest(): void {
  const run = state.run;
  const casino = run?.pendingCasino;
  if (!run || !casino || casino.phase !== 'chest') return;
  casino.rewards = rollCasinoRewards(run, useStore.getState().meta, state.rng, casino.chestTier);
  casino.reward = casino.rewards[0];
  casino.phase = 'reward';
  syncCasinoToStore(run);
  saveRun(run);
  playSfx('upgrade_pick');
  haptic(HAPTIC.upgrade);
}

function generateRunRewardOffers(run: RunState) {
  const wave = run.wave;
  const weights = BALANCE.upgrade.rarityWeights(wave);
  const meta = useStore.getState().meta;
  const isBossReward = wave % BALANCE.waves.bossEvery === 0;
  const all = listUpgrades().filter((u) => {
    if (u.category !== 'landmark' && u.category !== 'relic' && u.category !== 'bauble') return false;
    if (u.minWave && u.minWave > wave) return false;
    if (u.characterExclusive && u.characterExclusive !== run.characterId) return false;
    const ap = run.upgrades.find((a) => a.id === u.id);
    if (ap && ap.stacks >= u.maxStack) return false;
    if (u.unlockCondition && !u.unlockCondition(meta)) return false;
    return true;
  });
  if (all.length === 0) return [];
  const byRarity: Record<string, typeof all> = { common: [], rare: [], epic: [], legendary: [] };
  for (const u of all) byRarity[u.rarity]!.push(u);
  const offers: { id: string; rarity: (typeof all)[0]['rarity'] }[] = [];
  const chosen = new Set<string>();
  while (offers.length < BALANCE.upgrade.offersPerSelect) {
    const rarity = weighted(state.rng, [
      ['common', weights.common] as const,
      ['rare', weights.rare] as const,
      ['epic', weights.epic] as const,
      ['legendary', weights.legendary] as const,
    ]);
    const bucket = byRarity[rarity]!.filter((u) => !chosen.has(u.id));
    if (bucket.length === 0) {
      const fallback = all.filter((u) => !chosen.has(u.id));
      if (fallback.length === 0) break;
      const u = pickWeightedRunUpgrade(fallback, isBossReward);
      chosen.add(u.id);
      offers.push({ id: u.id, rarity: u.rarity });
      continue;
    }
    const u = pickWeightedRunUpgrade(bucket, isBossReward);
    chosen.add(u.id);
    offers.push({ id: u.id, rarity: u.rarity });
  }
  return offers;
}

function pickWeightedRunUpgrade<T extends { category: string }>(pool: T[], isBossReward: boolean): T {
  const weightedPool = pool.map((u) => ({
    item: u,
    weight: u.category === 'relic'
      ? (isBossReward ? BALANCE.relic.bossRewardWeightMul : BALANCE.bauble.relicNormalRewardWeightMul)
      : u.category === 'bauble'
        ? (isBossReward ? BALANCE.bauble.bossRewardWeightMul : BALANCE.bauble.rewardWeightMul)
        : 1,
  }));
  const total = weightedPool.reduce((sum, x) => sum + x.weight, 0);
  let roll = state.rng() * total;
  for (const entry of weightedPool) {
    roll -= entry.weight;
    if (roll <= 0) return entry.item;
  }
  return weightedPool[0]!.item;
}

export function rerollUpgradeOffers(): void {
  const run = state.run;
  if (!run) return;
  const offers = generateRunRewardOffers(run);
  useStore.getState().setUpgradeOffers(offers, run.pickCount);
  playSfx('ui_reroll');
}

function priceFor(upgrade: ReturnType<typeof getFaceUpgrade>, tier: number): number {
  if (!upgrade) return 0;
  const t = Math.max(1, Math.min(MAX_TIER, tier || getFaceRank(upgrade)));
  const custom = upgrade.basePrice?.[upgrade.rarity]?.[t - 1];
  if (typeof custom === 'number') return custom;
  const fallback = BALANCE.faceUpgrade.basePrices[upgrade.rarity]?.[t - 1];
  return fallback ?? 10;
}

function hasEquippedFaceUpgrade(run: RunState, upgradeId: string): boolean {
  return run.slotLayout.some((slot) => slot.replacerId === upgradeId || slot.supplementIds.includes(upgradeId));
}

function syncOwnedFaceUpgrades(run: RunState): void {
  run.ownedFaceUpgrades = {};
  for (const slot of run.slotLayout) {
    if (slot.replacerId) {
      run.ownedFaceUpgrades[slot.replacerId] = (run.ownedFaceUpgrades[slot.replacerId] ?? 0) + 1;
    }
    for (const id of slot.supplementIds) {
      run.ownedFaceUpgrades[id] = (run.ownedFaceUpgrades[id] ?? 0) + 1;
    }
  }
}

function canOfferFaceUpgrade(run: RunState, upgrade: ReturnType<typeof getFaceUpgrade>): boolean {
  if (!upgrade) return false;
  if (upgrade.characterExclusive && upgrade.characterExclusive !== run.characterId) return false;
  if (upgrade.upgradesFrom) return hasEquippedFaceUpgrade(run, upgrade.upgradesFrom);
  return true;
}

function pickBestSlotFor(
  run: RunState,
  upgrade: ReturnType<typeof getFaceUpgrade>,
): number {
  if (!upgrade) return -1;
  const ch = getCharacter(run.characterId);
  if (!ch) return -1;
  if (upgrade.upgradesFrom) {
    const candidates = run.slotLayout
      .filter((slot) => slot.replacerId === upgrade.upgradesFrom)
      .map((slot) => slot.index)
      .filter((slotIndex) => canHostUpgrade(run, upgrade, slotIndex));
    return candidates[Math.floor(state.rng() * candidates.length)] ?? -1;
  }
  const slots = run.slotLayout;
  const bindsTo = upgrade.bindsTo;
  const tagSet = new Set(upgrade.tags ?? []);
  const defaults = ch.defaultFaces ?? [];

  const candidates: number[] = [];
  for (let i = 0; i < slots.length; i++) {
    if (isSlotLocked(ch, i)) continue;
    if (bindsTo && bindsTo.length > 0 && !bindsTo.includes(i + 1)) continue;
    const allowed = slotAllowedTags(ch, i);
    if (allowed && allowed.length > 0 && ![...allowed].some((t) => tagSet.has(t))) continue;
    if (upgrade.kind === 'replacer' && defaults[i]?.restrictedReplacement) continue;
    if (upgrade.kind === 'supplement' && !canPlaceSupplement(slots[i]!)) continue;
    candidates.push(i);
  }
  if (candidates.length === 0) return -1;
  if (upgrade.kind === 'replacer') {
    const empty = candidates.filter((i) => {
      const slot = slots[i]!;
      return slot.replacerId === null;
    });
    if (empty.length > 0) {
      return empty[Math.floor(state.rng() * empty.length)] ?? -1;
    }
  } else {
    candidates.sort((a, b) => slots[a]!.supplementIds.length - slots[b]!.supplementIds.length);
    const leastIdx = candidates[0]!;
    const leastLen = slots[leastIdx]!.supplementIds.length;
    const tiedLeast = candidates.filter((i) => slots[i]!.supplementIds.length === leastLen);
    return tiedLeast[Math.floor(state.rng() * tiedLeast.length)] ?? -1;
  }
  return candidates[Math.floor(state.rng() * candidates.length)] ?? -1;
}

export function generateForgeShopOffers(run: RunState): ForgeShopOffer[] {
  const count = BALANCE.shop.cardsPerOffer;
  const wave = run.wave;
  const rarityMinWave = BALANCE.shop.rarityMinWave;
  const mutator = getRunMutator(run.runMutatorId);
  const rarityBonus = mutator?.modifiers.forgeRarityBonus ?? 0;
  // Pre-filter: must be eligible (character, chain prerequisite, has at least
  // one valid slot) AND the rarity must have unlocked by the current wave.
  let all = listFaceUpgrades().filter((u) => {
    // Supplements are dormant in the relics branch. Keep their content for future reuse,
    // but never surface them as active forge offers.
    if (u.kind !== 'replacer') return false;
    if (!canOfferFaceUpgrade(run, u)) return false;
    if (wave < (rarityMinWave[u.rarity] ?? 1)) return false;
    if (pickBestSlotFor(run, u) < 0) return false;
    return true;
  });
  // Safety net: if rarity gates filter everything out (e.g. a character with no
  // common face upgrades at wave 1), fall back to ignoring the gate so the
  // forge is never empty.
  if (all.length === 0) {
    all = listFaceUpgrades().filter((u) => {
      if (u.kind !== 'replacer') return false;
      if (!canOfferFaceUpgrade(run, u)) return false;
      if (pickBestSlotFor(run, u) < 0) return false;
      return true;
    });
  }
  const relicOffer = pickForgeRelicOffer(run);
  const baubleOffer = pickForgeBaubleOffer(run);
  if (all.length === 0) return [baubleOffer, relicOffer].filter((offer): offer is ForgeShopOffer => Boolean(offer));

  const weights: { id: string; w: number }[] = all.map((u) => {
    const rank = getFaceRank(u);
    let w = 1;
    if (!u.upgradesFrom) w *= 1;
    else if (rank <= 2) w *= BALANCE.shop.ownedT1T2WeightMul;
    else if (rank < MAX_TIER) w *= BALANCE.shop.ownedT3T4WeightMul;
    else w *= BALANCE.shop.ownedMaxWeightMul;
    w *= BALANCE.shop.rarityWeight(u.rarity, wave);
    if (u.rarity !== 'common') w *= 1 + rarityBonus;
    return { id: u.id, w };
  });

  const offers: ForgeShopOffer[] = [];
  const chosen = new Set<string>();
  for (let i = 0; i < count; i++) {
    const guaranteed = i === 0 && run.guaranteedForgeRarity
      ? weights.filter((x) => !chosen.has(x.id) && getFaceUpgrade(x.id)?.rarity === run.guaranteedForgeRarity)
      : [];
    const pool = guaranteed.length > 0 ? guaranteed : weights.filter((x) => !chosen.has(x.id));
    if (pool.length === 0) break;
    const totalW = pool.reduce((a, b) => a + b.w, 0);
    let roll = state.rng() * totalW;
    let picked = pool[0]!.id;
    for (const p of pool) {
      roll -= p.w;
      if (roll <= 0) {
        picked = p.id;
        break;
      }
    }
    chosen.add(picked);
    const upgrade = getFaceUpgrade(picked);
    const rank = getFaceRank(upgrade);
    const slotIndex = pickBestSlotFor(run, upgrade);
    if (slotIndex < 0) continue; // safety: eligibility recheck
    const discount = Math.max(0, Math.min(0.75, run.nextForgeDiscount ?? 0));
    const price = Math.max(1, Math.floor(priceFor(upgrade, rank) * (1 - discount)));
    offers.push({ id: picked, kind: 'face', slotIndex, rank, price });
  }
  if (relicOffer && state.rng() < BALANCE.relic.forgeOfferChance(wave)) addSpecialForgeOffer(offers, relicOffer, count);
  if (baubleOffer && state.rng() < BALANCE.bauble.forgeOfferChance(wave)) addSpecialForgeOffer(offers, baubleOffer, count);
  return offers;
}

function addSpecialForgeOffer(offers: ForgeShopOffer[], offer: ForgeShopOffer, maxCount: number): void {
  if (offers.length < maxCount) {
    offers.push(offer);
    return;
  }
  for (let i = offers.length - 1; i >= 0; i--) {
    if (offers[i]?.kind === 'face') {
      offers[i] = offer;
      return;
    }
  }
}

function canOfferRunUpgrade(run: RunState, u: ReturnType<typeof getUpgrade>): boolean {
  if (!u) return false;
  if (u.minWave && u.minWave > run.wave) return false;
  if (u.characterExclusive && u.characterExclusive !== run.characterId) return false;
  const ap = run.upgrades.find((a) => a.id === u.id);
  if (ap && ap.stacks >= u.maxStack) return false;
  if (u.unlockCondition && !u.unlockCondition(useStore.getState().meta)) return false;
  return true;
}

function relicForgePrice(u: NonNullable<ReturnType<typeof getUpgrade>>, run: RunState): number {
  const base = u.forgePrice ?? (
    u.category === 'bauble' ? BALANCE.bauble.basePrices[u.rarity] : BALANCE.relic.basePrices[u.rarity]
  );
  const discount = Math.max(0, Math.min(0.5, run.nextForgeDiscount ?? 0));
  return Math.max(1, Math.floor(base * (1 - discount)));
}

function pickForgeRelicOffer(run: RunState): ForgeShopOffer | null {
  const pool = listUpgrades().filter((u) => {
    if (u.category !== 'relic') return false;
    if (run.wave < (BALANCE.relic.rarityMinWave[u.rarity] ?? 1)) return false;
    return canOfferRunUpgrade(run, u);
  });
  if (pool.length === 0) return null;
  const weightedPool = pool.map((u) => ({
    id: u.id,
    w: BALANCE.shop.rarityWeight(u.rarity, run.wave),
  }));
  const totalW = weightedPool.reduce((sum, x) => sum + x.w, 0);
  let roll = state.rng() * totalW;
  let picked = weightedPool[0]!.id;
  for (const entry of weightedPool) {
    roll -= entry.w;
    if (roll <= 0) {
      picked = entry.id;
      break;
    }
  }
  const relic = getUpgrade(picked);
  if (!relic) return null;
  return {
    id: relic.id,
    kind: 'relic',
    slotIndex: -1,
    rank: 1,
    price: relicForgePrice(relic, run),
  };
}

function pickForgeBaubleOffer(run: RunState): ForgeShopOffer | null {
  const pool = listUpgrades().filter((u) => {
    if (u.category !== 'bauble') return false;
    if (run.wave < (BALANCE.bauble.rarityMinWave[u.rarity] ?? 1)) return false;
    return canOfferRunUpgrade(run, u);
  });
  if (pool.length === 0) return null;
  const weightedPool = pool.map((u) => ({
    id: u.id,
    w: BALANCE.shop.rarityWeight(u.rarity, run.wave),
  }));
  const totalW = weightedPool.reduce((sum, x) => sum + x.w, 0);
  let roll = state.rng() * totalW;
  let picked = weightedPool[0]!.id;
  for (const entry of weightedPool) {
    roll -= entry.w;
    if (roll <= 0) {
      picked = entry.id;
      break;
    }
  }
  const bauble = getUpgrade(picked);
  if (!bauble) return null;
  return {
    id: bauble.id,
    kind: 'bauble',
    slotIndex: -1,
    rank: 1,
    price: relicForgePrice(bauble, run),
  };
}

export function rerollForgeShopOffers(): void {
  const run = state.run;
  if (!run) return;
  const cost = BALANCE.shop.rerollCost(run.wave);
  if (run.gold < cost) return;
  run.gold -= cost;
  run.goldSpent += cost;
  const offers = generateForgeShopOffers(run);
  useStore.getState().setForgeShopOffers(offers);
  useStore.getState().setHud({ gold: run.gold });
  playSfx('ui_reroll');
}

export function buyForgeShopOffer(offerIndex: number): void {
  const run = state.run;
  if (!run) return;
  const offers = useStore.getState().forgeShopOffers;
  const offer = offers[offerIndex];
  if (!offer) return;
  if (offer.kind === 'relic' || offer.kind === 'bauble') {
    buyForgeRunUpgradeOffer(offerIndex);
    return;
  }
  if (offer.slotIndex < 0) return;
  placeForgeOfferInSlot(offerIndex, offer.slotIndex);
}

export function buyForgeRelicOffer(offerIndex: number): boolean {
  return buyForgeRunUpgradeOffer(offerIndex, 'relic');
}

export function buyForgeBaubleOffer(offerIndex: number): boolean {
  return buyForgeRunUpgradeOffer(offerIndex, 'bauble');
}

function buyForgeRunUpgradeOffer(offerIndex: number, expectedKind?: 'relic' | 'bauble'): boolean {
  const run = state.run;
  if (!run) return false;
  const offers = useStore.getState().forgeShopOffers;
  const offer = offers[offerIndex];
  if (!offer || (offer.kind !== 'relic' && offer.kind !== 'bauble')) return false;
  if (expectedKind && offer.kind !== expectedKind) return false;
  if (run.gold < offer.price) return false;
  const upgrade = getUpgrade(offer.id);
  if (!upgrade || upgrade.category !== offer.kind || !canOfferRunUpgrade(run, upgrade)) return false;

  const existing = run.upgrades.find((a) => a.id === upgrade.id);
  if (existing) existing.stacks++;
  else run.upgrades.push({ id: upgrade.id, stacks: 1 });
  run.gold -= offer.price;
  run.goldSpent += offer.price;
  upgrade.hooks?.onApply?.(envFor(run).ctx);

  const remaining = offers.filter((_, i) => i !== offerIndex);
  useStore.getState().setForgeShopOffers(remaining);
  useStore.getState().setHud({ gold: run.gold });
  useStore.getState().setForgeShopPurchased(true);
  playSfx('upgrade_pick');
  haptic(HAPTIC.upgrade);
  syncActiveUpgradesToStore();
  saveRun(run);
  return true;
}

/** Whether a slot can host a given upgrade at all, independent of capacity. */
function canHostUpgrade(
  run: RunState,
  upgrade: ReturnType<typeof getFaceUpgrade>,
  slotIndex: number,
  opts?: { ignoreSupplementCap?: boolean },
): boolean {
  if (!upgrade) return false;
  const ch = getCharacter(run.characterId);
  if (!ch) return false;
  if (slotIndex < 0 || slotIndex >= run.slotLayout.length) return false;
  if (isSlotLocked(ch, slotIndex)) return false;
  if (upgrade.bindsTo && upgrade.bindsTo.length > 0 && !upgrade.bindsTo.includes(slotIndex + 1)) return false;
  const allowed = slotAllowedTags(ch, slotIndex);
  const tagSet = new Set(upgrade.tags ?? []);
  if (allowed && allowed.length > 0 && ![...allowed].some((t) => tagSet.has(t))) return false;
  const defaults = ch.defaultFaces ?? [];
  const slot = run.slotLayout[slotIndex];
  if (!slot) return false;
  const replacesCurrentReplacer = Boolean(upgrade.upgradesFrom && slot.replacerId === upgrade.upgradesFrom);
  if (upgrade.kind === 'replacer' && defaults[slotIndex]?.restrictedReplacement && !replacesCurrentReplacer) return false;
  if (upgrade.kind === 'supplement' && !opts?.ignoreSupplementCap && !canPlaceSupplement(slot)) return false;
  return true;
}

/** Whether an offer can legally be placed into a specific slot for this run. */
export function canPlaceOfferInSlot(
  run: RunState,
  offer: { id: string; rank: number; price: number },
  slotIndex: number,
): boolean {
  const upgrade = getFaceUpgrade(offer.id);
  if (!upgrade) return false;
  if (upgrade.upgradesFrom) {
    const slot = run.slotLayout[slotIndex];
    if (!slot || slot.replacerId !== upgrade.upgradesFrom) return false;
    return canHostUpgrade(run, upgrade, slotIndex);
  }
  return canHostUpgrade(run, upgrade, slotIndex);
}

/** Whether a replacer in `fromSlot` can be moved (or swapped) into `toSlot`. */
export function canMoveReplacer(
  run: RunState,
  fromSlot: number,
  toSlot: number,
): boolean {
  if (fromSlot === toSlot) return false;
  const a = run.slotLayout[fromSlot];
  const b = run.slotLayout[toSlot];
  if (!a || !b) return false;
  const ch = getCharacter(run.characterId);
  if (!ch) return false;
  const aId = a.replacerId;
  if (!aId) return false;
  const aUp = getFaceUpgrade(aId);
  if (!aUp) return false;
  if (!canHostUpgrade(run, aUp, toSlot)) return false;
  const bId = b.replacerId;
  if (bId) {
    const bUp = getFaceUpgrade(bId);
    if (!bUp) return false;
    if (!canHostUpgrade(run, bUp, fromSlot)) return false;
  }
  return true;
}

/** Whether a supplement at (fromSlot, fromPos) can be moved (or swapped) into `toSlot`. */
export function canMoveSupplement(
  run: RunState,
  fromSlot: number,
  fromPos: number,
  toSlot: number,
): boolean {
  if (fromSlot === toSlot) return false;
  const a = run.slotLayout[fromSlot];
  const b = run.slotLayout[toSlot];
  if (!a || !b) return false;
  const aId = a.supplementIds[fromPos];
  if (!aId) return false;
  const aUp = getFaceUpgrade(aId);
  if (!aUp) return false;
  const hasSpace = b.supplementIds.length < b.supplementCap;
  if (hasSpace) {
    return canHostUpgrade(run, aUp, toSlot);
  }
  // Swap path: both directions must accept the other supplement, capacity is preserved.
  if (!canHostUpgrade(run, aUp, toSlot, { ignoreSupplementCap: true })) return false;
  const bId = b.supplementIds[b.supplementIds.length - 1];
  if (!bId) return false;
  const bUp = getFaceUpgrade(bId);
  if (!bUp) return false;
  return canHostUpgrade(run, bUp, fromSlot, { ignoreSupplementCap: true });
}

/** Move a slot's replacer to another slot. Swaps with the target's replacer if it's non-default. */
export function moveOrSwapReplacer(fromSlot: number, toSlot: number): boolean {
  const run = state.run;
  if (!run) return false;
  if (!canMoveReplacer(run, fromSlot, toSlot)) return false;
  const a = run.slotLayout[fromSlot]!;
  const b = run.slotLayout[toSlot]!;
  const aId = a.replacerId;
  const bId = b.replacerId;
  if (bId) {
    a.replacerId = bId;
    b.replacerId = aId;
  } else {
    a.replacerId = null;
    b.replacerId = aId;
  }
  playSfx('upgrade_pick');
  haptic(HAPTIC.upgrade);
  saveRun(run);
  return true;
}

/** Move a supplement to another slot. Swaps with target's last supplement if target is at cap. */
export function moveOrSwapSupplement(
  fromSlot: number,
  fromPos: number,
  toSlot: number,
): boolean {
  const run = state.run;
  if (!run) return false;
  if (!canMoveSupplement(run, fromSlot, fromPos, toSlot)) return false;
  const a = run.slotLayout[fromSlot]!;
  const b = run.slotLayout[toSlot]!;
  const aId = a.supplementIds[fromPos]!;
  if (b.supplementIds.length < b.supplementCap) {
    a.supplementIds.splice(fromPos, 1);
    b.supplementIds.push(aId);
  } else {
    const bPos = b.supplementIds.length - 1;
    const bId = b.supplementIds[bPos]!;
    a.supplementIds[fromPos] = bId;
    b.supplementIds[bPos] = aId;
  }
  playSfx('upgrade_pick');
  haptic(HAPTIC.upgrade);
  saveRun(run);
  return true;
}

/** Attempt to install a forge offer into a chosen slot. Returns true on success. */
export function placeForgeOfferInSlot(offerIndex: number, slotIndex: number): boolean {
  const run = state.run;
  if (!run) return false;
  const offers = useStore.getState().forgeShopOffers;
  const offer = offers[offerIndex];
  if (!offer) return false;
  if (offer.kind !== 'face') return false;
  if (run.gold < offer.price) return false;
  if (!canPlaceOfferInSlot(run, offer, slotIndex)) return false;
  const upgrade = getFaceUpgrade(offer.id);
  if (!upgrade) return false;
  const slot = run.slotLayout[slotIndex];
  if (!slot) return false;

  if (upgrade.upgradesFrom) {
    if (slot.replacerId !== upgrade.upgradesFrom) return false;
    slot.replacerId = upgrade.id;
  } else if (upgrade.kind === 'replacer') {
    slot.replacerId = upgrade.id;
  } else {
    slot.supplementIds.push(upgrade.id);
  }
  syncOwnedFaceUpgrades(run);
  run.gold -= offer.price;
  run.goldSpent += offer.price;

  const remaining = offers.filter((_, i) => i !== offerIndex);
  useStore.getState().setForgeShopOffers(remaining);
  useStore.getState().setHud({ gold: run.gold });
  useStore.getState().setForgeShopPurchased(true);
  playSfx('upgrade_pick');
  haptic(HAPTIC.upgrade);
  saveRun(run);
  return true;
}

/** Gold refund for selling an installed upgrade from a slot. Returns 0 if not sellable. */
export function forgeSellValue(run: RunState, slotIndex: number, kind: 'replacer' | 'supplement', supplementPos = 0): number {
  const slot = run.slotLayout[slotIndex];
  if (!slot) return 0;
  let id: string | null = null;
  if (kind === 'replacer') {
    id = slot.replacerId;
    if (id === null) return 0;
  } else {
    id = slot.supplementIds[supplementPos] ?? null;
    if (!id) return 0;
  }
  const upgrade = getFaceUpgrade(id);
  if (!upgrade) return 0;
  const price = priceFor(upgrade, getFaceRank(upgrade));
  return Math.max(1, Math.floor(price * 0.5));
}

/** Remove an installed upgrade from a slot and refund gold. Returns refunded amount (0 if no-op). */
export function sellFromSlot(
  slotIndex: number,
  kind: 'replacer' | 'supplement',
  supplementPos = 0,
): number {
  const run = state.run;
  if (!run) return 0;
  const slot = run.slotLayout[slotIndex];
  if (!slot) return 0;
  const refund = forgeSellValue(run, slotIndex, kind, supplementPos);
  if (refund <= 0) return 0;

  let removedId: string | null = null;
  if (kind === 'replacer') {
    removedId = slot.replacerId;
    slot.replacerId = null;
  } else {
    removedId = slot.supplementIds[supplementPos] ?? null;
    if (!removedId) return 0;
    slot.supplementIds.splice(supplementPos, 1);
  }

  if (removedId) syncOwnedFaceUpgrades(run);

  run.gold += refund;
  useStore.getState().setHud({ gold: run.gold });
  playSfx('ui_click');
  haptic(HAPTIC.upgrade);
  saveRun(run);
  return refund;
}

export function expandSlotCap(slotIndex: number): void {
  const run = state.run;
  if (!run) return;
  const cost = BALANCE.shop.slotExpandCost(run.wave);
  if (run.gold < cost) return;
  const slot = run.slotLayout[slotIndex];
  if (!slot) return;
  if (!expandSlot(slot)) return;
  run.gold -= cost;
  run.goldSpent += cost;
  useStore.getState().setHud({ gold: run.gold });
  useStore.getState().setForgeShopPurchased(true);
  playSfx('upgrade_pick');
  saveRun(run);
}

function casinoRewardList(casino: RunState['pendingCasino']): CasinoChestReward[] {
  if (!casino) return [];
  if (casino.rewards && casino.rewards.length > 0) return casino.rewards;
  return casino.reward ? [casino.reward] : [];
}

function isCasinoFaceReward(reward: CasinoChestReward): reward is CasinoChestReward & { kind: 'face'; id: string } {
  return reward.kind === 'face';
}

export function getCasinoFaceRewardSlots(): number[] {
  const run = state.run;
  const reward = casinoRewardList(run?.pendingCasino).find(isCasinoFaceReward);
  if (!run || !reward) return [];
  return casinoFaceSlotOptions(run, reward.id);
}

function finishCasinoReward(run: RunState): void {
  run.pendingCasino = undefined;
  useStore.getState().setCasinoState(null);
  syncActiveUpgradesToStore();
  syncHudToStore();
  saveRun(run);
  proceedToNextWave();
}

function grantRunUpgradeReward(run: RunState, id: string, expected: 'bauble' | 'relic'): boolean {
  const upgrade = getUpgrade(id);
  if (!upgrade || upgrade.category !== expected) return false;
  const existing = run.upgrades.find((a) => a.id === upgrade.id);
  if (existing) existing.stacks++;
  else run.upgrades.push({ id: upgrade.id, stacks: 1 });
  upgrade.hooks?.onApply?.(envFor(run).ctx);
  if (ensureTwinDice(run)) state.dice = buildDieInstances(run.dice);
  return true;
}

function claimCasinoRewardItem(run: RunState, reward: CasinoChestReward, slotIndex?: number): boolean {
  if (reward.kind === 'gold') {
    run.gold += baubleGoldAmount(run, reward.amount, 'round');
    return true;
  }
  if (reward.kind === 'heal') {
    run.hp = Math.min(run.maxHp, run.hp + Math.floor(baubleHealingAmount(run, reward.amount)));
    return true;
  }
  if (reward.kind === 'forgeDiscount') {
    run.nextForgeDiscount = Math.max(run.nextForgeDiscount ?? 0, reward.amount);
    return true;
  }
  if (reward.kind === 'bauble' || reward.kind === 'relic') {
    return grantRunUpgradeReward(run, reward.id, reward.kind);
  }
  if (typeof slotIndex !== 'number') return false;
  if (!casinoFaceSlotOptions(run, reward.id).includes(slotIndex)) return false;
  const upgrade = getFaceUpgrade(reward.id);
  const slot = run.slotLayout[slotIndex];
  if (!upgrade || !slot) return false;
  if (upgrade.kind === 'replacer') slot.replacerId = upgrade.id;
  else slot.supplementIds.push(upgrade.id);
  syncOwnedFaceUpgrades(run);
  return true;
}

function casinoRewardGoldValue(reward: CasinoChestReward): number {
  if ('convertGold' in reward) return reward.convertGold;
  if (reward.kind === 'forgeDiscount') return Math.max(10, Math.round(reward.amount * 120));
  if (reward.kind === 'heal') return Math.max(3, Math.floor(reward.amount * 0.5));
  return reward.amount;
}

export function claimCasinoReward(slotIndex?: number): boolean {
  const run = state.run;
  const casino = run?.pendingCasino;
  const rewards = casinoRewardList(casino);
  if (!run || !casino || casino.phase !== 'reward' || rewards.length === 0) return false;

  const faceReward = rewards.find(isCasinoFaceReward);
  if (faceReward) {
    if (typeof slotIndex !== 'number') return false;
    if (!casinoFaceSlotOptions(run, faceReward.id).includes(slotIndex)) return false;
    const upgrade = getFaceUpgrade(faceReward.id);
    const slot = run.slotLayout[slotIndex];
    if (!upgrade || !slot) return false;
  }

  for (const reward of rewards) {
    if (!claimCasinoRewardItem(run, reward, reward.kind === 'face' ? slotIndex : undefined)) return false;
  }

  casino.rewardClaimed = true;
  playSfx('upgrade_pick');
  haptic(HAPTIC.upgrade);
  finishCasinoReward(run);
  return true;
}

export function convertCasinoRewardToGold(): boolean {
  const run = state.run;
  const casino = run?.pendingCasino;
  const rewards = casinoRewardList(casino);
  if (!run || !casino || casino.phase !== 'reward' || rewards.length === 0) return false;
  const amount = rewards.reduce((sum, reward) => sum + casinoRewardGoldValue(reward), 0);
  run.gold += baubleGoldAmount(run, amount, 'round');
  casino.rewardClaimed = true;
  playSfx('ui_click');
  haptic(HAPTIC.tap);
  finishCasinoReward(run);
  return true;
}

export function forgeShopDone(): void {
  const run = state.run;
  if (!run) return;
  useStore.getState().setForgeShopOffers([]);
  run.nextForgeDiscount = undefined;
  run.guaranteedForgeRarity = undefined;
  proceedToNextWave();
}

export function forgeShopSkipForHeal(): void {
  const run = state.run;
  if (!run) return;
  if (useStore.getState().forgeShopPurchased) return;
  const cost = BALANCE.shop.skipHealCost(run.wave);
  if (run.gold < cost) return;
  run.gold -= cost;
  run.goldSpent += cost;
  const faceTotal = run.slotLayout.reduce((acc, s) => acc + (s.replacerId ? 1 : 0), 0) + 6;
  const heal = Math.floor(baubleHealingAmount(run, BALANCE.gold.skipHeal(faceTotal)));
  run.hp = Math.min(run.maxHp, run.hp + heal);
  useStore.getState().setHud({ hp: run.hp, gold: run.gold });
  forgeShopDone();
}

export function pickUpgrade(id: string): void {
  const run = state.run;
  if (!run) return;
  const u = getUpgrade(id);
  if (!u) return;
  const existing = run.upgrades.find((a) => a.id === id);
  if (existing) existing.stacks++;
  else run.upgrades.push({ id, stacks: 1 });
  const env = envFor(run);
  u.hooks?.onApply?.(env.ctx);
  if (ensureTwinDice(run)) {
    state.dice = buildDieInstances(run.dice);
  }
  run.pickCount--;
  playSfx('upgrade_pick');
  haptic(HAPTIC.upgrade);
  if (run.pickCount > 0) {
    const offers = generateRunRewardOffers(run);
    useStore.getState().setUpgradeOffers(offers, run.pickCount);
    saveRun(run);
  } else {
    useStore.getState().setUpgradeOffers([], 0);
    if (run.nextForgeDiscount || run.guaranteedForgeRarity) {
      openForge(run);
    } else {
      proceedToNextWave();
    }
  }
  syncActiveUpgradesToStore();
  saveRun(run);
}

function proceedToNextWave(): void {
  const run = state.run;
  if (!run) return;
  run.pendingCasino = undefined;
  useStore.getState().setCasinoState(null);
  run.wave++;
  state.paused_upgrade = false;
  state.paused = false;
  setupWave(run.wave);
  useStore.getState().setScreen('game');
}

function diceReadyToRoll(): boolean {
  const cooldownReduction = collectBaubleStats(state.run).cooldownReductionMul;
  const cd = BALANCE.die.postRollCooldown * Math.max(0.7, 1 - cooldownReduction);
  for (const d of state.dice) {
    if (d.landedAt > 0 && state.time - d.landedAt < cd) return false;
  }
  return true;
}

export function tap(): void {
  if (!state.run || state.paused) return;
  const anyRolling = state.dice.some((d) => d.rolling);
  if (anyRolling) {
    state.tapQueued = true;
    return;
  }
  if (!diceReadyToRoll()) {
    state.tapQueued = true;
    return;
  }
  for (const die of state.dice) {
    die.rolling = true;
    die.rollT = 0;
    die.shakeFrame = 0;
    die.rollDuration = Math.max(BALANCE.die.rollDurationMin, die.config.rollDuration);
  }
  emitEvent('roll-start');
  playSfx('roll_start');
  addTrauma(0.03);
}

export function startCharge(): void {
  if (!state.run || state.paused) return;
  if (state.run.characterId !== 'clockmaker') {
    tap();
    return;
  }
  const anyRolling = state.dice.some((d) => d.rolling);
  if (anyRolling) return;
  if (!diceReadyToRoll()) return;
  for (const die of state.dice) {
    die.charging = true;
    die.chargeT = 0;
  }
}

export function releaseCharge(): void {
  if (!state.run || state.paused) return;
  if (state.run.characterId !== 'clockmaker') return;
  const anyCharging = state.dice.some((d) => d.charging);
  if (!anyCharging) return;
  for (const die of state.dice) {
    die.charging = false;
    const charge = die.chargeT;
    die.chargeT = charge;
    die.rolling = true;
    die.rollT = 0;
    die.shakeFrame = 0;
    die.rollDuration = Math.max(
      BALANCE.die.rollDurationMin,
      die.config.rollDuration * (1 - Math.min(0.5, charge * 0.3)),
    );
  }
  emitEvent('roll-start');
  playSfx('roll_start');
}

function updateRage(run: RunState, dt: number): void {
  if (run.rage > 0) run.rage = Math.max(0, run.rage - dt * 0.4);
}

function tickProjectileTags(p: Projectile, dt: number, run: RunState): void {
  p.tagT += dt;
  if (p.tags.has('comet')) {
    if (p.tagT >= 0.08) {
      p.tagT = 0;
      spawnVfx({ x: p.x, y: p.y, life: 0.35, kind: 'poison', color: palHex('x')!, size: 3 });
      for (const e of state.enemies) {
        if (!e.alive || e.state === 'die') continue;
        const dx = e.x - p.x;
        const dy = e.y - p.y;
        if (dx * dx + dy * dy < 14 * 14) {
          const stats = collectBaubleStats(run);
          const poisonDps = 12 * baubleMul(stats.poisonApplicationDpsMul);
          if (poisonDps >= e.poisonDps) e.data['dotKind'] = 1;
          e.poisonT = Math.max(e.poisonT, 0.9 * baubleMul(stats.poisonDurationMul));
          e.poisonDps = Math.max(e.poisonDps, poisonDps);
        }
      }
    }
  }
  if (p.tags.has('tesla_zap')) {
    if (p.tagT >= 0.35) {
      p.tagT = 0;
      const zapDmg = Math.max(6, p.damage * 0.35);
      let count = 0;
      for (const e of state.enemies) {
        if (count >= 3) break;
        if (!e.alive || e.state === 'die') continue;
        const dx = e.x - p.x;
        const dy = e.y - p.y;
        if (dx * dx + dy * dy < 48 * 48) {
          drawChainLightning(p.x, p.y, e.x, e.y);
          e.charged = Math.max(e.charged, 1.5);
          hitEnemy(e, zapDmg, 'lightning', run, p, { source: 'chain', projectile: p });
          count++;
        }
      }
    }
  }
  if (p.tags.has('graviton')) {
    for (const e of state.enemies) {
      if (!e.alive || e.state === 'die') continue;
      const dx = p.x - e.x;
      const dy = p.y - e.y;
      const d = Math.hypot(dx, dy);
      if (d > 0 && d < 36) {
        const pull = 40 * dt;
        e.x += (dx / d) * pull;
        e.y += (dy / d) * pull;
      }
    }
  }
}

function updateMomentum(run: RunState, dt: number): void {
  const m = run.momentum ?? 0;
  if (m <= 0) return;
  run.momentumT = Math.max(0, (run.momentumT ?? 0) - dt);
  if ((run.momentumT ?? 0) <= 0) {
    run.momentum = Math.max(0, m - 1);
    if ((run.momentum ?? 0) > 0) run.momentumT = 1.4;
  }
}

function applyClockmakerSlow(): void {
  for (const e of state.enemies) {
    if (!e.alive) continue;
    const distToWall = WALL_Y - e.y;
    if (distToWall < 60 && distToWall > 0) {
      const s = 1 - distToWall / 60;
      e.slow = Math.max(e.slow, s * 0.5);
    }
  }
}

export function render(ctx: CanvasRenderingContext2D): void {
  const run = state.run;
  const { x: shX, y: shY } = getShakeOffset();
  ctx.save();
  ctx.fillStyle = palHex('0')!;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  ctx.translate(shX, shY);

  ctx.fillStyle = palHex('1')!;
  ctx.fillRect(0, 0, CANVAS_W, HUD_H);

  const theme = stageForWave(run?.wave ?? 1);
  drawArenaBackground(ctx, ARENA_W, HUD_H, ARENA_H, state.time * 4, theme);

  for (const z of state.groundZones) {
    drawGroundZone(ctx, z);
  }

  for (const e of state.enemies) {
    if (!e.alive) continue;
    drawEnemy(ctx, e);
  }

  for (const s of state.souls) {
    if (!s.alive) continue;
    drawSoulPickup(ctx, s.x, s.y, s.age);
  }

  for (const p of state.projectiles) {
    if (!p.alive) continue;
    const arch = p.archetype ?? DEFAULT_PROJECTILE_ARCHETYPE;
    drawArchetypeProjectileTrail(ctx, p, arch);
    drawArchetypeProjectile(ctx, p, arch);
  }

  for (const v of state.vfx) {
    if (!v.alive) continue;
    drawVfx(ctx, v);
  }

  drawWall(ctx, WALL_Y, ARENA_W, theme);
  drawGroundBelow(ctx, WALL_Y + 2, ARENA_W, CANVAS_H - WALL_Y - 2, theme);

  // if (run) drawPlayer(ctx, run);
  if (run) drawDice(ctx, run);

  for (const p of state.popups) {
    if (!p.alive) continue;
    const a = 1 - p.age / p.life;
    drawNumberPopup(ctx, p.x, p.y, p.text, a, p.color, p.size);
  }

  if (state.stageBannerT > 0 && state.stageBannerIdx >= 0) {
    drawStageBanner(ctx, state.stageBannerIdx, state.stageBannerT);
  }

  if (state.frenzyActive) {
    drawFrenzyRing(ctx, state.frenzyT / FRENZY_DURATION, state.time);
  }

  if (state.screenFlashT > 0) {
    ctx.globalAlpha = state.screenFlashT * 1.2;
    ctx.fillStyle = state.screenFlashColor;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.globalAlpha = 1;
  }

  if (getScreenFlashesEnabled() && state.iframeT > 0 && Math.floor(state.time * 20) % 2 === 0) {
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = palHex('h')!;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

function drawGroundZone(ctx: CanvasRenderingContext2D, z: GroundZone): void {
  const progress = Math.max(0, Math.min(1, z.t / z.duration));
  const alpha = 0.45 * (1 - progress);
  if (z.kind === 'flame') {
    drawFlamePillar(ctx, z.x, z.y, z.radius, progress, alpha);
  } else if (z.kind === 'frost') {
    drawFreezeCrystal(ctx, z.x, z.y, z.radius * 0.8, alpha);
    drawRing(ctx, z.x, z.y, z.radius, ELEMENT_COLORS.ice, alpha);
  } else {
    drawRing(ctx, z.x, z.y, z.radius, ELEMENT_COLORS[z.element], alpha);
  }
}

function drawEnemy(ctx: CanvasRenderingContext2D, e: Enemy): void {
  const type = getEnemyType(e.typeId);
  const spriteId = type?.spriteId ?? 'enemy_rusher';
  const sprite = getSprite(spriteId);
  if (!sprite) return;
  const anim = e.state === 'die' ? 'die' : 'walk';
  const animRate = e.freeze > 0 ? 1 : e.slow > 0 ? 2 : 4;
  const idx = anim === 'die' ? 2 : Math.floor(e.age * animRate) % 2;
  const invisible = e.typeId === 'invisible' && e.y < WALL_Y - 100;
  if (invisible) {
    ctx.globalAlpha = 0.2 + Math.sin(e.age * 3) * 0.1;
  }
  drawSprite(ctx, sprite, idx, e.x, e.y, false, e.hitFlash > 0 ? '#fff' : undefined, e.hitFlash > 0 ? 0.7 : 0);
  ctx.globalAlpha = 1;
  if (type?.family && e.state !== 'die') {
    drawHouseFamilyMark(ctx, type.family, e.x, e.y - e.radius - 3, e.isBoss ? 1.35 : 1);
  }

  if (e.freeze > 0) {
    drawFreezeCrystal(ctx, e.x, e.y, e.radius * 1.05, 0.68 + Math.sin(e.age * 10) * 0.1);
  } else if (e.slow > 0) {
    drawSlowAura(ctx, e.x, e.y, e.radius * 1.1, e.age, Math.min(0.45, e.slow));
  }
  if (e.poisonT > 0 && e.poisonDps > 0) {
    drawStatusEmbers(ctx, e.x, e.y, e.radius * 0.8, e.age, e.poisonDps > 10 ? 0.35 : 0.2);
  }
  if (e.poisonT > 0) {
    drawPoisonCloud(ctx, e.x, e.y, e.radius * 0.8, e.age, 0.4);
  }
  if (e.charged > 0) {
    const ox = Math.sin(e.age * 18) * e.radius;
    drawLightningBolt(ctx, e.x - ox, e.y - e.radius, e.x + ox, e.y + e.radius, 0.5);
  }
  if (e.voidMark > 0) {
    drawVoidRune(ctx, e.x, e.y, e.radius * 1.25, e.age, 0.65);
  }

  // Bosses always show a bar; regular enemies follow the user pref
  // (off / only when damaged / always).
  let showBar = e.isBoss;
  if (!showBar) {
    const mode = getEnemyHpBarMode();
    if (mode === 'always') showBar = true;
    else if (mode === 'damaged') showBar = e.hp < e.maxHp;
  }
  if (showBar) {
    const barW = Math.min(type?.isBoss ? 48 : 16, e.radius * 2);
    const barX = Math.round(e.x - barW / 2);
    const barY = Math.round(e.y - e.radius - 6);
    ctx.fillStyle = palHex('0')!;
    ctx.fillRect(barX - 1, barY - 1, barW + 2, 3);
    ctx.fillStyle = palHex('f')!;
    ctx.fillRect(barX, barY, barW, 1);
    ctx.fillStyle = palHex('m')!;
    const hpFrac = e.maxHp > 0 ? Math.max(0, Math.min(1, e.hp / e.maxHp)) : 0;
    ctx.fillRect(barX, barY, Math.round(hpFrac * barW), 1);
  }
}

function drawHouseFamilyMark(
  ctx: CanvasRenderingContext2D,
  family: HouseEnemyFamily,
  x: number,
  y: number,
  scale: number,
): void {
  const color = houseFamilyColor(family);
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.scale(scale, scale);
  ctx.globalAlpha = 0.78;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1;
  switch (family) {
    case 'debt':
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillRect(-1, -2, 2, 4);
      break;
    case 'vault':
      ctx.strokeRect(-3, -3, 6, 6);
      ctx.fillRect(-1, -1, 2, 2);
      break;
    case 'brood':
      ctx.beginPath();
      ctx.arc(-3, 1, 2, 0, Math.PI * 2);
      ctx.arc(2, 1, 2, 0, Math.PI * 2);
      ctx.arc(0, -2, 2, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'mirror':
      ctx.beginPath();
      ctx.moveTo(0, -4);
      ctx.lineTo(4, 0);
      ctx.lineTo(0, 4);
      ctx.lineTo(-4, 0);
      ctx.closePath();
      ctx.stroke();
      break;
    case 'null':
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillRect(-1, -1, 2, 2);
      break;
    case 'grave':
      ctx.fillRect(-1, -4, 2, 8);
      ctx.fillRect(-4, -1, 8, 2);
      break;
    case 'court':
      ctx.beginPath();
      ctx.moveTo(-4, 2);
      ctx.lineTo(-3, -3);
      ctx.lineTo(0, 1);
      ctx.lineTo(3, -3);
      ctx.lineTo(4, 2);
      ctx.closePath();
      ctx.stroke();
      break;
    case 'suture':
      ctx.beginPath();
      ctx.moveTo(-4, 3);
      ctx.lineTo(4, -3);
      ctx.stroke();
      ctx.fillRect(-3, -2, 1, 4);
      ctx.fillRect(2, -2, 1, 4);
      break;
    case 'furnace':
      ctx.beginPath();
      ctx.moveTo(0, -5);
      ctx.lineTo(4, 3);
      ctx.lineTo(-4, 3);
      ctx.closePath();
      ctx.stroke();
      break;
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

function houseFamilyColor(family: HouseEnemyFamily): string {
  switch (family) {
    case 'debt':
      return palHex('y')!;
    case 'vault':
      return palHex('u')!;
    case 'brood':
      return palHex('P')!;
    case 'mirror':
      return palHex('S')!;
    case 'null':
      return palHex('E')!;
    case 'grave':
      return palHex('T')!;
    case 'court':
      return palHex('O')!;
    case 'suture':
      return palHex('L')!;
    case 'furnace':
      return palHex('K')!;
  }
}

function drawVfx(ctx: CanvasRenderingContext2D, v: VfxParticle): void {
  const a = 1 - v.age / v.life;
  switch (v.kind) {
    case 'spark':
      drawSpark(ctx, v.x, v.y, v.size, v.color, v.color);
      break;
    case 'ring':
      drawRing(ctx, v.x, v.y, v.size * (1 + v.age / v.life), v.color, a);
      break;
    case 'muzzle':
      drawMuzzleFlash(ctx, v.x, v.y, v.angle, a, v.color);
      break;
    case 'explosion':
      drawExplosion(ctx, v.x, v.y, v.size * (1 + v.age / v.life * 0.5), v.age / v.life, 'fire');
      break;
    case 'heal':
      drawHealParticle(ctx, v.x, v.y, a);
      break;
    case 'shield':
      drawShieldBubble(ctx, v.x, v.y, v.size * (1 + v.age / v.life * 0.5), v.age * 8, 4);
      break;
    case 'poison':
      drawPoisonCloud(ctx, v.x, v.y, v.size * 1.5, v.age * 8, a);
      break;
    case 'freeze':
      drawFreezeCrystal(ctx, v.x, v.y, v.size, a);
      break;
    case 'lightning':
      if (v.data !== undefined) {
        const { x, y } = decodePos(v.data);
        drawLightningBolt(ctx, v.x, v.y, x, y, a);
      }
      break;
    case 'flamePillar':
      drawFlamePillar(ctx, v.x, v.y, v.size, v.age / v.life, a);
      break;
    case 'slow':
      drawSlowAura(ctx, v.x, v.y, v.size, v.age, a);
      break;
    case 'void':
      drawVoidRune(ctx, v.x, v.y, v.size, v.age, a);
      break;
    case 'soul':
      drawSoulPickup(ctx, v.x, v.y, v.age);
      break;
    case 'reaction':
      drawReactionPop(ctx, v.x, v.y, v.age / v.life, v.color);
      break;
    case 'trail':
      ctx.globalAlpha = a;
      ctx.fillStyle = v.color;
      ctx.fillRect(Math.round(v.x) - 1, Math.round(v.y) - 1, 2, 2);
      ctx.globalAlpha = 1;
      break;
    default:
      break;
  }
}

function drawStageBanner(ctx: CanvasRenderingContext2D, stageIdx: number, remaining: number): void {
  const stage = STAGES[stageIdx];
  if (!stage) return;
  const DUR = 2.8;
  const elapsed = Math.max(0, DUR - remaining);
  let alpha: number;
  if (elapsed < 0.35) alpha = elapsed / 0.35;
  else if (remaining < 0.6) alpha = remaining / 0.6;
  else alpha = 1;
  alpha = Math.max(0, Math.min(1, alpha));

  const cy = HUD_H + 60;
  const slide = elapsed < 0.35 ? (1 - elapsed / 0.35) * -6 : 0;

  ctx.save();
  ctx.globalAlpha = alpha * 0.55;
  ctx.fillStyle = palHex('0')!;
  ctx.fillRect(0, cy - 16 + slide, CANVAS_W, 36);

  ctx.globalAlpha = alpha * 0.8;
  ctx.fillStyle = stage.silhouetteColor;
  ctx.fillRect(0, cy - 17 + slide, CANVAS_W, 1);
  ctx.fillRect(0, cy + 19 + slide, CANVAS_W, 1);

  ctx.globalAlpha = alpha;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold 12px 'Press Start 2P', 'Silkscreen', 'Courier New', monospace`;
  ctx.fillStyle = palHex('0')!;
  ctx.fillText(stage.name, CANVAS_W / 2 + 1, cy + 1 + slide);
  ctx.fillStyle = stage.starColor;
  ctx.fillText(stage.name, CANVAS_W / 2, cy + slide);

  ctx.font = `8px 'Silkscreen', 'Courier New', monospace`;
  ctx.globalAlpha = alpha * 0.85;
  ctx.fillStyle = palHex('c')!;
  ctx.fillText(stage.subtitle, CANVAS_W / 2, cy + 12 + slide);
  ctx.restore();
  ctx.globalAlpha = 1;
}

function drawFrenzyRing(ctx: CanvasRenderingContext2D, progress: number, time: number): void {
  const remaining = Math.max(0, Math.min(1, 1 - progress));
  const cx = CANVAS_W / 2;
  const cy = HUD_H + 26;
  const baseR = 18;
  const pulse = 1 + Math.sin(time * 14) * 0.08;
  const hot = palHex('h')!;
  const warn = palHex('u')!;

  ctx.save();
  // Faint backing disk so the ring stands out over busy backgrounds.
  ctx.globalAlpha = 0.28;
  ctx.fillStyle = palHex('0')!;
  ctx.beginPath();
  ctx.arc(cx, cy, baseR + 3, 0, Math.PI * 2);
  ctx.fill();

  // Outer track (dim full circle) so the countdown arc reads clearly.
  ctx.globalAlpha = 0.45;
  ctx.strokeStyle = warn;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, baseR, 0, Math.PI * 2);
  ctx.stroke();

  // Countdown arc: starts full, unwinds counter-clockwise to empty.
  ctx.globalAlpha = 0.95;
  ctx.strokeStyle = hot;
  ctx.lineWidth = 3 * pulse;
  const start = -Math.PI / 2;
  const end = start + remaining * Math.PI * 2;
  ctx.beginPath();
  ctx.arc(cx, cy, baseR, start, end);
  ctx.stroke();

  // Label
  ctx.globalAlpha = 0.7 + Math.sin(time * 18) * 0.3;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold 8px 'Press Start 2P', 'Silkscreen', 'Courier New', monospace`;
  ctx.fillStyle = palHex('0')!;
  ctx.fillText('FRENZY', cx + 1, cy - baseR - 6 + 1);
  ctx.fillStyle = hot;
  ctx.fillText('FRENZY', cx, cy - baseR - 6);
  ctx.restore();
  ctx.globalAlpha = 1;
}

function drawRing(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, alpha: number): void {
  ctx.strokeStyle = color;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(Math.round(x), Math.round(y), Math.round(r), 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function spriteIdFor(characterId: string): string {
  return `char_${characterId}`;
}

const FACE_ICON_SLOTS: (HTMLCanvasElement | null)[] = [null, null, null, null, null, null];
let lastIconSignature = '';

function resolveFaceIcons(run: RunState): DieFaceIcons {
  const charId = run.characterId ?? '';
  let sig = charId + '||';
  for (let i = 0; i < 6; i++) {
    sig += (run.slotLayout[i]?.replacerId ?? '') + '|';
  }
  if (sig === lastIconSignature) return FACE_ICON_SLOTS;
  lastIconSignature = sig;
  for (let i = 0; i < 6; i++) {
    const id = run.slotLayout[i]?.replacerId ?? null;
    if (!id) {
      FACE_ICON_SLOTS[i] = null;
      continue;
    }
    const upgrade = getFaceUpgrade(id);
    const rows = getFaceIconRows(id, upgrade?.icon, charId);
    FACE_ICON_SLOTS[i] = rows
      ? buildFaceIconCanvas(rows, getFaceIconCacheKey(id, charId))
      : null;
  }
  return FACE_ICON_SLOTS;
}

function drawDice(ctx: CanvasRenderingContext2D, run: RunState): void {
  const ds = state.dieSprites.size;
  const showNumbers = useStore.getState().settings.showDiceNumbers;
  const faceIcons = showNumbers ? undefined : resolveFaceIcons(run);
  for (const die of state.dice) {
    const cx = PLAYER_X + die.offsetX;
    const cy = DIE_Y;
    const charging = die.charging && run.characterId === 'clockmaker';
    if (charging) {
      const r = ds * 0.45 + die.chargeT * 6;
      ctx.strokeStyle = palHex('y')!;
      ctx.globalAlpha = 0.5 + Math.sin(state.time * 16) * 0.3;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    drawDie(ctx, state.dieSprites, die.value, cx, cy, die.rolling, Math.floor(die.shakeFrame), die.rollT, faceIcons);
    if (charging) {
      const pulse = Math.min(0.45, die.chargeT * 0.2);
      const flicker = 0.6 + Math.sin(state.time * 18) * 0.4;
      const pad = Math.round(ds * 0.41);
      ctx.globalAlpha = pulse * flicker;
      ctx.fillStyle = palHex('y')!;
      ctx.fillRect(cx - pad, cy - pad, pad * 2, pad * 2);
      ctx.globalAlpha = 1;
    }
    if (!die.rolling && die.landedAt > 0 && state.time - die.landedAt < 0.12) {
      const t = (state.time - die.landedAt) / 0.12;
      const flash = Math.round(ds * 0.45);
      ctx.globalAlpha = 0.45 * (1 - t);
      ctx.fillStyle = '#fff';
      ctx.fillRect(cx - flash, cy - flash, flash * 2, flash * 2);
      ctx.globalAlpha = 1;
    }
  }
}

function syncHudToStore(): void {
  const run = state.run;
  if (!run) return;
  const wave = run.wave;
  const score = run.score;
  const hp = Math.max(0, Math.floor(run.hp));
  const maxHp = run.maxHp;
  const shield = run.shield;
  const souls = run.souls;
  const rage = Math.floor(run.rage);
  const gold = run.gold;
  const gambitStacks = run.gambitStacks;
  const characterId = run.characterId;
  const isBossWave = wave % BALANCE.waves.bossEvery === 0;
  const waveProgress = computeWaveProgress();
  const mutator = getRunMutator(run.runMutatorId);
  const runMutatorName = mutator?.name ?? '';
  const runMutatorShortName = mutator?.shortName ?? '';
  const waveArchetypeName = run.currentWaveArchetypeId ? waveArchetypeLabel(run.currentWaveArchetypeId) : '';
  const biome = getBiomeRule(run.currentBiomeRuleId);
  const biomeName = biome?.shortName ?? '';
  const encounterLine = run.currentWaveArchetypeId ? waveArchetypeLine(run.currentWaveArchetypeId) : '';
  const roomLine = biome?.roomLine ?? biome?.desc ?? '';
  const omenLine = mutator?.entryLine ?? mutator?.premise ?? '';
  const forgeBonusLabel = run.nextForgeDiscount
    ? `-${Math.round(run.nextForgeDiscount * 100)}% FORGE`
    : run.guaranteedForgeRarity
      ? `${run.guaranteedForgeRarity.toUpperCase()} FORGE`
      : '';
  const last = state.lastHud;
  if (
    last &&
    last.wave === wave &&
    last.score === score &&
    last.hp === hp &&
    last.maxHp === maxHp &&
    last.shield === shield &&
    last.souls === souls &&
    last.rage === rage &&
    last.gold === gold &&
    last.gambitStacks === gambitStacks &&
    last.characterId === characterId &&
    last.isBossWave === isBossWave &&
    Math.abs(last.waveProgress - waveProgress) < 0.005 &&
    last.runMutatorName === runMutatorName &&
    last.runMutatorShortName === runMutatorShortName &&
    last.waveArchetypeName === waveArchetypeName &&
    last.biomeName === biomeName &&
    last.encounterLine === encounterLine &&
    last.roomLine === roomLine &&
    last.omenLine === omenLine &&
    last.forgeBonusLabel === forgeBonusLabel
  ) {
    return;
  }
  useStore.getState().setHud({
    wave,
    score,
    hp,
    maxHp,
    shield,
    souls,
    rage,
    gold,
    gambitStacks,
    characterId,
    isBossWave,
    waveProgress,
    runMutatorName,
    runMutatorShortName,
    waveArchetypeName,
    biomeName,
    encounterLine,
    roomLine,
    omenLine,
    forgeBonusLabel,
  });
  state.lastHud = {
    wave,
    score,
    hp,
    maxHp,
    shield,
    souls,
    rage,
    gold,
    gambitStacks,
    characterId,
    isBossWave,
    waveProgress,
    runMutatorName,
    runMutatorShortName,
    waveArchetypeName,
    biomeName,
    encounterLine,
    roomLine,
    omenLine,
    forgeBonusLabel,
  };
}

function waveArchetypeLabel(id: NonNullable<RunState['currentWaveArchetypeId']>): string {
  switch (id) {
    case 'rush':
      return 'RUSH';
    case 'escort':
      return 'ESCORT';
    case 'splitterFlood':
      return 'SPLITTERS';
    case 'puzzle':
      return 'RIDDLE';
    case 'ambush':
      return 'AMBUSH';
    case 'eliteDuel':
      return 'ELITE';
    case 'mixed':
      return 'MIXED';
  }
}

function waveArchetypeLine(id: NonNullable<RunState['currentWaveArchetypeId']>): string {
  switch (id) {
    case 'rush':
      return 'Debt hounds pour through the door.';
    case 'escort':
      return 'A House escort protects its collector.';
    case 'splitterFlood':
      return 'Loaded brood are hatching in the lanes.';
    case 'puzzle':
      return 'Sealed enemies test your pips.';
    case 'ambush':
      return 'Mirrors and shadows leave the side doors open.';
    case 'eliteDuel':
      return 'A decorated servant of the House steps forward.';
    case 'mixed':
      return 'The House antes a mixed hand.';
  }
}

function computeWaveProgress(): number {
  const w = state.wave;
  if (!w) return 0;
  if (state.waveClearedT >= 0) return 1;
  const total = w.events.length;
  if (total <= 0) return 0;
  let progressed = state.nextSpawnIdx;
  for (const e of state.enemies) {
    if (!e.alive) continue;
    progressed -= 1;
    const hpFrac = e.maxHp > 0 ? Math.max(0, Math.min(1, e.hp / e.maxHp)) : 0;
    progressed += 1 - hpFrac;
  }
  return Math.max(0, Math.min(1, progressed / total));
}

function syncActiveUpgradesToStore(): void {
  const run = state.run;
  if (!run) return;
  useStore.getState().setActiveUpgrades(run.upgrades.map((u) => ({ id: u.id, stacks: u.stacks })));
}

export function pause(): void {
  if (!state.run) return;
  state.paused = true;
  state.tapQueued = false;
  useStore.getState().setScreen('pause');
}

export function resumeGame(): void {
  if (!state.run) return;
  state.paused = state.paused_upgrade;
  state.tapQueued = false;
  useStore.getState().setScreen('game');
}

export function returnToMainMenu(): void {
  if (!state.run) {
    useStore.getState().setScreen('menu');
    return;
  }
  state.paused = true;
  state.tapQueued = false;
  syncActiveUpgradesToStore();
  syncHudToStore();
  saveRun(state.run);
  useStore.getState().setScreen('menu');
}

export function quitRun(): void {
  state.run = null;
  setRunState(null);
  saveRun(null);
  state.enemies.forEach((e) => (e.alive = false));
  state.projectiles.forEach((p) => (p.alive = false));
  state.vfx.forEach((v) => (v.alive = false));
  state.pendingAttacks = [];
  state.pendingShots = [];
  state.groundZones = [];
  state.timedStrikes = [];
  state.pendingPulses = [];
  state.tapQueued = false;
  state.deathT = 0;
  state.bossWarnT = 0;
  state.lastHud = null;
  useStore.getState().setCasinoState(null);
  useStore.getState().setScreen('menu');
}

export function getEngineState() {
  return state;
}

export function fixedDt(): number {
  return FIXED_DT;
}

// ---------------------------------------------------------------------------
// Debug helpers (activated via the TERMINAL cheat). These are intentionally
// side-effectful and intrusive — they mutate RunState / MetaState directly,
// skipping normal balance checks. Not for production use.
// ---------------------------------------------------------------------------

/** Jump the active run to an arbitrary wave number. Skips upgrade/forge gating. */
export function debugJumpToWave(waveNum: number): boolean {
  const run = state.run;
  if (!run) return false;
  const target = Math.max(1, Math.floor(waveNum));
  run.wave = target;
  state.paused = false;
  state.paused_upgrade = false;
  useStore.getState().setUpgradeOffers([], 0);
  useStore.getState().setForgeShopOffers([]);
  useStore.getState().setForgeShopPurchased(false);
  useStore.getState().setCasinoState(null);
  run.pendingCasino = undefined;
  setupWave(target);
  syncHudToStore();
  return true;
}

/** Add gold to the active run. Negative values subtract (clamped to zero). */
export function debugAddGold(amount: number): boolean {
  const run = state.run;
  if (!run) return false;
  run.gold = Math.max(0, run.gold + Math.floor(amount));
  syncHudToStore();
  return true;
}

/** Fully restore HP, optionally increasing max HP. */
export function debugHeal(extraMaxHp = 0): boolean {
  const run = state.run;
  if (!run) return false;
  if (extraMaxHp > 0) run.maxHp += Math.floor(extraMaxHp);
  run.hp = run.maxHp;
  syncHudToStore();
  return true;
}

/** Grant one free upgrade pick (opens the upgrade screen if offers are rolled). */
export function debugGrantUpgradePick(count = 1): boolean {
  const run = state.run;
  if (!run) return false;
  run.pickCount += Math.max(1, Math.floor(count));
  const offers = generateRunRewardOffers(run);
  useStore.getState().setUpgradeOffers(offers, run.pickCount);
  useStore.getState().setScreen('upgrade');
  state.paused_upgrade = true;
  state.paused = true;
  return true;
}

/** Directly grant a run upgrade/relic (applies its onApply hook). */
export function debugGrantLandmarkUpgrade(id: string): boolean {
  const run = state.run;
  if (!run) return false;
  const u = getUpgrade(id);
  if (!u) return false;
  const existing = run.upgrades.find((a) => a.id === id);
  if (existing) existing.stacks++;
  else run.upgrades.push({ id, stacks: 1 });
  const env = envFor(run);
  u.hooks?.onApply?.(env.ctx);
  if (ensureTwinDice(run)) {
    state.dice = buildDieInstances(run.dice);
  }
  syncActiveUpgradesToStore();
  syncHudToStore();
  return true;
}

/**
 * Grant a concrete face upgrade. When a rank is provided, the matching chain
 * member is installed into the first valid slot so the effect is visible in-run.
 */
export function debugGrantFaceUpgrade(id: string, tier = 1): boolean {
  const run = state.run;
  if (!run) return false;
  const baseUpgrade = getFaceUpgrade(id);
  const targetRank = Math.max(1, Math.min(MAX_TIER, Math.floor(tier)));
  const upgrade = baseUpgrade
    ? listFaceUpgrades().find((u) => getFaceChainId(u) === getFaceChainId(baseUpgrade) && getFaceRank(u) === targetRank) ?? baseUpgrade
    : undefined;
  if (!upgrade) return false;
  if (upgrade.kind !== 'replacer') {
    // Supplements are dormant on the relics branch; keep content listed elsewhere
    // for future design work, but do not install them into active runs.
    return false;
  }
  const character = getCharacter(run.characterId);
  if (!character) return true;

  let installed = false;
  if (upgrade.kind === 'replacer') {
    for (let i = 0; i < run.slotLayout.length; i++) {
      if (isSlotLocked(character, i)) continue;
      const allowed = slotAllowedTags(character, i);
      if (allowed && upgrade.tags && !upgrade.tags.some((t) => allowed.includes(t))) continue;
      const slot = run.slotLayout[i];
      if (!slot) continue;
      if (slot.replacerId !== null) continue;
      slot.replacerId = upgrade.id;
      installed = true;
      break;
    }
  }
  syncOwnedFaceUpgrades(run);
  syncHudToStore();
  return installed;
}

/** Unlocks every character, arsenal weapon, and dice theme in MetaState. */
export function debugUnlockEverything(): void {
  const store = useStore.getState();
  const meta: import('../types').MetaState = { ...store.meta };
  const chars = new Set([...(meta.unlockedCharacters ?? [])]);
  for (const c of listCharacters()) chars.add(c.id);
  meta.unlockedCharacters = Array.from(chars);

  const arsenal = new Set(meta.unlockedArsenal ?? []);
  for (const u of listUpgrades()) {
    if (u.id.startsWith('ars_')) arsenal.add(u.id);
  }
  meta.unlockedArsenal = Array.from(arsenal);

  const themes = new Set([...(meta.unlockedDiceThemes ?? [])]);
  for (const t of ALL_DIE_THEME_IDS) themes.add(t);
  meta.unlockedDiceThemes = Array.from(themes);

  saveMeta(meta);
  store.setMeta(meta);
}

/** Convenience list exporters for the debug UI. */
export function debugListLandmarkUpgrades(): { id: string; name: string }[] {
  return listUpgrades()
    .filter((u) => u.category === 'landmark')
    .map((u) => ({ id: u.id, name: u.name }));
}

export function debugListRelicUpgrades(): { id: string; name: string }[] {
  return listUpgrades()
    .filter((u) => u.category === 'relic')
    .map((u) => ({ id: u.id, name: u.name }));
}

export function debugListBaubleUpgrades(): { id: string; name: string }[] {
  return listUpgrades()
    .filter((u) => u.category === 'bauble')
    .map((u) => ({ id: u.id, name: u.name }));
}

export function debugListFaceUpgrades(): { id: string; name: string; kind: string }[] {
  return listFaceUpgrades()
    .filter((u) => u.kind === 'replacer')
    .map((u) => ({ id: u.id, name: u.name, kind: u.kind }));
}
