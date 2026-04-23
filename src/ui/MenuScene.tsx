import { useEffect, useRef } from 'react';
import { initSprites } from '../sprites';
import { getSprite, drawSprite } from '../sprites/sprite';
import { buildDieSpriteSet, DIE_THEMES, type DieSpriteSet } from '../sprites/dice';
import { palHex } from '../sprites/palette';

const W = 180;
const H = 280;

interface Ember {
  x: number;
  y: number;
  vy: number;
  vx: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface Star {
  x: number;
  y: number;
  phase: number;
  bright: number;
}

export function MenuScene() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    initSprites();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    const dieSet: DieSpriteSet = buildDieSpriteSet(DIE_THEMES.ivory!);
    const dieSetAlt: DieSpriteSet = buildDieSpriteSet(DIE_THEMES.crimson!);

    const embers: Ember[] = [];
    const stars: Star[] = [];
    const starRng = () => Math.random();
    for (let i = 0; i < 28; i++) {
      stars.push({
        x: Math.floor(starRng() * W),
        y: Math.floor(starRng() * (H * 0.5)),
        phase: starRng() * Math.PI * 2,
        bright: 0.35 + starRng() * 0.65,
      });
    }

    let raf = 0;
    let start = performance.now();
    let last = start;

    function spawnEmber(tx: number, ty: number, color: string) {
      embers.push({
        x: tx + (Math.random() - 0.5) * 3,
        y: ty,
        vy: -(0.35 + Math.random() * 0.45),
        vx: (Math.random() - 0.5) * 0.25,
        life: 0,
        maxLife: 45 + Math.random() * 35,
        color,
        size: Math.random() < 0.85 ? 1 : 2,
      });
    }

    function drawBackdrop(t: number) {
      const skyTop = palHex('E')!;
      const skyMid = palHex('2')!;
      const skyBot = palHex('0')!;
      const grad = ctx!.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, skyTop);
      grad.addColorStop(0.55, skyMid);
      grad.addColorStop(1, skyBot);
      ctx!.fillStyle = grad;
      ctx!.fillRect(0, 0, W, H);

      for (const s of stars) {
        const tw = 0.5 + 0.5 * Math.sin(t * 2 + s.phase);
        const a = s.bright * tw;
        ctx!.fillStyle = `rgba(230, 220, 255, ${a.toFixed(3)})`;
        ctx!.fillRect(s.x, s.y, 1, 1);
        if (a > 0.85) {
          ctx!.fillRect(s.x - 1, s.y, 1, 1);
          ctx!.fillRect(s.x + 1, s.y, 1, 1);
          ctx!.fillRect(s.x, s.y - 1, 1, 1);
          ctx!.fillRect(s.x, s.y + 1, 1, 1);
        }
      }

      ctx!.fillStyle = 'rgba(106, 46, 170, 0.18)';
      ctx!.beginPath();
      ctx!.arc(W / 2, 70, 58, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.fillStyle = 'rgba(183, 122, 255, 0.10)';
      ctx!.beginPath();
      ctx!.arc(W / 2, 70, 34, 0, Math.PI * 2);
      ctx!.fill();
    }

    function drawDistantWall() {
      const wallTop = 95;
      const wallBot = 170;
      ctx!.fillStyle = palHex('1')!;
      ctx!.fillRect(0, wallTop, W, wallBot - wallTop);

      ctx!.fillStyle = palHex('2')!;
      for (let x = 0; x < W; x += 16) {
        for (let y = wallTop; y < wallBot; y += 8) {
          const o = ((y / 8) & 1) * 8;
          ctx!.fillRect(x + o, y, 15, 1);
        }
      }

      const arches = [24, 62, W - 62 - 16, W - 24 - 16];
      for (const ax of arches) {
        ctx!.fillStyle = palHex('0')!;
        ctx!.fillRect(ax, wallTop + 8, 10, 18);
        ctx!.fillRect(ax + 1, wallTop + 6, 8, 2);
        ctx!.fillStyle = 'rgba(255, 165, 75, 0.10)';
        ctx!.fillRect(ax + 2, wallTop + 10, 6, 14);
      }
    }

