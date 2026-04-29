import { palHex } from '../../../sprites/palette';
import {
  createDrifters,
  drawMagicCircle,
  TORCH_GHOST,
  updateAndDrawDrift,
} from '../primitives';
import type { MenuEngine, ThemeController } from '../types';

interface Spire {
  x: number;
  h: number;
  w: number;
}

interface LightningBolt {
  x: number;
  seed: number;
  life: number;
  maxLife: number;
}

export function createStormBalconyTheme(engine: MenuEngine): ThemeController {
  const { W, H, ctx } = engine;

  const rain = createDrifters({
    count: 70,
    bounds: { x0: -12, x1: W + 12, y0: -8, y1: H + 8 },
    vx: [-0.45, -0.22],
    vy: [1.2, 2.1],
    size: [1, 1],
    colors: ['rgba(184,224,255,0.65)', 'rgba(98,184,255,0.55)', 'rgba(214,221,232,0.55)'],
    alpha: [0.35, 0.75],
    sway: 0.1,
    wrap: 'top',
  });

  const spires: Spire[] = [];
  for (let i = 0; i < 9; i++) {
    spires.push({
      x: 6 + i * 21 + Math.floor(Math.random() * 6),
      h: 42 + Math.floor(Math.random() * 58),
      w: 7 + Math.floor(Math.random() * 6),
    });
  }

  const bolts: LightningBolt[] = [];
  let nextBolt = 1.2 + Math.random() * 2.8;

  return {
    torchPal: TORCH_GHOST,
    torchMounts: [{ x: 16, y: 155 }, { x: W - 16, y: 155 }],
    stars: false,
    shootingStars: false,
    magicCircleKey: 'r',

    drawBackdrop(t, dt) {
      nextBolt -= dt;
      if (nextBolt <= 0 && bolts.length < 1) {
        nextBolt = 2.2 + Math.random() * 4.5;
        bolts.push({
          x: 28 + Math.random() * (W - 56),
          seed: Math.random() * 99,
          life: 0,
          maxLife: 0.18 + Math.random() * 0.1,
        });
      }

      const flash = bolts.reduce((a, b) => Math.max(a, 1 - b.life / b.maxLife), 0);
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, flash > 0 ? palHex('4')! : palHex('1')!);
      grad.addColorStop(0.45, palHex('3')!);
      grad.addColorStop(1, palHex('0')!);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Heavy cloud shelf.
      ctx.fillStyle = palHex('2')!;
      for (let x = -20; x < W + 20; x += 22) {
        const y = 54 + Math.round(Math.sin(t * 0.5 + x) * 3);
        ctx.beginPath();
        ctx.arc(x, y, 18, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = palHex('0')!;
      ctx.fillRect(0, 58, W, 38);

      for (let i = bolts.length - 1; i >= 0; i--) {
        const b = bolts[i]!;
        b.life += dt;
        if (b.life >= b.maxLife) {
          bolts.splice(i, 1);
          continue;
        }
        drawLightning(b);
      }
    },

    drawMidground(t) {
      // Distant storm spires.
      for (const s of spires) {
        const baseY = 222;
        ctx.fillStyle = palHex('1')!;
        for (let y = 0; y < s.h; y++) {
          const p = y / s.h;
          const w = Math.max(1, Math.round(s.w * (1 - p * 0.65)));
          ctx.fillRect(s.x - Math.floor(w / 2), baseY - y, w, 1);
        }
        ctx.fillStyle = palHex('4')!;
        ctx.fillRect(s.x - 1, baseY - s.h + 4, 1, s.h - 8);
      }

      // Balcony rail.
      ctx.fillStyle = palHex('a')!;
      ctx.fillRect(0, 194, W, 4);
      ctx.fillStyle = palHex('b')!;
      ctx.fillRect(0, 194, W, 1);
      for (let x = 8; x < W; x += 16) {
        ctx.fillStyle = palHex('a')!;
        ctx.fillRect(x, 198, 4, 30);
        ctx.fillStyle = palHex('3')!;
        ctx.fillRect(x + 3, 199, 1, 29);
      }

      // Electric torch pylons.
      for (const px of [10, W - 20]) {
        ctx.fillStyle = palHex('a')!;
        ctx.fillRect(px + 3, 160, 5, 68);
        ctx.fillStyle = palHex('b')!;
        ctx.fillRect(px + 3, 160, 1, 68);
        const spark = 0.5 + 0.5 * Math.sin(t * 8 + px);
        if (spark > 0.65) {
          ctx.fillStyle = palHex('r')!;
          ctx.fillRect(px + 5, 175, 2, 1);
          ctx.fillRect(px + 4, 176, 1, 1);
        }
      }
    },

    drawFloor(t) {
      const y0 = 228;
      ctx.fillStyle = palHex('3')!;
      ctx.fillRect(0, y0, W, H - y0);
      ctx.fillStyle = palHex('a')!;
      for (let y = y0; y < H; y += 8) ctx.fillRect(0, y, W, 1);
      for (let x = 0; x < W; x += 18) ctx.fillRect(x, y0, 1, H - y0);

      // Wet reflective streaks.
      ctx.save();
      ctx.globalAlpha = 0.22 + 0.08 * Math.sin(t * 1.8);
      ctx.fillStyle = palHex('r')!;
      for (let x = 4; x < W; x += 22) {
        ctx.fillRect(x, y0 + 5 + ((x * 3) % 18), 10, 1);
      }
      ctx.restore();

      drawMagicCircle(engine, t, palHex('r')!);
    },

    drawOverlay(t, dt) {
      updateAndDrawDrift(engine, rain, t, dt, { x0: -12, x1: W + 12, y0: -8, y1: H + 8 });
    },
  };

  function drawLightning(b: LightningBolt) {
    const fade = 1 - b.life / b.maxLife;
    ctx.save();
    ctx.globalAlpha = 0.45 + fade * 0.45;
    ctx.strokeStyle = palHex('S')!;
    ctx.lineWidth = 1;
    ctx.beginPath();
    let x = b.x;
    let y = 0;
    ctx.moveTo(x, y);
    for (let i = 0; i < 7; i++) {
      y += 10 + ((i * 13 + Math.floor(b.seed)) % 9);
      x += ((i * 17 + Math.floor(b.seed)) % 13) - 6;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.strokeStyle = palHex('q')!;
    ctx.globalAlpha = 0.35 + fade * 0.35;
    ctx.stroke();
    ctx.restore();
  }
}
