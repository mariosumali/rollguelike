import type { Upgrade } from '../../types';
export const PROJECTILE_UPGRADES: Upgrade[] = [
  {
    id: 'proj_pierce_1',
    name: 'Piercing',
    desc: 'Projectiles pierce +1 enemy.',
    rarity: 'rare',
    category: 'projectile',
    maxStack: 3,
    hooks: {
      onProjectileSpawn: ({ projectile }) => {
        projectile.pierce += 1;
      },
    },
  },
  {
    id: 'proj_bounce_1',
    name: 'Ricochet',
    desc: 'Projectiles bounce off walls +1.',
    rarity: 'rare',
    category: 'projectile',
    maxStack: 3,
    hooks: {
      onProjectileSpawn: ({ projectile }) => {
        projectile.bounces += 1;
      },
    },
  },
  {
    id: 'proj_chain_1',
    name: 'Chain',
    desc: 'Projectiles chain to +1 enemy.',
    rarity: 'epic',
    category: 'projectile',
    maxStack: 3,
    hooks: {
      onProjectileSpawn: ({ projectile }) => {
        projectile.chain += 1;
      },
    },
  },
  {
    id: 'proj_homing',
    name: 'Homing',
    desc: 'Projectiles track enemies.',
    rarity: 'epic',
    category: 'projectile',
    maxStack: 1,
    hooks: {
      onProjectileSpawn: ({ projectile }) => {
        projectile.homing = true;
      },
    },
  },
  {
    id: 'proj_split_1',
    name: 'Split Shot',
    desc: 'On first hit, split into 2 extra shots.',
    rarity: 'epic',
    category: 'projectile',
    maxStack: 2,
    hooks: {
      onProjectileSpawn: ({ projectile }) => {
        projectile.split += 1;
      },
    },
  },
  {
    id: 'proj_aoe_hit',
    name: 'Concussive Hit',
    desc: 'Projectiles deal splash damage on hit.',
    rarity: 'epic',
    category: 'projectile',
    maxStack: 2,
    hooks: {
      onProjectileSpawn: ({ projectile }) => {
        projectile.aoeOnHit = Math.max(projectile.aoeOnHit, 14) + 4;
      },
    },
  },
  {
    id: 'proj_lifesteal',
    name: 'Lifesteal',
    desc: 'Each projectile hit heals 1 HP.',
    rarity: 'epic',
    category: 'projectile',
    maxStack: 2,
    hooks: {
      onProjectileSpawn: ({ projectile }) => {
        projectile.lifesteal += 1;
      },
    },
  },
  {
    id: 'proj_damage_1',
    name: 'Sharpened',
    desc: '+15% projectile damage.',
    rarity: 'common',
    category: 'projectile',
    maxStack: 5,
    hooks: {
      onProjectileSpawn: ({ projectile }) => {
        projectile.damage *= 1.15;
      },
    },
  },
  {
    id: 'proj_size',
    name: 'Heavy Rounds',
    desc: 'Projectiles are larger (+hit radius).',
    rarity: 'common',
    category: 'projectile',
    maxStack: 3,
    hooks: {
      onProjectileSpawn: ({ projectile }) => {
        projectile.radius += 1;
      },
    },
  },
  {
    id: 'proj_fire_element',
    name: 'Ignite',
    desc: 'All projectiles are fire-aspected.',
    rarity: 'rare',
    category: 'projectile',
    maxStack: 1,
    hooks: {
      onProjectileSpawn: ({ projectile }) => {
        if (projectile.element === 'none') projectile.element = 'fire';
      },
    },
  },
  {
    id: 'proj_ice_element',
    name: 'Frostbite',
    desc: 'All projectiles are ice-aspected.',
    rarity: 'rare',
    category: 'projectile',
    maxStack: 1,
    hooks: {
      onProjectileSpawn: ({ projectile }) => {
        if (projectile.element === 'none') projectile.element = 'ice';
      },
    },
  },
  {
    id: 'proj_poison_element',
    name: 'Toxin',
    desc: 'All projectiles are poison-aspected.',
    rarity: 'rare',
    category: 'projectile',
    maxStack: 1,
    hooks: {
      onProjectileSpawn: ({ projectile }) => {
        if (projectile.element === 'none') projectile.element = 'poison';
      },
    },
  },
  {
    id: 'proj_lightning_element',
    name: 'Stormcaller',
    desc: 'All projectiles are lightning-aspected.',
    rarity: 'rare',
    category: 'projectile',
    maxStack: 1,
    hooks: {
      onProjectileSpawn: ({ projectile }) => {
        if (projectile.element === 'none') projectile.element = 'lightning';
      },
    },
  },
  {
    id: 'proj_speed',
    name: 'Kinetic Rounds',
    desc: 'Projectiles travel faster.',
    rarity: 'common',
    category: 'projectile',
    maxStack: 3,
    hooks: {
      onProjectileSpawn: ({ projectile }) => {
        projectile.vx *= 1.2;
        projectile.vy *= 1.2;
      },
    },
  },
  {
    id: 'proj_crit',
    name: 'Critical Edge',
    desc: '15% chance to crit for 2x damage.',
    rarity: 'rare',
    category: 'projectile',
    maxStack: 3,
    hooks: {
      onProjectileSpawn: ({ projectile, rng }) => {
        if (rng() < 0.15) projectile.damage *= 2;
      },
    },
  },
  {
    id: 'proj_ally_damage',
    name: 'Executioner',
    desc: '+40% damage vs enemies below 50% HP.',
    rarity: 'epic',
    category: 'projectile',
    maxStack: 2,
    hooks: {
      onProjectileHit: ({ enemy, projectile }) => {
        if (enemy.hp < enemy.maxHp * 0.5) {
          projectile.damage *= 1.4;
        }
      },
    },
  },
];
