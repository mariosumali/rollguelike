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
  ELEMENT_COLORS,
} from '../sprites/effects';
import { buildDieSpriteSet, drawDie, DIE_THEMES, type DieSpriteSet } from '../sprites/dice';
import { getSprite, drawSprite } from '../sprites/sprite';
import { initSprites } from '../sprites';
import { makeAnimState, setAnim, stepAnim, type AnimState } from '../sprites/animation';
import { getCharacter } from '../content/characters/registry';
import { getEnemyType } from '../content/enemies/registry';
import { listUpgrades, getUpgrade } from '../content/upgrades/registry';
import { resolveFace, deriveProjectileColor, findNearestEnemyXY, DEFAULT_AIM } from '../systems/faceResolve';
import { DEFAULT_PROJECTILE_ARCHETYPE } from '../content/characters/projectiles';
import { getReaction, elementalDotDps, reactionEffectElement } from '../systems/elemental';
import { playSfx } from '../audio/sfx';
import { haptic, HAPTIC } from '../audio/haptics';
import { useStore, setRunState } from '../state/store';
import { saveRun, incrementRunsCompleted } from '../state/persistence';
import { palHex } from '../sprites/palette';
import { weighted } from './rng';
import { generateWave } from '../content/waves/generator';
import { pick } from './rng';

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
  streak: number;
  streakMul: number;
}

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
  lastHud: {
    wave: number; score: number; streak: number; hp: number; maxHp: number;
    shield: number; souls: number; rage: number; characterId: string;
    isBossWave: boolean; waveProgress: number;
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
  lastHud: null,
};

export function initEngine(): void {
  initSprites();
  state.dieSprites = buildDieSpriteSet(DIE_THEMES.ivory);
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
  state.lastRolled = null;
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
  state.lastHud = null;

  const run: RunState =
    resumeRun ??
    {
      characterId,
      wave: 1,
      score: 0,
      streak: 0,
      streakFace: null,
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
    };

  state.run = run;
  setRunState(run);
  state.rng = mulberry32(run.seed);
  state.dice = run.dice.map((d) => createDieInstance(d, run.dice.length));

  setAnim(state.playerAnim, 'idle');
  state.playerPose = { kind: 'none', t: 0, dur: 0 };

  const env = envFor(run);
  onApply(env);
  syncActiveUpgradesToStore();
  setupWave(run.wave);
  syncHudToStore();
}

function cloneDie(d: DieConfig): DieConfig {
  return {
    id: d.id,
    faces: d.faces.map((f) => ({ ...f, modifiers: f.modifiers ? { ...f.modifiers } : undefined })),
    rollDuration: d.rollDuration,
    bias: d.bias ? d.bias.slice() : undefined,
  };
}

