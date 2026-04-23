import { useEffect, useLayoutEffect, useRef } from 'react';
import { startLoop, stopLoop } from '../engine/gameLoop';
import { bindInput, unbindInput } from '../engine/input';
import { CANVAS_W, CANVAS_H } from '../config/constants';
import { useStore } from '../state/store';
import { startBgm, stopBgm, setBgmIntensity } from '../audio/bgm';

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const isBossWave = useStore((s) => s.hud.isBossWave);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;

    const resize = () => {
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      const scale = Math.max(1, Math.min(w / CANVAS_W, h / CANVAS_H));
      const drawW = CANVAS_W * scale;
      const drawH = CANVAS_H * scale;
      canvas.style.width = `${drawW}px`;
      canvas.style.height = `${drawH}px`;
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    window.addEventListener('resize', resize);

    startLoop(canvas);
    bindInput(canvas);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', resize);
      stopLoop();
      unbindInput();
    };
  }, []);

  useEffect(() => {
    startBgm();
    return () => stopBgm();
  }, []);

  useEffect(() => {
    setBgmIntensity(isBossWave ? 'boss' : 'normal');
  }, [isBossWave]);

  return (
    <div className="canvas-wrap" ref={wrapRef}>
      <canvas ref={canvasRef} />
    </div>
  );
}
