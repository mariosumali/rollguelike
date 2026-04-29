import type { FaceUpgrade, Effect } from './types';
import { MAX_TIER } from './types';
import { hasAnimation } from '../animations/registry';

const KNOWN_VERBS = new Set<Effect['verb']>([
  'fireProjectile',
  'pulse',
  'chain',
  'chainLightning',
  'bounce',
  'applyStatus',
  'heal',
  'shield',
  'spawnPickup',
  'pull',
  'column',
  'flamePillar',
  'groundZone',
  'frostBurst',
  'statusAura',
  'modifyProjectile',
  'orbit',
  'beam',
  'summonMinion',
  'reflect',
]);

const reg = new Map<string, FaceUpgrade>();

const modules = import.meta.glob<{ default: FaceUpgrade | FaceUpgrade[] }>('./face/*.ts', {
  eager: true,
});

for (const [path, mod] of Object.entries(modules)) {
  if (path.endsWith('/_template.ts')) continue;
  const defs = Array.isArray(mod.default) ? mod.default : [mod.default];
  if (defs.length === 0 || defs.some((def) => !def)) {
    console.warn(`[faceUpgrades] ${path}: missing default export`);
    continue;
  }
  for (const def of defs) {
    const issues = validateFaceUpgrade(def);
    if (issues.length > 0) {
      const message = `[faceUpgrades] ${path}: ${issues.join('; ')}`;
      if (import.meta.env?.DEV) throw new Error(message);
      console.warn(message);
      continue;
    }
    if (reg.has(def.id)) {
      console.warn(`[faceUpgrades] duplicate id ${def.id} at ${path}`);
    }
    reg.set(def.id, def);
  }
}

for (const def of reg.values()) {
  const issues = validateFaceUpgradeChain(def);
  if (issues.length === 0) continue;
  const message = `[faceUpgrades] ${def.id}: ${issues.join('; ')}`;
  if (import.meta.env?.DEV) throw new Error(message);
  console.warn(message);
  reg.delete(def.id);
}

function validateFaceUpgrade(u: FaceUpgrade): string[] {
  const issues: string[] = [];
  if (!u.id) issues.push('missing id');
  if (!u.name) issues.push('missing name');
  if (u.kind !== 'replacer' && u.kind !== 'supplement') issues.push(`bad kind: ${u.kind}`);
  if (!Array.isArray(u.effect?.effects) || u.effect.effects.length === 0) {
    issues.push('effect has no effects');
  } else {
    u.effect.effects.forEach((e, ei) => {
      if (!KNOWN_VERBS.has(e.verb)) {
        issues.push(`effect ${ei}: unknown verb '${e.verb}'`);
      }
    });
  }
  if (u.rank != null && (!Number.isInteger(u.rank) || u.rank < 1 || u.rank > MAX_TIER)) {
    issues.push(`rank must be an integer from 1 to ${MAX_TIER}`);
  }
  if (!u.animation) {
    issues.push('missing animation binding');
  } else {
    const ids = [u.animation.cast, u.animation.projectile, u.animation.hit, u.animation.evolution];
    for (const id of ids) {
      if (id && !hasAnimation(id)) issues.push(`missing animation id '${id}'`);
    }
  }
  if (u.evolution?.extraEffects) {
    u.evolution.extraEffects.forEach((e, ei) => {
      if (!KNOWN_VERBS.has(e.verb)) {
        issues.push(`evolution effect ${ei}: unknown verb '${e.verb}'`);
      }
    });
  }
  return issues;
}

function validateFaceUpgradeChain(u: FaceUpgrade): string[] {
  const issues: string[] = [];
  const predecessorId = u.upgradesFrom;
  if (predecessorId) {
    const predecessor = reg.get(predecessorId);
    if (!predecessor) {
      issues.push(`missing predecessor '${predecessorId}'`);
    } else {
      if (predecessor.kind !== u.kind) {
        issues.push(`predecessor '${predecessorId}' has kind '${predecessor.kind}'`);
      }
      if (getFaceChainId(predecessor) !== getFaceChainId(u)) {
        issues.push(`predecessor '${predecessorId}' is in chain '${getFaceChainId(predecessor)}'`);
      }
      if (getFaceRank(predecessor) >= getFaceRank(u)) {
        issues.push(`predecessor '${predecessorId}' rank is not lower`);
      }
    }
  }
  const successorId = u.upgradesTo;
  if (successorId) {
    const successor = reg.get(successorId);
    if (!successor) {
      issues.push(`missing successor '${successorId}'`);
    } else if (successor.upgradesFrom !== u.id) {
      issues.push(`successor '${successorId}' does not point back to this upgrade`);
    }
  }
  const seen = new Set<string>();
  let cursor: FaceUpgrade | undefined = u;
  while (cursor?.upgradesFrom) {
    if (seen.has(cursor.id)) {
      issues.push('cycle detected');
      break;
    }
    seen.add(cursor.id);
    cursor = reg.get(cursor.upgradesFrom);
  }
  return issues;
}

export function getFaceUpgrade(id: string): FaceUpgrade | undefined {
  return reg.get(id);
}

export function hasFaceUpgrade(id: string): boolean {
  return reg.has(id);
}

export function listFaceUpgrades(): FaceUpgrade[] {
  return Array.from(reg.values());
}

export function listFaceUpgradeIds(): string[] {
  return Array.from(reg.keys());
}

export function getFaceChainId(upgrade: FaceUpgrade | undefined): string {
  return upgrade?.chainId ?? upgrade?.id ?? '';
}

export function getFaceRank(upgrade: FaceUpgrade | undefined): number {
  return Math.max(1, Math.min(MAX_TIER, Math.floor(upgrade?.rank ?? 1)));
}

export function listFaceChainIds(chainId: string): string[] {
  return listFaceUpgrades()
    .filter((u) => getFaceChainId(u) === chainId)
    .sort((a, b) => getFaceRank(a) - getFaceRank(b))
    .map((u) => u.id);
}

export function listReplacers(): FaceUpgrade[] {
  return listFaceUpgrades().filter((u) => u.kind === 'replacer');
}

export function listSupplements(): FaceUpgrade[] {
  return listFaceUpgrades().filter((u) => u.kind === 'supplement');
}
