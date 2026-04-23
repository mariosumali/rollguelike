import { palHex } from './palette';

export function drawArenaBackground(ctx: CanvasRenderingContext2D, w: number, top: number, h: number, time: number): void {
  const grad = ctx.createLinearGradient(0, top, 0, top + h);
  grad.addColorStop(0, palHex('2')!);
  grad.addColorStop(0.6, palHex('1')!);
  grad.addColorStop(1, palHex('0')!);
  ctx.fillStyle = grad;
  ctx.fillRect(0, top, w, h);

  ctx.fillStyle = palHex('3')!;
  for (let i = 0; i < 30; i++) {
    const sx = (i * 37 + (time * 2) % 97) % w;
    const sy = (i * 53 + ((time * 6) | 0)) % h;
    ctx.globalAlpha = 0.25 + ((i * 7) % 10) / 20;
    ctx.fillRect(sx, top + sy, 1, 1);
  }
  ctx.globalAlpha = 1;

  for (let i = 0; i < 6; i++) {
    ctx.globalAlpha = 0.05 + ((i * 9) % 8) / 100;
    const sx = ((i * 41 + time * 4) % (w + 40)) - 20;
    const sy = top + ((i * 67 + time * 8) % h);
    ctx.fillStyle = palHex('4')!;
    ctx.fillRect(sx, sy, 3, 3);
  }
  ctx.globalAlpha = 1;
}

export function drawWall(ctx: CanvasRenderingContext2D, y: number, w: number): void {
  const base = y - 6;
  ctx.fillStyle = palHex('5')!;
  ctx.fillRect(0, base, w, 8);
  ctx.fillStyle = palHex('6')!;
  ctx.fillRect(0, base, w, 2);
  const brickW = 12;
  const brickH = 4;
  for (let row = 0; row < 2; row++) {
    const offset = (row % 2) * (brickW / 2);
    for (let x = -offset; x < w; x += brickW) {
      ctx.fillStyle = palHex('5')!;
      ctx.fillRect(x + brickW - 1, base + row * brickH, 1, brickH);
      ctx.fillStyle = palHex('0')!;
      ctx.fillRect(x, base + brickH - 1 + row * brickH, brickW, 1);
    }
  }
  for (let x = 0; x < w; x += 8) {
    const crenX = Math.floor(x);
    ctx.fillStyle = palHex('6')!;
    ctx.fillRect(crenX, base - 3, 4, 3);
    ctx.fillStyle = palHex('5')!;
    ctx.fillRect(crenX, base - 1, 4, 1);
  }
  ctx.fillStyle = palHex('0')!;
  ctx.fillRect(0, base + 7, w, 1);
}

export function drawGroundBelow(ctx: CanvasRenderingContext2D, y: number, w: number, h: number): void {
  const grad = ctx.createLinearGradient(0, y, 0, y + h);
  grad.addColorStop(0, palHex('1')!);
  grad.addColorStop(1, palHex('0')!);
  ctx.fillStyle = grad;
  ctx.fillRect(0, y, w, h);
  ctx.fillStyle = palHex('2')!;
  for (let i = 0; i < 8; i++) {
    ctx.fillRect((i * 23) % w, y + 2 + ((i * 5) % 6), 2, 1);
  }
}
