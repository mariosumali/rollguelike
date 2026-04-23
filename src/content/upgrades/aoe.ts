import type { Upgrade } from '../../types';
import { getEngineState } from '../../engine/engine';
import { PLAYER_X, PLAYER_Y, WALL_Y } from '../../config/constants';
import { getRunState } from '../../state/store';

export const AOE_UPGRADES: Upgrade[] = [
  {
    id: 'aoe_start_pulse',
    name: 'Shockwave Start',
    desc: 'Small pulse at wave start.',
    rarity: 'rare',
    category: 'aoe',
    maxStack: 3,
    hooks: {
      onWaveStart: () => {
        const eng = getEngineState();
        const run = getRunState();
        if (!run) return;
        for (const e of eng.enemies) {
          if (!e.alive) continue;
          const dx = e.x - PLAYER_X;
          const dy = e.y - PLAYER_Y;
          if (dx * dx + dy * dy < 60 * 60) {
            e.hp -= 10;
            if (e.hp <= 0) e.alive = false;
          }
        }
      },
    },
  },
  {
    id: 'aoe_kill_nova',
    name: 'Death Nova',
    desc: '10% chance on kill to pulse nearby.',
    rarity: 'epic',
    category: 'aoe',
    maxStack: 3,
    hooks: {
      onKill: ({ enemy, rng }) => {
        if (rng() > 0.1) return;
        const eng = getEngineState();
        for (const e of eng.enemies) {
          if (!e.alive || e === enemy || e.state === 'die') continue;
          const dx = e.x - enemy.x;
          const dy = e.y - enemy.y;
          if (dx * dx + dy * dy < 30 * 30) {
            e.hp -= 15;
          }
        }
      },
    },
  },
  {
    id: 'aoe_wall_thorns',
    name: 'Thorn Wall',
    desc: 'Wall deals damage on touch.',
    rarity: 'rare',
    category: 'aoe',
    maxStack: 2,
    hooks: {
      onTick: ({ dt }) => {
        const eng = getEngineState();
        for (const e of eng.enemies) {
          if (!e.alive || e.state === 'die') continue;
          if (e.y > WALL_Y - 14) {
            e.hp -= 6 * dt;
          }
        }
      },
    },
  },
  {
    id: 'aoe_on_hit_splash',
    name: 'Shockwave Hit',
    desc: 'Hits send out minor shockwaves.',
    rarity: 'epic',
    category: 'aoe',
    maxStack: 2,
    hooks: {
      onProjectileHit: ({ enemy }) => {
        const eng = getEngineState();
        for (const e of eng.enemies) {
          if (!e.alive || e === enemy || e.state === 'die') continue;
          const dx = e.x - enemy.x;
          const dy = e.y - enemy.y;
          if (dx * dx + dy * dy < 18 * 18) {
            e.hp -= 4;
          }
        }
      },
    },
  },
  {
    id: 'aoe_pulse_size',
    name: 'Shock Amplifier',
    desc: 'Pulse radius +15.',
    rarity: 'rare',
    category: 'aoe',
    maxStack: 3,
    hooks: {},
  },
  {
    id: 'aoe_freeze_on_pulse',
    name: 'Frozen Pulse',
    desc: 'Pulse chills enemies.',
    rarity: 'epic',
    category: 'aoe',
    maxStack: 1,
    hooks: {},
  },
  {
    id: 'aoe_chain_lightning',
    name: 'Storm Bond',
    desc: 'Every 3rd kill spawns chain lightning.',
    rarity: 'epic',
    category: 'aoe',
    maxStack: 2,
    hooks: {
      onKill: () => {
        const run = getRunState();
        if (!run) return;
        if (run.kills % 3 !== 0) return;
        const eng = getEngineState();
        let prev: { x: number; y: number } | null = { x: PLAYER_X, y: PLAYER_Y - 10 };
        let count = 0;
        for (const e of eng.enemies) {
          if (!e.alive || count >= 4) continue;
          e.hp -= 20;
          const v = eng.vfx.find((v) => !v.alive);
          if (v && prev) {
            v.alive = true;
            v.age = 0;
            v.life = 0.25;
            v.kind = 'lightning';
            v.x = prev.x;
            v.y = prev.y;
            v.vx = 0;
            v.vy = 0;
            v.data = ((e.x & 0x3ff) | ((e.y & 0x3ff) << 10));
            v.color = '#ffe466';
            v.size = 0;
          }
          prev = { x: e.x, y: e.y };
          count++;
        }
      },
    },
  },
  {
    id: 'aoe_poison_trail',
    name: 'Toxic Wake',
    desc: 'Wall leaks a poison cloud.',
    rarity: 'rare',
    category: 'aoe',
    maxStack: 2,
    hooks: {
      onTick: () => {
        const eng = getEngineState();
        for (const e of eng.enemies) {
          if (!e.alive || e.state === 'die') continue;
          if (e.y > WALL_Y - 30) {
            e.poisonT = Math.max(e.poisonT, 1);
            e.poisonDps = Math.max(e.poisonDps, 3);
          }
        }
      },
    },
  },
  {
    id: 'aoe_wave_explode',
    name: 'Finale',
    desc: 'Big pulse on wave end.',
    rarity: 'epic',
    category: 'aoe',
    maxStack: 2,
    hooks: {
      onWaveEnd: () => {
        const eng = getEngineState();
        for (const e of eng.enemies) {
          if (!e.alive) continue;
          e.hp -= 40;
        }
      },
    },
  },
  {
    id: 'aoe_orbital',
    name: 'Orbital Strike',
    desc: 'Every 5s, random bomb from sky.',
    rarity: 'epic',
    category: 'aoe',
    maxStack: 2,
    hooks: {
      onTick: ({ dt }) => {
        const run = getRunState();
        if (!run) return;
        (run as unknown as { _orbT?: number })._orbT = ((run as unknown as { _orbT?: number })._orbT ?? 0) + dt;
        const t = (run as unknown as { _orbT?: number })._orbT ?? 0;
        if (t > 5) {
          (run as unknown as { _orbT?: number })._orbT = 0;
          const eng = getEngineState();
          let best = null as null | typeof eng.enemies[0];
          for (const e of eng.enemies) {
            if (!e.alive) continue;
            if (!best || e.y > best.y) best = e;
          }
          if (best) {
            for (const e of eng.enemies) {
              if (!e.alive) continue;
              const dx = e.x - best.x;
              const dy = e.y - best.y;
              if (dx * dx + dy * dy < 30 * 30) e.hp -= 30;
            }
            const v = eng.vfx.find((x) => !x.alive);
            if (v) {
              v.alive = true;
              v.age = 0;
              v.life = 0.4;
              v.kind = 'explosion';
              v.x = best.x;
              v.y = best.y;
              v.vx = 0;
              v.vy = 0;
              v.color = '#ff7a2b';
              v.size = 24;
            }
          }
        }
      },
    },
  },
];
