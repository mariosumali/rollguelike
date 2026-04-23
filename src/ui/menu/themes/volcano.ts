import { palHex } from '../../../sprites/palette';
import { createDrifters, drawMagicCircle, TORCH_MAGMA, updateAndDrawDrift } from '../primitives';
import type { MenuEngine, ThemeController } from '../types';

interface LavaCrack {
  points: { x: number; y: number }[];
  phase: number;
}

interface SmokePuff {
  x: number;
  y: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
}

interface LavaGlobe {
  x: number;
  y: number;
  vy: number;
  life: number;
}

export function createVolcanoTheme(engine: MenuEngine): ThemeController {
  const { W, H, ctx } = engine;

  const cracks: LavaCrack[] = [];
  for (let i = 0; i < 5; i++) {
    const startX = 10 + Math.random() * (W - 20);
    const startY = 232 + Math.floor(Math.random() * 12);
    const pts: { x: number; y: number }[] = [{ x: startX, y: startY }];
    let x = startX;
    let y = startY;
    for (let j = 0; j < 6; j++) {
      x += (Math.random() - 0.5) * 10;
      y += 1 + Math.random() * 3;
      pts.push({ x, y });
    }
    cracks.push({ points: pts, phase: Math.random() * Math.PI * 2 });
  }

  const rockSpires: { x: number; w: number; h: number }[] = [];
  for (let i = 0; i < 6; i++) {
    rockSpires.push({
      x: 30 + i * 24 + Math.floor(Math.random() * 8),
      w: 8 + Math.floor(Math.random() * 6),
      h: 20 + Math.floor(Math.random() * 24),
    });
  }

  // Falling ash particles.
  const ash = createDrifters({
    count: 35,
    bounds: { x0: -2, x1: W + 2, y0: -4, y1: H + 4 },
    vx: [-0.1, 0.1],
    vy: [0.25, 0.6],
    size: [1, 2],
    colors: ['rgba(60,60,70,0.6)', 'rgba(90,90,100,0.55)', 'rgba(40,40,50,0.7)', 'rgba(255,100,40,0.5)'],
    alpha: [0.5, 0.9],
    sway: 0.6,
    wrap: 'top',
  });

  const puffs: SmokePuff[] = [];
  const globes: LavaGlobe[] = [];
  let puffTimer = 0;
  let globeTimer = 0;

  return {
    torchPal: TORCH_MAGMA,
    stars: false,
    shootingStars: false,
    magicCircleKey: 'O',

    drawBackdrop(t) {
      // Smoky hellish sky.
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, palHex('J')!);
      grad.addColorStop(0.4, palHex('f')!);
      grad.addColorStop(1, palHex('M')!);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Distant volcano silhouette with glowing caldera.
      const vx = W / 2;
      ctx.fillStyle = palHex('1')!;
      ctx.beginPath();
      ctx.moveTo(vx - 80, 170);
      ctx.lineTo(vx - 20, 60);
      ctx.lineTo(vx + 20, 60);
      ctx.lineTo(vx + 80, 170);
      ctx.closePath();
      ctx.fill();
      // Caldera rim.
      ctx.fillStyle = palHex('0')!;
      ctx.fillRect(vx - 22, 56, 44, 6);
      // Glowing crater.
      const glow = 0.5 + 0.5 * Math.sin(t * 2);
      ctx.save();
      ctx.globalAlpha = 0.4 + glow * 0.3;
      ctx.fillStyle = palHex('u')!;
      ctx.beginPath();
      ctx.arc(vx, 64, 14 + glow * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = palHex('O')!;
      ctx.fillRect(vx - 10, 60, 20, 4);
      ctx.fillStyle = palHex('y')!;
      ctx.fillRect(vx - 5, 61, 10, 2);

      // Lava flows running down the flanks.
      for (const side of [-1, 1]) {
        ctx.fillStyle = palHex('u')!;
        for (let y = 62; y < 168; y += 2) {
          const prog = (y - 62) / 106;
          const x = vx + side * (8 + prog * 62);
          const wiggle = Math.round(Math.sin(y * 0.4 + t * 2 + side) * 1.5);
          ctx.fillRect(x + wiggle, y, 2, 2);
          if ((y & 3) === 0) {
            ctx.fillStyle = palHex('y')!;
            ctx.fillRect(x + wiggle, y, 1, 1);
            ctx.fillStyle = palHex('u')!;
          }
        }
      }

      // Ember haze near the horizon.
      ctx.save();
      ctx.globalAlpha = 0.15;
      ctx.fillStyle = palHex('t')!;
      ctx.fillRect(0, 160, W, 18);
      ctx.restore();
    },

    drawMidground(t) {
      // Jagged rock spires in the middle distance.
      for (const r of rockSpires) {
        ctx.fillStyle = palHex('1')!;
        for (let y = 0; y < r.h; y++) {
          const prog = y / r.h;
          const w = Math.max(1, Math.round(r.w * (1 - prog * 0.4)));
          const px = r.x + Math.floor((r.w - w) / 2);
          ctx.fillRect(px, 226 - r.h + y, w, 1);
        }
        ctx.fillStyle = palHex('2')!;
        ctx.fillRect(r.x + 1, 226 - r.h, 1, r.h);
        // Lava veins in the rocks.
        if (r.h > 20) {
          ctx.fillStyle = palHex('u')!;
          const pulse = 0.5 + 0.5 * Math.sin(t * 3 + r.x);
          if (pulse > 0.3) {
            ctx.fillRect(r.x + r.w - 3, 226 - r.h + 6, 1, r.h - 10);
          }
        }
      }

      // Rock pillars holding the torches.
      for (const px of [10, W - 20]) {
        ctx.fillStyle = palHex('1')!;
        ctx.fillRect(px + 2, 160, 6, 70);
        ctx.fillStyle = palHex('2')!;
        ctx.fillRect(px + 2, 160, 1, 70);
        // Lava cracks running up the pillar.
        const pulse = 0.5 + 0.5 * Math.sin(t * 4 + px);
        ctx.save();
        ctx.globalAlpha = 0.6 + pulse * 0.4;
        ctx.fillStyle = palHex('u')!;
        ctx.fillRect(px + 5, 170, 1, 20);
        ctx.fillRect(px + 5, 195, 1, 14);
        ctx.restore();
      }
    },

    drawFloor(t, dt) {
      const y0 = 228;
      // Cracked obsidian ground.
      ctx.fillStyle = palHex('1')!;
      ctx.fillRect(0, y0, W, H - y0);
      ctx.fillStyle = palHex('2')!;
      for (let x = 0; x < W; x += 3) {
        if ((x * 7 + y0) % 17 < 5) ctx.fillRect(x, y0 + 1, 1, 1);
      }

      // Glowing magma cracks through the floor.
      for (const c of cracks) {
        const pulse = 0.5 + 0.5 * Math.sin(t * 2.5 + c.phase);
        ctx.save();
        ctx.globalAlpha = 0.4 + pulse * 0.4;
        ctx.strokeStyle = palHex('u')!;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < c.points.length; i++) {
          const p = c.points[i]!;
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
        ctx.restore();

        // Brighter core of the crack.
        ctx.save();
        ctx.globalAlpha = 0.4 + pulse * 0.5;
        ctx.fillStyle = palHex('y')!;
        for (const p of c.points) ctx.fillRect(p.x, p.y, 1, 1);
        ctx.restore();
      }

      // Occasional lava pop — a glowing globe arcs briefly upward.
      globeTimer -= dt;
      if (globeTimer <= 0) {
        globeTimer = 0.8 + Math.random() * 1.5;
        const c = cracks[Math.floor(Math.random() * cracks.length)]!;
        const p = c.points[Math.floor(c.points.length / 2)]!;
        globes.push({ x: p.x, y: p.y, vy: -60 - Math.random() * 40, life: 1.2 });
      }
      for (let i = globes.length - 1; i >= 0; i--) {
        const g = globes[i]!;
        g.life -= dt;
        g.y += g.vy * dt;
        g.vy += 140 * dt;
        if (g.life <= 0 || g.y > H) {
          globes.splice(i, 1);
          continue;
        }
        ctx.fillStyle = palHex('y')!;
        ctx.fillRect(Math.round(g.x), Math.round(g.y), 1, 1);
        ctx.fillStyle = palHex('u')!;
        ctx.fillRect(Math.round(g.x), Math.round(g.y) + 1, 1, 1);
        engine.spawnEmber(g.x, g.y, palHex('O')!);
      }

      drawMagicCircle(engine, t, palHex('O')!);
    },

    drawOverlay(t, dt) {
      updateAndDrawDrift(engine, ash, t, dt, {
        x0: -2,
        x1: W + 2,
        y0: -4,
        y1: 228,
      });

      // Smoke rising from the volcano crater.
      puffTimer -= dt;
      if (puffTimer <= 0) {
        puffTimer = 0.25 + Math.random() * 0.35;
        puffs.push({
          x: W / 2 + (Math.random() - 0.5) * 10,
          y: 60,
          vy: -10 - Math.random() * 8,
          size: 3 + Math.floor(Math.random() * 3),
          alpha: 0.25 + Math.random() * 0.15,
          life: 2.5 + Math.random(),
        });
      }
      for (let i = puffs.length - 1; i >= 0; i--) {
        const p = puffs[i]!;
        p.life -= dt;
        p.y += p.vy * dt;
        p.x += Math.sin(t + p.y * 0.1) * 0.2;
        if (p.life <= 0) {
          puffs.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = p.alpha * (p.life / 3);
        ctx.fillStyle = palHex('a')!;
        ctx.beginPath();
        ctx.arc(Math.round(p.x), Math.round(p.y), p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    },
  };
}
