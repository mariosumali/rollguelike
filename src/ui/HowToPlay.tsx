import { playSfx } from '../audio/sfx';

interface Props {
  onClose: () => void;
}

export function HowToPlay({ onClose }: Props) {
  return (
    <div className="overlay how-overlay" onClick={onClose}>
      <div className="how-panel" onClick={(e) => e.stopPropagation()}>
        <div className="how-title pixel-text">How to Play</div>
        <ol className="how-list pixel-text">
          <li>
            <span className="how-tag">TAP</span>
            Tap the die to roll. The face that lands decides your action.
          </li>
          <li>
            <span className="how-tag">FORGE</span>
            Clear waves to earn gold. Spend it at the Forge Shop to upgrade each face.
          </li>
          <li>
            <span className="how-tag">WAVE</span>
            Survive the wave. Beat a boss every 5th wave for a landmark reward.
          </li>
          <li>
            <span className="how-tag">SWORD</span>
            Attack faces auto-target the nearest enemy.
          </li>
          <li>
            <span className="how-tag">SHIELD</span>
            Shield pips block one hit each. Heal faces restore HP.
          </li>
          <li>
            <span className="how-tag">DEATH</span>
            If an enemy touches the wall, you take damage. Don't let them through.
          </li>
        </ol>
        <button className="btn btn-primary" onClick={() => { playSfx('ui_click'); onClose(); }}>
          Got it
        </button>
      </div>
    </div>
  );
}
