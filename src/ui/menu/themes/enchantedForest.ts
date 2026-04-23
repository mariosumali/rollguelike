import { palHex } from '../../../sprites/palette';
import {
  createDrifters,
  drawMagicCircle,
  drawMoon,
  skyGradient,
  TORCH_EMERALD,
  updateAndDrawDrift,
} from '../primitives';
import type { MenuEngine, ThemeController } from '../types';

interface Firefly {
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
  life: number;
}

interface Mushroom {
  x: number;
  y: number;
  cap: string;
  glow: string;
  phase: number;
  size: number;
}

interface Tree {
  x: number;
  w: number;
  top: number;
  trunkColor: string;
}

export function createEnchantedForestTheme(engine: MenuEngine): ThemeController {
  const { W, H, ctx } = engine;

  // Tree silhouettes at two depths.
  const farTrees: Tree[] = [];
  for (let x = 0; x < W; x += 10 + Math.floor(Math.random() * 6)) {
    farTrees.push({
      x,
      w: 8 + Math.floor(Math.random() * 6),
      top: 80 + Math.floor(Math.random() * 24),
      trunkColor: 'T',
    });
  }
  const midTrees: Tree[] = [];
  for (let i = 0; i < 5; i++) {
    midTrees.push({
      x: 10 + i * 36 + Math.floor(Math.random() * 12),
      w: 18 + Math.floor(Math.random() * 6),
      top: 60 + Math.floor(Math.random() * 20),
      trunkColor: 'U',
    });
  }

  const fireflies: Firefly[] = [];
  for (let i = 0; i < 22; i++) {
    fireflies.push({
      x: 10 + Math.random() * (W - 20),
      y: 90 + Math.random() * 130,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.2,
      phase: Math.random() * Math.PI * 2,
      life: Math.random() * 4,
    });
  }

  const mushrooms: Mushroom[] = [];
  const mushColors: [string, string][] = [
    ['H', 'I'],
    ['q', 'D'],
    ['m', 'n'],
    ['I', 'H'],
  ];
  for (let i = 0; i < 9; i++) {
    const [cap, glow] = mushColors[Math.floor(Math.random() * mushColors.length)]!;
    mushrooms.push({
      x: 14 + i * 20 + Math.floor(Math.random() * 10),
      y: 230 + Math.floor(Math.random() * 10),
      cap,
      glow,
      phase: Math.random() * Math.PI * 2,
      size: 2 + Math.floor(Math.random() * 2),
    });
  }

  // Drifting leaves.
  const leaves = createDrifters({
    count: 18,
    bounds: { x0: -4, x1: W + 4, y0: -6, y1: H + 4 },
    vx: [-0.2, 0.2],
    vy: [0.12, 0.35],
    size: [1, 2],
    colors: [palHex('l')!, palHex('m')!, palHex('U')!, palHex('8')!],
    alpha: [0.5, 0.85],
    sway: 1.2,
    wrap: 'top',
  });

  return {
    torchPal: TORCH_EMERALD,
    stars: true,
    shootingStars: false,
    magicCircleKey: 'm',

    drawBackdrop() {
      skyGradient(engine, 'E', 'F', 'k');
      drawMoon(engine, W / 2 + 10, 34, 7);

      // Far canopy of misty trees.
      for (const tr of farTrees) {
        ctx.fillStyle = palHex(tr.trunkColor)!;
        ctx.fillRect(tr.x, tr.top, tr.w, 90);
        // Dome of foliage.
        const cy = tr.top + 6;
        ctx.beginPath();
        ctx.arc(tr.x + tr.w / 2, cy, tr.w, 0, Math.PI * 2);
        ctx.fill();
      }

      // Canopy vines hanging down.
      ctx.save();
      ctx.globalAlpha = 0.45;
      ctx.fillStyle = palHex('U')!;
      for (let i = 0; i < 20; i++) {
        const vx = 8 + i * 8 + ((i * 13) % 5);
        const vh = 20 + ((i * 29) % 18);
        ctx.fillRect(vx, 0, 1, vh);
      }
      ctx.restore();
    },

    drawMidground(t) {
      // Mid-depth trees with detail.
      for (const tr of midTrees) {
        // Trunk.
        ctx.fillStyle = palHex('U')!;
        ctx.fillRect(tr.x, tr.top + 30, tr.w - 4, 200);
        ctx.fillStyle = palHex('T')!;
        ctx.fillRect(tr.x, tr.top + 30, 2, 200);
        // Gnarled roots at the base.
        ctx.fillStyle = palHex('5')!;
        ctx.fillRect(tr.x - 2, 225, tr.w, 2);
        // Foliage mass.
        ctx.fillStyle = palHex('T')!;
        ctx.beginPath();
        ctx.arc(tr.x + tr.w / 2 - 2, tr.top + 10, tr.w - 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = palHex('l')!;
        // Pockets of lighter leaves that sway.
        const sway = Math.round(Math.sin(t * 0.9 + tr.x) * 1);
        ctx.fillRect(tr.x + sway, tr.top + 6, 4, 3);
        ctx.fillRect(tr.x + tr.w - 6 - sway, tr.top + 8, 4, 3);
      }

      // Occasional mossy arch in the center.
      const arch = () => {
        const cx = W / 2;
        ctx.fillStyle = palHex('U')!;
        for (let a = 0; a <= Math.PI; a += 0.03) {
          const x = Math.round(cx + Math.cos(a) * 24);
          const y = Math.round(170 - Math.sin(a) * 16);
          ctx.fillRect(x, y, 2, 2);
        }
      };
      arch();

      // Stake posts for the torches.
      for (const px of [10, W - 20]) {
        ctx.fillStyle = palHex('5')!;
        ctx.fillRect(px + 3, 160, 4, 70);
        ctx.fillStyle = palHex('6')!;
        ctx.fillRect(px + 3, 160, 1, 70);
        ctx.fillStyle = palHex('l')!;
        ctx.fillRect(px + 3, 164, 4, 2);
        ctx.fillRect(px + 3, 198, 4, 2);
      }
    },

    drawFloor(t) {
      const y0 = 228;
      // Mossy forest floor.
      ctx.fillStyle = palHex('T')!;
      ctx.fillRect(0, y0, W, H - y0);
      ctx.fillStyle = palHex('U')!;
      for (let x = 0; x < W; x++) {
        const h = 1 + Math.round((Math.sin(x * 0.25) + 1) * 0.75);
        ctx.fillRect(x, y0, 1, h);
      }
      // Lighter mossy patches.
      ctx.fillStyle = palHex('l')!;
      for (let x = 6; x < W; x += 13) {
        const h = 1 + ((x * 7) % 2);
        ctx.fillRect(x, y0 + 2, 3, h);
      }
      // Twigs.
      ctx.fillStyle = palHex('5')!;
      for (let i = 0; i < 4; i++) {
        const tx = 20 + i * 40;
        ctx.fillRect(tx, y0 + 6, 6, 1);
        ctx.fillRect(tx + 2, y0 + 5, 1, 1);
      }

      // Glowing mushrooms.
      for (const m of mushrooms) {
        const pulse = 0.5 + 0.5 * Math.sin(t * 2 + m.phase);
        ctx.save();
        ctx.globalAlpha = 0.18 + pulse * 0.15;
        ctx.fillStyle = palHex(m.glow)!;
        ctx.beginPath();
        ctx.arc(m.x + 2, m.y, m.size * 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        // Stalk.
        ctx.fillStyle = palHex('e')!;
        ctx.fillRect(m.x + m.size, m.y - 2, 1, 3);
        // Cap.
        ctx.fillStyle = palHex(m.cap)!;
        ctx.fillRect(m.x, m.y - 3, m.size * 2 + 1, 1);
        ctx.fillRect(m.x - 1, m.y - 2, m.size * 2 + 3, 1);
        ctx.fillStyle = palHex(m.glow)!;
        ctx.fillRect(m.x + m.size, m.y - 3, 1, 1);
      }

      drawMagicCircle(engine, t, palHex('m')!);
    },

    drawOverlay(t, dt) {
      // Gentle leaf drift.
      updateAndDrawDrift(engine, leaves, t, dt, {
        x0: -4,
        x1: W + 4,
        y0: -6,
        y1: 228,
      });

      // Fireflies wandering.
      const step = Math.min(2.5, dt * 60);
      for (const f of fireflies) {
        f.life -= step / 60;
        if (f.life < 0) {
          f.vx = (Math.random() - 0.5) * 0.3;
          f.vy = (Math.random() - 0.5) * 0.2;
          f.life = 1 + Math.random() * 3;
        }
        f.x += f.vx * step + Math.sin(t * 1.2 + f.phase) * 0.1;
        f.y += f.vy * step + Math.cos(t * 0.9 + f.phase) * 0.08;
        if (f.x < 0) f.x += W;
        if (f.x > W) f.x -= W;
        if (f.y < 80) f.y = 220;
        if (f.y > 224) f.y = 80;

        const pulse = (Math.sin(t * 4 + f.phase) + 1) * 0.5;
        ctx.save();
        ctx.globalAlpha = 0.12 + pulse * 0.22;
        ctx.fillStyle = palHex('y')!;
        ctx.beginPath();
        ctx.arc(Math.round(f.x), Math.round(f.y), 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        ctx.fillStyle = palHex('v')!;
        ctx.fillRect(Math.round(f.x), Math.round(f.y), 1, 1);
        if (pulse > 0.5) {
          ctx.fillStyle = palHex('e')!;
          ctx.fillRect(Math.round(f.x), Math.round(f.y), 1, 1);
        }
      }
    },
  };
}
