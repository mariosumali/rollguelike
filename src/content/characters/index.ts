import type { Character, DieConfig } from '../../types';
import type { CharacterDefaultFace, SlotRestriction } from '../upgrades/types';
import { registerCharacters } from './registry';
import { BALANCE } from '../../config/balance';
import { getRunState } from '../../state/store';
import { PROJECTILE_ARCHETYPES } from './projectiles';

function face(upgradeId: string, projectileCount: number, element?: CharacterDefaultFace['element']): CharacterDefaultFace {
  return { kind: 'default', upgradeId, projectileCount, element };
}

function blankFace(element?: CharacterDefaultFace['element']): CharacterDefaultFace {
  return { kind: 'default', upgradeId: null, projectileCount: 0, element };
}

const SOLDIER_DEFAULTS: CharacterDefaultFace[] = [
  blankFace(),
  blankFace(),
  face('std_shot', 2),
  face('std_shot', 2),
  face('std_shot', 3),
  face('std_shot', 3),
];

const GAMBLER_DEFAULTS: CharacterDefaultFace[] = [
  face('std_shot', 2),
  face('std_shot', 0),
  face('std_shot', 0),
  face('std_shot', 0),
  face('std_shot', 0),
  face('std_shot', 2),
];

const ALCHEMIST_DEFAULTS: CharacterDefaultFace[] = [
  blankFace('fire'),
  face('aqua_bolt', 1, 'ice'),
  blankFace('poison'),
  face('arc_bolt', 1, 'lightning'),
  face('std_shot', 1, 'arcane'),
  face('std_shot', 1, 'none'),
];

const ALCHEMIST_RESTRICT: SlotRestriction[] = [
  { slotIndex: 0, allowedTags: ['fire'] },
  { slotIndex: 1, allowedTags: ['water', 'ice'] },
  { slotIndex: 2, allowedTags: ['earth', 'poison'] },
  { slotIndex: 3, allowedTags: ['air', 'lightning'] },
  { slotIndex: 4, allowedTags: ['arcane'] },
  { slotIndex: 5, allowedTags: ['nature'] },
];

const NECROMANCER_DEFAULTS: CharacterDefaultFace[] = [
  blankFace(),
  blankFace(),
  face('std_shot', 2),
  face('std_shot', 2),
  face('std_shot', 2),
  { kind: 'default', upgradeId: 'std_shot', projectileCount: 1, restrictedReplacement: true },
];

const BERSERKER_DEFAULTS: CharacterDefaultFace[] = [
  blankFace(),
  blankFace(),
  face('std_shot', 1),
  face('std_shot', 1),
  face('pulse_nova', 1),
  face('pulse_nova', 1),
];

const CLOCKMAKER_DEFAULTS: CharacterDefaultFace[] = [
  blankFace(),
  blankFace(),
  face('std_shot', 1),
  face('std_shot', 2),
  face('std_shot', 2, 'ice'),
  face('pulse_nova', 1, 'ice'),
];

