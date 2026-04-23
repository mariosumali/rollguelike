import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'aegis',
  name: 'Aegis',
  kind: 'replacer',
  rarity: 'rare',
  description: 'Grants shield stacks. Reflects at higher tiers.',
  tags: ['shield', 'defense'],
  animation: {
    cast: 'shield_cast',
    hit: 'shield_click',
    evolution: 'bulwark_reflect',
  },
  evolution: {
    name: 'Bulwark',
    flavor: 'Reflected damage chains.',
    extraEffects: [{ verb: 'shield', stacks: 0, reflectChain: true }],
  },
  tiers: [
    { effects: [{ verb: 'shield', stacks: 2 }], damageMul: 1.0 },
    { effects: [{ verb: 'shield', stacks: 3 }], damageMul: 1.0 },
    { effects: [{ verb: 'shield', stacks: 4, reflect: 0.2 }], damageMul: 1.0 },
    { effects: [{ verb: 'shield', stacks: 6, reflect: 0.4 }], damageMul: 1.0 },
    { effects: [{ verb: 'shield', stacks: 8, reflect: 0.6, reflectChain: true }], damageMul: 1.0, note: 'Bulwark' },
  ],
};

export default upgrade;
