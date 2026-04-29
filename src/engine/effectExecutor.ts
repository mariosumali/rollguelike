import type { Effect, FaceUpgrade, SlotState } from '../content/upgrades/types';
import type { Face, RunState, Element } from '../types';
import type { FaceOps } from '../systems/faceResolve';
import { getFaceRank, getFaceUpgrade } from '../content/upgrades/faceRegistry';
import { getAnimationSpec } from '../content/animations/registry';
import { intensity, type TierIntensity } from '../content/animations/types';
import { BALANCE } from '../config/balance';
import { PLAYER_X, PLAYER_Y, PROJECTILE_SPAWN_Y } from '../config/constants';

export interface PendingMods {
  pierce?: number;
  bounces?: number;
  chain?: number;
  aoeOnHit?: number;
  homing?: boolean;
  lifesteal?: number;
  extra?: number;
  sizeMul?: number;
  damageMul?: number;
  speedMul?: number;
  crit?: number;
  burnDps?: number;
  burnDur?: number;
  animTrailId?: string;
}

export interface EffectContext {
  face: Face;
  baseDamage: number;
  run: RunState;
  ops: FaceOps;
  tier: number;
  intensity: TierIntensity;
  upgradeId: string;
  animation: FaceUpgrade['animation'];
  pendingMods: PendingMods;
}

export function resolveSlot(
  slot: SlotState,
  face: Face,
  baseDamage: number,
  run: RunState,
  ops: FaceOps,
  defaultUpgradeId?: string,
): void {
  const shared: PendingMods = {};
  const replacerId = slot.replacerId ?? defaultUpgradeId;
  if (replacerId) {
    executeUpgrade(replacerId, 1, face, baseDamage, run, ops, shared);
  }
  for (const suppId of slot.supplementIds) {
    executeUpgrade(suppId, 1, face, baseDamage, run, ops, shared);
  }
}

export function executeUpgrade(
  upgradeId: string,
  _tier: number,
  face: Face,
  baseDamage: number,
  run: RunState,
  ops: FaceOps,
  sharedMods?: PendingMods,
): void {
  const upgrade = getFaceUpgrade(upgradeId);
  if (!upgrade) {
    if (import.meta.env?.DEV) {
      console.warn(`[effectExecutor] unknown upgrade id '${upgradeId}'`);
    }
    return;
  }
  const safeTier = getFaceRank(upgrade);
  const tierData = upgrade.effect;
  if (!tierData) return;

  const intens = intensity(safeTier);
  const ctx: EffectContext = {
    face,
    baseDamage: baseDamage * (tierData.damageMul ?? 1),
    run,
    ops,
    tier: safeTier,
    intensity: intens,
    upgradeId,
    animation: upgrade.animation,
    pendingMods: sharedMods ?? {},
  };

  ops.playAnim?.(upgrade.animation.cast, PLAYER_X, PROJECTILE_SPAWN_Y, intens);
  if (upgrade.animation.projectile) {
    ctx.pendingMods.animTrailId = upgrade.animation.projectile;
  }

  const effects: Effect[] = [...tierData.effects];

  for (const effect of effects) {
    if (isModifierVerb(effect.verb)) executeEffect(effect, ctx);
  }
  for (const effect of effects) {
    if (!isModifierVerb(effect.verb)) executeEffect(effect, ctx);
  }
}

