import { useEffect, useMemo, useState } from 'react';
import { useStore } from '../state/store';
import { playSfx } from '../audio/sfx';
import { getCharacter } from '../content/characters/registry';

export function GameOver() {
  const setScreen = useStore((s) => s.setScreen);
  const hud = useStore((s) => s.hud);
  const meta = useStore((s) => s.meta);
  const characterId = hud.characterId;
  const highScore = meta.highScores[characterId] ?? 0;
  const isNewHigh = hud.score > 0 && hud.score >= highScore;
  const character = getCharacter(characterId);

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 140);
    return () => window.clearInterval(id);
  }, []);
  const pip = (tick & 1) === 0 ? '•' : '·';

  const confetti = useMemo(() => {
    if (!isNewHigh) return [];
    return Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      left: `${(i * 53) % 100}%`,
      delay: `${(i % 6) * 0.08}s`,
      hue: ['#ffd86b', '#ff7a2b', '#6ac6ff', '#c77cff', '#6ae07a'][i % 5],
    }));
  }, [isNewHigh]);

  return (
    <div className="screen gameover gameover-v2">
      <div className="menu-vignette gameover-vignette" aria-hidden />
      <div className="menu-scanlines" aria-hidden />

      <div className="menu-corner menu-corner-tl" aria-hidden>
        <span className="corner-glyph">✕</span>
        <span className="corner-text">END</span>
      </div>
      <div className="menu-corner menu-corner-tr" aria-hidden>
        <span className="corner-text">W{String(hud.wave).padStart(2, '0')}</span>
        <span className="corner-glyph">✕</span>
      </div>

      {isNewHigh && (
        <div className="confetti-layer" aria-hidden>
          {confetti.map((c) => (
            <span
              key={c.id}
              className="confetti"
              style={{ left: c.left, animationDelay: c.delay, background: c.hue }}
            />
          ))}
        </div>
      )}

      <div className="gameover-inner-v2 pixel-text">
        <div className="panel-kicker gameover-kicker">
          <span className="chev">▸</span>
          <span>{character?.name ?? 'HERO'} · FALLEN</span>
          <span className="chev">◂</span>
        </div>

        <h1 className="panel-title-v2 gameover-title-v2" aria-label="Game Over">
          <span className="pt-shadow" aria-hidden>GAME OVER</span>
          <span className="pt-main gameover-main">GAME OVER</span>
        </h1>

        <div className="tagline-ribbon gameover-ribbon">
          <span className="tr-bracket">[</span>
          <span className="tr-track">
            {hud.houseClearLabel ? 'THE HOUSE HAS BEEN CLEARED' : isNewHigh ? 'THE HOUSE STUMBLES · NEW RECORD' : 'THE DIE FAVORS ANOTHER'}
          </span>
          <span className="tr-bracket">]</span>
        </div>

        <div className="gameover-stats-card">
          <span className="panel-corner pc-tl" aria-hidden />
          <span className="panel-corner pc-tr" aria-hidden />
          <span className="panel-corner pc-bl" aria-hidden />
          <span className="panel-corner pc-br" aria-hidden />

          <div className="gameover-stats-grid">
            <div className="gameover-stat-tile">
              <span className="stat-icon" aria-hidden>≡</span>
              <span className="stat-val">{hud.wave}</span>
              <span className="stat-key">WAVE</span>
            </div>
            <div className={`gameover-stat-tile ${isNewHigh ? 'is-hi' : ''}`}>
              <span className="stat-icon" aria-hidden>◆</span>
              <span className="stat-val">{hud.score}</span>
              <span className="stat-key">SCORE</span>
            </div>
            <div className="gameover-stat-tile">
              <span className="stat-icon" aria-hidden>♛</span>
              <span className="stat-val">{highScore}</span>
              <span className="stat-key">BEST</span>
            </div>
            <div className="gameover-stat-tile">
              <span className="stat-icon" aria-hidden>⌁</span>
              <span className="stat-val">{meta.houseClears ?? 0}</span>
              <span className="stat-key">CLEARS</span>
            </div>
          </div>

          {isNewHigh && (
            <div className="gameover-new-v2">
              <span className="gn-badge">NEW</span>
              <span className="gn-text">HIGH SCORE</span>
              <span className="gn-badge">!</span>
            </div>
          )}
        </div>

        <div className="gameover-btns-v2">
          <button
            className="btn-pixel btn-primary-v2"
            onClick={() => { playSfx('ui_click'); setScreen('select'); }}
          >
            <span className="btn-chev">▸</span>
            <span className="btn-body">
              <span className="btn-label">RETRY</span>
              <span className="btn-sub">CAST ANOTHER DIE</span>
            </span>
            <span className="btn-dot">{pip}</span>
          </button>
          <button
            className="btn-pixel btn-ghost-v2"
            onClick={() => { playSfx('ui_click'); setScreen('menu'); }}
          >
            <span className="btn-chev back-triangle" aria-hidden />
            <span className="btn-body">
              <span className="btn-label">MAIN MENU</span>
              <span className="btn-sub">BACK TO THE SHRINE</span>
            </span>
            <span className="btn-dot">{pip}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
