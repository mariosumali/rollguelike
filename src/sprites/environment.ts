import { palHex } from './palette';
import type { StageTheme } from '../content/stages/themes';
import { STAGES } from '../content/stages/themes';

const DEFAULT_THEME: StageTheme = STAGES[0]!;

export function drawArenaBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  top: number,
  h: number,
  time: number,
  theme: StageTheme = DEFAULT_THEME,
): void {
  const grad = ctx.createLinearGradient(0, top, 0, top + h);
  grad.addColorStop(0, theme.skyTop);
  grad.addColorStop(0.55, theme.skyMid);
  grad.addColorStop(1, theme.skyBot);
  ctx.fillStyle = grad;
  ctx.fillRect(0, top, w, h);

  drawSkyAccent(ctx, w, top, h, time, theme);
  drawStars(ctx, w, top, h, time, theme);
  drawSilhouette(ctx, w, top, h, time, theme);
  drawParticles(ctx, w, top, h, time, theme);
}

function drawSkyAccent(
  ctx: CanvasRenderingContext2D,
  w: number,
  top: number,
  _h: number,
  time: number,
  theme: StageTheme,
): void {
  if (theme.id === 'blood_moon') {
    const cx = w * 0.72;
    const cy = top + 36;
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = theme.floatColor;
    drawDisc(ctx, cx, cy, 14);
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#ffffff';
    drawDisc(ctx, cx - 4, cy - 4, 4);
    ctx.globalAlpha = 1;
  } else if (theme.id === 'sunbleached_dunes') {
    const cx = w * 0.28;
    const cy = top + 30;
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = palHex('y')!;
    drawDisc(ctx, cx, cy, 12);
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = palHex('v')!;
    drawDisc(ctx, cx, cy, 18);
    ctx.globalAlpha = 1;
  } else if (theme.id === 'celestial_garden') {
    const cx = w * 0.5;
    const cy = top + 28;
    ctx.globalAlpha = 0.5 + Math.sin(time * 0.08) * 0.15;
    ctx.fillStyle = palHex('S')!;
    drawDisc(ctx, cx, cy, 8);
    ctx.globalAlpha = 0.2;
    drawDisc(ctx, cx, cy, 14);
    ctx.globalAlpha = 1;
  } else if (theme.id === 'hellfire_core') {
    ctx.globalAlpha = 0.35 + (Math.sin(time * 0.2) * 0.5 + 0.5) * 0.3;
    const glow = ctx.createRadialGradient(w / 2, top + 44, 4, w / 2, top + 44, 70);
    glow.addColorStop(0, palHex('O')!);
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, top, w, 80);
    ctx.globalAlpha = 1;
  } else if (theme.id === 'stormwall') {
    const flashPhase = (time * 0.06) % 9;
    if (flashPhase < 0.25) {
      ctx.globalAlpha = (0.25 - flashPhase) * 1.4;
      ctx.fillStyle = palHex('r')!;
      ctx.fillRect(0, top, w, 60);
      ctx.globalAlpha = 1;
    }
  } else if (theme.id === 'abyssal_trench') {
    ctx.globalAlpha = 0.12;
    const beam = ctx.createLinearGradient(0, top, 0, top + 100);
    beam.addColorStop(0, palHex('D')!);
    beam.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = beam;
    for (let i = 0; i < 3; i++) {
      const bx = ((i * 53 + time * 0.1) % (w + 40)) - 20;
      ctx.fillRect(bx, top, 18, 90);
    }
    ctx.globalAlpha = 1;
  }
}

function drawStars(
  ctx: CanvasRenderingContext2D,
  w: number,
  top: number,
  h: number,
  time: number,
  theme: StageTheme,
): void {
  if (theme.starCount <= 0) return;
  ctx.fillStyle = theme.starColor;
  const twinkle = theme.id === 'void_spire' || theme.id === 'shadow_glade' || theme.id === 'celestial_garden';
  for (let i = 0; i < theme.starCount; i++) {
    const sx = (i * 37 + ((time * 2) | 0) % 97) % w;
    const sy = (i * 53) % Math.max(1, h - 40);
    const base = 0.2 + ((i * 7) % 10) / 20;
    const a = twinkle ? base * (0.6 + Math.sin(time * 0.3 + i) * 0.4) : base;
    ctx.globalAlpha = Math.max(0.05, Math.min(1, a));
    ctx.fillRect(sx, top + sy, 1, 1);
  }
  ctx.globalAlpha = 1;
}

