import { useState } from 'react';
import {
  useStore,
  getRunState,
  BGM_TRACK_CHOICES,
  PARTICLE_DENSITY_VALUES,
  ENEMY_HP_BAR_VALUES,
  HAPTIC_STRENGTH_VALUES,
} from '../state/store';
import type {
  ParticleDensity,
  EnemyHpBarMode,
  HapticStrength,
} from '../state/store';
import { playSfx } from '../audio/sfx';
import { listCharacters } from '../content/characters/registry';
import { listUpgrades } from '../content/upgrades/registry';
import { saveMeta } from '../state/persistence';
import { DIE_THEME_IDS } from '../sprites/dice';
import type { MetaState } from '../types';

interface Props {
  onClose: () => void;
  inline?: boolean;
}

type TabId = 'audio' | 'visuals' | 'access' | 'gameplay' | 'codes';

const TABS: { id: TabId; label: string }[] = [
  { id: 'audio', label: 'Audio' },
  { id: 'visuals', label: 'Visuals' },
  { id: 'access', label: 'Access' },
  { id: 'gameplay', label: 'Game' },
  { id: 'codes', label: 'Codes' },
];

type CheatStatus =
  | { kind: 'idle' }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string };

const MIDAS_GOLD_FLOOR = 999_999;

function unlockAllCharacters(meta: MetaState): void {
  const all = listCharacters().map((c) => c.id);
  const set = new Set([...(meta.unlockedCharacters ?? []), ...all]);
  meta.unlockedCharacters = Array.from(set);
}

function unlockAllArsenal(meta: MetaState): void {
  const all = listUpgrades()
    .filter((u) => u.id.startsWith('ars_'))
    .map((u) => u.id);
  const set = new Set([...(meta.unlockedArsenal ?? []), ...all]);
  meta.unlockedArsenal = Array.from(set);
}

function unlockAllDiceThemes(meta: MetaState): void {
  const set = new Set([...(meta.unlockedDiceThemes ?? []), ...DIE_THEME_IDS]);
  meta.unlockedDiceThemes = Array.from(set);
}

function commitMeta(meta: MetaState): void {
  saveMeta(meta);
  useStore.getState().setMeta(meta);
}

function applyCheatCode(code: string): CheatStatus {
  const normalized = code.trim().toUpperCase();
  if (normalized.length === 0) {
    return { kind: 'error', message: 'Enter a code first.' };
  }

  const store = useStore.getState();
  const meta = { ...store.meta };

  switch (normalized) {
    case 'MARIO': {
      unlockAllCharacters(meta);
      unlockAllArsenal(meta);
      unlockAllDiceThemes(meta);
      commitMeta(meta);
      return { kind: 'success', message: 'All characters, arsenal & dice unlocked!' };
    }
    case 'CHAMPION': {
      unlockAllCharacters(meta);
      commitMeta(meta);
      return { kind: 'success', message: 'All characters unlocked!' };
    }
    case 'SQUARE': {
      unlockAllDiceThemes(meta);
      commitMeta(meta);
      return { kind: 'success', message: 'All dice themes unlocked!' };
    }
    case 'MIDAS': {
      const run = getRunState();
      if (!run) {
        return { kind: 'error', message: 'Start a run to strike gold.' };
      }
      run.gold = Math.max(run.gold, MIDAS_GOLD_FLOOR);
      useStore.getState().setHud({ gold: run.gold });
      return { kind: 'success', message: 'Your touch turns all to gold!' };
    }
    default:
      return { kind: 'error', message: 'Unknown code.' };
  }
}

const PARTICLE_LABELS: Record<ParticleDensity, string> = {
  low: 'Low',
  normal: 'Normal',
  high: 'High',
};
const HP_BAR_LABELS: Record<EnemyHpBarMode, string> = {
  off: 'Off',
  damaged: 'When hit',
  always: 'Always',
};
const HAPTIC_LABELS: Record<HapticStrength, string> = {
  low: 'Low',
  normal: 'Normal',
  high: 'High',
};

