import { useMemo, useState } from 'react';
import { playSfx } from '../../audio/sfx';
import { RUN_MUTATORS } from '../../content/runMutators';

const CARD_NAMES = ['ACE', 'KING', 'QUEEN', 'JACK'];

export function CardDrawStation() {
  const [draw, setDraw] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);

  const cards = useMemo(() => {
    return CARD_NAMES.map((name, i) => {
      const contract = RUN_MUTATORS[(draw + i) % RUN_MUTATORS.length] ?? RUN_MUTATORS[0]!;
      return { name, contract };
    });
  }, [draw]);

  const reset = () => {
    playSfx('ui_click');
    setDraw((v) => v + 1);
    setPicked(null);
  };

  return (
    <div className="card-station">
      <div className="den-stage-hint">
        Practice reading contracts before a run. The same omen names now appear on character select.
      </div>
      <div className="card-hand" aria-label="contract cards">
        {cards.map((card, i) => (
          <button
            key={`${draw}-${card.name}`}
            type="button"
            className={`contract-card ${picked === i ? 'picked' : ''}`}
            onClick={() => {
              playSfx('ui_click');
              setPicked(i);
            }}
          >
            <span className="contract-card-rank">{card.name}</span>
            <span className="contract-card-name">{card.contract.shortName}</span>
            <span className="contract-card-desc">{card.contract.desc}</span>
          </button>
        ))}
      </div>
      <button type="button" className="btn btn-ghost" onClick={reset}>
        DRAW AGAIN
      </button>
    </div>
  );
}
