import type { FaceUpgrade } from '../types';

const upgrades: FaceUpgrade[] = [
  {
    id: "conductive_tip",
    name: "Conductive Tip",
    description: "Charges the slot so shots arc between nearby enemies.",
    chainId: "conductive_tip",
    rank: 1,
    upgradesTo: "conductive_tip_ii",
    kind: 'supplement',
    rarity: 'rare',
    tags: ['supplement', 'lightning', 'chain', 'elemental'],
    animation: { cast: 'spark_cast', projectile: 'arc_proj', hit: 'arc_chain', evolution: 'storm_chain' },
    icon: ['..............','.....y..y.....','......yy......','....yyyyyy....','......yy......','.....y..y.....','..............','....y....y....','.....y..y.....','......yy......','..............','..............','..............','..............'],
    effect: { effects: [{ verb: 'chain', maxChains: 1, decay: 0.65 }, { verb: 'applyStatus', status: 'stun', power: 1, duration: 0.08, chance: 0.2 }], damageMul: 1.0 },
  },
  {
    id: "conductive_tip_ii",
    name: "Charged Tip",
    description: "Charges the slot so shots arc between nearby enemies. Refined into Charged Tip.",
    chainId: "conductive_tip",
    rank: 2,
    upgradesFrom: "conductive_tip",
    upgradesTo: "conductive_tip_iii",
    kind: 'supplement',
    rarity: 'rare',
    tags: ['supplement', 'lightning', 'chain', 'elemental'],
    animation: { cast: 'spark_cast', projectile: 'arc_proj', hit: 'arc_chain', evolution: 'storm_chain' },
    icon: ['..............','.....y..y.....','......yy......','....yyyyyy....','......yy......','.....y..y.....','..............','....y....y....','.....y..y.....','......yy......','..............','..............','..............','..............'],
    effect: { effects: [{ verb: 'chain', maxChains: 2, decay: 0.6 }, { verb: 'chainLightning', jumps: 2, damageMul: 0.25, radius: 72, stunDur: 0.1 }], damageMul: 1.0 },
  },
  {
    id: "conductive_tip_iii",
    name: "Live Wire",
    description: "A visible opening arc snaps across the pack.",
    chainId: "conductive_tip",
    rank: 3,
    upgradesFrom: "conductive_tip_ii",
    kind: 'supplement',
    rarity: 'rare',
    tags: ['supplement', 'lightning', 'chain', 'elemental'],
    animation: { cast: 'spark_cast', projectile: 'arc_proj', hit: 'arc_chain', evolution: 'storm_chain' },
    icon: ['..............','.....y..y.....','......yy......','....yyyyyy....','......yy......','.....y..y.....','..............','....y....y....','.....y..y.....','......yy......','..............','..............','..............','..............'],
    effect: { effects: [{ verb: 'chain', maxChains: 3, decay: 0.55 }, { verb: 'chainLightning', jumps: 3, damageMul: 0.35, radius: 90, stunDur: 0.16 }, { verb: 'chainLightning', jumps: 2, damageMul: 0.35, radius: 90, stunDur: 0.15 }], damageMul: 1.0, note: 'Live Wire' },
  }
];

export default upgrades;
