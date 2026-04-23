import { useEffect, useRef } from 'react';
import { initSprites } from '../sprites';
import { palHex } from '../sprites/palette';
import { drawTorch } from './menu/primitives';
import { THEME_FACTORIES } from './menu/themes';
import { ALL_THEMES, type MenuEngine, type Theme } from './menu/types';

const W = 180;
const H = 280;

interface Ember {
  x: number;
  y: number;
  vx: number;
  vy: number;
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

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  trail: { x: number; y: number }[];
}

export function MenuScene() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    initSprites();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rawCtx = canvas.getContext('2d');
    if (!rawCtx) return;
    const ctx: CanvasRenderingContext2D = rawCtx;
    ctx.imageSmoothingEnabled = false;

    const theme: Theme = ALL_THEMES[Math.floor(Math.random() * ALL_THEMES.length)]!;

    // ── Shared scene state ────────────────────────────────────────────────

    const embers: Ember[] = [];
    const stars: Star[] = [];
    for (let i = 0; i < 80; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * 90,
        phase: Math.random() * Math.PI * 2,
        bright: 0.3 + Math.random() * 0.7,
      });
    }
    const shootingStars: ShootingStar[] = [];
    let nextShootingStar = 2 + Math.random() * 4;

    const spawnEmber = (x: number, y: number, color: string) => {
      embers.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 25,
        vy: -40 - Math.random() * 35,
        life: 0,
        maxLife: 0.6 + Math.random() * 0.8,
        color,
        size: Math.random() < 0.7 ? 1 : 2,
      });
    };

    const engine: MenuEngine = {
      ctx,
      W,
      H,
      spawnEmber,
    };

    const controller = THEME_FACTORIES[theme](engine);

    // ── Shared particle systems that honor theme flags ───────────────────

    function drawStars(t: number) {
      if (!controller.stars) return;
      ctx.fillStyle = palHex('d')!;
      for (const s of stars) {
        const tw = 0.5 + 0.5 * Math.sin(t * 2 + s.phase);
        if (tw * s.bright > 0.4) ctx.fillRect(s.x, s.y, 1, 1);
      }
      ctx.fillStyle = palHex('e')!;
      for (const s of stars) {
        const tw = 0.5 + 0.5 * Math.sin(t * 2 + s.phase);
        if (tw * s.bright > 0.85) ctx.fillRect(s.x, s.y, 1, 1);
      }
    }

    function updateShootingStars(t: number, dt: number) {
      if (!controller.shootingStars) return;
      nextShootingStar -= dt;
      if (nextShootingStar <= 0 && shootingStars.length < 2) {
        nextShootingStar = 3 + Math.random() * 5;
        const ang = (Math.random() * 30 + 20) * (Math.PI / 180);
        const speed = 180 + Math.random() * 60;
        shootingStars.push({
          x: Math.random() < 0.5 ? -10 : W + 10,
          y: 10 + Math.random() * 40,
          vx: Math.cos(ang) * speed * (Math.random() < 0.5 ? 1 : -1),
          vy: Math.sin(ang) * speed * 0.5,
          life: 0,
          maxLife: 0.8 + Math.random() * 0.5,
          trail: [],
        });
      }
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i]!;
        s.life += dt;
        s.trail.unshift({ x: s.x, y: s.y });
        if (s.trail.length > 8) s.trail.pop();
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        if (s.life >= s.maxLife || s.x < -20 || s.x > W + 20) {
          shootingStars.splice(i, 1);
        }
      }
      void t;
    }

    function drawShootingStars() {
      if (!controller.shootingStars) return;
      for (const s of shootingStars) {
        const alpha = Math.max(0, 1 - s.life / s.maxLife);
        for (let i = s.trail.length - 1; i >= 0; i--) {
          const p = s.trail[i]!;
          const fade = (1 - i / s.trail.length) * alpha;
          ctx.fillStyle = `rgba(255, 230, 180, ${fade.toFixed(3)})`;
          ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1);
        }
        ctx.fillStyle = palHex('S')!;
        ctx.fillRect(Math.round(s.x), Math.round(s.y), 2, 1);
      }
    }

    function drawEmbers(dt: number) {
      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i]!;
        e.life += dt;
        const p = e.life / e.maxLife;
        if (p >= 1) {
          embers.splice(i, 1);
          continue;
        }
        e.vy += -20 * dt;
        e.vx *= 0.96;
        e.x += e.vx * dt;
        e.y += e.vy * dt;
        const fade = 1 - p;
        if (fade < 0.15) continue;
        ctx.globalAlpha = fade;
        ctx.fillStyle = e.color;
        ctx.fillRect(Math.round(e.x), Math.round(e.y), e.size, e.size);
      }
      ctx.globalAlpha = 1;
    }

    // ── Frame loop ────────────────────────────────────────────────────────

    let last = performance.now();
    let raf = 0;
    let mounted = true;

    function safe(fn: () => void) {
      try {
        fn();
      } catch (err) {
        if (import.meta.env?.DEV) {
          // eslint-disable-next-line no-console
          console.warn('[MenuScene] render error:', err);
        }
      }
    }

    function frame(now: number) {
      if (!mounted) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = now / 1000;

      ctx.clearRect(0, 0, W, H);

      safe(() => controller.drawBackdrop(t, dt));
      safe(() => drawStars(t));
      safe(() => updateShootingStars(t, dt));
      safe(() => drawShootingStars());
      safe(() => controller.drawMidground(t, dt));

      // Flanking torches drawn uniformly on every theme.
      safe(() => drawTorch(engine, controller.torchPal, 18, 155, t, 1.1));
      safe(() => drawTorch(engine, controller.torchPal, W - 20, 155, t, 2.3));

      safe(() => controller.drawFloor(t, dt));
      safe(() => drawEmbers(dt));
      if (controller.drawOverlay) safe(() => controller.drawOverlay!(t, dt));

      // Vignette.
      ctx.save();
      const vig = ctx.createRadialGradient(W / 2, H / 2, 60, W / 2, H / 2, 150);
      vig.addColorStop(0, 'rgba(0,0,0,0)');
      vig.addColorStop(1, 'rgba(0,0,0,0.55)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();

      // Scanlines.
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      for (let y = 0; y < H; y += 2) ctx.fillRect(0, y, W, 1);
      ctx.restore();

      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);
    return () => {
      mounted = false;
      cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvasRef} width={W} height={H} className="menu-scene-canvas" aria-hidden />;
}
