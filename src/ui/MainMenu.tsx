import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useStore } from '../state/store';
import { continueRun } from '../engine/engine';
import { getRunState } from '../state/store';
import { playSfx } from '../audio/sfx';
import { MenuScene } from './MenuScene';
import { DieAltar } from './DieAltar';
import { SettingsPanel } from './SettingsPanel';
import { HowToPlay } from './HowToPlay';
import { DicePicker } from './DicePicker';
import {
  consumePendingArsenalUnlocks,
  consumePendingDiceThemeUnlocks,
} from '../state/persistence';
import { getUpgrade, listUpgrades } from '../content/upgrades/registry';
import { getFaceChainId, getFaceRank, listFaceUpgrades } from '../content/upgrades/faceRegistry';
import { getFaceIconCacheKey, getFaceIconRows } from '../content/upgrades/faceIcons';
import { listBosses, listNonBosses } from '../content/enemies/registry';
import {
  BAUBLE_LORE_GROUPS,
  FACE_CHAIN_LORE,
  RELIC_LORE,
  WARDEN_LORE,
  type BaubleLoreGroup,
  type CodexLore,
} from '../content/codex/lore';
import {
  buildFaceIconCanvas,
  DIE_THEME_LABELS,
  DIE_THEME_UNLOCKS,
  type DieThemeId,
} from '../sprites/dice';
import { initSprites } from '../sprites';
import { getSprite } from '../sprites/sprite';
import type { FaceUpgrade } from '../content/upgrades/types';
import type { EnemyType, Upgrade } from '../types';
import { BaubleIcon, RelicIcon } from './RelicIcon';

const FLAVOR_LINES = [
  'TAP THE DIE · BEND THE ODDS',
  'FATE IS A FACE YOU CHOOSE',
  'THE HOUSE COLLECTS · YOU COLLECT BACK',
  'EACH ROOM · A NEW DEBT',
  'THE HOUSE ALWAYS LOSES',
];

