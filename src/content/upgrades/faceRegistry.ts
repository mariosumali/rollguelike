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

const modules = import.meta.glob<{ default: FaceUpgrade }>('./face/*.ts', {
  eager: true,
});

for (const [path, mod] of Object.entries(modules)) {
  if (path.endsWith('/_template.ts')) continue;
  const def = mod.default;
  if (!def) {
    console.warn(`[faceUpgrades] ${path}: missing default export`);
    continue;
  }
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

function validateFaceUpgrade(u: FaceUpgrade): string[] {
  const issues: string[] = [];
  if (!u.id) issues.push('missing id');
  if (!u.name) issues.push('missing name');
  if (u.kind !== 'replacer' && u.kind !== 'supplement') issues.push(`bad kind: ${u.kind}`);
  if (!Array.isArray(u.tiers) || u.tiers.length !== MAX_TIER) {
    issues.push(`tiers must have exactly ${MAX_TIER} entries`);
  } else {
    u.tiers.forEach((tier, idx) => {
      if (!Array.isArray(tier.effects) || tier.effects.length === 0) {
        issues.push(`tier ${idx + 1} has no effects`);
        return;
      }
      tier.effects.forEach((e, ei) => {
        if (!KNOWN_VERBS.has(e.verb)) {
          issues.push(`tier ${idx + 1} effect ${ei}: unknown verb '${e.verb}'`);
        }
      });
    });
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

export function listReplacers(): FaceUpgrade[] {
  return listFaceUpgrades().filter((u) => u.kind === 'replacer');
}

export function listSupplements(): FaceUpgrade[] {
  return listFaceUpgrades().filter((u) => u.kind === 'supplement');
}
