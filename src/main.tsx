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
import { setMasterVolume, setSfxVolume, setMusicVolume, setUiVolume } from './audio/synth';
import { setHapticsEnabled, setHapticStrengthMultiplier } from './audio/haptics';
import { setShakeMultiplier } from './engine/shake';
import {
  setScreenFlashesEnabled,
  setDamageNumbersEnabled,
  setEnemyHpBarMode,
  setParticleDensity,
  setReduceMotionEnabled,
  setAutoRollEnabled,
} from './state/prefsRuntime';
import type { HapticStrength } from './state/store';

function hapticStrengthToMultiplier(s: HapticStrength): number {
  return s === 'low' ? 0.5 : s === 'high' ? 1.4 : 1;
}

initCharacterContent();
initEnemyContent();
initUpgradeContent();
initSprites();

function applyUiAccessibilityFlags(s: ReturnType<typeof useStore.getState>['settings']): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.dataset.highContrast = s.highContrast ? 'on' : 'off';
  root.dataset.largeText = s.largeText ? 'on' : 'off';
  root.dataset.reduceMotion = s.reduceMotion ? 'on' : 'off';
}

function getEffectiveMasterVolume(s: ReturnType<typeof useStore.getState>['settings']): number {
  const hiddenMuted = typeof document !== 'undefined' && document.hidden && s.muteWhenUnfocused;
  return s.audioMuted || hiddenMuted ? 0 : s.masterVolume;
}

function applySettings(s: ReturnType<typeof useStore.getState>['settings']): void {
  setMasterVolume(getEffectiveMasterVolume(s));
  setSfxVolume(s.sfxVolume);
  setUiVolume(s.uiVolume);
  setMusicVolume(s.musicVolume);
  setHapticsEnabled(s.haptics);
  setHapticStrengthMultiplier(hapticStrengthToMultiplier(s.hapticStrength));
  setShakeMultiplier(s.shakeIntensity);
  setScreenFlashesEnabled(s.screenFlashes);
  setDamageNumbersEnabled(s.damageNumbers);
  setEnemyHpBarMode(s.enemyHpBars);
  setParticleDensity(s.particleDensity);
  setReduceMotionEnabled(s.reduceMotion);
  setAutoRollEnabled(s.autoRoll);
  applyUiAccessibilityFlags(s);
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