function drawSilhouette(
  ctx: CanvasRenderingContext2D,
  w: number,
  top: number,
  h: number,
  _time: number,
  theme: StageTheme,
): void {
  const baseY = top + h - 2;
  switch (theme.silhouette) {
    case 'mountains':
      return drawMountains(ctx, w, baseY, theme);
    case 'spires':
      return drawSpires(ctx, w, baseY, theme);
    case 'crystals':
      return drawCrystals(ctx, w, baseY, theme);
    case 'thorns':
      return drawThorns(ctx, w, baseY, theme);
    case 'dunes':
      return drawDunes(ctx, w, baseY, theme);
    case 'coral':
      return drawCoral(ctx, w, baseY, theme);
    case 'trees':
      return drawTrees(ctx, w, baseY, theme);
    case 'flowers':
      return drawFlowers(ctx, w, baseY, theme);
    case 'gears':
      return drawGearSkyline(ctx, w, baseY, theme);
    case 'ruins':
      return drawRuins(ctx, w, baseY, theme);
    case 'stormSpires':
      return drawStormSpires(ctx, w, baseY, theme);
    case 'pillars':
      return drawPillars(ctx, w, baseY, theme);
  }
}

function drawMountains(ctx: CanvasRenderingContext2D, w: number, baseY: number, theme: StageTheme): void {
  ctx.fillStyle = theme.silhouetteShade;
  ctx.beginPath();
  ctx.moveTo(0, baseY);
  for (let x = 0; x <= w; x += 4) {
    const y = baseY - 22 * (0.55 + 0.45 * Math.abs(Math.sin(x * 0.08)));
    ctx.lineTo(x, y);
  }
  ctx.lineTo(w, baseY);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = theme.silhouetteColor;
  ctx.beginPath();
  ctx.moveTo(0, baseY);
  for (let x = 0; x <= w; x += 3) {
    const y = baseY - 14 * (0.5 + 0.5 * Math.abs(Math.sin(x * 0.13 + 1)));
    ctx.lineTo(x, y);
  }
  ctx.lineTo(w, baseY);
  ctx.closePath();
  ctx.fill();
}

function drawSpires(ctx: CanvasRenderingContext2D, w: number, baseY: number, theme: StageTheme): void {
  ctx.fillStyle = theme.silhouetteShade;
  for (let x = -4; x < w; x += 14) {
    const height = 16 + (((x * 7) % 17) + 17) % 17 % 10;
    ctx.fillRect(x + 6, baseY - height, 3, height);
  }
  ctx.fillStyle = theme.silhouetteColor;
  for (let x = -6; x < w; x += 10) {
    const height = 20 + (((x * 13) % 23) + 23) % 23 % 14;
    const top = baseY - height;
    ctx.fillRect(x, top + 2, 4, height - 2);
    ctx.beginPath();
    ctx.moveTo(x, top + 2);
    ctx.lineTo(x + 2, top);
    ctx.lineTo(x + 4, top + 2);
    ctx.closePath();
    ctx.fill();
  }
}

function drawCrystals(ctx: CanvasRenderingContext2D, w: number, baseY: number, theme: StageTheme): void {
  ctx.fillStyle = theme.silhouetteShade;
  ctx.fillRect(0, baseY - 6, w, 6);
  for (let x = -4; x < w; x += 11) {
    const h = 10 + (((x * 5) % 13) + 13) % 13;
    const cx = x + 4;
    ctx.fillStyle = theme.silhouetteColor;
    ctx.beginPath();
    ctx.moveTo(cx, baseY - h);
    ctx.lineTo(cx - 3, baseY);
    ctx.lineTo(cx + 3, baseY);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = theme.silhouetteShade;
    ctx.fillRect(cx - 1, baseY - h + 2, 1, h - 2);
  }
}

function drawThorns(ctx: CanvasRenderingContext2D, w: number, baseY: number, theme: StageTheme): void {
  ctx.fillStyle = theme.silhouetteShade;
  ctx.fillRect(0, baseY - 4, w, 4);
  ctx.fillStyle = theme.silhouetteColor;
  for (let x = 0; x < w; x += 7) {
    const h = 6 + (((x * 11) % 17) + 17) % 17 % 10;
    ctx.beginPath();
    ctx.moveTo(x, baseY - 3);
    ctx.lineTo(x + 2, baseY - h);
    ctx.lineTo(x + 4, baseY - 3);
    ctx.closePath();
    ctx.fill();
  }
}

