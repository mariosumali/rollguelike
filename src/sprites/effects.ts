import { palHex } from './palette';
import type { Element, Projectile, ProjectileArchetype, ProjectileShape } from '../types';

export const ELEMENT_COLORS: Record<Element, string> = {
  none: palHex('e')!,
  fire: palHex('u')!,
  ice: palHex('q')!,
  poison: palHex('z')!,
  lightning: palHex('y')!,
  arcane: palHex('H')!,
};

export const ELEMENT_GLOW: Record<Element, string> = {
  none: palHex('d')!,
  fire: palHex('v')!,
  ice: palHex('r')!,
  poison: palHex('m')!,
  lightning: palHex('x')!,
  arcane: palHex('I')!,
};

export function drawSpark(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, glow: string): void {
  ctx.fillStyle = glow;
  ctx.globalAlpha = 0.65;
  ctx.beginPath();
  ctx.arc(Math.round(x), Math.round(y), Math.max(1, r + 1), 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(Math.round(x), Math.round(y), Math.max(1, r - 0.5), 0, Math.PI * 2);
  ctx.fill();
}

export function drawRing(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, alpha: number): void {
  ctx.strokeStyle = color;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(Math.round(x), Math.round(y), Math.round(r), 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

export function drawPulseRing(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, progress: number, color: string): void {
  const alpha = 1 - progress;
  ctx.strokeStyle = color;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(Math.round(x), Math.round(y), Math.round(r), 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 1;
  ctx.globalAlpha = alpha * 0.6;
  ctx.beginPath();
  ctx.arc(Math.round(x), Math.round(y), Math.round(r - 3), 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

export function drawProjectile(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, element: Element, rotation = 0): void {
  const color = ELEMENT_COLORS[element];
  const glow = ELEMENT_GLOW[element];
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.rotate(rotation);
  ctx.fillStyle = glow;
  ctx.globalAlpha = 0.4;
  ctx.fillRect(-r - 1, -r - 1, r * 2 + 2, r * 2 + 2);
  ctx.globalAlpha = 1;
  ctx.fillStyle = color;
  ctx.fillRect(-r, -r, r * 2, r * 2);
  ctx.fillStyle = palHex('e')!;
  ctx.fillRect(-1, -r, 1, 1);
  ctx.fillRect(-r, -1, 1, 1);
  ctx.restore();
}

export function drawProjectileTrail(
  ctx: CanvasRenderingContext2D,
  trail: { x: number; y: number; a: number }[],
  element: Element,
  overrideGlow?: string,
): void {
  const glow = overrideGlow ?? ELEMENT_GLOW[element];
  for (let i = 0; i < trail.length; i++) {
    const p = trail[i]!;
    ctx.globalAlpha = p.a * 0.6;
    ctx.fillStyle = glow;
    ctx.fillRect(Math.round(p.x) - 1, Math.round(p.y) - 1, 2, 2);
  }
  ctx.globalAlpha = 1;
}

function resolveProjectileColors(p: Projectile, a: ProjectileArchetype): { color: string; glow: string; trail: string } {
  const useElement = (a.tintWithElement ?? false) && p.element !== 'none';
  const color = useElement ? ELEMENT_COLORS[p.element] : a.baseColor;
  const glow = useElement ? ELEMENT_GLOW[p.element] : a.glowColor;
  const trail = useElement ? ELEMENT_GLOW[p.element] : (a.trailColor ?? a.glowColor);
  return { color, glow, trail };
}

export function drawArchetypeProjectile(
  ctx: CanvasRenderingContext2D,
  p: Projectile,
  archetype: ProjectileArchetype,
): void {
  const r = p.radius;
  const { color, glow } = resolveProjectileColors(p, archetype);
  ctx.save();
  ctx.translate(Math.round(p.x), Math.round(p.y));
  ctx.rotate(p.rotation);
  drawShape(ctx, archetype.shape, r, color, glow);
  ctx.restore();
}

export function drawArchetypeProjectileTrail(
  ctx: CanvasRenderingContext2D,
  p: Projectile,
  archetype: ProjectileArchetype,
): void {
  const { trail } = resolveProjectileColors(p, archetype);
  drawProjectileTrail(ctx, p.trail, p.element, trail);
}

function drawShape(ctx: CanvasRenderingContext2D, shape: ProjectileShape, r: number, color: string, glow: string): void {
  switch (shape) {
    case 'bullet':
      drawBulletShape(ctx, r, color, glow);
      break;
    case 'chip':
      drawChipShape(ctx, r, color, glow);
      break;
    case 'flask':
      drawFlaskShape(ctx, r, color, glow);
      break;
    case 'bone':
      drawBoneShape(ctx, r, color, glow);
      break;
    case 'axe':
      drawAxeShape(ctx, r, color, glow);
      break;
    case 'gear':
      drawGearShape(ctx, r, color, glow);
      break;
  }
}

function drawBulletShape(ctx: CanvasRenderingContext2D, r: number, color: string, glow: string): void {
  ctx.fillStyle = glow;
  ctx.globalAlpha = 0.45;
  ctx.fillRect(-r - 2, -r - 1, r * 2 + 3, r * 2 + 2);
  ctx.globalAlpha = 1;
  ctx.fillStyle = color;
  ctx.fillRect(-r, -r, r * 2 + 1, r * 2);
  ctx.fillRect(r, -Math.max(1, r - 1), 1, Math.max(1, r * 2 - 2));
  ctx.fillStyle = palHex('e')!;
  ctx.globalAlpha = 0.55;
  ctx.fillRect(-r, -r, 1, r);
  ctx.globalAlpha = 1;
}

function drawChipShape(ctx: CanvasRenderingContext2D, r: number, color: string, glow: string): void {
  ctx.fillStyle = glow;
  ctx.globalAlpha = 0.45;
  ctx.beginPath();
  ctx.arc(0, 0, r + 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = palHex('1')!;
  ctx.fillRect(-1, -1, 1, 1);
  ctx.fillRect(0, 0, 1, 1);
  ctx.fillRect(-1, 0, 1, 1);
  ctx.fillRect(0, -1, 1, 1);
}

function drawFlaskShape(ctx: CanvasRenderingContext2D, r: number, color: string, glow: string): void {
  ctx.fillStyle = glow;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.arc(0, 0, r + 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = palHex('d')!;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, 0.5, Math.max(1, r - 1), 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = palHex('6')!;
  ctx.fillRect(-1, -r - 1, 2, 2);
  ctx.fillStyle = palHex('e')!;
  ctx.fillRect(-r + 1, -r + 1, 1, 1);
}

function drawBoneShape(ctx: CanvasRenderingContext2D, r: number, color: string, glow: string): void {
  ctx.fillStyle = glow;
  ctx.globalAlpha = 0.4;
  ctx.fillRect(-r - 2, -2, r * 2 + 4, 4);
  ctx.globalAlpha = 1;
  ctx.fillStyle = color;
  ctx.fillRect(-r, -1, r * 2, 2);
  ctx.fillRect(-r - 1, -2, 2, 4);
  ctx.fillRect(r - 1, -2, 2, 4);
  ctx.fillStyle = palHex('5')!;
  ctx.fillRect(-r, 0, 1, 1);
  ctx.fillRect(r - 1, 0, 1, 1);
}

function drawAxeShape(ctx: CanvasRenderingContext2D, r: number, color: string, glow: string): void {
  ctx.fillStyle = glow;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.arc(0, 0, r + 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = palHex('6')!;
  ctx.fillRect(-1, -r, 2, r * 2);
  ctx.fillStyle = color;
  ctx.fillRect(-r - 1, -2, r * 2 + 2, 4);
  ctx.fillStyle = palHex('e')!;
  ctx.fillRect(-r, -1, 1, 1);
  ctx.fillRect(r, 0, 1, 1);
}

function drawGearShape(ctx: CanvasRenderingContext2D, r: number, color: string, glow: string): void {
  ctx.fillStyle = glow;
  ctx.globalAlpha = 0.45;
  ctx.beginPath();
  ctx.arc(0, 0, r + 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = color;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const tx = Math.cos(a) * (r + 0.5);
    const ty = Math.sin(a) * (r + 0.5);
    ctx.fillRect(Math.round(tx) - 1, Math.round(ty) - 1, 2, 2);
  }
  ctx.beginPath();
  ctx.arc(0, 0, Math.max(1, r - 0.5), 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = palHex('1')!;
  ctx.beginPath();
  ctx.arc(0, 0, Math.max(1, r * 0.35), 0, Math.PI * 2);
  ctx.fill();
}

export function drawExplosion(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, progress: number, element: Element = 'none'): void {
  const base = ELEMENT_COLORS[element === 'none' ? 'fire' : element];
  const glow = ELEMENT_GLOW[element === 'none' ? 'fire' : element];
  const a = 1 - progress;
  ctx.globalAlpha = a * 0.8;
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(Math.round(x), Math.round(y), Math.round(r), 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = a;
  ctx.fillStyle = base;
  ctx.beginPath();
  ctx.arc(Math.round(x), Math.round(y), Math.round(r * 0.7), 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = a * 0.9;
  ctx.fillStyle = palHex('e')!;
  ctx.beginPath();
  ctx.arc(Math.round(x), Math.round(y), Math.round(r * 0.4), 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

export function drawShieldBubble(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, t: number, count: number): void {
  ctx.strokeStyle = palHex('q')!;
  ctx.globalAlpha = 0.9;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(Math.round(x), Math.round(y), Math.round(r), 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 0.55;
  ctx.strokeStyle = palHex('r')!;
  ctx.beginPath();
  ctx.arc(Math.round(x), Math.round(y), Math.round(r - 2), 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.fillStyle = palHex('r')!;
  for (let i = 0; i < count; i++) {
    const ang = t * 1.5 + (i * Math.PI * 2) / count;
    const px = x + Math.cos(ang) * r;
    const py = y + Math.sin(ang) * r;
    ctx.fillRect(Math.round(px) - 1, Math.round(py) - 1, 2, 2);
  }
}

export function drawSoulPickup(ctx: CanvasRenderingContext2D, x: number, y: number, t: number): void {
  const bob = Math.sin(t * 4) * 1.2;
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = palHex('H')!;
  ctx.beginPath();
  ctx.arc(Math.round(x), Math.round(y + bob), 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = palHex('w')!;
  ctx.fillRect(Math.round(x) - 1, Math.round(y + bob) - 2, 3, 4);
  ctx.fillRect(Math.round(x) - 2, Math.round(y + bob) - 1, 5, 2);
  ctx.fillStyle = palHex('I')!;
  ctx.fillRect(Math.round(x), Math.round(y + bob) - 1, 1, 1);
}

export function drawLightningBolt(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, alpha: number): void {
  ctx.save();
  ctx.strokeStyle = palHex('y')!;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  const nx = -dy / len;
  const ny = dx / len;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  const segs = 4;
  for (let i = 1; i < segs; i++) {
    const t = i / segs;
    const j = (Math.random() - 0.5) * 4;
    ctx.lineTo(x1 + dx * t + nx * j, y1 + dy * t + ny * j);
  }
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.lineWidth = 1;
  ctx.strokeStyle = palHex('e')!;
  ctx.stroke();
  ctx.restore();
}

export function drawPoisonCloud(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, t: number, alpha: number): void {
  ctx.save();
  ctx.globalAlpha = alpha * 0.5;
  ctx.fillStyle = palHex('z')!;
  for (let i = 0; i < 5; i++) {
    const ang = t * 0.8 + (i * Math.PI * 2) / 5;
    const px = x + Math.cos(ang) * (r * 0.5);
    const py = y + Math.sin(ang) * (r * 0.5);
    ctx.beginPath();
    ctx.arc(Math.round(px), Math.round(py), Math.round(r * 0.55), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

export function drawFreezeCrystal(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, alpha: number): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = palHex('r')!;
  ctx.fillRect(Math.round(x) - 1, Math.round(y - r), 2, r * 2);
  ctx.fillRect(Math.round(x - r), Math.round(y) - 1, r * 2, 2);
  ctx.fillRect(Math.round(x - r * 0.7), Math.round(y - r * 0.7), 1, 1);
  ctx.fillRect(Math.round(x + r * 0.7), Math.round(y + r * 0.7), 1, 1);
  ctx.fillRect(Math.round(x - r * 0.7), Math.round(y + r * 0.7), 1, 1);
  ctx.fillRect(Math.round(x + r * 0.7), Math.round(y - r * 0.7), 1, 1);
  ctx.fillStyle = palHex('D')!;
  ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
  ctx.restore();
}

export function drawMuzzleFlash(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, alpha: number, color: string): void {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.rotate(angle);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(-3, -2, 6, 4);
  ctx.fillRect(-5, -1, 10, 2);
  ctx.fillStyle = palHex('e')!;
  ctx.fillRect(-2, -1, 4, 2);
  ctx.restore();
  ctx.globalAlpha = 1;
}

export function drawHealParticle(ctx: CanvasRenderingContext2D, x: number, y: number, alpha: number): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = palHex('m')!;
  ctx.fillRect(Math.round(x) - 1, Math.round(y), 3, 1);
  ctx.fillRect(Math.round(x), Math.round(y) - 1, 1, 3);
  ctx.restore();
}

export function drawNumberPopup(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, alpha: number, color: string, size = 8): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = `${size}px 'Silkscreen', 'Courier New', monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = palHex('1')!;
  ctx.fillText(text, Math.round(x) + 1, Math.round(y) + 1);
  ctx.fillStyle = color;
  ctx.fillText(text, Math.round(x), Math.round(y));
  ctx.restore();
}

export function drawReactionPop(ctx: CanvasRenderingContext2D, x: number, y: number, progress: number, color: string): void {
  const r = 2 + progress * 14;
  const a = 1 - progress;
  ctx.save();
  ctx.globalAlpha = a * 0.5;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(Math.round(x), Math.round(y), Math.round(r), 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = a;
  ctx.strokeStyle = palHex('e')!;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(Math.round(x), Math.round(y), Math.round(r), 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}
