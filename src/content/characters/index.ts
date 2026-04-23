import type { Character, DieConfig } from '../../types';
import { registerCharacters } from './registry';
import { BALANCE } from '../../config/balance';
import { getRunState } from '../../state/store';
import { PROJECTILE_ARCHETYPES } from './projectiles';

function d6(id: string, baseDmg = 0.9): DieConfig {
  return {
    id,
    rollDuration: BALANCE.die.baseRollDuration,
    faces: [
      { value: 1, kind: 'SHOT', element: 'none', damageMul: baseDmg },
      { value: 2, kind: 'SHOT', element: 'none', damageMul: baseDmg },
      { value: 3, kind: 'BURST', element: 'none', damageMul: baseDmg, projectileCount: 3 },
      { value: 4, kind: 'SHIELD', element: 'none' },
      { value: 5, kind: 'HEAL', element: 'none' },
      { value: 6, kind: 'PULSE', element: 'none', damageMul: baseDmg },
    ],
  };
}

const soldierStart: DieConfig = d6('soldier_d6', 0.9);

const gamblerStart: DieConfig = {
  id: 'gambler_d6',
  rollDuration: BALANCE.die.baseRollDuration,
  faces: [
    { value: 1, kind: 'BLANK', element: 'none' },
    { value: 2, kind: 'SHOT', element: 'none', damageMul: 1.1 },
    { value: 3, kind: 'BURST', element: 'none', damageMul: 1.1, projectileCount: 4 },
    { value: 4, kind: 'WILD', element: 'none', damageMul: 1.35 },
    { value: 5, kind: 'BLANK', element: 'none' },
    { value: 6, kind: 'PULSE', element: 'none', damageMul: 1.5 },
  ],
};

const alchemistStart: DieConfig = {
  id: 'alchemist_d6',
  rollDuration: BALANCE.die.baseRollDuration,
  faces: [
    { value: 1, kind: 'SHOT', element: 'fire', damageMul: 0.8 },
    { value: 2, kind: 'SHOT', element: 'ice', damageMul: 0.8 },
    { value: 3, kind: 'SHOT', element: 'poison', damageMul: 0.8 },
    { value: 4, kind: 'SHOT', element: 'lightning', damageMul: 0.8 },
    { value: 5, kind: 'PULSE', element: 'fire', damageMul: 0.9 },
    { value: 6, kind: 'BURST', element: 'arcane', damageMul: 1.0, projectileCount: 3 },
  ],
};

const necromancerStart: DieConfig = {
  id: 'necro_d6',
  rollDuration: BALANCE.die.baseRollDuration,
  faces: [
    { value: 1, kind: 'SHOT', element: 'none', damageMul: 0.8 },
    { value: 2, kind: 'SHOT', element: 'none', damageMul: 0.8 },
    { value: 3, kind: 'BURST', element: 'none', damageMul: 0.8, projectileCount: 2 },
    { value: 4, kind: 'SOUL_DRAIN', element: 'arcane', damageMul: 1.05 },
    { value: 5, kind: 'HEAL', element: 'none' },
    { value: 6, kind: 'SOUL_DRAIN', element: 'arcane', damageMul: 1.4 },
  ],
};

const berserkerStart: DieConfig = {
  id: 'berserker_d6',
  rollDuration: BALANCE.die.baseRollDuration * 0.8,
  faces: [
    { value: 1, kind: 'SHOT', element: 'none', damageMul: 0.95 },
    { value: 2, kind: 'RAGE_SMASH', element: 'none', damageMul: 1.05 },
    { value: 3, kind: 'BURST', element: 'none', damageMul: 0.95, projectileCount: 3 },
    { value: 4, kind: 'RAGE_SMASH', element: 'none', damageMul: 1.2 },
    { value: 5, kind: 'PULSE', element: 'none', damageMul: 1.1 },
    { value: 6, kind: 'RAGE_SMASH', element: 'none', damageMul: 1.55 },
  ],
};

