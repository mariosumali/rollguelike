import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'starlight_rim',
  name: 'Starlight Rim',
  kind: 'supplement',
  rarity: 'legendary',
  description: 'Projectiles gently home, and on expiry leave a one-shot orbit fang.',
  tags: ['supplement', 'homing', 'orbit', 'arcane'],
  animation: {
    cast: 'orbit_cast',
    hit: 'pierce_spark',
    evolution: 'eternal_circle',
  },
  evolution: {
    name: 'Constellation',
    flavor: 'Remnant fangs link into a dim ring.',
    extraEffects: [{ verb: 'orbit', count: 2, radius: 30, rpm: 140, damageMul: 0.6, duration: 1.5 }],
  },
  tiers: [
    { effects: [{ verb: 'modifyProjectile', homing: true }, { verb: 'orbit', count: 1, radius: 18, rpm: 160, damageMul: 0.4, duration: 0.6 }], damageMul: 1.0 },
    { effects: [{ verb: 'modifyProjectile', homing: true }, { verb: 'orbit', count: 1, radius: 20, rpm: 160, damageMul: 0.5, duration: 0.8 }], damageMul: 1.0 },
    { effects: [{ verb: 'modifyProjectile', homing: true }, { verb: 'orbit', count: 1, radius: 22, rpm: 180, damageMul: 0.6, duration: 1.0 }], damageMul: 1.0 },
    { effects: [{ verb: 'modifyProjectile', homing: true }, { verb: 'orbit', count: 2, radius: 24, rpm: 180, damageMul: 0.7, duration: 1.2 }], damageMul: 1.0 },
    { effects: [{ verb: 'modifyProjectile', homing: true }, { verb: 'orbit', count: 2, radius: 26, rpm: 200, damageMul: 0.9, duration: 1.5 }], damageMul: 1.0, note: 'Constellation' },
  ],
};

export default upgrade;
