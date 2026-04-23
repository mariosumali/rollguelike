import type { Element } from '../types';
import { ELEMENT_COLORS } from '../sprites/effects';

export interface Reaction {
  name: string;
  damage: number;
  radius: number;
  color: string;
  effect: 'explode' | 'freeze' | 'poison' | 'shock';
}

const REACTION_TABLE: Record<string, Reaction> = {
  'fire+ice': { name: 'Steam', damage: 30, radius: 32, color: ELEMENT_COLORS.ice, effect: 'explode' },
  'fire+poison': { name: 'Detonate', damage: 50, radius: 40, color: ELEMENT_COLORS.fire, effect: 'explode' },
  'fire+lightning': { name: 'Overload', damage: 40, radius: 28, color: ELEMENT_COLORS.lightning, effect: 'shock' },
  'ice+lightning': { name: 'Shatter', damage: 55, radius: 32, color: ELEMENT_COLORS.ice, effect: 'freeze' },
  'ice+poison': { name: 'Wither', damage: 35, radius: 30, color: ELEMENT_COLORS.poison, effect: 'poison' },
  'poison+lightning': { name: 'Corrode', damage: 45, radius: 28, color: ELEMENT_COLORS.poison, effect: 'shock' },
  'fire+arcane': { name: 'Rupture', damage: 60, radius: 36, color: ELEMENT_COLORS.arcane, effect: 'explode' },
  'ice+arcane': { name: 'Prism', damage: 55, radius: 34, color: ELEMENT_COLORS.arcane, effect: 'freeze' },
  'poison+arcane': { name: 'Corrupt', damage: 50, radius: 32, color: ELEMENT_COLORS.arcane, effect: 'poison' },
  'lightning+arcane': { name: 'Cascade', damage: 55, radius: 30, color: ELEMENT_COLORS.arcane, effect: 'shock' },
};

export function getReaction(a: Element, b: Element): Reaction | null {
  if (a === 'none' || b === 'none' || a === b) return null;
  const key = [a, b].sort().join('+');
  return REACTION_TABLE[key] ?? null;
}

export function elementalDotDps(element: Element, base: number): number {
  switch (element) {
    case 'fire':
      return base * 0.35;
    case 'poison':
      return base * 0.5;
    default:
      return 0;
  }
}
