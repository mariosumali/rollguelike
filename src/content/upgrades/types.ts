import type { Rarity, Element, Face } from '../../types';

export type StatusKind = 'burn' | 'slow' | 'freeze' | 'stun' | 'mark' | 'poison';
export type PickupKind = 'gold' | 'heal' | 'soul';

export type Effect =
  | {
      verb: 'fireProjectile';
      count: number;
      speed?: number;
      pierce?: number;
      bounce?: number;
      homing?: boolean;
      spread?: number;
      damageMul?: number;
      size?: number;
      lifeMul?: number;
      element?: Element;
    }
  | {
      verb: 'pulse';
      radius: number;
      damageMul?: number;
      knockback?: number;
      element?: Element;
      delay?: number;
      repeat?: number;
    }
  | { verb: 'chain'; maxChains: number; decay: number }
  | {
      verb: 'chainLightning';
      jumps: number;
      damageMul: number;
      radius?: number;
      stunDur?: number;
      fromDie?: boolean;
    }
  | { verb: 'bounce'; count: number }
  | {
      verb: 'applyStatus';
      status: StatusKind;
      power: number;
      duration: number;
      chance?: number;
    }
  | { verb: 'heal'; amount: number; cleanse?: boolean; overflowToShield?: boolean }
  | { verb: 'shield'; stacks: number; reflect?: number; reflectChain?: boolean }
  | { verb: 'spawnPickup'; kind: PickupKind; amount: number; chance?: number }
  | {
      verb: 'pull';
      radius: number;
      strength: number;
      dps: number;
      duration: number;
      destroyProjectiles?: boolean;
    }
  | { verb: 'column'; count: number; delay: number; damageMul: number; stunDur?: number; chainToExtra?: number }
  | {
      verb: 'flamePillar';
      count: number;
      radius: number;
      damageMul: number;
      duration: number;
      delay?: number;
      burnDps?: number;
      burnDur?: number;
    }
  | {
      verb: 'groundZone';
      radius: number;
      dps: number;
      duration: number;
      element?: Element;
      slow?: number;
    }
  | { verb: 'frostBurst'; radius: number; damageMul: number; freezeDur: number; slow?: number }
  | { verb: 'statusAura'; status: StatusKind; radius: number; power: number; duration: number }
  | {
      verb: 'modifyProjectile';
      pierce?: number;
      bounce?: number;
      aoeOnHit?: number;
      homing?: boolean;
      lifesteal?: number;
      extra?: number;
      sizeMul?: number;
      damageMul?: number;
      speedMul?: number;
      crit?: number;
      burnDps?: number;
      burnDur?: number;
    }
  | {
      verb: 'orbit';
      count: number;
      radius: number;
      rpm: number;
      damageMul: number;
      duration: number;
      pierce?: number;
      element?: Element;
    }
  | {
      verb: 'beam';
      width: number;
      dps: number;
      duration: number;
      pierce?: number;
      element?: Element;
      lifesteal?: number;
    }
  | {
      verb: 'summonMinion';
      kind: 'bone' | 'wraith' | 'spirit' | 'ember';
      count: number;
      hp: number;
      duration: number;
      damagePerHit: number;
      trigger?: 'onResolve' | 'onKill' | 'onProjectileExpire';
    }
  | {
      verb: 'reflect';
      duration: number;
      multiplier: number;
      radius?: number;
    };

export interface AnimationBinding {
  cast: string;
  projectile?: string;
  hit: string;
  evolution?: string;
}

export interface FaceUpgradeTiming {
  /** Delay between the die landing and the effect resolving. */
  castDelay?: number;
  /** Extra delay, after the normal post-roll cooldown, before the next roll. */
  recovery?: number;
  /** Delay between projectiles in a volley. Falls back to the global shot delay. */
  shotInterval?: number;
}

export interface FaceUpgradeTier {
  effects: Effect[];
  damageMul?: number;
  timing?: FaceUpgradeTiming;
  params?: Record<string, number>;
  note?: string;
}

export type FaceUpgradeKind = 'replacer' | 'supplement';

export interface FaceUpgradeEvolution {
  name: string;
  extraEffects?: Effect[];
  flavor?: string;
}

export interface FaceUpgrade {
  id: string;
  name: string;
  kind: FaceUpgradeKind;
  rarity: Rarity;
  description: string;
  /** Shared lineage key for concrete upgrades that replace one another. */
  chainId?: string;
  /** Position within a chain. Used for pricing/animation intensity, not effect lookup. */
  rank?: number;
  /** Concrete predecessor id required on a face before this upgrade can be offered. */
  upgradesFrom?: string;
  /** Optional concrete successor id, used for validation and UI hints. */
  upgradesTo?: string;
  bindsTo?: number[];
  tags?: string[];
  characterExclusive?: string;
  evolution?: FaceUpgradeEvolution;
  animation: AnimationBinding;
  effect: FaceUpgradeTier;
  basePrice?: Partial<Record<Rarity, readonly number[]>>;
  /** Optional palette-character rows used as the die-face pixel art when this upgrade occupies a slot. */
  icon?: string[];
}

export const MAX_TIER = 3;

export interface SlotRestriction {
  slotIndex: number;
  allowedTags?: string[];
  lockedToDefault?: boolean;
}

export interface CharacterDefaultFace {
  kind: 'default';
  name: string;
  description: string;
  /** Baseline action used when no forge replacer occupies this slot. */
  face: Omit<Face, 'value'>;
  restrictedReplacement?: boolean;
}

export interface SlotState {
  index: number;
  replacerId: string | null;
  supplementIds: string[];
  supplementCap: number;
}
