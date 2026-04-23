import { useEffect, useRef } from 'react';
import { useStore } from '../state/store';
import { HUD } from './HUD';
import { PauseMenu } from './PauseMenu';
import { UpgradeSelect } from './UpgradeSelect';
import { BossWarning } from './BossWarning';
import { GameCanvas } from './GameCanvas';
import { Onboarding } from './Onboarding';
import { pause } from '../engine/engine';
import { playSfx } from '../audio/sfx';

export function GameScreen() {
  const screen = useStore((s) => s.screen);
  const handledRef = useRef(false);

  useEffect(() => {
    handledRef.current = false;
  }, [screen]);

  const handlePause = () => {
    if (handledRef.current) return;
    handledRef.current = true;
    playSfx('ui_click');
    pause();
  };

  return (
    <div className="screen game">
      <GameCanvas />
      <HUD onPause={handlePause} />
      {screen === 'upgrade' && <UpgradeSelect />}
      {screen === 'pause' && <PauseMenu />}
      {screen === 'boss-warn' && <BossWarning />}
      <Onboarding />
    </div>
  );
}
