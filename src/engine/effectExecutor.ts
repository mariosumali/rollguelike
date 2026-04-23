import type { Effect, FaceUpgrade, SlotState } from '../content/upgrades/types';
import type { Face, RunState } from '../types';
import type { FaceOps } from '../systems/faceResolve';
import { getFaceUpgrade } from '../content/upgrades/faceRegistry';
import { getAnimationSpec } from '../content/animations/registry';
import { intensity, type TierIntensity } from '../content/animations/types';
import { BALANCE } from '../config/balance';
import { PLAYER_X, PROJECTILE_SPAWN_Y } from '../config/constants';

export interface EffectContext {
  face: Face;
  baseDamage: number;
  run: RunState;
  ops: FaceOps;
  tier: number;
  intensity: TierIntensity;
  upgradeId: string;
  animation: FaceUpgrade['animation'];
}

export function resolveSlot(
  slot: SlotState,
  face: Face,
  baseDamage: number,
  run: RunState,
  ops: FaceOps,
  defaultUpgradeId?: string,
): void {
  const replacerId = slot.replacerId ?? defaultUpgradeId;
  if (replacerId) {
    executeUpgrade(replacerId, 1, face, baseDamage, run, ops);
  }
  for (const suppId of slot.supplementIds) {
    executeUpgrade(suppId, 1, face, baseDamage, run, ops);
  }
}

export function executeUpgrade(
  upgradeId: string,
  tier: number,
  face: Face,
  baseDamage: number,
  run: RunState,
  ops: FaceOps,
): void {
  const upgrade = getFaceUpgrade(upgradeId);
  if (!upgrade) {
    if (import.meta.env?.DEV) {
      console.warn(`[effectExecutor] unknown upgrade id '${upgradeId}'`);
    }
    return;
  }
  const safeTier = Math.max(1, Math.min(5, tier));
  const tierData = upgrade.tiers[safeTier - 1];
  if (!tierData) return;

  const ctx: EffectContext = {
    face,
    baseDamage: baseDamage * (tierData.damageMul ?? 1),
    run,
    ops,
    tier: safeTier,
    intensity: intensity(safeTier),
    upgradeId,
    animation: upgrade.animation,
  };

  for (const effect of tierData.effects) {
    executeEffect(effect, ctx);
  }

  if (safeTier === 5 && upgrade.evolution?.extraEffects) {
    for (const effect of upgrade.evolution.extraEffects) {
      executeEffect(effect, ctx);
    }
  }
}

function executeEffect(effect: Effect, ctx: EffectContext): void {
  switch (effect.verb) {
    case 'fireProjectile':
      verbFireProjectile(effect, ctx);
      break;
    case 'pulse':
      verbPulse(effect, ctx);
      break;
    case 'chain':
      verbChain(effect, ctx);
      break;
    case 'bounce':
      verbBounce(effect, ctx);
      break;
    case 'applyStatus':
      verbApplyStatus(effect, ctx);
      break;
    case 'heal':
      verbHeal(effect, ctx);
      break;
    case 'shield':
      verbShield(effect, ctx);
      break;
    case 'spawnPickup':
      verbSpawnPickup(effect, ctx);
      break;
    case 'pull':
      verbPull(effect, ctx);
      break;
    case 'column':
      verbColumn(effect, ctx);
      break;
    case 'modifyProjectile':
      break;
    case 'orbit':
      verbOrbit(effect, ctx);
      break;
    case 'beam':
      verbBeam(effect, ctx);
      break;
    case 'summonMinion':
      verbSummonMinion(effect, ctx);
      break;
    case 'reflect':
      verbReflect(effect, ctx);
      break;
  }
}

function verbFireProjectile(
  effect: Extract<Effect, { verb: 'fireProjectile' }>,
  ctx: EffectContext,
): void {
  const count = Math.max(1, effect.count);
  const delayStep = BALANCE.combat.shotSequenceDelay;
  const dmg = ctx.baseDamage * (effect.damageMul ?? 1);
  for (let i = 0; i < count; i++) {
    ctx.ops.queueShot(i * delayStep, PLAYER_X, PROJECTILE_SPAWN_Y, dmg, ctx.face, (p) => {
      if (effect.pierce !== undefined) p.pierce = Math.max(p.pierce, effect.pierce);
      if (effect.bounce !== undefined) p.bounces = Math.max(p.bounces, effect.bounce);
      if (effect.homing) p.homing = true;
      if (effect.size !== undefined) p.radius *= effect.size;
    });
  }
}

