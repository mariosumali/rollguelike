import { useEffect } from 'react';
import { useStore } from './state/store';
import { MainMenu } from './ui/MainMenu';
import { CharacterSelect } from './ui/CharacterSelect';
import { GameScreen } from './ui/GameScreen';
import { GameOver } from './ui/GameOver';
import { hydrate } from './state/persistence';
import { initAudio, setMasterVolume, setMusicVolume, setSfxVolume } from './audio/synth';

export function App() {
  const screen = useStore((s) => s.screen);

  useEffect(() => {
    hydrate();
    const unlock = () => {
      initAudio();
      const s = useStore.getState().settings;
      setMasterVolume(s.masterVolume);
      setSfxVolume(s.sfxVolume);
      setMusicVolume(s.musicVolume);
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    return () => window.removeEventListener('pointerdown', unlock);
  }, []);

  return (
    <>
      <div className="rotate-prompt">Please rotate to portrait mode</div>
      <div className="app-root" style={{ width: '100%', height: '100%', position: 'relative' }}>
        {screen === 'menu' && <MainMenu />}
        {screen === 'select' && <CharacterSelect />}
        {(screen === 'game' || screen === 'upgrade' || screen === 'boss-warn' || screen === 'pause') && <GameScreen />}
        {screen === 'gameover' && <GameOver />}
      </div>
    </>
  );
}
