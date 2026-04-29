import type { Character, DieConfig, Face } from '../../types';
import type { CharacterDefaultFace, SlotRestriction } from '../upgrades/types';
import { registerCharacters } from './registry';
import { BALANCE } from '../../config/balance';
import { getRunState } from '../../state/store';
import { PROJECTILE_ARCHETYPES } from './projectiles';

function baseFace(
  name: string,
  description: string,
  face: Omit<Face, 'value'>,
  restrictedReplacement = false,
): CharacterDefaultFace {
  return { kind: 'default', name, description, face, restrictedReplacement };
}

const SOLDIER_DEFAULTS: CharacterDefaultFace[] = [
  baseFace('Quick Cut', 'A light opening shot.', { kind: 'SHOT', element: 'none', projectileCount: 1, damageMul: 0.9 }),
  baseFace('Guard Bolt', 'A steady weak shot.', { kind: 'SHOT', element: 'none', projectileCount: 1, damageMul: 1.0 }),
  baseFace('Steel Spray', 'A modest spread of steel.', { kind: 'BURST', element: 'none', projectileCount: 2, damageMul: 0.8 }),
  baseFace('Brace', 'Raise a defensive guard.', { kind: 'SHIELD', element: 'none' }),
  baseFace('Field Shot', 'Strike while recovering.', { kind: 'SHOT', element: 'none', projectileCount: 2, damageMul: 0.85 }),
  baseFace('Shield Pulse', 'A close-range pulse.', { kind: 'PULSE', element: 'none', damageMul: 0.85 }),
];

const GAMBLER_DEFAULTS: CharacterDefaultFace[] = [
  baseFace('Snake Eye', 'A risky chip toss.', { kind: 'SHOT', element: 'none', projectileCount: 1, damageMul: 0.65 }),
  baseFace('Chip Toss', 'A reliable tossed chip.', { kind: 'SHOT', element: 'none', projectileCount: 2, damageMul: 0.85 }),
  baseFace('Split Pot', 'A short fan of chips.', { kind: 'BURST', element: 'none', projectileCount: 3, damageMul: 0.9 }),
  baseFace('Double Down', 'Repeat the last face.', { kind: 'WILD', element: 'none', damageMul: 1.2 }),
  baseFace('Lucky Guard', 'Bank a little protection.', { kind: 'SHIELD', element: 'none' }),
  baseFace('Jackpot Spark', 'A high roll blast.', { kind: 'PULSE', element: 'none', damageMul: 1.15 }),
];

const ALCHEMIST_DEFAULTS: CharacterDefaultFace[] = [
  baseFace('Ember Vial', 'A small fire flask.', { kind: 'SHOT', element: 'fire', projectileCount: 1, damageMul: 0.75 }),
  baseFace('Frost Vial', 'A cold flask with a light hit.', { kind: 'SHOT', element: 'ice', projectileCount: 1, damageMul: 0.75 }),
  baseFace('Venom Vial', 'A poison flask poke.', { kind: 'SHOT', element: 'poison', projectileCount: 1, damageMul: 0.75 }),
  baseFace('Storm Vial', 'A lightning flask poke.', { kind: 'SHOT', element: 'lightning', projectileCount: 1, damageMul: 0.75 }),
  baseFace('Arcane Pop', 'A small arcane pulse.', { kind: 'PULSE', element: 'arcane', damageMul: 0.8 }),
  baseFace('Glass Scatter', 'A compact flask spread.', { kind: 'BURST', element: 'none', projectileCount: 2, damageMul: 0.85 }),
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
  baseFace('Bone Splinter', 'A brittle bone shot.', { kind: 'SHOT', element: 'none', projectileCount: 1, damageMul: 0.65 }),
  baseFace('Grave Spark', 'A faint soul shot.', { kind: 'SHOT', element: 'arcane', projectileCount: 1, damageMul: 0.7 }),
  baseFace('Bone Shards', 'A small bone spread.', { kind: 'BURST', element: 'none', projectileCount: 2, damageMul: 0.75 }),
  baseFace('Soul Sip', 'Spend souls for a blast, or fire a weak shard.', { kind: 'SOUL_DRAIN', element: 'arcane', damageMul: 0.8 }),
  baseFace('Bone Mending', 'Knit flesh with grave dust.', { kind: 'HEAL', element: 'none' }),
  baseFace('Soul Anchor', 'A bound soul drain that cannot be replaced.', { kind: 'SOUL_DRAIN', element: 'arcane', damageMul: 1.0 }, true),
];

