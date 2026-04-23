import { palHex } from '../../../sprites/palette';
import { drawMagicCircle, drawMoon, skyGradient, TORCH_FIRE } from '../primitives';
import type { MenuEngine, ThemeController } from '../types';

interface FoggyWisp {
  x: number;
  y: number;
  w: number;
  speed: number;
  alpha: number;
}

interface Gull {
  x: number;
  y: number;
  vx: number;
  phase: number;
}

export function createPirateCoveTheme(engine: MenuEngine): ThemeController {
  const { W, H, ctx } = engine;

  // Jagged cliff silhouette (both sides) — generated once per mount.
  const cliff = (side: 'left' | 'right', seed: number) => {
    const pts: { x: number; y: number }[] = [];
    const maxX = side === 'left' ? 40 : W;
    const minX = side === 'left' ? 0 : W - 40;
    for (let x = minX; x <= maxX; x++) {
      const local = side === 'left' ? x / 40 : (W - x) / 40;
      const n =
        Math.sin(x * 0.28 + seed) * 0.35 +
        Math.sin(x * 0.11 + seed * 2) * 0.35 +
        Math.sin(x * 0.6 + seed * 1.5) * 0.2;
      pts.push({
        x,
        y: Math.round(130 - local * 40 + n * 10 + (Math.random() - 0.5) * 1.5),
      });
    }
    return pts;
  };
  const leftCliff = cliff('left', 1.7);
  const rightCliff = cliff('right', 4.3);

  const fogs: FoggyWisp[] = [];
  for (let i = 0; i < 4; i++) {
    fogs.push({
      x: Math.random() * W,
      y: 148 + Math.random() * 14,
      w: 32 + Math.floor(Math.random() * 28),
      speed: 3 + Math.random() * 4,
      alpha: 0.08 + Math.random() * 0.08,
    });
  }

  const gulls: Gull[] = [];
  for (let i = 0; i < 2; i++) {
    gulls.push({
      x: Math.random() * W,
      y: 40 + Math.random() * 30,
      vx: 0.3 + Math.random() * 0.3,
      phase: Math.random() * Math.PI * 2,
    });
  }

  return {
    torchPal: TORCH_FIRE,
    stars: true,
    shootingStars: true,
    magicCircleKey: 'D',

    drawBackdrop(t) {
      skyGradient(engine, 'E', 'F', 'A');
      drawMoon(engine, 42, 42, 8);

      // Slowly drifting cloud in front of the moon.
      ctx.save();
      const cloudX = (t * 4) % (W + 40) - 40;
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = palHex('4')!;
      ctx.fillRect(cloudX + 8, 38, 14, 3);
      ctx.fillRect(cloudX + 2, 40, 22, 2);
      ctx.fillRect(cloudX + 12, 36, 8, 2);
      ctx.restore();

      // Distant water line (horizon).
      const waterTop = 140;
      const waterBot = 170;
      ctx.fillStyle = palHex('A')!;
      ctx.fillRect(0, waterTop, W, waterBot - waterTop);

      // Animated distant wave bands.
      ctx.fillStyle = palHex('B')!;
      for (let x = 0; x < W; x++) {
        const h = 1 + Math.round((Math.sin(x * 0.12 + t * 1.1) + 1) * 0.5);
        ctx.fillRect(x, waterTop + 4, 1, h);
      }
      ctx.fillStyle = palHex('o')!;
      for (let x = 0; x < W; x += 3) {
        const y = waterTop + 9 + Math.round(Math.sin(x * 0.18 + t * 0.9) * 1);
        ctx.fillRect(x, y, 2, 1);
      }

      // Moon reflection shimmering on water.
      ctx.save();
      for (let i = 0; i < 5; i++) {
        const y = waterTop + 2 + i * 5 + Math.round(Math.sin(t * 1.4 + i) * 1);
        const w = 12 - i * 2;
        const a = 0.32 - i * 0.05;
        if (a <= 0) continue;
        ctx.globalAlpha = a;
        ctx.fillStyle = palHex('e')!;
        ctx.fillRect(42 - Math.floor(w / 2), y, w, 1);
      }
      ctx.restore();
    },

    drawMidground(t) {
      // Jagged rocky cliffs silhouetted on both sides.
      ctx.fillStyle = palHex('1')!;
      ctx.beginPath();
      ctx.moveTo(0, H);
      ctx.lineTo(0, 0);
      for (const p of leftCliff) ctx.lineTo(p.x, p.y);
      ctx.lineTo(leftCliff[leftCliff.length - 1]!.x, H);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(W, H);
      ctx.lineTo(W, 0);
      for (let i = rightCliff.length - 1; i >= 0; i--) {
        const p = rightCliff[i]!;
        ctx.lineTo(p.x, p.y);
      }
      ctx.lineTo(rightCliff[0]!.x, H);
      ctx.closePath();
      ctx.fill();

      // Highlight the cliff crest (moon-lit ridge).
      ctx.fillStyle = palHex('3')!;
      for (const p of leftCliff) ctx.fillRect(p.x, p.y, 1, 1);
      for (const p of rightCliff) ctx.fillRect(p.x, p.y, 1, 1);

      // Distant lighthouse perched on the left cliff.
      drawBeaconTower(t);

      // Single pirate galleon anchored in the cove.
      drawGalleon(t, 72, 138);

      // Fog rolling low across the water.
      ctx.save();
      for (const f of fogs) {
        f.x -= (f.speed * 0.05) * (0.8 + Math.sin(t + f.y) * 0.1);
        if (f.x + f.w < -4) f.x = W + 4;
        ctx.globalAlpha = f.alpha;
        ctx.fillStyle = palHex('c')!;
        ctx.fillRect(Math.round(f.x), Math.round(f.y), f.w, 1);
        ctx.fillRect(Math.round(f.x) + 6, Math.round(f.y) + 1, Math.max(0, f.w - 12), 1);
      }
      ctx.restore();

      // Short stone plinths on the dock, directly beneath the torches.
      for (const px of [10, W - 24]) {
        // Mossy stone cap.
        ctx.fillStyle = palHex('a')!;
        ctx.fillRect(px + 2, 159, 8, 2);
        ctx.fillStyle = palHex('b')!;
        ctx.fillRect(px + 2, 159, 8, 1);
        // Plinth body.
        ctx.fillStyle = palHex('a')!;
        ctx.fillRect(px + 3, 161, 6, 6);
        ctx.fillStyle = palHex('b')!;
        ctx.fillRect(px + 3, 161, 1, 6);
        ctx.fillStyle = palHex('1')!;
        ctx.fillRect(px + 8, 161, 1, 6);
        // Damp mossy seam.
        ctx.fillStyle = palHex('l')!;
        ctx.fillRect(px + 3, 164, 6, 1);
        // Foot shadow on the planks.
        ctx.fillStyle = palHex('0')!;
        ctx.fillRect(px + 2, 167, 8, 1);
      }
    },

    drawFloor(t) {
      const y0 = 228;

      // Weathered wood planks running horizontally.
      const darkPlank = palHex('5')!;
      const lightPlank = palHex('6')!;
      const gap = palHex('0')!;
      for (let y = y0; y < H; y += 6) {
        const row = Math.floor((y - y0) / 6);
        ctx.fillStyle = row & 1 ? lightPlank : darkPlank;
        ctx.fillRect(0, y, W, 5);
        ctx.fillStyle = gap;
        ctx.fillRect(0, y + 5, W, 1);
        // Knots and grain marks.
        ctx.fillStyle = palHex('s')!;
        for (let x = 6 + row * 3; x < W; x += 27) {
          ctx.fillRect(x, y + 1, 2, 1);
        }
      }

      // Plank nails.
      ctx.fillStyle = palHex('a')!;
      for (let x = 8; x < W; x += 20) {
        for (let y = y0 + 1; y < H; y += 6) {
          ctx.fillRect(x, y, 1, 1);
        }
      }

      // A couple of barrels and a coil of rope along the dock edge.
      drawBarrel(30, y0 - 10);
      drawBarrel(W - 38, y0 - 10);
      drawCrate(W / 2 - 8, y0 - 7);

      // Water lapping the dock edge.
      ctx.fillStyle = palHex('C')!;
      for (let x = 0; x < W; x++) {
        const h = 1 + Math.round((Math.sin(x * 0.35 + t * 3) + 1) * 0.5);
        ctx.fillRect(x, y0 - h, 1, h);
      }
      ctx.fillStyle = palHex('D')!;
      for (let x = 0; x < W; x += 5) {
        if (Math.sin(x * 0.5 + t * 3) > 0.6) {
          ctx.fillRect(x, y0 - 2, 2, 1);
        }
      }

      drawMagicCircle(engine, t, palHex('D')!);
    },

    drawOverlay(t) {
      // Seagulls gliding across the night sky.
      for (const g of gulls) {
        g.x += g.vx;
        if (g.x > W + 6) {
          g.x = -6;
          g.y = 28 + Math.random() * 40;
        }
        const flap = Math.sin(t * 5 + g.phase) > 0;
        ctx.fillStyle = palHex('a')!;
        if (flap) {
          ctx.fillRect(Math.round(g.x) - 2, Math.round(g.y) - 1, 2, 1);
          ctx.fillRect(Math.round(g.x) + 1, Math.round(g.y) - 1, 2, 1);
        } else {
          ctx.fillRect(Math.round(g.x) - 2, Math.round(g.y), 5, 1);
        }
      }
    },
  };

  // ── Helpers used by this theme ─────────────────────────────────────────

  function drawBeaconTower(t: number) {
    // Distant lighthouse perched on the left cliff shoulder. Short and clearly
    // seated on stone so it reads as far-away, not as a mast in open water.
    const bx = 20;
    const base = 106;
    const top = 82;
    const height = base - top;

    // Tapered stone shaft.
    for (let y = 0; y < height; y++) {
      const prog = y / height;
      const w = Math.round(6 - prog * 1);
      const cx = bx + 3;
      const left = cx - Math.floor(w / 2);
      ctx.fillStyle = palHex('a')!;
      ctx.fillRect(left, base - y, w, 1);
      if (y === 2 || y === height - 4) {
        ctx.fillStyle = palHex('b')!;
        ctx.fillRect(left, base - y, w, 1);
      }
    }

    // Lantern housing.
    ctx.fillStyle = palHex('b')!;
    ctx.fillRect(bx, top - 2, 7, 2);
    ctx.fillStyle = palHex('a')!;
    ctx.fillRect(bx + 1, top - 4, 5, 2);

    // Conical cap.
    ctx.fillStyle = palHex('g')!;
    ctx.fillRect(bx + 1, top - 5, 5, 1);
    ctx.fillRect(bx + 2, top - 6, 3, 1);
    ctx.fillRect(bx + 3, top - 7, 1, 1);

    // Pulsing beacon light.
    const pulse = 0.5 + 0.5 * Math.sin(t * 5);
    ctx.save();
    ctx.globalAlpha = 0.28 + pulse * 0.22;
    ctx.fillStyle = palHex('u')!;
    ctx.beginPath();
    ctx.arc(bx + 3, top - 3, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = palHex('y')!;
    ctx.fillRect(bx + 2, top - 4, 3, 2);
  }

  function drawGalleon(t: number, x: number, y: number) {
    const bob = Math.round(Math.sin(t * 0.8) * 0.7);
    y += bob;

    // Hull — curved wooden body.
    ctx.fillStyle = palHex('5')!;
    ctx.fillRect(x + 1, y, 22, 4);
    ctx.fillRect(x + 3, y - 1, 18, 1);
    ctx.fillRect(x + 5, y + 4, 14, 1);
    // Hull trim (gold line).
    ctx.fillStyle = palHex('8')!;
    ctx.fillRect(x + 3, y + 1, 18, 1);
    // Cabin windows.
    ctx.fillStyle = palHex('y')!;
    ctx.fillRect(x + 6, y + 2, 1, 1);
    ctx.fillRect(x + 9, y + 2, 1, 1);
    ctx.fillRect(x + 12, y + 2, 1, 1);
    ctx.fillRect(x + 15, y + 2, 1, 1);
    ctx.fillRect(x + 18, y + 2, 1, 1);

    // Masts.
    ctx.fillStyle = palHex('5')!;
    ctx.fillRect(x + 5, y - 14, 1, 14);
    ctx.fillRect(x + 12, y - 17, 1, 17);
    ctx.fillRect(x + 19, y - 13, 1, 13);

    // Rigging.
    ctx.strokeStyle = 'rgba(40, 30, 20, 0.8)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 1, y);
    ctx.lineTo(x + 5, y - 14);
    ctx.lineTo(x + 12, y - 17);
    ctx.lineTo(x + 19, y - 13);
    ctx.lineTo(x + 23, y);
    ctx.stroke();

    // Sails — fabric catching the wind, animated.
    const sailSway = Math.sin(t * 1.5) * 0.5;
    const sailColor = palHex('e')!;
    const sailShade = palHex('c')!;
    // Fore sail.
    ctx.fillStyle = sailColor;
    ctx.fillRect(x + 2, y - 13, 6, 10);
    ctx.fillStyle = sailShade;
    ctx.fillRect(x + 2, y - 13, 6, 1);
    ctx.fillRect(x + 7, y - 12, 1, 8);
    // Main sail.
    ctx.fillStyle = sailColor;
    ctx.fillRect(x + 9, y - 16, 7, 13);
    ctx.fillStyle = sailShade;
    ctx.fillRect(x + 9, y - 16, 7, 1);
    ctx.fillRect(x + 15, y - 15, 1, 11);
    // Jolly-Roger flag.
    ctx.fillStyle = palHex('0')!;
    ctx.fillRect(x + 13, y - 22 + Math.round(sailSway), 3, 3);
    ctx.fillStyle = palHex('S')!;
    ctx.fillRect(x + 14, y - 21 + Math.round(sailSway), 1, 1);
    // Mizzen sail.
    ctx.fillStyle = sailColor;
    ctx.fillRect(x + 17, y - 12, 5, 9);
    ctx.fillStyle = sailShade;
    ctx.fillRect(x + 17, y - 12, 5, 1);

    // Lantern at the stern.
    const lanternPulse = 0.5 + 0.5 * Math.sin(t * 4);
    ctx.fillStyle = palHex('y')!;
    ctx.fillRect(x + 22, y - 1, 1, 1);
    ctx.save();
    ctx.globalAlpha = 0.2 + lanternPulse * 0.2;
    ctx.fillStyle = palHex('v')!;
    ctx.beginPath();
    ctx.arc(x + 22, y - 1, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawBarrel(x: number, y: number) {
    ctx.fillStyle = palHex('5')!;
    ctx.fillRect(x, y, 6, 10);
    ctx.fillStyle = palHex('6')!;
    ctx.fillRect(x, y + 1, 6, 1);
    ctx.fillRect(x, y + 7, 6, 1);
    ctx.fillStyle = palHex('a')!;
    ctx.fillRect(x, y, 1, 10);
    ctx.fillRect(x + 5, y, 1, 10);
    ctx.fillStyle = palHex('0')!;
    ctx.fillRect(x, y + 4, 6, 1);
  }

  function drawCrate(x: number, y: number) {
    ctx.fillStyle = palHex('6')!;
    ctx.fillRect(x, y, 14, 7);
    ctx.fillStyle = palHex('5')!;
    ctx.fillRect(x, y, 14, 1);
    ctx.fillRect(x, y + 6, 14, 1);
    ctx.fillRect(x, y, 1, 7);
    ctx.fillRect(x + 13, y, 1, 7);
    ctx.fillRect(x + 7, y, 1, 7);
  }
}
