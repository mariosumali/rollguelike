import { useEffect, useRef } from 'react';
import type { Upgrade } from '../types';
import { buildFaceIconCanvas } from '../sprites/dice';

export function RelicIcon({
  upgrade,
  size = 52,
  cachePrefix = 'relic',
}: {
  upgrade: Pick<Upgrade, 'id' | 'icon' | 'name'>;
  size?: number;
  cachePrefix?: string;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!upgrade.icon) return;
    const src = buildFaceIconCanvas(upgrade.icon, `${cachePrefix}:${upgrade.id}`);
    if (!src) return;
    const scale = Math.max(1, Math.floor(Math.min(canvas.width / src.width, canvas.height / src.height)));
    const drawW = src.width * scale;
    const drawH = src.height * scale;
    const dx = Math.round((canvas.width - drawW) / 2);
    const dy = Math.round((canvas.height - drawH) / 2);
    ctx.drawImage(src, 0, 0, src.width, src.height, dx, dy, drawW, drawH);
  }, [upgrade, cachePrefix]);

  return (
    <canvas
      ref={ref}
      width={size}
      height={size}
      className="relic-icon"
      aria-label={`${upgrade.name} icon`}
    />
  );
}

export function BaubleIcon({
  upgrade,
  size = 40,
}: {
  upgrade: Pick<Upgrade, 'id' | 'icon' | 'name'>;
  size?: number;
}) {
  return <RelicIcon upgrade={upgrade} size={size} cachePrefix="bauble" />;
}
