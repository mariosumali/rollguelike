import type { EnemyType, Enemy, Face, Projectile } from '../../types';
import { BALANCE } from '../../config/balance';
import { ARENA_W, HUD_H, WALL_Y } from '../../config/constants';
import { palHex } from '../../sprites/palette';

const BROODMOTHER_SPAWN_INTERVAL = [0, 8.0, 6.5, 5.4] as const;
const BROODMOTHER_BURST_COUNT = [0, 2, 2, 3] as const;
const BROODMOTHER_ACTIVE_CAP = [0, 3, 4, 5] as const;
const GLASS_TWIN_COPY_INTERVAL = [0, 5.6, 4.8, 4.0] as const;
const GLASS_TWIN_COPY_WINDUP = 0.9;

function oscillate(e: Enemy, dt: number, amplitude: number): void {
  e.data['t'] = ((e.data['t'] as number | undefined) ?? 0) + dt;
  const t = e.data['t'] as number;
  e.x += Math.cos(t * 0.9) * amplitude * dt;
  if (e.x < 24) e.x = 24;
  if (e.x > ARENA_W - 24) e.x = ARENA_W - 24;
}

function approachTargetY(e: Enemy, dt: number, targetY: number, speedMul = 1): void {
  const speed = e.speed * speedMul;
  if (e.y < targetY) e.vy = speed;
  else if (e.y > targetY + 2) e.vy = -speed * 0.5;
  else e.vy = 0;
  e.y += e.vy * dt;
  e.y = Math.max(HUD_H + 24, Math.min(e.y, targetY + 2));
  e.vy = 0;
}

interface MirrorVolleySpec {
  count: number;
  damage: number;
  faceValue: number;
  radius: number;
  speed: number;
  spreadStep: number;
}

function readyHostileMirrorProjectile(p: Projectile, e: Enemy, angle: number, spec: MirrorVolleySpec): void {
  p.alive = true;
  p.x = e.x;
  p.y = e.y + 10;
  p.vx = Math.cos(angle) * spec.speed;
  p.vy = Math.sin(angle) * spec.speed;
  p.damage = spec.damage;
  p.radius = spec.radius;
  p.pierce = 0;
  p.bounces = 0;
  p.chain = 0;
  p.split = 0;
  p.homing = false;
  p.aoeOnHit = 0;
  p.lifesteal = 0;
  p.element = 'arcane';
  p.age = 0;
  p.maxAge = 2;
  p.trail.length = 0;
  p.hitIds.clear();
  p.color = palHex('H')!;
  p.sourceFaceValue = spec.faceValue;
  p.archetype = null;
  p.rotation = angle;
  p.tags.clear();
  p.tags.add('hostile');
  p.critChance = 0;
  p.burnDps = 0;
  p.burnDur = 0;
  p.orbit = undefined;
  p.minion = undefined;
  p.animTrailId = undefined;
}

function mirrorVolleySpec(face: Face | null, phase: number): MirrorVolleySpec | null {
  if (!face) return null;
  if (face.kind === 'SHOT' || face.kind === 'BURST' || face.kind === 'CHARGED_BOLT' || face.kind === 'BOMB' || face.kind === 'SOUL_DRAIN') {
    const cap = phase >= 3 ? 5 : phase >= 2 ? 4 : 3;
    const baseCount = face.projectileCount ?? (face.kind === 'SHOT' || face.kind === 'BURST' ? face.value : 1);
    return {
      count: Math.max(1, Math.min(cap, baseCount)),
      damage: phase >= 3 ? 12 : phase >= 2 ? 10 : 8,
      faceValue: face.value,
      radius: face.kind === 'BOMB' ? 4 : 3,
      speed: 118,
      spreadStep: face.kind === 'BURST' || face.kind === 'BOMB' ? 0.18 : 0.12,
    };
  }
  if (face.kind === 'PULSE' || face.kind === 'RAGE_SMASH') {
    return {
      count: phase >= 3 ? 4 : phase >= 2 ? 3 : 2,
      damage: phase >= 3 ? 10 : 8,
      faceValue: face.value,
      radius: 4,
      speed: 96,
      spreadStep: 0.26,
    };
  }
  return null;
}

function spawnMirrorTell(e: Enemy, life: number, size: number): void {
  import('../../engine/engine').then(({ getEngineState }) => {
    const st = getEngineState();
    const v = st.vfx.find((x) => !x.alive);
    if (!v) return;
    v.alive = true;
    v.age = 0;
    v.life = life;
    v.kind = 'ring';
    v.x = e.x;
    v.y = e.y + 8;
    v.vx = 0;
    v.vy = 0;
    v.color = palHex('H')!;
    v.size = size;
    v.angle = 0;
    v.rot = 0;
  });
}

