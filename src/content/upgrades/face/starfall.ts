import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'starfall',
  name: 'Starfall',
  kind: 'replacer',
  rarity: 'legendary',
  description: 'Calls delayed arcane star strikes from above.',
  tags: ['arcane', 'column', 'aoe'],
  animation: { cast: 'void_cast', hit: 'rail_streak', evolution: 'supernova_ring' },
  evolution: { name: 'Constellation Break', flavor: 'A final nova follows the falling stars.', extraEffects: [{ verb: 'pulse', radius: 72, damageMul: 0.8, element: 'arcane', knockback: 24 }] },
  tiers: [
    { effects: [{ verb: 'column', count: 2, delay: 0.22, damageMul: 2.6, stunDur: 0.1 }], damageMul: 1.0 },
    { effects: [{ verb: 'column', count: 3, delay: 0.2, damageMul: 3.5, stunDur: 0.18, chainToExtra: 1 }], damageMul: 1.05 },
    { effects: [{ verb: 'column', count: 5, delay: 0.18, damageMul: 4.5, stunDur: 0.25, chainToExtra: 2 }, { verb: 'pulse', radius: 64, damageMul: 0.65, element: 'arcane', knockback: 20 }], damageMul: 1.1, note: 'Constellation Break' },
  ],
  icon: ['......e.......','.....eHe......','....eHHHe.....','......H.......','..e...H...e...','...HHHHHHH....','..e...H...e...','......H.......','....eHHHe.....','.....eHe......','......e.......','..............','..............','..............'],
};

export default upgrade;
