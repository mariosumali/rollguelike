import type { Enemy, Projectile, RunState, Upgrade } from '../../types';
import { BALANCE } from '../../config/balance';
import { PLAYER_X, PLAYER_Y } from '../../config/constants';
import { getEngineState, hitEnemy, playRelicAnimation } from '../../engine/engine';
import { getRunState } from '../../state/store';

type RelicRunState = RunState & {
  _excaliburRolls?: number;
  _excaliburCharged?: boolean;
  _holyGrailBlessing?: boolean;
  _aegisReady?: boolean;
  _mjolnirCharge?: number;
  _necroPages?: number;
  _necroLoaded?: boolean;
  _gungnirReady?: boolean;
  _yataRolls?: number;
  _yataMirror?: boolean;
};

const RELIC_TAGS = {
  excalibur: 'relic:excalibur',
  gungnir: 'relic:gungnir',
  yata: 'relic:yata',
};

function relicRun(): RelicRunState | null {
  return getRunState() as RelicRunState | null;
}

function liveEnemies(): Enemy[] {
  return getEngineState().enemies.filter((e) => e.alive && e.state !== 'die');
}

function damageAround(
  run: RunState,
  x: number,
  y: number,
  radius: number,
  damage: number,
  element: string,
  limit = Infinity,
): void {
  let hit = 0;
  const r2 = radius * radius;
  for (const enemy of liveEnemies()) {
    const dx = enemy.x - x;
    const dy = enemy.y - y;
    if (dx * dx + dy * dy > r2) continue;
    hitEnemy(enemy, damage, element, run, undefined, { source: 'landmark' });
    hit++;
    if (hit >= limit) return;
  }
}

function empowerProjectile(
  projectile: Projectile,
  opts: {
    damageMul?: number;
    radiusMul?: number;
    pierce?: number;
    chain?: number;
    element?: Projectile['element'];
    crit?: number;
    tag?: string;
    trail?: string;
  },
): void {
  if (opts.damageMul) projectile.damage *= opts.damageMul;
  if (opts.radiusMul) projectile.radius *= opts.radiusMul;
  if (opts.pierce) projectile.pierce += opts.pierce;
  if (opts.chain) projectile.chain += opts.chain;
  if (opts.element) projectile.element = opts.element;
  if (opts.crit) projectile.critChance = Math.max(projectile.critChance ?? 0, opts.crit);
  if (opts.tag) projectile.tags.add(opts.tag);
  if (opts.trail) projectile.animTrailId = opts.trail;
}

const excaliburIcon = [
  '........9.........',
  '.......9x9........',
  '......9xQx9.......',
  '.....9xQx9........',
  '....9xQx9.........',
  '...9xQx9..........',
  '..9xQx9...........',
  '.9xQx9............',
  '..9xQx9...........',
  '...9xQx9..........',
  '....9xQx9.........',
  '.....9x9..........',
  '......6...........',
  '.....6q6..........',
  '....66q66.........',
  '......6...........',
  '.....777..........',
  '..................',
];

const grailIcon = [
  '..................',
  '......888888......',
  '.....8vQQv8.......',
  '....8vqqqqv8......',
  '....8vqqqqv8......',
  '.....8vvvv8.......',
  '......8888........',
  '.......88.........',
  '.......88.........',
  '......8888........',
  '.....88hh88.......',
  '....88hxxh88......',
  '....88888888......',
  '.....888888.......',
  '..................',
  '.......xxx........',
  '......x...x.......',
  '..................',
];

const mjolnirIcon = [
  '..................',
  '.....bbbbbbbb.....',
  '....bQQQQQQb......',
  '...bbQQQQQQbb.....',
  '....bbbbbbbb......',
  '.......66.........',
  '.......66....D....',
  '.......66...D.....',
  '.......66..D......',
  '.......66.D.......',
  '.......66.........',
  '......6666........',
  '.....66..66.......',
  '....66....66......',
  '..................',
  '..D.......D.......',
  '...D.....D........',
  '..................',
];

const aegisIcon = [
  '..................',
  '......777777......',
  '....7788888877....',
  '...7788qqqq8877...',
  '..7788qDDDDq8877..',
  '..788qD0000Dq887..',
  '.788qD0SS0Dq887...',
  '.788qD0SS0Dq887...',
  '.788qD0000Dq887...',
  '..788qDDDDq887....',
  '..7788qqqq8877....',
  '...7788888877.....',
  '....77777777......',
  '......7777........',
  '.......77.........',
  '..................',
  '..................',
  '..................',
];