const BERSERKER_DEFAULTS: CharacterDefaultFace[] = [
  baseFace('Anger Spark', 'A weak hit to start the chain.', { kind: 'SHOT', element: 'none', projectileCount: 1, damageMul: 0.55 }),
  baseFace('Axe Flick', 'A quick thrown axe.', { kind: 'SHOT', element: 'none', projectileCount: 1, damageMul: 0.7 }),
  baseFace('Axe Sweep', 'A short sweeping burst.', { kind: 'BURST', element: 'none', projectileCount: 2, damageMul: 0.8 }),
  baseFace('Rage Chop', 'A smash that scales with Rage.', { kind: 'RAGE_SMASH', element: 'none', damageMul: 0.95 }),
  baseFace('War Stomp', 'A close pulse of force.', { kind: 'PULSE', element: 'none', damageMul: 0.85 }),
  baseFace('Blood Roar', 'A heavy rage smash.', { kind: 'RAGE_SMASH', element: 'none', damageMul: 1.25 }),
];

const CLOCKMAKER_DEFAULTS: CharacterDefaultFace[] = [
  baseFace('Tick', 'A small gear shot.', { kind: 'SHOT', element: 'none', projectileCount: 1, damageMul: 0.6 }),
  baseFace('Tock', 'A measured gear shot.', { kind: 'SHOT', element: 'none', projectileCount: 1, damageMul: 0.75 }),
  baseFace('Gear Toss', 'A heavier gear hit.', { kind: 'SHOT', element: 'none', projectileCount: 2, damageMul: 0.8 }),
  baseFace('Wind-Up Guard', 'Raise a precise shield.', { kind: 'SHIELD', element: 'none' }),
  baseFace('Charged Gear', 'A charged frost gear.', { kind: 'CHARGED_BOLT', element: 'ice', projectileCount: 1, damageMul: 0.95 }),
  baseFace('Time Ripple', 'A chilling clock pulse.', { kind: 'PULSE', element: 'ice', damageMul: 1.0 }),
];

function d6(id: string, baseDmg = 0.9): DieConfig {
  return {
    id,
    rollDuration: BALANCE.die.baseRollDuration,
    faces: [
      { value: 1, kind: 'SHOT', element: 'none', damageMul: 0.55, projectileCount: 1 },
      { value: 2, kind: 'SHOT', element: 'none', damageMul: 0.7, projectileCount: 1 },
      { value: 3, kind: 'BURST', element: 'none', damageMul: baseDmg * 0.9, projectileCount: 2 },
      { value: 4, kind: 'SHIELD', element: 'none' },
      { value: 5, kind: 'HEAL', element: 'none' },
      { value: 6, kind: 'PULSE', element: 'none', damageMul: baseDmg * 0.95 },
    ],
  };
}

const soldierStart: DieConfig = d6('soldier_d6', 0.9);

const gamblerStart: DieConfig = {
  id: 'gambler_d6',
  rollDuration: BALANCE.die.baseRollDuration,
  faces: [
    { value: 1, kind: 'SHOT', element: 'none', damageMul: 0.65, projectileCount: 1 },
    { value: 2, kind: 'SHOT', element: 'none', damageMul: 0.85, projectileCount: 2 },
    { value: 3, kind: 'BURST', element: 'none', damageMul: 0.9, projectileCount: 3 },
    { value: 4, kind: 'WILD', element: 'none', damageMul: 1.2 },
    { value: 5, kind: 'SHIELD', element: 'none' },
    { value: 6, kind: 'PULSE', element: 'none', damageMul: 1.15 },
  ],
};

