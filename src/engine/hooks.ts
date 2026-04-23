import type { UpgradeHooks, RunState, HookCtx, Face, Projectile, Enemy } from '../types';
import { getUpgrade } from '../content/upgrades/registry';
import { getCharacter } from '../content/characters/registry';

type HookKey = keyof UpgradeHooks;

export interface HookEnv {
  run: RunState;
  rng: () => number;
  ctx: HookCtx;
}

type HookGather<K extends HookKey> = Array<NonNullable<UpgradeHooks[K]>>;

function gather<K extends HookKey>(run: RunState, key: K): HookGather<K> {
  const out: HookGather<K> = [];
  const ch = getCharacter(run.characterId);
  if (ch?.passive?.[key]) out.push(ch.passive[key] as NonNullable<UpgradeHooks[K]>);
  for (const ap of run.upgrades) {
    const u = getUpgrade(ap.id);
    if (!u?.hooks) continue;
    const fn = u.hooks[key];
    if (fn) {
      for (let i = 0; i < ap.stacks; i++) out.push(fn as NonNullable<UpgradeHooks[K]>);
    }
  }
  return out;
}

export function onApply(env: HookEnv): void {
  for (const fn of gather(env.run, 'onApply')) (fn as UpgradeHooks['onApply'])(env.ctx);
}

export function onRoll(env: HookEnv, face: Face, dieId: string): void {
  for (const fn of gather(env.run, 'onRoll')) {
    (fn as UpgradeHooks['onRoll'])({ ...env.ctx, face, dieId });
  }
}

export function onProjectileSpawn(env: HookEnv, projectile: Projectile, face: Face): void {
  for (const fn of gather(env.run, 'onProjectileSpawn')) {
    (fn as UpgradeHooks['onProjectileSpawn'])({ ...env.ctx, projectile, face });
  }
}

export function onProjectileHit(env: HookEnv, projectile: Projectile, enemy: Enemy): void {
  for (const fn of gather(env.run, 'onProjectileHit')) {
    (fn as UpgradeHooks['onProjectileHit'])({ ...env.ctx, projectile, enemy });
  }
}

export function onKill(env: HookEnv, enemy: Enemy): void {
  for (const fn of gather(env.run, 'onKill')) (fn as UpgradeHooks['onKill'])({ ...env.ctx, enemy });
}

export function onDamaged(env: HookEnv, amount: number): number {
  let amt = amount;
  for (const fn of gather(env.run, 'onDamaged')) {
    const r = (fn as UpgradeHooks['onDamaged'])({ ...env.ctx, amount: amt });
    if (typeof r === 'number') amt = r;
  }
  return amt;
}

export function onWaveStart(env: HookEnv, wave: number): void {
  for (const fn of gather(env.run, 'onWaveStart')) {
    (fn as UpgradeHooks['onWaveStart'])({ ...env.ctx, wave });
  }
}

export function onWaveEnd(env: HookEnv, wave: number): void {
  for (const fn of gather(env.run, 'onWaveEnd')) {
    (fn as UpgradeHooks['onWaveEnd'])({ ...env.ctx, wave });
  }
}

export function onTick(env: HookEnv, dt: number): void {
  for (const fn of gather(env.run, 'onTick')) {
    (fn as UpgradeHooks['onTick'])({ ...env.ctx, dt });
  }
}