const stoneIcon = [
  '..................',
  '.......LLLL.......',
  '......LiiiiL......',
  '.....LihhhiL......',
  '....LihLLhiL......',
  '....LihLLhiL......',
  '.....LihhiL.......',
  '......LiiL........',
  '.......LL.........',
  '.....777777.......',
  '....77xxxx77......',
  '.....777777.......',
  '..................',
  '...x.........x....',
  '..................',
  '.......x..........',
  '..................',
  '..................',
];

const necronomiconIcon = [
  '..................',
  '....111111111.....',
  '...1TTTTTTTTT1....',
  '..1TzzzzzzzzzT1...',
  '..1Tz1111111zT1...',
  '..1Tz1SSSS1zT1...',
  '..1Tz1S11S1zT1...',
  '..1Tz1SSSS1zT1...',
  '..1Tz1111111zT1...',
  '..1TzzzzzzzzzT1...',
  '...1TTTTTTTTT1....',
  '....111111111.....',
  '......6666........',
  '.......66.........',
  '..................',
  '....z.......z.....',
  '..................',
  '..................',
];

const gungnirIcon = [
  '...........Q......',
  '..........QdQ.....',
  '.........QdddQ....',
  '........QdddQ.....',
  '.......QdddQ......',
  '......QdddQ.......',
  '.....QdddQ........',
  '....QdddQ.........',
  '...QdddQ..........',
  '..QdddQ...........',
  '.QdddQ............',
  '..hh..............',
  '...hh.............',
  '....hh............',
  '..................',
  '..................',
  '..................',
  '..................',
];

const yataIcon = [
  '..................',
  '......777777......',
  '....7788888877....',
  '...7889SSSS9887...',
  '..7889SQQQQS9887..',
  '..789SQddddQS987..',
  '..789SQdQQdQS987..',
  '..789SQdQQdQS987..',
  '..789SQddddQS987..',
  '..7889SQQQQS9887..',
  '...7889SSSS9887...',
  '....7788888877....',
  '......777777......',
  '.......hh.........',
  '......h..h........',
  '.....h....h.......',
  '..................',
  '..................',
];

