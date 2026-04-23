import type { AnimationSpec } from '../types';

const C = {
  white: '#f0ecd8',
  steel: '#d6dde8',
  yellow: '#ffe466',
  gold: '#ffc56b',
  orange: '#ff7a2b',
  red: '#e23c4c',
  crimson: '#ff3a3a',
  ember: '#ffa21f',
  pink: '#ff6a7a',
  blue: '#62b8ff',
  cyan: '#66eaff',
  aqua: '#b8e0ff',
  deepBlue: '#2e4aa0',
  purple: '#c77cff',
  violet: '#b77aff',
  lilac: '#e5c8ff',
  green: '#6ae07a',
  mint: '#baf0b8',
  poison: '#89e53a',
  void: '#6a2eaa',
  voidDeep: '#1c102c',
  shadow: '#05050c',
};

const STARTER: AnimationSpec[] = [
  { id: 'muzzle_flash', kind: 'burst', color: C.white, size: 4, duration: 0.12, particles: 3, shake: 0.03 },
  { id: 'std_proj', kind: 'trail', color: C.steel, size: 3, duration: 0.25, particles: 4, trailLength: 5 },
  { id: 'std_burst', kind: 'burst', color: C.steel, secondaryColor: C.white, size: 6, duration: 0.2, particles: 5 },
  { id: 'explosion_small', kind: 'burst', color: C.orange, secondaryColor: C.ember, size: 12, duration: 0.3, particles: 10, shake: 0.08 },

  { id: 'fire_cast', kind: 'aura', color: C.orange, secondaryColor: C.ember, size: 10, duration: 0.22, particles: 8, shake: 0.04 },
  { id: 'fire_proj', kind: 'trail', color: C.orange, secondaryColor: C.ember, size: 4, duration: 0.25, particles: 6, trailLength: 6 },
  { id: 'fire_burst', kind: 'burst', color: C.orange, secondaryColor: C.ember, size: 10, duration: 0.32, particles: 8, shake: 0.05 },

  { id: 'frost_cast', kind: 'aura', color: C.cyan, secondaryColor: C.aqua, size: 10, duration: 0.22, particles: 7 },
  { id: 'frost_proj', kind: 'trail', color: C.cyan, secondaryColor: C.aqua, size: 4, duration: 0.25, particles: 5, trailLength: 7 },
  { id: 'frost_shatter', kind: 'burst', color: C.cyan, secondaryColor: C.aqua, size: 9, duration: 0.35, particles: 10 },

  { id: 'spark_cast', kind: 'aura', color: C.yellow, size: 9, duration: 0.18, particles: 7, shake: 0.03 },
  { id: 'arc_proj', kind: 'trail', color: C.yellow, secondaryColor: C.white, size: 3, duration: 0.22, particles: 5, trailLength: 6 },
  { id: 'arc_chain', kind: 'beam', color: C.yellow, secondaryColor: C.white, size: 5, duration: 0.2, particles: 4 },

  { id: 'aqua_cast', kind: 'aura', color: C.blue, secondaryColor: C.aqua, size: 10, duration: 0.2, particles: 7 },
  { id: 'aqua_proj', kind: 'trail', color: C.blue, secondaryColor: C.aqua, size: 4, duration: 0.26, particles: 5, trailLength: 6 },
  { id: 'splash_ring', kind: 'pulse', color: C.aqua, secondaryColor: C.blue, size: 14, duration: 0.35, particles: 8, ringThickness: 2 },

  { id: 'heavy_windup', kind: 'aura', color: C.gold, secondaryColor: C.orange, size: 11, duration: 0.3, particles: 5, shake: 0.05 },
  { id: 'lance_trail', kind: 'trail', color: C.white, secondaryColor: C.yellow, size: 5, duration: 0.28, particles: 4, trailLength: 8 },
  { id: 'impact_smash', kind: 'burst', color: C.gold, secondaryColor: C.orange, size: 14, duration: 0.4, particles: 10, shake: 0.12 },

  { id: 'launch_cast', kind: 'aura', color: C.red, secondaryColor: C.orange, size: 10, duration: 0.2, particles: 5, shake: 0.04 },
  { id: 'missile_trail', kind: 'trail', color: C.red, secondaryColor: C.orange, size: 4, duration: 0.3, particles: 8, trailLength: 8 },
  { id: 'bolt_proj', kind: 'trail', color: C.steel, secondaryColor: C.cyan, size: 3, duration: 0.22, particles: 3, trailLength: 9, spin: 0 },
  { id: 'pierce_spark', kind: 'burst', color: C.cyan, secondaryColor: C.white, size: 5, duration: 0.18, particles: 5 },

  { id: 'pulse_windup', kind: 'aura', color: C.aqua, secondaryColor: C.blue, size: 12, duration: 0.28, particles: 7 },
  { id: 'pulse_ring', kind: 'pulse', color: C.aqua, secondaryColor: C.white, size: 18, duration: 0.5, particles: 12, ringThickness: 3, shake: 0.12 },

  { id: 'heal_cast', kind: 'aura', color: C.green, secondaryColor: C.mint, size: 10, duration: 0.3, particles: 8 },
  { id: 'heal_glow', kind: 'glow', color: C.green, secondaryColor: C.mint, size: 12, duration: 0.45, particles: 8 },

  { id: 'shield_cast', kind: 'aura', color: C.cyan, secondaryColor: C.white, size: 12, duration: 0.3, particles: 6 },
  { id: 'shield_click', kind: 'burst', color: C.cyan, secondaryColor: C.white, size: 8, duration: 0.25, particles: 4 },

  { id: 'void_cast', kind: 'aura', color: C.void, secondaryColor: C.purple, size: 12, duration: 0.32, particles: 8, shake: 0.05 },
  { id: 'void_orb', kind: 'trail', color: C.void, secondaryColor: C.purple, size: 5, duration: 0.35, particles: 10, trailLength: 6 },
  { id: 'void_collapse', kind: 'pulse', color: C.violet, secondaryColor: C.voidDeep, size: 20, duration: 0.5, particles: 14, shake: 0.12 },

  { id: 'thunder_cast', kind: 'aura', color: C.yellow, secondaryColor: C.white, size: 10, duration: 0.2, particles: 6, shake: 0.06 },
  { id: 'thunder_column', kind: 'columns', color: C.yellow, secondaryColor: C.white, size: 14, duration: 0.35, particles: 12, shake: 0.14 },

  { id: 'dragon_roar', kind: 'aura', color: C.red, secondaryColor: C.gold, size: 14, duration: 0.35, particles: 10, shake: 0.1 },
  { id: 'fang_proj', kind: 'trail', color: C.gold, secondaryColor: C.orange, size: 6, duration: 0.3, particles: 8, trailLength: 9 },
  { id: 'fang_impact', kind: 'burst', color: C.gold, secondaryColor: C.orange, size: 14, duration: 0.4, particles: 12, shake: 0.12 },

  { id: 'coin_sparkle', kind: 'burst', color: C.gold, secondaryColor: C.yellow, size: 5, duration: 0.35, particles: 6 },
  { id: 'shrapnel_burst', kind: 'burst', color: C.steel, secondaryColor: C.white, size: 7, duration: 0.3, particles: 9 },
  { id: 'blood_mist', kind: 'burst', color: C.red, secondaryColor: C.crimson, size: 6, duration: 0.32, particles: 7 },
  { id: 'echo_shimmer', kind: 'glow', color: C.lilac, secondaryColor: C.white, size: 10, duration: 0.25, particles: 6 },

  { id: 'volley_burst', kind: 'burst', color: C.yellow, secondaryColor: C.white, size: 18, duration: 0.45, particles: 16, shake: 0.1 },
  { id: 'rail_streak', kind: 'beam', color: C.cyan, secondaryColor: C.white, size: 10, duration: 0.5, particles: 10, shake: 0.1 },
  { id: 'phoenix_split', kind: 'burst', color: C.orange, secondaryColor: C.gold, size: 18, duration: 0.5, particles: 14, shake: 0.1 },
  { id: 'zero_freeze', kind: 'burst', color: C.aqua, secondaryColor: C.white, size: 16, duration: 0.55, particles: 16, shake: 0.08 },
  { id: 'storm_chain', kind: 'beam', color: C.yellow, secondaryColor: C.violet, size: 14, duration: 0.45, particles: 14, shake: 0.1 },
  { id: 'tide_pool', kind: 'pulse', color: C.aqua, secondaryColor: C.blue, size: 20, duration: 0.55, particles: 14, ringThickness: 3 },
  { id: 'cruise_mark', kind: 'burst', color: C.red, secondaryColor: C.yellow, size: 14, duration: 0.4, particles: 10, shake: 0.12 },
  { id: 'meteor_crash', kind: 'burst', color: C.orange, secondaryColor: C.red, size: 22, duration: 0.6, particles: 18, shake: 0.2 },
  { id: 'supernova_ring', kind: 'pulse', color: C.white, secondaryColor: C.yellow, size: 28, duration: 0.7, particles: 20, ringThickness: 4, shake: 0.2 },
  { id: 'fountain_overflow', kind: 'glow', color: C.green, secondaryColor: C.cyan, size: 18, duration: 0.5, particles: 14 },
  { id: 'bulwark_reflect', kind: 'burst', color: C.cyan, secondaryColor: C.white, size: 14, duration: 0.4, particles: 10 },
  { id: 'event_horizon', kind: 'pulse', color: C.void, secondaryColor: C.violet, size: 30, duration: 0.7, particles: 20, shake: 0.2 },
  { id: 'zeus_double', kind: 'columns', color: C.yellow, secondaryColor: C.white, size: 18, duration: 0.5, particles: 16, shake: 0.18 },
  { id: 'salvo_home', kind: 'aura', color: C.yellow, secondaryColor: C.white, size: 12, duration: 0.3, particles: 8 },
  { id: 'frag_always', kind: 'burst', color: C.white, secondaryColor: C.steel, size: 10, duration: 0.3, particles: 12 },
  { id: 'wildfire_spread', kind: 'burst', color: C.orange, secondaryColor: C.ember, size: 12, duration: 0.45, particles: 12 },
  { id: 'bloodpact_heal', kind: 'burst', color: C.red, secondaryColor: C.pink, size: 10, duration: 0.4, particles: 8 },
  { id: 'midas_glow', kind: 'glow', color: C.gold, secondaryColor: C.yellow, size: 12, duration: 0.45, particles: 10 },
  { id: 'triplet_flash', kind: 'glow', color: C.lilac, secondaryColor: C.white, size: 14, duration: 0.3, particles: 10 },
  { id: 'harpoon_pull', kind: 'burst', color: C.steel, secondaryColor: C.yellow, size: 10, duration: 0.35, particles: 10 },
  { id: 'wyrm_trail', kind: 'trail', color: C.orange, secondaryColor: C.gold, size: 6, duration: 0.5, particles: 14, trailLength: 10 },
];

export default STARTER;
