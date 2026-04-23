import { useEffect, useState } from 'react';
import { useStore } from '../state/store';
import { saveOnboarded } from '../state/persistence';
import { playSfx } from '../audio/sfx';

const STEPS = [
  { title: 'Tap the die', body: 'Tap anywhere to roll. The face that lands is your action.' },
  { title: 'Chain faces', body: 'Back-to-back same faces build a streak multiplier.' },
  { title: 'Protect the wall', body: 'Enemies that cross the wall damage you.' },
];

export function Onboarding() {
  const onboarded = useStore((s) => s.onboarded);
  const setOnboarded = useStore((s) => s.setOnboarded);
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(!onboarded);

  useEffect(() => { setVisible(!onboarded); }, [onboarded]);

  if (!visible) return null;

  const next = () => {
    playSfx('ui_click');
    if (step >= STEPS.length - 1) {
      setOnboarded(true);
      saveOnboarded(true);
      setVisible(false);
    } else {
      setStep(step + 1);
    }
  };

  const skip = () => {
    playSfx('ui_click');
    setOnboarded(true);
    saveOnboarded(true);
    setVisible(false);
  };

  const s = STEPS[step];

  return (
    <div className="overlay onboarding-overlay">
      <div className="onboard-panel">
        <div className="onboard-step pixel-text">STEP {step + 1}/{STEPS.length}</div>
        <div className="onboard-title pixel-text">{s.title}</div>
        <div className="onboard-body pixel-text">{s.body}</div>
        <div className="onboard-dots" aria-hidden>
          {STEPS.map((_, i) => (
            <span key={i} className={`dot ${i === step ? 'on' : ''}`} />
          ))}
        </div>
        <div className="onboard-btns">
          <button className="btn btn-ghost" onClick={skip}>Skip</button>
          <button className="btn btn-primary" onClick={next}>
            {step >= STEPS.length - 1 ? 'Play' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
