import type { RunMutator } from '../types';
import { pick } from '../engine/rng';

export const RUN_MUTATORS: RunMutator[] = [
  {
    id: 'high_roller',
    name: 'High Roller',
    shortName: 'HIGH ROLL',
    desc: 'Faces 5-6 hit harder. Faces 1-2 recover faster.',
    modifiers: { highRollDamageMul: 1.3, lowRollCooldownMul: 0.82, forgeRarityBonus: 0.08 },
  },
  {
    id: 'crowded_board',
    name: 'Crowded Board',
    shortName: 'CROWDED',
    desc: 'More enemies enter each wave, but their health is lower and kills pay more.',
    modifiers: { enemyCountMul: 1.28, enemyHpMul: 0.78, goldMul: 1.25 },
  },
  {
    id: 'heavy_forge',
    name: 'Heavy Forge',
    shortName: 'HEAVY FORGE',
    desc: 'The forge favors rarer work, but enemies are sturdier.',
    modifiers: { enemyHpMul: 1.08, forgeRarityBonus: 0.22 },
  },
  {
    id: 'glass_dice',
    name: 'Glass Dice',
    shortName: 'GLASS',
    desc: 'You deal and take more damage. Fights end quickly either way.',
    modifiers: { playerDamageMul: 1.28, playerDamageTakenMul: 1.2 },
  },
  {
    id: 'elite_bounty',
    name: 'Elite Bounty',
    shortName: 'BOUNTY',
    desc: 'Elites appear more often and pay out more gold.',
    modifiers: { eliteChanceBonus: 0.12, goldMul: 1.15 },
  },
  {
    id: 'odd_moon',
    name: 'Odd Moon',
    shortName: 'ODD MOON',
    desc: 'Dice-puzzle enemies arrive earlier, and forge odds improve slightly.',
    modifiers: { forceOddEvenEarly: true, forgeRarityBonus: 0.1, enemySpeedMul: 0.97 },
  },
];

export function getRunMutator(id: string | undefined): RunMutator | null {
  if (!id) return null;
  return RUN_MUTATORS.find((m) => m.id === id) ?? null;
}

export function pickRunMutator(rng: () => number): RunMutator {
  return pick(rng, RUN_MUTATORS);
}
