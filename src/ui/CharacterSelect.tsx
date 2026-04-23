import { useState, useEffect, useRef } from 'react';
import { useStore } from '../state/store';
import { startRun } from '../engine/engine';
import { listCharacters } from '../content/characters/registry';
import { initCharacterContent } from '../content/characters';
import { initEnemyContent } from '../content/enemies';
import { initUpgradeContent } from '../content/upgrades';
import { playSfx } from '../audio/sfx';
import { CharacterPortrait } from './CharacterPortrait';

export function CharacterSelect() {
  const setScreen = useStore((s) => s.setScreen);
  const meta = useStore((s) => s.meta);
  const [selected, setSelected] = useState<string>('soldier');
  const [tick, setTick] = useState(0);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    initCharacterContent();
    initEnemyContent();
    initUpgradeContent();
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 120);
    return () => window.clearInterval(id);
  }, []);

  const chars = listCharacters();

  const isUnlocked = (id: string) => {
    const ch = chars.find((c) => c.id === id);
    if (!ch?.unlockCondition) return true;
    return ch.unlockCondition(meta);
  };

  const selChar = chars.find((c) => c.id === selected);
  const selUnlocked = selChar ? isUnlocked(selChar.id) : false;
  const selIndex = chars.findIndex((c) => c.id === selected);
  const selAccent = selChar?.color ?? 'var(--accent)';

  const onPlay = () => {
    if (!selChar || !selUnlocked) return;
    playSfx('ui_click');
    startRun(selChar.id);
  };

  const onBack = () => {
    playSfx('ui_click');
    setScreen('menu');
  };

  const pip = (tick & 1) === 0 ? '•' : '·';

  return (
    <div
      className="screen select select-v2"
      style={{ ['--sel-accent' as string]: selAccent }}
    >
      <div className="menu-vignette" aria-hidden />
      <div className="menu-scanlines" aria-hidden />

      <div className="menu-corner menu-corner-tl" aria-hidden>
        <span className="corner-glyph">◈</span>
        <span className="corner-text">SEL·{String(selIndex + 1).padStart(2, '0')}</span>
      </div>
      <div className="menu-corner menu-corner-tr" aria-hidden>
        <span className="corner-text">CHALICE</span>
        <span className="corner-glyph">◈</span>
      </div>

      <div className="select-inner pixel-text">
        <div className="select-top">
          <button
            className="btn-pixel btn-back"
            onClick={onBack}
            aria-label="back"
          >
            <span className="btn-chev">◂</span>
            <span className="btn-label">BACK</span>
          </button>

          <div className="select-title-wrap">
            <div className="title-kicker">
              <span className="chev">▸</span>
              <span>CHOOSE YOUR ROLL</span>
              <span className="chev">◂</span>
            </div>
            <div className="tagline-ribbon select-ribbon">
              <span className="tr-bracket">[</span>
              <span className="tr-track" key={selected}>
                {selUnlocked
                  ? (selChar?.tagline ?? 'PICK A FATE')
                  : (selChar?.unlockHint ?? 'SEALED BY FATE')}
              </span>
              <span className="tr-bracket">]</span>
            </div>
          </div>
        </div>

        <div className="select-grid-v2">
          {chars.map((c) => {
            const unlocked = isUnlocked(c.id);
            const hi = meta.highScores[c.id] ?? 0;
            const isSel = selected === c.id;
            return (
              <button
                key={c.id}
                className={`char-tile ${isSel ? 'selected' : ''} ${!unlocked ? 'locked' : ''}`}
                onClick={() => {
                  playSfx('ui_click');
                  setSelected(c.id);
                }}
                style={{
                  ['--tile-accent' as string]: unlocked ? c.color : 'var(--fg-dim)',
                }}
              >
                <span className="tile-corner tc-tl" aria-hidden />
                <span className="tile-corner tc-tr" aria-hidden />
                <span className="tile-corner tc-bl" aria-hidden />
                <span className="tile-corner tc-br" aria-hidden />

                <div className="char-portrait-wrap">
                  <CharacterPortrait characterId={c.id} size={56} />
                </div>

                <div className="char-tile-name">
                  {unlocked ? c.name : '???'}
                </div>

                {unlocked && hi > 0 && (
                  <div className="char-tile-hi">
                    <span className="hi-dot">◆</span>
                    HI {hi}
                  </div>
                )}
                {!unlocked && (
                  <div className="char-tile-lock" aria-hidden>
                    ✕
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="dossier-card" aria-live="polite">
          <div className="dossier-head">
            <span className="sh-line" />
            <span className="sh-label">DOSSIER</span>
            <span className="sh-line" />
          </div>
          {selChar && (
            <div className="dossier-body">
              <div className="dossier-row">
                <span className="dossier-key">NAME</span>
                <span
                  className="dossier-val dossier-name"
                  style={{ color: selUnlocked ? selChar.color : 'var(--fg-dim)' }}
                >
                  {selUnlocked ? selChar.name : 'UNKNOWN'}
                </span>
              </div>
              <div className="dossier-row">
                <span className="dossier-key">CREED</span>
                <span className="dossier-val">
                  {selUnlocked ? selChar.tagline : (selChar.unlockHint ?? 'LOCKED')}
                </span>
              </div>
              <div className="dossier-desc">
                {selUnlocked
                  ? selChar.description
                  : 'Complete more runs to unlock this chalice.'}
              </div>
            </div>
          )}
        </div>

        <div className="select-foot">
          <button
            className={`btn-pixel btn-primary-v2 btn-roll ${!selUnlocked ? 'locked' : ''}`}
            onClick={onPlay}
            disabled={!selUnlocked}
          >
            <span className="btn-chev">▸</span>
            <span className="btn-body">
              <span className="btn-label">{selUnlocked ? 'ROLL' : 'SEALED'}</span>
              <span className="btn-sub">
                {selUnlocked ? 'CAST THE DIE' : 'KEEP ROLLING TO UNLOCK'}
              </span>
            </span>
            <span className="btn-dot">{pip}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
