import type { Face, RollResult, Projectile, RunState, Element } from '../types';
import type { PendingMods } from '../engine/effectExecutor';
import { BALANCE } from '../config/balance';
import { PLAYER_X, DIE_Y, PROJECTILE_SPAWN_Y } from '../config/constants';
import { ELEMENT_COLORS } from '../sprites/effects';
import { executeUpgrade } from '../engine/effectExecutor';
import type { TierIntensity } from '../content/animations/types';

export interface FaceOps {
  spawnProjectile: (x: number, y: number, dx: number, dy: number, damage: number, face: Face) => Projectile;
  queueShot: (
    delay: number,
    x: number,
    y: number,
    damage: number,
    face: Face,
    postSpawn?: (p: Projectile) => void,
  ) => void;
  pulse: (radius: number, damage: number, element: string, knockback?: number) => void;
  delayedPulse?: (params: { delay: number; radius: number; damage: number; element: Element; knockback: number }) => void;
  addShield: (count: number) => void;
  heal: (amount: number) => void;
  consumeSouls: (n: number) => boolean;
  repeatPrev: () => void;
  applyStatusNearest?: (status: 'burn' | 'poison' | 'slow' | 'freeze' | 'stun' | 'mark', power: number, duration: number) => void;
  applyStatusArea?: (status: 'burn' | 'poison' | 'slow' | 'freeze' | 'stun' | 'mark', power: number, duration: number, radius: number) => void;
  addGold?: (amount: number) => void;
  startOrbit?: (params: { count: number; radius: number; rpm: number; damage: number; duration: number; pierce: number; element: Element; face: Face }) => void;
  startBeam?: (params: { width: number; dps: number; duration: number; pierce: number; element: Element; lifesteal: number; face: Face; baseDamage: number }) => void;
  startPull?: (params: { radius: number; strength: number; dps: number; duration: number; destroyProjectiles: boolean; element: Element }) => void;
  startGroundZone?: (params: { radius: number; dps: number; duration: number; element: Element; slow: number }) => void;
  strikeColumn?: (params: { delay: number; damage: number; element: Element; radius: number; stunDur: number; chainToExtra: number }) => void;
  flamePillar?: (params: { delay: number; radius: number; damage: number; duration: number; burnDps: number; burnDur: number }) => void;
  frostBurst?: (params: { radius: number; damage: number; freezeDur: number; slow: number }) => void;
  chainLightning?: (params: { jumps: number; damage: number; radius: number; stunDur: number; element: Element; fromDie: boolean }) => void;
  summonMinion?: (params: { kind: 'bone' | 'wraith' | 'spirit' | 'ember'; count: number; hp: number; duration: number; damagePerHit: number; face: Face; baseDamage: number; trigger: 'onResolve' | 'onKill' | 'onProjectileExpire' }) => void;
  startReflect?: (params: { duration: number; multiplier: number; radius: number }) => void;
  playAnim?: (animId: string | undefined, x: number, y: number, intensity: TierIntensity) => void;
}

export type { PendingMods };

const DEFAULT_AIM = -Math.PI / 2;

export function findNearestEnemyXY(enemies: { x: number; y: number; alive: boolean; state: string }[]): { x: number; y: number } | null {
  let best: { x: number; y: number } | null = null;
  let bd = Infinity;
  for (const e of enemies) {
    if (!e.alive || e.state === 'die') continue;
    const dx = e.x - PLAYER_X;
    const dy = e.y - DIE_Y;
    const d = dx * dx + dy * dy;
    if (d < bd) {
      bd = d;
      best = { x: e.x, y: e.y };
    }
  }
  return best;
}

