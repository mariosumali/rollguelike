import { useEffect, useRef } from 'react';
import { GAME_SPEED_MULTIPLIERS, useStore, type GameSpeedMultiplier } from '../state/store';
import { HUD } from './HUD';
import { PauseMenu } from './PauseMenu';
import { UpgradeSelect } from './UpgradeSelect';
import { ForgeShop } from './ForgeShop';
import { CasinoReward } from './CasinoReward';
import { BossWarning } from './BossWarning';
import { GameCanvas } from './GameCanvas';
import { FaceBar } from './FaceBar';
import { Onboarding } from './Onboarding';
import { pause } from '../engine/engine';
import { playSfx } from '../audio/sfx';
import { getUpgrade } from '../content/upgrades/registry';
import { BaubleIcon } from './RelicIcon';

function BaubleShelf() {
  const activeUpgrades = useStore((s) => s.activeUpgrades);
  const baubles = activeUpgrades
    .map((a) => ({ applied: a, upgrade: getUpgrade(a.id) }))
    .filter((entry): entry is { applied: { id: string; stacks: number }; upgrade: NonNullable<ReturnType<typeof getUpgrade>> } =>
      entry.upgrade?.category === 'bauble',
    );
  if (baubles.length === 0) return null;
  const visible = baubles.slice(0, 8);
  const overflow = Math.max(0, baubles.length - visible.length);
  return (
    <div className="bauble-shelf" aria-label="Held baubles">
      {visible.map(({ applied, upgrade }) => (
        <div
          key={applied.id}
          className="bauble-shelf-item"
          title={`${upgrade.name}${applied.stacks > 1 ? ` x${applied.stacks}` : ''}\n${upgrade.desc}`}
        >
          <BaubleIcon upgrade={upgrade} size={28} />
          {applied.stacks > 1 && <span className="bauble-shelf-stack">x{applied.stacks}</span>}
        </div>
      ))}
      {overflow > 0 && <div className="bauble-shelf-more">+{overflow}</div>}
    </div>
  );
}

function GameSpeedControl() {
  const speed = useStore((s) => s.settings.gameSpeedMultiplier);
  const setSettings = useStore((s) => s.setSettings);

  const setSpeed = (next: GameSpeedMultiplier) => {
    if (next === speed) return;
    playSfx('ui_click');
    setSettings({ gameSpeedMultiplier: next });
  };

  return (
    <div className="game-speed-control pixel-text" aria-label="Game speed">
      <span className="game-speed-label">SPD</span>
      <div className="game-speed-options" role="group" aria-label="Game speed multiplier">
        {GAME_SPEED_MULTIPLIERS.map((mul) => (
          <button
            key={mul}
            className={`game-speed-option${mul === speed ? ' is-active' : ''}`}
            type="button"
            onClick={() => setSpeed(mul)}
            aria-pressed={mul === speed}
          >
            {mul}x
          </button>
        ))}
      </div>
    </div>
  );
}

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
      <FaceBar />
      {screen === 'game' && <GameSpeedControl />}
      <BaubleShelf />
      {screen === 'upgrade' && <UpgradeSelect />}
      {screen === 'forge' && <ForgeShop />}
      {screen === 'casino' && <CasinoReward />}
      {screen === 'pause' && <PauseMenu />}
      {screen === 'boss-warn' && <BossWarning />}
      <Onboarding />
    </div>
  );
}
