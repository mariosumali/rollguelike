import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'vampiric_tip',
  name: 'Vampiric Tip',
  kind: 'supplement',
  rarity: 'rare',
  description: 'Lifesteal on hits from this slot.',
  tags: ['supplement', 'lifesteal'],
  animation: {
    cast: 'muzzle_flash',
    hit: 'blood_mist',
    evolution: 'bloodpact_heal',
  },
  evolution: {
    name: 'Bloodpact',
    flavor: '+5 flat HP on kill from this slot.',
    extraEffects: [{ verb: 'heal', amount: 5 }],
  },
  tiers: [
    { effects: [{ verb: 'modifyProjectile', lifesteal: 0.05 }], damageMul: 1.0 },
    { effects: [{ verb: 'modifyProjectile', lifesteal: 0.12 }], damageMul: 1.0 },
    { effects: [{ verb: 'modifyProjectile', lifesteal: 0.25 }], damageMul: 1.0, note: 'Bloodpact' },
  ],
};

export default upgrade;
