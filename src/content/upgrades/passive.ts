import type { Upgrade } from '../../types';
import { getRunState } from '../../state/store';

export const PASSIVE_UPGRADES: Upgrade[] = [
  {
    id: 'passive_hp',
    name: 'Vitality',
    desc: '+15 max HP. Heal 15.',
    rarity: 'common',
    category: 'passive',
    maxStack: 6,
    hooks: {
      onApply: () => {
        const run = getRunState();
        if (!run) return;
        run.maxHp += 15;
        run.hp = Math.min(run.maxHp, run.hp + 15);
      },
    },
  },
  {
    id: 'passive_shield',
    name: 'Iron Skin',
    desc: 'Start each wave with 1 shield.',
    rarity: 'rare',
    category: 'passive',
    maxStack: 3,
    hooks: {
      onWaveStart: () => {
        const run = getRunState();
        if (!run) return;
        run.shield = Math.min(10, run.shield + 1);
      },
    },
  },
  {
    id: 'passive_regen',
    name: 'Regeneration',
    desc: 'Recover 0.5 HP/sec.',
    rarity: 'epic',
    category: 'passive',
    maxStack: 3,
    hooks: {
      onTick: ({ dt }) => {
        const run = getRunState();
        if (!run) return;
        run.hp = Math.min(run.maxHp, run.hp + 0.5 * dt);
      },
    },
  },
  {
    id: 'passive_resist',
    name: 'Resolve',
    desc: 'Take 10% less damage.',
    rarity: 'rare',
    category: 'passive',
    maxStack: 3,
    hooks: {
      onDamaged: ({ amount }) => amount * 0.9,
    },
  },
  {
    id: 'passive_heal_on_wave',
    name: 'Second Wind',
    desc: 'Heal 20 HP at wave end.',
    rarity: 'common',
    category: 'passive',
    maxStack: 3,
    hooks: {
      onWaveEnd: () => {
        const run = getRunState();
        if (!run) return;
        run.hp = Math.min(run.maxHp, run.hp + 20);
      },
    },
  },
  {
    id: 'passive_heal_on_kill',
    name: 'Bloodlust',
    desc: 'Heal 1 HP per kill.',
    rarity: 'rare',
    category: 'passive',
    maxStack: 3,
    hooks: {
      onKill: () => {
        const run = getRunState();
        if (!run) return;
        run.hp = Math.min(run.maxHp, run.hp + 1);
      },
    },
  },
  {
    id: 'passive_score',
    name: 'Treasure Hunter',
    desc: '+25% score per kill.',
    rarity: 'common',
    category: 'passive',
    maxStack: 3,
    hooks: {
      onKill: () => {
        const run = getRunState();
        if (!run) return;
        run.score += 3;
      },
    },
  },
  {
    id: 'passive_shield_on_dmg',
    name: 'Counter Ward',
    desc: '10% chance to gain shield when hit.',
    rarity: 'rare',
    category: 'passive',
    maxStack: 2,
    hooks: {
      onDamaged: ({ rng, amount }) => {
        if (rng() < 0.1) {
          const run = getRunState();
          if (run) run.shield = Math.min(10, run.shield + 1);
        }
        return amount;
      },
    },
  },
  {
    id: 'passive_rage_decay',
    name: 'Calm',
    desc: 'Streak persists 1 extra roll on mismatch.',
    rarity: 'epic',
    category: 'passive',
    maxStack: 1,
    hooks: {},
  },
  {
    id: 'passive_wave_shield',
    name: 'Bulwark',
    desc: 'Gain 2 shield on boss waves.',
    rarity: 'rare',
    category: 'passive',
    maxStack: 2,
    hooks: {
      onWaveStart: ({ wave }) => {
        if (wave % 5 !== 0) return;
        const run = getRunState();
        if (!run) return;
        run.shield = Math.min(10, run.shield + 2);
      },
    },
  },
  {
    id: 'passive_iframe',
    name: 'Nimble',
    desc: 'Longer invincibility frames after hit.',
    rarity: 'common',
    category: 'passive',
    maxStack: 2,
    hooks: {},
  },
  {
    id: 'passive_start_heal',
    name: 'Full Restoration',
    desc: 'Heal to full at wave end.',
    rarity: 'legendary',
    category: 'passive',
    maxStack: 1,
    minWave: 10,
    hooks: {
      onWaveEnd: () => {
        const run = getRunState();
        if (!run) return;
        run.hp = run.maxHp;
      },
    },
  },
  {
    id: 'passive_kill_chain',
    name: 'Momentum',
    desc: 'Every 5 kills grant 1 shield.',
    rarity: 'epic',
    category: 'passive',
    maxStack: 2,
    hooks: {
      onKill: () => {
        const run = getRunState();
        if (!run) return;
        if (run.kills % 5 === 0) run.shield = Math.min(10, run.shield + 1);
      },
    },
  },
];
