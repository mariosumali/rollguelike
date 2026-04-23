import { palHex } from '../../sprites/palette';
import type { MenuEngine, TorchPalette } from './types';

// ── Torch palettes ─────────────────────────────────────────────────────────

export const TORCH_FIRE: TorchPalette = {
  core: palHex('y')!,
  hot: palHex('v')!,
  mid: palHex('u')!,
  outer: palHex('t')!,
  ember: palHex('t')!,
  hotSpot: palHex('S')!,
};

export const TORCH_GHOST: TorchPalette = {
  core: palHex('r')!,
  hot: palHex('q')!,
  mid: palHex('D')!,
  outer: palHex('B')!,
  ember: palHex('B')!,
  hotSpot: palHex('S')!,
};

export const TORCH_CRYSTAL: TorchPalette = {
  core: palHex('I')!,
  hot: palHex('H')!,
  mid: palHex('w')!,
  outer: palHex('G')!,
  ember: palHex('G')!,
  hotSpot: palHex('S')!,
};

export const TORCH_EMERALD: TorchPalette = {
  core: palHex('n')!,
  hot: palHex('m')!,
  mid: palHex('z')!,
  outer: palHex('l')!,
  ember: palHex('l')!,
  hotSpot: palHex('S')!,
};

export const TORCH_MAGMA: TorchPalette = {
  core: palHex('y')!,
  hot: palHex('O')!,
  mid: palHex('u')!,
  outer: palHex('K')!,
  ember: palHex('K')!,
  hotSpot: palHex('S')!,
};

// ── Sky / moon / magic-circle helpers ──────────────────────────────────────

export function skyGradient(
  engine: MenuEngine,
  topK: string,
  midK: string,
  botK: string,
): void {
  const { ctx, W, H } = engine;
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, palHex(topK)!);
  grad.addColorStop(0.55, palHex(midK)!);
  grad.addColorStop(1, palHex(botK)!);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
}

