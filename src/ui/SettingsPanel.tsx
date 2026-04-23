import { useStore } from '../state/store';
import { playSfx } from '../audio/sfx';

interface Props {
  onClose: () => void;
  inline?: boolean;
}

export function SettingsPanel({ onClose, inline }: Props) {
  const settings = useStore((s) => s.settings);
  const setSettings = useStore((s) => s.setSettings);

  const row = (
    label: string,
    value: number,
    onChange: (v: number) => void,
  ) => (
    <div className="settings-row">
      <label className="settings-label pixel-text">{label}</label>
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
      />
      <div className="settings-val pixel-text">{Math.round(value * 100)}</div>
    </div>
  );

  const toggle = (
    label: string,
    value: boolean,
    onChange: (v: boolean) => void,
  ) => (
    <div className="settings-row">
      <label className="settings-label pixel-text">{label}</label>
      <button
        className={`toggle-pill ${value ? 'on' : 'off'}`}
        onClick={() => { playSfx('ui_click'); onChange(!value); }}
        aria-pressed={value}
      >
        {value ? 'ON' : 'OFF'}
      </button>
    </div>
  );

  const body = (
    <div className="settings-panel">
      <div className="settings-title pixel-text">Settings</div>
      {row('Master', settings.masterVolume, (v) => setSettings({ masterVolume: v }))}
      {row('Music', settings.musicVolume, (v) => setSettings({ musicVolume: v }))}
      {row('SFX', settings.sfxVolume, (v) => setSettings({ sfxVolume: v }))}
      {toggle('Haptics', settings.haptics, (v) => setSettings({ haptics: v }))}
      {toggle('Reduce Shake', settings.reduceShake, (v) => setSettings({ reduceShake: v }))}
      <button className="btn btn-ghost settings-close" onClick={() => { playSfx('ui_click'); onClose(); }}>
        Close
      </button>
    </div>
  );

  if (inline) return body;
  return (
    <div className="overlay settings-overlay" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>{body}</div>
    </div>
  );
}
