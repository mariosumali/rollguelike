import type { FaceUpgrade } from '../types';

const upgrades: FaceUpgrade[] = [
  {
    id: "aegis",
    name: "Aegis",
    description: "Grants shield stacks. Reflects at higher tiers.",
    chainId: "aegis",
    rank: 1,
    upgradesTo: "aegis_ii",
    kind: 'replacer',
    rarity: 'rare',
    tags: ['shield', 'defense'],
    animation: {
    cast: 'shield_cast',
    hit: 'shield_click',
    evolution: 'bulwark_reflect',
  },
    effect: { effects: [{ verb: 'shield', stacks: 2 }], damageMul: 1.0 },
  },
  {
    id: "aegis_ii",
    name: "Reflecting Aegis",
    description: "Grants shield stacks. Reflects at higher tiers. Refined into Reflecting Aegis.",
    chainId: "aegis",
    rank: 2,
    upgradesFrom: "aegis",
    upgradesTo: "aegis_iii",
    kind: 'replacer',
    rarity: 'rare',
    tags: ['shield', 'defense'],
    animation: {
    cast: 'shield_cast',
    hit: 'shield_click',
    evolution: 'bulwark_reflect',
  },
    effect: { effects: [{ verb: 'shield', stacks: 4, reflect: 0.2 }], damageMul: 1.0 },
  },
  {
    id: "aegis_iii",
    name: "Bulwark",
    description: "Reflected damage chains.",
    chainId: "aegis",
    rank: 3,
    upgradesFrom: "aegis_ii",
    kind: 'replacer',
    rarity: 'rare',
    tags: ['shield', 'defense'],
    animation: {
    cast: 'shield_cast',
    hit: 'shield_click',
    evolution: 'bulwark_reflect',
  },
    effect: { effects: [{ verb: 'shield', stacks: 8, reflect: 0.6, reflectChain: true }, { verb: 'shield', stacks: 0, reflectChain: true }], damageMul: 1.0, note: 'Bulwark' },
  }
];

export default upgrades;
