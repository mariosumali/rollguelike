# ROLLguelike — Product Requirements Document
**Version**: 0.4 | Pre-production

---

## 1. Concept

ROLLguelike is a mobile-first browser-based roguelite. The player rolls a die continuously while enemies descend from the top of the screen in staggered waves. Each die face triggers a different attack that auto-targets the nearest enemy. Between waves the player picks an upgrade. Waves are endless and scale in difficulty indefinitely.

---

## 2. Layout

- **HUD**: minimal strip at the top. Shows wave number, streak multiplier, score, and any other run-relevant info.
- **Arena**: the main play area below the HUD. Rectangular. Enemies descend here, projectiles travel here.
- **Divider**: a wall element at the bottom of the arena. Enemies crossing it deal damage to the player.
- **Player area**: below the divider. Contains the die, a character sprite, and an HP bar. May include additional UI elements as mechanics expand (soul count, rage meter, charge indicator, etc.).

The player is fixed at the horizontal center of the bottom edge of the arena and never moves.

---

## 3. Core Game Loop

1. A wave of enemies spawns at the top of the arena and descends in a staggered pattern.
2. The player taps the die to roll. The die animates and lands on a face. The attack for that face fires automatically.
3. The player keeps rolling until all enemies in the wave are cleared.
4. An upgrade selection screen appears. The player picks one upgrade. Rerolls are free and unlimited.
5. The next wave begins. Waves are endless — the run ends only when the player dies.
6. Every 5th wave is a boss wave. Defeating the boss grants two upgrade picks instead of one.

---

## Screen Layout

┌─────────────────────────────┐
│  [WAVE]  [STREAK]  [SCORE]  │  HUD strip
├─────────────────────────────┤
│                             │
│        ARENA (Canvas)       │  Rectangular. Enemies descend here.
│   ↓  ↓  ↓  ↓  ↓            │  Projectiles travel here.
│                             │
│         ↑ ↑ ↑ (shots)       │
│                             │
├──▓▓──▓▓──▓▓──▓▓──▓▓──▓▓──▓─┤  Castle wall divider
│        [ DIE ]              │  Player area
│      [ char icon ]          │
│      [===HP BAR===]         │
└─────────────────────────────┘

## 4. The Die

- Sits at the center of the player area.
- Displays the current face value.
- Tapping begins the roll animation. The attack resolves on landing.
- A roll cannot be interrupted once started.
- Roll speed is a stat that can be modified.
- Starts as a standard d6. The default face mapping is N = N projectiles fired. Upgrades change what faces do and how they behave.
- Additional dice can be unlocked. Multiple dice roll simultaneously and resolve in the same event.

### Face Types

The die system should support a growing set of face types. Initial types include:

- **SHOT**: fire N projectiles toward the nearest enemy
- **BURST**: fire a spread of projectiles toward the nearest cluster
- **PULSE**: instant area damage around the player
- **SHIELD**: block the next incoming hit
- **HEAL**: recover some HP
- **BLANK**: no effect
- **WILD**: repeat the previous face's result
- *...expandable. New face types can be added via upgrades or character-specific mechanics.*

### Targeting

All attacks auto-target. The player never aims manually.

- Directional attacks (SHOT, BURST, etc.) fire toward the nearest living enemy.
- Area attacks (PULSE, etc.) are centered on the player.
- WILD inherits the targeting of whatever it copies.

### Streak System

Rolling the same face value consecutively builds a streak and increases a damage multiplier. The streak resets on a different face. Streak behavior can be modified by upgrades.

---

## 5. Enemies

Enemies spawn at the top of the arena and move downward. When an enemy reaches the wall divider, the player takes damage and the enemy is removed.

### Wave Generation

- Enemies spawn in staggered groups within a wave, not all at once.
- Spawn x-positions are spread across the arena width.
- Difficulty scales with wave number: more enemies, faster spawns, harder types, more complex compositions.
- Each enemy type has a minimum wave before it can appear.
- Wave generation should be data-driven so new compositions and behaviors can be added easily.

### Enemy Types

The enemy roster should grow over time. Initial types, loosely grouped by difficulty:

**Early waves**: basic rushers, slow tanks, splitters that spawn smaller enemies on death, large swarms of weak units, enemies that drift side to side while descending, etc.

**Mid waves**: enemies that are only damageable under certain conditions (e.g. odd rolls only), enemies that copy the player's attacks, enemies that debuff roll speed while alive, enemies that absorb projectiles and gain HP, enemies that heal nearby allies, enemies that are invisible until close, etc.

**Late waves**: enemies that invert die values on hit, enemies that reflect projectiles, enemies that resurrect, enemies that are immune to certain damage types, etc.

**Bosses** (every 10th wave): each boss has a unique mechanic that interacts directly with the dice system — locking a face, splitting on death, mirroring the player's build, creating zones that destroy projectiles, etc. Boss mechanics should specifically target the core loop in interesting ways.

---

## 6. Upgrades

### Selection Flow

- After every wave the game pauses and shows 3 upgrade cards.
- The player picks one. It activates immediately and persists for the run.
- Rerolls are free and unlimited.
- Boss waves grant 2 picks.

### Rarity

Four tiers: Common, Rare, Epic, Legendary. Higher rarity becomes more likely as waves progress.

### Categories

Upgrades should span a wide range of effects. Core categories:

- **Dice**: modifies the die itself — face types, face modifiers, multi-dice, roll speed, loaded faces, etc.
- **Projectile**: modifies how projectiles behave — pierce, bounce, chain, split, homing, AoE on hit, etc.
- **Passive**: persistent stat effects — HP, damage multipliers, on-kill triggers, on-damage reactions, etc.
- **AoE**: area effects — orbiting zones, pulsing fields, on-kill explosions, environmental hazards, etc.
- **Landmark**: high-impact, often high-risk upgrades that fundamentally change the run — tradeoffs welcome.

