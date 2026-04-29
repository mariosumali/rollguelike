import type { Enemy } from '../../types';
import { ARENA_W, WALL_Y } from '../../config/constants';

function wave(e: Enemy, dt: number, key: string, rate: number, seed = 0): number {
  e.data[key] = ((e.data[key] as number | undefined) ?? seed) + dt * rate;
  return e.data[key] as number;
}

export function rusherBehavior(e: Enemy, dt: number): void {
  e.data['chargeT'] = ((e.data['chargeT'] as number | undefined) ?? 0) + dt;
  const chargeT = e.data['chargeT'] as number;
  if (chargeT < 0.45) {
    e.vy = e.speed * 0.35;
    e.vx = 0;
    e.hitFlash = Math.max(e.hitFlash, 0.04);
  } else if (chargeT < 1.1) {
    e.vy = e.speed * 2.2;
    e.vx = Math.sin(chargeT * 18) * 10;
  } else {
    e.vy = e.speed * 1.15;
    e.vx = 0;
  }
}

export function tankBehavior(e: Enemy, dt: number): void {
  const phase = wave(e, dt, 'tankPhase', 1.2, e.x * 0.01);
  e.vy = e.speed * 0.58;
  e.vx = Math.sin(phase) * 12;
}

export function swarmBehavior(e: Enemy, dt: number): void {
  const phase = wave(e, dt, 'swarmPhase', 4.2, e.x * 0.05);
  e.vy = e.speed * (1.1 + Math.min(0.45, e.age * 0.035));
  e.vx = Math.cos(phase) * 18;
}

export function drifterBehavior(e: Enemy, dt: number): void {
  e.data['driftPhase'] = (typeof e.data['driftPhase'] === 'number' ? (e.data['driftPhase'] as number) : Math.random() * Math.PI * 2) + dt * 2.4;
  e.vy = e.speed;
  e.vx = Math.cos(e.data['driftPhase'] as number) * 24;
}

export function oddOnlyBehavior(e: Enemy, _dt: number): void {
  e.vy = e.speed * (Math.floor(e.age * 2) % 2 === 0 ? 0.65 : 1.15);
  e.vx = 0;
}

export function copierBehavior(e: Enemy, dt: number): void {
  const phase = wave(e, dt, 'copyPhase', 2.8, e.x * 0.03);
  e.vy = e.speed * 0.95;
  e.vx = Math.sin(phase) * 22;
}

export function debufferBehavior(e: Enemy, _dt: number): void {
  e.vy = e.y > WALL_Y - 90 ? e.speed * 0.35 : e.speed * 0.72;
  e.vx = 0;
}

export function absorberBehavior(e: Enemy, dt: number): void {
  const phase = wave(e, dt, 'absorbPhase', 1.6, e.x * 0.02);
  e.vy = e.speed * (e.absorbed > 30 ? 1.25 : 0.68);
  e.vx = Math.sin(phase) * 10;
}

export function healerBehavior(e: Enemy, dt: number): void {
  const phase = wave(e, dt, 'healPhase', 2.1, e.x * 0.02);
  e.vy = e.y > WALL_Y - 120 ? e.speed * 0.28 : e.speed * 0.66;
  e.vx = Math.sin(phase) * 18;
  e.data['healT'] = ((e.data['healT'] as number | undefined) ?? 0) + dt;
}

export function invisibleBehavior(e: Enemy, dt: number): void {
  const phase = wave(e, dt, 'shadePhase', 3.4, e.x * 0.03);
  const hidden = Math.sin(phase) > -0.15 && e.y < WALL_Y - 45;
  e.state = hidden ? 'invisible' : 'walk';
  e.vy = hidden ? e.speed * 1.25 : e.speed * 0.72;
  e.vx = Math.cos(phase) * 26;
}

export function inverterBehavior(e: Enemy, dt: number): void {
  const phase = wave(e, dt, 'invertPhase', 2.3, e.x * 0.04);
  e.vy = e.speed * 0.82;
  e.vx = Math.sin(phase) * 20;
}

export function reflectorBehavior(e: Enemy, dt: number): void {
  const phase = wave(e, dt, 'reflectPhase', 1.7, e.x * 0.02);
  e.vy = e.speed * 0.62;
  e.vx = Math.cos(phase) * 16;
}

export function resurrectorBehavior(e: Enemy, dt: number): void {
  e.vy = e.speed * 0.85;
  e.vx = Math.sin(wave(e, dt, 'resPhase', 1.4, e.x * 0.01)) * 12;
  e.data['resT'] = ((e.data['resT'] as number | undefined) ?? 0) + dt;
}

export function immuneBehavior(e: Enemy, _dt: number): void {
  e.vy = e.speed * 0.62;
  e.vx = 0;
}

export function splitterBehavior(e: Enemy, dt: number): void {
  const phase = wave(e, dt, 'splitPhase', 2.2, e.x * 0.03);
  e.vy = e.speed * 0.92;
  e.vx = Math.sin(phase) * 14;
}

export function driftSide(e: Enemy, _dt: number): void {
  e.vy = e.speed;
  if (e.x < 16 || e.x > ARENA_W - 16) e.vx *= -1;
}
