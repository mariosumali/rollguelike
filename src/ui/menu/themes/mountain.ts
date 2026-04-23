import { palHex } from '../../../sprites/palette';
import {
  createDrifters,
  drawMagicCircle,
  drawMoon,
  skyGradient,
  TORCH_FIRE,
  updateAndDrawDrift,
} from '../primitives';
import type { MenuEngine, ThemeController } from '../types';

export function createMountainTheme(engine: MenuEngine): ThemeController {
  const { W, H, ctx } = engine;

  const ridge = (top: number, amp: number, freq: number, phase: number, jitter: number) => {
    const pts: number[] = [];
    for (let x = 0; x < W; x++) {
      const n =
        Math.sin(x * freq + phase) * 0.6 +
        Math.sin(x * freq * 2.3 + phase * 1.7) * 0.3 +
        Math.sin(x * freq * 0.4 + phase * 0.3) * 0.1;
      pts.push(Math.round(top - n * amp + (Math.random() - 0.5) * jitter));
    }
    return pts;
  };

  const far = ridge(108, 18, 0.07, 1.1, 0.5);
  const mid = ridge(130, 24, 0.055, 2.7, 0.8);
  const near = ridge(160, 14, 0.05, 4.3, 0.6);

  // Snowflakes drifting down from the top.
  const snow = createDrifters({
    count: 45,
    bounds: { x0: -4, x1: W + 4, y0: -6, y1: H + 4 },
    vx: [-0.08, 0.08],
    vy: [0.15, 0.5],
    size: [1, 2],
    colors: ['rgba(230, 240, 255, 0.85)', 'rgba(200, 220, 255, 0.7)', 'rgba(255,255,255,0.95)'],
    alpha: [0.55, 0.95],
    sway: 0.5,
    wrap: 'top',
  });

  // Aurora band (soft animated green-teal glow over the mountains).
  return {
    torchPal: TORCH_FIRE,
    stars: true,
    shootingStars: true,
    magicCircleKey: 'q',

    drawBackdrop(t) {
      skyGradient(engine, 'o', '2', '0');
      drawMoon(engine, W - 36, 34, 7);

      // Aurora ribbons.
      ctx.save();
      for (let i = 0; i < 3; i++) {
        const y = 48 + i * 6;
        const amp = 4 + i;
        const alpha = 0.06 + (2 - i) * 0.03;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = palHex(i & 1 ? 'm' : 'C')!;
        for (let x = 0; x < W; x++) {
          const o = Math.round(Math.sin(x * 0.08 + t * 0.4 + i) * amp);
          ctx.fillRect(x, y + o, 1, 3);
        }
      }
      ctx.restore();

      // Far ridge.
      ctx.fillStyle = palHex('4')!;
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let x = 0; x < W; x++) ctx.lineTo(x, far[x]!);
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();

      // Mid ridge.
      ctx.fillStyle = palHex('3')!;
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let x = 0; x < W; x++) ctx.lineTo(x, mid[x]!);
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();

      // Snow caps.
      ctx.fillStyle = palHex('d')!;
      for (let x = 1; x < W - 1; x++) {
        const y = mid[x]!;
        if (y < mid[x - 1]! && y < mid[x + 1]! && y < 118) {
          ctx.fillRect(x - 1, y, 3, 1);
          ctx.fillRect(x, y + 1, 1, 1);
        }
      }

      // Near ridge.
      ctx.fillStyle = palHex('2')!;
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let x = 0; x < W; x++) ctx.lineTo(x, near[x]!);
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();
    },

    drawMidground() {
      // Pine silhouettes at the base of the near ridge.
      const pines = [22, 46, 70, 110, 134, 158];
      for (const px of pines) {
        const h = 14 + ((px * 13) % 6);
        const baseY = 200;
        ctx.fillStyle = palHex('T')!;
        for (let i = 0; i < h; i++) {
          const prog = i / h;
          const w = Math.max(1, Math.round((1 - prog) * 5));
          ctx.fillRect(px - Math.floor(w / 2), baseY - h + i, w, 1);
        }
        ctx.fillStyle = palHex('5')!;
        ctx.fillRect(px, baseY, 1, 3);
      }

      // Wooden stakes holding the torches.
      for (const px of [14, W - 14 - 10]) {
        ctx.fillStyle = palHex('6')!;
        ctx.fillRect(px + 3, 160, 4, 70);
        ctx.fillStyle = palHex('5')!;
        ctx.fillRect(px + 3, 160, 1, 70);
      }
    },

    drawFloor(t) {
      const y0 = 228;
      // Snow blanket.
      ctx.fillStyle = palHex('d')!;
      ctx.fillRect(0, y0, W, H - y0);
      ctx.fillStyle = palHex('c')!;
      for (let x = 0; x < W; x++) {
        const h = 1 + Math.round((Math.sin(x * 0.3) + 1) * 0.5);
        ctx.fillRect(x, y0, 1, h);
      }
      // Footprints.
      ctx.fillStyle = palHex('b')!;
      for (let i = 0; i < 6; i++) {
        const fx = 18 + i * 24;
        const fy = y0 + 6 + (i & 1) * 3;
        ctx.fillRect(fx, fy, 2, 2);
        ctx.fillRect(fx + 10, fy + 4, 2, 2);
      }

      drawMagicCircle(engine, t, palHex('q')!);
    },

    drawOverlay(t, dt) {
      updateAndDrawDrift(engine, snow, t, dt, { x0: -4, x1: W + 4, y0: -6, y1: 232 });
    },
  };
}
