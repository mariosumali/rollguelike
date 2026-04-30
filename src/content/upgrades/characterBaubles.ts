import type { Element, Enemy, Projectile, RunState, Upgrade } from '../../types';
import { BALANCE } from '../../config/balance';
import { PLAYER_X, PLAYER_Y } from '../../config/constants';
import { getEngineState } from '../../engine/engine';
import { getRunState } from '../../state/store';

type CharacterBaubleRun = RunState & {
  _overwatchShots?: number;
  _overwatchLastRoll?: number;
  _allInCharges?: number;
  _allInLastRoll?: number;
  _transmuteLastElement?: Element;
  _transmuteLastRoll?: number;
  _reactionLastElement?: Element;
  _reactionLastRoll?: number;
  _soulHarvestSurge?: number;
};

const TAG = {
  overwatch: 'char:overwatch',
  allIn: 'char:all_in',
  jackpot: 'char:loaded_jackpot',
  volatile: 'char:volatile_mixture',
  soulHarvest: 'char:soul_harvest',
  bloodrush: 'char:bloodrush',
};

function run(): CharacterBaubleRun | null {
  return getRunState() as CharacterBaubleRun | null;
}

function stacksOf(r: RunState, id: string): number {
  const applied = r.upgrades.find((u) => u.id === id);
  return Math.max(0, Math.min(3, applied?.stacks ?? 0));
}

function markProjectile(projectile: Projectile, tag: string): boolean {
  if (projectile.tags.has(tag)) return false;
  projectile.tags.add(tag);
  return true;
}

function liveEnemies(): Enemy[] {
  return getEngineState().enemies.filter((enemy) => enemy.alive && enemy.state !== 'die');
}

function nearestEnemy(): Enemy | null {
  let best: Enemy | null = null;
  let bestD = Infinity;
  for (const enemy of liveEnemies()) {
    const dx = enemy.x - PLAYER_X;
    const dy = enemy.y - PLAYER_Y;
    const d = dx * dx + dy * dy;
    if (d < bestD) {
      best = enemy;
      bestD = d;
    }
  }
  return best;
}

function pulseStatus(element: Element, stacks: number): void {
  const target = nearestEnemy();
  if (!target) return;
  const radius = 58 + stacks * 18;
  const r2 = radius * radius;
  for (const enemy of liveEnemies()) {
    const dx = enemy.x - target.x;
    const dy = enemy.y - target.y;
    if (dx * dx + dy * dy > r2) continue;
    switch (element) {
      case 'fire':
        enemy.data['dotKind'] = 2;
        enemy.poisonT = Math.max(enemy.poisonT, 1.4 + stacks * 0.45);
        enemy.poisonDps = Math.max(enemy.poisonDps, 3 + stacks * 2);
        break;
      case 'ice':
        enemy.freeze = Math.max(enemy.freeze, 0.3 + stacks * 0.18);
        enemy.slow = Math.max(enemy.slow, 0.45 + stacks * 0.08);
        enemy.slowT = Math.max(enemy.slowT, 1.0 + stacks * 0.35);
        break;
      case 'poison':
        enemy.data['dotKind'] = 1;
        enemy.poisonT = Math.max(enemy.poisonT, 2 + stacks * 0.6);
        enemy.poisonDps = Math.max(enemy.poisonDps, 4 + stacks * 2.5);
        break;
      case 'lightning':
        enemy.freeze = Math.max(enemy.freeze, 0.18 + stacks * 0.12);
        enemy.slow = Math.max(enemy.slow, 0.55);
        enemy.slowT = Math.max(enemy.slowT, 0.7 + stacks * 0.2);
        enemy.charged = Math.max(enemy.charged, 1 + stacks * 0.35);
        break;
      case 'arcane':
        enemy.voidMark = Math.max(enemy.voidMark, 1 + stacks * 0.5);
        break;
      case 'none':
        break;
    }
  }
}

function oncePerRoll(
  r: CharacterBaubleRun,
  key: '_overwatchLastRoll' | '_allInLastRoll' | '_transmuteLastRoll' | '_reactionLastRoll',
  rollCount?: number,
): boolean {
  if (rollCount === undefined) return true;
  if (r[key] === rollCount) return false;
  r[key] = rollCount;
  return true;
}

