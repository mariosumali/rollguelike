import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'echo_chamber',
  name: 'Echo Chamber',
  kind: 'supplement',
  rarity: 'epic',
  description: 'Repeats the slot as extra weaker echoes.',
  tags: ['supplement', 'echo', 'multishot'],
  animation: { cast: 'echo_shimmer', projectile: 'std_proj', hit: 'std_burst', evolution: 'triplet_flash' },
  evolution: { name: 'Resonance', flavor: 'The echo becomes a visible second pulse.', extraEffects: [{ verb: 'pulse', radius: 34, damageMul: 0.3, element: 'arcane', repeat: 2, delay: 0.12 }] },
  tiers: [
    { effects: [{ verb: 'modifyProjectile', extra: 1, damageMul: 0.72 }], damageMul: 1.0, params: { echoChance: 0.35 } },
    { effects: [{ verb: 'modifyProjectile', extra: 1, damageMul: 0.85 }, { verb: 'pulse', radius: 22, damageMul: 0.18, element: 'arcane' }], damageMul: 1.0, params: { echoChance: 0.7 } },
    { effects: [{ verb: 'modifyProjectile', extra: 2, damageMul: 0.78 }, { verb: 'pulse', radius: 30, damageMul: 0.22, element: 'arcane', repeat: 2, delay: 0.1 }], damageMul: 1.0, note: 'Resonance' },
  ],
  icon: ['..............','....IIIIII....','...I......I...','..I..IIII..I..','..I.I....I.I..','..I.I....I.I..','..I..IIII..I..','...I......I...','....IIIIII....','......I.......','......I.......','..............','..............','..............'],
};

export default upgrade;