export function SettingsPanel({ onClose, inline }: Props) {
  const settings = useStore((s) => s.settings);
  const setSettings = useStore((s) => s.setSettings);
  const [tab, setTab] = useState<TabId>('audio');
  const [cheatInput, setCheatInput] = useState('');
  const [cheatStatus, setCheatStatus] = useState<CheatStatus>({ kind: 'idle' });

  const slider = (
    label: string,
    value: number,
    onChange: (v: number) => void,
    opts: { min?: number; max?: number; step?: number; format?: (v: number) => string } = {},
  ) => {
    const { min = 0, max = 1, step = 0.05, format = (v: number) => `${Math.round(v * 100)}` } = opts;
    return (
      <div className="settings-row">
        <label className="settings-label pixel-text">{label}</label>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label={label}
        />
        <div className="settings-val pixel-text">{format(value)}</div>
      </div>
    );
  };

  const toggle = (
    label: string,
    value: boolean,
    onChange: (v: boolean) => void,
    sub?: string,
  ) => (
    <div className="settings-row settings-row-toggle">
      <label className="settings-label pixel-text">
        {label}
        {sub ? <span className="settings-sub">{sub}</span> : null}
      </label>
      <button
        className={`toggle-pill ${value ? 'on' : 'off'}`}
        onClick={() => { playSfx('ui_click'); onChange(!value); }}
        aria-pressed={value}
      >
        {value ? 'ON' : 'OFF'}
      </button>
    </div>
  );

  function segmented<T extends string>(
    label: string,
    value: T,
    options: readonly T[],
    labels: Record<T, string>,
    onChange: (v: T) => void,
  ) {
    return (
      <div className="settings-row settings-row-segmented">
        <label className="settings-label pixel-text">{label}</label>
        <div className="settings-segmented" role="group" aria-label={label}>
          {options.map((o) => (
            <button
              key={o}
              type="button"
              className={`seg-pill pixel-text ${value === o ? 'active' : ''}`}
              onClick={() => { playSfx('ui_click'); onChange(o); }}
              aria-pressed={value === o}
            >
              {labels[o]}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const audioPane = (
    <>
      {slider('Master', settings.masterVolume, (v) => setSettings({ masterVolume: v }))}
      {slider('Music', settings.musicVolume, (v) => setSettings({ musicVolume: v }))}
      {slider('SFX', settings.sfxVolume, (v) => setSettings({ sfxVolume: v }))}
      {slider('UI clicks', settings.uiVolume, (v) => setSettings({ uiVolume: v }))}
      {toggle('Mute when unfocused', settings.muteWhenUnfocused, (v) => setSettings({ muteWhenUnfocused: v }))}
      <div className="settings-bgm-block">
        <div className="settings-bgm-title pixel-text">Adventure BGM</div>
        <div className="bgm-track-row" role="group" aria-label="Background music style">
          {BGM_TRACK_CHOICES.map((o) => (
            <button
              key={o.id}
              type="button"
              className={`bgm-track-pill pixel-text ${settings.bgmTrack === o.id ? 'active' : ''}`}
              title={settings.showTooltips ? o.blurb : undefined}
              onClick={() => {
                playSfx('ui_click');
                setSettings({ bgmTrack: o.id });
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );

  const visualsPane = (
    <>
      {slider('Screen shake', settings.shakeIntensity, (v) => setSettings({ shakeIntensity: v }))}
      {toggle('Screen flashes', settings.screenFlashes, (v) => setSettings({ screenFlashes: v }), 'Red & white full-screen effects')}
      {toggle('Damage numbers', settings.damageNumbers, (v) => setSettings({ damageNumbers: v }))}
      {segmented<ParticleDensity>(
        'Particles',
        settings.particleDensity,
        PARTICLE_DENSITY_VALUES,
        PARTICLE_LABELS,
        (v) => setSettings({ particleDensity: v }),
      )}
      {segmented<EnemyHpBarMode>(
        'Enemy HP',
        settings.enemyHpBars,
        ENEMY_HP_BAR_VALUES,
        HP_BAR_LABELS,
        (v) => setSettings({ enemyHpBars: v }),
      )}
    </>
  );

  const accessPane = (
    <>
      {toggle('Reduce motion', settings.reduceMotion, (v) => setSettings({ reduceMotion: v }), 'Dampens big menu transitions')}
      {toggle('High contrast', settings.highContrast, (v) => setSettings({ highContrast: v }), 'Stronger borders, less haze')}
      {toggle('Large text', settings.largeText, (v) => setSettings({ largeText: v }))}
      {toggle('Haptics', settings.haptics, (v) => setSettings({ haptics: v }))}
      {segmented<HapticStrength>(
        'Haptic strength',
        settings.hapticStrength,
        HAPTIC_STRENGTH_VALUES,
        HAPTIC_LABELS,
        (v) => setSettings({ hapticStrength: v }),
      )}
    </>
  );

  const gameplayPane = (
    <>
      {toggle('Auto-roll', settings.autoRoll, (v) => setSettings({ autoRoll: v }), 'Automatically roll dice when idle')}
      {toggle('Auto-pause on blur', settings.autoPauseOnBlur, (v) => setSettings({ autoPauseOnBlur: v }), 'Pause when tab is hidden')}
      {toggle('Confirm quit run', settings.confirmQuit, (v) => setSettings({ confirmQuit: v }))}
      {toggle('Tooltips', settings.showTooltips, (v) => setSettings({ showTooltips: v }), 'Show hover descriptions')}
    </>
  );

  const submitCheat = () => {
    playSfx('ui_click');
    const result = applyCheatCode(cheatInput);
    setCheatStatus(result);
    if (result.kind === 'success') setCheatInput('');
  };

  const codesPane = (
    <div className="settings-codes">
      <div className="settings-codes-title pixel-text">Cheat codes</div>
      <div className="settings-codes-sub pixel-text">
        Enter a secret to twist fate.
      </div>
      <form
        className="settings-codes-form"
        onSubmit={(e) => {
          e.preventDefault();
          submitCheat();
        }}
      >
        <input
          type="text"
          className="settings-codes-input pixel-text"
          value={cheatInput}
          onChange={(e) => {
            setCheatInput(e.target.value.toUpperCase());
            if (cheatStatus.kind !== 'idle') setCheatStatus({ kind: 'idle' });
          }}
          placeholder="ENTER CODE"
          spellCheck={false}
          autoCapitalize="characters"
          autoCorrect="off"
          autoComplete="off"
          aria-label="Cheat code"
          maxLength={24}
        />
        <button type="submit" className="btn btn-ghost settings-codes-submit pixel-text">
          APPLY
        </button>
      </form>
      {cheatStatus.kind !== 'idle' && (
        <div
          className={`settings-codes-status pixel-text ${cheatStatus.kind}`}
          role="status"
          aria-live="polite"
        >
          {cheatStatus.message}
        </div>
      )}
    </div>
  );

  const body = (
    <div className="settings-panel">
      <div className="settings-title pixel-text">Settings</div>
      <div className="settings-tabs" role="tablist" aria-label="Settings categories">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`settings-tab pixel-text ${tab === t.id ? 'active' : ''}`}
            onClick={() => { playSfx('ui_click'); setTab(t.id); }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="settings-pane" role="tabpanel">
        {tab === 'audio' && audioPane}
        {tab === 'visuals' && visualsPane}
        {tab === 'access' && accessPane}
        {tab === 'gameplay' && gameplayPane}
        {tab === 'codes' && codesPane}
      </div>
      <button className="btn btn-ghost settings-close" onClick={() => { playSfx('ui_click'); onClose(); }}>
        Close
      </button>
    </div>
  );

  if (inline) return body;
  return (
    <div className="overlay settings-overlay" onClick={onClose}>
      <div
        className="settings-panel-wrap"
        onClick={(e) => e.stopPropagation()}
      >
        {body}
      </div>
    </div>
  );
}
