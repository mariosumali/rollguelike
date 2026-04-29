import type { RunMutator } from '../types';
import { pick } from '../engine/rng';

export const RUN_MUTATORS: RunMutator[] = [
  {
    id: 'high_roller',
    name: 'Royal High Roll',
    shortName: 'ROYAL',
    desc: 'Faces 5-6 hit harder. Faces 1-2 recover faster.',
    premise: 'The court declares high faces noble and low faces quick.',
    entryLine: 'The court watches for royal pips.',
    rewardLine: 'The House pays extra attention to high faces.',
    enemyFamilyBias: { court: 1.35, mirror: 1.12 },
    modifiers: { highRollDamageMul: 1.3, lowRollCooldownMul: 0.82, forgeRarityBonus: 0.08 },
  },
  {
    id: 'crowded_board',
    name: 'Debt Rush',
    shortName: 'DEBT',
    desc: 'More enemies enter each wave, but their health is lower and kills pay more.',
    premise: 'The House calls in small debts all at once.',
    entryLine: 'Collectors crowd the felt.',
    rewardLine: 'Every paid debt shakes loose more gold.',
    enemyFamilyBias: { debt: 1.45, brood: 1.25 },
    modifiers: { enemyCountMul: 1.28, enemyHpMul: 0.78, goldMul: 1.25 },
  },
  {
    id: 'heavy_forge',
    name: 'Iron Contract',
    shortName: 'IRON',
    desc: 'The forge favors rarer work, but enemies are sturdier.',
    premise: 'The forge opens its best drawer after the vaults reinforce their doors.',
    entryLine: 'Vault servants march under iron terms.',
    rewardLine: 'Heavy contracts bring heavier offers.',
    enemyFamilyBias: { vault: 1.45, furnace: 1.2 },
    modifiers: { enemyHpMul: 1.08, forgeRarityBonus: 0.22 },
  },
  {
    id: 'glass_dice',
    name: 'Glass House',
    shortName: 'GLASS',
    desc: 'You deal and take more damage. Fights end quickly either way.',
    premise: 'Every wall is a mirror and every mistake cuts twice.',
    entryLine: 'The mirror hall invites fast violence.',
    rewardLine: 'Glass breaks both ways.',
    enemyFamilyBias: { mirror: 1.45, null: 1.12 },
    modifiers: { playerDamageMul: 1.28, playerDamageTakenMul: 1.2 },
  },
  {
    id: 'elite_bounty',
    name: 'Marked Bounty',
    shortName: 'BOUNTY',
    desc: 'Elites appear more often and pay out more gold.',
    premise: 'The House marks decorated servants with gold ink.',
    entryLine: 'A bounty seal appears on the ledger.',
    rewardLine: 'Marked servants pay marked prices.',
    enemyFamilyBias: { vault: 1.18, court: 1.18, suture: 1.08 },
    modifiers: { eliteChanceBonus: 0.12, goldMul: 1.15 },
  },
  {
    id: 'odd_moon',
    name: 'Odd Moon Decree',
    shortName: 'ODD',
    desc: 'Dice-puzzle enemies arrive earlier, and forge odds improve slightly.',
    premise: 'The moon over the House only counts one, three, and five.',
    entryLine: 'Odd pips glow above the roof.',
    rewardLine: 'The forge respects a strange decree.',
    enemyFamilyBias: { court: 1.35, vault: 1.16, mirror: 1.08 },
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
