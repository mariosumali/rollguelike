import { palHex } from '../../../sprites/palette';
import {
  drawMagicCircle,
  drawMoon,
  skyGradient,
  TORCH_CRYSTAL,
} from '../primitives';
import type { MenuEngine, ThemeController } from '../types';

interface FloatingCandle {
  baseX: number;
  baseY: number;
  radius: number;
  angle: number;
  speed: number;
  phase: number;
}

interface Rune {
  x: number;
  y: number;
  size: number;
  phase: number;
  color: string;
  shape: number;
}

interface Sparkle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export function createWizardTowerTheme(engine: MenuEngine): ThemeController {
  const { W, H, ctx } = engine;

  const candles: FloatingCandle[] = [];
  for (let i = 0; i < 7; i++) {
    candles.push({
      baseX: 30 + Math.random() * (W - 60),
      baseY: 110 + Math.random() * 90,
      radius: 4 + Math.random() * 8,
      angle: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.4,
      phase: Math.random() * Math.PI * 2,
    });
  }

  const runes: Rune[] = [];
  for (let i = 0; i < 6; i++) {
    runes.push({
      x: 20 + i * 28 + Math.floor(Math.random() * 6),
      y: 234 + Math.floor(Math.random() * 6),
      size: 3,
      phase: Math.random() * Math.PI * 2,
      color: ['H', 'q', 'I', 'w'][Math.floor(Math.random() * 4)]!,
      shape: Math.floor(Math.random() * 4),
    });
  }

  const sparkles: Sparkle[] = [];
  let sparkleTimer = 0;