export const BOSS_TYPES: EnemyType[] = [
  {
    id: 'facelocker',
    name: 'The Lockkeeper',
    spriteId: 'warden_lockkeeper',
    color: palHex('G')!,
    family: 'vault',
    role: 'Warden of sealed pips',
    lore: 'The first warden nails bad outcomes to your die and waits for panic.',
    tell: 'Its central keyhole flashes before a face is chained.',
    threat: 'Removes one face from your table during the most crowded windows.',
    weakness: 'Fast burst damage shortens each lock cycle.',
    spawnLine: 'The Lockkeeper chooses a face to nail shut.',
    deathLine: 'The locked face comes loose with a scream of brass.',
    baseHp: 82,
    baseSpeed: 6,
    radius: 16,
    minWave: 5,
    weight: () => 0,
    touchDamage: 18,
    scoreValue: 300,
    isBoss: true,
    mechanicDesc: 'Locks a die face. Burn through phases before your table shrinks.',
    bossDossier: {
      title: 'Warden of the First Seal',
      rule: 'One die face is removed from the roll pool on a timer.',
      weakness: 'High tempo builds spend less time under lock.',
      lore: 'The House never opens with a fair hand.',
      phaseLines: ['One key turns.', 'The chain tightens.', 'Every lock wants a second lock.'],
      rewardLine: 'A broken lock leaves the forge hungry.',
    },
    behavior: (e, dt) => {
      const maxY = WALL_Y - 60;
      approachTargetY(e, dt, maxY, 0.5);
      oscillate(e, dt, 18);
    },
    bossMechanic: (e, dt) => {
      e.data['lockT'] = ((e.data['lockT'] as number | undefined) ?? 0) + dt;
      const phase = bossPhase(e);
      if ((e.data['lockT'] as number) > (phase >= 3 ? 4.2 : phase >= 2 ? 5.5 : 7.5)) {
        e.data['lockT'] = 0;
        import('../../engine/engine').then(({ getEngineState }) => {
          const st = getEngineState();
          if (!st.run) return;
          st.run.lockedFaceValue = 1 + Math.floor(Math.random() * 6);
          st.run.lockedFaceTimer = phase >= 3 ? 5.2 : phase >= 2 ? 4.2 : 5.5;
        });
      }
    },
  },
  {
    id: 'splitterqueen',
    name: 'Broodmother Ante',
    spriteId: 'warden_broodmother',
    color: palHex('p')!,
    family: 'brood',
    role: 'Warden of loaded eggs',
    lore: 'She lays bad luck in rows and calls it interest.',
    tell: 'Her abdomen pulses before each brood window.',
    threat: 'Floods lanes with pip-rats while her body soaks attention.',
    weakness: 'Area denial and quick egg cleanup keep the board readable.',
    spawnLine: 'The Broodmother antes a nest of loaded dice.',
    deathLine: 'The brood scatters from an empty throne.',
    baseHp: 72,
    baseSpeed: 8,
    radius: 16,
    minWave: 10,
    weight: () => 0,
    touchDamage: 18,
    scoreValue: 350,
    isBoss: true,
    mechanicDesc: 'Spawns brood bursts. Clear the hatchlings before the lane floods.',
    bossDossier: {
      title: 'Matron of the Loaded Brood',
      rule: 'Repeated brood windows add fast pip-rats under her body.',
      weakness: 'Splash, novas, and lingering fields erase her children.',
      lore: 'Every egg is a die the House weighted against you.',
      phaseLines: ['The first shell cracks.', 'The nest wakes.', 'The brood stops counting losses.'],
      rewardLine: 'The forge hears a thousand shells break.',
    },
    behavior: (e, dt) => {
      approachTargetY(e, dt, HUD_H + 50);
      oscillate(e, dt, 18);
    },
    bossMechanic: (e, dt) => {
      e.data['spawnT'] = ((e.data['spawnT'] as number | undefined) ?? 0) + dt;
      const phase = bossPhase(e);
      if ((e.data['spawnT'] as number) > BROODMOTHER_SPAWN_INTERVAL[phase]) {
        e.data['spawnT'] = 0;
        import('../../engine/engine').then(({ getEngineState }) => {
          const st = getEngineState();
          if (!st.run) return;
          const activeBrood = st.enemies.filter((x) => x.alive && x.typeId === 'swarm' && x.data['brood']).length;
          const count = Math.min(BROODMOTHER_BURST_COUNT[phase], BROODMOTHER_ACTIVE_CAP[phase] - activeBrood);
          if (count <= 0) return;
          for (let i = 0; i < count; i++) {
            const c = st.enemies.find((x) => !x.alive);
            if (!c) return;
            const minionHp = 8 + Math.floor(BALANCE.enemy.scalingWave(st.run.wave) * 0.7);
            Object.assign(c, {
              alive: true,
              typeId: 'swarm',
              x: e.x + (i - (count - 1) / 2) * 12,
              y: e.y + 14,
              vx: 0,
              vy: e.speed + 30,
              maxHp: minionHp,
              hp: minionHp,
              radius: 5,
              speed: 40,
              age: 0,
              state: 'walk',
              flashT: 0,
              dieT: 0,
              data: { brood: true },
              element: 'none',
              hitFlash: 0,
              slow: 0,
              freeze: 0,
              poisonT: 0,
              poisonDps: 0,
              absorbed: 0,
            });
          }
        });
      }
    },
  },
  {
    id: 'mirrortwin',
    name: 'The Glass Twin',
    spriteId: 'warden_glass_twin',
    color: palHex('H')!,
    family: 'mirror',
    role: 'Warden of copied intent',
    lore: 'A perfect reflection that learned to hate the original.',
    tell: 'Its glass body shows your last face before it fires.',
    threat: 'Copies your attack faces into hostile mirrored volleys after a glass tell.',
    weakness: 'Defensive rolls during the tell deny the copy; attacks and pulses can shatter incoming glass.',
    spawnLine: 'The mirror blinks first.',
    deathLine: 'The reflection forgets your shape.',
    baseHp: 135,
    baseSpeed: 12,
    radius: 16,
    minWave: 15,
    weight: () => 0,
    touchDamage: 16,
    scoreValue: 400,
    isBoss: true,
    mechanicDesc: 'Telegraphs a copy window, then mirrors your current attack face into hostile glass.',
    bossDossier: {
      title: 'Warden of Reflected Intent',
      rule: 'After a tell, your current attack face returns as hostile glass.',
      weakness: 'Roll defense to deny the copy, or shoot and pulse the shards before they reach the wall.',
      lore: 'The House keeps a duplicate receipt for every heroic decision.',
      phaseLines: ['It learns the shape of one shot.', 'The copy sharpens.', 'The mirror starts firing first.'],
      rewardLine: 'Broken glass is still sharp enough for the forge.',
    },
    behavior: (e, dt) => {
      approachTargetY(e, dt, HUD_H + 60);
      e.data['t'] = ((e.data['t'] as number | undefined) ?? 0) + dt;
      const t = e.data['t'] as number;
      const target = ARENA_W / 2 + Math.sin(t * 0.9) * 48;
      const d = target - e.x;
      e.x += Math.sign(d) * Math.min(Math.abs(d), 40 * dt);
    },
    bossMechanic: (e, dt) => {
      const phase = bossPhase(e);
      if (e.data['copyArming']) {
        e.data['copyWindupT'] = ((e.data['copyWindupT'] as number | undefined) ?? 0) + dt;
        const tellBucket = Math.floor((e.data['copyWindupT'] as number) * 8);
        if (e.data['copyTellBucket'] !== tellBucket) {
          e.data['copyTellBucket'] = tellBucket;
          spawnMirrorTell(e, 0.22, 18 + tellBucket * 2);
        }
        if ((e.data['copyWindupT'] as number) < GLASS_TWIN_COPY_WINDUP) return;
        e.data['copyArming'] = false;
        e.data['copyWindupT'] = 0;
        e.data['copyT'] = 0;
        import('../../engine/engine').then(({ getEngineState }) => {
          const st = getEngineState();
          const run = st.run;
          if (!run) return;
          const face = st.lastRolled ?? null;
          const volley = mirrorVolleySpec(face, phase);
          if (!volley) return;
          for (let i = 0; i < volley.count; i++) {
            const spread = volley.count > 1 ? (i - (volley.count - 1) / 2) * volley.spreadStep : 0;
            const ang = Math.PI / 2 + spread;
            const np = st.projectiles.find((p) => !p.alive);
            if (!np) continue;
            readyHostileMirrorProjectile(np, e, ang, volley);
          }
          spawnMirrorTell(e, 0.35, 28);
        });
        return;
      }
      e.data['copyT'] = ((e.data['copyT'] as number | undefined) ?? 0) + dt;
      if ((e.data['copyT'] as number) > GLASS_TWIN_COPY_INTERVAL[phase]) {
        e.data['copyArming'] = true;
        e.data['copyWindupT'] = 0;
        e.data['copyTellBucket'] = -1;
        spawnMirrorTell(e, GLASS_TWIN_COPY_WINDUP, 24);
      }
    },
  },
  {
    id: 'nullzone',
    name: 'The Null Croupier',
    spriteId: 'warden_null_croupier',
    color: palHex('E')!,
    family: 'null',
    role: 'Warden of erased shots',
    lore: 'The dealer who sweeps winning projectiles off the felt.',
    tell: 'Its table-hand circles the lane before a void opens.',
    threat: 'Deletes shots inside null pockets near the wall.',
    weakness: 'Change firing angles and overload with beams, pulses, or spread.',
    spawnLine: 'The croupier clears space for losing bets.',
    deathLine: 'The last void closes unpaid.',
    baseHp: 160,
    baseSpeed: 8,
    radius: 16,
    minWave: 20,
    weight: () => 0,
    touchDamage: 16,
    scoreValue: 450,
    isBoss: true,
    mechanicDesc: 'Projects null zones that erase shots. Change angles to overload the table.',
    bossDossier: {
      title: 'Dealer of the Empty Felt',
      rule: 'Null pockets erase projectiles inside their radius.',
      weakness: 'Spread, beams, and pulse damage keep pressure off the pocket.',
      lore: 'The House has a table where every winning shot becomes nothing.',
      phaseLines: ['One hole opens.', 'The felt widens.', 'The table starts eating lanes.'],
      rewardLine: 'A dead void leaves room for a better relic.',
    },
    behavior: (e, dt) => {
      approachTargetY(e, dt, HUD_H + 50);
      oscillate(e, dt, 20);
    },
    bossMechanic: (e, dt) => {
      e.data['zoneT'] = ((e.data['zoneT'] as number | undefined) ?? 0) + dt;
      const phase = bossPhase(e);
      if ((e.data['zoneT'] as number) > (phase >= 2 ? 3.6 : 5)) {
        e.data['zoneT'] = 0;
        import('../../engine/engine').then(({ getEngineState }) => {
          const st = getEngineState();
          const zx = phase >= 2 ? e.x + (Math.random() - 0.5) * 80 : 20 + Math.random() * (ARENA_W - 40);
          const zy = WALL_Y - 80;
          const zoneRadius = phase >= 3 ? 28 : 20;
          for (const p of st.projectiles) {
            if (!p.alive) continue;
            const dx = p.x - zx;
            const dy = p.y - zy;
            if (dx * dx + dy * dy < zoneRadius * zoneRadius) p.alive = false;
          }
          const v = st.vfx.find((x) => !x.alive);
          if (v) {
            v.alive = true;
            v.age = 0;
            v.life = 4;
            v.kind = 'reaction';
            v.x = zx;
            v.y = zy;
            v.vx = 0;
            v.vy = 0;
            v.color = palHex('E')!;
            v.size = zoneRadius;
            v.angle = 0;
            v.rot = 0;
          }
        });
      }
    },
  },
  {
    id: 'invertking',
    name: 'Invert King',
    spriteId: 'warden_invert_king',
    color: palHex('O')!,
    family: 'court',
    role: 'Warden of reversed value',
    lore: 'A crowned fool who declares the lowest pip royal.',
    tell: 'Its crown rotates when the table is about to flip.',
    threat: 'Inverts die face values and scrambles learned habits.',
    weakness: 'Flexible builds and players who read the face bar quickly.',
    spawnLine: 'The King turns the floor upside down.',
    deathLine: 'The crown lands on the correct side.',
    baseHp: 170,
    baseSpeed: 8,
    radius: 16,
    minWave: 25,
    weight: () => 0,
    touchDamage: 20,
    scoreValue: 500,
    isBoss: true,
    mechanicDesc: 'Temporarily inverts die values. Use the flipped table before it snaps back.',
    bossDossier: {
      title: 'Crowned Heretic of Value',
      rule: 'All die face values invert during royal decrees.',
      weakness: 'Adapt fast; low faces become high-value windows.',
      lore: 'He conquered the House by proving every six contains a one.',
      phaseLines: ['The decree is brief.', 'The court laughs longer.', 'The table forgets which way is up.'],
      rewardLine: 'The forge can use a crown that never fit.',
    },
    behavior: (e, dt) => {
      approachTargetY(e, dt, HUD_H + 60);
      oscillate(e, dt, 28);
    },
    bossMechanic: (e, dt) => {
      e.data['invT'] = ((e.data['invT'] as number | undefined) ?? 0) + dt;
      const phase = bossPhase(e);
      if (e.data['inverted'] && (e.data['invT'] as number) > (phase >= 3 ? 4.1 : 3.2)) {
        e.data['invT'] = 0;
        e.data['inverted'] = false;
        invertAllDice();
        return;
      }
      if (!e.data['inverted'] && (e.data['invT'] as number) > (phase >= 2 ? 4.3 : 6)) {
        e.data['inverted'] = true;
        e.data['invT'] = 0;
        invertAllDice();
      }
    },
  },
  {
    id: 'reflectorboss',
    name: 'The Mirror Warden',
    spriteId: 'warden_mirror',
    color: palHex('C')!,
    family: 'mirror',
    role: 'Warden of returned force',
    lore: 'A judge in mirrorplate, sentencing every shot to return.',
    tell: 'A hard ring blooms around its armor before reflection.',
    threat: 'Raises a mirror shell that punishes projectile-heavy builds.',
    weakness: 'Pulses and beams crack the shell instead of feeding it.',
    spawnLine: 'The Mirror Warden raises the court shield.',
    deathLine: 'The court sees itself and breaks.',
    baseHp: 185,
    baseSpeed: 6,
    radius: 17,
    minWave: 30,
    weight: () => 0,
    touchDamage: 18,
    scoreValue: 550,
    isBoss: true,
    mechanicDesc: 'Raises a rotating mirror shell. Wait it out or punish it with pulses and beams.',
    bossDossier: {
      title: 'Judge of Returned Violence',
      rule: 'A timed mirror shell reflects projectiles unless cracked correctly.',
      weakness: 'Pulse and beam sources hit harder during shell windows.',
      lore: 'Every accusation reflects until somebody admits guilt.',
      phaseLines: ['The first shell turns.', 'The mirror learns your cadence.', 'The verdict arrives faster now.'],
      rewardLine: 'Mirror shards make excellent landmark glass.',
    },
    behavior: (e, dt) => {
      approachTargetY(e, dt, HUD_H + 56);
      oscillate(e, dt, 32);
    },
    bossMechanic: (e, dt) => {
      e.data['shieldT'] = ((e.data['shieldT'] as number | undefined) ?? 0) + dt;
      const phase = bossPhase(e);
      const cycle = phase >= 3 ? 3.5 : phase >= 2 ? 4.2 : 5.2;
      const shieldDur = phase >= 3 ? 1.95 : phase >= 2 ? 1.7 : 1.35;
      if ((e.data['shieldT'] as number) > cycle) e.data['shieldT'] = 0;
      const shielding = (e.data['shieldT'] as number) < shieldDur;
      e.data['mirrorShield'] = shielding;
      const ringBucket = Math.floor((e.data['shieldT'] as number) * 8);
      if (shielding && ringBucket % 3 === 0 && e.data['ringBucket'] !== ringBucket) {
        e.data['ringBucket'] = ringBucket;
        import('../../engine/engine').then(({ getEngineState }) => {
          const st = getEngineState();
          const v = st.vfx.find((x) => !x.alive);
          if (!v) return;
          v.alive = true;
          v.age = 0;
          v.life = 0.25;
          v.kind = 'ring';
          v.x = e.x;
          v.y = e.y;
          v.vx = 0;
          v.vy = 0;
          v.color = palHex('C')!;
          v.size = 30;
          v.angle = 0;
          v.rot = 0;
        });
      }
    },
  },
];

function bossPhase(e: Enemy): number {
  const hpFrac = e.maxHp > 0 ? e.hp / e.maxHp : 1;
  if (hpFrac <= 0.35) return 3;
  if (hpFrac <= 0.68) return 2;
  return 1;
}

function invertAllDice(): void {
  import('../../engine/engine').then(({ getEngineState }) => {
    const st = getEngineState();
    if (!st.run) return;
    for (const d of st.run.dice) {
      for (const f of d.faces) {
        f.value = 7 - f.value;
      }
    }
    for (const d of st.dice) {
      for (const f of d.config.faces) {
        f.value = 7 - f.value;
      }
    }
  });
}
