import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/global.css';
import { initCharacterContent } from './content/characters';
import { initEnemyContent } from './content/enemies';
import { initUpgradeContent } from './content/upgrades';
import { initSprites } from './sprites';
import { useStore } from './state/store';
import { saveSettings } from './state/persistence';
import { setMasterVolume, setSfxVolume, setMusicVolume } from './audio/synth';
import { setHapticsEnabled } from './audio/haptics';
import { setShakeMultiplier } from './engine/shake';

initCharacterContent();
initEnemyContent();
initUpgradeContent();
initSprites();

function applySettings(s: ReturnType<typeof useStore.getState>['settings']): void {
  setMasterVolume(s.masterVolume);
  setSfxVolume(s.sfxVolume);
  setMusicVolume(s.musicVolume);
  setHapticsEnabled(s.haptics);
  setShakeMultiplier(s.reduceShake ? 0.35 : 1);
}

applySettings(useStore.getState().settings);
useStore.subscribe(
  (s) => s.settings,
  (settings, prev) => {
    applySettings(settings);
    if (settings !== prev) saveSettings(settings);
  },
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