    function drawPillars() {
      const ys = 155;
      const ye = 230;
      for (const px of [14, W - 14 - 10]) {
        ctx!.fillStyle = palHex('a')!;
        ctx!.fillRect(px, ys, 10, ye - ys);
        ctx!.fillStyle = palHex('b')!;
        ctx!.fillRect(px + 1, ys, 1, ye - ys);
        ctx!.fillStyle = palHex('4')!;
        ctx!.fillRect(px + 8, ys + 1, 2, ye - ys - 1);
        ctx!.fillStyle = palHex('c')!;
        ctx!.fillRect(px - 1, ys - 3, 12, 3);
        ctx!.fillStyle = palHex('b')!;
        ctx!.fillRect(px - 1, ye - 3, 12, 3);
        ctx!.fillStyle = palHex('a')!;
        ctx!.fillRect(px - 1, ye - 1, 12, 1);
      }
    }

    function drawTorch(tx: number, ty: number, t: number, seed: number) {
      ctx!.fillStyle = palHex('5')!;
      ctx!.fillRect(tx - 1, ty - 1, 4, 4);
      ctx!.fillStyle = palHex('6')!;
      ctx!.fillRect(tx, ty - 1, 2, 1);

      const flick = Math.sin(t * 9 + seed) * 0.5 + Math.sin(t * 17 + seed * 2) * 0.3;
      const h = 7 + Math.max(0, Math.round(flick * 2));
      const w = 4 + Math.max(0, Math.round(Math.sin(t * 12 + seed) * 0.5));
      const cx = tx + 1;
      const fy = ty - 2;

      // ctx!.fillStyle = 'rgba(255, 122, 43, 0.25)';
      // ctx!.beginPath();
      // ctx!.arc(cx, fy - 2, 22 + flick * 2, 0, Math.PI * 2);
      // ctx!.fill();

      ctx!.fillStyle = palHex('t')!;
      ctx!.fillRect(cx - Math.floor(w / 2), fy - h + 2, w, h - 2);
      ctx!.fillStyle = palHex('u')!;
      ctx!.fillRect(cx - Math.floor((w - 1) / 2), fy - h + 3, Math.max(1, w - 1), h - 4);
      ctx!.fillStyle = palHex('v')!;
      ctx!.fillRect(cx, fy - h + 4, 1, Math.max(1, h - 6));
      ctx!.fillStyle = palHex('y')!;
      ctx!.fillRect(cx, fy - h + 5, 1, 1);

      if (Math.random() < 0.12) {
        const cIdx = Math.random();
        const c = cIdx < 0.45 ? palHex('y')! : cIdx < 0.85 ? palHex('v')! : palHex('u')!;
        spawnEmber(cx + (Math.random() - 0.5) * 2, fy - h + 3, c);
      }
    }

