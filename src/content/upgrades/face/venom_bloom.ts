import type { FaceUpgrade } from '../types';

const upgrades: FaceUpgrade[] = [
  {
    id: "venom_bloom",
    name: "Venom Bloom",
    description: "Plants toxic blooms that rot enemies inside the cloud.",
    chainId: "venom_bloom",
    rank: 1,
    upgradesTo: "venom_bloom_ii",
    kind: 'replacer',
    rarity: 'rare',
    tags: ['poison', 'elemental', 'dot', 'aoe', 'nature'],
    animation: { cast: 'toxin_cast', projectile: 'toxin_proj', hit: 'toxin_drip', evolution: 'plague_cloud' },
    icon: ['..............','......z.......','....zzzzz.....','...z.m.m.z....','..zz..z..zz...','...z.m.m.z....','....zzzzz.....','......z.......','.....z.z......','....z...z.....','...z.....z....','..............','..............','..............'],
    effect: { effects: [{ verb: 'groundZone', radius: 34, dps: 5, duration: 1.4, element: 'poison', slow: 0.1 }, { verb: 'applyStatus', status: 'poison', power: 3, duration: 3 }], damageMul: 1.0 },
  },
  {
    id: "venom_bloom_ii",
    name: "Poison Bloom",
    description: "Plants toxic blooms that rot enemies inside the cloud. Refined into Poison Bloom.",
    chainId: "venom_bloom",
    rank: 2,
    upgradesFrom: "venom_bloom",
    upgradesTo: "venom_bloom_iii",
    kind: 'replacer',
    rarity: 'rare',
    tags: ['poison', 'elemental', 'dot', 'aoe', 'nature'],
    animation: { cast: 'toxin_cast', projectile: 'toxin_proj', hit: 'toxin_drip', evolution: 'plague_cloud' },
    icon: ['..............','......z.......','....zzzzz.....','...z.m.m.z....','..zz..z..zz...','...z.m.m.z....','....zzzzz.....','......z.......','.....z.z......','....z...z.....','...z.....z....','..............','..............','..............'],
    effect: { effects: [{ verb: 'groundZone', radius: 44, dps: 7, duration: 1.9, element: 'poison', slow: 0.2 }, { verb: 'statusAura', status: 'poison', radius: 52, power: 4, duration: 4 }], damageMul: 1.05 },
  },
  {
    id: "venom_bloom_iii",
    name: "Plague Garden",
    description: "Two clouds bloom and slow the pack.",
    chainId: "venom_bloom",
    rank: 3,
    upgradesFrom: "venom_bloom_ii",
    kind: 'replacer',
    rarity: 'rare',
    tags: ['poison', 'elemental', 'dot', 'aoe', 'nature'],
    animation: { cast: 'toxin_cast', projectile: 'toxin_proj', hit: 'toxin_drip', evolution: 'plague_cloud' },
    icon: ['..............','......z.......','....zzzzz.....','...z.m.m.z....','..zz..z..zz...','...z.m.m.z....','....zzzzz.....','......z.......','.....z.z......','....z...z.....','...z.....z....','..............','..............','..............'],
    effect: { effects: [{ verb: 'groundZone', radius: 58, dps: 10, duration: 2.4, element: 'poison', slow: 0.3 }, { verb: 'statusAura', status: 'poison', radius: 70, power: 6, duration: 5 }, { verb: 'groundZone', radius: 46, dps: 7, duration: 2.0, element: 'poison', slow: 0.25 }], damageMul: 1.1, note: 'Plague Garden' },
  }
];

export default upgrades;
