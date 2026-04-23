import type { Enemy } from '../../types';

export function rusherBehavior(e: Enemy, _dt: number): void {
  e.vy = e.speed;
  e.vx = 0;
}

export function tankBehavior(e: Enemy, _dt: number): void {
  e.vy = e.speed;
  e.vx = 0;
}

export function swarmBehavior(e: Enemy, _dt: number): void {
  e.vy = e.speed * 1.15;
}

export function drifterBehavior(e: Enemy, dt: number): void {
  e.data['driftPhase'] = (typeof e.data['driftPhase'] === 'number' ? (e.data['driftPhase'] as number) : Math.random() * Math.PI * 2) + dt * 2.4;
  e.vy = e.speed;
  e.vx = Math.cos(e.data['driftPhase'] as number) * 24;
}

export function oddOnlyBehavior(e: Enemy, _dt: number): void {
  e.vy = e.speed * 0.9;
}

export function copierBehavior(e: Enemy, _dt: number): void {
  e.vy = e.speed;
}

export function debufferBehavior(e: Enemy, _dt: number): void {
  e.vy = e.speed * 0.8;
}

export function absorberBehavior(e: Enemy, _dt: number): void {
  e.vy = e.speed * 0.7;
}

export function healerBehavior(e: Enemy, dt: number): void {
  e.vy = e.speed * 0.75;
  e.data['healT'] = ((e.data['healT'] as number | undefined) ?? 0) + dt;
}

export function invisibleBehavior(e: Enemy, _dt: number): void {
  e.vy = e.speed * 1.0;
}

export function inverterBehavior(e: Enemy, _dt: number): void {
  e.vy = e.speed * 0.9;
}

export function reflectorBehavior(e: Enemy, _dt: number): void {
  e.vy = e.speed * 0.7;
}

export function resurrectorBehavior(e: Enemy, dt: number): void {
  e.vy = e.speed * 0.85;
  e.data['resT'] = ((e.data['resT'] as number | undefined) ?? 0) + dt;
}

export function immuneBehavior(e: Enemy, _dt: number): void {
  e.vy = e.speed * 0.85;
}

export function splitterBehavior(e: Enemy, _dt: number): void {
  e.vy = e.speed;
}

export function driftSide(e: Enemy, _dt: number): void {
  e.vy = e.speed;
}
