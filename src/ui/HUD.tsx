import { useEffect, useRef, useState } from 'react';
import { useStore } from '../state/store';

interface Props {
  onPause: () => void;
}

export function HUD({ onPause }: Props) {
  const hud = useStore((s) => s.hud);

  const hpPct = Math.max(0, Math.min(1, hud.hp / hud.maxHp));
  const wavePct = Math.max(0, Math.min(1, hud.waveProgress));

  const hpState = hpPct < 0.25 ? 'crit' : hpPct < 0.5 ? 'low' : 'ok';

  const prevScoreRef = useRef(hud.score);
  const [scorePopKey, setScorePopKey] = useState(0);
  useEffect(() => {
    if (hud.score !== prevScoreRef.current) {
      if (hud.score > prevScoreRef.current) setScorePopKey((k) => k + 1);
      prevScoreRef.current = hud.score;
    }
  }, [hud.score]);

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 140);
    return () => window.clearInterval(id);
  }, []);
  const pip = (tick & 1) === 0 ? '◆' : '◇';

  return (
    <div className="hud hud-v2">
      <div className="hud-row hud-top">
        <div className="hud-chip wave-chip pixel-text">
          <span className="chip-key">W</span>
          <span className="chip-val">{String(hud.wave).padStart(2, '0')}</span>
          {hud.isBossWave && <span className="boss-tag pixel-text">BOSS</span>}
        </div>
        <div key={scorePopKey} className="hud-chip score-chip pixel-text score-pop">
          <span className="chip-dot">{pip}</span>
          <span className="chip-val">{hud.score}</span>
        </div>
        <button className="pause-btn-v2 pixel-text" onClick={onPause} aria-label="pause">
          <span className="pause-glyph" aria-hidden>❚❚</span>
        </button>
      </div>
      <div
        className={`hud-wave-progress${hud.isBossWave ? ' boss' : ''}`}
        role="progressbar"
        aria-label="wave progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(wavePct * 100)}
      >
        <div className="hud-wave-progress-fill" style={{ width: `${wavePct * 100}%` }} />
        <span className="progress-cap cap-l" aria-hidden />
        <span className="progress-cap cap-r" aria-hidden />
      </div>
      <div className="hud-row hud-bottom">
        <div className="hud-hpwrap">
          <div className={`hud-hp hp-${hpState}`} aria-label={`HP ${hud.hp}/${hud.maxHp}`}>
            <div className="hud-hp-fill" style={{ width: `${hpPct * 100}%` }} />
            <div className="hud-hp-text pixel-text">{hud.hp}/{hud.maxHp}</div>
          </div>
          {hud.shield > 0 && (
            <div className="hud-shield pixel-text" aria-label={`shield ${hud.shield}`}>
              {Array.from({ length: hud.shield }).map((_, i) => (
                <span key={i} className="shield-pip">◆</span>
              ))}
            </div>
          )}
        </div>

        <div className="hud-indicators pixel-text">
          {hud.streak > 1 && (
            <div className="hud-chip streak-chip">
              <span className="chip-key">×</span>
              <span className="chip-val">{hud.streak}</span>
            </div>
          )}
          {hud.characterId === 'necromancer' && (
            <div className="hud-chip soul-chip">
              <span className="chip-key">☩</span>
              <span className="chip-val">{hud.souls}</span>
            </div>
          )}
          {hud.characterId === 'berserker' && (
            <div className="hud-chip rage-chip">
              <div className="rage-bar">
                <div className="rage-fill" style={{ width: `${Math.min(100, hud.rage * 10)}%` }} />
              </div>
              <span className="chip-key">RAGE</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
