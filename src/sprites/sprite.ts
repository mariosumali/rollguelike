import { palHex } from './palette';

export interface SpriteFrame {
  rows: string[];
  w: number;
  h: number;
  canvas: HTMLCanvasElement;
  anchorX: number;
  anchorY: number;
}

export interface Sprite {
  id: string;
  frames: SpriteFrame[];
  anim: Record<string, Animation>;
}

export interface Animation {
  name: string;
  frames: number[];
  frameDuration: number;
  loop: boolean;
  pingPong?: boolean;
}

export interface SpriteDef {
  id: string;
  frames: string[][];
  anim?: Record<string, Animation>;
  anchor?: 'center' | 'bottom' | 'top';
}

const registry = new Map<string, Sprite>();

export function defineSprite(def: SpriteDef): void {
  const frames: SpriteFrame[] = def.frames.map((rows) => buildFrame(rows, def.anchor ?? 'center'));
  registry.set(def.id, {
    id: def.id,
    frames,
    anim: def.anim ?? {
      default: { name: 'default', frames: def.frames.map((_, i) => i), frameDuration: 0.2, loop: true },
    },
  });
}

export function getSprite(id: string): Sprite | undefined {
  return registry.get(id);
}

export function hasSprite(id: string): boolean {
  return registry.has(id);
}

/**
 * Rasterize a palette-row icon into a standalone canvas.
 * Useful for producing die-face overlays without going through the full sprite registry.
 */
export function buildPaletteCanvas(rows: string[]): HTMLCanvasElement {
  if (rows.length === 0) {
    const empty = document.createElement('canvas');
    empty.width = 1;
    empty.height = 1;
    return empty;
  }
  return buildFrame(rows, 'center').canvas;
}

function buildFrame(rows: string[], anchor: 'center' | 'bottom' | 'top'): SpriteFrame {
  const h = rows.length;
  const w = Math.max(...rows.map((r) => r.length));
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d', { willReadFrequently: false })!;
  const img = ctx.createImageData(w, h);
  for (let y = 0; y < h; y++) {
    const row = rows[y] ?? '';
    for (let x = 0; x < w; x++) {
      const ch = row[x] ?? '.';
      const hex = palHex(ch);
      const i = (y * w + x) * 4;
      if (hex === null) {
        img.data[i + 3] = 0;
      } else {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        img.data[i] = r;
        img.data[i + 1] = g;
        img.data[i + 2] = b;
        img.data[i + 3] = 255;
      }
    }
  }
  ctx.putImageData(img, 0, 0);
  const ax = Math.floor(w / 2);
  const ay = anchor === 'bottom' ? h : anchor === 'top' ? 0 : Math.floor(h / 2);
  return { rows, w, h, canvas: c, anchorX: ax, anchorY: ay };
}

export function drawSprite(
  ctx: CanvasRenderingContext2D,
  sprite: Sprite,
  frameIdx: number,
  x: number,
  y: number,
  flipX = false,
  tint?: string,
  tintAlpha = 0,
): void {
  if (!sprite || !sprite.frames || sprite.frames.length === 0) return;
  const f = sprite.frames[((frameIdx % sprite.frames.length) + sprite.frames.length) % sprite.frames.length]!;
  const dx = Math.round(x - f.anchorX);
  const dy = Math.round(y - f.anchorY);
  if (flipX) {
    ctx.save();
    ctx.translate(dx + f.w, dy);
    ctx.scale(-1, 1);
    ctx.drawImage(f.canvas, 0, 0);
    ctx.restore();
  } else {
    ctx.drawImage(f.canvas, dx, dy);
  }
  if (tint && tintAlpha > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'source-atop';
    ctx.globalAlpha = tintAlpha;
    ctx.fillStyle = tint;
    if (flipX) {
      ctx.translate(dx + f.w, dy);
      ctx.scale(-1, 1);
      ctx.fillRect(0, 0, f.w, f.h);
    } else {
      ctx.fillRect(dx, dy, f.w, f.h);
    }
    ctx.restore();
  }
}

export function drawSpriteSilhouette(
  ctx: CanvasRenderingContext2D,
  sprite: Sprite,
  frameIdx: number,
  x: number,
  y: number,
  color: string,
  alpha = 1,
): void {
  if (!sprite || !sprite.frames || sprite.frames.length === 0) return;
  const f = sprite.frames[((frameIdx % sprite.frames.length) + sprite.frames.length) % sprite.frames.length]!;
  const dx = Math.round(x - f.anchorX);
  const dy = Math.round(y - f.anchorY);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.drawImage(f.canvas, dx, dy);
  ctx.globalCompositeOperation = 'source-atop';
  ctx.fillStyle = color;
  ctx.fillRect(dx, dy, f.w, f.h);
  ctx.restore();
}