function verbPulse(effect: Extract<Effect, { verb: 'pulse' }>, ctx: EffectContext): void {
  const repeats = Math.max(1, effect.repeat ?? 1);
  const delay = effect.delay ?? 0;
  const radius = effect.radius * ctx.intensity.scale;
  const dmg = ctx.baseDamage * (effect.damageMul ?? 1);
  for (let i = 0; i < repeats; i++) {
    if (delay > 0 && i > 0) {
      ctx.ops.queueShot(delay * i, PLAYER_X, PROJECTILE_SPAWN_Y, 0, ctx.face);
    }
    ctx.ops.pulse(radius, dmg, ctx.face.element);
  }
}

function verbChain(_effect: Extract<Effect, { verb: 'chain' }>, _ctx: EffectContext): void {
  // TODO(chain): hook into projectile chaining when integrated with engine.
}

function verbBounce(_effect: Extract<Effect, { verb: 'bounce' }>, _ctx: EffectContext): void {
  // TODO(bounce): applied via modifyProjectile today; keep verb for completeness.
}

function verbApplyStatus(
  _effect: Extract<Effect, { verb: 'applyStatus' }>,
  _ctx: EffectContext,
): void {
  // TODO(applyStatus): requires status-effect runtime; no-op scaffold.
}

function verbHeal(effect: Extract<Effect, { verb: 'heal' }>, ctx: EffectContext): void {
  const amount = effect.amount * ctx.intensity.brightness;
  ctx.ops.heal(amount);
}

function verbShield(effect: Extract<Effect, { verb: 'shield' }>, ctx: EffectContext): void {
  ctx.ops.addShield(effect.stacks);
}

function verbSpawnPickup(
  _effect: Extract<Effect, { verb: 'spawnPickup' }>,
  _ctx: EffectContext,
): void {
  // TODO(spawnPickup): awaiting gold/soul pickup runtime integration.
}

function verbPull(_effect: Extract<Effect, { verb: 'pull' }>, _ctx: EffectContext): void {
  // TODO(pull): requires gravity/pull runtime; no-op scaffold.
}

function verbColumn(effect: Extract<Effect, { verb: 'column' }>, ctx: EffectContext): void {
  const count = Math.max(1, effect.count);
  for (let i = 0; i < count; i++) {
    ctx.ops.queueShot(i * effect.delay, PLAYER_X, PROJECTILE_SPAWN_Y, ctx.baseDamage * effect.damageMul, ctx.face);
  }
}

function verbOrbit(_effect: Extract<Effect, { verb: 'orbit' }>, _ctx: EffectContext): void {
  // TODO(orbit): requires Orbiter pool in engine; no-op scaffold.
}

function verbBeam(_effect: Extract<Effect, { verb: 'beam' }>, _ctx: EffectContext): void {
  // TODO(beam): requires continuous beam segment runtime; no-op scaffold.
}

function verbSummonMinion(
  _effect: Extract<Effect, { verb: 'summonMinion' }>,
  _ctx: EffectContext,
): void {
  // TODO(summonMinion): requires Minion pool + autonomous FSM; no-op scaffold.
}

function verbReflect(_effect: Extract<Effect, { verb: 'reflect' }>, _ctx: EffectContext): void {
  // TODO(reflect): requires projectile reflection bit on collision filter; no-op scaffold.
}

export function getTieredAnimationIds(
  upgrade: FaceUpgrade,
  tier: number,
): { cast?: string; projectile?: string; hit?: string; evolution?: string } {
  const useEvolution = tier === 5 && upgrade.animation.evolution;
  return {
    cast: upgrade.animation.cast,
    projectile: upgrade.animation.projectile,
    hit: upgrade.animation.hit,
    evolution: useEvolution ? upgrade.animation.evolution : undefined,
  };
}

export function getAnimationForTier(id: string | undefined, tier: number) {
  if (!id) return { spec: undefined, intensity: intensity(tier) };
  return { spec: getAnimationSpec(id), intensity: intensity(tier) };
}