The upgrade catalog should be large and kept growing. Depth and variety here is the primary driver of replayability.

### Upgrade System Design

Each upgrade is a self-contained data object with a set of lifecycle hooks it can implement:

- `onApply` — fires once when picked
- `onRoll` — fires on every die land
- `onProjectileHit` — fires when a projectile connects
- `onKill` — fires when an enemy dies
- `onDamaged` — fires when the player takes a hit
- `onWaveStart` / `onWaveEnd` — fires at wave boundaries
- *...hooks can be expanded as new mechanics require them*

Upgrades stack by default. Each upgrade specifies its own max stack count. Most are 1. Synergies between upgrades are a first-class design goal — upgrades should feel more powerful together than alone.

### Starting Catalog

A non-exhaustive starting set, meant to be expanded aggressively:

**Dice**: second die, third die, loaded die (one face appears more), face replacement, face modifiers (pierce/explode/etc on a specific face), cascade triggers, matching-dice bonuses, charged faces, face that costs HP for massive damage, blank face elimination, extra face slot, etc.

**Projectile**: piercing, bouncing, chaining, split on hit, homing, orbit ring, sniper (fewer / stronger), volley (more / weaker), poison, freeze, shrapnel on kill, AoE on hit, 360° ring trigger, lifesteal, etc.

**Passive**: max HP increase, HP regen, even/odd roll bonuses, post-damage power spike, per-kill damage stack, lucky roll chance, auto-shield timer, kill-speed bonus, wave-start invincibility window, score multiplier on kill, etc.

**AoE**: per-roll pulse, on-kill explosion, roll-triggered slow, timed fire zones, slow aura, repel on roll, etc.

**Landmark**: all-max-value die with 1 HP, blank-faces-deal-damage trade, drone spawner, global freeze on 6th roll, mirror shot, triple-cast slow roll, give-up-an-upgrade-to-get-three, etc.

---

## 7. Characters

Each character has a unique passive ability, a modified starting die configuration, and exclusive upgrades that only appear in their pool. Characters are a primary replayability driver alongside the upgrade catalog.

Starting roster (to be expanded):

### The Soldier *(unlocked by default)*
- **Passive**: rolling the max face always fires maximum projectiles regardless of modifiers
- **Starting die**: standard d6
- Straightforward character, good for learning the game

### The Gambler
- **Passive**: rolling extreme values (1 or 6) triggers a free bonus effect; middle values have no passive bonus
- **Starting die**: weighted toward extremes
- High-variance, high-reward playstyle

### The Alchemist
- **Passive**: die faces are elemental types; rolling two different elements in one turn triggers a reaction
- **Starting die**: one face per element
- Reactions produce AoE effects; combos between elements are a core mechanic
- *Elemental system and reactions should be designed as an extensible subsystem*

### The Necromancer
- **Passive**: enemies drop collectible soul tokens; one or more faces consume tokens for scaled effects
- **Starting die**: mostly standard with one soul-consuming face
- Soul economy adds a resource management layer on top of rolling

### The Berserker
- **Passive**: no cooldown between rolls; killing enemies builds rage stacks that amplify damage; rage decays when not rolling
- **Starting die**: faster roll time, lower face values
- Encourages aggressive rapid rolling

### The Clockmaker *(locked)*
- **Passive**: the die can be held to charge before release for scaled effects; enemies slow as they approach the wall
- **Starting die**: faces have tiered effects based on charge duration
- Introduces timing as a mechanic layer
- *Unlock condition: complete N runs*

*Additional characters should be designed and added over time. Each new character should introduce a meaningfully different relationship with the dice system.*

---

## 8. Wave Structure

Endless. No win condition — the run ends only when the player dies. Waves scale in difficulty indefinitely.

```
Wave 1 → Wave 2 → Wave 3 → [UPGRADE]
Wave 4 → Wave 5 (BOSS)   → [UPGRADE × 2]
Wave 6 → Wave 7 → Wave 8 → [UPGRADE]
...
```

- Upgrade selection after every 3rd wave (or similar interval — tunable)
- Boss every 5th wave
- Enemy count, spawn rate, enemy type variety, and enemy HP all scale with wave number
- Enemy type pools expand at defined wave thresholds
- Upgrade pool shifts toward higher rarity over time

---

## 9. Screens

| Screen | Description |
|---|---|
| Main Menu | New Run, Continue (if in-progress run exists), high score |
| Character Select | Full roster, passive description, lock/unlock states |
| Game Screen | Arena + HUD + player area |
| Upgrade Select | 3 cards, free unlimited rerolls, current upgrades viewable |
| Boss Warning | Brief interstitial before a boss wave |
| Pause | Upgrade list, exit option |
| Game Over | Score, wave reached, upgrades collected, New Run |

---

## 10. Stats

- **Starting HP**: 100
- **Arena shape**: rectangular
- All other tunable values (damage, enemy HP, spawn rate, scale curve, etc.) should be defined in a central config file so they can be adjusted without touching game logic

---

## 11. Persistence

Stored in `localStorage`:

- In-progress run state (continue after closing)
- High score per character
- Unlocked characters
- Total runs completed

---

## 12. Modularity

The content layer should be entirely separate from the game engine. Adding a new upgrade, enemy, or character should only require adding a new entry to a registry file — no changes to game logic.

- **Upgrade**: one object with hooks in `upgrades.registry`
- **Enemy**: one object with behavior and stats in `enemies.registry`
- **Character**: one object with passive, starting die, and exclusive upgrades in `characters.registry`

The hook system, enemy behavior system, and die face type system should all be designed for extension without modification.