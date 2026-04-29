import { palHex } from '../../../sprites/palette';
import { drawMagicCircle, TORCH_FIRE } from '../primitives';
import type { MenuEngine, ThemeController } from '../types';

interface Cloud {
  x: number;
  y: number;
  w: number;
  speed: number;
  alpha: number;
}

interface Island {
  x: number;
  y: number;
  w: number;
  h: number;
  phase: number;
  hasTree: boolean;
}

interface Wyvern {
  x: number;
  y: number;
  vx: number;
  phase: number;
  size: number;
}

export function createSkyTempleTheme(engine: MenuEngine): ThemeController {
  const { W, H, ctx } = engine;

  const cloudLayers: Cloud[][] = [[], [], []];
  const layerConfigs: { y: number; speed: number; alpha: number; w: [number, number] }[] = [
    { y: 70, speed: 6, alpha: 0.45, w: [60, 100] },
    { y: 110, speed: 10, alpha: 0.6, w: [40, 80] },
    { y: 160, speed: 15, alpha: 0.8, w: [30, 70] },
  ];
  layerConfigs.forEach((cfg, i) => {
    for (let j = 0; j < 5; j++) {
      cloudLayers[i]!.push({
        x: Math.random() * W,
        y: cfg.y + (Math.random() - 0.5) * 12,
        w: cfg.w[0] + Math.random() * (cfg.w[1] - cfg.w[0]),
        speed: cfg.speed,
        alpha: cfg.alpha,
      });
    }
  });

  const islands: Island[] = [
    { x: 40, y: 90, w: 24, h: 8, phase: 0, hasTree: false },
    { x: W - 50, y: 105, w: 30, h: 10, phase: 1.2, hasTree: true },
    { x: W / 2 + 10, y: 65, w: 18, h: 6, phase: 2.5, hasTree: false },
  ];

  const wyverns: Wyvern[] = [];
  for (let i = 0; i < 2; i++) {
    wyverns.push({
      x: Math.random() * W,
      y: 35 + Math.random() * 40,
      vx: 0.25 + Math.random() * 0.15,
      phase: Math.random() * Math.PI * 2,
      size: 3 + Math.floor(Math.random() * 2),
    });
  }

  return {
    torchPal: TORCH_FIRE,
    torchMounts: [{ x: 33, y: 155 }, { x: W - 35, y: 155 }],
    stars: true,
    shootingStars: false,
    magicCircleKey: 'O',

    drawBackdrop(t) {
      // Dawn gradient — warm top, cool bottom.
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, palHex('O')!);
      grad.addColorStop(0.25, palHex('u')!);
      grad.addColorStop(0.55, palHex('G')!);
      grad.addColorStop(1, palHex('F')!);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Sun disc low on the horizon.
      const sx = W / 2;
      const sy = 130;
      ctx.save();
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = palHex('y')!;
      ctx.beginPath();
      ctx.arc(sx, sy, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = palHex('v')!;
      ctx.beginPath();
      ctx.arc(sx, sy, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = palHex('y')!;
      ctx.beginPath();
      ctx.arc(sx, sy, 5, 0, Math.PI * 2);
      ctx.fill();

      // Slow far cloud layer.
      drawCloudLayer(cloudLayers[0]!, t, 0);

      // Floating islands in mid distance.
      for (const isle of islands) {
        const bob = Math.round(Math.sin(t * 0.6 + isle.phase) * 1.2);
        drawIsland(isle, bob);
      }

      // Mid cloud layer drifts the other way to hint parallax.
      drawCloudLayer(cloudLayers[1]!, t, 1);
    },

    drawMidground(t) {
      // Broken marble columns in the foreground plane.
      const cols = [28, W - 40];
      for (const cx of cols) {
        // Base.
        ctx.fillStyle = palHex('d')!;
        ctx.fillRect(cx - 2, 226, 14, 4);
        ctx.fillStyle = palHex('c')!;
        ctx.fillRect(cx - 2, 226, 14, 1);
        // Shaft.
        ctx.fillStyle = palHex('e')!;
        ctx.fillRect(cx, 160, 10, 66);
        ctx.fillStyle = palHex('c')!;
        ctx.fillRect(cx, 160, 2, 66);
        // Fluting.
        ctx.fillStyle = palHex('b')!;
        ctx.fillRect(cx + 4, 160, 1, 66);
        ctx.fillRect(cx + 7, 160, 1, 66);
        // Capital.
        ctx.fillStyle = palHex('d')!;
        ctx.fillRect(cx - 2, 155, 14, 5);
        ctx.fillStyle = palHex('c')!;
        ctx.fillRect(cx - 2, 155, 14, 1);
      }

      // A single broken column in the middle, shorter.
      const midCx = W / 2 - 5;
      ctx.fillStyle = palHex('e')!;
      ctx.fillRect(midCx, 200, 10, 26);
      ctx.fillStyle = palHex('c')!;
      ctx.fillRect(midCx, 200, 2, 26);
      ctx.fillStyle = palHex('d')!;
      ctx.fillRect(midCx - 1, 198, 12, 3);
      // Broken top rubble.
      ctx.fillStyle = palHex('e')!;
      ctx.fillRect(midCx - 3, 196, 3, 2);
      ctx.fillRect(midCx + 9, 195, 4, 2);

      // Near cloud layer partly occluding the columns.
      drawCloudLayer(cloudLayers[2]!, t, 2);
    },

    drawFloor(t, dt) {
      const y0 = 228;
      // Marble tile floor.
      ctx.fillStyle = palHex('d')!;
      ctx.fillRect(0, y0, W, H - y0);
      // Tile grout lines.
      const tileW = 20;
      const tileH = 8;
      for (let y = y0; y < H; y += tileH) {
        const row = Math.floor((y - y0) / tileH);
        const offset = (row & 1) * (tileW / 2);
        ctx.fillStyle = palHex('c')!;
        for (let x = -offset; x < W; x += tileW) {
          ctx.fillRect(x + tileW - 1, y, 1, tileH);
        }
        ctx.fillRect(0, y + tileH - 1, W, 1);
      }
      // Golden inlay stripe.
      ctx.fillStyle = palHex('8')!;
      ctx.fillRect(0, y0 + 2, W, 1);
      ctx.fillStyle = palHex('9')!;
      ctx.fillRect(0, y0 + 2, W, 1);
      ctx.globalAlpha = 1;

      // Wispy clouds rising from edges (as if floating at high altitude).
      ctx.save();
      for (let i = 0; i < 6; i++) {
        const offset = Math.round(Math.sin(t * 0.8 + i) * 2);
        const a = 0.12 - i * 0.01;
        if (a <= 0) continue;
        ctx.globalAlpha = a;
        ctx.fillStyle = palHex('e')!;
        ctx.fillRect(-2 + offset, y0 + 4 + i * 3, 22 - i * 2, 2);
        ctx.fillRect(W - 22 - offset + i, y0 + 4 + i * 3, 22 - i * 2, 2);
      }
      ctx.restore();

      // Fluffy upward-drifting cloud puffs (decorative flourish).
      const puff = 0.5 + 0.5 * Math.sin(t * 0.9);
      ctx.save();
      ctx.globalAlpha = 0.2 + puff * 0.08;
      ctx.fillStyle = palHex('e')!;
      ctx.beginPath();
      ctx.arc(W / 2, 242, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      drawMagicCircle(engine, t, palHex('O')!);

      // Consume dt to avoid "unused" warnings in strict lint configs.
      void dt;
    },

    drawOverlay(t, dt) {
      // Wyverns / large birds flying in lazy V patterns.
      const step = Math.min(2.5, dt * 60);
      for (const wy of wyverns) {
        wy.x += wy.vx * step;
        if (wy.x > W + 10) {
          wy.x = -10;
          wy.y = 30 + Math.random() * 50;
        }
        const flap = Math.sin(t * 4 + wy.phase);
        ctx.fillStyle = palHex('1')!;
        const cx = Math.round(wy.x);
        const cy = Math.round(wy.y);
        // Body.
        ctx.fillRect(cx - 1, cy, 3, 1);
        // Wings.
        if (flap > 0) {
          ctx.fillRect(cx - 4, cy - 1, 3, 1);
          ctx.fillRect(cx + 2, cy - 1, 3, 1);
          ctx.fillRect(cx - 5, cy - 2, 1, 1);
          ctx.fillRect(cx + 5, cy - 2, 1, 1);
        } else {
          ctx.fillRect(cx - 3, cy + 1, 2, 1);
          ctx.fillRect(cx + 2, cy + 1, 2, 1);
        }
      }
    },
  };

  function drawCloudLayer(clouds: Cloud[], t: number, layerIdx: number) {
    const dir = layerIdx % 2 === 0 ? 1 : -1;
    ctx.save();
    for (const c of clouds) {
      c.x += (c.speed * 0.04) * dir;
      if (c.x > W + c.w) c.x = -c.w;
      if (c.x < -c.w) c.x = W + c.w;
      ctx.globalAlpha = c.alpha;
      ctx.fillStyle = palHex('e')!;
      const cx = Math.round(c.x);
      ctx.fillRect(cx, Math.round(c.y), c.w, 3);
      ctx.fillRect(cx + 4, Math.round(c.y) - 2, c.w - 8, 2);
      ctx.fillRect(cx + 8, Math.round(c.y) - 4, c.w - 16, 2);
      ctx.fillRect(cx + 2, Math.round(c.y) + 3, c.w - 4, 1);
      ctx.globalAlpha = c.alpha * 0.7;
      ctx.fillStyle = palHex('d')!;
      ctx.fillRect(cx + 2, Math.round(c.y) + 2, c.w - 4, 1);
      void t;
    }
    ctx.restore();
  }

  function drawIsland(isle: Island, bob: number) {
    const { x, y, w, h, hasTree } = isle;
    const iy = y + bob;
    // Grass top.
    ctx.fillStyle = palHex('l')!;
    ctx.fillRect(x, iy, w, 2);
    ctx.fillStyle = palHex('m')!;
    ctx.fillRect(x + 2, iy, w - 4, 1);
    // Dirt + rocky underside tapering down to a point.
    ctx.fillStyle = palHex('5')!;
    for (let i = 0; i < h; i++) {
      const prog = i / h;
      const iw = Math.max(2, Math.round(w * (1 - prog * 1.1)));
      ctx.fillRect(x + Math.floor((w - iw) / 2), iy + 2 + i, iw, 1);
    }
    ctx.fillStyle = palHex('6')!;
    ctx.fillRect(x + 2, iy + 2, w - 4, 1);

    // Little waterfall off the edge.
    ctx.fillStyle = palHex('D')!;
    ctx.fillRect(x + Math.floor(w / 2) - 1, iy + 2, 2, h + 8);

    if (hasTree) {
      const tx = x + Math.floor(w / 2) + 4;
      ctx.fillStyle = palHex('5')!;
      ctx.fillRect(tx, iy - 6, 1, 6);
      ctx.fillStyle = palHex('T')!;
      ctx.fillRect(tx - 2, iy - 10, 5, 4);
      ctx.fillStyle = palHex('l')!;
      ctx.fillRect(tx - 1, iy - 11, 3, 2);
    }
  }
}
