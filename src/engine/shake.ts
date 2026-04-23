let trauma = 0;
let timeRef = 0;
let multiplier = 1;

export function addTrauma(amount: number): void {
  trauma = Math.min(1, trauma + amount);
}

export function updateShake(dt: number): void {
  timeRef += dt;
  trauma = Math.max(0, trauma - dt * 1.5);
}

export function getShakeOffset(): { x: number; y: number } {
  if (trauma <= 0 || multiplier <= 0) return { x: 0, y: 0 };
  const t = trauma * trauma * multiplier;
  const x = (Math.sin(timeRef * 80) + Math.cos(timeRef * 57)) * t * 4;
  const y = (Math.cos(timeRef * 73) + Math.sin(timeRef * 61)) * t * 4;
  return { x, y };
}

export function resetShake(): void {
  trauma = 0;
}

export function setShakeMultiplier(m: number): void {
  multiplier = Math.max(0, m);
}
