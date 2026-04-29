import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'conductive_tip',
  name: 'Conductive Tip',
  kind: 'supplement',
  rarity: 'rare',
  description: 'Charges the slot so shots arc between nearby enemies.',
  tags: ['supplement', 'lightning', 'chain', 'elemental'],
  animation: { cast: 'spark_cast', projectile: 'arc_proj', hit: 'arc_chain', evolution: 'storm_chain' },
  evolution: { name: 'Live Wire', flavor: 'A visible opening arc snaps across the pack.', extraEffects: [{ verb: 'chainLightning', jumps: 2, damageMul: 0.35, radius: 90, stunDur: 0.15 }] },
  tiers: [
    { effects: [{ verb: 'chain', maxChains: 1, decay: 0.65 }, { verb: 'applyStatus', status: 'stun', power: 1, duration: 0.08, chance: 0.2 }], damageMul: 1.0 },
    { effects: [{ verb: 'chain', maxChains: 2, decay: 0.6 }, { verb: 'chainLightning', jumps: 2, damageMul: 0.25, radius: 72, stunDur: 0.1 }], damageMul: 1.0 },
    { effects: [{ verb: 'chain', maxChains: 3, decay: 0.55 }, { verb: 'chainLightning', jumps: 3, damageMul: 0.35, radius: 90, stunDur: 0.16 }], damageMul: 1.0, note: 'Live Wire' },
  ],
  icon: ['..............','.....y..y.....','......yy......','....yyyyyy....','......yy......','.....y..y.....','..............','....y....y....','.....y..y.....','......yy......','..............','..............','..............','..............'],
};

export default upgrade;