export function resolveFace(face: Face, baseDmg: number, roll: RollResult, run: RunState, ops: FaceOps): void {
  // Slot layout wins: the renderer keys face icons off face.value, so the
  // resolved action must follow the same slot regardless of the native kind.
  // Previously we short-circuited BLANK here, which desynced a BLANK-kind face
  // (e.g. Gambler values 1 and 5) from the replacer icon drawn on the die.
  const slotIndex = Math.max(0, Math.min(5, face.value - 1));
  const slot = face.value >= 1 ? run.slotLayout?.[slotIndex] : undefined;
  if (slot && (slot.replacerId || slot.supplementIds.length > 0)) {
    const shared: PendingMods = {};
    for (const suppId of slot.supplementIds) {
      const tier = run.ownedFaceUpgrades[suppId] ?? 1;
      executeUpgrade(suppId, tier, face, baseDmg, run, ops, shared);
    }
    if (slot.replacerId) {
      const tier = run.ownedFaceUpgrades[slot.replacerId] ?? 1;
      executeUpgrade(slot.replacerId, tier, face, baseDmg, run, ops, shared);
    } else {
      resolveLegacyFace(face, baseDmg, roll, run, ops);
    }
    return;
  }
  resolveLegacyFace(face, baseDmg, roll, run, ops);
}

function resolveLegacyFace(face: Face, baseDmg: number, _roll: RollResult, run: RunState, ops: FaceOps): void {
  switch (face.kind) {
    case 'SHOT':
    case 'CHARGED_BOLT': {
      const count = face.projectileCount ?? face.value;
      fireShotSpread(count, baseDmg, face, ops);
      break;
    }
    case 'BURST': {
      const count = Math.max(4, (face.projectileCount ?? face.value) + 2);
      fireBurstFan(count, baseDmg * 0.7, face, ops);
      break;
    }
    case 'PULSE': {
      const r = BALANCE.combat.pulseRadius + face.value * 3;
      ops.pulse(r, BALANCE.combat.pulseDamage(face.value), face.element);
      break;
    }
    case 'SHIELD': {
      ops.addShield(BALANCE.combat.shieldAmount(face.value));
      break;
    }
    case 'HEAL': {
      ops.heal(BALANCE.combat.healAmount(face.value));
      break;
    }
    case 'BOMB': {
      const count = face.value;
      const delayStep = BALANCE.combat.shotSequenceDelay;
      for (let i = 0; i < count; i++) {
        ops.queueShot(i * delayStep, PLAYER_X, PROJECTILE_SPAWN_Y, baseDmg, face, (p) => {
          p.aoeOnHit = Math.max(p.aoeOnHit, 16);
        });
      }
      break;
    }
    case 'SOUL_DRAIN': {
      if (ops.consumeSouls(face.value)) {
        const pulseDmg = baseDmg * 1.8;
        ops.pulse(BALANCE.combat.pulseRadius + 20, pulseDmg, 'arcane');
      } else {
        const count = Math.max(1, Math.floor(face.value / 2));
        fireShotSpread(count, baseDmg * 0.35, face, ops);
      }
      break;
    }
    case 'RAGE_SMASH': {
      const rageBonus = 1 + Math.min(2, run.rage * 0.2);
      const count = face.value + Math.floor(run.rage / 3);
      fireShotSpread(count, baseDmg * rageBonus, face, ops);
      break;
    }
    case 'WILD': {
      ops.repeatPrev();
      break;
    }
    case 'BLANK':
    default:
      break;
  }
}

function fireShotSpread(count: number, dmg: number, face: Face, ops: FaceOps): void {
  const delayStep = BALANCE.combat.shotSequenceDelay;
  for (let i = 0; i < count; i++) {
    ops.queueShot(i * delayStep, PLAYER_X, PROJECTILE_SPAWN_Y, dmg, face);
  }
}

function fireBurstFan(count: number, dmg: number, face: Face, ops: FaceOps): void {
  const delayStep = BALANCE.combat.shotSequenceDelay;
  for (let i = 0; i < count; i++) {
    ops.queueShot(i * delayStep, PLAYER_X, PROJECTILE_SPAWN_Y, dmg, face);
  }
}

export { DEFAULT_AIM };

export function deriveProjectileColor(face: Face): string {
  return ELEMENT_COLORS[face.element] ?? '#fff';
}
