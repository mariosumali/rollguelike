import type { Upgrade, VfxKind } from '../../types';
import { getEngineState } from '../../engine/engine';
import { getRunState } from '../../state/store';
import { palHex } from '../../sprites/palette';
import { PLAYER_X, PLAYER_Y } from '../../config/constants';

function grantMomentum(stacks = 1): void {
  const run = getRunState();
  if (!run) return;
  run.momentum = Math.min(10, (run.momentum ?? 0) + stacks);
  run.momentumT = 1.4;
}

function spawnVfxLite(opts: {
  x: number;
  y: number;
  kind: VfxKind;
  color: string;
  size: number;
  life: number;
  vx?: number;
  vy?: number;
  angle?: number;
  rot?: number;
  data?: number;
}): void {
  const eng = getEngineState();
  const v = eng.vfx.find((vv) => !vv.alive);
  if (!v) return;
  v.alive = true;
  v.age = 0;
  v.life = opts.life;
  v.kind = opts.kind;
  v.x = opts.x;
  v.y = opts.y;
  v.vx = opts.vx ?? 0;
  v.vy = opts.vy ?? 0;
  v.color = opts.color;
  v.size = opts.size;
  v.angle = opts.angle ?? 0;
  v.rot = opts.rot ?? 0;
  v.data = opts.data;
}

function drawZap(x1: number, y1: number, x2: number, y2: number, color: string): void {
  spawnVfxLite({
    x: x1,
    y: y1,
    kind: 'lightning',
    color,
    size: 0,
    life: 0.22,
    data: (x2 & 0x3ff) | ((y2 & 0x3ff) << 10),
  });
}

function spawnRingVfx(x: number, y: number, size: number, color: string, life = 0.35): void {
  spawnVfxLite({ x, y, kind: 'ring', color, size, life });
}

function spawnSpark(x: number, y: number, color: string, rng: () => number): void {
  const ang = rng() * Math.PI * 2;
  const sp = 30 + rng() * 40;
  spawnVfxLite({
    x,
    y,
    kind: 'spark',
    color,
    size: 2,
    life: 0.25 + rng() * 0.2,
    vx: Math.cos(ang) * sp,
    vy: Math.sin(ang) * sp,
  });
}

function spawnMuzzle(projectile: { x: number; y: number; vx: number; vy: number }, color: string): void {
  const ang = Math.atan2(projectile.vy, projectile.vx);
  spawnVfxLite({
    x: projectile.x,
    y: projectile.y,
    kind: 'muzzle',
    color,
    size: 2,
    life: 0.14,
    angle: ang,
    vx: Math.cos(ang) * 25,
    vy: Math.sin(ang) * 25,
  });
}

function spawnImpact(x: number, y: number, color: string, rng: () => number, count = 4): void {
  for (let i = 0; i < count; i++) spawnSpark(x, y, color, rng);
}