function d6(id: string, baseDmg = 0.9): DieConfig {
  return {
    id,
    rollDuration: BALANCE.die.baseRollDuration,
    faces: [
      { value: 1, kind: 'BLANK', element: 'none' },
      { value: 2, kind: 'BLANK', element: 'none' },
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
    { value: 1, kind: 'BLANK', element: 'none' },
    { value: 2, kind: 'SHOT', element: 'ice', damageMul: 0.8 },
    { value: 3, kind: 'BLANK', element: 'none' },
    { value: 4, kind: 'SHOT', element: 'lightning', damageMul: 0.8 },
    { value: 5, kind: 'PULSE', element: 'fire', damageMul: 0.9 },
    { value: 6, kind: 'BURST', element: 'arcane', damageMul: 1.0, projectileCount: 3 },
  ],
};

const necromancerStart: DieConfig = {
  id: 'necro_d6',
  rollDuration: BALANCE.die.baseRollDuration,
  faces: [
    { value: 1, kind: 'BLANK', element: 'none' },
    { value: 2, kind: 'BLANK', element: 'none' },
    { value: 3, kind: 'BURST', element: 'none', damageMul: 0.7, projectileCount: 2 },
    { value: 4, kind: 'SOUL_DRAIN', element: 'arcane', damageMul: 0.85 },
    { value: 5, kind: 'HEAL', element: 'none' },
    { value: 6, kind: 'SOUL_DRAIN', element: 'arcane', damageMul: 1.1 },
  ],
};

const berserkerStart: DieConfig = {
  id: 'berserker_d6',
  rollDuration: BALANCE.die.baseRollDuration * 0.8,
  faces: [
    { value: 1, kind: 'BLANK', element: 'none' },
    { value: 2, kind: 'BLANK', element: 'none' },
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
    { value: 1, kind: 'BLANK', element: 'none' },
    { value: 2, kind: 'BLANK', element: 'none' },
    { value: 3, kind: 'BURST', element: 'none', damageMul: 0.85, projectileCount: 2 },
    { value: 4, kind: 'SHIELD', element: 'none' },
    { value: 5, kind: 'CHARGED_BOLT', element: 'none', damageMul: 1.1 },
    { value: 6, kind: 'PULSE', element: 'ice', damageMul: 1.2 },
  ],
};

export const CHARACTERS: Character[] = [
  {
    id: 'soldier',
    name: 'Knight',
    tagline: 'Balanced. Reliable. Unbroken.',
    description: 'Standard d6. Hurls steel bolts: fast, reliable, straight.',
    color: '#8aa7ff',
    spriteId: 'char_soldier',
    startingDice: [soldierStart],
    baseProjectile: PROJECTILE_ARCHETYPES.soldier_bullet!,
    exclusiveUpgrades: [],
    passive: {},
    defaultFaces: SOLDIER_DEFAULTS,
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
        const run = getRunState();
        if (!run) return;
        if (face.kind === 'BLANK') {
          run.shield = Math.min(10, run.shield + 1);
        }
        const extremes = BALANCE.gambler.gambitExtremes as readonly number[];
        if (extremes.includes(face.value)) {
          run.gambitStacks = Math.min(
            BALANCE.gambler.gambitMaxStacks,
            run.gambitStacks + 1,
          );
        } else {
          run.gambitStacks = 0;
        }
      },
    },
    defaultFaces: GAMBLER_DEFAULTS,
    unlockCondition: (meta) =>
      (meta.maxGoldSpentInRun ?? 0) >= BALANCE.meta.gamblerUnlockGoldSpent,
    unlockHint: `Spend ${BALANCE.meta.gamblerUnlockGoldSpent} gold in a single run.`,
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
    defaultFaces: ALCHEMIST_DEFAULTS,
    restrictedKinds: ALCHEMIST_RESTRICT,
    unlockCondition: (meta) =>
      (meta.maxWaveReached ?? 0) >= BALANCE.meta.alchemistUnlockWave,
    unlockHint: `Reach wave ${BALANCE.meta.alchemistUnlockWave} in a single run.`,
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
    defaultFaces: NECROMANCER_DEFAULTS,
    lockedSlots: [5],
    unlockCondition: (meta) =>
      (meta.totalKills ?? 0) >= BALANCE.meta.necromancerUnlockKills,
    unlockHint: `Slay ${BALANCE.meta.necromancerUnlockKills} enemies across all runs.`,
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
    defaultFaces: BERSERKER_DEFAULTS,
    unlockCondition: (meta) =>
      (meta.bestSingleRunKills ?? 0) >= BALANCE.meta.berserkerUnlockRunKills,
    unlockHint: `Slay ${BALANCE.meta.berserkerUnlockRunKills} enemies in a single run.`,
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
    defaultFaces: CLOCKMAKER_DEFAULTS,
    // Intentionally unreachable for now — a future "Go back in time" mechanic
    // will replace this predicate.
    unlockCondition: () => false,
    unlockHint: 'Go back in time.',
  },
];

let initialized = false;

export function initCharacterContent(): void {
  if (initialized) return;
  initialized = true;
  registerCharacters(CHARACTERS);
}
