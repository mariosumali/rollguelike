# ROLLguelike

A mobile-first browser roguelite. Tap a die fixed at the bottom of the screen; each face triggers a different attack that auto-fires at the nearest enemy descending toward you. Between waves, pick an upgrade. Die once — the run ends.

Built with Vite + React + TypeScript, HTML5 Canvas for the arena and React for menus/HUD. State via Zustand. Deploys to Vercel as a static SPA.

## Screenshots

Portrait layout, pixel UI, and the core loop: shrine → chalice (character) → arena.

| Main menu | Choose your chalice | Wave 1 — tap to roll |
|:---:|:---:|:---:|
| ![Title screen with die altar and enter button](docs/screenshots/menu.png) | ![Character grid and dossier for Soldier](docs/screenshots/character-select.png) | ![Combat arena with HUD, wall, and enemies](docs/screenshots/gameplay.png) |
| Enter the shrine, pick **New run**, and check your meta stats. | Six heroes (one unlockable); each chalice has its own die and playstyle. | Auto-attacks from rolled faces; protect the wall and your HP. |

To refresh these images after UI changes, run a dev server on **`http://127.0.0.1:5173`** (default Vite port), then:

```bash
npx playwright install chromium   # first time only
npm run screenshot:readme
```

Or set `README_SHOT_URL` if your dev server uses another origin (e.g. `README_SHOT_URL=http://127.0.0.1:5174 npm run screenshot:readme`).

## Run locally

```bash
npm install
npm run dev
```

Open the printed URL on desktop or a phone on the same network. The app is mobile-first and portrait-locked; on landscape phones it shows a rotate prompt.

## Build

```bash
npm run build   # typecheck + vite build -> dist/
npm run preview # serve dist/ locally
```

## Type check

```bash
npm run typecheck
```

## Deploy (Vercel)

The repo is preconfigured:

- `vercel.json` sets `framework: vite`, SPA rewrites, and immutable cache headers for `/assets/*`.
- `npm run build` outputs `dist/`.

Deploy with the Vercel CLI or by importing the repo in the dashboard.

```bash
npx vercel            # preview
npx vercel --prod     # production
```

## Controls

- **Tap the screen (anywhere inside the arena)** to roll all dice. Each face triggers a different attack.
- **Hold (Clockmaker only)** to charge a roll for a faster, harder hit.
- Boss waves every 5 waves; you get 2 upgrade picks after clearing them.

## Characters

| Id | Name | Unlock | Identity |
|---|---|---|---|
| `soldier` | Soldier | starter | Balanced d6 |
| `gambler` | Gambler | starter | Two blank faces, big-swing hits, shields on blanks |
| `alchemist` | Alchemist | starter | All faces have elements; mixing them triggers reactions |
| `necromancer` | Necromancer | starter | Kills drop souls; soul faces consume souls for big hits |
| `berserker` | Berserker | starter | Faster rolls, rage stacks on kill, scaling smash faces |
| `clockmaker` | Clockmaker | 3 runs completed | Hold-to-charge rolls; enemies slow near your wall |

## Architecture overview

```
src/
  main.tsx, App.tsx
  config/           # balance.ts (all tunables) + constants.ts
  state/            # zustand store + localStorage persistence
  engine/           # game loop, engine.ts, RNG, pools, shake, hooks dispatcher, input
  systems/          # faceResolve, elemental
  sprites/          # palette + sprite pipeline + hand-authored character/enemy/boss pixel art + procedural dice/effects/environment
  content/
    characters/     # character definitions
    enemies/        # enemy/boss definitions + behaviors
    upgrades/       # dice/projectile/passive/aoe/landmark upgrade catalogues
    waves/          # data-driven wave generator
  audio/            # jsfxr-style one-shot synth, SFX registry, procedural chiptune BGM
  ui/               # React screens: MainMenu, CharacterSelect, HUD, UpgradeSelect, PauseMenu, GameOver, GameCanvas, BossWarning
```

Two render layers:

- A `<canvas>` drawn at a logical 180×360 resolution and integer-scaled with `image-rendering: pixelated`.
- React UI overlays (HUD, menus, upgrade cards) driven by a Zustand store. The engine mutates a shared `runStateRef` for speed and pushes a derived HUD snapshot into Zustand every tick.

Fixed-timestep game loop (60 Hz logic, rAF render, accumulator). Entity pools for projectiles / enemies / vfx / popups / souls to keep GC quiet on mobile.

## How to add content

All content lives in `src/content/`. Each category is a registry — you add an entry, it shows up in game. No engine changes required.

### Add an enemy

Edit `src/content/enemies/types.ts` (or `bosses.ts`) and add an `EnemyType`:

```ts
{
  id: 'my_enemy',
  name: 'My Enemy',
  spriteId: 'enemy_my',          // must match a sprite registered in src/sprites/enemies.ts
  color: '#ff99aa',
  baseHp: 25,
  baseSpeed: 22,
  radius: 7,
  minWave: 4,
  weight: (w) => 1 + w * 0.1,
  touchDamage: 10,
  scoreValue: 15,
  behavior: rusherBehavior,
  onDeath: (e) => { /* optional death effect */ },
}
```

Then draw a sprite in `src/sprites/enemies.ts` using the palette in `src/sprites/palette.ts` and register it with `defineEnemySprites()`.

### Add an upgrade

Pick a category file in `src/content/upgrades/` (or create a new one and include it in `index.ts`). Add an `Upgrade` entry:

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

Hook names available: `onApply`, `onRoll`, `onProjectileSpawn`, `onProjectileHit`, `onKill`, `onDamaged`, `onWaveStart`, `onWaveEnd`, `onTick`. See `src/engine/hooks.ts` for the dispatcher and `src/types.ts` for signatures.

### Add a character

Add an entry in `src/content/characters/index.ts`:

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

Then add the character's pixel art in `src/sprites/characters.ts` and include it in `defineCharacterSprites()`.

### Tune balance

All numeric tunables live in `src/config/balance.ts`: player HP, enemy HP/speed/spawn curves, combat damage tables, rarity weights, scoring. No magic numbers elsewhere.

### Add a face kind

1. Extend `FaceKind` in `src/types.ts`.
2. Add a `case` to the switch in `src/systems/faceResolve.ts`.
3. Use it on any `DieConfig`.

## License

MIT
