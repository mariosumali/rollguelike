import { useEffect, useRef } from 'react';
import { useStore } from './state/store';
import { MainMenu } from './ui/MainMenu';
import { CharacterSelect } from './ui/CharacterSelect';
import { GameScreen } from './ui/GameScreen';
import { GameOver } from './ui/GameOver';
import { hydrate } from './state/persistence';
import { initAudio, setMasterVolume, setMusicVolume, setSfxVolume, setUiVolume } from './audio/synth';
import { startBgm, stopBgm, setBgmTrack, setBgmIntensity } from './audio/bgm';
import { pickRandomMenuTrack, type MenuTrackId } from './audio/bgmPatterns';
import { pause as pauseEngine } from './engine/engine';

/** Screens where we play the dedicated title theme instead of the gameplay track. */
const MENU_SCREENS = new Set(['menu', 'select', 'gameover']);

export function App() {
  const screen = useStore((s) => s.screen);
  const bgmTrack = useStore((s) => s.settings.bgmTrack);
  const isBossWave = useStore((s) => s.hud.isBossWave);
  // Locked-in menu variant for the current menu session. Cleared when leaving
  // the menu group so the next return rolls a different genre.
  const menuTrackRef = useRef<MenuTrackId | null>(null);

  useEffect(() => {
    hydrate();
    const unlock = () => {
      initAudio();
      const s = useStore.getState().settings;
      setMasterVolume(s.masterVolume);
      setSfxVolume(s.sfxVolume);
      setUiVolume(s.uiVolume);
      setMusicVolume(s.musicVolume);
      const cur = useStore.getState().screen;
      if (MENU_SCREENS.has(cur)) {
        if (!menuTrackRef.current) menuTrackRef.current = pickRandomMenuTrack();
        setBgmTrack(menuTrackRef.current);
      } else {
        setBgmTrack(s.bgmTrack);
      }
      startBgm();
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      stopBgm();
    };
  }, []);

  useEffect(() => {
    const inMenu = MENU_SCREENS.has(screen);
    if (inMenu) {
      if (!menuTrackRef.current) menuTrackRef.current = pickRandomMenuTrack();
      setBgmTrack(menuTrackRef.current);
    } else {
      menuTrackRef.current = null;
      setBgmTrack(bgmTrack);
    }
    setBgmIntensity(!inMenu && isBossWave ? 'boss' : 'normal');
  }, [screen, bgmTrack, isBossWave]);

  // Auto-pause on blur / mute when unfocused. Reads live settings each time
  // via useStore.getState so the handler respects the current pref without
  // needing to re-subscribe on every settings change.
  useEffect(() => {
    const onVisibility = () => {
      const hidden = document.hidden;
      const { settings, screen: current } = useStore.getState();
      if (settings.muteWhenUnfocused) {
        setMasterVolume(hidden ? 0 : settings.masterVolume);
      }
      if (hidden && settings.autoPauseOnBlur && current === 'game') {
        pauseEngine();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <>
      <div className="rotate-prompt">Please rotate to portrait mode</div>
      <div className="app-root" style={{ width: '100%', height: '100%', position: 'relative' }}>
        {screen === 'menu' && <MainMenu />}
        {screen === 'select' && <CharacterSelect />}
        {(screen === 'game' || screen === 'upgrade' || screen === 'forge' || screen === 'boss-warn' || screen === 'pause') && <GameScreen />}
        {screen === 'gameover' && <GameOver />}
      </div>
    </>
  );
}
