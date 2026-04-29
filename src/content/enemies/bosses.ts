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
    baseHp: 82,
    baseSpeed: 6,
    radius: 16,
    minWave: 5,
    weight: () => 0,
    touchDamage: 18,
    scoreValue: 300,
    isBoss: true,
    mechanicDesc: 'Locks a die face. Break through the phase quickly to free your roll table.',
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
      const phase = bossPhase(e);
      if ((e.data['lockT'] as number) > (phase >= 2 ? 5.5 : 7.5)) {
        e.data['lockT'] = 0;
        import('../../engine/engine').then(({ getEngineState }) => {
          const st = getEngineState();
          if (!st.run) return;
          st.run.lockedFaceValue = 1 + Math.floor(Math.random() * 6);
          st.run.lockedFaceTimer = phase >= 2 ? 4.2 : 5.5;
        });
      }
    },
  },
  {
    id: 'splitterqueen',
    name: 'Splitter Queen',
    spriteId: 'boss_splitterqueen',
    color: palHex('p')!,
    baseHp: 145,
    baseSpeed: 8,
    radius: 16,
    minWave: 10,
    weight: () => 0,
    touchDamage: 18,
    scoreValue: 350,
    isBoss: true,
    mechanicDesc: 'Spawns swarms in bursts. Clear the brood windows before the lane floods.',
    behavior: (e, dt) => {
      approachTargetY(e, dt, HUD_H + 50);
      oscillate(e, dt, 36);
    },
    bossMechanic: (e, dt) => {
      e.data['spawnT'] = ((e.data['spawnT'] as number | undefined) ?? 0) + dt;
      const phase = bossPhase(e);
      if ((e.data['spawnT'] as number) > (phase >= 2 ? 2.9 : 4.2)) {
        e.data['spawnT'] = 0;
        import('../../engine/engine').then(({ getEngineState }) => {
          const st = getEngineState();
          const count = phase >= 2 ? 4 : 3;
          for (let i = 0; i < count; i++) {
            const c = st.enemies.find((x) => !x.alive);
            if (!c) return;
            Object.assign(c, {
              alive: true,
              typeId: 'swarm',
              x: e.x + (i - (count - 1) / 2) * 12,
              y: e.y + 14,
              vx: 0,
              vy: e.speed + 30,
              maxHp: 8 + Math.floor(st.run!.wave * 0.7),
              hp: 8 + Math.floor(st.run!.wave * 0.7),
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
    baseHp: 135,
    baseSpeed: 12,
    radius: 16,
    minWave: 15,
    weight: () => 0,
    touchDamage: 16,
    scoreValue: 400,
    isBoss: true,
    mechanicDesc: 'Copies your last projectile face. Bait mirrored shots away from the wall.',
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
      const phase = bossPhase(e);
      if ((e.data['copyT'] as number) > (phase >= 2 ? 2.2 : 3.2)) {
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
              np.damage = phase >= 2 ? 16 : 11;
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
    baseHp: 160,
    baseSpeed: 8,
    radius: 16,
    minWave: 20,
    weight: () => 0,
    touchDamage: 16,
    scoreValue: 450,
    isBoss: true,
    mechanicDesc: 'Projects null zones that erase shots. Overload windows by changing angles.',
    behavior: (e, dt) => {
      approachTargetY(e, dt, HUD_H + 50);
      oscillate(e, dt, 20);
    },
    bossMechanic: (e, dt) => {
      e.data['zoneT'] = ((e.data['zoneT'] as number | undefined) ?? 0) + dt;
      const phase = bossPhase(e);
      if ((e.data['zoneT'] as number) > (phase >= 2 ? 3.6 : 5)) {
        e.data['zoneT'] = 0;
        import('../../engine/engine').then(({ getEngineState }) => {
          const st = getEngineState();
          const zx = phase >= 2 ? e.x + (Math.random() - 0.5) * 80 : 20 + Math.random() * (ARENA_W - 40);
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
    baseHp: 170,
    baseSpeed: 8,
    radius: 16,
    minWave: 25,
    weight: () => 0,
    touchDamage: 20,
    scoreValue: 500,
    isBoss: true,
    mechanicDesc: 'Temporarily inverts die values. Use the flipped table before it snaps back.',
    behavior: (e, dt) => {
      approachTargetY(e, dt, HUD_H + 60);
      oscillate(e, dt, 28);
    },
    bossMechanic: (e, dt) => {
      e.data['invT'] = ((e.data['invT'] as number | undefined) ?? 0) + dt;
      if (e.data['inverted'] && (e.data['invT'] as number) > 3.2) {
        e.data['invT'] = 0;
        e.data['inverted'] = false;
        invertAllDice();
        return;
      }
      const phase = bossPhase(e);
      if (!e.data['inverted'] && (e.data['invT'] as number) > (phase >= 2 ? 4.3 : 6)) {
        e.data['inverted'] = true;
        e.data['invT'] = 0;
        invertAllDice();
      }
    },
  },
  {
    id: 'reflectorboss',
    name: 'Reflector',
    spriteId: 'boss_reflector',
    color: palHex('C')!,
    baseHp: 185,
    baseSpeed: 6,
    radius: 17,
    minWave: 30,
    weight: () => 0,
    touchDamage: 18,
    scoreValue: 550,
    isBoss: true,
    mechanicDesc: 'Raises a rotating mirror shell. Wait it out or punish it with pulses and beams.',
    behavior: (e, dt) => {
      approachTargetY(e, dt, HUD_H + 56);
      oscillate(e, dt, 32);
    },
    bossMechanic: (e, dt) => {
      e.data['shieldT'] = ((e.data['shieldT'] as number | undefined) ?? 0) + dt;
      const phase = bossPhase(e);
      const cycle = phase >= 2 ? 4.2 : 5.2;
      const shieldDur = phase >= 2 ? 1.7 : 1.35;
      if ((e.data['shieldT'] as number) > cycle) e.data['shieldT'] = 0;
      const shielding = (e.data['shieldT'] as number) < shieldDur;
      e.data['mirrorShield'] = shielding;
      const ringBucket = Math.floor((e.data['shieldT'] as number) * 8);
      if (shielding && ringBucket % 3 === 0 && e.data['ringBucket'] !== ringBucket) {
        e.data['ringBucket'] = ringBucket;
        import('../../engine/engine').then(({ getEngineState }) => {
          const st = getEngineState();
          const v = st.vfx.find((x) => !x.alive);
          if (!v) return;
          v.alive = true;
          v.age = 0;
          v.life = 0.25;
          v.kind = 'ring';
          v.x = e.x;
          v.y = e.y;
          v.vx = 0;
          v.vy = 0;
          v.color = palHex('C')!;
          v.size = 30;
          v.angle = 0;
          v.rot = 0;
        });
      }
    },
  },
];

function bossPhase(e: Enemy): number {
  const hpFrac = e.maxHp > 0 ? e.hp / e.maxHp : 1;
  if (hpFrac <= 0.35) return 3;
  if (hpFrac <= 0.68) return 2;
  return 1;
}

function invertAllDice(): void {
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
