import { palHex } from '../../../sprites/palette';
import { drawMagicCircle, skyGradient, TORCH_FIRE } from '../primitives';
import type { MenuEngine, ThemeController } from '../types';

interface DustMote {
  x: number;
  y: number;
  phase: number;
  speed: number;
}

interface ArchCandle {
  x: number;
  seed: number;
}

export function createCastleTheme(engine: MenuEngine): ThemeController {
  const { W, H } = engine;

  const motes: DustMote[] = [];
  for (let i = 0; i < 14; i++) {
    motes.push({
      x: 20 + Math.random() * (W - 40),
      y: 100 + Math.random() * 70,
      phase: Math.random() * Math.PI * 2,
      speed: 0.18 + Math.random() * 0.28,
    });
  }

  const archXs = [24, 62, W - 62 - 16, W - 24 - 16];
  const candles: ArchCandle[] = archXs.map((x, i) => ({ x: x + 5, seed: i * 1.9 + 0.3 }));

  return {
    torchPal: TORCH_FIRE,
    stars: true,
    shootingStars: true,
    magicCircleKey: 'H',

    drawBackdrop() {
      skyGradient(engine, 'E', '2', '0');
    },

    drawMidground(t) {
      const { ctx } = engine;
      const wallTop = 95;
      const wallBot = 170;
      ctx.fillStyle = palHex('1')!;
      ctx.fillRect(0, wallTop, W, wallBot - wallTop);

      ctx.fillStyle = palHex('2')!;
      for (let x = 0; x < W; x += 16) {
        for (let y = wallTop; y < wallBot; y += 8) {
          const o = ((y / 8) & 1) * 8;
          ctx.fillRect(x + o, y, 15, 1);
        }
      }

      for (const ax of archXs) {
        ctx.fillStyle = palHex('0')!;
        ctx.fillRect(ax, wallTop + 8, 10, 18);
        ctx.fillRect(ax + 1, wallTop + 6, 8, 2);
        ctx.fillStyle = 'rgba(255, 165, 75, 0.10)';
        ctx.fillRect(ax + 2, wallTop + 10, 6, 14);
      }

      // Flickering candle flames in each arch.
      for (const c of candles) {
        const flick = 0.5 + 0.5 * Math.sin(t * 7 + c.seed);
        const tall = flick > 0.6;
        ctx.fillStyle = palHex('y')!;
        ctx.fillRect(c.x, wallTop + 22, 1, tall ? 2 : 1);
        if (flick > 0.35) {
          ctx.fillStyle = palHex('v')!;
          ctx.fillRect(c.x, wallTop + 22, 1, 1);
        }
        ctx.save();
        ctx.globalAlpha = 0.18 + 0.08 * flick;
        ctx.fillStyle = palHex('u')!;
        ctx.fillRect(c.x - 1, wallTop + 20, 3, 5);
        ctx.restore();
      }

      // Dust motes drifting slowly upward.
      for (const m of motes) {
        m.y -= m.speed * 0.2;
        if (m.y < wallTop + 2) m.y = wallBot - 4;
        const shimmer = 0.4 + 0.4 * Math.sin(t * 3 + m.phase);
        const xo = Math.round(Math.sin(t * 1.5 + m.phase) * 1);
        const { ctx } = engine;
        ctx.fillStyle = `rgba(255, 220, 150, ${(shimmer * 0.55).toFixed(3)})`;
        ctx.fillRect(Math.round(m.x + xo), Math.round(m.y), 1, 1);
      }

      // Foreground pillars.
      const ys = 155;
      const ye = 230;
      for (const px of [14, W - 14 - 10]) {
        ctx.fillStyle = palHex('a')!;
        ctx.fillRect(px, ys, 10, ye - ys);
        ctx.fillStyle = palHex('b')!;
        ctx.fillRect(px + 1, ys, 1, ye - ys);
        ctx.fillStyle = palHex('4')!;
        ctx.fillRect(px + 8, ys + 1, 2, ye - ys - 1);
        ctx.fillStyle = palHex('c')!;
        ctx.fillRect(px - 1, ys - 3, 12, 3);
        ctx.fillStyle = palHex('b')!;
        ctx.fillRect(px - 1, ye - 3, 12, 3);
        ctx.fillStyle = palHex('a')!;
        ctx.fillRect(px - 1, ye - 1, 12, 1);
      }
    },

    drawFloor(t) {
      const { ctx } = engine;
      const y0 = 228;
      ctx.fillStyle = palHex('1')!;
      ctx.fillRect(0, y0, W, H - y0);

      const brickA = palHex('5')!;
      const brickB = palHex('6')!;
      const mortar = palHex('0')!;
      for (let y = y0; y < H; y += 6) {
        const row = Math.floor((y - y0) / 6);
        const offset = (row & 1) * 7;
        for (let x = -offset; x < W; x += 14) {
          ctx.fillStyle = row & 1 ? brickA : brickB;
          ctx.fillRect(x, y, 13, 5);
          ctx.fillStyle = mortar;
          ctx.fillRect(x + 13, y, 1, 5);
          ctx.fillRect(x, y + 5, 14, 1);
        }
      }

      drawMagicCircle(engine, t, palHex('H')!);
    },
  };
}
