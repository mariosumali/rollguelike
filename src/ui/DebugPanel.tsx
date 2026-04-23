import { useMemo, useState } from 'react';
import { useStore } from '../state/store';
import {
  debugJumpToWave,
  debugAddGold,
  debugHeal,
  debugGrantFaceUpgrade,
  debugGrantLandmarkUpgrade,
  debugGrantUpgradePick,
  debugUnlockEverything,
  debugListFaceUpgrades,
  debugListLandmarkUpgrades,
  startRun,
  quitRun,
} from '../engine/engine';
import { listCharacters } from '../content/characters/registry';
import { ALL_THEMES, type Theme } from './menu/types';
import { MENU_TRACK_IDS, type MenuTrackId } from '../audio/bgmPatterns';

type Section = 'wave' | 'items' | 'menu' | 'unlocks' | null;

const THEME_LABELS: Record<Theme, string> = {
  castle: 'Castle',
  mountain: 'Mountain',
  pirateCove: 'Pirate Cove',
  graveyard: 'Graveyard',
  cave: 'Cave',
  enchantedForest: 'Enchanted Forest',
  volcano: 'Volcano',
  wizardTower: 'Wizard Tower',
  skyTemple: 'Sky Temple',
};

const MENU_TRACK_LABELS: Record<MenuTrackId, string> = {
  'menu': 'Menu (default)',
  'menu-chiptune': 'Chiptune',
  'menu-synthwave': 'Synthwave',
  'menu-lofi': 'Lo-Fi',
  'menu-celtic': 'Celtic',
  'menu-march': 'March',
};

