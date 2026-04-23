import { update, render, fixedDt } from './engine';

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
  accum += dt;
  const fixed = fixedDt();
  let iter = 0;
  while (accum >= fixed && iter < 5) {
    update(fixed);
    accum -= fixed;
    iter++;
  }
  if (iter >= 5) accum = 0;
  if (ctxRef) render(ctxRef);
}
