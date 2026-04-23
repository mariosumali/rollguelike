import { useEffect, useRef } from 'react';
import { initSprites } from '../sprites';
import { getSprite, drawSprite, hasSprite } from '../sprites/sprite';

interface Props {
  characterId: string;
  size?: number;
  frameIdx?: number;
  /** If true, render the full-body in-game sprite instead of the face close-up portrait. */
  fullBody?: boolean;
}

export function CharacterPortrait({ characterId, size = 48, frameIdx = 0, fullBody = false }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    initSprites();
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, c.width, c.height);

    const portraitId = `portrait_${characterId}`;
    const fallbackId = `char_${characterId}`;
    const useFace = !fullBody && hasSprite(portraitId);
    const spr = getSprite(useFace ? portraitId : fallbackId);
    if (!spr) return;

    const f = spr.frames[Math.min(frameIdx, spr.frames.length - 1)]!;
    const scale = Math.max(1, Math.floor(size / Math.max(f.w, f.h)));
    const drawW = f.w * scale;
    const drawH = f.h * scale;

    if (useFace) {
      // Face close-up: center the raw sprite canvas inside the tile.
      const dx = Math.round((c.width - drawW) / 2);
      const dy = Math.round((c.height - drawH) / 2);
      ctx.drawImage(f.canvas, 0, 0, f.w, f.h, dx, dy, drawW, drawH);
    } else {
      // Legacy body sprite: anchor to the bottom of the canvas.
      const cx = (c.width - drawW) / 2 + drawW / 2;
      const cy = (c.height - drawH) / 2 + drawH;
      ctx.save();
      ctx.scale(scale, scale);
      drawSprite(ctx, spr, frameIdx, cx / scale, cy / scale);
      ctx.restore();
    }
  }, [characterId, size, frameIdx, fullBody]);

  return <canvas ref={ref} width={size} height={size} className="char-portrait" />;
}