export function MainMenu() {
  const setScreen = useStore((s) => s.setScreen);
  const meta = useStore((s) => s.meta);
  const hasRun = useStore((s) => s.hasRun);
  const [flavorIdx, setFlavorIdx] = useState(0);
  const [tick, setTick] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showHow, setShowHow] = useState(false);
  const [showDicePicker, setShowDicePicker] = useState(false);
  const [unlockToasts, setUnlockToasts] = useState<string[]>([]);
  const [diceToasts, setDiceToasts] = useState<DieThemeId[]>([]);
  const [showArsenalPanel, setShowArsenalPanel] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => {
      setFlavorIdx((i) => (i + 1) % FLAVOR_LINES.length);
    }, 4200);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 120);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const pending = consumePendingArsenalUnlocks();
    if (pending.length > 0) setUnlockToasts(pending);
    const dicePending = consumePendingDiceThemeUnlocks();
    if (dicePending.length > 0) setDiceToasts(dicePending as DieThemeId[]);
  }, []);

  const dismissToast = () => {
    setUnlockToasts((arr) => arr.slice(1));
  };

  const dismissDiceToast = () => {
    setDiceToasts((arr) => arr.slice(1));
  };

  const onStart = () => {
    playSfx('ui_click');
    setScreen('select');
  };

  const onContinue = () => {
    const run = getRunState();
    if (!run) return;
    playSfx('ui_click');
    continueRun(run);
  };

  const onEnterDen = () => {
    playSfx('ui_click');
    setScreen('den');
  };

  const topScore = Math.max(0, ...Object.values(meta.highScores));
  const unlocks = meta.unlockedCharacters.length;
  const codexFaceTotal = new Set(
    listFaceUpgrades()
      .filter((u) => u.kind === 'replacer')
      .map((u) => getFaceChainId(u)),
  ).size;
  const relicTotal = listUpgrades().filter((u) => u.category === 'relic').length;
  const baubleTotal = BAUBLE_LORE_GROUPS.length;
  const codexEnemies = [...listNonBosses(), ...listBosses()];
  const encounteredEnemySet = new Set(meta.encounteredEnemyIds ?? []);
  const enemyTotal = codexEnemies.length;
  const enemySeen = codexEnemies.filter((enemy) => encounteredEnemySet.has(enemy.id)).length;
  const codexTotal = codexFaceTotal + relicTotal + baubleTotal + enemyTotal;
  const codexSeen = codexFaceTotal + relicTotal + baubleTotal + enemySeen;
  const currentToast = unlockToasts[0];
  const toastUpgrade = currentToast ? getUpgrade(currentToast) : null;
  const currentDiceToast = !toastUpgrade ? diceToasts[0] : undefined;
  const diceToastRule = currentDiceToast ? DIE_THEME_UNLOCKS[currentDiceToast] : null;

  const runSnapshot = useMemo(() => {
    const run = getRunState();
    if (!run) return null;
    return { wave: run.wave, score: run.score, character: run.characterId };
  }, [hasRun]);

  const pip = (tick & 1) === 0 ? '•' : '·';

  return (
    <div className="screen menu menu-v2">
      <MenuScene />
      <div className="menu-vignette" aria-hidden />
      <div className="menu-scanlines" aria-hidden />

      <div className="menu-toolbar" aria-hidden={showSettings || showHow || showDicePicker}>
        <button
          className="toolbar-btn"
          aria-label="how to play"
          onClick={() => { playSfx('ui_click'); setShowHow(true); }}
        >
          ?
        </button>
        <button
          className="toolbar-btn toolbar-btn-dice"
          aria-label="change dice look"
          onClick={() => { playSfx('ui_click'); setShowDicePicker(true); }}
        >
          <span aria-hidden>⚀</span>
        </button>
        <button
          className="toolbar-btn"
          aria-label="settings"
          onClick={() => { playSfx('ui_click'); setShowSettings(true); }}
        >
          ⚙
        </button>
      </div>

      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
      {showHow && <HowToPlay onClose={() => setShowHow(false)} />}
      {showDicePicker && <DicePicker onClose={() => setShowDicePicker(false)} />}
      {showArsenalPanel && (
        <CodexPanel onClose={() => setShowArsenalPanel(false)} />
      )}

      {toastUpgrade && (
        <div className="unlock-toast pixel-text" role="status">
          <div className="unlock-toast-head">
            <span className="unlock-badge">NEW</span>
            <span className="unlock-title">ARSENAL UNLOCKED</span>
          </div>
          <div className="unlock-name">{toastUpgrade.name}</div>
          <div className="unlock-desc">{toastUpgrade.desc}</div>
          <button className="btn btn-ghost unlock-dismiss" onClick={() => { playSfx('ui_click'); dismissToast(); }}>
            {unlockToasts.length > 1 ? `NEXT (${unlockToasts.length - 1})` : 'DISMISS'}
          </button>
        </div>
      )}

      {!toastUpgrade && currentDiceToast && (
        <div className="unlock-toast unlock-toast-dice pixel-text" role="status">
          <div className="unlock-toast-head">
            <span className="unlock-badge">NEW</span>
            <span className="unlock-title">DIE UNLOCKED</span>
          </div>
          <div className="unlock-name">{DIE_THEME_LABELS[currentDiceToast]} Dice</div>
          <div className="unlock-desc">
            {diceToastRule?.description ?? 'A new die is now available.'}
          </div>
          <button
            className="btn btn-ghost unlock-dismiss"
            onClick={() => {
              playSfx('ui_click');
              dismissDiceToast();
              setShowDicePicker(true);
            }}
          >
            EQUIP
          </button>
          <button
            className="btn btn-ghost unlock-dismiss unlock-dismiss-alt"
            onClick={() => { playSfx('ui_click'); dismissDiceToast(); }}
          >
            {diceToasts.length > 1 ? `NEXT (${diceToasts.length - 1})` : 'LATER'}
          </button>
        </div>
      )}

      <div className="menu-inner-v2 pixel-text">
        <div className="title-wrap">
          <h1 className="title-v2" aria-label="Rollguelike">
            <span className="title-shadow" aria-hidden>
              <span className="ts-roll">ROLL</span>
              <span className="ts-gue">GUELIKE</span>
            </span>
            <span className="title-main">
              <span className="tm-roll">ROLL</span>
              <span className="tm-gue">GUELIKE</span>
            </span>
            <span className="title-glint" aria-hidden />
          </h1>
          <div className="tagline-ribbon">
            <span className="tr-bracket">[</span>
            <span className="tr-track" key={flavorIdx}>
              {FLAVOR_LINES[flavorIdx]}
            </span>
            <span className="tr-bracket">]</span>
          </div>
        </div>

        <div className="btn-stack-v2">
          {hasRun && (
            <button className="btn-pixel btn-continue" onClick={onContinue}>
              <span className="btn-chev">▸</span>
              <span className="btn-body">
                <span className="btn-label">CONTINUE RUN</span>
                {runSnapshot && (
                  <span className="btn-sub">
                    WAVE {runSnapshot.wave.toString().padStart(2, '0')} · {runSnapshot.score} PTS
                  </span>
                )}
              </span>
              <span className="btn-dot">{pip}</span>
            </button>
          )}
          <button className="btn-pixel btn-primary-v2" onClick={onStart}>
            <span className="btn-chev">▸</span>
            <span className="btn-body">
              <span className="btn-label">{hasRun ? 'NEW RUN' : 'ENTER THE SHRINE'}</span>
              <span className="btn-sub">CHOOSE YOUR ROLLER</span>
            </span>
            <span className="btn-dot">{pip}</span>
          </button>
          <button className="btn-pixel btn-den" onClick={onEnterDen}>
            <span className="btn-chev">▸</span>
            <span className="btn-body">
              <span className="btn-label">ENTER THE DEN</span>
              <span className="btn-sub">TEST NEW GAMBLES</span>
            </span>
            <span className="btn-dot">{pip}</span>
          </button>
        </div>

        <DieAltar />

        <button
          type="button"
          className="dice-look-btn pixel-text"
          onClick={() => { playSfx('ui_click'); setShowDicePicker(true); }}
          aria-label="change dice look"
        >
          <span className="dice-look-ico" aria-hidden>⚀</span>
          <span className="dice-look-label">CHANGE DICE LOOK</span>
          <span className="dice-look-chev" aria-hidden>▸</span>
        </button>

        <div className="stats-card">
          <div className="stats-head">
            <span className="sh-line" />
            <span className="sh-label">LOG OF THE FALLEN</span>
            <span className="sh-line" />
          </div>
          <div className="stats-grid">
            <div className="stat-tile">
              <span className="stat-val">{meta.totalRunsCompleted}</span>
              <span className="stat-key">RUNS</span>
            </div>
            <div className="stat-tile">
              <span className="stat-val">{meta.totalWavesCleared}</span>
              <span className="stat-key">WAVES</span>
            </div>
            <div className="stat-tile">
              <span className="stat-val">{topScore}</span>
              <span className="stat-key">HIGH</span>
            </div>
            <div className="stat-tile">
              <span className="stat-val">
                {unlocks}<span className="stat-of">/6</span>
              </span>
              <span className="stat-key">HEROES</span>
            </div>
            <button
              type="button"
              className="stat-tile stat-tile-btn"
              onClick={() => { playSfx('ui_click'); setShowArsenalPanel(true); }}
              aria-label="view face upgrade codex"
            >
              <span className="stat-val">
                {codexSeen}<span className="stat-of">/{codexTotal}</span>
              </span>
              <span className="stat-key">CODEX</span>
            </button>
          </div>
        </div>

        <div className="foot-row">
          <span className="foot-seg">V0.2</span>
          <span className="foot-dot">◆</span>
          <span className="foot-seg">MOBILE</span>
        </div>
      </div>
    </div>
  );
}

