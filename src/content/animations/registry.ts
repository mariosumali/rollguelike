import type { AnimationSpec } from './types';

const reg = new Map<string, AnimationSpec>();

const modules = import.meta.glob<{ default: AnimationSpec | AnimationSpec[] }>('./specs/*.ts', {
  eager: true,
});
for (const [path, mod] of Object.entries(modules)) {
  const def = mod.default;
  if (!def) {
    console.warn(`[animations] ${path}: missing default export`);
    continue;
  }
  const specs = Array.isArray(def) ? def : [def];
  for (const spec of specs) {
    if (!spec?.id) {
      console.warn(`[animations] ${path}: spec missing id`);
      continue;
    }
    if (reg.has(spec.id)) {
      console.warn(`[animations] duplicate id ${spec.id} in ${path}`);
    }
    reg.set(spec.id, spec);
  }
}

export function getAnimationSpec(id: string): AnimationSpec | undefined {
  return reg.get(id);
}

export function hasAnimation(id: string): boolean {
  return reg.has(id);
}

export function listAnimationIds(): string[] {
  return Array.from(reg.keys());
}

export function validateAnimationIds(ids: (string | undefined)[]): string[] {
  const missing: string[] = [];
  for (const id of ids) {
    if (!id) continue;
    if (!reg.has(id)) missing.push(id);
  }
  return missing;
}