export function DebugPanel() {
  const debugMode = useStore((s) => s.debugMode);
  const setDebugMode = useStore((s) => s.setDebugMode);
  const screen = useStore((s) => s.screen);
  const hasRun = useStore((s) => s.hasRun);
  const wave = useStore((s) => s.hud.wave);
  const debugMenuTheme = useStore((s) => s.debugMenuTheme);
  const setDebugMenuTheme = useStore((s) => s.setDebugMenuTheme);
  const debugMenuTrack = useStore((s) => s.debugMenuTrack);
  const setDebugMenuTrack = useStore((s) => s.setDebugMenuTrack);

  const [open, setOpen] = useState(true);
  const [section, setSection] = useState<Section>('wave');
  const [waveInput, setWaveInput] = useState('1');
  const [faceFilter, setFaceFilter] = useState('');
  const [landmarkFilter, setLandmarkFilter] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const characters = useMemo(() => listCharacters(), []);
  const landmarkUpgrades = useMemo(() => debugListLandmarkUpgrades(), [debugMode]);
  const faceUpgrades = useMemo(() => debugListFaceUpgrades(), [debugMode]);

  const filteredFace = useMemo(() => {
    const q = faceFilter.trim().toLowerCase();
    if (!q) return faceUpgrades;
    return faceUpgrades.filter(
      (u) => u.id.toLowerCase().includes(q) || u.name.toLowerCase().includes(q),
    );
  }, [faceFilter, faceUpgrades]);

  const filteredLandmark = useMemo(() => {
    const q = landmarkFilter.trim().toLowerCase();
    if (!q) return landmarkUpgrades;
    return landmarkUpgrades.filter(
      (u) => u.id.toLowerCase().includes(q) || u.name.toLowerCase().includes(q),
    );
  }, [landmarkFilter, landmarkUpgrades]);

  if (!debugMode) return null;

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast((cur) => (cur === msg ? null : cur)), 1600);
  };

  const handleJump = () => {
    const n = parseInt(waveInput, 10);
    if (Number.isNaN(n) || n < 1) {
      flash('Invalid wave number.');
      return;
    }
    if (!hasRun) {
      const ch = characters[0];
      if (!ch) {
        flash('No character available.');
        return;
      }
      startRun(ch.id);
    }
    const ok = debugJumpToWave(n);
    flash(ok ? `Jumped to wave ${n}` : 'Jump failed');
  };

  const handleQuickStart = (characterId: string) => {
    startRun(characterId);
    flash(`Started run as ${characterId}`);
  };

  const toggleOpen = () => setOpen((v) => !v);

  return (
    <div className={`debug-panel ${open ? 'is-open' : 'is-collapsed'}`} aria-label="Debug panel">
      <div className="debug-panel-bar">
        <button
          type="button"
          className="debug-panel-toggle"
          onClick={toggleOpen}
          title={open ? 'Collapse' : 'Expand'}
        >
          {open ? '▾' : '▸'} DEBUG
        </button>
        <span className="debug-panel-status">
          screen:{screen} {hasRun ? `• wave ${wave}` : '• no run'}
        </span>
        <button
          type="button"
          className="debug-panel-close"
          onClick={() => {
            setDebugMode(false);
            setDebugMenuTheme(null);
            setDebugMenuTrack(null);
          }}
          title="Disable debug mode"
        >
          ×
        </button>
      </div>

      {open && (
        <>
          <nav className="debug-panel-tabs">
            {(['wave', 'items', 'menu', 'unlocks'] as const).map((id) => (
              <button
                key={id}
                type="button"
                className={`debug-tab ${section === id ? 'is-active' : ''}`}
                onClick={() => setSection(id)}
              >
                {id.toUpperCase()}
              </button>
            ))}
          </nav>

          <div className="debug-panel-body">
            {section === 'wave' && (
              <div className="debug-section">
                <div className="debug-row">
                  <label className="debug-label">Wave</label>
                  <input
                    type="number"
                    min={1}
                    className="debug-input debug-input-narrow"
                    value={waveInput}
                    onChange={(e) => setWaveInput(e.target.value)}
                  />
                  <button type="button" className="debug-btn" onClick={handleJump}>
                    Jump
                  </button>
                </div>
                <div className="debug-row debug-row-wrap">
                  {[5, 10, 15, 20, 25, 30, 40, 50].map((n) => (
                    <button
                      key={n}
                      type="button"
                      className="debug-chip"
                      onClick={() => {
                        setWaveInput(String(n));
                        if (hasRun) {
                          debugJumpToWave(n);
                          flash(`Jumped to wave ${n}`);
                        } else {
                          flash('Start a run first.');
                        }
                      }}
                    >
                      W{n}
                    </button>
                  ))}
                </div>
                <div className="debug-row debug-row-wrap">
                  <label className="debug-label">Quick start</label>
                  {characters.slice(0, 6).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className="debug-chip"
                      onClick={() => handleQuickStart(c.id)}
                    >
                      {c.id}
                    </button>
                  ))}
                </div>
                {hasRun && (
                  <div className="debug-row">
                    <button
                      type="button"
                      className="debug-btn debug-btn-danger"
                      onClick={() => {
                        quitRun();
                        flash('Run ended.');
                      }}
                    >
                      End run
                    </button>
                  </div>
                )}
              </div>
            )}

            {section === 'items' && (
              <div className="debug-section">
                <div className="debug-row debug-row-wrap">
                  <button
                    type="button"
                    className="debug-btn"
                    onClick={() => {
                      if (debugAddGold(1000)) flash('+1000 gold');
                      else flash('No active run.');
                    }}
                  >
                    +1000 gold
                  </button>
                  <button
                    type="button"
                    className="debug-btn"
                    onClick={() => {
                      if (debugAddGold(10000)) flash('+10000 gold');
                      else flash('No active run.');
                    }}
                  >
                    +10k gold
                  </button>
                  <button
                    type="button"
                    className="debug-btn"
                    onClick={() => {
                      if (debugHeal(0)) flash('Healed to full');
                      else flash('No active run.');
                    }}
                  >
                    Full heal
                  </button>
                  <button
                    type="button"
                    className="debug-btn"
                    onClick={() => {
                      if (debugHeal(50)) flash('+50 max HP');
                      else flash('No active run.');
                    }}
                  >
                    +50 max HP
                  </button>
                  <button
                    type="button"
                    className="debug-btn"
                    onClick={() => {
                      if (debugGrantUpgradePick(1)) flash('Upgrade pick granted');
                      else flash('No active run.');
                    }}
                  >
                    +1 upgrade pick
                  </button>
                </div>

                <div className="debug-group">
                  <div className="debug-group-title">Face upgrades ({filteredFace.length})</div>
                  <input
                    type="text"
                    className="debug-input"
                    placeholder="Filter by id or name…"
                    value={faceFilter}
                    onChange={(e) => setFaceFilter(e.target.value)}
                  />
                  <div className="debug-scroll">
                    {filteredFace.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        className="debug-list-item"
                        onClick={() => {
                          const ok = debugGrantFaceUpgrade(u.id, 3);
                          flash(ok ? `Installed ${u.name} (T3)` : `Owned ${u.name} (no slot)`);
                        }}
                        title={u.id}
                      >
                        <span className="debug-list-name">{u.name}</span>
                        <span className="debug-list-meta">{u.kind}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="debug-group">
                  <div className="debug-group-title">Landmark upgrades ({filteredLandmark.length})</div>
                  <input
                    type="text"
                    className="debug-input"
                    placeholder="Filter by id or name…"
                    value={landmarkFilter}
                    onChange={(e) => setLandmarkFilter(e.target.value)}
                  />
                  <div className="debug-scroll">
                    {filteredLandmark.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        className="debug-list-item"
                        onClick={() => {
                          const ok = debugGrantLandmarkUpgrade(u.id);
                          flash(ok ? `Granted ${u.name}` : 'No active run.');
                        }}
                        title={u.id}
                      >
                        <span className="debug-list-name">{u.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {section === 'menu' && (
              <div className="debug-section">
                <div className="debug-group">
                  <div className="debug-group-title">Background theme</div>
                  <div className="debug-row debug-row-wrap">
                    <button
                      type="button"
                      className={`debug-chip ${debugMenuTheme === null ? 'is-active' : ''}`}
                      onClick={() => {
                        setDebugMenuTheme(null);
                        flash('Background: random');
                      }}
                    >
                      random
                    </button>
                    {ALL_THEMES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        className={`debug-chip ${debugMenuTheme === t ? 'is-active' : ''}`}
                        onClick={() => {
                          setDebugMenuTheme(t);
                          flash(`Background: ${THEME_LABELS[t]}`);
                        }}
                      >
                        {THEME_LABELS[t]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="debug-group">
                  <div className="debug-group-title">Menu music</div>
                  <div className="debug-row debug-row-wrap">
                    <button
                      type="button"
                      className={`debug-chip ${debugMenuTrack === null ? 'is-active' : ''}`}
                      onClick={() => {
                        setDebugMenuTrack(null);
                        flash('Music: random');
                      }}
                    >
                      random
                    </button>
                    {MENU_TRACK_IDS.map((id) => (
                      <button
                        key={id}
                        type="button"
                        className={`debug-chip ${debugMenuTrack === id ? 'is-active' : ''}`}
                        onClick={() => {
                          setDebugMenuTrack(id);
                          flash(`Music: ${MENU_TRACK_LABELS[id]}`);
                        }}
                      >
                        {MENU_TRACK_LABELS[id]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {section === 'unlocks' && (
              <div className="debug-section">
                <div className="debug-row debug-row-wrap">
                  <button
                    type="button"
                    className="debug-btn"
                    onClick={() => {
                      debugUnlockEverything();
                      flash('All characters, arsenal, dice unlocked');
                    }}
                  >
                    Unlock everything
                  </button>
                </div>
                <p className="debug-note">
                  Unlocks all characters, arsenal weapons, and dice themes in meta (persisted).
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {toast && <div className="debug-toast">{toast}</div>}
    </div>
  );
}
