import { startCharge, releaseCharge } from './engine';
import { haptic, HAPTIC } from '../audio/haptics';

let cleanup: (() => void) | null = null;

export function bindInput(canvas: HTMLCanvasElement): void {
  unbindInput();
  const down = (e: PointerEvent) => {
    e.preventDefault();
    if (e.target !== canvas) return;
    haptic(HAPTIC.tap);
    startCharge();
  };
  const up = (e: PointerEvent) => {
    e.preventDefault();
    releaseCharge();
  };
  const cancel = (e: PointerEvent) => {
    e.preventDefault();
    releaseCharge();
  };
  canvas.addEventListener('pointerdown', down, { passive: false });
  window.addEventListener('pointerup', up, { passive: false });
  window.addEventListener('pointercancel', cancel, { passive: false });
  cleanup = () => {
    canvas.removeEventListener('pointerdown', down);
    window.removeEventListener('pointerup', up);
    window.removeEventListener('pointercancel', cancel);
  };
}

export function unbindInput(): void {
  cleanup?.();
  cleanup = null;
}
