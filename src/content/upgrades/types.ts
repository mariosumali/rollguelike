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
  evolution?: FaceUpgradeEvolution;
  animation: AnimationBinding;
  tiers: [FaceUpgradeTier, FaceUpgradeTier, FaceUpgradeTier, FaceUpgradeTier, FaceUpgradeTier];
  basePrice?: Partial<Record<Rarity, number[]>>;
}

export const MAX_TIER = 5;

export interface SlotRestriction {
  slotIndex: number;
  allowedTags?: string[];
  lockedToDefault?: boolean;
}

export interface CharacterDefaultFace {
  kind: 'default';
  upgradeId: string;
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
