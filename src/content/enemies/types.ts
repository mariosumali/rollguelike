import type { EnemyType } from '../../types';
import * as B from './behaviors';
import { palHex } from '../../sprites/palette';

export const ENEMY_TYPES: EnemyType[] = [
  {
    id: 'rusher',
    name: 'Rusher',
    spriteId: 'enemy_rusher',
    color: palHex('h')!,
    baseHp: 16,
    baseSpeed: 18,
    radius: 7,
    minWave: 1,
    weight: (w) => Math.max(2, 10 - w * 0.1),
    touchDamage: 8,
    scoreValue: 10,
    behavior: B.rusherBehavior,
  },
  {
    id: 'tank',
    name: 'Tank',
    spriteId: 'enemy_tank',
    color: palHex('6')!,
    baseHp: 72,
    baseSpeed: 7,
    radius: 8,
    minWave: 2,
    weight: (w) => Math.min(4, 1 + w * 0.08),
    touchDamage: 14,
    scoreValue: 18,
    behavior: B.tankBehavior,
  },
  {
    id: 'splitter',
    name: 'Splitter',
    spriteId: 'enemy_splitter',
    color: palHex('p')!,
    baseHp: 28,
    baseSpeed: 12,
    radius: 7,
    minWave: 3,
    weight: (w) => Math.min(4, 0.5 + w * 0.1),
    touchDamage: 10,
    scoreValue: 16,
    behavior: B.splitterBehavior,
    onDeath: (e) => {
      if ((e.data['split'] as number | undefined) === 1) return;
      setTimeout(() => {
        import('../../engine/engine').then(({ getEngineState }) => {
          const state = getEngineState();
          for (let i = 0; i < 2; i++) {
            const child = state.enemies.find((x) => !x.alive);
            if (!child) return;
            Object.assign(child, {
              alive: true,
              typeId: 'swarm',
              x: e.x + (i === 0 ? -8 : 8),
              y: e.y,
              vx: (i === 0 ? -12 : 12),
              vy: e.speed,
              maxHp: 14,
              hp: 14,
              radius: 5,
              speed: e.speed * 1.15,
              age: 0,
              state: 'walk' as const,
              flashT: 0,
              dieT: 0,
              data: { split: 1 },
              element: 'none' as const,
              hitFlash: 0,
              slow: 0,
              freeze: 0,
              poisonT: 0,
              poisonDps: 0,
              absorbed: 0,
            });
          }
        });
      }, 0);
    },
  },
  {
    id: 'swarm',
    name: 'Swarm',
    spriteId: 'enemy_swarm',
    color: palHex('O')!,
    baseHp: 9,
    baseSpeed: 24,
    radius: 5,
    minWave: 2,
    weight: (w) => Math.min(6, 1 + w * 0.15),
    touchDamage: 5,
    scoreValue: 6,
    behavior: B.swarmBehavior,
  },
  {
    id: 'drifter',
    name: 'Drifter',
    spriteId: 'enemy_drifter',
    color: palHex('w')!,
    baseHp: 24,
    baseSpeed: 13,
    radius: 6,
    minWave: 4,
    weight: (w) => Math.min(5, 0.5 + w * 0.12),
    touchDamage: 9,
    scoreValue: 14,
    behavior: B.drifterBehavior,
  },
  {
    id: 'oddonly',
    name: 'Odd Walker',
    spriteId: 'enemy_oddonly',
    color: palHex('G')!,
    baseHp: 34,
    baseSpeed: 10,
    radius: 7,
    minWave: 6,
    weight: (w) => Math.min(3, 0.4 + (w - 6) * 0.08),
    touchDamage: 11,
    scoreValue: 22,
    behavior: B.oddOnlyBehavior,
    damageFilter: (roll) => roll.face.value % 2 === 1,
  },
  {
    id: 'copier',
    name: 'Mimic',
    spriteId: 'enemy_copier',
    color: palHex('P')!,
    baseHp: 32,
    baseSpeed: 12,
    radius: 6,
    minWave: 7,
    weight: (w) => Math.min(3, 0.3 + (w - 7) * 0.08),
    touchDamage: 10,
    scoreValue: 20,
    behavior: B.copierBehavior,
  },
  {
    id: 'debuffer',
    name: 'Drainer',
    spriteId: 'enemy_debuffer',
    color: palHex('U')!,
    baseHp: 36,
    baseSpeed: 9,
    radius: 7,
    minWave: 8,
    weight: (w) => Math.min(2, 0.2 + (w - 8) * 0.06),
    touchDamage: 8,
    scoreValue: 24,
    behavior: B.debufferBehavior,
  },
  {
    id: 'absorber',
    name: 'Absorber',
    spriteId: 'enemy_absorber',
    color: palHex('B')!,
    baseHp: 42,
    baseSpeed: 8,
    radius: 7,
    minWave: 9,
    weight: (w) => Math.min(2, 0.2 + (w - 9) * 0.05),
    touchDamage: 12,
    scoreValue: 28,
    behavior: B.absorberBehavior,
  },
  {
    id: 'healer',
    name: 'Mender',
    spriteId: 'enemy_healer',
    color: palHex('m')!,
    baseHp: 30,
    baseSpeed: 9,
    radius: 7,
    minWave: 10,
    weight: (w) => Math.min(2, 0.2 + (w - 10) * 0.04),
    touchDamage: 8,
    scoreValue: 30,
    behavior: B.healerBehavior,
    bossMechanic: (e, dt) => {
      e.data['pulseT'] = ((e.data['pulseT'] as number | undefined) ?? 0) + dt;
      if ((e.data['pulseT'] as number) > 2) {
        e.data['pulseT'] = 0;
        import('../../engine/engine').then(({ getEngineState }) => {
          const state = getEngineState();
          for (const o of state.enemies) {
            if (!o.alive || o === e || o.state === 'die') continue;
            const dx = o.x - e.x;
            const dy = o.y - e.y;
            if (dx * dx + dy * dy < 40 * 40) {
              o.hp = Math.min(o.maxHp, o.hp + o.maxHp * 0.15);
            }
          }
        });
      }
    },
  },
  {
    id: 'invisible',
    name: 'Shade',
    spriteId: 'enemy_invisible',
    color: palHex('w')!,
    baseHp: 22,
    baseSpeed: 14,
    radius: 6,
    minWave: 11,
    weight: (w) => Math.min(3, 0.3 + (w - 11) * 0.05),
    touchDamage: 10,
    scoreValue: 26,
    behavior: B.invisibleBehavior,
  },
  {
    id: 'inverter',
    name: 'Inverter',
    spriteId: 'enemy_inverter',
    color: palHex('F')!,
    baseHp: 38,
    baseSpeed: 10,
    radius: 7,
    minWave: 14,
    weight: (w) => Math.min(2, 0.2 + (w - 14) * 0.05),
    touchDamage: 11,
    scoreValue: 32,
    behavior: B.inverterBehavior,
    onHit: () => {},
  },
  {
    id: 'reflector',
    name: 'Reflector',
    spriteId: 'enemy_reflector',
    color: palHex('C')!,
    baseHp: 36,
    baseSpeed: 8,
    radius: 7,
    minWave: 15,
    weight: (w) => Math.min(2, 0.15 + (w - 15) * 0.04),
    touchDamage: 12,
    scoreValue: 34,
    behavior: B.reflectorBehavior,
  },
  {
    id: 'resurrector',
    name: 'Revenant',
    spriteId: 'enemy_resurrector',
    color: palHex('V')!,
    baseHp: 42,
    baseSpeed: 9,
    radius: 7,
    minWave: 16,
    weight: (w) => Math.min(2, 0.15 + (w - 16) * 0.04),
    touchDamage: 12,
    scoreValue: 36,
    behavior: B.resurrectorBehavior,
    onDeath: (e) => {
      if ((e.data['revived'] as number | undefined) === 1) return;
      setTimeout(() => {
        import('../../engine/engine').then(({ getEngineState }) => {
          const state = getEngineState();
          const child = state.enemies.find((x) => !x.alive);
          if (!child) return;
          Object.assign(child, {
            alive: true,
            typeId: 'rusher',
            x: e.x,
            y: e.y,
            vx: 0,
            vy: e.speed,
            maxHp: 22,
            hp: 22,
            radius: 6,
            speed: e.speed * 1.3,
            age: 0,
            state: 'walk' as const,
            flashT: 0,
            dieT: 0,
            data: { revived: 1 },
            element: 'none' as const,
            hitFlash: 0,
            slow: 0,
            freeze: 0,
            poisonT: 0,
            poisonDps: 0,
            absorbed: 0,
          });
        });
      }, 0);
    },
  },
  {
    id: 'immune',
    name: 'Bulwark',
    spriteId: 'enemy_immune',
    color: palHex('A')!,
    baseHp: 48,
    baseSpeed: 6,
    radius: 7,
    minWave: 18,
    weight: (w) => Math.min(2, 0.15 + (w - 18) * 0.04),
    touchDamage: 14,
    scoreValue: 42,
    behavior: B.immuneBehavior,
    damageFilter: (roll) => roll.face.value >= 3,
  },
];
