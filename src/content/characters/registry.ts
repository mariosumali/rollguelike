import type { Character } from '../../types';

const reg = new Map<string, Character>();

export function registerCharacter(c: Character): void {
  reg.set(c.id, c);
}

export function registerCharacters(cs: Character[]): void {
  for (const c of cs) reg.set(c.id, c);
}

export function getCharacter(id: string): Character | undefined {
  return reg.get(id);
}

export function listCharacters(): Character[] {
  return Array.from(reg.values());
}
