import { palHex } from '../../../sprites/palette';
import {
  createDrifters,
  drawMagicCircle,
  TORCH_FIRE,
  updateAndDrawDrift,
} from '../primitives';
import type { MenuEngine, ThemeController } from '../types';

interface Column {
  x: number;
  h: number;
  broken: boolean;
}

export function createSunbleachedDunesTheme(engine: MenuEngine): ThemeController {
  const { W, H, ctx } = engine;

  const farDune = makeDune(154, 12, 0.055, 1.3);
  const nearDune = makeDune(188, 16, 0.04, 3.6);

  const columns: Column[] = [
    { x: 24, h: 74, broken: false },
    { x: 58, h: 46, broken: true },
    { x: W - 72, h: 58, broken: true },
    { x: W - 32, h: 80, broken: false },
  ];

  const sand = createDrifters({
    count: 42,
    bounds: { x0: -8, x1: W + 8, y0: 76, y1: 226 },
    vx: [0.18, 0.55],
    vy: [-0.02, 0.08],
    size: [1, 2],
    colors: ['rgba(240,212,136,0.65)', 'rgba(255,197,107,0.6)', 'rgba(212,162,74,0.55)'],
    alpha: [0.35, 0.75],
    sway: 1,
    wrap: 'top',
  });

  return {
    torchPal: TORCH_FIRE,
    torchMounts: [{ x: 16, y: 155 }, { x: W - 16, y: 155 }],
    stars: false,
    shootingStars: false,
    magicCircleKey: 'y',

    drawBackdrop(t) {
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, palHex('v')!);
      grad.addColorStop(0.38, palHex('O')!);
      grad.addColorStop(1, palHex('N')!);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Harsh sun.
      ctx.save();
      ctx.globalAlpha = 0.22;
      ctx.fillStyle = palHex('y')!;
      ctx.beginPath();
      ctx.arc(W - 42, 48, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = palHex('y')!;
      ctx.beginPath();
      ctx.arc(W - 42, 48, 10, 0, Math.PI * 2);
      ctx.fill();

      // Heat shimmer bands near the horizon.
      ctx.save();
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = palHex('9')!;
      for (let y = 112; y < 142; y += 7) {
        const shift = Math.round(Math.sin(t * 2 + y) * 4);
        ctx.fillRect(12 + shift, y, W - 24, 1);
      }
      ctx.restore();

      drawDune(farDune, palHex('N')!);
      drawDune(nearDune, palHex('M')!);
    },

    drawMidground(t) {
      // Sandstone temple remnants.
      for (const col of columns) drawColumn(col, t);

      // Low arch hinting at an old desert court.
      ctx.fillStyle = palHex('7')!;
      for (let a = 0; a <= Math.PI; a += 0.035) {
        const x = Math.round(W / 2 + Math.cos(a) * 28);
        const y = Math.round(177 - Math.sin(a) * 20);
        ctx.fillRect(x, y, 3, 3);
      }
      ctx.fillStyle = palHex('8')!;
      ctx.fillRect(W / 2 - 30, 178, 4, 50);
      ctx.fillRect(W / 2 + 27, 178, 4, 50);

      // Torch plinths.
      for (const px of [10, W - 20]) {
        ctx.fillStyle = palHex('7')!;
        ctx.fillRect(px + 2, 160, 7, 68);
        ctx.fillStyle = palHex('8')!;
        ctx.fillRect(px + 2, 160, 7, 1);
        ctx.fillStyle = palHex('5')!;
        ctx.fillRect(px + 8, 162, 1, 66);
      }
    },

    drawFloor(t) {
      const y0 = 228;
      ctx.fillStyle = palHex('7')!;
      ctx.fillRect(0, y0, W, H - y0);

      // Rippled sand over buried tile.
      ctx.fillStyle = palHex('8')!;
      for (let x = 0; x < W; x++) {
        const h = 1 + Math.round((Math.sin(x * 0.17 + t * 0.6) + 1) * 1.2);
        ctx.fillRect(x, y0, 1, h);
      }
      ctx.fillStyle = palHex('6')!;
      for (let y = y0 + 7; y < H; y += 10) ctx.fillRect(0, y, W, 1);
      for (let x = -8; x < W; x += 24) ctx.fillRect(x, y0 + 16, 16, 1);

      // Scattered pebbles.
      ctx.fillStyle = palHex('5')!;
      for (let x = 6; x < W; x += 17) ctx.fillRect(x, y0 + 8 + ((x * 3) % 30), 2, 1);

      drawMagicCircle(engine, t, palHex('y')!);
    },

    drawOverlay(t, dt) {
      updateAndDrawDrift(engine, sand, t, dt, { x0: -8, x1: W + 8, y0: 76, y1: 226 });
    },
  };

  function makeDune(top: number, amp: number, freq: number, phase: number): number[] {
    const pts: number[] = [];
    for (let x = 0; x < W; x++) {
      const y =
        top +
        Math.sin(x * freq + phase) * amp +
        Math.sin(x * freq * 2.1 + phase * 0.7) * amp * 0.35;
      pts.push(Math.round(y));
    }
    return pts;
  }

  function drawDune(points: number[], color: string) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x < W; x++) ctx.lineTo(x, points[x]!);
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fill();
  }

  function drawColumn(col: Column, t: number) {
    const y = 226 - col.h;
    ctx.fillStyle = palHex('7')!;
    ctx.fillRect(col.x, y, 10, col.h);
    ctx.fillStyle = palHex('8')!;
    ctx.fillRect(col.x, y, 2, col.h);
    ctx.fillStyle = palHex('5')!;
    ctx.fillRect(col.x + 8, y + 1, 2, col.h - 1);
    for (let yy = y + 8; yy < 226; yy += 13) {
      ctx.fillStyle = palHex('6')!;
      ctx.fillRect(col.x, yy, 10, 1);
    }
    ctx.fillStyle = palHex('8')!;
    ctx.fillRect(col.x - 2, y - 3, 14, 3);
    if (col.broken) {
      const shift = Math.round(Math.sin(t * 0.7 + col.x) * 1);
      ctx.fillStyle = palHex('7')!;
      ctx.fillRect(col.x + 6 + shift, y - 8, 5, 2);
      ctx.fillRect(col.x - 2 + shift, y - 6, 4, 2);
    }
  }
}
