import type { Rarity, Element } from '../../types';

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
      verb: 'modifyProjectile';
      pierce?: number;
      bounce?: number;
      aoeOnHit?: number;
      homing?: boolean;
      lifesteal?: number;
      extra?: number;
      sizeMul?: number;
      damageMul?: number;
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

export interface FaceUpgradeTier {
  effects: Effect[];
  damageMul?: number;
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
  bindsTo?: number[];
  tags?: string[];
  characterExclusive?: string;
  evolution?: FaceUpgradeEvolution;
  animation: AnimationBinding;
  tiers: [FaceUpgradeTier, FaceUpgradeTier, FaceUpgradeTier, FaceUpgradeTier, FaceUpgradeTier];
  basePrice?: Partial<Record<Rarity, number[]>>;
  /** Optional palette-character rows used as the die-face pixel art when this upgrade occupies a slot. */
  icon?: string[];
}

export const MAX_TIER = 5;

export interface SlotRestriction {
  slotIndex: number;
  allowedTags?: string[];
  lockedToDefault?: boolean;
}

export interface CharacterDefaultFace {
  kind: 'default';
  /** When null, the slot starts with no replacer — effectively a true blank face. */
  upgradeId: string | null;
  projectileCount: number;
  damageMul?: number;
  element?: Element;
  restrictedReplacement?: boolean;
}

export interface SlotState {
  index: number;
  replacerId: string | null;
  supplementIds: string[];
  supplementCap: number;
}
