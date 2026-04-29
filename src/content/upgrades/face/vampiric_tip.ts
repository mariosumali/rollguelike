import type { FaceUpgrade } from '../types';

const upgrades: FaceUpgrade[] = [
  {
    id: "vampiric_tip",
    name: "Vampiric Tip",
    description: "Lifesteal on hits from this slot.",
    chainId: "vampiric_tip",
    rank: 1,
    upgradesTo: "vampiric_tip_ii",
    kind: 'supplement',
    rarity: 'rare',
    tags: ['supplement', 'lifesteal'],
    animation: {
    cast: 'muzzle_flash',
    hit: 'blood_mist',
    evolution: 'bloodpact_heal',
  },
    effect: { effects: [{ verb: 'modifyProjectile', lifesteal: 0.05 }], damageMul: 1.0 },
  },
  {
    id: "vampiric_tip_ii",
    name: "Leeching Tip",
    description: "Lifesteal on hits from this slot. Refined into Leeching Tip.",
    chainId: "vampiric_tip",
    rank: 2,
    upgradesFrom: "vampiric_tip",
    upgradesTo: "vampiric_tip_iii",
    kind: 'supplement',
    rarity: 'rare',
    tags: ['supplement', 'lifesteal'],
    animation: {
    cast: 'muzzle_flash',
    hit: 'blood_mist',
    evolution: 'bloodpact_heal',
  },
    effect: { effects: [{ verb: 'modifyProjectile', lifesteal: 0.12 }], damageMul: 1.0 },
  },
  {
    id: "vampiric_tip_iii",
    name: "Bloodpact",
    description: "+5 flat HP on kill from this slot.",
    chainId: "vampiric_tip",
    rank: 3,
    upgradesFrom: "vampiric_tip_ii",
    kind: 'supplement',
    rarity: 'rare',
    tags: ['supplement', 'lifesteal'],
    animation: {
    cast: 'muzzle_flash',
    hit: 'blood_mist',
    evolution: 'bloodpact_heal',
  },
    effect: { effects: [{ verb: 'modifyProjectile', lifesteal: 0.25 }, { verb: 'heal', amount: 5 }], damageMul: 1.0, note: 'Bloodpact' },
  }
];

export default upgrades;