function CodexIcon({ upgrade, size = 36 }: { upgrade: FaceUpgrade; size?: number }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, c.width, c.height);

    const rows = getFaceIconRows(upgrade.id, upgrade.icon, null);
    if (!rows) return;
    const src = buildFaceIconCanvas(rows, getFaceIconCacheKey(upgrade.id, null));
    if (!src) return;

    const scale = Math.max(1, Math.floor(Math.min(c.width / src.width, c.height / src.height)));
    const drawW = src.width * scale;
    const drawH = src.height * scale;
    const dx = Math.round((c.width - drawW) / 2);
    const dy = Math.round((c.height - drawH) / 2);
    ctx.drawImage(src, 0, 0, src.width, src.height, dx, dy, drawW, drawH);
  }, [upgrade]);

  return <canvas ref={ref} width={size} height={size} className="arsenal-icon" aria-hidden />;
}

function CodexEnemySprite({ enemy, seen, boss = false }: { enemy: Pick<EnemyType, 'name' | 'spriteId'>; seen: boolean; boss?: boolean }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, c.width, c.height);

    if (!seen) return;

    initSprites();
    const sprite = getSprite(enemy.spriteId);
    const frame = sprite?.frames[0];
    if (!frame) return;

    const pad = boss ? 6 : 8;
    const scale = Math.max(1, Math.floor(Math.min((c.width - pad * 2) / frame.w, (c.height - pad * 2) / frame.h)));
    const drawW = frame.w * scale;
    const drawH = frame.h * scale;
    const dx = Math.round((c.width - drawW) / 2);
    const dy = Math.round((c.height - drawH) / 2);
    ctx.drawImage(frame.canvas, 0, 0, frame.w, frame.h, dx, dy, drawW, drawH);
  }, [boss, enemy.spriteId, seen]);

  return (
    <div className={`enemy-codex-portrait ${boss ? 'is-boss' : ''} ${seen ? 'is-revealed' : 'is-unknown'}`}>
      <canvas
        ref={ref}
        width={64}
        height={64}
        className="enemy-codex-sprite"
        aria-label={seen ? `${enemy.name} dossier image` : 'Unknown dossier image'}
      />
      {!seen && <span className="pixel-text" aria-hidden>?</span>}
    </div>
  );
}

interface CodexChain {
  chainId: string;
  entries: FaceUpgrade[];
}

interface CodexEntryLink {
  id: string;
  title: string;
  note: string;
  progress: string;
  pageId: string;
}

interface CodexPage {
  id: string;
  title: string;
  note: string;
  flavor: string;
  progress: string;
  kind: 'cover' | 'section' | 'entry';
  sectionPageId?: string;
  content: ReactNode;
}

