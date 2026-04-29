import type { Projectile, Upgrade } from '../../types';
import { ARENA_W, WALL_Y } from '../../config/constants';
import { getEngineState } from '../../engine/engine';
import { getRunState } from '../../state/store';

export const MORE_LANDMARK_UPGRADES: Upgrade[] = [
  {
    id: 'landmark_gold_vein',
    name: 'Gold Vein',
    desc: '+4 gold at wave end; a small gold drip every few seconds during combat.',
    rarity: 'rare',
    category: 'landmark',
    maxStack: 2,
    minWave: 2,
    hooks: {
      onWaveEnd: () => {
        const run = getRunState();
        if (!run) return;
        run.gold += 4;
      },
      onTick: ({ dt }) => {
        const run = getRunState();
        if (!run) return;
        const r = run as unknown as { _goldVeinT?: number };
        r._goldVeinT = (r._goldVeinT ?? 0) + dt;
        if (r._goldVeinT < 7.5) return;
        r._goldVeinT = 0;
        run.gold += 1;
      },
    },
  },
  {
    id: 'landmark_static_rods',
    name: 'Static Rods',
    desc: 'Wall rods fire chain lightning every few seconds.',
    rarity: 'epic',
    category: 'landmark',
    maxStack: 1,
    minWave: 4,
    hooks: {
      onTick: ({ dt }) => {
        const run = getRunState();
        if (!run) return;
        const r = run as unknown as { _staticRodT?: number; _staticRodSide?: number };
        r._staticRodT = (r._staticRodT ?? 0) + dt;
        if (r._staticRodT < 2.8) return;
        r._staticRodT = 0;
        r._staticRodSide = r._staticRodSide ? 0 : 1;
        const target = pickEnemy();
        if (!target) return;
        const x = r._staticRodSide ? ARENA_W - 4 : 4;
        const p = acquireProjectile();
        if (!p) return;
        primeProjectile(p, x, WALL_Y - 14, target.x, target.y, 10, '#ffe466');
        p.element = 'lightning';
        p.chain = 3;
        p.maxAge = 1.6;
      },
    },
  },
  {
    id: 'landmark_ice_moat',
    name: 'Ice Moat',
    desc: 'Enemies near the wall become visibly slowed and chilled.',
    rarity: 'rare',
    category: 'landmark',
    maxStack: 1,
    minWave: 3,
    hooks: {
      onTick: ({ dt }) => {
        const eng = getEngineState();
        for (const e of eng.enemies) {
          if (!e.alive || e.state === 'die') continue;
          const d = WALL_Y - e.y;
          if (d <= 0 || d > 64) continue;
          e.slow = Math.max(e.slow, 0.55);
          e.slowT = Math.max(e.slowT, 0.35);
          e.chill = Math.max(e.chill, 0.45);
          e.hp -= 1.5 * dt;
        }
      },
    },
  },
  {
    id: 'landmark_soul_lantern',
    name: 'Soul Lantern',
    desc: 'Kills sometimes restore health or souls; Necromancer gains more souls.',
    rarity: 'epic',
    category: 'landmark',
    maxStack: 1,
    minWave: 4,
    hooks: {
      onKill: () => {
        const run = getRunState();
        if (!run) return;
        const chance = run.characterId === 'necromancer' ? 0.32 : 0.18;
        if (Math.random() > chance) return;
        if (run.characterId === 'necromancer') {
          run.souls += 2;
          run.hp = Math.min(run.maxHp, run.hp + 1);
        } else {
          run.souls += 1;
          run.hp = Math.min(run.maxHp, run.hp + 2);
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

function acquireProjectile(): Projectile | null {
  const eng = getEngineState();
  return eng.projectiles.find((p) => !p.alive) ?? null;
}

function primeProjectile(p: Projectile, x: number, y: number, tx: number, ty: number, damage: number, color: string): void {
  p.alive = true;
  p.age = 0;
  p.x = x;
  p.y = y;
  const dx = tx - x;
  const dy = ty - y;
  const len = Math.hypot(dx, dy) || 1;
  p.vx = (dx / len) * 240;
  p.vy = (dy / len) * 240;
  p.damage = damage;
  p.pierce = 0;
  p.bounces = 0;
  p.chain = 0;
  p.split = 0;
  p.radius = 3;
  p.homing = false;
  p.aoeOnHit = 0;
  p.lifesteal = 0;
  p.element = 'none';
  p.maxAge = 2;
  p.trail.length = 0;
  p.hitIds.clear();
  p.color = color;
  p.sourceFaceValue = 6;
  p.archetype = null;
  p.rotation = 0;
  p.tags.clear();
  p.tagT = 0;
  p.critChance = 0;
  p.burnDps = 0;
  p.burnDur = 0;
  p.orbit = undefined;
  p.minion = false;
  p.animTrailId = 'arc_proj';
}
