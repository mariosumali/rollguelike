import { palHex } from './palette';

const DIE_SIZE = 22;

export interface DieSpriteSet {
  faces: HTMLCanvasElement[];
  shake: HTMLCanvasElement[];
  size: number;
}

interface DieTheme {
  body: string;
  highlight: string;
  shadow: string;
  pip: string;
  pipHl: string;
  outline: string;
}

export const DIE_THEMES: Record<string, DieTheme> = {
  ivory: {
    body: palHex('e')!,
    highlight: palHex('d')!,
    shadow: palHex('b')!,
    pip: palHex('2')!,
    pipHl: palHex('a')!,
    outline: palHex('1')!,
  },
  crimson: {
    body: palHex('h')!,
    highlight: palHex('i')!,
    shadow: palHex('g')!,
    pip: palHex('e')!,
    pipHl: palHex('d')!,
    outline: palHex('f')!,
  },
  obsidian: {
    body: palHex('3')!,
    highlight: palHex('4')!,
    shadow: palHex('1')!,
    pip: palHex('x')!,
    pipHl: palHex('v')!,
    outline: palHex('0')!,
  },
  bone: {
    body: palHex('9')!,
    highlight: palHex('e')!,
    shadow: palHex('7')!,
    pip: palHex('J')!,
    pipHl: palHex('K')!,
    outline: palHex('5')!,
  },
  brass: {
    body: palHex('8')!,
    highlight: palHex('v')!,
    shadow: palHex('7')!,
    pip: palHex('2')!,
    pipHl: palHex('5')!,
    outline: palHex('5')!,
  },
  emerald: {
    body: palHex('m')!,
    highlight: palHex('n')!,
    shadow: palHex('l')!,
    pip: palHex('1')!,
    pipHl: palHex('T')!,
    outline: palHex('T')!,
  },
  ember: {
    body: palHex('u')!,
    highlight: palHex('v')!,
    shadow: palHex('t')!,
    pip: palHex('1')!,
    pipHl: palHex('s')!,
    outline: palHex('s')!,
  },
  frost: {
    body: palHex('q')!,
    highlight: palHex('r')!,
    shadow: palHex('p')!,
    pip: palHex('1')!,
    pipHl: palHex('A')!,
    outline: palHex('o')!,
  },
  arcane: {
    body: palHex('H')!,
    highlight: palHex('I')!,
    shadow: palHex('G')!,
    pip: palHex('E')!,
    pipHl: palHex('F')!,
    outline: palHex('E')!,
  },
  gold: {
    body: palHex('y')!,
    highlight: palHex('e')!,
    shadow: palHex('x')!,
    pip: palHex('5')!,
    pipHl: palHex('s')!,
    outline: palHex('s')!,
  },
};

const PIP_POSITIONS: Record<number, Array<[number, number]>> = {
  1: [[0.5, 0.5]],
  2: [
    [0.28, 0.28],
    [0.72, 0.72],
  ],
  3: [
    [0.26, 0.26],
    [0.5, 0.5],
    [0.74, 0.74],
  ],
  4: [
    [0.28, 0.28],
    [0.72, 0.28],
    [0.28, 0.72],
    [0.72, 0.72],
  ],
  5: [
    [0.26, 0.26],
    [0.74, 0.26],
    [0.5, 0.5],
    [0.26, 0.74],
    [0.74, 0.74],
  ],
  6: [
    [0.27, 0.22],
    [0.27, 0.5],
    [0.27, 0.78],
    [0.73, 0.22],
    [0.73, 0.5],
    [0.73, 0.78],
  ],
};

