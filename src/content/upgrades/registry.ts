import type { Upgrade } from '../../types';

const reg = new Map<string, Upgrade>();

export function registerUpgrade(u: Upgrade): void {
  reg.set(u.id, u);
}

export function registerUpgrades(us: Upgrade[]): void {
  for (const u of us) reg.set(u.id, u);
}

export function getUpgrade(id: string): Upgrade | undefined {
  return reg.get(id);
}

export function listUpgrades(): Upgrade[] {
  return Array.from(reg.values());
}
