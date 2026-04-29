import { palHex } from '../../../sprites/palette';
import { drawMagicCircle, TORCH_MAGMA } from '../primitives';
import type { MenuEngine, ThemeController } from '../types';

interface Gear {
  x: number;
  y: number;
  r: number;
  phase: number;
  speed: number;
}

interface SteamPuff {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

export function createIronFoundryTheme(engine: MenuEngine): ThemeController {
  const { W, H, ctx } = engine;

  const gears: Gear[] = [
    { x: 36, y: 86, r: 12, phase: 0.2, speed: 0.35 },
    { x: 58, y: 104, r: 8, phase: 1.4, speed: -0.55 },
    { x: W - 42, y: 92, r: 14, phase: 2.5, speed: -0.28 },
    { x: W - 70, y: 118, r: 9, phase: 0.7, speed: 0.48 },
  ];

  const steamVents = [
    { x: 48, y: 194 },
    { x: W - 50, y: 190 },
    { x: W / 2, y: 206 },
  ];
  const puffs: SteamPuff[] = [];
  let puffTimer = 0;

  return {
    torchPal: TORCH_MAGMA,
    torchMounts: [{ x: 16, y: 155 }, { x: W - 16, y: 155 }],
    stars: false,
    shootingStars: false,
    magicCircleKey: 'O',

    drawBackdrop(t) {
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, palHex('1')!);
      grad.addColorStop(0.48, palHex('3')!);
      grad.addColorStop(1, palHex('0')!);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Riveted wall panels.
      ctx.fillStyle = palHex('a')!;
      ctx.fillRect(0, 70, W, 88);
      ctx.fillStyle = palHex('3')!;
      for (let y = 78; y < 154; y += 18) ctx.fillRect(0, y, W, 1);
      for (let x = 0; x < W; x += 30) ctx.fillRect(x, 70, 1, 88);

      ctx.fillStyle = palHex('b')!;
      for (let x = 8; x < W; x += 15) {
        for (let y = 78; y < 154; y += 18) {
          if ((x + y) % 3 === 0) ctx.fillRect(x, y, 1, 1);
        }
      }

      // Furnace glow behind the center arch.
      const pulse = 0.55 + 0.45 * Math.sin(t * 2.2);
      ctx.save();
      ctx.globalAlpha = 0.28 + pulse * 0.22;
      ctx.fillStyle = palHex('u')!;
      ctx.beginPath();
      ctx.arc(W / 2, 146, 34 + pulse * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    },

    drawMidground(t) {
      for (const g of gears) drawGear(g, t);

      // Furnace mouth.
      ctx.fillStyle = palHex('0')!;
      ctx.fillRect(W / 2 - 26, 128, 52, 70);
      ctx.fillStyle = palHex('J')!;
      ctx.fillRect(W / 2 - 22, 134, 44, 58);
      const glow = 0.5 + 0.5 * Math.sin(t * 4);
      ctx.save();
      ctx.globalAlpha = 0.55 + glow * 0.3;
      ctx.fillStyle = palHex('O')!;
      ctx.fillRect(W / 2 - 17, 154, 34, 22);
      ctx.fillStyle = palHex('y')!;
      ctx.fillRect(W / 2 - 10, 159, 20, 9);
      ctx.restore();

      // Pipe runs.
      ctx.fillStyle = palHex('5')!;
      for (const y of [112, 124, 182]) {
        ctx.fillRect(0, y, W, 3);
        ctx.fillStyle = palHex('7')!;
        ctx.fillRect(0, y, W, 1);
        ctx.fillStyle = palHex('5')!;
      }
      ctx.fillStyle = palHex('6')!;
      for (const x of [24, 72, W - 72, W - 24]) ctx.fillRect(x, 72, 4, 154);

      // Iron torch pylons.
      for (const px of [10, W - 20]) {
        ctx.fillStyle = palHex('a')!;
        ctx.fillRect(px + 3, 160, 6, 68);
        ctx.fillStyle = palHex('b')!;
        ctx.fillRect(px + 3, 160, 1, 68);
        ctx.fillStyle = palHex('O')!;
        ctx.fillRect(px + 5, 178, 2, 1);
        ctx.fillRect(px + 5, 204, 2, 1);
      }
    },

    drawFloor(t) {
      const y0 = 228;
      ctx.fillStyle = palHex('1')!;
      ctx.fillRect(0, y0, W, H - y0);

      // Metal grating with warm slots below.
      for (let y = y0; y < H; y += 7) {
        ctx.fillStyle = palHex('a')!;
        ctx.fillRect(0, y, W, 1);
        ctx.fillStyle = palHex('0')!;
        ctx.fillRect(0, y + 3, W, 1);
      }
      for (let x = 0; x < W; x += 14) {
        ctx.fillStyle = palHex('3')!;
        ctx.fillRect(x, y0, 1, H - y0);
        const pulse = 0.4 + 0.4 * Math.sin(t * 3 + x);
        ctx.save();
        ctx.globalAlpha = pulse;
        ctx.fillStyle = palHex('O')!;
        ctx.fillRect(x + 5, y0 + 8, 5, 1);
        ctx.fillRect(x + 3, y0 + 25, 6, 1);
        ctx.restore();
      }

      drawMagicCircle(engine, t, palHex('O')!);
    },

    drawOverlay(t, dt) {
      puffTimer -= dt;
      if (puffTimer <= 0) {
        puffTimer = 0.16 + Math.random() * 0.18;
        const vent = steamVents[Math.floor(Math.random() * steamVents.length)]!;
        puffs.push({
          x: vent.x + (Math.random() - 0.5) * 8,
          y: vent.y,
          vx: (Math.random() - 0.5) * 8,
          vy: -18 - Math.random() * 12,
          life: 0,
          maxLife: 0.9 + Math.random() * 0.5,
          size: 3 + Math.random() * 5,
        });
      }

      for (let i = puffs.length - 1; i >= 0; i--) {
        const p = puffs[i]!;
        p.life += dt;
        if (p.life >= p.maxLife) {
          puffs.splice(i, 1);
          continue;
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.98;
        const fade = 1 - p.life / p.maxLife;
        ctx.save();
        ctx.globalAlpha = fade * 0.22;
        ctx.fillStyle = palHex('d')!;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1.1 - fade * 0.25), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      void t;
    },
  };

  function drawGear(g: Gear, t: number) {
    const a = t * g.speed + g.phase;
    ctx.save();
    ctx.translate(g.x, g.y);
    ctx.rotate(a);
    ctx.strokeStyle = palHex('7')!;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, g.r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = palHex('5')!;
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2;
      const x = Math.cos(ang) * g.r;
      const y = Math.sin(ang) * g.r;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.fillStyle = palHex('8')!;
      ctx.fillRect(Math.round(x) - 1, Math.round(y) - 1, 2, 2);
    }

    ctx.fillStyle = palHex('a')!;
    ctx.fillRect(-2, -2, 4, 4);
    ctx.restore();
  }
}
