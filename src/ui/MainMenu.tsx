import { useEffect, useMemo, useRef, useState } from 'react';
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
import { getUpgrade } from '../content/upgrades/registry';
import { getFaceChainId, getFaceRank, listFaceUpgrades } from '../content/upgrades/faceRegistry';
import { getFaceIconCacheKey, getFaceIconRows } from '../content/upgrades/faceIcons';
import {
  buildFaceIconCanvas,
  DIE_THEME_LABELS,
  DIE_THEME_UNLOCKS,
  type DieThemeId,
} from '../sprites/dice';
import type { FaceUpgrade } from '../content/upgrades/types';

const FLAVOR_LINES = [
  'TAP THE DIE · BEND THE ODDS',
  'FATE IS A FACE YOU CHOOSE',
  'ROLL HARD · DIE HARDER',
  'EACH WAVE · A NEW GAMBLE',
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
  const faceUpgradeTotal = listFaceUpgrades().length;
  const faceUpgradeSeen = faceUpgradeTotal;
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
                {faceUpgradeSeen}<span className="stat-of">/{faceUpgradeTotal}</span>
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

function CodexIcon({ upgrade }: { upgrade: FaceUpgrade }) {
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

  return <canvas ref={ref} width={36} height={36} className="arsenal-icon" aria-hidden />;
}

interface CodexChain {
  chainId: string;
  entries: FaceUpgrade[];
}

function tierLabel(rank: number): string {
  return `T${Math.max(1, rank)}`;
}

function buildCodexChains(entries: FaceUpgrade[], kind: FaceUpgrade['kind']): CodexChain[] {
  const chains = new Map<string, FaceUpgrade[]>();
  for (const entry of entries) {
    if (entry.kind !== kind) continue;
    const chainId = getFaceChainId(entry);
    const chain = chains.get(chainId);
    if (chain) chain.push(entry);
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
      const order = { common: 0, rare: 1, epic: 2, legendary: 3 } as const;
      return order[aRoot.rarity] - order[bRoot.rarity] || aRoot.name.localeCompare(bRoot.name);
    });
}

function CodexPanel({ onClose }: { onClose: () => void }) {
  const entries = listFaceUpgrades();
  const sections = [
    {
      title: 'WEAPONS',
      note: 'Face replacers',
      chains: buildCodexChains(entries, 'replacer'),
    },
    {
      title: 'WEAPON SUPPLEMENTS',
      note: 'Slot modifiers',
      chains: buildCodexChains(entries, 'supplement'),
    },
  ];
  const chainCount = sections.reduce((total, section) => total + section.chains.length, 0);
  return (
    <div className="overlay arsenal-overlay" onClick={onClose}>
      <div className="arsenal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="arsenal-head pixel-text">
          <span>FACE CODEX</span>
          <span className="arsenal-count">{chainCount} CHAINS · {entries.length} TIERS</span>
          <button className="btn btn-ghost arsenal-close" onClick={() => { playSfx('ui_click'); onClose(); }}>
            ✕
          </button>
        </div>
        <div className="arsenal-list">
          {sections.map((section) => (
            <section key={section.title} className="arsenal-section">
              <div className="arsenal-section-head pixel-text">
                <span>{section.title}</span>
                <span className="arsenal-section-note">
                  {section.note} · {section.chains.length}
                </span>
              </div>
              {section.chains.map((chain) => {
                const root = chain.entries[0]!;
                return (
                  <div key={chain.chainId} className={`arsenal-chain rarity-${root.rarity} is-unlocked`}>
                    <div className="arsenal-chain-head">
                      <div className="arsenal-chain-title">
                        <span className="arsenal-name pixel-text">{root.name}</span>
                        <span className="arsenal-chain-count pixel-text">
                          {chain.entries.length} TIER{chain.entries.length === 1 ? '' : 'S'}
                        </span>
                      </div>
                      <span className={`arsenal-rarity pixel-text rarity-tag-${root.rarity}`}>
                        {root.rarity.toUpperCase()}
                      </span>
                    </div>
                    <div className="arsenal-desc arsenal-chain-desc">{root.description}</div>
                    <div className="arsenal-tier-list">
                      {chain.entries.map((u) => (
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
                  </div>
                );
              })}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
