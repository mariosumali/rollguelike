import { useEffect, useRef, useState } from 'react';
import { initSprites } from '../sprites';
import { buildDieSpriteSet, DIE_THEMES, type DieSpriteSet } from '../sprites/dice';
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

      const scale = 2;
      const drawW = size * scale;
      const drawH = size * scale;
      const img = shaking
        ? dieSet.shake[shakeFrame] ?? dieSet.faces[0]
        : dieSet.faces[Math.max(0, Math.min(5, face - 1))] ?? dieSet.faces[0];
      const px = Math.round(cx - drawW / 2) + (shaking ? Math.round(Math.sin(wobble * 30) * 1) : 0);
      const py = Math.round(cy - drawH / 2) + (shaking ? Math.round(Math.cos(wobble * 25) * 1) : 0);
      if (img) {
        ctx!.drawImage(img, 0, 0, size, size, px, py, drawW, drawH);
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
      {/* <span className="da-label" aria-hidden>{label}</span> */}
    </button>
  );
}