const clockmakerStart: DieConfig = {
  id: 'clock_d6',
  rollDuration: BALANCE.die.baseRollDuration * 1.2,
  faces: [
    { value: 1, kind: 'CHARGED_BOLT', element: 'none', damageMul: 0.85 },
    { value: 2, kind: 'CHARGED_BOLT', element: 'none', damageMul: 0.95 },
    { value: 3, kind: 'BURST', element: 'none', damageMul: 0.85, projectileCount: 2 },
    { value: 4, kind: 'SHIELD', element: 'none' },
    { value: 5, kind: 'CHARGED_BOLT', element: 'none', damageMul: 1.1 },
    { value: 6, kind: 'PULSE', element: 'ice', damageMul: 1.2 },
  ],
};

export const CHARACTERS: Character[] = [
  {
    id: 'soldier',
    name: 'Soldier',
    tagline: 'Balanced. Reliable. Unbroken.',
    description: 'Standard d6. Fires steel bullets: fast, reliable, straight.',
    color: '#8aa7ff',
    spriteId: 'char_soldier',
    startingDice: [soldierStart],
    baseProjectile: PROJECTILE_ARCHETYPES.soldier_bullet!,
    exclusiveUpgrades: [],
    passive: {},
  },
  {
    id: 'gambler',
    name: 'Gambler',
    tagline: 'Big risks. Bigger rolls.',
    description: 'Hurls loaded chips. 20% crit for massive damage, 8% dud. Streaks reward you.',
    color: '#e2b04a',
    spriteId: 'char_gambler',
    startingDice: [gamblerStart],
    baseProjectile: PROJECTILE_ARCHETYPES.gambler_chip!,
    exclusiveUpgrades: [],
    passive: {
      onRoll: ({ face }) => {
        if (face.kind === 'BLANK') {
          const run = getRunState();
          if (run) run.shield = Math.min(10, run.shield + 1);
        }
      },
    },
  },
  {
    id: 'alchemist',
    name: 'Alchemist',
    tagline: 'Mix elements. Watch them react.',
    description: 'Lobs elemental flasks that splash on hit and extend status effects.',
    color: '#6fe0c2',
    spriteId: 'char_alchemist',
    startingDice: [alchemistStart],
    baseProjectile: PROJECTILE_ARCHETYPES.alchemist_flask!,
    exclusiveUpgrades: [],
    passive: {},
  },
  {
    id: 'necromancer',
    name: 'Necromancer',
    tagline: 'Collect souls. Drain power.',
    description: 'Flings bone shards. Damage scales with souls. Executes wounded foes.',
    color: '#c99cff',
    spriteId: 'char_necromancer',
    startingDice: [necromancerStart],
    baseProjectile: PROJECTILE_ARCHETYPES.necromancer_bone!,
    exclusiveUpgrades: [],
    passive: {},
  },
  {
    id: 'berserker',
    name: 'Berserker',
    tagline: 'Chain kills. Ignore fear.',
    description: 'Whirls heavy axes. Bigger, slower, pierces one enemy. Every hit builds Rage.',
    color: '#ff5c5c',
    spriteId: 'char_berserker',
    startingDice: [berserkerStart],
    baseProjectile: PROJECTILE_ARCHETYPES.berserker_axe!,
    exclusiveUpgrades: [],
    passive: {},
  },
  {
    id: 'clockmaker',
    name: 'Clockmaker',
    tagline: 'Patience wins the war.',
    description: 'Tosses ticking gears. Every hit briefly freezes and slows enemies.',
    color: '#9adcff',
    spriteId: 'char_clockmaker',
    startingDice: [clockmakerStart],
    baseProjectile: PROJECTILE_ARCHETYPES.clockmaker_gear!,
    exclusiveUpgrades: [],
    passive: {},
    unlockCondition: (meta) => meta.totalRunsCompleted >= BALANCE.meta.clockmakerUnlockRuns,
    unlockHint: `Complete ${BALANCE.meta.clockmakerUnlockRuns} runs to unlock.`,
  },
];

let initialized = false;

export function initCharacterContent(): void {
  if (initialized) return;
  initialized = true;
  registerCharacters(CHARACTERS);
}