function createDieInstance(d: DieConfig, total: number): DieInstance {
  const idx = state.dice.length;
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

function envFor(run: RunState) {
  return {
    run,
    rng: state.rng,
    ctx: { wave: run.wave, rng: state.rng } satisfies HookCtx,
  };
}

function setupWave(waveNum: number): void {
  const isBoss = waveNum % BALANCE.waves.bossEvery === 0;
  const run = state.run!;
  state.wave = generateWave(waveNum, state.rng, isBoss);
  state.waveT = 0;
  state.nextSpawnIdx = 0;
  state.spawnedForWave = false;
  state.waveClearedT = -1;
  state.tapQueued = false;
  run.waveStartedAt = state.time;
  fireOnWaveStart(envFor(run), waveNum);

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
  }

  for (let i = state.pendingAttacks.length - 1; i >= 0; i--) {
    const pa = state.pendingAttacks[i]!;
    pa.t += dt;
    if (pa.t >= pa.delay) {
      executeFace(pa.face, pa.dieId, pa.streak, pa.streakMul, run);
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

  for (const e of state.enemies) {
    if (!e.alive) continue;
    updateEnemy(e, dt, run);
  }

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
      resolveRoll(die, face, run);
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

function resolveRoll(die: DieInstance, face: Face, run: RunState): void {
  state.rollCount++;
  const prevStreak = run.streak;
  let streak = prevStreak;
  if (run.streakFace === face.value) streak++;
  else streak = 1;
  run.streak = streak;
  run.streakFace = face.value;
  if (streak > prevStreak) {
    for (const t of BALANCE.combat.streakTierThresholds) {
      if (streak === t) {
        spawnPopup(PLAYER_X, DIE_Y - 22, `STREAK x${t}`, palHex('y')!, 10);
        spawnVfx({ x: PLAYER_X, y: DIE_Y - 4, life: 0.5, kind: 'ring', color: palHex('y')!, size: 14 });
        addTrauma(0.08);
        haptic(HAPTIC.shield);
        break;
      }
    }
  }
  const streakMul = Math.min(
    BALANCE.combat.streakMulMax,
    1 + BALANCE.combat.streakMulPerStack * (streak - 1),
  );
  fireOnRoll(envFor(run), face, streak, die.config.id);
  emitEvent('roll-land', { face, streak });
  state.pendingAttacks.push({
    face,
    dieId: die.config.id,
    t: 0,
    delay: 0.04,
    streak,
    streakMul,
  });

  if (run.characterId === 'alchemist' && state.lastRolled && state.lastRolled.element !== face.element) {
    const reaction = getReaction(state.lastRolled.element, face.element);
    if (reaction) triggerReaction(reaction, run);
  }
  state.lastRolled = face;
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

function executeFace(face: Face, dieId: string, streak: number, streakMul: number, run: RunState): void {
  const baseDmg = (BALANCE.combat.baseFaceDamage[face.value] ?? 10) * streakMul * (face.damageMul ?? 1);
  const roll: RollResult = { face, streak, streakMul, dieId };
  triggerPoseForFace(face);
  announceFace(face);
  resolveFace(face, baseDmg, roll, run, {
    spawnProjectile,
    queueShot: (delay, x, y, damage, f, postSpawn) => {
      state.pendingShots.push({ t: 0, delay, x, y, damage, face: f, postSpawn });
    },
    pulse: (r, dmg, el) => doPulse(r, dmg, el, run),
    addShield: (n) => {
      run.shield = Math.min(BALANCE.combat.shieldMax, run.shield + n);
      spawnShieldVfx();
      playSfx('shield');
      haptic(HAPTIC.shield);
    },
    heal: (amt) => {
      run.hp = Math.min(run.maxHp, run.hp + amt);
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
        executeFace(state.lastRolled, dieId, streak, streakMul, run);
      }
    },
  });
}

function spawnProjectile(x: number, y: number, dx: number, dy: number, damage: number, face: Face): Projectile {
  const run = state.run!;
  const ch = getCharacter(run.characterId);
  const archetype = ch?.baseProjectile ?? DEFAULT_PROJECTILE_ARCHETYPE;
  const p = acquire(state.projectiles, makeProjectile);
  resetProjectile(p);
  const len = Math.hypot(dx, dy) || 1;
  const speed = BALANCE.combat.projectileSpeed * (archetype.speedMul ?? 1);
  p.x = x;
  p.y = y;
  p.vx = (dx / len) * speed;
  p.vy = (dy / len) * speed;
  p.radius = archetype.radius;
  p.damage = damage;
  p.maxAge = BALANCE.combat.projectileLife * (archetype.lifeMul ?? 1);
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
      const type = getEnemyType(e.typeId);
      if (type?.damageFilter) {
        const streak = run.streak;
        const ok = type.damageFilter({ face: { value: p.sourceFaceValue, kind: 'SHOT', element: p.element }, streak, streakMul: 1, dieId: '' });
        if (!ok) {
          spawnPopup(e.x, e.y - 6, 'IMM', '#9fa7bd', 8);
          spawnVfx({ x: e.x, y: e.y, life: 0.2, kind: 'spark', color: '#9fa7bd', size: 1 });
          if (p.pierce > 0) p.pierce--;
          else p.alive = false;
          if (!p.alive) return;
          continue;
        }
      }
      p.archetype?.onHit?.(p, e, run);
      hitEnemy(e, p.damage, p.element, run, p);
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
        run.hp = Math.min(run.maxHp, run.hp + p.lifesteal);
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

function hitEnemy(e: Enemy, damage: number, element: string, run: RunState, p?: Projectile): void {
  let dmg = damage;
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
  e.hp -= dmg;
  e.hitFlash = 0.12;
  addTrauma(0.06);
  spawnVfx({ x: e.x, y: e.y, life: 0.24, kind: 'spark', color: ELEMENT_COLORS[element as 'none'] ?? '#fff', size: 2 });
  spawnPopup(e.x, e.y - 8, Math.floor(dmg).toString(), popupColor(dmg), dmg > 25 ? 10 : 8);
  if (element === 'fire') {
    e.poisonT = Math.max(e.poisonT, 2);
    e.poisonDps = Math.max(e.poisonDps, elementalDotDps('fire', dmg));
  } else if (element === 'poison') {
    e.poisonT = Math.max(e.poisonT, 3);
    e.poisonDps = Math.max(e.poisonDps, elementalDotDps('poison', dmg));
  } else if (element === 'ice') {
    e.freeze = Math.max(e.freeze, 1.2);
    e.slow = Math.max(e.slow, 0.5);
  } else if (element === 'lightning') {
    e.freeze = Math.max(e.freeze, BALANCE.combat.lightningStunT);
    e.slow = Math.max(e.slow, 0.6);
    const exclude = new Set<number>([e.id]);
    const next = findNearestEnemy(e.x, e.y, exclude);
    if (next) {
      drawChainLightning(e.x, e.y, next.x, next.y);
      const chainDmg = dmg * BALANCE.combat.lightningChainDamageMul;
      hitEnemy(next, chainDmg, 'none', run);
    }
  }
  if (e.chill >= 2 && e.hp > 0) {
    e.chill = 0;
    e.freeze = Math.max(e.freeze, 1.5);
    e.slow = Math.max(e.slow, 0.65);
    spawnVfx({ x: e.x, y: e.y, life: 0.4, kind: 'freeze', color: palHex('q')!, size: 8 });
  }
  if (e.radiance >= 5 && e.hp > 0) {
    const exec = e.maxHp * 0.22;
    e.hp -= exec;
    spawnPopup(e.x, e.y - 22, `RADIANT -${exec | 0}`, palHex('y')!, 10);
    spawnVfx({ x: e.x, y: e.y, life: 0.45, kind: 'ring', color: palHex('y')!, size: 14 });
    e.radiance = 0;
  }
  playSfx('hit');
  if (e.hp <= 0) killEnemy(e, run, p);
}

function killEnemy(e: Enemy, run: RunState, _p?: Projectile): void {
  if (e.state === 'die') return;
  e.state = 'die';
  e.dieT = 0.3;
  e.hitFlash = 0;
  run.kills++;
  run.score += BALANCE.scoring.perKill(run.wave);
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
  type?.onDeath?.(e);
  fireOnKill(envFor(run), e);
  if (run.characterId === 'necromancer') spawnSoul(e.x, e.y);
  if (run.characterId === 'berserker') {
    run.rage = Math.min(10, run.rage + 1);
  }
  playSfx(e.isBoss ? 'boss_kill' : 'kill');
  if (e.isBoss) {
    run.score += BALANCE.scoring.bossClearBonus(run.wave);
    state.hitStopT = 0.18;
    haptic(HAPTIC.bossKill);
    addTrauma(0.35);
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

function doPulse(radius: number, damage: number, element: string, run: RunState): void {
  doPulseAt(PLAYER_X, PLAYER_Y - 6, radius, damage, element, run);
  spawnVfx({ x: PLAYER_X, y: PLAYER_Y - 6, life: 0.45, kind: 'ring', color: ELEMENT_COLORS[element as 'none'] ?? '#fff', size: radius });
  playSfx('pulse');
}

function doPulseAt(cx: number, cy: number, radius: number, damage: number, element: string, run: RunState): void {
  for (const e of state.enemies) {
    if (!e.alive || e.state === 'die') continue;
    const dx = e.x - cx;
    const dy = e.y - cy;
    if (dx * dx + dy * dy <= radius * radius) {
      hitEnemy(e, damage, element, run);
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
        run.souls += 1;
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

function spawnPopup(x: number, y: number, text: string, color: string, size: number): void {
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
  e.x = ev.x;
  e.y = HUD_H - (type.isBoss ? 30 : 12);
  e.vy = 0;
  e.vx = 0;
  e.radius = type.radius;
  const hpMul = type.isBoss ? 8 + state.run!.wave * 0.6 : 1;
  e.maxHp = Math.round(type.baseHp * BALANCE.enemy.hpScale(state.run!.wave) * hpMul);
  e.hp = e.maxHp;
  e.speed = type.baseSpeed * BALANCE.enemy.speedScale(state.run!.wave);
  e.elite = ev.elite;
  e.isBoss = type.isBoss ?? false;
}

function updateEnemy(e: Enemy, dt: number, run: RunState): void {
  e.age += dt;
  e.hitFlash = Math.max(0, e.hitFlash - dt);
  if (state.run?.lockedFaceTimer !== undefined && state.run.lockedFaceTimer > 0) {
    state.run.lockedFaceTimer -= dt;
    if (state.run.lockedFaceTimer <= 0) state.run.lockedFaceValue = undefined;
  }
  if (e.poisonT > 0) {
    const prev = e.hp;
    e.hp -= e.poisonDps * dt;
    e.poisonT -= dt;
    if (Math.floor(prev * 0.1) !== Math.floor(e.hp * 0.1)) {
      spawnVfx({ x: e.x + (state.rng() - 0.5) * 6, y: e.y, life: 0.4, kind: 'poison', color: palHex('z')!, size: 2 });
    }
    if (e.hp <= 0) {
      killEnemy(e, run);
      return;
    }
  }
  if (e.freeze > 0) {
    e.freeze -= dt;
    if (e.freeze <= 0) e.slow = Math.max(0, e.slow - 0.5);
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
  const freezeMul = e.freeze > 0 ? 0.15 : 1 - e.slow;
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
  if (run.shield > 0) {
    run.shield--;
    spawnShieldVfx();
    playSfx('shield_block');
    haptic(HAPTIC.shield);
    state.iframeT = 0.3;
    return;
  }
  let amt = onDamaged(envFor(run), raw);
  if (amt <= 0) return;
  run.hp -= amt;
  state.iframeT = BALANCE.player.iframeDuration;
  state.screenFlashT = 0.2;
  state.screenFlashColor = palHex('h')!;
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
  incrementRunsCompleted(run.wave - 1, run.score, run.characterId, run.kills);
  state.deathT = 1.4;
}

function allEnemiesDead(): boolean {
  for (const e of state.enemies) if (e.alive) return false;
  return true;
}

function endWave(run: RunState): void {
  run.score += BALANCE.scoring.waveClearBonus(run.wave);
  const isBoss = run.wave % BALANCE.waves.bossEvery === 0;
  fireOnWaveEnd(envFor(run), run.wave);
  playSfx('wave_clear');
  state.paused_upgrade = true;
  state.paused = true;
  run.pickCount = isBoss ? BALANCE.upgrade.picksOnBoss : BALANCE.upgrade.picksPerWave;
  const offers = generateUpgradeOffers(run);
  useStore.getState().setUpgradeOffers(offers, run.pickCount);
  useStore.getState().setScreen('upgrade');
  syncActiveUpgradesToStore();
  saveRun(run);
}

function generateUpgradeOffers(run: RunState) {
  const wave = run.wave;
  const weights = BALANCE.upgrade.rarityWeights(wave);
  const meta = useStore.getState().meta;
  const unlockedArsenal = new Set(meta.unlockedArsenal ?? []);
  const all = listUpgrades().filter((u) => {
    if (u.minWave && u.minWave > wave) return false;
    if (u.characterExclusive && u.characterExclusive !== run.characterId) return false;
    const ap = run.upgrades.find((a) => a.id === u.id);
    if (ap && ap.stacks >= u.maxStack) return false;
    if (u.id.startsWith('ars_') && !unlockedArsenal.has(u.id)) return false;
    if (u.unlockCondition && !u.unlockCondition(meta)) return false;
    return true;
  });
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
      const u = pick(state.rng, fallback);
      chosen.add(u.id);
      offers.push({ id: u.id, rarity: u.rarity });
      continue;
    }
    const u = pick(state.rng, bucket);
    chosen.add(u.id);
    offers.push({ id: u.id, rarity: u.rarity });
  }
  return offers;
}

export function rerollUpgradeOffers(): void {
  const run = state.run;
  if (!run) return;
  const offers = generateUpgradeOffers(run);
  useStore.getState().setUpgradeOffers(offers, run.pickCount);
  playSfx('ui_reroll');
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
  run.pickCount--;
  playSfx('upgrade_pick');
  haptic(HAPTIC.upgrade);
  if (run.pickCount > 0) {
    const offers = generateUpgradeOffers(run);
    useStore.getState().setUpgradeOffers(offers, run.pickCount);
  } else {
    useStore.getState().setUpgradeOffers([], 0);
    proceedToNextWave();
  }
  syncActiveUpgradesToStore();
}

function proceedToNextWave(): void {
  const run = state.run;
  if (!run) return;
  run.wave++;
  state.paused_upgrade = false;
  state.paused = false;
  setupWave(run.wave);
  useStore.getState().setScreen('game');
}

function diceReadyToRoll(): boolean {
  const cd = BALANCE.die.postRollCooldown;
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
          e.poisonT = Math.max(e.poisonT, 0.9);
          e.poisonDps = Math.max(e.poisonDps, 12);
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
          hitEnemy(e, zapDmg, 'lightning', run);
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

  if (run) drawPlayer(ctx, run);
  if (run) drawDice(ctx, run);

  for (const p of state.popups) {
    if (!p.alive) continue;
    const a = 1 - p.age / p.life;
    drawNumberPopup(ctx, p.x, p.y, p.text, a, p.color, p.size);
  }

  if (state.stageBannerT > 0 && state.stageBannerIdx >= 0) {
    drawStageBanner(ctx, state.stageBannerIdx, state.stageBannerT);
  }

  if (state.screenFlashT > 0) {
    ctx.globalAlpha = state.screenFlashT * 1.2;
    ctx.fillStyle = state.screenFlashColor;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.globalAlpha = 1;
  }

  if (state.iframeT > 0 && Math.floor(state.time * 20) % 2 === 0) {
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = palHex('h')!;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

function drawEnemy(ctx: CanvasRenderingContext2D, e: Enemy): void {
  const type = getEnemyType(e.typeId);
  const spriteId = type?.spriteId ?? 'enemy_rusher';
  const sprite = getSprite(spriteId);
  if (!sprite) return;
  const anim = e.state === 'die' ? 'die' : 'walk';
  const idx = anim === 'die' ? 2 : Math.floor(e.age * 4) % 2;
  const invisible = e.typeId === 'invisible' && e.y < WALL_Y - 100;
  if (invisible) {
    ctx.globalAlpha = 0.2 + Math.sin(e.age * 3) * 0.1;
  }
  drawSprite(ctx, sprite, idx, e.x, e.y, false, e.hitFlash > 0 ? '#fff' : undefined, e.hitFlash > 0 ? 0.7 : 0);
  ctx.globalAlpha = 1;

  if (e.freeze > 0) {
    drawFreezeCrystal(ctx, e.x, e.y, e.radius * 0.7, 0.5 + Math.sin(e.age * 10) * 0.1);
  }
  if (e.poisonT > 0) {
    drawPoisonCloud(ctx, e.x, e.y, e.radius * 0.8, e.age, 0.4);
  }

  if (e.isBoss || e.hp < e.maxHp) {
    const barW = Math.min(type?.isBoss ? 48 : 16, e.radius * 2);
    const barX = Math.round(e.x - barW / 2);
    const barY = Math.round(e.y - e.radius - 6);
    ctx.fillStyle = palHex('0')!;
    ctx.fillRect(barX - 1, barY - 1, barW + 2, 3);
    ctx.fillStyle = palHex('f')!;
    ctx.fillRect(barX, barY, barW, 1);
    ctx.fillStyle = palHex('m')!;
    ctx.fillRect(barX, barY, Math.round((e.hp / e.maxHp) * barW), 1);
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
  ctx.font = `bold 12px 'Courier New', monospace`;
  ctx.fillStyle = palHex('0')!;
  ctx.fillText(stage.name, CANVAS_W / 2 + 1, cy + 1 + slide);
  ctx.fillStyle = stage.starColor;
  ctx.fillText(stage.name, CANVAS_W / 2, cy + slide);

  ctx.font = `8px 'Courier New', monospace`;
  ctx.globalAlpha = alpha * 0.85;
  ctx.fillStyle = palHex('c')!;
  ctx.fillText(stage.subtitle, CANVAS_W / 2, cy + 12 + slide);
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

function drawPlayer(ctx: CanvasRenderingContext2D, run: RunState): void {
  const sprite = getSprite(spriteIdFor(run.characterId));
  if (!sprite) return;
  if (run.shield > 0) {
    drawShieldBubble(ctx, PLAYER_X, PLAYER_Y - 10, 14, state.time * 4, Math.min(4, run.shield));
  }
  if (run.characterId === 'berserker' && run.rage > 0) {
    const a = Math.min(0.8, run.rage / 10);
    ctx.globalAlpha = a * (0.4 + Math.sin(state.time * 10) * 0.2);
    ctx.fillStyle = palHex('L')!;
    ctx.fillRect(PLAYER_X - 13, PLAYER_Y - 22, 26, 24);
    ctx.globalAlpha = 1;
  }
  const { tint, tintAlpha, dy } = resolvePoseVisual(state.playerPose);
  drawSprite(ctx, sprite, state.playerAnim.frameIdx, PLAYER_X, PLAYER_Y + 4 + dy, false, tint, tintAlpha);
}

function resolvePoseVisual(pose: PlayerPose): { tint?: string; tintAlpha: number; dy: number } {
  if (pose.kind === 'none' || pose.dur <= 0) return { tintAlpha: 0, dy: 0 };
  const p = Math.min(1, pose.t / pose.dur);
  const wave = Math.sin(p * Math.PI);
  switch (pose.kind) {
    case 'attack':
      return { tint: palHex('y')!, tintAlpha: wave * 0.45, dy: wave * 2 };
    case 'burst':
      return { tint: palHex('v')!, tintAlpha: wave * 0.5, dy: wave * 1 };
    case 'bomb':
      return { tint: palHex('u')!, tintAlpha: wave * 0.55, dy: wave * 2 };
    case 'rage':
      return { tint: palHex('L')!, tintAlpha: wave * 0.7, dy: wave * 2 };
    case 'charged':
      return { tint: palHex('x')!, tintAlpha: wave * 0.6, dy: wave * 1 };
    case 'pulse':
      return { tint: palHex('q')!, tintAlpha: wave * 0.55, dy: -wave * 2 };
    case 'drain':
      return { tint: palHex('H')!, tintAlpha: wave * 0.65, dy: -wave * 2 };
    case 'shield':
      return { tint: palHex('q')!, tintAlpha: wave * 0.7, dy: 0 };
    case 'heal':
      return { tint: palHex('m')!, tintAlpha: wave * 0.7, dy: -wave * 1 };
    case 'wild': {
      const hues = ['u', 'y', 'q', 'z', 'H'];
      const hue = hues[Math.floor(pose.t * 24) % hues.length]!;
      return { tint: palHex(hue)!, tintAlpha: wave * 0.65, dy: 0 };
    }
    case 'blank':
      return { tint: palHex('b')!, tintAlpha: wave * 0.4, dy: wave * 1 };
    default:
      return { tintAlpha: 0, dy: 0 };
  }
}

function drawDice(ctx: CanvasRenderingContext2D, run: RunState): void {
  for (const die of state.dice) {
    const cx = PLAYER_X + die.offsetX;
    const cy = DIE_Y;
    const charging = die.charging && run.characterId === 'clockmaker';
    if (charging) {
      const r = 10 + die.chargeT * 6;
      ctx.strokeStyle = palHex('y')!;
      ctx.globalAlpha = 0.5 + Math.sin(state.time * 16) * 0.3;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    drawDie(ctx, state.dieSprites, die.value, cx, cy, die.rolling, Math.floor(die.shakeFrame), die.rollT);
    if (charging) {
      const pulse = Math.min(0.45, die.chargeT * 0.2);
      const flicker = 0.6 + Math.sin(state.time * 18) * 0.4;
      ctx.globalAlpha = pulse * flicker;
      ctx.fillStyle = palHex('y')!;
      ctx.fillRect(cx - 9, cy - 9, 18, 18);
      ctx.globalAlpha = 1;
    }
    if (!die.rolling && die.landedAt > 0 && state.time - die.landedAt < 0.12) {
      const t = (state.time - die.landedAt) / 0.12;
      ctx.globalAlpha = 0.45 * (1 - t);
      ctx.fillStyle = '#fff';
      ctx.fillRect(cx - 10, cy - 10, 20, 20);
      ctx.globalAlpha = 1;
    }
  }
}

function syncHudToStore(): void {
  const run = state.run;
  if (!run) return;
  const wave = run.wave;
  const score = run.score;
  const streak = run.streak;
  const hp = Math.max(0, Math.floor(run.hp));
  const maxHp = run.maxHp;
  const shield = run.shield;
  const souls = run.souls;
  const rage = Math.floor(run.rage);
  const characterId = run.characterId;
  const isBossWave = wave % BALANCE.waves.bossEvery === 0;
  const waveProgress = computeWaveProgress();
  const last = state.lastHud;
  if (
    last &&
    last.wave === wave &&
    last.score === score &&
    last.streak === streak &&
    last.hp === hp &&
    last.maxHp === maxHp &&
    last.shield === shield &&
    last.souls === souls &&
    last.rage === rage &&
    last.characterId === characterId &&
    last.isBossWave === isBossWave &&
    Math.abs(last.waveProgress - waveProgress) < 0.005
  ) {
    return;
  }
  useStore.getState().setHud({
    wave,
    score,
    streak,
    hp,
    maxHp,
    shield,
    souls,
    rage,
    characterId,
    isBossWave,
    waveProgress,
  });
  state.lastHud = { wave, score, streak, hp, maxHp, shield, souls, rage, characterId, isBossWave, waveProgress };
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

export function quitRun(): void {
  state.run = null;
  setRunState(null);
  saveRun(null);
  state.enemies.forEach((e) => (e.alive = false));
  state.projectiles.forEach((p) => (p.alive = false));
  state.vfx.forEach((v) => (v.alive = false));
  state.pendingAttacks = [];
  state.pendingShots = [];
  state.tapQueued = false;
  state.deathT = 0;
  state.bossWarnT = 0;
  state.lastHud = null;
  useStore.getState().setScreen('menu');
}

export function getEngineState() {
  return state;
}

export function fixedDt(): number {
  return FIXED_DT;
}
