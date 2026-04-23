import { useEffect, useRef, useState } from 'react';
import { initSprites } from '../sprites';
import { buildDieSpriteSet, DIE_THEMES, type DieSpriteSet } from '../sprites/dice';
import { palHex } from '../sprites/palette';
import { playSfx } from '../audio/sfx';

const W = 96;
const H = 72;

type Props = {
  onTap?: () => void;
};

export function DieAltar({ onTap }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rollRef = useRef<{ started: number; duration: number; target: number } | null>(null);
  const [label, setLabel] = useState<string>('ROLL');
  const labelRef = useRef<string>('ROLL');

  useEffect(() => {
    initSprites();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    const dieSet: DieSpriteSet = buildDieSpriteSet(DIE_THEMES.ivory!);
    const size = dieSet.size;

    let raf = 0;
    let start = performance.now();

    let lastFace = 1;
    let autoRollAt = performance.now() + 2600;

    function maybeAutoRoll(now: number) {
      if (rollRef.current) return;
      if (now < autoRollAt) return;
      const nextFace = 1 + Math.floor(Math.random() * 6);
      rollRef.current = { started: now, duration: 900, target: nextFace };
      autoRollAt = now + 3400 + Math.random() * 1600;
    }

    function frame(now: number) {
      const t = (now - start) / 1000;
      ctx!.clearRect(0, 0, W, H);

      maybeAutoRoll(now);

      const cx = W / 2;
      const cy = H / 2 + Math.sin(t * 1.6) * 1;

      ctx!.save();
      const pulse = 0.22 + 0.1 * Math.sin(t * 3);
      ctx!.strokeStyle = palHex('H')!;
      ctx!.globalAlpha = pulse;
      ctx!.lineWidth = 1;
      ctx!.beginPath();
      ctx!.ellipse(cx, cy + size * 1.1, size * 1.2, size * 0.32, 0, 0, Math.PI * 2);
      ctx!.stroke();
      ctx!.globalAlpha = pulse * 0.55;
      ctx!.beginPath();
      ctx!.ellipse(cx, cy + size * 1.1, size * 0.95, size * 0.22, 0, 0, Math.PI * 2);
      ctx!.stroke();
      ctx!.restore();

      ctx!.save();
      ctx!.globalAlpha = 0.55;
      ctx!.fillStyle = palHex('x')!;
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + t * 0.6;
        const rx = Math.round(cx + Math.cos(a) * (size * 1.05));
        const ry = Math.round(cy + size * 1.1 + Math.sin(a) * (size * 0.28));
        ctx!.fillRect(rx, ry, 1, 1);
      }
      ctx!.restore();

      let face = lastFace;
      let shaking = false;
      let shakeFrame = 0;
      let wobble = 0;
      const active = rollRef.current;
      if (active) {
        const elapsed = now - active.started;
        if (elapsed >= active.duration) {
          face = active.target;
          lastFace = face;
          rollRef.current = null;
        } else {
          shaking = true;
          shakeFrame = Math.floor(elapsed / 60) % dieSet.shake.length;
          wobble = (elapsed / 1000) * 10;
          face = 1 + Math.floor(elapsed / 90) % 6;
        }
      }

      ctx!.save();
      const hoverHue = shaking ? 'rgba(255, 122, 43, 0.22)' : 'rgba(255, 216, 107, 0.18)';
      ctx!.fillStyle = hoverHue;
      ctx!.beginPath();
      ctx!.arc(cx, cy, size * 1.2, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.restore();

      const scale = 2;
      const drawW = size * scale;
      const drawH = size * scale;
      const img = shaking
        ? dieSet.shake[shakeFrame]!
        : dieSet.faces[Math.max(0, Math.min(5, face - 1))]!;
      const px = Math.round(cx - drawW / 2) + (shaking ? Math.round(Math.sin(wobble * 30) * 1) : 0);
      const py = Math.round(cy - drawH / 2) + (shaking ? Math.round(Math.cos(wobble * 25) * 1) : 0);
      ctx!.drawImage(img, 0, 0, size, size, px, py, drawW, drawH);

      if (!shaking) {
        ctx!.save();
        ctx!.globalAlpha = 0.2 + 0.1 * Math.sin(t * 3);
        ctx!.fillStyle = palHex('x')!;
        ctx!.fillRect(px - 1, py, drawW + 2, 1);
        ctx!.fillRect(px, py - 1, drawW, 1);
        ctx!.fillRect(px - 1, py + drawH - 1, drawW + 2, 1);
        ctx!.fillRect(px, py + drawH, drawW, 1);
        ctx!.restore();
      }

      const nextLabel = shaking ? 'ROLLING' : `FACE · ${face}`;
      if (labelRef.current !== nextLabel) {
        labelRef.current = nextLabel;
        setLabel(nextLabel);
      }

      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleTap = () => {
    if (rollRef.current) return;
    playSfx('ui_click');
    const now = performance.now();
    const nextFace = 1 + Math.floor(Math.random() * 6);
    rollRef.current = { started: now, duration: 900, target: nextFace };
    if (onTap) onTap();
  };

  return (
    <button className="die-altar" onClick={handleTap} aria-label="roll the die">
      <canvas ref={canvasRef} width={W} height={H} className="da-canvas" aria-hidden />
      <span className="da-label" aria-hidden>{label}</span>
    </button>
  );
}