const alchemistStart: DieConfig = {
  id: 'alchemist_d6',
  rollDuration: BALANCE.die.baseRollDuration,
  faces: [
    { value: 1, kind: 'SHOT', element: 'fire', damageMul: 0.75, projectileCount: 1 },
    { value: 2, kind: 'SHOT', element: 'ice', damageMul: 0.75, projectileCount: 1 },
    { value: 3, kind: 'SHOT', element: 'poison', damageMul: 0.75, projectileCount: 1 },
    { value: 4, kind: 'SHOT', element: 'lightning', damageMul: 0.75, projectileCount: 1 },
    { value: 5, kind: 'PULSE', element: 'arcane', damageMul: 0.8 },
    { value: 6, kind: 'BURST', element: 'none', damageMul: 0.85, projectileCount: 2 },
  ],
};

const necromancerStart: DieConfig = {
  id: 'necro_d6',
  rollDuration: BALANCE.die.baseRollDuration,
  faces: [
    { value: 1, kind: 'SHOT', element: 'none', damageMul: 0.65, projectileCount: 1 },
    { value: 2, kind: 'SHOT', element: 'arcane', damageMul: 0.7, projectileCount: 1 },
    { value: 3, kind: 'BURST', element: 'none', damageMul: 0.75, projectileCount: 2 },
    { value: 4, kind: 'SOUL_DRAIN', element: 'arcane', damageMul: 0.8 },
    { value: 5, kind: 'HEAL', element: 'none' },
    { value: 6, kind: 'SOUL_DRAIN', element: 'arcane', damageMul: 1.0 },
  ],
};

const berserkerStart: DieConfig = {
  id: 'berserker_d6',
  rollDuration: BALANCE.die.baseRollDuration * 0.8,
  faces: [
    { value: 1, kind: 'SHOT', element: 'none', damageMul: 0.55, projectileCount: 1 },
    { value: 2, kind: 'SHOT', element: 'none', damageMul: 0.7, projectileCount: 1 },
    { value: 3, kind: 'BURST', element: 'none', damageMul: 0.8, projectileCount: 2 },
    { value: 4, kind: 'RAGE_SMASH', element: 'none', damageMul: 0.95 },
    { value: 5, kind: 'PULSE', element: 'none', damageMul: 0.85 },
    { value: 6, kind: 'RAGE_SMASH', element: 'none', damageMul: 1.25 },
  ],
};

const clockmakerStart: DieConfig = {
  id: 'clock_d6',
  rollDuration: BALANCE.die.baseRollDuration * 1.2,
  faces: [
    { value: 1, kind: 'SHOT', element: 'none', damageMul: 0.6, projectileCount: 1 },
    { value: 2, kind: 'SHOT', element: 'none', damageMul: 0.75, projectileCount: 1 },
    { value: 3, kind: 'SHOT', element: 'none', damageMul: 0.8, projectileCount: 2 },
    { value: 4, kind: 'SHIELD', element: 'none' },
    { value: 5, kind: 'CHARGED_BOLT', element: 'ice', damageMul: 0.95, projectileCount: 1 },
    { value: 6, kind: 'PULSE', element: 'ice', damageMul: 1.0 },
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
    exclusiveUpgrades: ['overwatch', 'bastion_bolt'],
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
    exclusiveUpgrades: ['all_in', 'loaded_jackpot'],
    passive: {
      onRoll: ({ face }) => {
        const run = getRunState();
        if (!run) return;
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
    exclusiveUpgrades: ['transmute', 'reaction_mastery', 'volatile_mixture'],
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
    exclusiveUpgrades: ['soul_harvest', 'grave_contract'],
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
    exclusiveUpgrades: ['bloodrush', 'rage_cyclone'],
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
    exclusiveUpgrades: ['time_snare'],
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
