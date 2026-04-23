import type { Upgrade, Face } from '../../types';
import { getRunState } from '../../state/store';
import { getEngineState } from '../../engine/engine';

function forEachFace(fn: (f: Face) => void): void {
  const run = getRunState();
  if (!run) return;
  for (const d of run.dice) for (const f of d.faces) fn(f);
  const eng = getEngineState();
  for (const d of eng.dice) for (const f of d.config.faces) fn(f);
}

function ensureFaceMods(f: Face): NonNullable<Face['modifiers']> {
  if (!f.modifiers) f.modifiers = {};
  return f.modifiers;
}

export const DICE_UPGRADES: Upgrade[] = [
  {
    id: 'dice_second',
    name: 'Second Die',
    desc: 'Roll an extra standard d6 each tap.',
    rarity: 'epic',
    category: 'dice',
    maxStack: 1,
    hooks: {
      onApply: () => {
        const run = getRunState();
        if (!run) return;
        const eng = getEngineState();
        const base = run.dice[0];
        if (!base) return;
        const clone = JSON.parse(JSON.stringify(base)) as typeof base;
        clone.id = base.id + '_b';
        run.dice.push(clone);
        const spacing = 24;
        eng.dice.push({
          config: clone,
          value: 1,
          rolling: false,
          rollT: 0,
          rollDuration: clone.rollDuration,
          shakeFrame: 0,
          landedAt: 0,
          chargeT: 0,
          charging: false,
          offsetX: spacing / 2,
        });
        if (eng.dice.length >= 2) {
          const n = eng.dice.length;
          for (let i = 0; i < n; i++) eng.dice[i]!.offsetX = (i - (n - 1) / 2) * spacing;
        }
      },
    },
  },
  {
    id: 'dice_third',
    name: 'Third Die',
    desc: 'Roll a third die.',
    rarity: 'legendary',
    category: 'dice',
    maxStack: 1,
    minWave: 8,
    hooks: {
      onApply: () => {
        const run = getRunState();
        if (!run) return;
        const eng = getEngineState();
        const base = run.dice[0];
        if (!base) return;
        const clone = JSON.parse(JSON.stringify(base)) as typeof base;
        clone.id = base.id + '_c';
        run.dice.push(clone);
        eng.dice.push({
          config: clone,
          value: 1,
          rolling: false,
          rollT: 0,
          rollDuration: clone.rollDuration,
          shakeFrame: 0,
          landedAt: 0,
          chargeT: 0,
          charging: false,
          offsetX: 0,
        });
        const spacing = 22;
        const n = eng.dice.length;
        for (let i = 0; i < n; i++) eng.dice[i]!.offsetX = (i - (n - 1) / 2) * spacing;
      },
    },
  },
  {
    id: 'dice_loaded_six',
    name: 'Loaded: Six',
    desc: 'Rolls are 40% more likely to land on 6.',
    rarity: 'rare',
    category: 'dice',
    maxStack: 3,
    hooks: {
      onApply: () => {
        const run = getRunState();
        if (!run) return;
        for (const d of run.dice) {
          if (!d.bias) d.bias = d.faces.map(() => 1);
          for (let i = 0; i < d.faces.length; i++) {
            if (d.faces[i]!.value === 6) d.bias[i]! *= 1.4;
          }
        }
        const eng = getEngineState();
        for (const d of eng.dice) {
          if (!d.config.bias) d.config.bias = d.config.faces.map(() => 1);
          for (let i = 0; i < d.config.faces.length; i++) {
            if (d.config.faces[i]!.value === 6) d.config.bias[i]! *= 1.4;
          }
        }
      },
    },
  },
  {
    id: 'dice_no_blanks',
    name: 'No Blanks',
    desc: 'Convert any BLANK faces into SHOT.',
    rarity: 'rare',
    category: 'dice',
    maxStack: 1,
    hooks: {
      onApply: () => {
        forEachFace((f) => {
          if (f.kind === 'BLANK') f.kind = 'SHOT';
        });
      },
    },
  },
  {
    id: 'dice_pierce_face',
    name: 'Piercing Six',
    desc: 'Face 6 projectiles gain +2 pierce.',
    rarity: 'epic',
    category: 'dice',
    maxStack: 2,
    hooks: {
      onApply: () => {
        forEachFace((f) => {
          if (f.value === 6) {
            const m = ensureFaceMods(f);
            m.pierce = (m.pierce ?? 0) + 2;
          }
        });
      },
    },
  },
  {
    id: 'dice_explode_five',
    name: 'Exploding Five',
    desc: 'Face 5 projectiles explode on hit.',
    rarity: 'epic',
    category: 'dice',
    maxStack: 1,
    hooks: {
      onApply: () => {
        forEachFace((f) => {
          if (f.value === 5) {
            const m = ensureFaceMods(f);
            m.aoeOnHit = Math.max(m.aoeOnHit ?? 0, 20);
          }
        });
      },
    },
  },
  {
    id: 'dice_speed',
    name: 'Quick Roll',
    desc: 'Roll animation is 25% faster.',
    rarity: 'common',
    category: 'dice',
    maxStack: 3,
    hooks: {
      onApply: () => {
        const run = getRunState();
        if (!run) return;
        for (const d of run.dice) d.rollDuration *= 0.75;
        const eng = getEngineState();
        for (const d of eng.dice) {
          d.rollDuration *= 0.75;
          d.config.rollDuration *= 0.75;
        }
      },
    },
  },
  {
    id: 'dice_heal_face',
    name: 'Heal Face',
    desc: 'Replace one BLANK or lowest face with HEAL.',
    rarity: 'rare',
    category: 'dice',
    maxStack: 2,
    hooks: {
      onApply: () => {
        const run = getRunState();
        if (!run) return;
        for (const d of run.dice) {
          const blank = d.faces.find((f) => f.kind === 'BLANK');
          const target = blank ?? d.faces.reduce((a, b) => (a.value <= b.value ? a : b));
          target.kind = 'HEAL';
        }
        const eng = getEngineState();
        for (const d of eng.dice) {
          const blank = d.config.faces.find((f) => f.kind === 'BLANK');
          const target = blank ?? d.config.faces.reduce((a, b) => (a.value <= b.value ? a : b));
          target.kind = 'HEAL';
        }
      },
    },
  },
  {
    id: 'dice_pulse_face',
    name: 'Pulse Face',
    desc: 'Face 3 becomes PULSE.',
    rarity: 'rare',
    category: 'dice',
    maxStack: 1,
    hooks: {
      onApply: () => {
        forEachFace((f) => {
          if (f.value === 3) f.kind = 'PULSE';
        });
      },
    },
  },
  {
    id: 'dice_burst_face',
    name: 'Burst Face',
    desc: 'Face 4 becomes BURST.',
    rarity: 'rare',
    category: 'dice',
    maxStack: 1,
    hooks: {
      onApply: () => {
        forEachFace((f) => {
          if (f.value === 4) f.kind = 'BURST';
        });
      },
    },
  },
  {
    id: 'dice_shield_face',
    name: 'Guardian Face',
    desc: 'Face 2 becomes SHIELD.',
    rarity: 'rare',
    category: 'dice',
    maxStack: 1,
    hooks: {
      onApply: () => {
        forEachFace((f) => {
          if (f.value === 2) f.kind = 'SHIELD';
        });
      },
    },
  },
  {
    id: 'dice_wild_face',
    name: 'Wild Face',
    desc: 'Face 1 becomes WILD (repeat last attack).',
    rarity: 'epic',
    category: 'dice',
    maxStack: 1,
    hooks: {
      onApply: () => {
        forEachFace((f) => {
          if (f.value === 1) f.kind = 'WILD';
        });
      },
    },
  },
  {
    id: 'dice_streak_bonus',
    name: 'Streak Amplifier',
    desc: 'Streak damage multiplier grows 50% faster.',
    rarity: 'epic',
    category: 'dice',
    maxStack: 2,
    hooks: {},
  },
  {
    id: 'dice_all_max',
    name: 'Solid Six',
    desc: 'All faces become 6. HP capped at 1.',
    rarity: 'legendary',
    category: 'dice',
    maxStack: 1,
    minWave: 5,
    hooks: {
      onApply: () => {
        const run = getRunState();
        if (!run) return;
        for (const d of run.dice) for (const f of d.faces) f.value = 6;
        const eng = getEngineState();
        for (const d of eng.dice) for (const f of d.config.faces) f.value = 6;
        run.maxHp = 1;
        run.hp = 1;
      },
    },
  },
  {
    id: 'dice_cascade',
    name: 'Cascade',
    desc: 'Rolling max value rolls again once, free.',
    rarity: 'legendary',
    category: 'dice',
    maxStack: 1,
    hooks: {
      onRoll: ({ face }) => {
        if (face.value !== 6) return;
        setTimeout(() => {
          const eng = getEngineState();
          if (!eng.run) return;
          const allStill = eng.dice.every((d) => !d.rolling);
          if (!allStill) return;
          import('../../engine/engine').then(({ tap }) => tap());
        }, 200);
      },
    },
  },
];