export function drawMoon(
  engine: MenuEngine,
  cx: number,
  cy: number,
  r: number,
  glow = true,
  bodyKey: string = 'e',
  craterKey: string = 'd',
): void {
  const { ctx } = engine;
  if (glow) {
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = palHex(bodyKey)!;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.28;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = palHex(bodyKey)!;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = palHex(craterKey)!;
  ctx.fillRect(cx - Math.round(r * 0.4), cy - Math.round(r * 0.3), 2, 2);
  ctx.fillRect(cx + Math.round(r * 0.1), cy + Math.round(r * 0.2), 2, 2);
  ctx.fillRect(cx - Math.round(r * 0.1), cy - Math.round(r * 0.1), 1, 1);
}

export function drawMagicCircle(engine: MenuEngine, t: number, color: string): void {
  const { ctx, W } = engine;
  const cx = W / 2;
  const ry = 238;
  ctx.save();
  const pulse = 0.25 + 0.15 * Math.sin(t * 2.5);
  ctx.globalAlpha = pulse;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(cx, ry + 4, 34, 7, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = pulse * 0.6;
  ctx.beginPath();
  ctx.ellipse(cx, ry + 4, 30, 5.5, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.45;
  ctx.fillStyle = color;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + t * 0.4;
    const px = Math.round(cx + Math.cos(a) * 30);
    const py = Math.round(ry + 4 + Math.sin(a) * 6);
    ctx.fillRect(px - 1, py, 2, 1);
    ctx.fillRect(px, py - 1, 1, 2);
  }
  ctx.restore();
}

// ── Shared drifting-particle system ────────────────────────────────────────

export interface Drifter {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  sway: number;
  phase: number;
  wrap: 'top' | 'bottom' | 'off';
}

export interface DriftConfig {
  count: number;
  bounds: { x0: number; x1: number; y0: number; y1: number };
  vx: [number, number];
  vy: [number, number];
  size: [number, number];
  colors: string[];
  alpha: [number, number];
  sway?: number;
  wrap?: 'top' | 'bottom' | 'off';
}

export function createDrifters(cfg: DriftConfig): Drifter[] {
  const list: Drifter[] = [];
  const range = ([a, b]: [number, number]) => a + Math.random() * (b - a);
  for (let i = 0; i < cfg.count; i++) {
    list.push({
      x: cfg.bounds.x0 + Math.random() * (cfg.bounds.x1 - cfg.bounds.x0),
      y: cfg.bounds.y0 + Math.random() * (cfg.bounds.y1 - cfg.bounds.y0),
      vx: range(cfg.vx),
      vy: range(cfg.vy),
      size: Math.round(range(cfg.size)),
      color: cfg.colors[Math.floor(Math.random() * cfg.colors.length)]!,
      alpha: range(cfg.alpha),
      sway: cfg.sway ?? 0,
      phase: Math.random() * Math.PI * 2,
      wrap: cfg.wrap ?? 'top',
    });
  }
  return list;
}

export function updateAndDrawDrift(
  engine: MenuEngine,
  drifters: Drifter[],
  t: number,
  dt: number,
  bounds: { x0: number; x1: number; y0: number; y1: number },
): void {
  const { ctx } = engine;
  const step = Math.min(2.5, dt * 60);
  ctx.save();
  for (const d of drifters) {
    d.x += d.vx * step + (d.sway ? Math.sin(t * 0.8 + d.phase) * d.sway * 0.25 : 0);
    d.y += d.vy * step;
    if (d.y > bounds.y1) {
      if (d.wrap === 'off') continue;
      d.y = d.wrap === 'top' ? bounds.y0 : bounds.y1;
      d.x = bounds.x0 + Math.random() * (bounds.x1 - bounds.x0);
    }
    if (d.y < bounds.y0) d.y = bounds.y1;
    if (d.x < bounds.x0 - 4) d.x = bounds.x1;
    if (d.x > bounds.x1 + 4) d.x = bounds.x0;
    ctx.globalAlpha = d.alpha;
    ctx.fillStyle = d.color;
    ctx.fillRect(Math.round(d.x), Math.round(d.y), d.size, d.size);
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

// ── Torch rendering (shared across all themes) ─────────────────────────────

export function drawTorch(
  engine: MenuEngine,
  pal: TorchPalette,
  tx: number,
  ty: number,
  t: number,
  seed: number,
): void {
  const { ctx } = engine;
  const cx = tx + 1;
  const fy = ty - 2;

  ctx.fillStyle = palHex('5')!;
  ctx.fillRect(tx - 1, ty - 1, 4, 4);
  ctx.fillStyle = palHex('6')!;
  ctx.fillRect(tx - 1, ty - 1, 4, 1);
  ctx.fillStyle = palHex('0')!;
  ctx.fillRect(tx - 1, ty + 3, 4, 1);

  const coalPulse = 0.5 + 0.5 * Math.sin(t * 4 + seed * 2);
  ctx.fillStyle = pal.ember;
  ctx.fillRect(tx, ty, 2, 1);
  if (coalPulse > 0.55) {
    ctx.fillStyle = pal.mid;
    ctx.fillRect(tx + (coalPulse > 0.8 ? 0 : 1), ty, 1, 1);
  }

  const flickA = Math.sin(t * 9 + seed) * 0.5 + Math.sin(t * 17 + seed * 2) * 0.3;
  const flickB =
    Math.sin(t * 6.5 + seed * 1.7) * 0.5 + Math.sin(t * 13 + seed * 2.4) * 0.3;
  const sway =
    Math.sin(t * 3 + seed) * 0.45 + Math.sin(t * 7.3 + seed * 1.2) * 0.3;

  const flameH = 14 + Math.round(flickA * 2.5);
  const baseW = 7;

  const glowA = 0.14 + 0.05 * Math.sin(t * 5 + seed);
  ctx.save();
  ctx.globalAlpha = Math.max(0, glowA);
  ctx.fillStyle = pal.mid;
  ctx.beginPath();
  ctx.arc(cx, fy - flameH * 0.55, flameH * 0.95 + flickA, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = Math.max(0, glowA * 1.4);
  ctx.fillStyle = pal.core;
  ctx.beginPath();
  ctx.arc(cx, fy - flameH * 0.5, flameH * 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const layer = (
    color: string,
    widthAtMid: number,
    height: number,
    yOffset: number,
    swayAmt: number,
    jitter: number,
  ) => {
    if (height <= 0) return;
    ctx.fillStyle = color;
    const denom = Math.max(1, height - 1);
    for (let i = 0; i < height; i++) {
      const prog = i / denom;
      const shape =
        Math.sin((1 - prog) * Math.PI * 0.65 + 0.18) *
        (1 - Math.pow(prog, 1.8) * 0.9);
      const wob = Math.sin(t * 8.5 + seed * 2.1 + i * 0.55) * jitter;
      const rowW = Math.max(1, Math.round(widthAtMid * shape + wob));
      const rowCx =
        cx +
        Math.round(sway * swayAmt * prog) +
        Math.round(Math.sin(t * 6 + seed + i * 0.35) * 0.35 * prog);
      const py = Math.round(fy - i + yOffset);
      const px = Math.round(rowCx - rowW / 2);
      ctx.fillRect(px, py, rowW, 1);
    }
  };

  layer(pal.outer, baseW, flameH, 0, 0.9, 0.4);
  layer(pal.mid, baseW - 2, flameH - 2, -1, 0.7, 0.35);
  layer(pal.hot, Math.max(2, baseW - 4), flameH - 4, -2, 0.5, 0.25);
  layer(pal.core, Math.max(1, baseW - 5), Math.max(3, flameH - 7), -3, 0.35, 0.15);

  const hotH = 2 + Math.round(Math.abs(flickB) * 1.5);
  ctx.fillStyle = pal.hotSpot;
  ctx.fillRect(cx, fy - 3 - hotH, 1, hotH);

  const lickR = Math.sin(t * 11 + seed * 2.7);
  const lickL = Math.sin(t * 9.5 + seed * 3.3);
  if (lickR > 0.55) {
    const ly = fy - Math.round(flameH * (0.3 + 0.2 * lickR));
    ctx.fillStyle = pal.mid;
    ctx.fillRect(cx + 3, ly, 1, 1);
    ctx.fillStyle = pal.hot;
    ctx.fillRect(cx + 2, ly, 1, 1);
  }
  if (lickL > 0.55) {
    const ly = fy - Math.round(flameH * (0.35 + 0.2 * lickL));
    ctx.fillStyle = pal.mid;
    ctx.fillRect(cx - 3, ly, 1, 1);
    ctx.fillStyle = pal.hot;
    ctx.fillRect(cx - 2, ly, 1, 1);
  }

  if (Math.sin(t * 13 + seed * 4) > 0.1) {
    const gap = 1 + Math.round(Math.abs(Math.sin(t * 5 + seed)));
    const tcx = cx + Math.round(sway * 1.2);
    ctx.fillStyle = pal.hot;
    ctx.fillRect(tcx, fy - flameH - gap, 1, 1);
    if (Math.sin(t * 17 + seed * 5) > 0) {
      ctx.fillStyle = pal.core;
      ctx.fillRect(tcx, fy - flameH - gap - 1, 1, 1);
    }
  }

  if (Math.random() < 0.28) {
    const r = Math.random();
    const c =
      r < 0.22
        ? pal.core
        : r < 0.55
          ? pal.hot
          : r < 0.92
            ? pal.mid
            : pal.hotSpot;
    engine.spawnEmber(
      cx + (Math.random() - 0.5) * 3,
      fy - flameH + 1 + (Math.random() - 0.5) * 2,
      c,
    );
  }
}
