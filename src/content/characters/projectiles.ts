import type { ProjectileArchetype } from '../../types';
import { palHex } from '../../sprites/palette';

export const PROJECTILE_ARCHETYPES: Record<string, ProjectileArchetype> = {
  soldier_bullet: {
    id: 'soldier_bullet',
    name: 'Steel Bullet',
    shape: 'bullet',
    baseColor: palHex('d')!,
    glowColor: palHex('9')!,
    trailColor: palHex('9')!,
    radius: 3,
    speedMul: 1.1,
    rotate: 'velocity',
    tintWithElement: true,
    basePierce: 0,
  },
  gambler_chip: {
    id: 'gambler_chip',
    name: 'Loaded Chip',
    shape: 'chip',
    baseColor: palHex('8')!,
    glowColor: palHex('y')!,
    trailColor: palHex('x')!,
    radius: 3,
    rotate: 'spin',
    rotateSpeed: 14,
    tintWithElement: false,
    onSpawn: (p, _face, _run, rng) => {
      const r = rng();
      if (r < 0.2) {
        p.damage *= 2.25;
        p.radius += 1;
      } else if (r > 0.92) {
        p.damage *= 0.4;
      }
    },
  },
  alchemist_flask: {
    id: 'alchemist_flask',
    name: 'Alchemical Flask',
    shape: 'flask',
    baseColor: palHex('m')!,
    glowColor: palHex('n')!,
    trailColor: palHex('m')!,
    radius: 3,
    rotate: 'spin',
    rotateSpeed: 6,
    tintWithElement: true,
    baseAoeOnHit: 10,
    onHit: (_p, enemy) => {
      if (enemy.poisonT > 0) enemy.poisonT += 0.6;
      if (enemy.freeze > 0) enemy.freeze += 0.25;
      enemy.slow = Math.max(enemy.slow, 0.3);
    },
  },
  necromancer_bone: {
    id: 'necromancer_bone',
    name: 'Bone Shard',
    shape: 'bone',
    baseColor: palHex('d')!,
    glowColor: palHex('H')!,
    trailColor: palHex('I')!,
    radius: 3,
    rotate: 'spin',
    rotateSpeed: 10,
    tintWithElement: false,
    onSpawn: (p, _face, run) => {
      p.damage *= 1 + Math.min(0.6, run.souls * 0.08);
    },
    onHit: (p, enemy) => {
      if (enemy.hp < enemy.maxHp * 0.5) p.damage *= 1.25;
    },
  },
  berserker_axe: {
    id: 'berserker_axe',
    name: 'Whirling Axe',
    shape: 'axe',
    baseColor: palHex('L')!,
    glowColor: palHex('h')!,
    trailColor: palHex('h')!,
    radius: 4,
    speedMul: 0.9,
    lifeMul: 0.85,
    rotate: 'spin',
    rotateSpeed: 22,
    tintWithElement: false,
    basePierce: 1,
    onHit: (_p, _enemy, run) => {
      run.rage = Math.min(10, run.rage + 0.25);
    },
  },
  clockmaker_gear: {
    id: 'clockmaker_gear',
    name: 'Tick Gear',
    shape: 'gear',
    baseColor: palHex('q')!,
    glowColor: palHex('r')!,
    trailColor: palHex('D')!,
    radius: 3,
    speedMul: 0.95,
    rotate: 'spin',
    rotateSpeed: 8,
    tintWithElement: true,
    baseHoming: false,
    onHit: (_p, enemy) => {
      enemy.slow = Math.max(enemy.slow, 0.55);
      enemy.freeze = Math.max(enemy.freeze, 0.35);
    },
  },
};

export function getProjectileArchetype(id: string): ProjectileArchetype | undefined {
  return PROJECTILE_ARCHETYPES[id];
}

export const DEFAULT_PROJECTILE_ARCHETYPE: ProjectileArchetype = PROJECTILE_ARCHETYPES.soldier_bullet!;
