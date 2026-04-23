# ROLLguelike — technology breakdown

Deep dive for contributors and forkers. Player-facing pitch and screenshots live in [README.md](./README.md). Design intent lives in [rollguelike-prd.md](./rollguelike-prd.md).

## Stack

| Layer | Choice | Notes |
|--------|--------|--------|
| Runtime | Browser (ES modules) | Mobile-first, portrait-locked SPA |
| Bundler | Vite 7 | React plugin, fast HMR |
| UI framework | React 19 | Menus, HUD, overlays only — gameplay is canvas |
| Language | TypeScript 5.7 | Project references via `tsc -b` |
| State (menus / HUD) | Zustand 5 | Derived HUD snapshots pushed from the engine each tick |
| Game state (hot path) | Mutable `runStateRef` + engine-owned pools | Avoids React re-renders in the simulation loop |
| Deploy | Vercel static | `vercel.json`: Vite framework, SPA rewrite, long-cache `/assets/*` |

## Runtime architecture

### Dual render path

1. **Game canvas** — A single `<canvas>` at a **logical resolution of 180×360**, scaled with CSS (`image-rendering: pixelated`) for crisp integer scaling on phones and desktop.
2. **React shell** — `App.tsx` composes menu routes, `GameCanvas`, HUD, upgrade picker, pause/game-over modals. Components read Zustand; they do not read the engine’s ref directly except where a screen mounts the canvas.

### Simulation loop

- **Fixed timestep** for logic (~60 Hz): accumulator + `requestAnimationFrame` for draws.
- **Entity pools** for projectiles, enemies, VFX, floating combat text, souls — reduces allocation churn on low-end mobile GPUs/CPUs.
- **Input** is tap-to-roll (and hold-to-charge for Clockmaker); the engine dispatches rolls and resolves faces through `faceResolve`.

### State split (why two stores?)

- **`runStateRef`** — Authoritative run data mutated every tick (HP, wave, dice values, enemy positions). Stays on the main thread with minimal structure sharing with React.
- **Zustand** — Menu navigation, meta unlocks, audio toggles, and a **HUD snapshot** (wave label, score, HP bars) updated from the engine so React only re-renders when the snapshot changes meaningfully.

Persistence: `src/state/persistence.ts` — localStorage for meta progress (unlocks, stats).

## Directory map

```
src/
  main.tsx, App.tsx
  config/           # balance.ts (tunables), constants.ts
  state/            # zustand store + persistence
  engine/           # game loop, RNG, pools, shake, hooks dispatcher, input
  systems/          # faceResolve, elemental reactions
  sprites/          # palette, procedural dice/VFX, hand-authored character & enemy art
  content/
    characters/     # definitions + starting dice / faces
    enemies/        # types, behaviors, bosses
    upgrades/       # dice, projectile, passive, aoe, landmark, arsenal
    waves/          # data-driven wave generator
  audio/            # jsfxr-style SFX, procedural BGM layers, haptics
  ui/               # MainMenu, CharacterSelect, HUD, UpgradeSelect, DieAltar, etc.
```

## Content model

Everything under `src/content/` is **data + small hooks**, registered through module-level maps. Adding an enemy, upgrade, or character should not require editing the core loop if the hook surface already covers the behavior.

### Upgrade hooks (dispatcher)

Upgrades attach lifecycle hooks. Names used in content today include: `onApply`, `onRoll`, `onProjectileSpawn`, `onProjectileHit`, `onKill`, `onDamaged`, `onWaveStart`, `onWaveEnd`, `onTick`. Implementations live in `src/engine/hooks.ts`; argument shapes are in `src/types.ts`.

Categories in code: **dice**, **projectile**, **passive**, **aoe**, **landmark**, **arsenal** (element-themed alt shots).

### Combat resolution

- **Faces** resolve through `src/systems/faceResolve.ts` (`FaceKind` switch).
- **Elemental reactions** (Alchemist / elemental shots): `src/systems/elemental.ts` — pairs map to named reactions; pulse damage uses reaction effect → element mapping for correct VFX/damage tagging.

## Audio

- **SFX**: tiny synthesized one-shots (registry-driven).
- **BGM**: layered procedural chiptune-style loops.
- **Haptics**: `navigator.vibrate` where supported, gated by user preference.

## Build & quality

```bash
npm install
npm run dev          # Vite dev server (default http://127.0.0.1:5173)
npm run build        # tsc -b && vite build → dist/
npm run preview      # static preview of dist/
npm run typecheck    # tsc -b --noEmit
```

TypeScript: `tsconfig` app + references; `vite.config` uses React plugin.

## README screenshots (Playwright)

Marketing screenshots in `docs/screenshots/` are generated, not hand-cropped. With dev server on **`http://127.0.0.1:5173`**:

```bash
npx playwright install chromium   # first time only
npm run screenshot:readme
```

Override base URL: `README_SHOT_URL=http://127.0.0.1:5174 npm run screenshot:readme`

Script: `scripts/capture-readme-screens.mjs` — Chromium, mobile viewport, walks menu → character select → arena.

## Deploy (Vercel)

- `npm run build` emits `dist/`.
- `vercel.json` sets `framework: vite`, SPA fallback rewrite, immutable cache for hashed assets.

```bash
npx vercel            # preview
npx vercel --prod     # production
```

## How to add content

### Enemy

Edit `src/content/enemies/types.ts` (or `bosses.ts`) and add an `EnemyType`:

```ts
{
  id: 'my_enemy',
  name: 'My Enemy',
  spriteId: 'enemy_my',          // must match src/sprites/enemies.ts
  color: '#ff99aa',
  baseHp: 25,
  baseSpeed: 22,
  radius: 7,
  minWave: 4,
  weight: (w) => 1 + w * 0.1,
  touchDamage: 10,
  scoreValue: 15,
  behavior: rusherBehavior,
  onDeath: (e) => { /* optional */ },
}
```

Add art in `src/sprites/enemies.ts` using `src/sprites/palette.ts`, register with `defineEnemySprites()`.

### Upgrade

Add to a file in `src/content/upgrades/` and export from `index.ts` via `registerUpgrades`:

```ts
{
  id: 'my_upgrade',
  name: 'My Upgrade',
  desc: 'What it does.',
  rarity: 'rare',
  category: 'projectile',
  maxStack: 3,
  hooks: {
    onProjectileSpawn: ({ projectile }) => {
      projectile.damage *= 1.1;
    },
  },
}
```

### Character

Add to `src/content/characters/index.ts`:

```ts
{
  id: 'my_char',
  name: 'My Character',
  tagline: '…',
  description: '…',
  color: '#abcdef',
  spriteId: 'char_my',
  startingDice: [{ id: 'my_d6', rollDuration: 0.42, faces: [/* 6 faces */] }],
  exclusiveUpgrades: [],
  passive: { /* optional hooks */ },
}
```

Sprite: `src/sprites/characters.ts` → `defineCharacterSprites()`.

### Balance

Single source: `src/config/balance.ts` — player HP, spawn curves, damage tables, rarity weights, scoring.

### New face kind

1. Extend `FaceKind` in `src/types.ts`.
2. Add a `case` in `src/systems/faceResolve.ts`.
3. Use on any `DieConfig` face.

## License

MIT
