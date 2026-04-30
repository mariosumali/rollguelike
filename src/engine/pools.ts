import type { Projectile, Enemy, VfxParticle, NumberPopup, SoulPickup } from '../types';

export function createProjectilePool(size: number): Projectile[] {
  return Array.from({ length: size }, () => makeProjectile());
}

export function makeProjectile(): Projectile {
  return {
    alive: false,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    radius: 2,
    damage: 0,
    pierce: 0,
    bounces: 0,
    chain: 0,
    split: 0,
    homing: false,
    aoeOnHit: 0,
    lifesteal: 0,
    element: 'none',
    hitIds: new Set<number>(),
    age: 0,
    maxAge: 2.4,
    trail: [],
    color: '#fff',
    sourceFaceValue: 1,
    archetype: null,
    rotation: 0,
    tags: new Set<string>(),
    tagT: 0,
    critChance: 0,
    burnDps: 0,
    burnDur: 0,
  };
}



export function acquire<T extends { alive: boolean }>(pool: T[], make: () => T): T {
  for (let i = 0; i < pool.length; i++) {
    const p = pool[i]!;
    if (!p.alive) return p;
  }
  const fresh = make();
  pool.push(fresh);
  return fresh;
}

export function resetProjectile(p: Projectile): void {
  p.alive = true;
  p.age = 0;
  p.hitIds.clear();
  p.trail.length = 0;
  p.pierce = 0;
  p.bounces = 0;
  p.chain = 0;
  p.split = 0;
  p.homing = false;
  p.aoeOnHit = 0;
  p.lifesteal = 0;
  p.element = 'none';
  p.archetype = null;
  p.rotation = 0;
  p.tags.clear();
  p.tagT = 0;
  p.critChance = 0;
  p.burnDps = 0;
  p.burnDur = 0;
  p.orbit = undefined;
  p.minion = undefined;
  p.animTrailId = undefined;
}

export function createEnemyPool(size: number): Enemy[] {
  return Array.from({ length: size }, () => makeEnemy());
}

let nextEnemyId = 1;

export function makeEnemy(): Enemy {
  return {
    id: nextEnemyId++,
    alive: false,
    typeId: '',
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    hp: 0,
    maxHp: 0,
    speed: 0,
    radius: 6,
    age: 0,
    state: 'walk',
    flashT: 0,
    dieT: 0,
    data: {},
    element: 'none',
    hitFlash: 0,
    slow: 0,
    slowT: 0,
    freeze: 0,
    poisonT: 0,
    poisonDps: 0,
    absorbed: 0,
    corrode: 0,
    chill: 0,
    voidMark: 0,
    radiance: 0,
    charged: 0,
    eliteKind: undefined,
    objectiveRole: undefined,
  };
}

export function resetEnemy(e: Enemy): void {
  e.alive = true;
  e.id = nextEnemyId++;
  e.age = 0;
  e.state = 'walk';
  e.flashT = 0;
  e.dieT = 0;
  e.data = {};
  e.element = 'none';
  e.hitFlash = 0;
  e.slow = 0;
  e.slowT = 0;
  e.freeze = 0;
  e.poisonT = 0;
  e.poisonDps = 0;
  e.absorbed = 0;
  e.corrode = 0;
  e.chill = 0;
  e.voidMark = 0;
  e.radiance = 0;
  e.charged = 0;
  e.elite = false;
  e.eliteKind = undefined;
  e.isBoss = false;
  e.objectiveRole = undefined;
}

export function createVfxPool(size: number): VfxParticle[] {
  return Array.from({ length: size }, () => makeVfx());
}

export function makeVfx(): VfxParticle {
  return {
    alive: false,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    age: 0,
    life: 0.5,
    color: '#fff',
    size: 2,
    kind: 'spark',
    angle: 0,
    rot: 0,
  };
}

export function createPopupPool(size: number): NumberPopup[] {
  return Array.from({ length: size }, () => makePopup());
}

export function makePopup(): NumberPopup {
  return {
    alive: false,
    x: 0,
    y: 0,
    vy: -14,
    age: 0,
    life: 0.8,
    text: '',
    color: '#fff',
    size: 8,
  };
}

export function createSoulPool(size: number): SoulPickup[] {
  return Array.from({ length: size }, () => makeSoul());
}

export function makeSoul(): SoulPickup {
  return {
    alive: false,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    age: 0,
    collected: false,
  };
}
