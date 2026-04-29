import { palHex } from '../../../sprites/palette';
import { drawMagicCircle, skyGradient, TORCH_CRYSTAL } from '../primitives';
import type { MenuEngine, ThemeController } from '../types';

interface Stalactite {
  x: number;
  h: number;
}

interface Crystal {
  x: number;
  y: number;
  h: number;
  color: string;
  seed: number;
}

interface Drip {
  sourceX: number;
  sourceY: number;
  targetY: number;
  y: number;
  delay: number;
  speed: number;
}

interface Mushroom {
  x: number;
  y: number;
  color: string;
  phase: number;
}

export function createCaveTheme(engine: MenuEngine): ThemeController {
  const { W, H, ctx } = engine;

  const stalactites: Stalactite[] = [];
  for (let x = 4; x < W - 4; x += 6 + Math.floor(Math.random() * 6)) {
    stalactites.push({ x, h: 8 + Math.floor(Math.random() * 16) });
  }

  const crystals: Crystal[] = [];
  for (let i = 0; i < 10; i++) {
    crystals.push({
      x: 18 + i * 18 + Math.floor(Math.random() * 6),
      y: 200 + Math.floor(Math.random() * 16),
      h: 6 + Math.floor(Math.random() * 10),
      color: ['I', 'H', 'w', 'r', 'G'][Math.floor(Math.random() * 5)]!,
      seed: Math.random() * Math.PI * 2,
    });
  }

  // Dripping water from select stalactites.
  const drips: Drip[] = stalactites.filter((_, i) => i % 3 === 0).slice(0, 6).map((s) => ({
    sourceX: s.x,
    sourceY: s.h,
    targetY: 200 + Math.random() * 20,
    y: s.h,
    delay: Math.random() * 3,
    speed: 60 + Math.random() * 40,
  }));

  const mushrooms: Mushroom[] = [];
  for (let i = 0; i < 6; i++) {
    mushrooms.push({
      x: 14 + i * 30 + Math.floor(Math.random() * 10),
      y: 232 + Math.floor(Math.random() * 8),
      color: ['I', 'H'][Math.floor(Math.random() * 2)]!,
      phase: Math.random() * Math.PI * 2,
    });
  }

  return {
    torchPal: TORCH_CRYSTAL,
    torchMounts: [{ x: 15, y: 155 }, { x: W - 15, y: 155 }],
    stars: false,
    shootingStars: false,
    magicCircleKey: 'H',

    drawBackdrop() {
      skyGradient(engine, '2', '1', '0');
      // Large rock mass filling the scene.
      ctx.fillStyle = palHex('1')!;
      ctx.fillRect(0, 0, W, 180);
      ctx.fillStyle = palHex('2')!;
      for (let x = 0; x < W; x += 3) {
        for (let y = 0; y < 180; y += 5) {
          if ((x * 7 + y * 11) % 31 < 3) {
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
    },

    drawMidground(t) {
      // Stalactites hanging from the ceiling.
      for (const s of stalactites) {
        ctx.fillStyle = palHex('2')!;
        for (let i = 0; i < s.h; i++) {
          const w = Math.max(1, s.h - i);
          const off = Math.floor((s.h - i) / 2);
          ctx.fillRect(s.x - off, i, Math.min(w, 4), 1);
        }
        ctx.fillStyle = palHex('3')!;
        ctx.fillRect(s.x, 0, 1, s.h);
      }

      // Glowing crystals clustered on the floor.
      for (const c of crystals) {
        const pulse = 0.5 + 0.5 * Math.sin(t * 2.5 + c.seed);
        ctx.save();
        ctx.globalAlpha = 0.18 + pulse * 0.18;
        ctx.fillStyle = palHex(c.color)!;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.h + 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.fillStyle = palHex(c.color)!;
        for (let i = 0; i < c.h; i++) {
          const w = Math.max(1, Math.floor((c.h - i) / 1.5));
          ctx.fillRect(c.x - Math.floor(w / 2), c.y - i, w, 1);
        }
        ctx.fillStyle = palHex('e')!;
        ctx.fillRect(c.x, c.y - c.h + 1, 1, 1);
      }

      // Iron sconces for the torches.
      for (const px of [10, W - 20]) {
        ctx.fillStyle = palHex('a')!;
        ctx.fillRect(px + 3, 160, 4, 70);
        ctx.fillStyle = palHex('b')!;
        ctx.fillRect(px + 3, 160, 1, 70);
      }
    },

    drawFloor(t) {
      const y0 = 228;
      ctx.fillStyle = palHex('2')!;
      ctx.fillRect(0, y0, W, H - y0);
      ctx.fillStyle = palHex('3')!;
      for (let x = 0; x < W; x++) {
        const h = 1 + Math.round((Math.sin(x * 0.2) + 1) * 1);
        ctx.fillRect(x, y0, 1, h);
      }
      // Loose rubble.
      ctx.fillStyle = palHex('1')!;
      for (let i = 0; i < W; i += 7) {
        ctx.fillRect(i + 2, y0 + 3 + (i & 1), 2, 1);
      }

      // Glowing mushrooms along the floor.
      for (const m of mushrooms) {
        const pulse = 0.5 + 0.5 * Math.sin(t * 2 + m.phase);
        ctx.save();
        ctx.globalAlpha = 0.15 + pulse * 0.15;
        ctx.fillStyle = palHex(m.color)!;
        ctx.beginPath();
        ctx.arc(m.x + 2, m.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        // Stalk.
        ctx.fillStyle = palHex('e')!;
        ctx.fillRect(m.x + 2, m.y - 2, 1, 3);
        // Cap.
        ctx.fillStyle = palHex(m.color)!;
        ctx.fillRect(m.x + 1, m.y - 3, 3, 1);
        ctx.fillRect(m.x, m.y - 2, 5, 1);
        ctx.fillStyle = palHex('e')!;
        ctx.fillRect(m.x + 2, m.y - 3, 1, 1);
      }

      drawMagicCircle(engine, t, palHex('H')!);
    },

    drawOverlay(t, dt) {
      // Water drips.
      const step = Math.min(2.5, dt * 60);
      for (const d of drips) {
        d.delay -= step / 60;
        if (d.delay > 0) continue;
        d.y += d.speed * dt;
        if (d.y > d.targetY) {
          // Splash ripple.
          ctx.save();
          ctx.globalAlpha = 0.5;
          ctx.fillStyle = palHex('I')!;
          ctx.fillRect(d.sourceX - 2, d.targetY, 4, 1);
          ctx.restore();
          d.y = d.sourceY;
          d.delay = 1.5 + Math.random() * 2.5;
        } else {
          ctx.fillStyle = palHex('I')!;
          ctx.fillRect(d.sourceX, Math.round(d.y), 1, 2);
        }
      }

      // Subtle ambient light shaft near the magic circle.
      const halo = 0.12 + 0.05 * Math.sin(t * 1.5);
      ctx.save();
      ctx.globalAlpha = halo;
      ctx.fillStyle = palHex('H')!;
      ctx.beginPath();
      ctx.arc(W / 2, 238, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    },
  };
}
