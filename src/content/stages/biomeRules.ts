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
    name: 'Foyer Muster',
    shortName: 'FOYER',
    desc: 'Balanced early formations teach target priority.',
    roomTitle: 'The Front Foyer',
    roomLine: 'The House tests new rollers with polite violence.',
    archetypeWeights: balanced,
    enemyFamilyBias: { debt: 1.15, brood: 1.08, court: 1.05 },
  },
  {
    id: 'cavern',
    name: 'Debt Kennel',
    shortName: 'KENNEL',
    desc: 'Denser rushes and splitter packs force quick cleanup.',
    roomTitle: 'The Debt Kennel',
    roomLine: 'Collectors and loaded brood spill from the side doors.',
    enemyHpMul: 0.94,
    enemySpeedMul: 1.04,
    archetypeWeights: { rush: 4, splitterFlood: 3, mixed: 2, eliteDuel: 1 },
    enemyWeights: { rusher: 1.3, swarm: 1.25, splitter: 1.2 },
    enemyFamilyBias: { debt: 1.35, brood: 1.28 },
  },
  {
    id: 'graveyard',
    name: 'Infirmary Pact',
    shortName: 'GRAVE',
    desc: 'Support and resurrection threats define the wave.',
    roomTitle: 'The Red Infirmary',
    roomLine: 'Surgeons and ushers keep the House servants standing.',
    enemyHpMul: 1.04,
    archetypeWeights: { escort: 4, ambush: 2, puzzle: 2, mixed: 1 },
    enemyWeights: { healer: 1.45, resurrector: 1.4, invisible: 1.25 },
    enemyFamilyBias: { suture: 1.4, grave: 1.35 },
  },
  {
    id: 'castle',
    name: 'Vault Guard',
    shortName: 'VAULT',
    desc: 'Armored formations and elites test focused damage.',
    roomTitle: 'The Locked Vault',
    roomLine: 'Iron doors walk, and the best guards wear seals.',
    enemyHpMul: 1.08,
    enemySpeedMul: 0.96,
    eliteChanceBonus: 0.06,
    archetypeWeights: { escort: 3, eliteDuel: 3, puzzle: 2, mixed: 1 },
    enemyWeights: { tank: 1.4, reflector: 1.25, immune: 1.2 },
    enemyFamilyBias: { vault: 1.45, mirror: 1.12 },
  },
  {
    id: 'sky',
    name: 'Mirror Riddle',
    shortName: 'MIRROR',
    desc: 'Odd, reflective, and evasive enemies reward flexible dice.',
    roomTitle: 'The Mirror Hall',
    roomLine: 'Every reflection asks the die a different question.',
    enemySpeedMul: 1.05,
    eliteChanceBonus: 0.03,
    archetypeWeights: { puzzle: 4, ambush: 3, eliteDuel: 1, mixed: 1 },
    enemyWeights: { oddonly: 1.5, invisible: 1.3, reflector: 1.25, immune: 1.25 },
    enemyFamilyBias: { mirror: 1.35, court: 1.3, null: 1.1 },
  },
  {
    id: 'volcano',
    name: 'Furnace Surge',
    shortName: 'FURNACE',
    desc: 'Fast, volatile pressure waves reward decisive builds.',
    roomTitle: 'The Hellfire Furnace',
    roomLine: 'The forge below the House coughs up volatile servants.',
    enemyHpMul: 0.98,
    enemySpeedMul: 1.08,
    eliteChanceBonus: 0.08,
    archetypeWeights: { rush: 3, eliteDuel: 3, splitterFlood: 2, mixed: 1 },
    enemyWeights: { rusher: 1.25, absorber: 1.3, inverter: 1.25 },
    enemyFamilyBias: { furnace: 1.25, null: 1.25, court: 1.18 },
  },
];

export function biomeRuleForWave(wave: number): BiomeRule {
  return BIOME_RULES[stageIndexForWave(wave) % BIOME_RULES.length] ?? BIOME_RULES[0]!;
}

export function getBiomeRule(id: string | undefined): BiomeRule | null {
  if (!id) return null;
  return BIOME_RULES.find((rule) => rule.id === id) ?? null;
}
