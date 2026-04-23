import { useEffect, useRef } from 'react';
import { initSprites } from '../sprites';
import { getSprite, drawSprite } from '../sprites/sprite';

interface Props {
  characterId: string;
  size?: number;
  frameIdx?: number;
}

export function CharacterPortrait({ characterId, size = 48, frameIdx = 0 }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    initSprites();
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, c.width, c.height);
    const spr = getSprite(`char_${characterId}`);
    if (!spr) return;
    const f = spr.frames[Math.min(frameIdx, spr.frames.length - 1)]!;
    const scale = Math.max(1, Math.floor(size / Math.max(f.w, f.h)));
    const drawW = f.w * scale;
    const drawH = f.h * scale;
    const cx = (c.width - drawW) / 2 + drawW / 2;
    const cy = (c.height - drawH) / 2 + drawH;
    ctx.save();
    ctx.scale(scale, scale);
    drawSprite(ctx, spr, frameIdx, cx / scale, cy / scale);
    ctx.restore();
  }, [characterId, size, frameIdx]);

  return <canvas ref={ref} width={size} height={size} className="char-portrait" />;
}
