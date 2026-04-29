import type { WaveScript, SpawnEvent, EnemyType, RunState, WaveArchetypeId, EliteKind } from '../../types';
import { BALANCE } from '../../config/balance';
import { ARENA_W } from '../../config/constants';
import { listNonBosses, listBosses } from '../enemies/registry';
import { weighted, pick, randRange } from '../../engine/rng';
import { getRunMutator } from '../runMutators';
import { biomeRuleForWave } from '../stages/biomeRules';

export function generateWave(waveNum: number, rng: () => number, isBoss: boolean, run?: RunState): WaveScript {
  if (isBoss) return generateBossWave(waveNum, rng, run);
  return generateRegularWave(waveNum, rng, run);
}

function generateRegularWave(waveNum: number, rng: () => number, run?: RunState): WaveScript {
  const mutator = getRunMutator(run?.runMutatorId);
  const biome = biomeRuleForWave(waveNum);
  const archetype = pickArchetype(waveNum, rng, mutator?.modifiers.forceOddEvenEarly ? 'puzzle' : undefined, biome.archetypeWeights);
  const pool = eligiblePool(waveNum, mutator?.modifiers.forceOddEvenEarly ?? false);
  const baseCount = BALANCE.enemy.countPerWave(waveNum, false);
  const count = Math.max(3, Math.round(baseCount * (mutator?.modifiers.enemyCountMul ?? 1) * archetypeCountMul(archetype)));
  const spawnInterval = BALANCE.enemy.baseSpawnInterval(waveNum) * archetypeIntervalMul(archetype);
  const events: SpawnEvent[] = [];
  let t = 0.2;

  const weights = weightedPool(pool, waveNum, biome.enemyWeights);
  const eliteChance = Math.max(
    0,
    BALANCE.enemy.eliteBaseChance(waveNum) +
      (mutator?.modifiers.eliteChanceBonus ?? 0) +
      (biome.eliteChanceBonus ?? 0) +
      (archetype === 'eliteDuel' ? 0.5 : 0),
  );

  const preferred = archetypePreferredIds(archetype);
  for (let i = 0; i < count; i++) {
    const type = pickArchetypeEnemy(rng, pool, weights, preferred, i);
    pushSpawn(events, type, t, laneX(rng, type), rng, eliteChance, archetype === 'eliteDuel' && i === 0);
    t += spawnInterval * randRange(rng, 0.72, 1.22);
  }

  if (archetype === 'rush' || archetype === 'splitterFlood') {
    const clusters = Math.max(1, Math.floor(waveNum / 6));
    for (let c = 0; c < clusters; c++) {
      const type = pickArchetypeEnemy(rng, pool, weights, preferred, c);
      const baseT = randRange(rng, 1.1, Math.max(2, t - 0.5));
      const cx = randRange(rng, 40, ARENA_W - 40);
      const clusterSize = archetype === 'rush' ? 4 + Math.floor(waveNum / 12) : 3 + Math.floor(waveNum / 16);
      for (let k = 0; k < clusterSize; k++) {
        pushSpawn(events, type, baseT + k * 0.15, cx + (k - (clusterSize - 1) / 2) * 11, rng, eliteChance * 0.35, false);
      }
    }
  }

  if (archetype === 'escort') {
    const support = pickByIds(rng, pool, ['healer', 'debuffer', 'copier']) ?? weighted(rng, weights);
    const guard = pickByIds(rng, pool, ['tank', 'reflector', 'immune']) ?? weighted(rng, weights);
    const baseT = Math.max(1.5, t * 0.45);
    pushSpawn(events, guard, baseT, ARENA_W * 0.35, rng, eliteChance * 0.4, false);
    pushSpawn(events, support, baseT + 0.25, ARENA_W * 0.5, rng, eliteChance * 0.25, false);
    pushSpawn(events, guard, baseT + 0.5, ARENA_W * 0.65, rng, eliteChance * 0.4, false);
  }

  if (archetype === 'ambush') {
    for (let i = 0; i < Math.max(2, Math.floor(waveNum / 7)); i++) {
      const ambusher = pickByIds(rng, pool, ['invisible', 'drifter', 'copier']) ?? weighted(rng, weights);
      pushSpawn(events, ambusher, randRange(rng, 1.0, Math.max(2.5, t - 0.25)), i % 2 === 0 ? 32 : ARENA_W - 32, rng, eliteChance * 0.5, false);
    }
  }

  events.sort((a, b) => a.t - b.t);
  return { wave: waveNum, isBoss: false, events, duration: t + 1, archetypeId: archetype, biomeRuleId: biome.id };
}

function generateBossWave(waveNum: number, rng: () => number, run?: RunState): WaveScript {
  const bosses = listBosses();
  const bossIndex = Math.floor(waveNum / BALANCE.waves.bossEvery) - 1;
  const boss = bosses[bossIndex % bosses.length] ?? bosses[0]!;
  const events: SpawnEvent[] = [
    { typeId: boss.id, t: 2.0, x: ARENA_W / 2 },
  ];
  const minions = Math.floor(waveNum / 10);
  const minionPool = eligiblePool(waveNum, getRunMutator(run?.runMutatorId)?.modifiers.forceOddEvenEarly ?? false)
    .filter((t) => !t.elite);
  if (minions > 0 && minionPool.length > 0) {
    for (let i = 0; i < minions; i++) {
      const type = pick(rng, minionPool);
      events.push({ typeId: type.id, t: 3.5 + i * 0.6, x: randRange(rng, 20, ARENA_W - 20) });
    }
  }
  return { wave: waveNum, isBoss: true, events, duration: 20, bossTypeId: boss.id, biomeRuleId: biomeRuleForWave(waveNum).id };
}

