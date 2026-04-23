import type { EnemyType, Enemy } from '../../types';
import { ARENA_W, HUD_H, WALL_Y } from '../../config/constants';
import { palHex } from '../../sprites/palette';

function oscillate(e: Enemy, dt: number, amplitude: number): void {
  e.data['t'] = ((e.data['t'] as number | undefined) ?? 0) + dt;
  const t = e.data['t'] as number;
  e.x += Math.cos(t * 0.9) * amplitude * dt;
  if (e.x < 24) e.x = 24;
  if (e.x > ARENA_W - 24) e.x = ARENA_W - 24;
}

function approachTargetY(e: Enemy, dt: number, targetY: number): void {
  if (e.y < targetY) e.vy = e.speed;
  else if (e.y > targetY + 2) e.vy = -e.speed * 0.5;
  else e.vy = 0;
  e.y += e.vy * dt;
  e.y = Math.max(HUD_H + 24, Math.min(e.y, targetY + 2));
  e.vy = 0;
}

export const BOSS_TYPES: EnemyType[] = [
  {
    id: 'facelocker',
    name: 'Face Locker',
    spriteId: 'boss_facelocker',
    color: palHex('G')!,
    baseHp: 110,
    baseSpeed: 6,
    radius: 16,
    minWave: 5,
    weight: () => 0,
    touchDamage: 18,
    scoreValue: 300,
    isBoss: true,
    behavior: (e, dt) => {
      const maxY = WALL_Y - 60;
      if (e.y < maxY) {
        e.y += 4 * dt;
        if (e.y > maxY) e.y = maxY;
      }
      oscillate(e, dt, 18);
    },
    bossMechanic: (e, dt) => {
      e.data['lockT'] = ((e.data['lockT'] as number | undefined) ?? 0) + dt;
      if ((e.data['lockT'] as number) > 8) {
        e.data['lockT'] = 0;
        import('../../engine/engine').then(({ getEngineState }) => {
          const st = getEngineState();
          if (!st.run) return;
          st.run.lockedFaceValue = 1 + Math.floor(Math.random() * 6);
          st.run.lockedFaceTimer = 6;
        });
      }
    },
  },
  {
    id: 'splitterqueen',
    name: 'Splitter Queen',
    spriteId: 'boss_splitterqueen',
    color: palHex('p')!,
    baseHp: 260,
    baseSpeed: 8,
    radius: 16,
    minWave: 10,
    weight: () => 0,
    touchDamage: 18,
    scoreValue: 350,
    isBoss: true,
    behavior: (e, dt) => {
      approachTargetY(e, dt, HUD_H + 50);
      oscillate(e, dt, 36);
    },
    bossMechanic: (e, dt) => {
      e.data['spawnT'] = ((e.data['spawnT'] as number | undefined) ?? 0) + dt;
      if ((e.data['spawnT'] as number) > 4) {
        e.data['spawnT'] = 0;
        import('../../engine/engine').then(({ getEngineState }) => {
          const st = getEngineState();
          for (let i = 0; i < 3; i++) {
            const c = st.enemies.find((x) => !x.alive);
            if (!c) return;
            Object.assign(c, {
              alive: true,
              typeId: 'swarm',
              x: e.x + (i - 1) * 12,
              y: e.y + 14,
              vx: 0,
              vy: e.speed + 30,
              maxHp: 10 + st.run!.wave,
              hp: 10 + st.run!.wave,
              radius: 5,
              speed: 40,
              age: 0,
              state: 'walk',
              flashT: 0,
              dieT: 0,
              data: {},
              element: 'none',
              hitFlash: 0,
              slow: 0,
              freeze: 0,
              poisonT: 0,
              poisonDps: 0,
              absorbed: 0,
            });
          }
        });
      }
    },
  },
  {
    id: 'mirrortwin',
    name: 'Mirror Twin',
    spriteId: 'boss_mirrortwin',
    color: palHex('H')!,
    baseHp: 240,
    baseSpeed: 12,
    radius: 16,
    minWave: 15,
    weight: () => 0,
    touchDamage: 16,
    scoreValue: 400,
    isBoss: true,
    behavior: (e, dt) => {
      approachTargetY(e, dt, HUD_H + 60);
      e.data['t'] = ((e.data['t'] as number | undefined) ?? 0) + dt;
      const t = e.data['t'] as number;
      const target = ARENA_W / 2 + Math.sin(t * 0.9) * 48;
      const d = target - e.x;
      e.x += Math.sign(d) * Math.min(Math.abs(d), 40 * dt);
    },
    bossMechanic: (e, dt) => {
      e.data['copyT'] = ((e.data['copyT'] as number | undefined) ?? 0) + dt;
      if ((e.data['copyT'] as number) > 3) {
        e.data['copyT'] = 0;
        import('../../engine/engine').then(({ getEngineState }) => {
          const st = getEngineState();
          const run = st.run;
          if (!run || !st.lastRolled) return;
          const face = st.lastRolled;
          if (face.kind === 'SHOT' || face.kind === 'BURST') {
            const count = face.projectileCount ?? face.value;
            for (let i = 0; i < count; i++) {
              const spread = count > 1 ? (i - (count - 1) / 2) * 0.14 : 0;
              const ang = Math.PI / 2 + spread;
              const np = st.projectiles.find((p) => !p.alive);
              if (!np) continue;
              np.alive = true;
              np.x = e.x;
              np.y = e.y + 10;
              np.vx = Math.cos(ang) * 140;
              np.vy = Math.sin(ang) * 140;
              np.damage = 12;
              np.radius = 3;
              np.pierce = 0;
              np.bounces = 0;
              np.chain = 0;
              np.split = 0;
              np.homing = false;
              np.aoeOnHit = 0;
              np.lifesteal = 0;
              np.element = 'arcane';
              np.age = 0;
              np.maxAge = 2;
              np.trail.length = 0;
              np.hitIds.clear();
              np.color = palHex('H')!;
              np.sourceFaceValue = face.value;
              np.hitIds.add(-2);
            }
          }
        });
      }
    },
  },
  {
    id: 'nullzone',
    name: 'Null Zone',
    spriteId: 'boss_nullzone',
    color: palHex('E')!,
    baseHp: 280,
    baseSpeed: 8,
    radius: 16,
    minWave: 20,
    weight: () => 0,
    touchDamage: 16,
    scoreValue: 450,
    isBoss: true,
    behavior: (e, dt) => {
      approachTargetY(e, dt, HUD_H + 50);
      oscillate(e, dt, 20);
    },
    bossMechanic: (e, dt) => {
      e.data['zoneT'] = ((e.data['zoneT'] as number | undefined) ?? 0) + dt;
      if ((e.data['zoneT'] as number) > 5) {
        e.data['zoneT'] = 0;
        import('../../engine/engine').then(({ getEngineState }) => {
          const st = getEngineState();
          const zx = 20 + Math.random() * (ARENA_W - 40);
          const zy = WALL_Y - 80;
          for (const p of st.projectiles) {
            if (!p.alive) continue;
            const dx = p.x - zx;
            const dy = p.y - zy;
            if (dx * dx + dy * dy < 20 * 20) p.alive = false;
          }
          const v = st.vfx.find((x) => !x.alive);
          if (v) {
            v.alive = true;
            v.age = 0;
            v.life = 4;
            v.kind = 'reaction';
            v.x = zx;
            v.y = zy;
            v.vx = 0;
            v.vy = 0;
            v.color = palHex('E')!;
            v.size = 20;
            v.angle = 0;
            v.rot = 0;
          }
        });
      }
    },
  },
  {
    id: 'invertking',
    name: 'Invert King',
    spriteId: 'boss_invertking',
    color: palHex('O')!,
    baseHp: 300,
    baseSpeed: 8,
    radius: 16,
    minWave: 25,
    weight: () => 0,
    touchDamage: 20,
    scoreValue: 500,
    isBoss: true,
    behavior: (e, dt) => {
      approachTargetY(e, dt, HUD_H + 60);
      oscillate(e, dt, 28);
    },
    bossMechanic: (e, dt) => {
      e.data['invT'] = ((e.data['invT'] as number | undefined) ?? 0) + dt;
      if ((e.data['invT'] as number) > 6) {
        e.data['invT'] = 0;
        import('../../engine/engine').then(({ getEngineState }) => {
          const st = getEngineState();
          if (!st.run) return;
          for (const d of st.run.dice) {
            for (const f of d.faces) {
              f.value = 7 - f.value;
            }
          }
          for (const d of st.dice) {
            for (const f of d.config.faces) {
              f.value = 7 - f.value;
            }
          }
        });
      }
    },
  },
  {
    id: 'reflectorboss',
    name: 'Reflector',
    spriteId: 'boss_reflector',
    color: palHex('C')!,
    baseHp: 320,
    baseSpeed: 6,
    radius: 17,
    minWave: 30,
    weight: () => 0,
    touchDamage: 18,
    scoreValue: 550,
    isBoss: true,
    behavior: (e, dt) => {
      approachTargetY(e, dt, HUD_H + 56);
      oscillate(e, dt, 32);
    },
  },
];
