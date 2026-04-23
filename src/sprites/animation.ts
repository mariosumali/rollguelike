import type { Animation, Sprite } from './sprite';

export interface AnimState {
  animName: string;
  t: number;
  frameIdx: number;
}

export function stepAnim(sprite: Sprite, state: AnimState, dt: number): void {
  const anim: Animation | undefined = sprite.anim[state.animName] ?? sprite.anim.default;
  if (!anim) return;
  state.t += dt;
  const total = anim.frames.length * anim.frameDuration;
  if (!anim.loop && state.t >= total) {
    state.frameIdx = anim.frames[anim.frames.length - 1]!;
    return;
  }
  const idx = Math.floor(state.t / anim.frameDuration) % anim.frames.length;
  state.frameIdx = anim.frames[idx]!;
}

export function setAnim(state: AnimState, name: string): void {
  if (state.animName === name) return;
  state.animName = name;
  state.t = 0;
  state.frameIdx = 0;
}

export function makeAnimState(name = 'default'): AnimState {
  return { animName: name, t: 0, frameIdx: 0 };
}
