import { palHex } from '../../../sprites/palette';
import { drawMagicCircle, drawMoon, skyGradient, TORCH_GHOST } from '../primitives';
import type { MenuEngine, ThemeController } from '../types';

interface Tombstone {
  x: number;
  shape: 0 | 1 | 2;
  tilt: number;
}

interface WillOWisp {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  speed: number;
  phase: number;
  hue: string;
}

interface FogBank {
  x: number;
  y: number;
  w: number;
  speed: number;
  alpha: number;
}

export function createGraveyardTheme(engine: MenuEngine): ThemeController {
  const { W, H, ctx } = engine;

  const tombstones: Tombstone[] = [];
  for (let i = 0; i < 7; i++) {
    tombstones.push({
      x: 20 + i * 22 + Math.floor(Math.random() * 8),
      shape: Math.floor(Math.random() * 3) as 0 | 1 | 2,
      tilt: Math.random() < 0.3 ? (Math.random() < 0.5 ? -1 : 1) : 0,
    });
  }

  const wisps: WillOWisp[] = [
    { cx: 60, cy: 200, rx: 14, ry: 5, speed: 0.6, phase: 0, hue: 'q' },
    { cx: W - 60, cy: 205, rx: 18, ry: 6, speed: 0.5, phase: 1.7, hue: 'r' },
    { cx: W / 2, cy: 195, rx: 30, ry: 4, speed: 0.35, phase: 3.4, hue: 'q' },
  ];

  const fogs: FogBank[] = [];
  for (let i = 0; i < 5; i++) {
    fogs.push({
      x: Math.random() * W,
      y: 180 + Math.random() * 40,
      w: 60 + Math.random() * 40,
      speed: 3 + Math.random() * 4,
      alpha: 0.1 + Math.random() * 0.1,
    });
  }

  const treeBranches = [
    { from: [30, 150], to: [40, 120], w: 2 },
    { from: [30, 150], to: [20, 130], w: 2 },
    { from: [40, 120], to: [50, 110], w: 1 },
    { from: [40, 120], to: [35, 100], w: 1 },
    { from: [20, 130], to: [10, 110], w: 1 },
  ];

  return {
    torchPal: TORCH_GHOST,
    stars: true,
    shootingStars: true,
    magicCircleKey: 'q',

    drawBackdrop() {
      skyGradient(engine, 'F', '2', '0');
      drawMoon(engine, W - 38, 30, 6);
    },

    drawMidground(t) {
      // Distant dead tree with gently swaying branches.
      ctx.fillStyle = palHex('5')!;
      ctx.fillRect(28, 150, 4, 80);
      for (const b of treeBranches) {
        const [fx, fy] = b.from;
        const [tx, ty] = b.to;
        const sway = Math.round(Math.sin(t * 0.8 + fy! * 0.01) * 0.7);
        line(fx!, fy!, tx! + sway, ty!, b.w);
      }

      // Low mist under the tombstones.
      ctx.save();
      for (const f of fogs) {
        f.x -= f.speed * 0.04;
        if (f.x + f.w < 0) f.x = W;
        ctx.globalAlpha = f.alpha;
        ctx.fillStyle = palHex('c')!;
        ctx.fillRect(Math.round(f.x), Math.round(f.y), f.w, 2);
        ctx.fillRect(Math.round(f.x) + 4, Math.round(f.y) - 1, Math.max(0, f.w - 8), 1);
      }
      ctx.restore();

      // Tombstones.
      for (const tomb of tombstones) {
        drawTombstone(tomb);
      }

      // Iron gate posts as torch holders.
      for (const px of [10, W - 20]) {
        ctx.fillStyle = palHex('a')!;
        ctx.fillRect(px + 3, 160, 4, 70);
        ctx.fillStyle = palHex('b')!;
        ctx.fillRect(px + 3, 160, 1, 70);
        ctx.fillStyle = palHex('5')!;
        ctx.fillRect(px + 1, 162, 8, 2);
        ctx.fillRect(px + 1, 188, 8, 2);
      }
    },

    drawFloor(t) {
      const y0 = 228;
      // Damp dark dirt.
      ctx.fillStyle = palHex('3')!;
      ctx.fillRect(0, y0, W, H - y0);
      ctx.fillStyle = palHex('2')!;
      for (let x = 0; x < W; x++) {
        const h = 1 + Math.round((Math.sin(x * 0.31) + 1) * 0.5);
        ctx.fillRect(x, y0, 1, h);
      }
      // Clumps of damp grass.
      ctx.fillStyle = palHex('l')!;
      for (let x = 4; x < W; x += 16) {
        const h = 2 + ((x * 7) % 3);
        ctx.fillRect(x, y0 - 1, 1, 2);
        ctx.fillRect(x + 2, y0 - 1, 1, h);
        ctx.fillRect(x + 4, y0 - 1, 1, 2);
      }

      drawMagicCircle(engine, t, palHex('q')!);
    },

    drawOverlay(t) {
      // Floating will-o-wisps that trace slow ellipses.
      for (const w of wisps) {
        const angle = t * w.speed + w.phase;
        const x = Math.round(w.cx + Math.cos(angle) * w.rx);
        const y = Math.round(w.cy + Math.sin(angle * 2) * w.ry);
        const pulse = 0.55 + 0.45 * Math.sin(t * 3 + w.phase);
        ctx.save();
        ctx.globalAlpha = 0.25 + pulse * 0.15;
        ctx.fillStyle = palHex(w.hue)!;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        ctx.fillStyle = palHex(w.hue)!;
        ctx.fillRect(x - 1, y, 2, 1);
        ctx.fillRect(x, y - 1, 1, 2);
        ctx.fillStyle = palHex('e')!;
        ctx.fillRect(x, y, 1, 1);
      }
    },
  };

  function line(fx: number, fy: number, tx: number, ty: number, w: number) {
    ctx.strokeStyle = palHex('5')!;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.lineTo(tx, ty);
    ctx.stroke();
  }

  function drawTombstone(tomb: Tombstone) {
    const { x, shape, tilt } = tomb;
    const y = 200;
    ctx.save();
    if (tilt) {
      ctx.translate(x + 5, y + 18);
      ctx.rotate(tilt * 0.06);
      ctx.translate(-(x + 5), -(y + 18));
    }
    ctx.fillStyle = palHex('3')!;
    ctx.fillRect(x, y, 10, 18);
    ctx.fillStyle = palHex('4')!;
    ctx.fillRect(x, y, 1, 18);
    ctx.fillStyle = palHex('2')!;
    ctx.fillRect(x, y + 17, 10, 1);
    if (shape === 0) {
      ctx.fillStyle = palHex('3')!;
      ctx.fillRect(x + 2, y - 2, 6, 2);
      ctx.fillRect(x + 3, y - 3, 4, 1);
    } else if (shape === 1) {
      ctx.fillStyle = palHex('3')!;
      ctx.fillRect(x + 4, y - 6, 2, 6);
      ctx.fillRect(x + 2, y - 3, 6, 2);
    } else {
      ctx.fillStyle = palHex('3')!;
      ctx.fillRect(x + 1, y - 1, 8, 1);
    }
    ctx.fillStyle = palHex('1')!;
    ctx.fillRect(x + 2, y + 3, 2, 1);
    ctx.fillRect(x + 5, y + 3, 2, 1);
    ctx.fillRect(x + 3, y + 6, 4, 1);
    ctx.restore();
  }
}
