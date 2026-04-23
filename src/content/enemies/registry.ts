import type { EnemyType } from '../../types';

const reg = new Map<string, EnemyType>();

export function registerEnemy(t: EnemyType): void {
  reg.set(t.id, t);
}

export function registerEnemies(ts: EnemyType[]): void {
  for (const t of ts) reg.set(t.id, t);
}

export function getEnemyType(id: string): EnemyType | undefined {
  return reg.get(id);
}

export function listEnemies(): EnemyType[] {
  return Array.from(reg.values());
}

export function listNonBosses(): EnemyType[] {
  return listEnemies().filter((e) => !e.isBoss);
}

export function listBosses(): EnemyType[] {
  return listEnemies().filter((e) => e.isBoss);
}