function drawDunes(ctx: CanvasRenderingContext2D, w: number, baseY: number, theme: StageTheme): void {
  ctx.fillStyle = theme.silhouetteShade;
  for (let i = 0; i < 3; i++) {
    const offset = i * w * 0.35;
    const height = 20 - i * 4;
    ctx.beginPath();
    ctx.moveTo(-20 + offset, baseY);
    for (let x = -20 + offset; x <= offset + 120; x += 3) {
      const t = (x - offset) / 120;
      const y = baseY - Math.sin(t * Math.PI) * height;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(offset + 120, baseY);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = theme.silhouetteColor;
  ctx.beginPath();
  ctx.moveTo(0, baseY);
  for (let x = 0; x <= w; x += 2) {
    const y = baseY - Math.sin(x * 0.05) * 8 - 4;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(w, baseY);
  ctx.closePath();
  ctx.fill();
}

function drawCoral(ctx: CanvasRenderingContext2D, w: number, baseY: number, theme: StageTheme): void {
  ctx.fillStyle = theme.silhouetteShade;
  ctx.fillRect(0, baseY - 4, w, 4);
  for (let x = 2; x < w; x += 9) {
    const h = 10 + (((x * 3) % 11) + 11) % 11;
    ctx.fillStyle = theme.silhouetteColor;
    ctx.fillRect(x, baseY - h, 2, h);
    ctx.fillRect(x - 2, baseY - h + 2, 2, 2);
    ctx.fillRect(x + 2, baseY - h + 4, 2, 2);
    ctx.fillRect(x - 1, baseY - h - 1, 4, 1);
  }
}

function drawTrees(ctx: CanvasRenderingContext2D, w: number, baseY: number, theme: StageTheme): void {
  for (let x = -3; x < w; x += 10) {
    const h = 18 + (((x * 17) % 11) + 11) % 11;
    ctx.fillStyle = theme.silhouetteShade;
    ctx.fillRect(x + 3, baseY - 4, 2, 4);
    ctx.fillStyle = theme.silhouetteColor;
    ctx.beginPath();
    ctx.moveTo(x + 4, baseY - h);
    ctx.lineTo(x, baseY - 4);
    ctx.lineTo(x + 8, baseY - 4);
    ctx.closePath();
    ctx.fill();
  }
}

function drawFlowers(ctx: CanvasRenderingContext2D, w: number, baseY: number, theme: StageTheme): void {
  ctx.fillStyle = theme.silhouetteShade;
  ctx.fillRect(0, baseY - 2, w, 2);
  for (let x = 2; x < w; x += 8) {
    const h = 6 + (((x * 13) % 7) + 7) % 7;
    ctx.fillStyle = palHex('l')!;
    ctx.fillRect(x + 1, baseY - h, 1, h);
    const idx = ((x >> 1) & 1);
    ctx.fillStyle = idx === 0 ? theme.silhouetteColor : theme.silhouetteShade;
    ctx.fillRect(x, baseY - h - 2, 3, 2);
    ctx.fillStyle = palHex('y')!;
    ctx.fillRect(x + 1, baseY - h - 1, 1, 1);
  }
}

function drawGearSkyline(ctx: CanvasRenderingContext2D, w: number, baseY: number, theme: StageTheme): void {
  ctx.fillStyle = theme.silhouetteShade;
  ctx.fillRect(0, baseY - 18, w, 18);
  ctx.fillStyle = theme.silhouetteColor;
  for (let x = 4; x < w; x += 18) {
    const sz = 10;
    const cx = x + sz / 2;
    const cy = baseY - 14;
    ctx.fillRect(cx - 4, cy - 4, 8, 8);
    ctx.fillRect(cx - 5, cy - 1, 1, 2);
    ctx.fillRect(cx + 4, cy - 1, 1, 2);
    ctx.fillRect(cx - 1, cy - 5, 2, 1);
    ctx.fillRect(cx - 1, cy + 4, 2, 1);
  }
  ctx.fillStyle = theme.silhouetteShade;
  for (let x = 0; x < w; x += 6) {
    ctx.fillRect(x, baseY - 4, 4, 4);
  }
}

function drawRuins(ctx: CanvasRenderingContext2D, w: number, baseY: number, theme: StageTheme): void {
  ctx.fillStyle = theme.silhouetteShade;
  for (let x = -6; x < w; x += 16) {
    const h = 14 + (((x * 5) % 7) + 7) % 7;
    ctx.fillRect(x, baseY - h, 10, h);
    ctx.fillRect(x + 2, baseY - h - 3, 3, 3);
    ctx.fillStyle = palHex('0')!;
    ctx.fillRect(x + 3, baseY - h + 4, 2, 3);
    ctx.fillStyle = theme.silhouetteShade;
  }
  ctx.fillStyle = theme.silhouetteColor;
  for (let x = 0; x < w; x += 22) {
    const h = 20 + (((x * 3) % 9) + 9) % 9;
    ctx.fillRect(x + 8, baseY - h, 6, h);
    ctx.fillStyle = palHex('0')!;
    ctx.fillRect(x + 10, baseY - h + 4, 2, 3);
    ctx.fillStyle = theme.silhouetteColor;
  }
}

function drawStormSpires(ctx: CanvasRenderingContext2D, w: number, baseY: number, theme: StageTheme): void {
  ctx.fillStyle = theme.silhouetteShade;
  for (let x = 0; x < w; x += 14) {
    const h = 18 + (((x * 7) % 11) + 11) % 11;
    ctx.fillRect(x, baseY - h, 4, h);
  }
  ctx.fillStyle = theme.silhouetteColor;
  for (let x = 4; x < w; x += 12) {
    const h = 26 + (((x * 11) % 15) + 15) % 15;
    ctx.fillRect(x, baseY - h, 5, h);
    ctx.beginPath();
    ctx.moveTo(x, baseY - h);
    ctx.lineTo(x + 2, baseY - h - 4);
    ctx.lineTo(x + 5, baseY - h);
    ctx.closePath();
    ctx.fill();
  }
}

function drawPillars(ctx: CanvasRenderingContext2D, w: number, baseY: number, theme: StageTheme): void {
  ctx.fillStyle = theme.silhouetteShade;
  ctx.fillRect(0, baseY - 8, w, 8);
  for (let x = 2; x < w; x += 16) {
    const h = 22 + (((x * 5) % 9) + 9) % 9;
    ctx.fillStyle = theme.silhouetteColor;
    ctx.fillRect(x, baseY - h, 8, h);
    ctx.fillStyle = theme.silhouetteShade;
    ctx.fillRect(x, baseY - h, 8, 2);
    ctx.fillStyle = palHex('O')!;
    ctx.fillRect(x, baseY - h + 2, 8, 1);
  }
}

function drawParticles(
  ctx: CanvasRenderingContext2D,
  w: number,
  top: number,
  h: number,
  time: number,
  theme: StageTheme,
): void {
  switch (theme.particleKind) {
    case 'stars':
      return drawDriftingMotes(ctx, w, top, h, time, theme);
    case 'embers':
      return drawEmbers(ctx, w, top, h, time, theme);
    case 'snow':
      return drawSnow(ctx, w, top, h, time, theme);
    case 'bubblesToxic':
      return drawBubbles(ctx, w, top, h, time, theme, 'toxic');
    case 'sand':
      return drawSand(ctx, w, top, h, time, theme);
    case 'bubblesOcean':
      return drawBubbles(ctx, w, top, h, time, theme, 'ocean');
    case 'spirits':
      return drawSpirits(ctx, w, top, h, time, theme);
    case 'petals':
      return drawPetals(ctx, w, top, h, time, theme);
    case 'cogs':
      return drawCogs(ctx, w, top, h, time, theme);
    case 'drips':
      return drawDrips(ctx, w, top, h, time, theme);
    case 'rain':
      return drawRain(ctx, w, top, h, time, theme);
    case 'ash':
      return drawAsh(ctx, w, top, h, time, theme);
  }
}

function drawDriftingMotes(
  ctx: CanvasRenderingContext2D,
  w: number,
  top: number,
  h: number,
  time: number,
  theme: StageTheme,
): void {
  ctx.fillStyle = theme.floatColor;
  for (let i = 0; i < 8; i++) {
    const sx = ((i * 41 + time * 4) % (w + 40)) - 20;
    const sy = top + ((i * 67 + time * 8) % h);
    ctx.globalAlpha = 0.08 + ((i * 9) % 8) / 100;
    ctx.fillRect(sx, sy, 3, 3);
  }
  ctx.globalAlpha = 1;
}

function drawEmbers(
  ctx: CanvasRenderingContext2D,
  w: number,
  top: number,
  h: number,
  time: number,
  theme: StageTheme,
): void {
  for (let i = 0; i < 14; i++) {
    const lifeT = ((time * 3 + i * 41) % 120) / 120;
    const sx = (i * 29 + Math.sin(time * 0.1 + i) * 12) % w;
    const sy = top + h - lifeT * h * 0.9;
    const a = Math.max(0, 1 - lifeT) * 0.9;
    ctx.globalAlpha = a;
    const hot = lifeT < 0.4;
    ctx.fillStyle = hot ? palHex('y')! : theme.floatColor;
    ctx.fillRect((sx + w) % w, sy, 1, 1);
    if (hot && i % 2 === 0) {
      ctx.fillStyle = palHex('O')!;
      ctx.globalAlpha = a * 0.5;
      ctx.fillRect(((sx + w) % w) - 1, sy + 1, 1, 1);
    }
  }
  ctx.globalAlpha = 1;
}

function drawSnow(
  ctx: CanvasRenderingContext2D,
  w: number,
  top: number,
  h: number,
  time: number,
  theme: StageTheme,
): void {
  ctx.fillStyle = theme.floatColor;
  for (let i = 0; i < 26; i++) {
    const sx = (i * 23 + Math.sin(time * 0.05 + i) * 14 + time * 0.6) % w;
    const sy = top + ((i * 17 + time * 14) % h);
    const big = i % 5 === 0;
    ctx.globalAlpha = big ? 0.9 : 0.55;
    ctx.fillRect((sx + w) % w, sy, big ? 2 : 1, big ? 2 : 1);
  }
  ctx.globalAlpha = 1;
}

function drawBubbles(
  ctx: CanvasRenderingContext2D,
  w: number,
  top: number,
  h: number,
  time: number,
  theme: StageTheme,
  kind: 'toxic' | 'ocean',
): void {
  for (let i = 0; i < 10; i++) {
    const lifeT = ((time * 2 + i * 37) % 100) / 100;
    const sx = (i * 31 + Math.sin(time * 0.08 + i) * 6) % w;
    const sy = top + h - lifeT * h;
    const a = Math.sin(lifeT * Math.PI) * 0.8;
    ctx.globalAlpha = a;
    ctx.fillStyle = theme.floatColor;
    const size = kind === 'ocean' ? (i % 3 === 0 ? 2 : 1) : 1;
    ctx.fillRect((sx + w) % w, sy, size, size);
    if (kind === 'ocean' && size === 2) {
      ctx.globalAlpha = a * 0.4;
      ctx.fillStyle = palHex('S')!;
      ctx.fillRect((sx + w) % w, sy, 1, 1);
    }
  }
  ctx.globalAlpha = 1;
}

function drawSand(
  ctx: CanvasRenderingContext2D,
  w: number,
  top: number,
  h: number,
  time: number,
  theme: StageTheme,
): void {
  ctx.fillStyle = theme.floatColor;
  for (let i = 0; i < 20; i++) {
    const sx = ((i * 47 + time * 22) % (w + 40)) - 20;
    const sy = top + h * 0.3 + ((i * 13) % (h * 0.7)) + Math.sin(time * 0.2 + i) * 2;
    ctx.globalAlpha = 0.35 + ((i * 3) % 5) / 20;
    ctx.fillRect(sx, sy, 2, 1);
  }
  ctx.globalAlpha = 1;
}

function drawSpirits(
  ctx: CanvasRenderingContext2D,
  w: number,
  top: number,
  h: number,
  time: number,
  theme: StageTheme,
): void {
  for (let i = 0; i < 7; i++) {
    const t = time * 0.05 + i * 1.1;
    const sx = (i / 7) * w + Math.sin(t) * 18;
    const sy = top + 30 + (i * 19) % (h - 60) + Math.sin(t * 1.3) * 4;
    const a = 0.35 + Math.sin(t * 2) * 0.2;
    ctx.globalAlpha = Math.max(0.1, a);
    ctx.fillStyle = theme.floatColor;
    ctx.fillRect(sx, sy, 2, 2);
    ctx.fillRect(sx - 1, sy + 1, 1, 1);
    ctx.fillRect(sx + 2, sy + 1, 1, 1);
    ctx.globalAlpha = a * 0.4;
    ctx.fillRect(sx, sy + 2, 2, 1);
  }
  ctx.globalAlpha = 1;
}

function drawPetals(
  ctx: CanvasRenderingContext2D,
  w: number,
  top: number,
  h: number,
  time: number,
  theme: StageTheme,
): void {
  const colors = [theme.floatColor, palHex('h')!, palHex('w')!, palHex('S')!];
  for (let i = 0; i < 14; i++) {
    const sx = (i * 23 + Math.sin(time * 0.07 + i) * 18 + time * 1.1) % w;
    const sy = top + ((i * 29 + time * 10) % h);
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = colors[i % colors.length]!;
    const rot = ((time * 0.1 + i) | 0) % 3;
    if (rot === 0) {
      ctx.fillRect((sx + w) % w, sy, 2, 1);
    } else if (rot === 1) {
      ctx.fillRect((sx + w) % w, sy, 1, 2);
    } else {
      ctx.fillRect((sx + w) % w, sy, 2, 2);
    }
  }
  ctx.globalAlpha = 1;
}

function drawCogs(
  ctx: CanvasRenderingContext2D,
  w: number,
  top: number,
  h: number,
  time: number,
  theme: StageTheme,
): void {
  for (let i = 0; i < 5; i++) {
    const sx = (i * 43 + Math.sin(time * 0.05 + i) * 10) % w;
    const sy = top + 20 + (i * 31) % (h - 60);
    const phase = (time * 0.2 + i) % 4 | 0;
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = theme.floatColor;
    ctx.fillRect(sx, sy, 3, 3);
    const teeth = phase;
    if (teeth === 0) {
      ctx.fillRect(sx - 1, sy + 1, 1, 1);
      ctx.fillRect(sx + 3, sy + 1, 1, 1);
    } else if (teeth === 1) {
      ctx.fillRect(sx + 1, sy - 1, 1, 1);
      ctx.fillRect(sx + 1, sy + 3, 1, 1);
    } else if (teeth === 2) {
      ctx.fillRect(sx - 1, sy + 1, 1, 1);
      ctx.fillRect(sx + 3, sy + 1, 1, 1);
      ctx.fillRect(sx + 1, sy - 1, 1, 1);
      ctx.fillRect(sx + 1, sy + 3, 1, 1);
    }
  }
  for (let i = 0; i < 3; i++) {
    const puff = ((time * 1.2 + i * 37) % 100) / 100;
    const sx = 30 + i * 60;
    const sy = top + h - puff * h * 0.8;
    ctx.globalAlpha = (1 - puff) * 0.3;
    ctx.fillStyle = palHex('b')!;
    ctx.fillRect(sx, sy, 3, 3);
    ctx.fillRect(sx + 2, sy - 1, 2, 2);
  }
  ctx.globalAlpha = 1;
}

function drawDrips(
  ctx: CanvasRenderingContext2D,
  w: number,
  top: number,
  h: number,
  time: number,
  theme: StageTheme,
): void {
  ctx.fillStyle = theme.floatColor;
  for (let i = 0; i < 12; i++) {
    const sx = (i * 17) % w;
    const sy = top + ((i * 43 + time * 18) % h);
    ctx.globalAlpha = 0.6;
    ctx.fillRect(sx, sy, 1, 3);
  }
  ctx.globalAlpha = 1;
}

function drawRain(
  ctx: CanvasRenderingContext2D,
  w: number,
  top: number,
  h: number,
  time: number,
  theme: StageTheme,
): void {
  ctx.strokeStyle = theme.floatColor;
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 1;
  for (let i = 0; i < 30; i++) {
    const sx = ((i * 13 + time * 30) % (w + 40)) - 20;
    const sy = top + ((i * 19 + time * 60) % h);
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx - 2, sy + 4);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawAsh(
  ctx: CanvasRenderingContext2D,
  w: number,
  top: number,
  h: number,
  time: number,
  theme: StageTheme,
): void {
  for (let i = 0; i < 16; i++) {
    const sx = (i * 27 + Math.sin(time * 0.06 + i) * 10) % w;
    const sy = top + ((i * 23 + time * 6) % h);
    ctx.globalAlpha = 0.35 + ((i * 3) % 4) / 15;
    ctx.fillStyle = i % 3 === 0 ? theme.floatColor : palHex('a')!;
    ctx.fillRect((sx + w) % w, sy, 1, 1);
  }
  ctx.globalAlpha = 1;
}

function drawDisc(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
  ctx.beginPath();
  ctx.arc(Math.round(cx), Math.round(cy), Math.round(r), 0, Math.PI * 2);
  ctx.fill();
}

export function drawWall(
  ctx: CanvasRenderingContext2D,
  y: number,
  w: number,
  theme: StageTheme = DEFAULT_THEME,
): void {
  const base = y - 6;
  ctx.fillStyle = theme.wallBase;
  ctx.fillRect(0, base, w, 8);
  ctx.fillStyle = theme.wallTop;
  ctx.fillRect(0, base, w, 2);

  switch (theme.wallStyle) {
    case 'ice':
      drawWallIce(ctx, base, w, theme);
      break;
    case 'obsidian':
      drawWallObsidian(ctx, base, w, theme);
      break;
    case 'vine':
      drawWallVine(ctx, base, w, theme);
      break;
    case 'sandstone':
      drawWallSandstone(ctx, base, w, theme);
      break;
    case 'reef':
      drawWallReef(ctx, base, w, theme);
      break;
    case 'bone':
      drawWallBone(ctx, base, w, theme);
      break;
    case 'bloom':
      drawWallBloom(ctx, base, w, theme);
      break;
    case 'metal':
      drawWallMetal(ctx, base, w, theme);
      break;
    case 'cursed':
      drawWallCursed(ctx, base, w, theme);
      break;
    case 'stormsteel':
      drawWallStormsteel(ctx, base, w, theme);
      break;
    case 'magma':
      drawWallMagma(ctx, base, w, theme);
      break;
    case 'brick':
    default:
      drawWallBrick(ctx, base, w, theme);
      break;
  }

  ctx.fillStyle = theme.wallShade;
  ctx.fillRect(0, base + 7, w, 1);
}

function drawWallBrick(ctx: CanvasRenderingContext2D, base: number, w: number, theme: StageTheme): void {
  const brickW = 12;
  const brickH = 4;
  for (let row = 0; row < 2; row++) {
    const offset = (row % 2) * (brickW / 2);
    for (let x = -offset; x < w; x += brickW) {
      ctx.fillStyle = theme.wallBase;
      ctx.fillRect(x + brickW - 1, base + row * brickH, 1, brickH);
      ctx.fillStyle = theme.wallShade;
      ctx.fillRect(x, base + brickH - 1 + row * brickH, brickW, 1);
    }
  }
  drawCrenels(ctx, base, w, theme);
}

function drawWallObsidian(ctx: CanvasRenderingContext2D, base: number, w: number, theme: StageTheme): void {
  for (let x = 0; x < w; x += 4) {
    ctx.fillStyle = (x / 4) % 2 === 0 ? theme.wallBase : theme.wallShade;
    ctx.fillRect(x, base + 2, 4, 6);
  }
  ctx.fillStyle = theme.wallAccent;
  for (let x = 0; x < w; x += 6) {
    ctx.fillRect(x + 1, base + 4, 1, 1);
  }
  drawCrenels(ctx, base, w, theme);
}

function drawWallIce(ctx: CanvasRenderingContext2D, base: number, w: number, theme: StageTheme): void {
  for (let x = 0; x < w; x += 6) {
    ctx.fillStyle = theme.wallBase;
    ctx.fillRect(x, base + 2, 6, 6);
    ctx.fillStyle = theme.wallTop;
    ctx.fillRect(x, base + 2, 1, 6);
    ctx.fillStyle = theme.wallAccent;
    ctx.fillRect(x + 2, base + 3, 1, 1);
  }
  ctx.fillStyle = theme.wallAccent;
  for (let x = 2; x < w; x += 8) {
    ctx.fillRect(x, base + 7, 1, 2);
  }
  drawCrenels(ctx, base, w, theme);
}

function drawWallVine(ctx: CanvasRenderingContext2D, base: number, w: number, theme: StageTheme): void {
  drawWallBrick(ctx, base, w, theme);
  ctx.fillStyle = theme.wallAccent;
  for (let x = 0; x < w; x += 10) {
    const off = (x * 3) % 4;
    ctx.fillRect(x + off, base + 3, 1, 4);
    ctx.fillRect(x + off + 1, base + 4, 1, 1);
  }
}

function drawWallSandstone(ctx: CanvasRenderingContext2D, base: number, w: number, theme: StageTheme): void {
  for (let row = 0; row < 2; row++) {
    const offset = (row % 2) * 8;
    for (let x = -offset; x < w; x += 16) {
      ctx.fillStyle = theme.wallBase;
      ctx.fillRect(x, base + 2 + row * 3, 16, 3);
      ctx.fillStyle = theme.wallShade;
      ctx.fillRect(x + 15, base + 2 + row * 3, 1, 3);
      ctx.fillStyle = theme.wallAccent;
      ctx.fillRect(x + 4, base + 3 + row * 3, 1, 1);
    }
  }
  drawCrenels(ctx, base, w, theme);
}

function drawWallReef(ctx: CanvasRenderingContext2D, base: number, w: number, theme: StageTheme): void {
  for (let x = 0; x < w; x += 4) {
    ctx.fillStyle = theme.wallBase;
    ctx.fillRect(x, base + 2, 4, 6);
    if (x % 8 === 0) {
      ctx.fillStyle = theme.wallAccent;
      ctx.fillRect(x + 1, base + 3, 2, 1);
    }
  }
  for (let x = 3; x < w; x += 9) {
    ctx.fillStyle = theme.wallTop;
    ctx.fillRect(x, base - 2, 2, 2);
  }
}

function drawWallBone(ctx: CanvasRenderingContext2D, base: number, w: number, theme: StageTheme): void {
  ctx.fillStyle = theme.wallBase;
  ctx.fillRect(0, base + 2, w, 6);
  for (let x = 0; x < w; x += 5) {
    ctx.fillStyle = theme.wallTop;
    ctx.fillRect(x + 1, base + 3, 3, 4);
    ctx.fillStyle = theme.wallShade;
    ctx.fillRect(x + 2, base + 4, 1, 2);
  }
  drawCrenels(ctx, base, w, theme);
}

function drawWallBloom(ctx: CanvasRenderingContext2D, base: number, w: number, theme: StageTheme): void {
  drawWallBrick(ctx, base, w, theme);
  ctx.fillStyle = theme.wallAccent;
  for (let x = 3; x < w; x += 14) {
    ctx.fillRect(x, base + 4, 2, 2);
    ctx.fillRect(x - 1, base + 5, 1, 1);
    ctx.fillRect(x + 2, base + 5, 1, 1);
  }
}

function drawWallMetal(ctx: CanvasRenderingContext2D, base: number, w: number, theme: StageTheme): void {
  ctx.fillStyle = theme.wallBase;
  ctx.fillRect(0, base + 2, w, 6);
  ctx.fillStyle = theme.wallTop;
  for (let x = 0; x < w; x += 2) {
    ctx.fillRect(x, base + 3, 1, 1);
  }
  ctx.fillStyle = theme.wallAccent;
  for (let x = 3; x < w; x += 10) {
    ctx.fillRect(x, base + 5, 1, 1);
  }
  for (let x = 0; x < w; x += 20) {
    ctx.fillStyle = theme.wallShade;
    ctx.fillRect(x, base + 2, 1, 6);
  }
  drawCrenels(ctx, base, w, theme);
}

function drawWallCursed(ctx: CanvasRenderingContext2D, base: number, w: number, theme: StageTheme): void {
  drawWallBrick(ctx, base, w, theme);
  ctx.fillStyle = theme.wallAccent;
  for (let x = 2; x < w; x += 7) {
    ctx.fillRect(x, base + 3 + ((x * 3) % 4), 1, 1);
  }
}

function drawWallStormsteel(ctx: CanvasRenderingContext2D, base: number, w: number, theme: StageTheme): void {
  for (let x = 0; x < w; x += 8) {
    ctx.fillStyle = theme.wallBase;
    ctx.fillRect(x, base + 2, 8, 6);
    ctx.fillStyle = theme.wallShade;
    ctx.fillRect(x + 7, base + 2, 1, 6);
    ctx.fillStyle = theme.wallAccent;
    ctx.fillRect(x + 3, base + 4, 1, 2);
  }
  drawCrenels(ctx, base, w, theme);
}

function drawWallMagma(ctx: CanvasRenderingContext2D, base: number, w: number, theme: StageTheme): void {
  ctx.fillStyle = theme.wallBase;
  ctx.fillRect(0, base + 2, w, 6);
  ctx.fillStyle = theme.wallAccent;
  for (let x = 0; x < w; x += 3) {
    const jitter = (x * 5) % 4 === 0 ? 1 : 0;
    ctx.fillRect(x, base + 2 + jitter, 2, 1);
  }
  ctx.fillStyle = theme.wallTop;
  for (let x = 0; x < w; x += 4) {
    ctx.fillRect(x, base + 4 + ((x * 3) % 2), 1, 1);
  }
  drawCrenels(ctx, base, w, theme);
}

function drawCrenels(ctx: CanvasRenderingContext2D, base: number, w: number, theme: StageTheme): void {
  for (let x = 0; x < w; x += 8) {
    const crenX = Math.floor(x);
    ctx.fillStyle = theme.wallTop;
    ctx.fillRect(crenX, base - 3, 4, 3);
    ctx.fillStyle = theme.wallBase;
    ctx.fillRect(crenX, base - 1, 4, 1);
  }
}

export function drawGroundBelow(
  ctx: CanvasRenderingContext2D,
  y: number,
  w: number,
  h: number,
  theme: StageTheme = DEFAULT_THEME,
): void {
  const grad = ctx.createLinearGradient(0, y, 0, y + h);
  grad.addColorStop(0, theme.groundTop);
  grad.addColorStop(1, theme.groundBot);
  ctx.fillStyle = grad;
  ctx.fillRect(0, y, w, h);
  ctx.fillStyle = theme.groundSpeckle;
  for (let i = 0; i < 10; i++) {
    ctx.fillRect((i * 23) % w, y + 2 + ((i * 5) % Math.max(1, h - 4)), 2, 1);
  }
}
