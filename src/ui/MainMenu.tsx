import { useEffect, useMemo, useState } from 'react';
import { useStore } from '../state/store';
import { startRun } from '../engine/engine';
import { getRunState } from '../state/store';
import { playSfx } from '../audio/sfx';
import { MenuScene } from './MenuScene';
import { DieAltar } from './DieAltar';
import { SettingsPanel } from './SettingsPanel';
import { HowToPlay } from './HowToPlay';
import { consumePendingArsenalUnlocks } from '../state/persistence';
import { getUpgrade } from '../content/upgrades/registry';
import { ARSENAL_UPGRADES } from '../content/upgrades/arsenal';

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
  const [unlockToasts, setUnlockToasts] = useState<string[]>([]);
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
  }, []);

  const dismissToast = () => {
    setUnlockToasts((arr) => arr.slice(1));
  };

  const onStart = () => {
    playSfx('ui_click');
    setScreen('select');
  };

  const onContinue = () => {
    const run = getRunState();
    if (!run) return;
    playSfx('ui_click');
    startRun(run.characterId, run);
  };

  const topScore = Math.max(0, ...Object.values(meta.highScores));
  const unlocks = meta.unlockedCharacters.length;
  const arsenalTotal = ARSENAL_UPGRADES.length;
  const arsenalUnlocked = (meta.unlockedArsenal ?? []).length;
  const currentToast = unlockToasts[0];
  const toastUpgrade = currentToast ? getUpgrade(currentToast) : null;

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

      <div className="menu-corner menu-corner-tl" aria-hidden>
        <span className="corner-glyph">◈</span>
        <span className="corner-text">CH·0</span>
      </div>
      <div className="menu-corner menu-corner-tr" aria-hidden>
        <span className="corner-text">SHRINE</span>
        <span className="corner-glyph">◈</span>
      </div>

      <div className="menu-toolbar" aria-hidden={showSettings || showHow}>
        <button
          className="toolbar-btn"
          aria-label="how to play"
          onClick={() => { playSfx('ui_click'); setShowHow(true); }}
        >
          ?
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
      {showArsenalPanel && (
        <ArsenalPanel meta={meta} onClose={() => setShowArsenalPanel(false)} />
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

      <div className="menu-inner-v2 pixel-text">
        <div className="title-wrap">
          <div className="title-kicker">
            <span className="chev">▸</span>
            <span>A POCKET-SIZED ROGUELIKE</span>
            <span className="chev">◂</span>
          </div>
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
              <span className="btn-sub">CHOOSE YOUR CHALICE</span>
            </span>
            <span className="btn-dot">{pip}</span>
          </button>
        </div>

        <DieAltar />

        <div className="stats-card">
          <div className="stats-head">
            <span className="sh-line" />
            <span className="sh-label">LOG OF THE FALLEN</span>
            <span className="sh-line" />
          </div>
          <div className="stats-grid">
            <div className="stat-tile">
              <span className="stat-icon" aria-hidden>
                ☗
              </span>
              <span className="stat-val">{meta.totalRunsCompleted}</span>
              <span className="stat-key">RUNS</span>
            </div>
            <div className="stat-tile">
              <span className="stat-icon" aria-hidden>
                ≡
              </span>
              <span className="stat-val">{meta.totalWavesCleared}</span>
              <span className="stat-key">WAVES</span>
            </div>
            <div className="stat-tile">
              <span className="stat-icon" aria-hidden>
                ♛
              </span>
              <span className="stat-val">{topScore}</span>
              <span className="stat-key">HIGH</span>
            </div>
            <div className="stat-tile">
              <span className="stat-icon" aria-hidden>
                ✶
              </span>
              <span className="stat-val">
                {unlocks}<span className="stat-of">/6</span>
              </span>
              <span className="stat-key">HEROES</span>
            </div>
            <button
              type="button"
              className="stat-tile stat-tile-btn"
              onClick={() => { playSfx('ui_click'); setShowArsenalPanel(true); }}
              aria-label="view arsenal"
            >
              <span className="stat-icon" aria-hidden>
                ⚔
              </span>
              <span className="stat-val">
                {arsenalUnlocked}<span className="stat-of">/{arsenalTotal}</span>
              </span>
              <span className="stat-key">ARSENAL</span>
            </button>
          </div>
        </div>

        <div className="foot-row">
          <span className="foot-seg">V0.1</span>
          <span className="foot-dot">◆</span>
          <span className="foot-seg">MOBILE</span>
          <span className="foot-dot">◆</span>
          <span className="foot-seg foot-blink">TAP TO PLAY</span>
        </div>
      </div>
    </div>
  );
}

function ArsenalPanel({ meta, onClose }: { meta: import('../types').MetaState; onClose: () => void }) {
  const unlocked = new Set(meta.unlockedArsenal ?? []);
  const entries = ARSENAL_UPGRADES.map((u) => ({ upgrade: u, unlocked: unlocked.has(u.id) }));
  const sorted = entries.sort((a, b) => {
    if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
    const order = { common: 0, rare: 1, epic: 2, legendary: 3 } as const;
    return (order[a.upgrade.rarity] - order[b.upgrade.rarity]);
  });
  return (
    <div className="overlay arsenal-overlay" onClick={onClose}>
      <div className="arsenal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="arsenal-head pixel-text">
          <span>ARSENAL</span>
          <span className="arsenal-count">{entries.filter((e) => e.unlocked).length}/{entries.length}</span>
          <button className="btn btn-ghost arsenal-close" onClick={() => { playSfx('ui_click'); onClose(); }}>
            ✕
          </button>
        </div>
        <div className="arsenal-list">
          {sorted.map(({ upgrade: u, unlocked: isUnlocked }) => (
            <div
              key={u.id}
              className={`arsenal-row rarity-${u.rarity} ${isUnlocked ? 'is-unlocked' : 'is-locked'}`}
            >
              <div className="arsenal-row-head">
                <span className="arsenal-name pixel-text">{isUnlocked ? u.name : '???'}</span>
                <span className={`arsenal-rarity pixel-text rarity-tag-${u.rarity}`}>
                  {u.rarity.toUpperCase()}
                </span>
              </div>
              <div className="arsenal-desc">
                {isUnlocked ? u.desc : (u.unlockHint ?? 'Locked')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
