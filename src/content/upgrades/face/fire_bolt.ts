import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'fire_bolt',
  name: 'Fire Bolt',
  kind: 'replacer',
  rarity: 'rare',
  description: 'Flaming shots erupt into visible pillars at higher tiers.',
  tags: ['projectile', 'fire', 'elemental'],
  animation: {
    cast: 'fire_cast',
    projectile: 'fire_proj',
    hit: 'fire_burst',
    evolution: 'phoenix_split',
  },
  evolution: {
    name: 'Phoenix Bolt',
    flavor: 'Calls a row of flame pillars and fans phoenix sparks.',
    extraEffects: [{ verb: 'fireProjectile', count: 3, element: 'fire', spread: Math.PI / 4, damageMul: 0.65 }],
  },
  tiers: [
    { effects: [{ verb: 'fireProjectile', count: 1, element: 'fire' }, { verb: 'modifyProjectile', burnDps: 3, burnDur: 2 }], damageMul: 1.0 },
    { effects: [{ verb: 'fireProjectile', count: 2, element: 'fire', spread: Math.PI / 10 }, { verb: 'flamePillar', count: 1, radius: 18, damageMul: 0.65, duration: 0.8, burnDps: 4, burnDur: 2.5 }], damageMul: 1.1 },
    { effects: [{ verb: 'fireProjectile', count: 2, element: 'fire', spread: Math.PI / 8 }, { verb: 'flamePillar', count: 3, radius: 22, damageMul: 0.8, duration: 1.1, delay: 0.16, burnDps: 6, burnDur: 4 }], damageMul: 1.2, note: 'Phoenix' },
  ],
};

export default upgrade;
