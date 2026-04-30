import { update, render, fixedDt } from './engine';
import { useStore } from '../state/store';

let rafId: number | null = null;
let lastT = 0;
let accum = 0;
let ctxRef: CanvasRenderingContext2D | null = null;

export function startLoop(canvas: HTMLCanvasElement): void {
  stopLoop();
  ctxRef = canvas.getContext('2d')!;
  ctxRef.imageSmoothingEnabled = false;
  lastT = performance.now();
  accum = 0;
  rafId = requestAnimationFrame(step);
}

export function stopLoop(): void {
  if (rafId !== null) cancelAnimationFrame(rafId);
  rafId = null;
  ctxRef = null;
}

function step(now: number): void {
  rafId = requestAnimationFrame(step);
  const dt = Math.min(0.1, (now - lastT) / 1000);
  lastT = now;
  const speedMul = useStore.getState().settings.gameSpeedMultiplier;
  accum += dt * speedMul;
  const fixed = fixedDt();
  let iter = 0;
  const maxIter = Math.max(5, Math.ceil(5 * speedMul));
  while (accum >= fixed && iter < maxIter) {
    update(fixed);
    accum -= fixed;
    iter++;
  }
  if (iter >= maxIter) accum = 0;
  if (ctxRef) render(ctxRef);
}