function isModifierVerb(v: Effect['verb']): boolean {
  return v === 'chain' || v === 'bounce' || v === 'modifyProjectile';
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
    case 'chainLightning':
      verbChainLightning(effect, ctx);
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
    case 'flamePillar':
      verbFlamePillar(effect, ctx);
      break;
    case 'groundZone':
      verbGroundZone(effect, ctx);
      break;
    case 'frostBurst':
      verbFrostBurst(effect, ctx);
      break;
    case 'statusAura':
      verbStatusAura(effect, ctx);
      break;
    case 'modifyProjectile':
      verbModifyProjectile(effect, ctx);
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

function rotateVelocity(p: { vx: number; vy: number }, radians: number): void {
  if (radians === 0) return;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const vx = p.vx;
  const vy = p.vy;
  p.vx = vx * cos - vy * sin;
  p.vy = vx * sin + vy * cos;
}

function applyPendingTo(p: { pierce: number; bounces: number; chain: number; aoeOnHit: number; homing: boolean; lifesteal: number; radius: number; damage: number; vx: number; vy: number; animTrailId?: string; critChance?: number; burnDps?: number; burnDur?: number }, mods: PendingMods): void {
  if (mods.pierce) p.pierce += mods.pierce;
  if (mods.bounces) p.bounces += mods.bounces;
  if (mods.chain) p.chain += mods.chain;
  if (mods.aoeOnHit) p.aoeOnHit = Math.max(p.aoeOnHit, mods.aoeOnHit);
  if (mods.homing) p.homing = true;
  if (mods.lifesteal) p.lifesteal += mods.lifesteal;
  if (mods.sizeMul) p.radius *= mods.sizeMul;
  if (mods.damageMul) p.damage *= mods.damageMul;
  if (mods.speedMul) {
    p.vx *= mods.speedMul;
    p.vy *= mods.speedMul;
  }
  if (mods.crit) p.critChance = Math.max(p.critChance ?? 0, mods.crit);
  if (mods.burnDps) p.burnDps = Math.max(p.burnDps ?? 0, mods.burnDps);
  if (mods.burnDur) p.burnDur = Math.max(p.burnDur ?? 0, mods.burnDur);
  if (mods.animTrailId) p.animTrailId = mods.animTrailId;
}

function verbFireProjectile(
  effect: Extract<Effect, { verb: 'fireProjectile' }>,
  ctx: EffectContext,
): void {
  const count = Math.max(1, effect.count + Math.floor(ctx.pendingMods.extra ?? 0));
  const delayStep = BALANCE.combat.shotSequenceDelay;
  const dmg = ctx.baseDamage * (effect.damageMul ?? 1);
  const mods = ctx.pendingMods;
  for (let i = 0; i < count; i++) {
    ctx.ops.queueShot(i * delayStep, PLAYER_X, PROJECTILE_SPAWN_Y, dmg, ctx.face, (p) => {
      if (effect.element) p.element = effect.element;
      if (effect.pierce !== undefined) p.pierce = Math.max(p.pierce, effect.pierce);
      if (effect.bounce !== undefined) p.bounces = Math.max(p.bounces, effect.bounce);
      if (effect.homing) p.homing = true;
      if (effect.size !== undefined) p.radius *= effect.size;
      if (effect.speed !== undefined) {
        p.vx *= effect.speed;
        p.vy *= effect.speed;
      }
      applyPendingTo(p, mods);
      if (effect.spread && count > 1) {
        const spreadRad = effect.spread > Math.PI * 2 ? (effect.spread * Math.PI) / 180 : effect.spread;
        const offset = (i - (count - 1) / 2) * (spreadRad / Math.max(1, count - 1));
        rotateVelocity(p, offset);
      }
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
      ctx.ops.delayedPulse?.({
        delay: delay * i,
        radius,
        damage: dmg,
        element: effect.element ?? ctx.face.element,
        knockback: effect.knockback ?? 0,
      });
      continue;
    }
    ctx.ops.pulse(radius, dmg, effect.element ?? ctx.face.element, effect.knockback ?? 0);
  }
  ctx.ops.playAnim?.(ctx.animation.hit, PLAYER_X, PLAYER_Y, ctx.intensity);
}

function verbChain(effect: Extract<Effect, { verb: 'chain' }>, ctx: EffectContext): void {
  ctx.pendingMods.chain = (ctx.pendingMods.chain ?? 0) + Math.max(0, effect.maxChains);
}

function verbChainLightning(effect: Extract<Effect, { verb: 'chainLightning' }>, ctx: EffectContext): void {
  ctx.ops.chainLightning?.({
    jumps: Math.max(1, effect.jumps),
    damage: ctx.baseDamage * effect.damageMul,
    radius: effect.radius ?? 80,
    stunDur: effect.stunDur ?? 0,
    element: ctx.face.element === 'none' ? 'lightning' : ctx.face.element,
    fromDie: effect.fromDie ?? true,
  });
}

function verbBounce(effect: Extract<Effect, { verb: 'bounce' }>, ctx: EffectContext): void {
  ctx.pendingMods.bounces = (ctx.pendingMods.bounces ?? 0) + Math.max(0, effect.count);
}

function verbModifyProjectile(
  effect: Extract<Effect, { verb: 'modifyProjectile' }>,
  ctx: EffectContext,
): void {
  const m = ctx.pendingMods;
  if (effect.pierce) m.pierce = (m.pierce ?? 0) + effect.pierce;
  if (effect.bounce) m.bounces = (m.bounces ?? 0) + effect.bounce;
  if (effect.aoeOnHit) m.aoeOnHit = Math.max(m.aoeOnHit ?? 0, effect.aoeOnHit);
  if (effect.homing) m.homing = true;
  if (effect.lifesteal) m.lifesteal = (m.lifesteal ?? 0) + effect.lifesteal;
  if (effect.extra) m.extra = (m.extra ?? 0) + effect.extra;
  if (effect.sizeMul) m.sizeMul = (m.sizeMul ?? 1) * effect.sizeMul;
  if (effect.damageMul) m.damageMul = (m.damageMul ?? 1) * effect.damageMul;
  if (effect.speedMul) m.speedMul = (m.speedMul ?? 1) * effect.speedMul;
  if (effect.crit) m.crit = (m.crit ?? 0) + effect.crit;
  if (effect.burnDps) m.burnDps = Math.max(m.burnDps ?? 0, effect.burnDps);
  if (effect.burnDur) m.burnDur = Math.max(m.burnDur ?? 0, effect.burnDur);
}

function verbApplyStatus(
  effect: Extract<Effect, { verb: 'applyStatus' }>,
  ctx: EffectContext,
): void {
  if (!ctx.ops.applyStatusNearest) return;
  if (effect.chance !== undefined && effect.chance < 1) {
    if (Math.random() > effect.chance) return;
  }
  const duration = effect.duration * ctx.intensity.scale;
  const power = effect.power * ctx.intensity.brightness;
  ctx.ops.applyStatusNearest(effect.status, power, duration);
}

function verbHeal(effect: Extract<Effect, { verb: 'heal' }>, ctx: EffectContext): void {
  const amount = effect.amount * ctx.intensity.brightness;
  ctx.ops.heal(amount);
  ctx.ops.playAnim?.(ctx.animation.hit, PLAYER_X, PLAYER_Y, ctx.intensity);
}

function verbShield(effect: Extract<Effect, { verb: 'shield' }>, ctx: EffectContext): void {
  ctx.ops.addShield(effect.stacks);
  if (effect.reflect && effect.reflect > 0) {
    ctx.ops.startReflect?.({ duration: 3, multiplier: effect.reflect, radius: 80 });
  }
  ctx.ops.playAnim?.(ctx.animation.hit, PLAYER_X, PLAYER_Y, ctx.intensity);
}

function verbSpawnPickup(
  effect: Extract<Effect, { verb: 'spawnPickup' }>,
  ctx: EffectContext,
): void {
  if (effect.chance !== undefined && effect.chance < 1) {
    if (Math.random() > effect.chance) return;
  }
  const amount = Math.max(0, Math.floor(effect.amount * ctx.intensity.brightness));
  if (amount <= 0) return;
  if (effect.kind === 'gold') {
    ctx.ops.addGold?.(amount);
  } else if (effect.kind === 'heal') {
    ctx.ops.heal(amount);
  } else if (effect.kind === 'soul') {
    ctx.run.souls = Math.min(BALANCE.necromancer.soulsMax, ctx.run.souls + amount);
  }
}

function verbPull(effect: Extract<Effect, { verb: 'pull' }>, ctx: EffectContext): void {
  ctx.ops.startPull?.({
    radius: effect.radius * ctx.intensity.scale,
    strength: effect.strength,
    dps: effect.dps * ctx.intensity.brightness,
    duration: effect.duration,
    destroyProjectiles: !!effect.destroyProjectiles,
    element: ctx.face.element,
  });
  ctx.ops.playAnim?.(ctx.animation.hit, PLAYER_X, PLAYER_Y, ctx.intensity);
}

function verbColumn(effect: Extract<Effect, { verb: 'column' }>, ctx: EffectContext): void {
  const count = Math.max(1, effect.count);
  for (let i = 0; i < count; i++) {
    ctx.ops.strikeColumn?.({
      delay: i * effect.delay,
      damage: ctx.baseDamage * effect.damageMul,
      element: ctx.face.element === 'none' ? 'lightning' : ctx.face.element,
      radius: 16 * ctx.intensity.scale,
      stunDur: effect.stunDur ?? 0,
      chainToExtra: effect.chainToExtra ?? 0,
    });
  }
}

function verbFlamePillar(effect: Extract<Effect, { verb: 'flamePillar' }>, ctx: EffectContext): void {
  const count = Math.max(1, effect.count);
  for (let i = 0; i < count; i++) {
    ctx.ops.flamePillar?.({
      delay: i * (effect.delay ?? 0.12),
      radius: effect.radius * ctx.intensity.scale,
      damage: ctx.baseDamage * effect.damageMul,
      duration: effect.duration,
      burnDps: effect.burnDps ?? ctx.baseDamage * 0.25,
      burnDur: effect.burnDur ?? 2,
    });
  }
}

function verbGroundZone(effect: Extract<Effect, { verb: 'groundZone' }>, ctx: EffectContext): void {
  ctx.ops.startGroundZone?.({
    radius: effect.radius * ctx.intensity.scale,
    dps: effect.dps * ctx.intensity.brightness,
    duration: effect.duration,
    element: effect.element ?? ctx.face.element,
    slow: effect.slow ?? 0,
  });
}

function verbFrostBurst(effect: Extract<Effect, { verb: 'frostBurst' }>, ctx: EffectContext): void {
  ctx.ops.frostBurst?.({
    radius: effect.radius * ctx.intensity.scale,
    damage: ctx.baseDamage * effect.damageMul,
    freezeDur: effect.freezeDur * ctx.intensity.brightness,
    slow: effect.slow ?? 0.45,
  });
}

function verbStatusAura(effect: Extract<Effect, { verb: 'statusAura' }>, ctx: EffectContext): void {
  ctx.ops.applyStatusArea?.(
    effect.status,
    effect.power * ctx.intensity.brightness,
    effect.duration * ctx.intensity.scale,
    effect.radius * ctx.intensity.scale,
  );
}

function verbOrbit(effect: Extract<Effect, { verb: 'orbit' }>, ctx: EffectContext): void {
  const element: Element = effect.element ?? ctx.face.element;
  ctx.ops.startOrbit?.({
    count: Math.max(1, effect.count),
    radius: effect.radius * ctx.intensity.scale,
    rpm: effect.rpm,
    damage: ctx.baseDamage * effect.damageMul,
    duration: effect.duration,
    pierce: effect.pierce ?? 0,
    element,
    face: ctx.face,
  });
  ctx.ops.playAnim?.(ctx.animation.cast, PLAYER_X, PLAYER_Y, ctx.intensity);
}

function verbBeam(effect: Extract<Effect, { verb: 'beam' }>, ctx: EffectContext): void {
  const element: Element = effect.element ?? ctx.face.element;
  ctx.ops.startBeam?.({
    width: effect.width * ctx.intensity.scale,
    dps: effect.dps * ctx.intensity.brightness,
    duration: effect.duration,
    pierce: effect.pierce ?? 999,
    element,
    lifesteal: effect.lifesteal ?? 0,
    face: ctx.face,
    baseDamage: ctx.baseDamage,
  });
}

function verbSummonMinion(
  effect: Extract<Effect, { verb: 'summonMinion' }>,
  ctx: EffectContext,
): void {
  const trigger = effect.trigger ?? 'onResolve';
  if (trigger !== 'onResolve') return;
  ctx.ops.summonMinion?.({
    kind: effect.kind,
    count: Math.max(1, effect.count),
    hp: effect.hp,
    duration: effect.duration,
    damagePerHit: effect.damagePerHit * ctx.intensity.brightness,
    face: ctx.face,
    baseDamage: ctx.baseDamage,
    trigger,
  });
}

function verbReflect(effect: Extract<Effect, { verb: 'reflect' }>, ctx: EffectContext): void {
  ctx.ops.startReflect?.({
    duration: effect.duration,
    multiplier: effect.multiplier,
    radius: effect.radius ?? 80,
  });
  ctx.ops.playAnim?.(ctx.animation.cast, PLAYER_X, PLAYER_Y, ctx.intensity);
}

export function getTieredAnimationIds(
  upgrade: FaceUpgrade,
  _tier: number,
): { cast?: string; projectile?: string; hit?: string; evolution?: string } {
  const useEvolution = getFaceRank(upgrade) >= 3 && upgrade.animation.evolution;
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