function drawDieBody(ctx: CanvasRenderingContext2D, size: number, theme: DieTheme, tumble = 0): void {
  const s = size;
  const o = theme.outline;
  const b = theme.body;
  const h = theme.highlight;
  const sh = theme.shadow;

  ctx.fillStyle = b;
  ctx.fillRect(2, 2, s - 4, s - 4);
  ctx.fillRect(1, 3, s - 2, s - 6);
  ctx.fillRect(3, 1, s - 6, s - 2);

  ctx.fillStyle = o;
  ctx.fillRect(4, 0, s - 8, 1);
  ctx.fillRect(4, s - 1, s - 8, 1);
  ctx.fillRect(0, 4, 1, s - 8);
  ctx.fillRect(s - 1, 4, 1, s - 8);
  ctx.fillRect(2, 1, 2, 1);
  ctx.fillRect(s - 4, 1, 2, 1);
  ctx.fillRect(1, 2, 1, 2);
  ctx.fillRect(s - 2, 2, 1, 2);
  ctx.fillRect(2, s - 2, 2, 1);
  ctx.fillRect(s - 4, s - 2, 2, 1);
  ctx.fillRect(1, s - 4, 1, 2);
  ctx.fillRect(s - 2, s - 4, 1, 2);

  ctx.fillStyle = h;
  ctx.fillRect(3, 2, s - 10, 1);
  ctx.fillRect(2, 3, 1, s - 10);
  ctx.fillRect(4, 1, s - 12, 1);

  ctx.fillStyle = sh;
  ctx.fillRect(7, s - 3, s - 10, 1);
  ctx.fillRect(s - 3, 7, 1, s - 10);
  ctx.fillRect(8, s - 2, s - 12, 1);

  if (tumble !== 0) {
    ctx.fillStyle = h;
    const bandY = 4 + (tumble % 3);
    ctx.fillRect(3, bandY, s - 6, 1);
  }
}

function drawPips(ctx: CanvasRenderingContext2D, size: number, value: number, theme: DieTheme): void {
  const positions = PIP_POSITIONS[value];
  if (!positions) return;
  for (const [fx, fy] of positions) {
    const cx = Math.round(fx * size);
    const cy = Math.round(fy * size);
    ctx.fillStyle = theme.pip;
    ctx.fillRect(cx - 1, cy - 2, 3, 1);
    ctx.fillRect(cx - 2, cy - 1, 5, 3);
    ctx.fillRect(cx - 1, cy + 2, 3, 1);
    ctx.fillStyle = theme.pipHl;
    ctx.fillRect(cx - 1, cy - 1, 1, 1);
  }
}

export function buildDieSpriteSet(theme: DieTheme = DIE_THEMES.ivory!): DieSpriteSet {
  const size = DIE_SIZE;
  const faces: HTMLCanvasElement[] = [];
  for (let v = 1; v <= 6; v++) {
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const ctx = c.getContext('2d')!;
    drawDieBody(ctx, size, theme);
    drawPips(ctx, size, v, theme);
    faces.push(c);
  }
  const shake: HTMLCanvasElement[] = [];
  for (let i = 0; i < 6; i++) {
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const ctx = c.getContext('2d')!;
    drawDieBody(ctx, size, theme, i + 1);
    const fakeVal = (i % 6) + 1;
    ctx.globalAlpha = 0.35;
    drawPips(ctx, size, fakeVal, theme);
    ctx.globalAlpha = 1;
    shake.push(c);
  }
  return { faces, shake, size };
}

export function drawDie(
  ctx: CanvasRenderingContext2D,
  set: DieSpriteSet,
  value: number,
  x: number,
  y: number,
  shaking: boolean,
  shakeFrame: number,
  wobble = 0,
): void {
  const img = shaking ? set.shake[shakeFrame % set.shake.length]! : set.faces[Math.max(0, Math.min(5, value - 1))]!;
  const ox = Math.round(x - set.size / 2) + (shaking ? Math.round(Math.sin(wobble * 30) * 1) : 0);
  const oy = Math.round(y - set.size / 2) + (shaking ? Math.round(Math.cos(wobble * 25) * 1) : 0);
  ctx.drawImage(img, ox, oy);
}
