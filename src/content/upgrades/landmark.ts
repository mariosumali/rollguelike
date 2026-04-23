import type { Upgrade } from '../../types';
import { getEngineState } from '../../engine/engine';
import { getRunState } from '../../state/store';
import { ARENA_W, WALL_Y } from '../../config/constants';

export const LANDMARK_UPGRADES: Upgrade[] = [
  {
    id: 'landmark_turret_left',
    name: 'Side Turret',
    desc: 'A turret fires periodically from left wall.',
    rarity: 'legendary',
    category: 'landmark',
    maxStack: 2,
    minWave: 3,
    hooks: {
      onTick: ({ dt }) => {
        const run = getRunState();
        if (!run) return;
        const key = '_turretL' as const;
        const r = run as unknown as { _turretL?: number };
        r[key] = (r[key] ?? 0) + dt;
        if ((r[key] ?? 0) > 1.6) {
          r[key] = 0;
          const eng = getEngineState();
          const target = pickEnemy();
          if (!target) return;
          const p = eng.projectiles.find((pp) => !pp.alive);
          if (!p) return;
          p.alive = true;
          p.age = 0;
          p.x = 2;
          p.y = WALL_Y - 10;
          const dx = target.x - p.x;
          const dy = target.y - p.y;
          const len = Math.hypot(dx, dy) || 1;
          p.vx = (dx / len) * 200;
          p.vy = (dy / len) * 200;
          p.damage = 12;
          p.pierce = 0;
          p.bounces = 0;
          p.chain = 0;
          p.split = 0;
          p.radius = 2;
          p.homing = false;
          p.aoeOnHit = 0;
          p.lifesteal = 0;
          p.element = 'none';
          p.maxAge = 2;
          p.trail.length = 0;
          p.hitIds.clear();
          p.color = '#d6dde8';
          p.sourceFaceValue = 3;
        }
      },
    },
  },
  {
    id: 'landmark_turret_right',
    name: 'Mirror Turret',
    desc: 'A second turret on the right wall.',
    rarity: 'legendary',
    category: 'landmark',
    maxStack: 2,
    minWave: 5,
    hooks: {
      onTick: ({ dt }) => {
        const run = getRunState();
        if (!run) return;
        const r = run as unknown as { _turretR?: number };
        r._turretR = (r._turretR ?? 0) + dt;
        if ((r._turretR ?? 0) > 1.6) {
          r._turretR = 0;
          const eng = getEngineState();
          const target = pickEnemy();
          if (!target) return;
          const p = eng.projectiles.find((pp) => !pp.alive);
          if (!p) return;
          p.alive = true;
          p.age = 0;
          p.x = ARENA_W - 2;
          p.y = WALL_Y - 10;
          const dx = target.x - p.x;
          const dy = target.y - p.y;
          const len = Math.hypot(dx, dy) || 1;
          p.vx = (dx / len) * 200;
          p.vy = (dy / len) * 200;
          p.damage = 12;
          p.pierce = 0;
          p.bounces = 0;
          p.chain = 0;
          p.split = 0;
          p.radius = 2;
          p.homing = false;
          p.aoeOnHit = 0;
          p.lifesteal = 0;
          p.element = 'none';
          p.maxAge = 2;
          p.trail.length = 0;
          p.hitIds.clear();
          p.color = '#d6dde8';
          p.sourceFaceValue = 3;
        }
      },
    },
  },
  {
    id: 'landmark_pit',
    name: 'Spike Pit',
    desc: 'Enemies take damage near the wall.',
    rarity: 'epic',
    category: 'landmark',
    maxStack: 2,
    hooks: {
      onTick: ({ dt }) => {
        const eng = getEngineState();
        for (const e of eng.enemies) {
          if (!e.alive || e.state === 'die') continue;
          if (e.y > WALL_Y - 22) e.hp -= 8 * dt;
        }
      },
    },
  },
  {
    id: 'landmark_beacon',
    name: 'Healing Beacon',
    desc: 'Slowly heals over time.',
    rarity: 'rare',
    category: 'landmark',
    maxStack: 2,
    hooks: {
      onTick: ({ dt }) => {
        const run = getRunState();
        if (!run) return;
        run.hp = Math.min(run.maxHp, run.hp + 0.4 * dt);
      },
    },
  },
  {
    id: 'landmark_mirror',
    name: 'Reflective Wall',
    desc: 'Projectiles that reach the wall bounce once.',
    rarity: 'epic',
    category: 'landmark',
    maxStack: 1,
    hooks: {
      onProjectileSpawn: ({ projectile }) => {
        projectile.bounces = Math.max(projectile.bounces, 1);
      },
    },
  },
  {
    id: 'landmark_timekeeper',
    name: 'Time Keeper',
    desc: 'Enemies slow down near wall.',
    rarity: 'rare',
    category: 'landmark',
    maxStack: 1,
    hooks: {
      onTick: () => {
        const eng = getEngineState();
        for (const e of eng.enemies) {
          if (!e.alive) continue;
          const d = WALL_Y - e.y;
          if (d < 40 && d > 0) e.slow = Math.max(e.slow, 0.3);
        }
      },
    },
  },
];

function pickEnemy() {
  const eng = getEngineState();
  for (const e of eng.enemies) {
    if (!e.alive || e.state === 'die') continue;
    return e;
  }
  return null;
}