function eligiblePool(waveNum: number, forceOddEvenEarly: boolean): EnemyType[] {
  return listNonBosses().filter((t) => {
    if (t.minWave <= waveNum) return true;
    if (!forceOddEvenEarly) return false;
    return ['oddonly', 'immune', 'inverter', 'reflector'].includes(t.id) && t.minWave <= waveNum + 7;
  });
}

function weightedPool(pool: EnemyType[], waveNum: number, biomeWeights: Record<string, number> | undefined): [EnemyType, number][] {
  return pool.map((t) => [t, Math.max(0.0001, t.weight(waveNum) * (biomeWeights?.[t.id] ?? 1))]);
}

function pickArchetype(
  waveNum: number,
  rng: () => number,
  forced: WaveArchetypeId | undefined,
  biomeWeights: Partial<Record<WaveArchetypeId, number>> | undefined,
): WaveArchetypeId {
  if (forced && waveNum <= 8) return forced;
  const base: [WaveArchetypeId, number][] = [
    ['mixed', 4],
    ['rush', 2.4],
    ['escort', waveNum >= 8 ? 1.8 : 0],
    ['splitterFlood', waveNum >= 4 ? 1.8 : 0],
    ['puzzle', waveNum >= 7 ? 1.6 : 0],
    ['ambush', waveNum >= 8 ? 1.5 : 0],
    ['eliteDuel', waveNum >= 6 ? 1.1 : 0],
  ];
  return weighted(rng, base.map(([id, w]) => [id, Math.max(0.0001, w * (biomeWeights?.[id] ?? 1))]));
}

function archetypeCountMul(id: WaveArchetypeId): number {
  switch (id) {
    case 'rush':
      return 1.35;
    case 'splitterFlood':
      return 1.15;
    case 'escort':
      return 0.85;
    case 'puzzle':
      return 0.78;
    case 'ambush':
      return 0.9;
    case 'eliteDuel':
      return 0.55;
    case 'mixed':
      return 1;
  }
}

function archetypeIntervalMul(id: WaveArchetypeId): number {
  switch (id) {
    case 'rush':
      return 0.72;
    case 'splitterFlood':
      return 0.82;
    case 'escort':
      return 1.15;
    case 'puzzle':
      return 1.22;
    case 'ambush':
      return 0.95;
    case 'eliteDuel':
      return 1.45;
    case 'mixed':
      return 1;
  }
}

function archetypePreferredIds(id: WaveArchetypeId): string[] {
  switch (id) {
    case 'rush':
      return ['rusher', 'swarm', 'drifter'];
    case 'escort':
      return ['tank', 'healer', 'debuffer', 'reflector'];
    case 'splitterFlood':
      return ['splitter', 'swarm', 'resurrector'];
    case 'puzzle':
      return ['oddonly', 'immune', 'absorber', 'inverter', 'reflector'];
    case 'ambush':
      return ['invisible', 'drifter', 'copier'];
    case 'eliteDuel':
      return ['tank', 'absorber', 'reflector', 'immune', 'inverter'];
    case 'mixed':
      return [];
  }
}

function pickArchetypeEnemy(
  rng: () => number,
  pool: EnemyType[],
  weights: [EnemyType, number][],
  preferredIds: string[],
  index: number,
): EnemyType {
  if (preferredIds.length > 0 && (index % 3 !== 2 || pool.length < 5)) {
    const preferred = pickByIds(rng, pool, preferredIds);
    if (preferred) return preferred;
  }
  return weighted(rng, weights);
}

function pickByIds(rng: () => number, pool: EnemyType[], ids: string[]): EnemyType | null {
  const matches = ids.map((id) => pool.find((t) => t.id === id)).filter((t): t is EnemyType => !!t);
  if (matches.length === 0) return null;
  return pick(rng, matches);
}

function laneX(rng: () => number, type: EnemyType): number {
  const margin = 18 + type.radius;
  return randRange(rng, margin, ARENA_W - margin);
}

function pushSpawn(
  events: SpawnEvent[],
  type: EnemyType,
  t: number,
  x: number,
  rng: () => number,
  eliteChance: number,
  forceElite: boolean,
): void {
  const elite = forceElite || rng() < eliteChance;
  events.push({
    typeId: type.id,
    t,
    x: Math.max(18 + type.radius, Math.min(ARENA_W - 18 - type.radius, x)),
    elite,
    eliteKind: elite ? pickEliteKind(rng) : undefined,
  });
}

function pickEliteKind(rng: () => number): EliteKind {
  return pick(rng, ['swift', 'armored', 'volatile', 'twin', 'golden'] as EliteKind[]);
}
