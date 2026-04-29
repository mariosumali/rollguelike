import type { Upgrade } from '../../types';
import { getRunState } from '../../state/store';

export const LANDMARK_EXPANSION_UPGRADES: Upgrade[] = [
  {
    id: 'landmark_glass_cannon',
    name: 'Glass Cannon',
    desc: '+75% projectile damage. HP halved.',
    rarity: 'legendary',
    category: 'landmark',
    maxStack: 1,
    minWave: 5,
    hooks: {
      onApply: () => {
        const run = getRunState();
        if (!run) return;
        run.maxHp = Math.max(20, Math.floor(run.maxHp * 0.5));
        run.hp = Math.min(run.hp, run.maxHp);
      },
      onProjectileSpawn: ({ projectile }) => {
        projectile.damage *= 1.75;
      },
    },
  },
  {
    id: 'landmark_forge_addiction',
    name: 'Forge Addiction',
    desc: 'Shops offer +1 card; all prices +40%.',
    rarity: 'epic',
    category: 'landmark',
    maxStack: 1,
    minWave: 4,
    hooks: {},
  },
  {
    id: 'landmark_twin_dice',
    name: 'Twin Dice',
    desc: 'A second die rolls in parallel; dice damage is halved.',
    rarity: 'legendary',
    category: 'landmark',
    maxStack: 1,
    minWave: 8,
    hooks: {},
  },
  {
    id: 'landmark_elemental_tide',
    name: 'Elemental Tide',
    desc: 'Every 3rd wave swaps an active element, granting a free reaction.',
    rarity: 'epic',
    category: 'landmark',
    maxStack: 1,
    minWave: 6,
    hooks: {},
  },
  {
    id: 'landmark_gambler_fate',
    name: "Gambler's Fate",
    desc: "A roll of 1 or 6 counts as both — triggers on-1 AND on-6 effects.",
    rarity: 'rare',
    category: 'landmark',
    maxStack: 1,
    minWave: 3,
    hooks: {},
  },
  {
    id: 'landmark_phoenix_heart',
    name: 'Phoenix Heart',
    desc: 'Once per run, revive at 1 HP when you would die.',
    rarity: 'legendary',
    category: 'landmark',
    maxStack: 1,
    minWave: 7,
    hooks: {
      onDamaged: ({ amount }) => {
        const run = getRunState();
        if (!run) return amount;
        const r = run as unknown as { _phoenixUsed?: boolean };
        if (r._phoenixUsed) return amount;
        const hpAfter = run.hp - amount;
        if (hpAfter > 0) return amount;
        r._phoenixUsed = true;
        run.hp = 1;
        run.shield = Math.max(run.shield, 1);
        return 0;
      },
    },
  },
];
