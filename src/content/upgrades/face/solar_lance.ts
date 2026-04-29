import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'solar_lance',
  name: 'Solar Lance',
  kind: 'replacer',
  rarity: 'legendary',
  description: 'Charges, then fires a wide solar beam that also ignites.',
  tags: ['beam', 'fire', 'elemental', 'dot'],
  animation: {
    cast: 'sun_charge',
    hit: 'solar_scorch',
    evolution: 'corona_flare',
  },
  evolution: {
    name: 'Corona Flare',
    flavor: 'Beam detonates at its terminus for a second ignition.',
    extraEffects: [{ verb: 'pulse', radius: 42, damageMul: 1.2, element: 'fire' }],
  },
  tiers: [
    { effects: [{ verb: 'beam', width: 5, dps: 14, duration: 0.5, pierce: 5, element: 'fire' }, { verb: 'applyStatus', status: 'burn', power: 2, duration: 3 }], damageMul: 1.0 },
    { effects: [{ verb: 'beam', width: 7, dps: 18, duration: 0.6, pierce: 7, element: 'fire' }, { verb: 'applyStatus', status: 'burn', power: 4, duration: 3.5 }], damageMul: 1.1 },
    { effects: [{ verb: 'beam', width: 10, dps: 28, duration: 0.85, pierce: 10, element: 'fire' }, { verb: 'applyStatus', status: 'burn', power: 7, duration: 5 }], damageMul: 1.25, note: 'Corona Flare' },
  ],
};

export default upgrade;