  return {
    torchPal: TORCH_CRYSTAL,
    torchMounts: [{ x: 15, y: 155 }, { x: W - 15, y: 155 }],
    stars: true,
    shootingStars: true,
    magicCircleKey: 'H',

    drawBackdrop(t) {
      skyGradient(engine, 'V', 'E', 'F');

      // Nebula clouds.
      ctx.save();
      for (let i = 0; i < 2; i++) {
        const cy = 40 + i * 30;
        const colorK = i === 0 ? 'G' : 'W';
        ctx.globalAlpha = 0.12;
        ctx.fillStyle = palHex(colorK)!;
        for (let x = 0; x < W; x += 2) {
          const h = Math.round(6 + Math.sin(x * 0.05 + t * 0.2 + i) * 4);
          ctx.fillRect(x, cy - h / 2, 2, h);
        }
      }
      ctx.restore();

      drawMoon(engine, 28, 30, 6);
    },

    drawMidground(t) {
      // Tall twisted tower (off-center, right side).
      const towerX = W - 64;
      const towerBaseY = 225;
      const towerTopY = 70;

      // Shaft with slight twist.
      for (let y = towerTopY; y < towerBaseY; y++) {
        const prog = (y - towerTopY) / (towerBaseY - towerTopY);
        const w = Math.round(16 + prog * 10);
        const twist = Math.round(Math.sin(prog * Math.PI * 2) * 2);
        const cx = towerX + twist;
        ctx.fillStyle = palHex('3')!;
        ctx.fillRect(cx - Math.floor(w / 2), y, w, 1);
        // Highlight column.
        ctx.fillStyle = palHex('4')!;
        ctx.fillRect(cx - Math.floor(w / 2) + 1, y, 2, 1);
        // Stone banding.
        if (y % 20 === 0) {
          ctx.fillStyle = palHex('a')!;
          ctx.fillRect(cx - Math.floor(w / 2), y, w, 1);
        }
      }

      // Warm windows glowing on the tower.
      const winks: [number, number][] = [
        [towerTopY + 30, 3],
        [towerTopY + 55, 1.7],
        [towerTopY + 80, 0.9],
        [towerTopY + 110, 2.3],
      ];
      for (const [wy, seed] of winks) {
        const prog = (wy - towerTopY) / (towerBaseY - towerTopY);
        const twist = Math.round(Math.sin(prog * Math.PI * 2) * 2);
        const flick = 0.55 + 0.45 * Math.sin(t * 6 + seed);
        ctx.save();
        ctx.globalAlpha = 0.25 + flick * 0.25;
        ctx.fillStyle = palHex('v')!;
        ctx.beginPath();
        ctx.arc(towerX + twist, wy, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        ctx.fillStyle = palHex('y')!;
        ctx.fillRect(towerX + twist - 1, wy - 2, 3, 4);
        ctx.fillStyle = palHex('u')!;
        ctx.fillRect(towerX + twist, wy - 1, 1, 2);
      }

      // Crenellated top.
      ctx.fillStyle = palHex('a')!;
      ctx.fillRect(towerX - 12, towerTopY - 2, 24, 3);
      for (let i = 0; i < 5; i++) {
        ctx.fillRect(towerX - 11 + i * 5, towerTopY - 5, 3, 3);
      }

      // Conical roof.
      ctx.fillStyle = palHex('G')!;
      for (let i = 0; i < 14; i++) {
        ctx.fillRect(towerX - 10 + i * 0.7, towerTopY - 5 - i, 20 - i, 1);
      }
      // Flag pole + pennant.
      ctx.fillStyle = palHex('a')!;
      ctx.fillRect(towerX, towerTopY - 25, 1, 10);
      const flagWave = Math.round(Math.sin(t * 3) * 1);
      ctx.fillStyle = palHex('H')!;
      ctx.fillRect(towerX + 1, towerTopY - 25 + flagWave, 5, 3);

      // Wizard's observatory glow at the top.
      const ob = 0.5 + 0.5 * Math.sin(t * 2);
      ctx.save();
      ctx.globalAlpha = 0.25 + ob * 0.25;
      ctx.fillStyle = palHex('H')!;
      ctx.beginPath();
      ctx.arc(towerX, towerTopY + 5, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Magical rune ring encircling the tower midsection.
      ctx.save();
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 + t * 0.4;
        const rx = Math.round(towerX + Math.cos(a) * 22);
        const ry = Math.round(towerTopY + 60 + Math.sin(a) * 8);
        ctx.globalAlpha = 0.5 + 0.3 * Math.sin(t * 3 + i);
        ctx.fillStyle = palHex('I')!;
        ctx.fillRect(rx, ry, 2, 2);
      }
      ctx.restore();

      // Stone altar posts for the torches.
      for (const px of [10, W - 20]) {
        ctx.fillStyle = palHex('a')!;
        ctx.fillRect(px + 2, 160, 6, 70);
        ctx.fillStyle = palHex('b')!;
        ctx.fillRect(px + 2, 160, 1, 70);
        ctx.fillStyle = palHex('H')!;
        const pulse = 0.5 + 0.5 * Math.sin(t * 2.5 + px);
        ctx.save();
        ctx.globalAlpha = 0.5 + pulse * 0.3;
        ctx.fillRect(px + 4, 168, 2, 1);
        ctx.fillRect(px + 4, 182, 2, 1);
        ctx.fillRect(px + 4, 196, 2, 1);
        ctx.fillRect(px + 4, 210, 2, 1);
        ctx.restore();
      }
    },

    drawFloor(t, dt) {
      const y0 = 228;
      // Polished stone platform.
      ctx.fillStyle = palHex('4')!;
      ctx.fillRect(0, y0, W, H - y0);
      ctx.fillStyle = palHex('3')!;
      for (let x = 0; x < W; x += 2) {
        if ((x * 5 + y0) % 13 < 3) ctx.fillRect(x, y0 + 1, 1, 1);
      }
      // Shimmer band where stone meets sky.
      ctx.fillStyle = palHex('a')!;
      ctx.fillRect(0, y0, W, 1);

      // Runes carved into the floor, each pulsing on their own beat.
      for (const r of runes) {
        const pulse = 0.5 + 0.5 * Math.sin(t * 2 + r.phase);
        ctx.save();
        ctx.globalAlpha = 0.3 + pulse * 0.45;
        ctx.fillStyle = palHex(r.color)!;
        drawRune(r);
        ctx.restore();
      }

      drawMagicCircle(engine, t, palHex('H')!);

      // Occasional sparkles from the magic circle.
      sparkleTimer -= dt;
      if (sparkleTimer <= 0) {
        sparkleTimer = 0.15 + Math.random() * 0.15;
        for (let i = 0; i < 2; i++) {
          const a = Math.random() * Math.PI * 2;
          sparkles.push({
            x: W / 2 + Math.cos(a) * 32,
            y: 242 + Math.sin(a) * 5,
            vx: Math.cos(a) * 8,
            vy: -15 - Math.random() * 20,
            life: 0.6 + Math.random() * 0.4,
            color: Math.random() < 0.5 ? 'H' : 'I',
          });
        }
      }
      for (let i = sparkles.length - 1; i >= 0; i--) {
        const s = sparkles[i]!;
        s.life -= dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.vy += 40 * dt;
        if (s.life <= 0) {
          sparkles.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = Math.max(0, s.life);
        ctx.fillStyle = palHex(s.color)!;
        ctx.fillRect(Math.round(s.x), Math.round(s.y), 1, 1);
        ctx.restore();
      }
    },

    drawOverlay(t) {
      // Floating candles orbiting gently.
      for (const c of candles) {
        c.angle += 0.01 * c.speed;
        const x = Math.round(c.baseX + Math.cos(c.angle) * c.radius);
        const y = Math.round(c.baseY + Math.sin(c.angle * 2 + c.phase) * 3);

        // Candle body.
        ctx.fillStyle = palHex('e')!;
        ctx.fillRect(x, y, 2, 4);
        ctx.fillStyle = palHex('d')!;
        ctx.fillRect(x, y, 1, 4);
        // Wick.
        ctx.fillStyle = palHex('0')!;
        ctx.fillRect(x, y - 1, 1, 1);
        // Flame.
        const flick = 0.5 + 0.5 * Math.sin(t * 10 + c.phase);
        ctx.fillStyle = palHex('y')!;
        ctx.fillRect(x, y - 3, 1, 2);
        if (flick > 0.4) {
          ctx.fillStyle = palHex('v')!;
          ctx.fillRect(x, y - 3, 1, 1);
        }
        // Glow halo.
        ctx.save();
        ctx.globalAlpha = 0.15 + flick * 0.1;
        ctx.fillStyle = palHex('v')!;
        ctx.beginPath();
        ctx.arc(x, y - 2, 4 + flick, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    },
  };

  function drawRune(r: Rune) {
    const { x, y, shape } = r;
    switch (shape) {
      case 0: {
        ctx.fillRect(x, y - 2, 3, 1);
        ctx.fillRect(x, y - 2, 1, 5);
        ctx.fillRect(x, y + 2, 3, 1);
        break;
      }
      case 1: {
        ctx.fillRect(x, y - 2, 1, 5);
        ctx.fillRect(x, y, 4, 1);
        ctx.fillRect(x + 3, y - 1, 1, 3);
        break;
      }
      case 2: {
        ctx.fillRect(x, y - 2, 4, 1);
        ctx.fillRect(x, y + 2, 4, 1);
        ctx.fillRect(x + 1, y, 2, 1);
        break;
      }
      case 3: {
        ctx.fillRect(x + 1, y - 2, 2, 1);
        ctx.fillRect(x, y - 1, 1, 4);
        ctx.fillRect(x + 3, y - 1, 1, 4);
        ctx.fillRect(x + 1, y + 2, 2, 1);
        break;
      }
    }
  }
}
