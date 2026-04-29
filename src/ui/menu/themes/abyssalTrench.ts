import { palHex } from '../../../sprites/palette';
import {
  createDrifters,
  drawMagicCircle,
  TORCH_CRYSTAL,
  updateAndDrawDrift,
} from '../primitives';
import type { MenuEngine, ThemeController } from '../types';

interface Seaweed {
  x: number;
  baseY: number;
  h: number;
  phase: number;
  color: string;
}

interface Coral {
  x: number;
  y: number;
  h: number;
  color: string;
}

export function createAbyssalTrenchTheme(engine: MenuEngine): ThemeController {
  const { W, H, ctx } = engine;

  const bubbles = createDrifters({
    count: 34,
    bounds: { x0: -4, x1: W + 4, y0: 34, y1: H + 8 },
    vx: [-0.08, 0.08],
    vy: [-0.45, -0.16],
    size: [1, 2],
    colors: ['rgba(102,234,255,0.75)', 'rgba(184,224,255,0.7)', 'rgba(255,255,255,0.55)'],
    alpha: [0.4, 0.85],
    sway: 0.7,
    wrap: 'bottom',
  });

  const seaweed: Seaweed[] = [];
  for (let i = 0; i < 11; i++) {
    seaweed.push({
      x: 8 + i * 17 + Math.floor(Math.random() * 7),
      baseY: 228 + Math.floor(Math.random() * 8),
      h: 18 + Math.floor(Math.random() * 22),
      phase: Math.random() * Math.PI * 2,
      color: ['T', 'U', 'B'][Math.floor(Math.random() * 3)]!,
    });
  }

  const coral: Coral[] = [];
  for (let i = 0; i < 8; i++) {
    coral.push({
      x: 12 + i * 22 + Math.floor(Math.random() * 9),
      y: 224 + Math.floor(Math.random() * 10),
      h: 8 + Math.floor(Math.random() * 13),
      color: ['G', 'H', 'h', 'D'][Math.floor(Math.random() * 4)]!,
    });
  }

  return {
    torchPal: TORCH_CRYSTAL,
    torchMounts: [{ x: 16, y: 156 }, { x: W - 16, y: 156 }],
    stars: false,
    shootingStars: false,
    magicCircleKey: 'D',

    drawBackdrop(t) {
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, palHex('B')!);
      grad.addColorStop(0.42, palHex('A')!);
      grad.addColorStop(1, palHex('0')!);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Faint surface caustics far overhead.
      ctx.save();
      ctx.globalAlpha = 0.16;
      ctx.strokeStyle = palHex('D')!;
      ctx.lineWidth = 1;
      for (let i = 0; i < 6; i++) {
        const y = 36 + i * 13;
        ctx.beginPath();
        for (let x = 0; x <= W; x += 4) {
          const yy = y + Math.sin(x * 0.08 + t * 0.8 + i) * 2;
          if (x === 0) ctx.moveTo(x, yy);
          else ctx.lineTo(x, yy);
        }
        ctx.stroke();
      }
      ctx.restore();

      // Distant angler glow watching from the trench.
      const pulse = 0.45 + 0.35 * Math.sin(t * 1.6);
      ctx.save();
      ctx.globalAlpha = 0.16 + pulse * 0.12;
      ctx.fillStyle = palHex('D')!;
      ctx.beginPath();
      ctx.arc(W - 42, 112, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = palHex('D')!;
      ctx.fillRect(W - 43, 111, 3, 2);
      ctx.fillStyle = palHex('S')!;
      ctx.fillRect(W - 42, 111, 1, 1);
    },

    drawMidground(t) {
      // Broken ruin pillars.
      for (const px of [28, 56, W - 64, W - 34]) {
        const top = 120 + ((px * 7) % 32);
        ctx.fillStyle = palHex('a')!;
        ctx.fillRect(px, top, 10, 106);
        ctx.fillStyle = palHex('b')!;
        ctx.fillRect(px, top, 2, 106);
        ctx.fillStyle = palHex('0')!;
        ctx.fillRect(px + 8, top + 1, 2, 104);
        ctx.fillStyle = palHex('c')!;
        ctx.fillRect(px - 2, top - 3, 14, 3);
        if (px & 1) ctx.fillRect(px + 5, top - 7, 6, 2);
      }

      // Coral fans and swaying seaweed.
      for (const c of coral) drawCoral(c);
      for (const s of seaweed) drawSeaweed(s, t);

      // Barnacled torch posts.
      for (const px of [10, W - 20]) {
        ctx.fillStyle = palHex('a')!;
        ctx.fillRect(px + 3, 160, 5, 68);
        ctx.fillStyle = palHex('B')!;
        ctx.fillRect(px + 2, 176, 2, 2);
        ctx.fillRect(px + 7, 198, 2, 2);
        ctx.fillStyle = palHex('d')!;
        ctx.fillRect(px + 3, 164, 1, 1);
        ctx.fillRect(px + 6, 214, 1, 1);
      }
    },

    drawFloor(t) {
      const y0 = 228;
      ctx.fillStyle = palHex('A')!;
      ctx.fillRect(0, y0, W, H - y0);
      ctx.fillStyle = palHex('0')!;
      for (let x = 0; x < W; x++) {
        const h = 2 + Math.round((Math.sin(x * 0.18 + t * 0.5) + 1) * 1.5);
        ctx.fillRect(x, y0, 1, h);
      }

      // Sand and shell flecks.
      ctx.fillStyle = palHex('B')!;
      for (let x = 3; x < W; x += 9) {
        ctx.fillRect(x, y0 + 8 + ((x * 5) % 28), x % 2 === 0 ? 2 : 1, 1);
      }
      ctx.fillStyle = palHex('d')!;
      for (let x = 10; x < W; x += 31) ctx.fillRect(x, y0 + 18 + (x % 5), 2, 1);

      drawMagicCircle(engine, t, palHex('D')!);
    },

    drawOverlay(t, dt) {
      updateAndDrawDrift(engine, bubbles, t, dt, { x0: -4, x1: W + 4, y0: 28, y1: H + 8 });

      // Soft vertical light shafts through the water column.
      ctx.save();
      ctx.globalAlpha = 0.06 + 0.03 * Math.sin(t * 0.7);
      ctx.fillStyle = palHex('D')!;
      for (const x of [30, 88, 136]) {
        const sway = Math.round(Math.sin(t * 0.5 + x) * 3);
        ctx.fillRect(x + sway, 0, 8, 225);
      }
      ctx.restore();
    },
  };

  function drawSeaweed(s: Seaweed, t: number) {
    ctx.fillStyle = palHex(s.color)!;
    for (let i = 0; i < s.h; i++) {
      const p = i / s.h;
      const sway = Math.round(Math.sin(t * 1.2 + s.phase + p * 3) * (1 + p * 3));
      ctx.fillRect(s.x + sway, s.baseY - i, 2, 1);
    }
  }

  function drawCoral(c: Coral) {
    ctx.fillStyle = palHex(c.color)!;
    ctx.fillRect(c.x, c.y - c.h, 2, c.h);
    ctx.fillRect(c.x - 3, c.y - Math.floor(c.h * 0.65), 5, 1);
    ctx.fillRect(c.x + 1, c.y - Math.floor(c.h * 0.4), 4, 1);
    ctx.fillRect(c.x - 2, c.y - Math.floor(c.h * 0.25), 2, 1);
  }
}