export const ARSENAL_UPGRADES: Upgrade[] = [
  {
    id: 'ars_firebolt',
    name: 'Firebolt [Thermal]',
    desc: 'Ignites: stacking burn (fire DoT) on hit. Leaves fire-ring impact.',
    rarity: 'epic',
    category: 'projectile',
    maxStack: 2,
    unlockHint: 'Starter',
    hooks: {
      onProjectileSpawn: ({ projectile }) => {
        projectile.element = 'fire';
        projectile.color = palHex('u')!;
        spawnMuzzle(projectile, palHex('u')!);
      },
      onProjectileHit: ({ enemy, projectile, rng }) => {
        enemy.poisonT = Math.max(enemy.poisonT, 2.5) + 0.4;
        enemy.poisonDps = Math.max(enemy.poisonDps, 6 + projectile.damage * 0.18);
        spawnRingVfx(enemy.x, enemy.y, 6, palHex('u')!, 0.28);
        spawnImpact(enemy.x, enemy.y, palHex('v')!, rng, 3);
      },
    },
  },
  {
    id: 'ars_arc_bolt',
    name: 'Arc Bolt [Voltaic]',
    desc: 'Lightning. 15% to Charge targets. +1 chain. Arc sparks on hit.',
    rarity: 'epic',
    category: 'projectile',
    maxStack: 2,
    unlockHint: 'Starter',
    hooks: {
      onProjectileSpawn: ({ projectile }) => {
        projectile.element = 'lightning';
        projectile.chain += 1;
        projectile.color = palHex('y')!;
        spawnMuzzle(projectile, palHex('y')!);
      },
      onProjectileHit: ({ enemy, rng }) => {
        if (rng() < 0.15) {
          enemy.charged = Math.max(enemy.charged, 2);
          spawnRingVfx(enemy.x, enemy.y, 8, palHex('y')!, 0.3);
        }
        spawnImpact(enemy.x, enemy.y, palHex('y')!, rng, 3);
      },
    },
  },
  {
    id: 'ars_pulse_shot',
    name: 'Pulse Shot [Kinetic]',
    desc: 'Erupting AoE hits. Grants Momentum (+dmg stack, decays).',
    rarity: 'epic',
    category: 'projectile',
    maxStack: 2,
    unlockHint: 'Starter',
    hooks: {
      onProjectileSpawn: ({ projectile }) => {
        projectile.aoeOnHit = Math.max(projectile.aoeOnHit, 14);
        spawnMuzzle(projectile, palHex('n')!);
      },
      onProjectileHit: ({ enemy }) => {
        grantMomentum(1);
        spawnRingVfx(enemy.x, enemy.y, 10, palHex('n')!, 0.32);
      },
    },
  },
  {
    id: 'ars_piercing_shot',
    name: 'Piercing Rail [Kinetic]',
    desc: '+3 pierce. Each pierce grants Momentum.',
    rarity: 'epic',
    category: 'projectile',
    maxStack: 2,
    unlockHint: 'Complete 2 runs',
    unlockCondition: (m) => m.totalRunsCompleted >= 2,
    hooks: {
      onProjectileSpawn: ({ projectile }) => {
        projectile.pierce += 3;
        spawnMuzzle(projectile, palHex('D')!);
      },
      onProjectileHit: ({ enemy, rng }) => {
        grantMomentum(1);
        spawnImpact(enemy.x, enemy.y, palHex('D')!, rng, 2);
      },
    },
  },
  {
    id: 'ars_frost_shard',
    name: 'Frost Shard [Cryo]',
    desc: 'Ice. Applies 2 chill stacks; 2 stacks = freeze. Crystal burst.',
    rarity: 'epic',
    category: 'projectile',
    maxStack: 2,
    unlockHint: 'Starter',
    hooks: {
      onProjectileSpawn: ({ projectile }) => {
        projectile.element = 'ice';
        projectile.color = palHex('q')!;
        spawnMuzzle(projectile, palHex('q')!);
      },
      onProjectileHit: ({ enemy, rng }) => {
        enemy.chill += 2;
        spawnVfxLite({ x: enemy.x, y: enemy.y, kind: 'freeze', color: palHex('r')!, size: 3, life: 0.45 });
        spawnImpact(enemy.x, enemy.y, palHex('r')!, rng, 2);
      },
    },
  },
  {
    id: 'ars_aqua_bolt',
    name: 'Aqua Bolt [Hydro]',
    desc: 'Erodes defenses: +2 corrode (stacking +dmg taken). Spray FX.',
    rarity: 'epic',
    category: 'projectile',
    maxStack: 3,
    unlockHint: 'Starter',
    hooks: {
      onProjectileSpawn: ({ projectile }) => {
        projectile.color = palHex('D')!;
        spawnMuzzle(projectile, palHex('D')!);
      },
      onProjectileHit: ({ enemy, rng }) => {
        enemy.corrode = Math.min(8, enemy.corrode + 2);
        spawnImpact(enemy.x, enemy.y, palHex('C')!, rng, 4);
      },
    },
  },
  {
    id: 'ars_scatter_bolt',
    name: 'Scatter Bolt [Thermal]',
    desc: 'Splits into 2 homing fragments on first hit. Ember burst.',
    rarity: 'epic',
    category: 'projectile',
    maxStack: 2,
    unlockHint: 'Complete 3 runs',
    unlockCondition: (m) => m.totalRunsCompleted >= 3,
    hooks: {
      onProjectileSpawn: ({ projectile }) => {
        projectile.split += 1;
        projectile.homing = true;
        spawnMuzzle(projectile, palHex('v')!);
      },
      onProjectileHit: ({ enemy, rng }) => {
        spawnImpact(enemy.x, enemy.y, palHex('v')!, rng, 5);
      },
    },
  },
  {
    id: 'ars_void_bolt',
    name: 'Void Bolt [Void]',
    desc: 'Applies Void Mark. Next hit detonates all marks for heavy bonus.',
    rarity: 'epic',
    category: 'projectile',
    maxStack: 3,
    unlockHint: 'Reach wave 6',
    unlockCondition: (m) => m.maxWaveReached >= 6,
    hooks: {
      onProjectileSpawn: ({ projectile }) => {
        projectile.color = palHex('H')!;
        spawnMuzzle(projectile, palHex('H')!);
      },
      onProjectileHit: ({ enemy }) => {
        enemy.voidMark = Math.min(5, enemy.voidMark + 1);
        spawnRingVfx(enemy.x, enemy.y, 7, palHex('H')!, 0.35);
      },
    },
  },
  {
    id: 'ars_stone_shard',
    name: 'Stone Shard [Terra]',
    desc: '+40% dmg, slower. Petrifies target (slow + brief freeze).',
    rarity: 'epic',
    category: 'projectile',
    maxStack: 2,
    unlockHint: 'Defeat 200 enemies',
    unlockCondition: (m) => (m.totalKills ?? 0) >= 200,
    hooks: {
      onProjectileSpawn: ({ projectile }) => {
        projectile.damage *= 1.4;
        projectile.vx *= 0.75;
        projectile.vy *= 0.75;
        projectile.radius += 1;
        projectile.color = palHex('8')!;
        spawnMuzzle(projectile, palHex('8')!);
      },
      onProjectileHit: ({ enemy, rng }) => {
        enemy.slow = Math.max(enemy.slow, 0.75);
        enemy.freeze = Math.max(enemy.freeze, 0.5);
        spawnImpact(enemy.x, enemy.y, palHex('8')!, rng, 3);
        spawnRingVfx(enemy.x, enemy.y, 10, palHex('7')!, 0.4);
      },
    },
  },
  {
    id: 'ars_thorn_shot',
    name: 'Thorn Shot [Flora]',
    desc: 'Poisons targets. Heals 2 HP on kill from poisoned enemies.',
    rarity: 'epic',
    category: 'projectile',
    maxStack: 2,
    unlockHint: 'Complete 5 runs AND reach wave 10',
    unlockCondition: (m) => m.totalRunsCompleted >= 5 && m.maxWaveReached >= 10,
    hooks: {
      onProjectileSpawn: ({ projectile }) => {
        if (projectile.element === 'none') projectile.element = 'poison';
        projectile.color = palHex('z')!;
        spawnMuzzle(projectile, palHex('z')!);
      },
      onProjectileHit: ({ enemy, projectile, rng }) => {
        enemy.poisonT = Math.max(enemy.poisonT, 3);
        enemy.poisonDps = Math.max(enemy.poisonDps, 8 + projectile.damage * 0.1);
        spawnVfxLite({ x: enemy.x, y: enemy.y, kind: 'poison', color: palHex('z')!, size: 6, life: 0.55 });
        spawnImpact(enemy.x, enemy.y, palHex('m')!, rng, 3);
      },
      onKill: ({ enemy }) => {
        if (enemy.poisonT > 0) {
          const run = getRunState();
          if (run) run.hp = Math.min(run.maxHp, run.hp + 2);
        }
      },
    },
  },
  {
    id: 'ars_glacial_ricochet',
    name: 'Glacial Ricochet [Cryo]',
    desc: '+3 bounces. Ice element. Each bounce chills.',
    rarity: 'epic',
    category: 'projectile',
    maxStack: 2,
    unlockHint: 'Reach wave 8',
    unlockCondition: (m) => m.maxWaveReached >= 8,
    hooks: {
      onProjectileSpawn: ({ projectile }) => {
        projectile.bounces += 3;
        projectile.element = 'ice';
        projectile.color = palHex('r')!;
        spawnMuzzle(projectile, palHex('r')!);
      },
      onProjectileHit: ({ enemy }) => {
        enemy.chill += 1;
        spawnVfxLite({ x: enemy.x, y: enemy.y, kind: 'freeze', color: palHex('r')!, size: 2, life: 0.3 });
      },
    },
  },
  {
    id: 'ars_chrono_pulse',
    name: 'Chrono Pulse [Temporal]',
    desc: 'Hits create a time-slow bubble. Nearby enemies slowed.',
    rarity: 'epic',
    category: 'projectile',
    maxStack: 2,
    minWave: 5,
    unlockHint: 'Reach wave 12 on any run',
    unlockCondition: (m) => m.maxWaveReached >= 12,
    hooks: {
      onProjectileHit: ({ enemy }) => {
        const eng = getEngineState();
        for (const e of eng.enemies) {
          if (!e.alive || e.state === 'die') continue;
          const dx = e.x - enemy.x;
          const dy = e.y - enemy.y;
          if (dx * dx + dy * dy < 28 * 28) {
            e.slow = Math.max(e.slow, 0.7);
            e.freeze = Math.max(e.freeze, 0.4);
          }
        }
        spawnRingVfx(enemy.x, enemy.y, 24, palHex('G')!, 0.55);
        spawnRingVfx(enemy.x, enemy.y, 14, palHex('H')!, 0.4);
      },
    },
  },
  {
    id: 'ars_depth_charge',
    name: 'Depth Charge [Hydro]',
    desc: 'Slow homing orb. Detonates in a corrosive blast on impact.',
    rarity: 'epic',
    category: 'projectile',
    maxStack: 1,
    unlockHint: 'Defeat 500 enemies',
    unlockCondition: (m) => (m.totalKills ?? 0) >= 500,
    hooks: {
      onProjectileSpawn: ({ projectile }) => {
        projectile.homing = true;
        projectile.vx *= 0.55;
        projectile.vy *= 0.55;
        projectile.aoeOnHit = Math.max(projectile.aoeOnHit, 22);
        projectile.radius += 1;
        projectile.color = palHex('C')!;
        spawnMuzzle(projectile, palHex('C')!);
      },
      onProjectileHit: ({ enemy, rng }) => {
        const eng = getEngineState();
        for (const e of eng.enemies) {
          if (!e.alive || e.state === 'die') continue;
          const dx = e.x - enemy.x;
          const dy = e.y - enemy.y;
          if (dx * dx + dy * dy < 26 * 26) {
            e.corrode = Math.min(8, e.corrode + 2);
          }
        }
        spawnVfxLite({ x: enemy.x, y: enemy.y, kind: 'explosion', color: palHex('C')!, size: 8, life: 0.45 });
        spawnImpact(enemy.x, enemy.y, palHex('D')!, rng, 6);
      },
    },
  },
  {
    id: 'ars_spore_swarm',
    name: 'Spore Swarm [Flora]',
    desc: '+2 split. Splits become poison-aspected.',
    rarity: 'epic',
    category: 'projectile',
    maxStack: 2,
    minWave: 6,
    unlockHint: 'Complete 8 runs',
    unlockCondition: (m) => m.totalRunsCompleted >= 8,
    hooks: {
      onProjectileSpawn: ({ projectile }) => {
        projectile.split += 2;
        spawnMuzzle(projectile, palHex('z')!);
      },
      onProjectileHit: ({ projectile, enemy }) => {
        if (projectile.split > 0) projectile.element = 'poison';
        spawnVfxLite({ x: enemy.x, y: enemy.y, kind: 'poison', color: palHex('z')!, size: 5, life: 0.45 });
      },
    },
  },
  {
    id: 'ars_wind_slash',
    name: 'Wind Slash [Aero]',
    desc: '+50% projectile speed. Hits push enemies back upward.',
    rarity: 'epic',
    category: 'projectile',
    maxStack: 2,
    unlockHint: 'Reach wave 10 on any run',
    unlockCondition: (m) => m.maxWaveReached >= 10,
    hooks: {
      onProjectileSpawn: ({ projectile }) => {
        projectile.vx *= 1.5;
        projectile.vy *= 1.5;
        projectile.color = palHex('n')!;
        spawnMuzzle(projectile, palHex('n')!);
      },
      onProjectileHit: ({ enemy, rng }) => {
        enemy.y -= 10;
        spawnVfxLite({
          x: enemy.x,
          y: enemy.y,
          kind: 'slash',
          color: palHex('n')!,
          size: 6,
          life: 0.25,
          angle: rng() * Math.PI * 2,
        });
      },
    },
  },
  {
    id: 'ars_boulder_roll',
    name: 'Boulder Roll [Terra]',
    desc: 'Massive slow projectiles. +2 pierce. Quake AoE on hit.',
    rarity: 'epic',
    category: 'projectile',
    maxStack: 1,
    minWave: 6,
    unlockHint: 'Defeat 800 enemies AND complete 10 runs',
    unlockCondition: (m) => (m.totalKills ?? 0) >= 800 && m.totalRunsCompleted >= 10,
    hooks: {
      onProjectileSpawn: ({ projectile }) => {
        projectile.radius += 3;
        projectile.pierce += 2;
        projectile.vx *= 0.7;
        projectile.vy *= 0.7;
        projectile.aoeOnHit = Math.max(projectile.aoeOnHit, 18);
        projectile.color = palHex('7')!;
        spawnMuzzle(projectile, palHex('7')!);
      },
      onProjectileHit: ({ enemy, rng }) => {
        spawnVfxLite({ x: enemy.x, y: enemy.y, kind: 'explosion', color: palHex('8')!, size: 10, life: 0.4 });
        spawnImpact(enemy.x, enemy.y, palHex('7')!, rng, 6);
      },
    },
  },
  {
    id: 'ars_holy_bolt',
    name: 'Holy Bolt [Lumina]',
    desc: 'Applies Radiance. 5 stacks = execute 22% max HP.',
    rarity: 'epic',
    category: 'projectile',
    maxStack: 2,
    minWave: 4,
    unlockHint: 'Reach wave 15 on any run',
    unlockCondition: (m) => m.maxWaveReached >= 15,
    hooks: {
      onProjectileSpawn: ({ projectile }) => {
        projectile.color = palHex('y')!;
        spawnMuzzle(projectile, palHex('x')!);
      },
      onProjectileHit: ({ enemy, rng }) => {
        enemy.radiance = Math.min(6, enemy.radiance + 1);
        spawnRingVfx(enemy.x, enemy.y, 9, palHex('x')!, 0.35);
        spawnImpact(enemy.x, enemy.y, palHex('I')!, rng, 2);
      },
    },
  },
  {
    id: 'ars_tempest_needle',
    name: 'Tempest Needle [Voltaic]',
    desc: '+2 chain. Lightning. Chained targets become Charged.',
    rarity: 'epic',
    category: 'projectile',
    maxStack: 2,
    unlockHint: 'Reach wave 18 on any run',
    unlockCondition: (m) => m.maxWaveReached >= 18,
    hooks: {
      onProjectileSpawn: ({ projectile }) => {
        projectile.chain += 2;
        projectile.element = 'lightning';
        projectile.color = palHex('D')!;
        spawnMuzzle(projectile, palHex('y')!);
      },
      onProjectileHit: ({ enemy, rng }) => {
        enemy.charged = Math.max(enemy.charged, 1.8);
        spawnImpact(enemy.x, enemy.y, palHex('y')!, rng, 3);
      },
    },
  },
  {
    id: 'ars_tempest_razor',
    name: 'Tempest Razor [Aero]',
    desc: '+2 chain and +2 pierce.',
    rarity: 'legendary',
    category: 'projectile',
    maxStack: 1,
    minWave: 10,
    unlockHint: 'Reach wave 20 AND defeat 1500 enemies',
    unlockCondition: (m) => m.maxWaveReached >= 20 && (m.totalKills ?? 0) >= 1500,
    hooks: {
      onProjectileSpawn: ({ projectile }) => {
        projectile.chain += 2;
        projectile.pierce += 2;
        spawnMuzzle(projectile, palHex('n')!);
      },
      onProjectileHit: ({ enemy, rng }) => {
        spawnVfxLite({
          x: enemy.x,
          y: enemy.y,
          kind: 'slash',
          color: palHex('n')!,
          size: 5,
          life: 0.22,
          angle: rng() * Math.PI * 2,
        });
      },
    },
  },
  {
    id: 'ars_pendulum_seekers',
    name: 'Pendulum Seekers [Harmony]',
    desc: 'Homing + 2 bounces. Hits and bounces apply chill.',
    rarity: 'legendary',
    category: 'projectile',
    maxStack: 1,
    minWave: 10,
    unlockHint: 'Complete 15 runs AND reach wave 20',
    unlockCondition: (m) => m.totalRunsCompleted >= 15 && m.maxWaveReached >= 20,
    hooks: {
      onProjectileSpawn: ({ projectile }) => {
        projectile.homing = true;
        projectile.bounces += 2;
        projectile.color = palHex('I')!;
        spawnMuzzle(projectile, palHex('I')!);
      },
      onProjectileHit: ({ enemy }) => {
        enemy.chill += 1;
        spawnRingVfx(enemy.x, enemy.y, 5, palHex('r')!, 0.25);
      },
    },
  },
  {
    id: 'ars_star_bolt',
    name: 'Star Bolt [Celestial]',
    desc: 'On hit, fragments into 2 homing mini-bolts.',
    rarity: 'legendary',
    category: 'projectile',
    maxStack: 1,
    minWave: 8,
    unlockHint: 'Defeat 2500 enemies',
    unlockCondition: (m) => (m.totalKills ?? 0) >= 2500,
    hooks: {
      onProjectileSpawn: ({ projectile }) => {
        projectile.split += 1;
        projectile.homing = true;
        projectile.color = palHex('I')!;
        spawnMuzzle(projectile, palHex('x')!);
      },
      onProjectileHit: ({ enemy, rng }) => {
        spawnImpact(enemy.x, enemy.y, palHex('x')!, rng, 5);
        spawnRingVfx(enemy.x, enemy.y, 7, palHex('I')!, 0.3);
      },
    },
  },
  {
    id: 'ars_hallowed_rain',
    name: 'Hallowed Rain [Lumina]',
    desc: 'Splits into 2 beams. Each beam builds Radiance.',
    rarity: 'legendary',
    category: 'projectile',
    maxStack: 1,
    minWave: 12,
    unlockHint: 'Reach wave 25 AND complete 20 runs',
    unlockCondition: (m) => m.maxWaveReached >= 25 && m.totalRunsCompleted >= 20,
    hooks: {
      onProjectileSpawn: ({ projectile }) => {
        projectile.split += 2;
        projectile.color = palHex('x')!;
        spawnMuzzle(projectile, palHex('x')!);
      },
      onProjectileHit: ({ enemy, rng }) => {
        enemy.radiance = Math.min(6, enemy.radiance + 1);
        spawnRingVfx(enemy.x, enemy.y, 8, palHex('x')!, 0.35);
        spawnImpact(enemy.x, enemy.y, palHex('I')!, rng, 3);
      },
    },
  },
  {
    id: 'ars_tesla_orb',
    name: 'Tesla Orb [Voltaic]',
    desc: 'Every 2.2s, fire chain-zap at up to 3 nearby enemies. Charges.',
    rarity: 'legendary',
    category: 'aoe',
    maxStack: 2,
    minWave: 8,
    unlockHint: 'Reach wave 22 on any run',
    unlockCondition: (m) => m.maxWaveReached >= 22,
    hooks: {
      onTick: ({ dt }) => {
        const run = getRunState();
        if (!run) return;
        const d = run as unknown as { _teslaT?: number };
        d._teslaT = (d._teslaT ?? 0) + dt;
        if ((d._teslaT ?? 0) < 2.2) return;
        d._teslaT = 0;
        const eng = getEngineState();
        const stacks = run.upgrades.find((u) => u.id === 'ars_tesla_orb')?.stacks ?? 1;
        const targets: { x: number; y: number; id: number }[] = [];
        for (const e of eng.enemies) {
          if (!e.alive || e.state === 'die') continue;
          targets.push({ x: e.x, y: e.y, id: e.id });
        }
        targets.sort((a, b) => {
          const da = (a.x - PLAYER_X) ** 2 + (a.y - PLAYER_Y) ** 2;
          const db = (b.x - PLAYER_X) ** 2 + (b.y - PLAYER_Y) ** 2;
          return da - db;
        });
        let prev = { x: PLAYER_X, y: PLAYER_Y - 10 };
        const dmg = 10 + stacks * 6;
        for (let i = 0; i < Math.min(3 + stacks, targets.length); i++) {
          const t = targets[i]!;
          drawZap(prev.x, prev.y, t.x, t.y, palHex('y')!);
          const enemy = eng.enemies.find((e) => e.id === t.id);
          if (enemy && enemy.alive && enemy.state !== 'die') {
            enemy.hp -= dmg;
            enemy.charged = Math.max(enemy.charged, 1.5);
            enemy.hitFlash = 0.12;
            spawnRingVfx(enemy.x, enemy.y, 5, palHex('y')!, 0.25);
          }
          prev = { x: t.x, y: t.y };
        }
      },
    },
  },
  {
    id: 'ars_paradox_lancet',
    name: 'Paradox Lancet [Temporal]',
    desc: 'Hits rewind enemies: push back and brief slow.',
    rarity: 'legendary',
    category: 'projectile',
    maxStack: 2,
    minWave: 10,
    unlockHint: 'Reach wave 25 AND complete 15 runs',
    unlockCondition: (m) => m.maxWaveReached >= 25 && m.totalRunsCompleted >= 15,
    hooks: {
      onProjectileSpawn: ({ projectile }) => {
        spawnMuzzle(projectile, palHex('G')!);
      },
      onProjectileHit: ({ enemy }) => {
        enemy.y -= 20;
        enemy.slow = Math.max(enemy.slow, 0.5);
        spawnRingVfx(enemy.x, enemy.y, 6, palHex('G')!, 0.3);
        spawnRingVfx(enemy.x, enemy.y, 10, palHex('H')!, 0.4);
      },
    },
  },
  {
    id: 'ars_phantom_scythe',
    name: 'Phantom Scythe [Void]',
    desc: 'Damage scales with target missing HP (up to +150%).',
    rarity: 'legendary',
    category: 'projectile',
    maxStack: 1,
    minWave: 10,
    unlockHint: 'Defeat 5000 enemies AND reach wave 25',
    unlockCondition: (m) => (m.totalKills ?? 0) >= 5000 && m.maxWaveReached >= 25,
    hooks: {
      onProjectileSpawn: ({ projectile }) => {
        projectile.color = palHex('H')!;
        spawnMuzzle(projectile, palHex('H')!);
      },
      onProjectileHit: ({ enemy, projectile, rng }) => {
        const missing = Math.max(0, 1 - enemy.hp / Math.max(1, enemy.maxHp));
        projectile.damage *= 1 + missing * 1.5;
        spawnVfxLite({
          x: enemy.x,
          y: enemy.y,
          kind: 'slash',
          color: palHex('H')!,
          size: 6,
          life: 0.3,
          angle: rng() * Math.PI * 2,
        });
      },
    },
  },
  {
    id: 'ars_spectrum_bolt',
    name: 'Spectrum Bolt [Prism]',
    desc: 'Element cycles each hit: fire → ice → poison → lightning.',
    rarity: 'legendary',
    category: 'projectile',
    maxStack: 1,
    minWave: 10,
    unlockHint: 'Defeat 7000 enemies AND reach wave 30',
    unlockCondition: (m) => (m.totalKills ?? 0) >= 7000 && m.maxWaveReached >= 30,
    hooks: {
      onProjectileSpawn: ({ projectile }) => {
        spawnMuzzle(projectile, palHex('I')!);
      },
      onProjectileHit: ({ projectile, enemy }) => {
        const cycle = ['fire', 'ice', 'poison', 'lightning'] as const;
        const idx = cycle.indexOf(projectile.element as (typeof cycle)[number]);
        projectile.element = cycle[(idx + 1 + cycle.length) % cycle.length]!;
        const colorMap: Record<string, string> = {
          fire: palHex('u')!,
          ice: palHex('q')!,
          poison: palHex('z')!,
          lightning: palHex('y')!,
        };
        spawnRingVfx(enemy.x, enemy.y, 7, colorMap[projectile.element] ?? palHex('I')!, 0.3);
      },
    },
  },
  {
    id: 'ars_graviton_lance',
    name: 'Graviton Lance [Void]',
    desc: 'Projectiles pull nearby enemies toward them while in flight.',
    rarity: 'legendary',
    category: 'projectile',
    maxStack: 1,
    minWave: 12,
    unlockHint: 'Defeat 10000 enemies AND reach wave 30',
    unlockCondition: (m) => (m.totalKills ?? 0) >= 10000 && m.maxWaveReached >= 30,
    hooks: {
      onProjectileSpawn: ({ projectile }) => {
        projectile.tags.add('graviton');
        projectile.color = palHex('W')!;
        spawnMuzzle(projectile, palHex('W')!);
        spawnRingVfx(projectile.x, projectile.y, 9, palHex('H')!, 0.4);
      },
      onProjectileHit: ({ enemy, rng }) => {
        spawnImpact(enemy.x, enemy.y, palHex('H')!, rng, 5);
        spawnRingVfx(enemy.x, enemy.y, 12, palHex('W')!, 0.5);
      },
    },
  },
  {
    id: 'ars_balance_bolt',
    name: 'Balance Bolt [Harmony]',
    desc: '-25% damage. Heals you 1 HP per hit.',
    rarity: 'epic',
    category: 'projectile',
    maxStack: 2,
    unlockHint: 'Complete 12 runs',
    unlockCondition: (m) => m.totalRunsCompleted >= 12,
    hooks: {
      onProjectileSpawn: ({ projectile }) => {
        projectile.damage *= 0.75;
        projectile.lifesteal += 1;
        projectile.color = palHex('m')!;
        spawnMuzzle(projectile, palHex('m')!);
      },
      onProjectileHit: ({ enemy }) => {
        spawnVfxLite({
          x: enemy.x,
          y: enemy.y,
          kind: 'heal',
          color: palHex('m')!,
          size: 2,
          life: 0.3,
          vx: 0,
          vy: -30,
        });
      },
    },
  },
  {
    id: 'ars_comet_trail',
    name: 'Comet Trail [Celestial]',
    desc: 'Leaves a burning trail applying burn to passing enemies.',
    rarity: 'legendary',
    category: 'projectile',
    maxStack: 1,
    minWave: 10,
    unlockHint: 'Reach wave 30 AND score 6000+ in one run',
    unlockCondition: (m) => m.maxWaveReached >= 30 && (m.highScores ? Object.values(m.highScores).some((s) => s >= 6000) : false),
    hooks: {
      onProjectileSpawn: ({ projectile }) => {
        projectile.tags.add('comet');
        projectile.element = 'fire';
        projectile.color = palHex('u')!;
        spawnMuzzle(projectile, palHex('u')!);
      },
      onProjectileHit: ({ enemy, rng }) => {
        spawnVfxLite({ x: enemy.x, y: enemy.y, kind: 'explosion', color: palHex('v')!, size: 7, life: 0.4 });
        spawnImpact(enemy.x, enemy.y, palHex('u')!, rng, 5);
      },
    },
  },
  {
    id: 'ars_prismatic_beam',
    name: 'Prismatic Beam [Prism]',
    desc: '+1 split and +1 pierce. Each hit cycles elements.',
    rarity: 'legendary',
    category: 'projectile',
    maxStack: 1,
    minWave: 14,
    unlockHint: 'Reach wave 35 AND defeat 15000 enemies',
    unlockCondition: (m) => m.maxWaveReached >= 35 && (m.totalKills ?? 0) >= 15000,
    hooks: {
      onProjectileSpawn: ({ projectile }) => {
        projectile.split += 1;
        projectile.pierce += 1;
        spawnMuzzle(projectile, palHex('I')!);
      },
      onProjectileHit: ({ projectile, enemy, rng }) => {
        const cycle = ['fire', 'ice', 'lightning', 'poison', 'arcane'] as const;
        const idx = cycle.indexOf(projectile.element as (typeof cycle)[number]);
        projectile.element = cycle[(idx + 1 + cycle.length) % cycle.length]!;
        spawnImpact(enemy.x, enemy.y, palHex('I')!, rng, 4);
        spawnRingVfx(enemy.x, enemy.y, 9, palHex('x')!, 0.35);
      },
    },
  },
];