export const CHARACTER_BAUBLE_UPGRADES = [
  {
    id: 'overwatch',
    name: 'Overwatch Drill',
    desc: 'Knight signature. Start equipped. Roll 6 to bank shielded overwatch shots with bonus pierce and damage.',
    rarity: 'rare',
    category: 'bauble',
    maxStack: 3,
    characterExclusive: 'soldier',
    icon: ['...dddd.....', '..d999d....', '.d99D99d...', '.d9DDD9d...', '..d999d....', '...dddd.....', '....9......'],
    bauble: { projectileDamageMul: 0.05, waveStartShield: 1 },
    hooks: {
      onRoll: ({ face, rollCount }) => {
        const r = run();
        if (!r || face.value !== 6 || !oncePerRoll(r, '_overwatchLastRoll', rollCount)) return;
        const stacks = stacksOf(r, 'overwatch');
        r._overwatchShots = Math.max(r._overwatchShots ?? 0, 2 + stacks);
        r.shield = Math.min(BALANCE.combat.shieldMax, r.shield + stacks);
      },
      onProjectileSpawn: ({ projectile }) => {
        const r = run();
        if (!r || (r._overwatchShots ?? 0) <= 0 || !markProjectile(projectile, TAG.overwatch)) return;
        const stacks = stacksOf(r, 'overwatch');
        r._overwatchShots = Math.max(0, (r._overwatchShots ?? 0) - 1);
        projectile.pierce += stacks;
        projectile.damage *= 1.12 + stacks * 0.08 + (r.shield > 0 ? 0.08 : 0);
      },
    },
  },
  {
    id: 'all_in',
    name: 'All In',
    desc: 'Gambler signature. Start equipped. Extreme rolls at high Gambit load the next chip with jackpot damage.',
    rarity: 'epic',
    category: 'bauble',
    maxStack: 3,
    characterExclusive: 'gambler',
    icon: ['...xxxx.....', '..x999x....', '.x9yyy9x...', '.x9yyy9x...', '..x999x....', '...xxxx.....', '....y......'],
    bauble: { highFaceDamageMul: 0.05, projectileCritChance: 0.02 },
    hooks: {
      onRoll: ({ face, rollCount }) => {
        const r = run();
        if (!r || !oncePerRoll(r, '_allInLastRoll', rollCount)) return;
        const stacks = stacksOf(r, 'all_in');
        const extremes = BALANCE.gambler.gambitExtremes as readonly number[];
        const threshold = Math.max(2, BALANCE.gambler.gambitMaxStacks - stacks);
        if (extremes.includes(face.value) && r.gambitStacks >= threshold) {
          r._allInCharges = Math.min(6, (r._allInCharges ?? 0) + stacks);
        }
      },
      onProjectileSpawn: ({ projectile, face }) => {
        const r = run();
        if (!r || (r._allInCharges ?? 0) <= 0) return;
        const extremes = BALANCE.gambler.gambitExtremes as readonly number[];
        if (!extremes.includes(face.value)) return;
        if (!markProjectile(projectile, TAG.allIn)) return;
        const stacks = stacksOf(r, 'all_in');
        r._allInCharges = Math.max(0, (r._allInCharges ?? 0) - 1);
        projectile.damage *= 1.25 + stacks * 0.2;
        projectile.pierce += Math.ceil(stacks / 2);
        projectile.critChance = Math.min(0.85, (projectile.critChance ?? 0) + stacks * 0.12);
      },
    },
  },
  {
    id: 'loaded_jackpot',
    name: 'Loaded Jackpot',
    desc: 'Gambler signature. Start equipped. Chips gain stronger crit odds, swingier payouts, and occasional gold.',
    rarity: 'legendary',
    category: 'bauble',
    maxStack: 3,
    characterExclusive: 'gambler',
    icon: ['...yyyy.....', '..yxxxx....', '.yx999xy...', '.yx999xy...', '..yxxxx....', '...yyyy.....', '....x......'],
    bauble: { projectileCritChance: 0.03, goldGainMul: 0.03 },
    hooks: {
      onProjectileSpawn: ({ projectile, rng }) => {
        const r = run();
        if (!r || !markProjectile(projectile, TAG.jackpot)) return;
        const stacks = stacksOf(r, 'loaded_jackpot');
        projectile.critChance = Math.min(0.85, (projectile.critChance ?? 0) + stacks * 0.08 + r.gambitStacks * 0.02);
        const roll = rng();
        if (roll < stacks * 0.12) {
          projectile.damage *= 1.65 + stacks * 0.25;
          projectile.radius += stacks * 0.5;
          projectile.tags.add(`${TAG.jackpot}:payout`);
        } else if (roll > 0.97) {
          projectile.damage *= 0.65;
        }
      },
      onProjectileHit: ({ projectile, rng }) => {
        const r = run();
        const hitTag = `${TAG.jackpot}:hit`;
        if (!r || !projectile.tags.has(`${TAG.jackpot}:payout`) || projectile.tags.has(hitTag)) return;
        projectile.tags.add(hitTag);
        const stacks = stacksOf(r, 'loaded_jackpot');
        if (rng() < 0.2 + stacks * 0.08) r.gold += 1 + Math.floor(stacks / 2);
      },
    },
  },
  {
    id: 'transmute',
    name: 'Transmute',
    desc: 'Alchemist signature. Start equipped. Repeating an element converts the streak into gold and light healing.',
    rarity: 'rare',
    category: 'bauble',
    maxStack: 3,
    characterExclusive: 'alchemist',
    icon: ['...mmmm.....', '..mxxxx....', '.mx999xm...', '.mx999xm...', '..mxxxx....', '...mmmm.....', '....x......'],
    bauble: { goldGainMul: 0.03, healingReceivedMul: 0.02 },
    hooks: {
      onRoll: ({ face, rollCount }) => {
        const r = run();
        if (!r || face.element === 'none' || !oncePerRoll(r, '_transmuteLastRoll', rollCount)) return;
        const stacks = stacksOf(r, 'transmute');
        if (r._transmuteLastElement === face.element) {
          r.gold += 1 + stacks;
          if (stacks >= 2) r.hp = Math.min(r.maxHp, r.hp + stacks);
        }
        r._transmuteLastElement = face.element;
      },
    },
  },
  {
    id: 'reaction_mastery',
    name: 'Reaction Mastery',
    desc: 'Alchemist signature. Start equipped. Changing elements splashes a wider control reaction through nearby packs.',
    rarity: 'legendary',
    category: 'bauble',
    maxStack: 3,
    characterExclusive: 'alchemist',
    icon: ['...qqqq.....', '..qmmmm....', '.qmzzzmq...', '.qmzzzmq...', '..qmmmm....', '...qqqq.....', '....m......'],
    bauble: { freezeDurationMul: 0.04, stunDurationMul: 0.04, damageToPoisonedMul: 0.05 },
    hooks: {
      onRoll: ({ face, rollCount }) => {
        const r = run();
        if (!r || face.element === 'none' || !oncePerRoll(r, '_reactionLastRoll', rollCount)) return;
        const stacks = stacksOf(r, 'reaction_mastery');
        if (r._reactionLastElement && r._reactionLastElement !== face.element) pulseStatus(face.element, stacks);
        r._reactionLastElement = face.element;
      },
      onProjectileSpawn: ({ projectile }) => {
        const r = run();
        if (!r || projectile.element === 'none' || !markProjectile(projectile, 'char:reaction_mastery')) return;
        const stacks = stacksOf(r, 'reaction_mastery');
        projectile.aoeOnHit = Math.max(projectile.aoeOnHit, 8 + stacks * 8);
      },
    },
  },
  {
    id: 'volatile_mixture',
    name: 'Volatile Mixture',
    desc: 'Alchemist signature. Start equipped. Elemental flasks bloom into fire and poison splash pressure.',
    rarity: 'epic',
    category: 'bauble',
    maxStack: 3,
    characterExclusive: 'alchemist',
    icon: ['...6666.....', '..6zzzz....', '.6zuuz6....', '.6zuuz6....', '..6zzzz....', '...6666.....', '....u......'],
    bauble: { burnTickDamageMul: 0.04, poisonTickDamageMul: 0.06, poisonApplicationDpsMul: 0.04 },
    hooks: {
      onProjectileSpawn: ({ projectile }) => {
        const r = run();
        if (!r || !markProjectile(projectile, TAG.volatile)) return;
        const stacks = stacksOf(r, 'volatile_mixture');
        projectile.aoeOnHit = Math.max(projectile.aoeOnHit, 14 + stacks * 8);
        projectile.damage *= 1.04 + stacks * 0.04;
        projectile.burnDps = Math.max(projectile.burnDps ?? 0, 2 + stacks * 2);
        projectile.burnDur = Math.max(projectile.burnDur ?? 0, 1.6 + stacks * 0.7);
      },
    },
  },
  {
    id: 'soul_harvest',
    name: 'Soul Harvest',
    desc: 'Necromancer signature. Start equipped. Kills feed souls, and soul-rich volleys become hungry homing wraith shots.',
    rarity: 'rare',
    category: 'bauble',
    maxStack: 3,
    characterExclusive: 'necromancer',
    icon: ['...HHHH.....', '..Hdddd....', '.HdHHdH...', '.HddddH...', '..Hdddd....', '...HHHH.....', '....H......'],
    bauble: { arcaneDamageMul: 0.06, projectileDamageMul: 0.03 },
    hooks: {
      onKill: ({ enemy, rng }) => {
        const r = run();
        if (!r || enemy.data['soulHarvested']) return;
        enemy.data['soulHarvested'] = true;
        const stacks = stacksOf(r, 'soul_harvest');
        const gain = enemy.isBoss ? 2 + stacks : enemy.elite ? 1 + stacks : rng() < stacks * 0.25 ? 1 : 0;
        if (gain > 0) r.souls = Math.min(BALANCE.necromancer.soulsMax, r.souls + gain);
        if (r.souls >= Math.max(3, 6 - stacks)) r._soulHarvestSurge = Math.max(r._soulHarvestSurge ?? 0, stacks);
      },
      onProjectileSpawn: ({ projectile, face }) => {
        const r = run();
        if (!r || !markProjectile(projectile, TAG.soulHarvest)) return;
        const stacks = stacksOf(r, 'soul_harvest');
        if (r.souls > 0 || face.kind === 'SOUL_DRAIN') {
          projectile.homing = true;
          projectile.damage *= 1 + Math.min(0.55, r.souls * 0.025 * stacks);
          projectile.pierce += Math.floor(stacks / 2);
        }
        if ((r._soulHarvestSurge ?? 0) > 0) {
          projectile.damage *= 1 + (r._soulHarvestSurge ?? 0) * 0.2;
          projectile.pierce += r._soulHarvestSurge ?? 0;
          r._soulHarvestSurge = 0;
        }
      },
    },
  },
  {
    id: 'bloodrush',
    name: 'Bloodrush',
    desc: 'Berserker signature. Start equipped. High-Rage kills trigger a momentum window for heavier piercing axes.',
    rarity: 'epic',
    category: 'bauble',
    maxStack: 3,
    characterExclusive: 'berserker',
    icon: ['...hhhh.....', '..hLLLL....', '.hLiiLh...', '.hLiiLh...', '..hLLLL....', '...hhhh.....', '....h......'],
    bauble: { lowHpDamageMul: 0.05, orbitDamageMul: 0.06 },
    hooks: {
      onKill: ({ enemy }) => {
        const r = run();
        if (!r || enemy.data['bloodrushed']) return;
        enemy.data['bloodrushed'] = true;
        const stacks = stacksOf(r, 'bloodrush');
        if (r.rage < Math.max(2, 6 - stacks)) return;
        r.momentum = Math.max(r.momentum ?? 0, 2 + stacks);
        r.momentumT = Math.max(r.momentumT ?? 0, 2 + stacks * 0.4);
        r.rage = Math.min(BALANCE.berserker.rageMax, r.rage + stacks * 0.5);
      },
      onProjectileSpawn: ({ projectile }) => {
        const r = run();
        if (!r || !markProjectile(projectile, TAG.bloodrush)) return;
        const stacks = stacksOf(r, 'bloodrush');
        if ((r.momentum ?? 0) <= 0 && r.rage < 4) return;
        projectile.damage *= 1 + Math.min(0.65, r.rage * 0.03 * stacks);
        projectile.radius *= 1 + stacks * 0.04;
        if (stacks >= 2) projectile.pierce += 1;
      },
      onDamaged: ({ amount }) => {
        const r = run();
        if (!r || r.rage < 8) return amount;
        return amount * 0.94;
      },
    },
  },
] satisfies Upgrade[];