    function drawFloor(t: number) {
      const y0 = 228;
      const floorBg = palHex('1')!;
      ctx!.fillStyle = floorBg;
      ctx!.fillRect(0, y0, W, H - y0);

      const brickA = palHex('5')!;
      const brickB = palHex('6')!;
      const mortar = palHex('0')!;
      for (let y = y0; y < H; y += 6) {
        const row = Math.floor((y - y0) / 6);
        const offset = (row & 1) * 7;
        for (let x = -offset; x < W; x += 14) {
          ctx!.fillStyle = row & 1 ? brickA : brickB;
          ctx!.fillRect(x, y, 13, 5);
          ctx!.fillStyle = mortar;
          ctx!.fillRect(x + 13, y, 1, 5);
          ctx!.fillRect(x, y + 5, 14, 1);
        }
      }

      const cx = W / 2;
      const ry = 238;
      ctx!.save();
      const pulse = 0.25 + 0.15 * Math.sin(t * 2.5);
      ctx!.globalAlpha = pulse;
      ctx!.strokeStyle = palHex('H')!;
      ctx!.lineWidth = 1;
      ctx!.beginPath();
      ctx!.ellipse(cx, ry + 4, 34, 7, 0, 0, Math.PI * 2);
      ctx!.stroke();
      ctx!.globalAlpha = pulse * 0.6;
      ctx!.beginPath();
      ctx!.ellipse(cx, ry + 4, 30, 5.5, 0, 0, Math.PI * 2);
      ctx!.stroke();
      ctx!.restore();

      ctx!.fillStyle = 'rgba(183, 122, 255, 0.35)';
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + t * 0.4;
        const px = Math.round(cx + Math.cos(a) * 30);
        const py = Math.round(ry + 4 + Math.sin(a) * 6);
        ctx!.fillRect(px - 1, py, 2, 1);
        ctx!.fillRect(px, py - 1, 1, 2);
      }
    }

    function drawBigDie(t: number) {
      const cx = W / 2;
      const bob = Math.sin(t * 1.2) * 2;
      const cy = 34 + bob;

      const scale = 1.5;
      const size = dieSet.size;
      const drawW = size * scale;
      const drawH = size * scale;

      const cycleT = t % 8;
      const isRolling = cycleT > 5.5 && cycleT < 7.5;
      const rollProgress = (cycleT - 5.5) / 2;

      let face: number;
      let shaking = false;
      let shakeFrame = 0;
      let wobble = 0;

      if (isRolling) {
        shaking = true;
        shakeFrame = Math.floor(t * 12) % dieSet.shake.length;
        wobble = t * 4;
        face = 1;
      } else {
        const stableT = cycleT < 5.5 ? cycleT : cycleT - 7.5 + 5.5;
        face = 1 + Math.floor(stableT / 0.9) % 6;
      }

      const themeSet = isRolling && rollProgress > 0.5 && Math.floor(t * 2) & 1 ? dieSetAlt : dieSet;

      const off = document.createElement('canvas');
      off.width = size;
      off.height = size;
      const octx = off.getContext('2d')!;
      octx.imageSmoothingEnabled = false;
      const img = shaking
        ? themeSet.shake[shakeFrame]!
        : themeSet.faces[Math.max(0, Math.min(5, face - 1))]!;
      const dx = Math.round(0) + (shaking ? Math.round(Math.sin(wobble * 30) * 1) : 0);
      const dy = Math.round(0) + (shaking ? Math.round(Math.cos(wobble * 25) * 1) : 0);
      octx.drawImage(img, dx, dy);

      const px = Math.round(cx - drawW / 2);
      const py = Math.round(cy - drawH / 2);
      ctx!.drawImage(off, 0, 0, size, size, px, py, drawW, drawH);
    }

    function drawCharacter(t: number) {
      const cScale = 1.5;
      const character = getSprite('char_soldier');
      const charRight = getSprite('char_gambler') ?? character;
      const idleCount = (n: number) => Math.min(2, n);
      const idleRate = 0.9;
      if (character && character.frames.length > 0) {
        const frameIdx = Math.floor(t * idleRate) % idleCount(character.frames.length);
        ctx!.save();
        try {
          ctx!.imageSmoothingEnabled = false;
          ctx!.translate(34, 232);
          ctx!.scale(cScale, cScale);
          drawSprite(ctx!, character, frameIdx, 0, 0);
        } finally {
          ctx!.restore();
        }
      }

      if (charRight && charRight.frames.length > 0) {
        const frameIdx2 = Math.floor(t * idleRate + 0.5) % idleCount(charRight.frames.length);
        ctx!.save();
        try {
          ctx!.imageSmoothingEnabled = false;
          ctx!.translate(W - 34, 232);
          ctx!.scale(cScale, cScale);
          ctx!.scale(-1, 1);
          drawSprite(ctx!, charRight, frameIdx2, 0, 0);
        } finally {
          ctx!.restore();
        }
      }
    }

    function drawEmbers(dt: number) {
      const step = Math.min(2, dt * 60);
      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i]!;
        e.life += step;
        e.x += e.vx * step;
        e.y += e.vy * step;
        e.vy *= Math.pow(0.985, step);
        e.vx += (Math.random() - 0.5) * 0.04 * step;
        if (e.life >= e.maxLife) {
          embers.splice(i, 1);
          continue;
        }
        const p = e.life / e.maxLife;
        const a = p < 0.5 ? 0.9 : Math.max(0, 0.9 * (1 - (p - 0.5) / 0.5));
        ctx!.globalAlpha = a;
        ctx!.fillStyle = e.color;
        ctx!.fillRect(Math.round(e.x), Math.round(e.y), e.size, e.size);
      }
      ctx!.globalAlpha = 1;
    }

    function safe(fn: () => void) {
      try {
        fn();
      } catch (err) {
        if (import.meta.env?.DEV) console.warn('[MenuScene] draw step failed', err);
      }
    }

    function frame(now: number) {
      raf = requestAnimationFrame(frame);
      const t = (now - start) / 1000;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.globalAlpha = 1;
      ctx!.globalCompositeOperation = 'source-over';
      ctx!.fillStyle = '#000';
      ctx!.fillRect(0, 0, W, H);
      safe(() => drawBackdrop(t));
      safe(() => drawDistantWall());
      safe(() => drawPillars());
      safe(() => drawTorch(18, 155, t, 1.1));
      safe(() => drawTorch(W - 20, 155, t, 2.3));
      safe(() => drawBigDie(t));
      safe(() => drawFloor(t));
      safe(() => drawCharacter(t));
      safe(() => drawEmbers(dt));
    }

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={canvasRef} width={W} height={H} className="menu-scene-canvas" aria-hidden />;
}
