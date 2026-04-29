import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'gravity_well',
  name: 'Gravity Well',
  kind: 'replacer',
  rarity: 'epic',
  description: 'A compact void pull that groups enemies for follow-up attacks.',
  tags: ['aoe', 'pull', 'void', 'arcane'],
  animation: { cast: 'void_cast', projectile: 'void_orb', hit: 'void_collapse', evolution: 'event_horizon' },
  evolution: { name: 'Singularity Seed', flavor: 'The well marks enemies trapped inside.', extraEffects: [{ verb: 'statusAura', status: 'mark', radius: 90, power: 1.4, duration: 2.5 }] },
  tiers: [
    { effects: [{ verb: 'pull', radius: 48, strength: 0.4, dps: 2, duration: 1.1 }], damageMul: 1.0 },
    { effects: [{ verb: 'pull', radius: 66, strength: 0.55, dps: 4, duration: 1.5 }, { verb: 'groundZone', radius: 38, dps: 3, duration: 1.4, element: 'arcane', slow: 0.2 }], damageMul: 1.0 },
    { effects: [{ verb: 'pull', radius: 86, strength: 0.75, dps: 6, duration: 2.0 }, { verb: 'groundZone', radius: 52, dps: 5, duration: 2.0, element: 'arcane', slow: 0.35 }, { verb: 'statusAura', status: 'mark', radius: 90, power: 1.2, duration: 2.5 }], damageMul: 1.0, note: 'Singularity Seed' },
  ],
  icon: ['..............','....H.....H...','......H.......','...H.....H....','.....HHH......','....HHIHH.....','.....HHH......','...H.....H....','......H.......','....H.....H...','..............','..............','..............','..............'],
};

export default upgrade;