type CodexTurnDirection = 'next' | 'prev';

function tierLabel(rank: number): string {
  return `T${Math.max(1, rank)}`;
}

function buildCodexChains(entries: FaceUpgrade[], kind: FaceUpgrade['kind']): CodexChain[] {
  const chains = new Map<string, FaceUpgrade[]>();
  for (const entry of entries) {
    if (entry.kind !== kind) continue;
    const chainId = getFaceChainId(entry);
    const chainEntry = chains.get(chainId);
    if (chainEntry) chainEntry.push(entry);
    else chains.set(chainId, [entry]);
  }

  return Array.from(chains.entries())
    .map(([chainId, chainEntries]) => ({
      chainId,
      entries: chainEntries.sort((a, b) => getFaceRank(a) - getFaceRank(b) || a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => {
      const aRoot = a.entries[0]!;
      const bRoot = b.entries[0]!;
      return rarityOrder(aRoot.rarity) - rarityOrder(bRoot.rarity) || aRoot.name.localeCompare(bRoot.name);
    });
}

function enemyFamilyLabel(family: string | undefined): string {
  switch (family) {
    case 'debt':
      return 'DEBT';
    case 'vault':
      return 'VAULT';
    case 'brood':
      return 'BROOD';
    case 'mirror':
      return 'MIRROR';
    case 'null':
      return 'NULL';
    case 'grave':
      return 'GRAVE';
    case 'court':
      return 'COURT';
    case 'suture':
      return 'SUTURE';
    case 'furnace':
      return 'FURNACE';
    default:
      return 'HOUSE';
  }
}

function rarityOrder(rarity: string): number {
  const order = { common: 0, rare: 1, epic: 2, legendary: 3 } as const;
  return order[rarity as keyof typeof order] ?? 0;
}

function CodexPanel({ onClose }: { onClose: () => void }) {
  const encounteredEnemyIds = useStore((s) => s.meta.encounteredEnemyIds ?? []);
  const encounteredSet = useMemo(() => new Set(encounteredEnemyIds), [encounteredEnemyIds]);
  const [pageIndex, setPageIndex] = useState(0);
  const [turnDirection, setTurnDirection] = useState<CodexTurnDirection | null>(null);
  const [isTurning, setIsTurning] = useState(false);
  const turnMidpointRef = useRef<number | null>(null);
  const turnDoneRef = useRef<number | null>(null);
  const entries = listFaceUpgrades().filter((u) => u.kind === 'replacer');
  const weaponChains = buildCodexChains(entries, 'replacer');
  const relics = listUpgrades()
    .filter((u) => u.category === 'relic')
    .sort((a, b) => rarityOrder(a.rarity) - rarityOrder(b.rarity) || a.name.localeCompare(b.name));
  const baubles = listUpgrades()
    .filter((u) => u.category === 'bauble')
    .sort((a, b) => rarityOrder(a.rarity) - rarityOrder(b.rarity) || a.name.localeCompare(b.name));
  const baubleById = new Map(baubles.map((bauble) => [bauble.id, bauble]));
  const enemies = listNonBosses().sort((a, b) => (a.minWave - b.minWave) || a.name.localeCompare(b.name));
  const bosses = listBosses().sort((a, b) => (a.minWave - b.minWave) || a.name.localeCompare(b.name));
  const enemySeenCount = enemies.filter((enemy) => encounteredSet.has(enemy.id)).length;
  const bossSeenCount = bosses.filter((boss) => encounteredSet.has(boss.id)).length;
  const totalCount = weaponChains.length + relics.length + BAUBLE_LORE_GROUPS.length + enemies.length + bosses.length;
  const seenCount = weaponChains.length + relics.length + BAUBLE_LORE_GROUPS.length + enemySeenCount + bossSeenCount;

  function goToPage(nextIndex: number) {
    const boundedIndex = Math.max(0, Math.min(pages.length - 1, nextIndex));
    if (boundedIndex === pageIndex || isTurning) return;
    const direction: CodexTurnDirection = boundedIndex > pageIndex ? 'next' : 'prev';
    playSfx('ui_click');
    setTurnDirection(direction);
    setIsTurning(true);
    if (turnMidpointRef.current !== null) window.clearTimeout(turnMidpointRef.current);
    if (turnDoneRef.current !== null) window.clearTimeout(turnDoneRef.current);
    turnMidpointRef.current = window.setTimeout(() => {
      setPageIndex(boundedIndex);
    }, 260);
    turnDoneRef.current = window.setTimeout(() => {
      setIsTurning(false);
      setTurnDirection(null);
    }, 540);
  }

  const goToPageId = (pageId: string) => {
    const nextIndex = pageIndexById.get(pageId);
    if (nextIndex == null) return;
    goToPage(nextIndex);
  };

  const renderLore = (lore: CodexLore | undefined, fallback: string) => {
    const paragraphs = lore?.paragraphs.length ? lore.paragraphs : [fallback];
    return (
      <div className="codex-entry-lore">
        {lore?.epigraph && <p className="codex-entry-epigraph">{lore.epigraph}</p>}
        {paragraphs.map((paragraph, index) => (
          <p key={`${paragraph.slice(0, 18)}-${index}`}>{paragraph}</p>
        ))}
      </div>
    );
  };

  const renderSectionIndex = (
    title: string,
    note: string,
    entriesForSection: CodexEntryLink[],
  ) => (
    <section className="arsenal-section">
      <div className="arsenal-section-head pixel-text">
        <span>{title}</span>
        <span className="arsenal-section-note">
          {note} · {entriesForSection.length}
        </span>
      </div>
      <div className="codex-entry-index">
        {entriesForSection.map((entry) => (
          <button
            key={entry.id}
            type="button"
            className="codex-index-row codex-entry-index-row pixel-text"
            onClick={() => goToPageId(entry.pageId)}
            disabled={isTurning}
          >
            <span>{entry.note}</span>
            <strong>{entry.title}</strong>
            <em>{entry.progress}</em>
          </button>
        ))}
      </div>
    </section>
  );

  const renderWeaponDetail = (chainEntry: CodexChain) => {
    const root = chainEntry.entries[0]!;
    const lore = FACE_CHAIN_LORE[chainEntry.chainId];
    return (
      <article className="codex-entry codex-weapon-entry">
        <div className="codex-entry-hero">
          <div className="arsenal-icon-shell codex-entry-icon">
            <CodexIcon upgrade={root} size={54} />
          </div>
          <div>
            <div className={`codex-entry-tag pixel-text rarity-tag-${root.rarity}`}>
              {root.rarity.toUpperCase()} · {chainEntry.entries.length} TIERS
            </div>
            <h3 className="codex-entry-title pixel-text">{root.name}</h3>
            <p className="codex-entry-summary">{root.description}</p>
          </div>
        </div>
        {renderLore(lore, 'The Forge keeps this face in a locked tray. Its older names are scratched beneath the brass, waiting for a hand bold enough to roll them.')}
        <div className="arsenal-tier-list codex-tier-list">
          {chainEntry.entries.map((u) => (
            <div key={u.id} className={`arsenal-tier rarity-${u.rarity}`}>
              <div className="arsenal-icon-shell arsenal-tier-icon">
                <CodexIcon upgrade={u} />
              </div>
              <div className="arsenal-copy">
                <div className="arsenal-row-head">
                  <span className="arsenal-tier-label pixel-text">{tierLabel(getFaceRank(u))}</span>
                  <span className="arsenal-tier-name pixel-text">{u.name}</span>
                </div>
                <div className="arsenal-desc">{u.description}</div>
              </div>
            </div>
          ))}
        </div>
      </article>
    );
  };

  const renderRelicDetail = (relic: Upgrade) => (
    <article className="codex-entry codex-relic-entry">
      <div className="codex-entry-hero">
        <div className="arsenal-icon-shell codex-entry-icon">
          <RelicIcon upgrade={relic} size={58} />
        </div>
        <div>
          <div className={`codex-entry-tag pixel-text rarity-tag-${relic.rarity}`}>
            {relic.rarity.toUpperCase()} · RELIC
          </div>
          <h3 className="codex-entry-title pixel-text">{relic.name}</h3>
          <p className="codex-entry-summary">{relic.desc}</p>
        </div>
      </div>
      {renderLore(RELIC_LORE[relic.id], relic.lore ?? relic.desc)}
    </article>
  );

  const renderBaubleDetail = (group: BaubleLoreGroup) => {
    const groupItems = group.itemIds
      .map((id) => baubleById.get(id))
      .filter((item): item is Upgrade => Boolean(item));
    return (
      <article className="codex-entry codex-bauble-entry">
        <div className="codex-entry-tag pixel-text">BAUBLE LOT · {group.note.toUpperCase()}</div>
        <h3 className="codex-entry-title pixel-text">{group.title}</h3>
        {renderLore(group, 'A small charm kept in the lint of old pockets, too poor for a reliquary and too useful to throw away.')}
        <div className="codex-bauble-grid">
          {groupItems.map((bauble) => (
            <div key={bauble.id} className={`arsenal-tier rarity-${bauble.rarity}`}>
              <div className="arsenal-icon-shell arsenal-tier-icon">
                <BaubleIcon upgrade={bauble} size={40} />
              </div>
              <div className="arsenal-copy">
                <div className="arsenal-row-head">
                  <span className={`arsenal-rarity pixel-text rarity-tag-${bauble.rarity}`}>
                    {bauble.rarity.toUpperCase()}
                  </span>
                  <span className="arsenal-tier-name pixel-text">{bauble.name}</span>
                </div>
                <div className="arsenal-desc">{bauble.desc}</div>
                <div className="arsenal-desc arsenal-chain-desc">Stacks up to x{bauble.maxStack}</div>
              </div>
            </div>
          ))}
        </div>
      </article>
    );
  };

  const renderEnemyPage = () => (
    <section className="arsenal-section">
      <div className="arsenal-section-head pixel-text">
        <span>HOUSE SERVANTS</span>
        <span className="arsenal-section-note">
          Enemy dossiers · {enemySeenCount}/{enemies.length}
        </span>
      </div>
      <div className="codex-entry-lore codex-servant-preface">
        <p>
          Lesser servants do not earn whole leaves in the House ledger. They are listed by tell,
          appetite, and the crack through which a careful wanderer may pass.
        </p>
      </div>
      {enemies.map((enemy) => {
        const seen = encounteredSet.has(enemy.id);
        return (
          <div key={enemy.id} className={`arsenal-chain enemy-codex-card ${seen ? 'is-unlocked' : 'is-locked'}`}>
            <div className="arsenal-chain-head">
              <div className="arsenal-chain-title">
                <span className="arsenal-name pixel-text">{seen ? enemy.name : '?'}</span>
                <span className="arsenal-chain-count pixel-text">{seen ? enemyFamilyLabel(enemy.family) : 'UNKNOWN'}</span>
              </div>
              <span className="arsenal-rarity pixel-text">{seen ? `W${enemy.minWave}+` : 'W?'}</span>
            </div>
            <div className="enemy-codex-body">
              <CodexEnemySprite enemy={enemy} seen={seen} />
              <div className="enemy-codex-copy">
                <div className="arsenal-desc arsenal-chain-desc">{seen ? enemy.lore ?? enemy.threat : '?'}</div>
                <div className="enemy-codex-grid">
                  <span>TELL</span>
                  <strong>{seen ? enemy.tell ?? 'Watch its movement.' : '?'}</strong>
                  <span>THREAT</span>
                  <strong>{seen ? enemy.threat ?? enemy.role ?? 'House servant.' : '?'}</strong>
                  <span>CRACK</span>
                  <strong>{seen ? enemy.weakness ?? 'Focus it before the wall.' : '?'}</strong>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );

  const renderBossDetail = (boss: EnemyType) => {
    const seen = encounteredSet.has(boss.id);
    const lore = seen ? WARDEN_LORE[boss.id] : undefined;
    return (
      <article className={`codex-entry codex-warden-entry ${seen ? 'is-unlocked' : 'is-locked'}`}>
        <div className="codex-entry-hero">
          <CodexEnemySprite enemy={boss} seen={seen} boss />
          <div>
            <div className="codex-entry-tag pixel-text">
              {seen ? `${enemyFamilyLabel(boss.family)} · WAVE ${boss.minWave}` : 'UNKNOWN WARDEN'}
            </div>
            <h3 className="codex-entry-title pixel-text">{seen ? boss.name : '?'}</h3>
            <p className="codex-entry-summary">{seen ? boss.mechanicDesc ?? boss.threat : 'The leaf is blacked out. Meet the warden to read the hand.'}</p>
          </div>
        </div>
        {seen ? renderLore(lore, boss.bossDossier?.lore ?? boss.lore ?? boss.threat ?? 'The House keeps this warden behind a sealed rule.') : (
          <div className="codex-entry-lore">
            <p>The ink refuses the page. Somewhere deeper in the House, a warden has not yet written your name.</p>
          </div>
        )}
        <div className="enemy-codex-grid codex-detail-grid">
          <span>RULE</span>
          <strong>{seen ? boss.bossDossier?.rule ?? boss.mechanicDesc : '?'}</strong>
          <span>CRACK</span>
          <strong>{seen ? boss.bossDossier?.weakness ?? boss.weakness : '?'}</strong>
          <span>PHASE</span>
          <strong>{seen ? boss.bossDossier?.phaseLines?.[2] ?? boss.threat : '?'}</strong>
        </div>
      </article>
    );
  };

  const weaponLinks: CodexEntryLink[] = weaponChains.map((chainEntry) => {
    const root = chainEntry.entries[0]!;
    return {
      id: chainEntry.chainId,
      title: root.name,
      note: `${chainEntry.entries.length} TIERS`,
      progress: root.rarity.toUpperCase(),
      pageId: `weapon:${chainEntry.chainId}`,
    };
  });
  const relicLinks: CodexEntryLink[] = relics.map((relic) => ({
    id: relic.id,
    title: relic.name,
    note: 'RELIC',
    progress: relic.rarity.toUpperCase(),
    pageId: `relic:${relic.id}`,
  }));
  const baubleLinks: CodexEntryLink[] = BAUBLE_LORE_GROUPS.map((group) => ({
    id: group.id,
    title: group.title,
    note: `${group.itemIds.length} CHARMS`,
    progress: group.note,
    pageId: `bauble:${group.id}`,
  }));
  const wardenLinks: CodexEntryLink[] = bosses.map((boss) => {
    const seen = encounteredSet.has(boss.id);
    return {
      id: boss.id,
      title: seen ? boss.name : '?',
      note: seen ? enemyFamilyLabel(boss.family) : 'UNKNOWN',
      progress: seen ? `W${boss.minWave}` : 'W?',
      pageId: `warden:${boss.id}`,
    };
  });

  const weaponPages: CodexPage[] = weaponChains.map((chainEntry) => {
    const root = chainEntry.entries[0]!;
    return {
      id: `weapon:${chainEntry.chainId}`,
      title: root.name.toUpperCase(),
      note: `${chainEntry.entries.length} tier face`,
      flavor: FACE_CHAIN_LORE[chainEntry.chainId]?.epigraph ?? 'A forged face from the House ledger.',
      progress: `${getFaceRank(root)}/${chainEntry.entries.length}`,
      kind: 'entry',
      sectionPageId: 'weapons',
      content: renderWeaponDetail(chainEntry),
    };
  });
  const relicPages: CodexPage[] = relics.map((relic) => ({
    id: `relic:${relic.id}`,
    title: relic.name.toUpperCase(),
    note: 'Relic',
    flavor: RELIC_LORE[relic.id]?.epigraph ?? relic.lore ?? 'A run-shaping artifact.',
    progress: relic.rarity.toUpperCase(),
    kind: 'entry',
    sectionPageId: 'relics',
    content: renderRelicDetail(relic),
  }));
  const baublePages: CodexPage[] = BAUBLE_LORE_GROUPS.map((group) => ({
    id: `bauble:${group.id}`,
    title: group.title.toUpperCase(),
    note: group.note,
    flavor: group.epigraph ?? 'Small charms with old stories.',
    progress: `${group.itemIds.length} charms`,
    kind: 'entry',
    sectionPageId: 'baubles',
    content: renderBaubleDetail(group),
  }));
  const wardenPages: CodexPage[] = bosses.map((boss) => {
    const seen = encounteredSet.has(boss.id);
    return {
      id: `warden:${boss.id}`,
      title: seen ? boss.name.toUpperCase() : 'UNKNOWN WARDEN',
      note: seen ? enemyFamilyLabel(boss.family) : 'Unknown',
      flavor: seen ? WARDEN_LORE[boss.id]?.epigraph ?? boss.bossDossier?.lore ?? boss.lore ?? 'A sealed rule of the House.' : 'The House keeps this leaf closed.',
      progress: seen ? `W${boss.minWave}` : 'W?',
      kind: 'entry' as const,
      sectionPageId: 'wardens',
      content: renderBossDetail(boss),
    };
  });

  const pagesWithoutCover: CodexPage[] = [
    {
      id: 'weapons',
      title: 'WEAPONS',
      note: 'Face lineages',
      flavor: 'Forged faces, each with three names and one old wound beneath the brass.',
      progress: `${weaponChains.length}/${weaponChains.length}`,
      kind: 'section',
      content: renderSectionIndex('WEAPONS', 'Face lineages', weaponLinks),
    },
    ...weaponPages,
    {
      id: 'relics',
      title: 'RELICS',
      note: 'Great artifacts',
      flavor: 'Run-shaping relics whose stories are older than the House admits.',
      progress: `${relics.length}/${relics.length}`,
      kind: 'section',
      content: renderSectionIndex('RELICS', 'Great artifacts', relicLinks),
    },
    ...relicPages,
    {
      id: 'baubles',
      title: 'BAUBLES',
      note: 'Charm lots',
      flavor: 'Poor charms, pocket junk, and little witnesses paired by old superstition.',
      progress: `${BAUBLE_LORE_GROUPS.length}/${BAUBLE_LORE_GROUPS.length}`,
      kind: 'section',
      content: renderSectionIndex('BAUBLES', 'Charm lots', baubleLinks),
    },
    ...baublePages,
    {
      id: 'servants',
      title: 'HOUSE SERVANTS',
      note: 'Enemy dossiers',
      flavor: 'Lesser things are catalogued by habit, hunger, and weakness.',
      progress: `${enemySeenCount}/${enemies.length}`,
      kind: 'section',
      content: renderEnemyPage(),
    },
    {
      id: 'wardens',
      title: 'WARDENS',
      note: 'Sealed rules',
      flavor: 'The House keeps its cruelest laws in bodies with names.',
      progress: `${bossSeenCount}/${bosses.length}`,
      kind: 'section',
      content: renderSectionIndex('WARDENS', 'Sealed rules', wardenLinks),
    },
    ...wardenPages,
  ];

  const sectionPages = pagesWithoutCover.filter((page) => page.kind === 'section');
  const renderCoverPage = (sectionEntries: CodexPage[]) => (
    <div className="codex-index">
      <div className="codex-cover-mark pixel-text">ROLLGUELIKE</div>
      <div className="codex-cover-title pixel-text">CODEX OF THE HOUSE</div>
      <div className="codex-cover-copy">
        A field book of loaded faces, poor charms, debt-born servants, and wardens whose names are best read by candle.
      </div>
      <div className="codex-index-list">
        {sectionEntries.map((page, index) => (
          <button
            key={page.id}
            type="button"
            className="codex-index-row pixel-text"
            onClick={() => goToPageId(page.id)}
            disabled={isTurning}
          >
            <span>{String(index + 1).padStart(2, '0')}</span>
            <strong>{page.title}</strong>
            <em>{page.progress}</em>
          </button>
        ))}
      </div>
    </div>
  );

  const pages: CodexPage[] = [
    {
      id: 'cover',
      title: 'CODEX',
      note: 'Index',
      flavor: 'Flip through the House ledger by oath, scrap, and warden seal.',
      progress: `${seenCount}/${totalCount}`,
      kind: 'cover',
      content: renderCoverPage(sectionPages),
    },
    ...pagesWithoutCover,
  ];
  const pageIndexById = new Map(pages.map((page, index) => [page.id, index]));
  const navPages = pages.filter((page) => page.kind !== 'entry');
  const currentPage = pages[Math.min(pageIndex, pages.length - 1)]!;
  const bookClassName = [
    'codex-book',
    isTurning && turnDirection ? `is-turning-${turnDirection}` : '',
  ].filter(Boolean).join(' ');

  useEffect(() => () => {
    if (turnMidpointRef.current !== null) window.clearTimeout(turnMidpointRef.current);
    if (turnDoneRef.current !== null) window.clearTimeout(turnDoneRef.current);
  }, []);

  return (
    <div className="overlay arsenal-overlay" onClick={onClose}>
      <div className="arsenal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="arsenal-head pixel-text">
          <span>CODEX</span>
          <span className="arsenal-count">
            {seenCount}/{totalCount} ENTRIES · {enemySeenCount}/{enemies.length} SERVANTS · {bossSeenCount}/{bosses.length} WARDENS
          </span>
          <button className="btn btn-ghost arsenal-close" onClick={() => { playSfx('ui_click'); onClose(); }}>
            ✕
          </button>
        </div>
        <div className={bookClassName}>
          <div className="codex-book-spine" aria-hidden />
          <div className="codex-page codex-page-left">
            <div className="codex-page-kicker pixel-text">PAGE {String(pageIndex + 1).padStart(2, '0')}</div>
            <h2 className="codex-page-title pixel-text">{currentPage.title}</h2>
            <div className="codex-page-note pixel-text">{currentPage.note}</div>
            <p className="codex-page-flavor">{currentPage.flavor}</p>
            <div className="codex-page-progress pixel-text">
              <span>PROGRESS</span>
              <strong>{currentPage.progress}</strong>
            </div>
            <div className="codex-tabs" aria-label="Codex sections">
              {navPages.map((page) => {
                const index = pageIndexById.get(page.id) ?? 0;
                const active = page.id === currentPage.id || page.id === currentPage.sectionPageId;
                return (
                  <button
                    key={page.id}
                    type="button"
                    className={`codex-tab pixel-text ${active ? 'is-active' : ''}`}
                    onClick={() => goToPage(index)}
                    disabled={isTurning}
                    aria-current={active ? 'page' : undefined}
                  >
                    {page.title}
                  </button>
                );
              })}
            </div>
            <div className="codex-page-number pixel-text">PAGE {pageIndex + 1}/{pages.length}</div>
          </div>
          <div className="codex-page codex-page-right">
            {currentPage.id !== 'cover' && (
              <div className="codex-mobile-head">
                <div className="codex-page-kicker pixel-text">PAGE {pageIndex + 1}/{pages.length}</div>
                <h2 className="codex-page-title pixel-text">{currentPage.title}</h2>
                <div className="codex-page-progress pixel-text">
                  <span>{currentPage.note}</span>
                  <strong>{currentPage.progress}</strong>
                </div>
              </div>
            )}
            <div className="codex-page-scroll" key={currentPage.id}>
              {currentPage.content}
            </div>
          </div>
          {isTurning && <div className="codex-turn-sheet" aria-hidden />}
          <button
            type="button"
            className="codex-page-btn codex-page-btn-prev pixel-text"
            onClick={() => goToPage(pageIndex - 1)}
            disabled={pageIndex === 0 || isTurning}
            aria-label="Previous codex page"
          >
            ◂
          </button>
          <button
            type="button"
            className="codex-page-btn codex-page-btn-next pixel-text"
            onClick={() => goToPage(pageIndex + 1)}
            disabled={pageIndex === pages.length - 1 || isTurning}
            aria-label="Next codex page"
          >
            ▸
          </button>
        </div>
      </div>
    </div>
  );
}