export const RELIC_UPGRADES: Upgrade[] = [
  {
    id: 'relic_excalibur',
    name: 'Excalibur',
    desc: 'Every 6th roll blesses the first projectile into a radiant piercing slash.',
    lore: 'The sword that makes a run feel chosen.',
    rarity: 'legendary',
    category: 'relic',
    maxStack: 1,
    minWave: 12,
    icon: excaliburIcon,
    procAnimation: 'relic_excalibur_slash',
    forgePrice: 820,
    hooks: {
      onRoll: () => {
        const run = relicRun();
        if (!run) return;
        run._excaliburRolls = (run._excaliburRolls ?? 0) + 1;
        if (run._excaliburRolls >= 6) {
          run._excaliburRolls = 0;
          run._excaliburCharged = true;
          playRelicAnimation('relic_excalibur_slash', PLAYER_X, PLAYER_Y - 16, 1.2);
        }
      },
      onProjectileSpawn: ({ projectile }) => {
        const run = relicRun();
        if (!run?._excaliburCharged) return;
        run._excaliburCharged = false;
        empowerProjectile(projectile, {
          damageMul: 2.2,
          radiusMul: 1.6,
          pierce: 5,
          element: 'arcane',
          crit: 0.4,
          tag: RELIC_TAGS.excalibur,
          trail: 'lance_trail',
        });
        playRelicAnimation('relic_excalibur_slash', projectile.x, projectile.y, 1.4);
      },
      onProjectileHit: ({ projectile, enemy }) => {
        const run = relicRun();
        if (!run || !projectile.tags.has(RELIC_TAGS.excalibur)) return;
        enemy.radiance = Math.max(enemy.radiance, 3);
      },
    },
  },
  {
    id: 'relic_holy_grail',
    name: 'Holy Grail',
    desc: 'Each wave, prevent one lethal or low-HP hit, then heal and overflow into shield.',
    lore: 'A second breath sealed in gold.',
    rarity: 'legendary',
    category: 'relic',
    maxStack: 1,
    minWave: 10,
    icon: grailIcon,
    procAnimation: 'relic_holy_grail',
    forgePrice: 760,
    hooks: {
      onWaveStart: () => {
        const run = relicRun();
        if (run) run._holyGrailBlessing = true;
      },
      onDamaged: ({ amount }) => {
        const run = relicRun();
        if (!run?._holyGrailBlessing) return amount;
        if (run.hp - amount > run.maxHp * 0.35) return amount;
        run._holyGrailBlessing = false;
        const heal = Math.max(18, Math.round(run.maxHp * 0.28));
        const before = run.hp;
        run.hp = Math.min(run.maxHp, run.hp + heal);
        const overflow = Math.max(0, before + heal - run.maxHp);
        run.shield = Math.min(BALANCE.combat.shieldMax, run.shield + 2 + Math.floor(overflow / 12));
        damageAround(run, PLAYER_X, PLAYER_Y, 70, 18 + run.wave, 'arcane');
        playRelicAnimation('relic_holy_grail', PLAYER_X, PLAYER_Y - 8);
        return 0;
      },
    },
  },
  {
    id: 'relic_mjolnir',
    name: 'Mjolnir',
    desc: 'Hits build static. At full charge, call a stunning chain lightning strike.',
    lore: 'Thunder remembers every blow.',
    rarity: 'legendary',
    category: 'relic',
    maxStack: 1,
    minWave: 12,
    icon: mjolnirIcon,
    procAnimation: 'relic_mjolnir_storm',
    forgePrice: 780,
    hooks: {
      onProjectileHit: ({ enemy, projectile }) => {
        const run = relicRun();
        if (!run) return;
        run._mjolnirCharge = (run._mjolnirCharge ?? 0) + (enemy.isBoss ? 3 : 1);
        if (run._mjolnirCharge < 8) return;
        run._mjolnirCharge = 0;
        enemy.freeze = Math.max(enemy.freeze, 0.45);
        enemy.charged = Math.max(enemy.charged, 2);
        hitEnemy(enemy, projectile.damage * 1.5, 'lightning', run, projectile, { source: 'chain', projectile });
        damageAround(run, enemy.x, enemy.y, 78, projectile.damage * 0.65, 'lightning', 4);
        playRelicAnimation('relic_mjolnir_storm', enemy.x, enemy.y, 1.25);
      },
    },
  },
  {
    id: 'relic_aegis',
    name: 'Aegis',
    desc: 'Blocks the first damage each wave and reflects a bronze shockwave.',
    lore: 'A shield so old even monsters hesitate.',
    rarity: 'epic',
    category: 'relic',
    maxStack: 1,
    minWave: 7,
    icon: aegisIcon,
    procAnimation: 'relic_aegis_guard',
    forgePrice: 460,
    hooks: {
      onWaveStart: () => {
        const run = relicRun();
        if (run) run._aegisReady = true;
      },
      onDamaged: ({ amount }) => {
        const run = relicRun();
        if (!run?._aegisReady) return amount;
        run._aegisReady = false;
        run.shield = Math.min(BALANCE.combat.shieldMax, run.shield + 1);
        damageAround(run, PLAYER_X, PLAYER_Y, 86, 20 + run.wave * 1.4, 'none');
        playRelicAnimation('relic_aegis_guard', PLAYER_X, PLAYER_Y - 8);
        return 0;
      },
    },
  },
  {
    id: 'relic_philosophers_stone',
    name: "Philosopher's Stone",
    desc: 'Gold becomes power: earn more gold and scale projectile damage with your hoard.',
    lore: 'Every coin wants to become a weapon.',
    rarity: 'legendary',
    category: 'relic',
    maxStack: 1,
    minWave: 14,
    icon: stoneIcon,
    procAnimation: 'relic_philosopher_stone',
    forgePrice: 850,
    hooks: {
      onProjectileSpawn: ({ projectile }) => {
        const run = relicRun();
        if (!run) return;
        const hoardMul = 1 + Math.min(0.75, Math.sqrt(Math.max(0, run.gold)) / 60);
        projectile.damage *= hoardMul;
        if (run.gold >= 250) projectile.animTrailId = 'midas_glow';
      },
      onKill: ({ enemy }) => {
        const run = relicRun();
        if (!run) return;
        const bonus = enemy.isBoss ? 35 : enemy.elite ? 12 : 2;
        run.gold += bonus;
        if (enemy.elite || enemy.isBoss) {
          playRelicAnimation('relic_philosopher_stone', enemy.x, enemy.y, 1.1);
        }
      },
    },
  },
  {
    id: 'relic_necronomicon',
    name: 'Necronomicon',
    desc: 'Every 5 kills stores a page. Pages haunt future rolls as homing wraith shots.',
    lore: 'A book that writes enemies into itself.',
    rarity: 'epic',
    category: 'relic',
    maxStack: 1,
    minWave: 8,
    icon: necronomiconIcon,
    procAnimation: 'relic_necronomicon_page',
    forgePrice: 430,
    hooks: {
      onKill: ({ enemy }) => {
        const run = relicRun();
        if (!run) return;
        const gain = enemy.isBoss ? 3 : enemy.elite ? 2 : 1;
        run._necroPages = Math.min(15, (run._necroPages ?? 0) + gain);
        if (run._necroPages >= 5) playRelicAnimation('relic_necronomicon_page', enemy.x, enemy.y, 1);
      },
      onRoll: () => {
        const run = relicRun();
        if (!run || (run._necroPages ?? 0) < 5) return;
        run._necroLoaded = true;
      },
      onProjectileSpawn: ({ projectile }) => {
        const run = relicRun();
        if (!run?._necroLoaded || (run._necroPages ?? 0) < 5) return;
        run._necroLoaded = false;
        run._necroPages = Math.max(0, (run._necroPages ?? 0) - 5);
        empowerProjectile(projectile, {
          damageMul: 1.65,
          radiusMul: 1.25,
          pierce: 2,
          element: 'poison',
          trail: 'minion_trail',
        });
        projectile.homing = true;
        projectile.minion = true;
        playRelicAnimation('relic_necronomicon_page', projectile.x, projectile.y, 1);
      },
    },
  },
  {
    id: 'relic_gungnir',
    name: 'Gungnir',
    desc: 'The first projectile each roll becomes a piercing spear that marks enemies.',
    lore: 'A spear that refuses to miss.',
    rarity: 'epic',
    category: 'relic',
    maxStack: 1,
    minWave: 9,
    icon: gungnirIcon,
    procAnimation: 'relic_gungnir_mark',
    forgePrice: 440,
    hooks: {
      onRoll: () => {
        const run = relicRun();
        if (run) run._gungnirReady = true;
      },
      onProjectileSpawn: ({ projectile }) => {
        const run = relicRun();
        if (!run?._gungnirReady) return;
        run._gungnirReady = false;
        empowerProjectile(projectile, {
          damageMul: 1.85,
          radiusMul: 1.35,
          pierce: 7,
          element: 'arcane',
          tag: RELIC_TAGS.gungnir,
          trail: 'relic_gungnir_mark',
        });
        projectile.homing = true;
        playRelicAnimation('relic_gungnir_mark', projectile.x, projectile.y, 1);
      },
      onProjectileHit: ({ projectile, enemy }) => {
        const run = relicRun();
        if (!run) return;
        if (projectile.tags.has(RELIC_TAGS.gungnir)) {
          enemy.data.gungnirMark = 4;
          playRelicAnimation('relic_gungnir_mark', enemy.x, enemy.y, 0.8);
          return;
        }
        const mark = enemy.data.gungnirMark;
        if (typeof mark === 'number' && mark > 0) {
          hitEnemy(enemy, projectile.damage * 0.35, 'arcane', run, projectile, { source: 'landmark', projectile });
        }
      },
      onTick: ({ dt }) => {
        for (const enemy of liveEnemies()) {
          const mark = enemy.data.gungnirMark;
          if (typeof mark === 'number' && mark > 0) enemy.data.gungnirMark = Math.max(0, mark - dt);
        }
      },
    },
  },
  {
    id: 'relic_yata_mirror',
    name: 'Yata Mirror',
    desc: 'Every 4th roll mirrors its intent: defensive rolls double, attacks shimmer harder.',
    lore: 'A sacred reflection of the last choice fate made.',
    rarity: 'epic',
    category: 'relic',
    maxStack: 1,
    minWave: 10,
    icon: yataIcon,
    procAnimation: 'relic_yata_mirror',
    forgePrice: 470,
    hooks: {
      onRoll: ({ face }) => {
        const run = relicRun();
        if (!run) return;
        run._yataRolls = (run._yataRolls ?? 0) + 1;
        if (run._yataRolls < 4) return;
        run._yataRolls = 0;
        if (face.kind === 'HEAL') {
          run.hp = Math.min(run.maxHp, run.hp + 8 + face.value * 2);
          playRelicAnimation('relic_yata_mirror', PLAYER_X, PLAYER_Y - 10);
        } else if (face.kind === 'SHIELD') {
          run.shield = Math.min(BALANCE.combat.shieldMax, run.shield + 2 + Math.floor(face.value / 2));
          playRelicAnimation('relic_yata_mirror', PLAYER_X, PLAYER_Y - 10);
        } else {
          run._yataMirror = true;
        }
      },
      onProjectileSpawn: ({ projectile }) => {
        const run = relicRun();
        if (!run?._yataMirror) return;
        run._yataMirror = false;
        empowerProjectile(projectile, {
          damageMul: 1.55,
          radiusMul: 1.2,
          chain: 1,
          tag: RELIC_TAGS.yata,
          trail: 'echo_shimmer',
        });
        playRelicAnimation('relic_yata_mirror', projectile.x, projectile.y, 1);
      },
    },
  },
];

