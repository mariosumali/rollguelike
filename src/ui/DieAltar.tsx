import { useEffect, useRef } from 'react';
import { initSprites } from '../sprites';
import {
  buildDieSpriteSet,
  DIE_THEMES,
  getDieTheme,
  type DieSpriteSet,
} from '../sprites/dice';
import { playSfx } from '../audio/sfx';
import { useStore } from '../state/store';

const W = 96;
const H = 72;

type Props = {
  onTap?: () => void;
};

/** Face-switching is stretched to ~2x; bob + scramble (shake/wobble) keep original speed. */
function altarDieFrame(t: number, dieSet: DieSpriteSet, dieSetAlt: DieSpriteSet) {
  const size = dieSet.size;
  // Extend the 8s cycle to 13s so each face lingers twice as long while keeping the 2s scramble intact.
  const cycleT = t % 13;
  const isRolling = cycleT > 10.5 && cycleT < 12.5;
  const rollProgress = (cycleT - 10.5) / 2;

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
    const stableT = cycleT < 10.5 ? cycleT : cycleT - 12.5 + 10.5;
    face = 1 + Math.floor(stableT / 1.8) % 6;
  }

  const themeSet = isRolling && rollProgress > 0.5 && Math.floor(t * 2) & 1 ? dieSetAlt : dieSet;
  const img = shaking
    ? themeSet.shake[shakeFrame]!
    : themeSet.faces[Math.max(0, Math.min(5, face - 1))]!;

  return { size, img, shaking, wobble };
}

export function DieAltar({ onTap }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const manualRollRef = useRef<{ started: number; duration: number; target: number } | null>(null);
  const dieThemeId = useStore((s) => s.settings.dieTheme);

  useEffect(() => {
    initSprites();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    const dieSet: DieSpriteSet = buildDieSpriteSet(getDieTheme(dieThemeId));
    // Alt theme used during the scramble "swap" flash — fall back to crimson unless the
    // current theme *is* crimson, in which case use ivory so the flash is visible.
    const altId = dieThemeId === 'crimson' ? 'ivory' : 'crimson';
    const dieSetAlt: DieSpriteSet = buildDieSpriteSet(DIE_THEMES[altId]!);

    let raf = 0;
    let start = performance.now();

    function frame(now: number) {
      const t = (now - start) / 1000;
      ctx!.clearRect(0, 0, W, H);

      const cx = W / 2;
      const bob = Math.sin(t * 1.2) * 2;
      const cy = H / 2 + bob;

      const manual = manualRollRef.current;
      let size: number;
      let img: HTMLCanvasElement;
      let shaking: boolean;
      let wobble: number;

      if (manual) {
        const elapsed = now - manual.started;
        if (elapsed >= manual.duration) {
          manualRollRef.current = null;
        }
      }

      const stillManual = manualRollRef.current;
      if (stillManual) {
        const elapsed = now - stillManual.started;
        const progress = elapsed / stillManual.duration;
        size = dieSet.size;
        shaking = true;
        const shakeFrame = Math.floor(elapsed / 60) % dieSet.shake.length;
        wobble = (elapsed / 1000) * 10;
        const themeSet = progress > 0.5 && Math.floor(elapsed / 80) & 1 ? dieSetAlt : dieSet;
        img = themeSet.shake[shakeFrame]!;
      } else {
        const auto = altarDieFrame(t, dieSet, dieSetAlt);
        size = auto.size;
        img = auto.img;
        shaking = auto.shaking;
        wobble = auto.wobble;
      }

      const scale = 1.7;
      const drawW = size * scale;
      const drawH = size * scale;
      const px = Math.round(cx - drawW / 2) + (shaking ? Math.round(Math.sin(wobble * 30) * 1) : 0);
      const py = Math.round(cy - drawH / 2) + (shaking ? Math.round(Math.cos(wobble * 25) * 1) : 0);
      ctx!.drawImage(img, 0, 0, size, size, px, py, drawW, drawH);

      // CRT scanlines clipped to the die sprite only
      ctx!.save();
      ctx!.globalCompositeOperation = 'source-atop';
      ctx!.globalAlpha = 0.22;
      ctx!.fillStyle = '#000';
      for (let y = py; y < py + drawH; y += 2) {
        ctx!.fillRect(px, y, drawW, 1);
      }
      ctx!.restore();

      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [dieThemeId]);

  const handleTap = () => {
    playSfx('dice_tumble');
    if (!manualRollRef.current) {
      manualRollRef.current = {
        started: performance.now(),
        duration: 900,
        target: 1 + Math.floor(Math.random() * 6),
      };
    }
    if (onTap) onTap();
  };

  return (
    <button className="die-altar" onClick={handleTap} aria-label="roll the die">
      <span className="da-crt-wrap" aria-hidden>
        <canvas ref={canvasRef} width={W} height={H} className="da-canvas" />
      </span>
    </button>
  );
}
