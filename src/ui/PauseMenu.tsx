import { useEffect, useState } from 'react';
import { useStore } from '../state/store';
import { resumeGame, quitRun } from '../engine/engine';
import { playSfx } from '../audio/sfx';
import { SettingsPanel } from './SettingsPanel';
import { getUpgrade } from '../content/upgrades/registry';

export function PauseMenu() {
  const activeUpgrades = useStore((s) => s.activeUpgrades);
  const hud = useStore((s) => s.hud);
  const [showSettings, setShowSettings] = useState(false);

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 140);
    return () => window.clearInterval(id);
  }, []);
  const pip = (tick & 1) === 0 ? '•' : '·';

  if (showSettings) {
    return (
      <div className="overlay pause-overlay pause-v2">
        <div className="menu-vignette" aria-hidden />
        <div className="menu-scanlines" aria-hidden />
        <SettingsPanel onClose={() => setShowSettings(false)} inline />
      </div>
    );
  }

  return (
    <div className="overlay pause-overlay pause-v2">
      <div className="menu-vignette" aria-hidden />
      <div className="menu-scanlines" aria-hidden />

      <div className="pause-panel-v2 pixel-text">
        <span className="panel-corner pc-tl" aria-hidden />
        <span className="panel-corner pc-tr" aria-hidden />
        <span className="panel-corner pc-bl" aria-hidden />
        <span className="panel-corner pc-br" aria-hidden />

        <div className="panel-kicker">
          <span className="chev">▸</span>
          <span>WAVE {String(hud.wave).padStart(2, '0')} · PAUSED</span>
          <span className="chev">◂</span>
        </div>

        <h2 className="panel-title-v2" aria-label="Paused">
          <span className="pt-shadow" aria-hidden>PAUSED</span>
          <span className="pt-main">PAUSED</span>
        </h2>

        <div className="tagline-ribbon pause-ribbon">
          <span className="tr-bracket">[</span>
          <span className="tr-track">DRAW A BREATH · FATE WAITS</span>
          <span className="tr-bracket">]</span>
        </div>

        <div className="panel-section">
          <div className="section-head">
            <span className="sh-line" />
            <span className="sh-label">ARSENAL · {activeUpgrades.length}</span>
            <span className="sh-line" />
          </div>
          {activeUpgrades.length === 0 ? (
            <div className="empty-v2 pixel-text">NO UPGRADES YET</div>
          ) : (
            <ul className="upg-chiplist">
              {activeUpgrades.map((u) => {
                const up = getUpgrade(u.id);
                const rarity = up?.rarity ?? 'common';
                const name = up?.name ?? u.id;
                return (
                  <li key={u.id} className={`upg-chip rarity-${rarity}`}>
                    <span className="upg-chip-name">{name}</span>
                    {u.stacks > 1 && <span className="upg-chip-stack">×{u.stacks}</span>}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="pause-btns-v2">
          <button
            className="btn-pixel btn-primary-v2"
            onClick={() => { playSfx('ui_click'); resumeGame(); }}
          >
            <span className="btn-chev">▸</span>
            <span className="btn-body">
              <span className="btn-label">RESUME</span>
              <span className="btn-sub">BACK TO THE FRAY</span>
            </span>
            <span className="btn-dot">{pip}</span>
          </button>
          <button
            className="btn-pixel btn-ghost-v2"
            onClick={() => { playSfx('ui_click'); setShowSettings(true); }}
          >
            <span className="btn-chev">⚙</span>
            <span className="btn-body">
              <span className="btn-label">SETTINGS</span>
            </span>
            <span className="btn-dot">{pip}</span>
          </button>
          <button
            className="btn-pixel btn-danger-v2"
            onClick={() => { playSfx('ui_click'); quitRun(); }}
          >
            <span className="btn-chev">✕</span>
            <span className="btn-body">
              <span className="btn-label">QUIT RUN</span>
              <span className="btn-sub">FORFEIT THE ROLL</span>
            </span>
            <span className="btn-dot">{pip}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
