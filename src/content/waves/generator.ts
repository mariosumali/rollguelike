import type { WaveScript, SpawnEvent, EnemyType } from '../../types';
import { BALANCE } from '../../config/balance';
import { ARENA_W } from '../../config/constants';
import { listNonBosses, listBosses } from '../enemies/registry';
import { weighted, pick, randRange } from '../../engine/rng';

export function generateWave(waveNum: number, rng: () => number, isBoss: boolean): WaveScript {
  if (isBoss) return generateBossWave(waveNum, rng);
  return generateRegularWave(waveNum, rng);
}

function generateRegularWave(waveNum: number, rng: () => number): WaveScript {
  const count = BALANCE.enemy.countPerWave(waveNum, false);
  const spawnInterval = BALANCE.enemy.baseSpawnInterval(waveNum);
  const pool = listNonBosses().filter((t) => t.minWave <= waveNum);
  const weights: [EnemyType, number][] = pool.map((t) => [t, Math.max(0.0001, t.weight(waveNum))]);
  const events: SpawnEvent[] = [];
  let t = 0.2;
  for (let i = 0; i < count; i++) {
    const type = weighted(rng, weights);
    const margin = 18 + type.radius;
    const x = randRange(rng, margin, ARENA_W - margin);
    events.push({ typeId: type.id, t, x });
    t += spawnInterval * randRange(rng, 0.75, 1.25);
  }
  const clusters = Math.max(0, Math.floor(waveNum / 5));
  for (let c = 0; c < clusters; c++) {
    const type = weighted(rng, weights);
    const baseT = randRange(rng, 1.5, Math.max(2, t - 0.5));
    const cx = randRange(rng, 40, ARENA_W - 40);
    const clusterSize = 3 + Math.floor(waveNum / 15);
    for (let k = 0; k < clusterSize; k++) {
      events.push({ typeId: type.id, t: baseT + k * 0.18, x: cx + (k - (clusterSize - 1) / 2) * 10 });
    }
  }
  events.sort((a, b) => a.t - b.t);
  return { wave: waveNum, isBoss: false, events, duration: t + 1 };
}

function generateBossWave(waveNum: number, rng: () => number): WaveScript {
  const bosses = listBosses();
  const bossIndex = Math.floor(waveNum / BALANCE.waves.bossEvery) - 1;
  const boss = bosses[bossIndex % bosses.length] ?? bosses[0]!;
  const events: SpawnEvent[] = [
    { typeId: boss.id, t: 2.0, x: ARENA_W / 2 },
  ];
  const minions = Math.floor(waveNum / 10);
  const minionPool = listNonBosses().filter((t) => t.minWave <= waveNum && !t.elite);
  if (minions > 0 && minionPool.length > 0) {
    for (let i = 0; i < minions; i++) {
      const type = pick(rng, minionPool);
      events.push({ typeId: type.id, t: 3.5 + i * 0.6, x: randRange(rng, 20, ARENA_W - 20) });
    }
  }
  return { wave: waveNum, isBoss: true, events, duration: 20, bossTypeId: boss.id };
}
