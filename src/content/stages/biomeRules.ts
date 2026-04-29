import type { BiomeRule, WaveArchetypeId } from '../../types';
import { stageIndexForWave } from './themes';

const balanced: Partial<Record<WaveArchetypeId, number>> = {
  mixed: 4,
  rush: 2,
  escort: 1,
  splitterFlood: 1,
  ambush: 1,
};

export const BIOME_RULES: BiomeRule[] = [
  {
    id: 'meadow',
    name: 'Meadow Muster',
    shortName: 'MEADOW',
    desc: 'Balanced early formations teach target priority.',
    archetypeWeights: balanced,
  },
  {
    id: 'cavern',
    name: 'Cavern Crush',
    shortName: 'CAVERN',
    desc: 'Denser rushes and splitter packs force quick cleanup.',
    enemyHpMul: 0.94,
    enemySpeedMul: 1.04,
    archetypeWeights: { rush: 4, splitterFlood: 3, mixed: 2, eliteDuel: 1 },
    enemyWeights: { rusher: 1.3, swarm: 1.25, splitter: 1.2 },
  },
  {
    id: 'graveyard',
    name: 'Grave Pact',
    shortName: 'GRAVE',
    desc: 'Support and resurrection threats define the wave.',
    enemyHpMul: 1.04,
    archetypeWeights: { escort: 4, ambush: 2, puzzle: 2, mixed: 1 },
    enemyWeights: { healer: 1.45, resurrector: 1.4, invisible: 1.25 },
  },
  {
    id: 'castle',
    name: 'Castle Guard',
    shortName: 'CASTLE',
    desc: 'Armored formations and elites test focused damage.',
    enemyHpMul: 1.08,
    enemySpeedMul: 0.96,
    eliteChanceBonus: 0.06,
    archetypeWeights: { escort: 3, eliteDuel: 3, puzzle: 2, mixed: 1 },
    enemyWeights: { tank: 1.4, reflector: 1.25, immune: 1.2 },
  },
  {
    id: 'sky',
    name: 'Sky Riddle',
    shortName: 'SKY',
    desc: 'Odd, reflective, and evasive enemies reward flexible dice.',
    enemySpeedMul: 1.05,
    eliteChanceBonus: 0.03,
    archetypeWeights: { puzzle: 4, ambush: 3, eliteDuel: 1, mixed: 1 },
    enemyWeights: { oddonly: 1.5, invisible: 1.3, reflector: 1.25, immune: 1.25 },
  },
  {
    id: 'volcano',
    name: 'Volcanic Surge',
    shortName: 'VOLCANO',
    desc: 'Fast, volatile pressure waves reward decisive builds.',
    enemyHpMul: 0.98,
    enemySpeedMul: 1.08,
    eliteChanceBonus: 0.08,
    archetypeWeights: { rush: 3, eliteDuel: 3, splitterFlood: 2, mixed: 1 },
    enemyWeights: { rusher: 1.25, absorber: 1.3, inverter: 1.25 },
  },
];

export function biomeRuleForWave(wave: number): BiomeRule {
  return BIOME_RULES[stageIndexForWave(wave) % BIOME_RULES.length] ?? BIOME_RULES[0]!;
}

export function getBiomeRule(id: string | undefined): BiomeRule | null {
  if (!id) return null;
  return BIOME_RULES.find((rule) => rule.id === id) ?? null;
}
