export type AnimationKind = 'burst' | 'trail' | 'beam' | 'pulse' | 'columns' | 'sprite' | 'aura' | 'glow';

export interface AnimationSpec {
  id: string;
  kind: AnimationKind;
  color: string;
  secondaryColor?: string;
  size: number;
  duration: number;
  particles: number;
  sprite?: string;
  easing?: 'linear' | 'easeOut' | 'easeInOut';
  shake?: number;
  sound?: string;
  speed?: number;
  spread?: number;
  gravity?: number;
  ringThickness?: number;
  trailLength?: number;
  spin?: number;
}

export interface TierIntensity {
  scale: number;
  particles: number;
  brightness: number;
}

export function intensity(tier: number): TierIntensity {
  const t = Math.max(1, Math.min(5, tier));
  return {
    scale: 1 + 0.2 * (t - 1),
    particles: 1 + 0.25 * (t - 1),
    brightness: 1 + 0.1 * (t - 1),
  };
}
