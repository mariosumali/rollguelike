import { useState, useEffect, useRef } from 'react';
import { useStore } from '../state/store';
import { startRun } from '../engine/engine';
import { listCharacters } from '../content/characters/registry';
import { initCharacterContent } from '../content/characters';
import { initEnemyContent } from '../content/enemies';
import { initUpgradeContent } from '../content/upgrades';
import { playSfx } from '../audio/sfx';
import { CharacterPortrait } from './CharacterPortrait';
import type { Character, Element, Face, FaceKind } from '../types';
import { BALANCE } from '../config/balance';

const FACE_LABEL: Record<FaceKind, string> = {
  SHOT: 'SHOT',
  BURST: 'BURST',
  PULSE: 'PULSE',
  SHIELD: 'SHIELD',
  HEAL: 'HEAL',
  BLANK: 'DUD',
  WILD: 'WILD',
  SOUL_DRAIN: 'DRAIN',
  RAGE_SMASH: 'SMASH',
  CHARGED_BOLT: 'BOLT',
  BOMB: 'BOMB',
};

const FACE_COLOR: Record<FaceKind, string> = {
  SHOT: '#e3eaff',
  BURST: '#ffc66b',
  PULSE: '#b490ff',
  SHIELD: '#8aa7ff',
  HEAL: '#7ef28c',
  BLANK: '#5a5f78',
  WILD: '#ff9bd8',
  SOUL_DRAIN: '#c99cff',
  RAGE_SMASH: '#ff5c5c',
  CHARGED_BOLT: '#9adcff',
  BOMB: '#ff8c4a',
};

function fmtMul(m?: number): string {
  if (m === undefined || m === 1) return '';
  const s = m.toFixed(2).replace(/\.?0+$/, '');
  return ` ×${s}`;
}

function describeFace(face: Face, characterId: string): string {
  const v = face.value;
  const count = face.projectileCount ?? v;
  const mul = fmtMul(face.damageMul);
  switch (face.kind) {
    case 'SHOT':
      return `${count} shot${count === 1 ? '' : 's'}${mul}`;
    case 'CHARGED_BOLT':
      return `${count} charged bolt${count === 1 ? '' : 's'}${mul}`;
    case 'BURST': {
      const n = Math.max(4, count + 2);
      return `${n}-shot spread${mul}`;
    }
    case 'PULSE': {
      const dmg = BALANCE.combat.pulseDamage(v);
      return `AoE pulse · ${dmg} dmg${mul}`;
    }
    case 'SHIELD': {
      const n = BALANCE.combat.shieldAmount(v);
      return `+${n} shield`;
    }
    case 'HEAL': {
      const n = BALANCE.combat.healAmount(v);
      return `+${n} HP`;
    }
    case 'WILD':
      return `Repeat last face${mul}`;
    case 'SOUL_DRAIN':
      return `Spend ${v} souls → blast${mul}`;
    case 'RAGE_SMASH':
      return `Smash, scales with Rage${mul}`;
    case 'BOMB':
      return `Lob ${v} bombs${mul}`;
    case 'BLANK':
      void characterId;
      return 'Inactive legacy face';
    default:
      return '';
  }
}

interface DossierFaceRow {
  value: number;
  label: string;
  color: string;
  element: Element;
  desc: string;
  gambit: boolean;
}

/**
 * Builds the faces shown on the character select dossier.
 *
 * Runtime truth is `character.defaultFaces`: these baseline actions execute
 * whenever a slot does not hold a forge-installed replacer.
 */
function buildDossierFaces(character: Character): DossierFaceRow[] {
  const dice = character.startingDice[0];
  const defaults = character.defaultFaces;
  const gambitExtremes = BALANCE.gambler.gambitExtremes as readonly number[];

  return Array.from({ length: 6 }, (_, i) => {
    const face = dice?.faces[i];
    const df = defaults?.[i];
    const value = face?.value ?? i + 1;
    const gambit = character.id === 'gambler' && gambitExtremes.includes(value);

    if (df) {
      const baseline: Face = { ...df.face, value };
      return {
        value,
        label: df.name.toUpperCase(),
        color: FACE_COLOR[baseline.kind],
        element: baseline.element,
        desc: df.description || describeFace(baseline, character.id),
        gambit,
      };
    }

    if (!face) {
      return {
        value,
        label: '—',
        color: 'var(--fg-dim)',
        element: 'none',
        desc: '',
        gambit,
      };
    }

    return {
      value,
      label: FACE_LABEL[face.kind],
      color: FACE_COLOR[face.kind],
      element: face.element,
      desc: describeFace(face, character.id),
      gambit,
    };
  });
}

export function CharacterSelect() {
  const setScreen = useStore((s) => s.setScreen);
  const meta = useStore((s) => s.meta);
  const [selected, setSelected] = useState<string>('soldier');
  const [tick, setTick] = useState(0);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    initCharacterContent();
    initEnemyContent();
    initUpgradeContent();
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 120);
    return () => window.clearInterval(id);
  }, []);

  const chars = listCharacters();

  const isUnlocked = (id: string) => {
    if (meta.unlockedCharacters?.includes(id)) return true;
    const ch = chars.find((c) => c.id === id);
    if (!ch?.unlockCondition) return true;
    return ch.unlockCondition(meta);
  };

  const selChar = chars.find((c) => c.id === selected);
  const selUnlocked = selChar ? isUnlocked(selChar.id) : false;
  const selAccent = selChar?.color ?? 'var(--accent)';

  const onPlay = () => {
    if (!selChar || !selUnlocked) return;
    playSfx('ui_click');
    startRun(selChar.id);
  };

  const onBack = () => {
    playSfx('ui_click');
    setScreen('menu');
  };

  const pip = (tick & 1) === 0 ? '•' : '·';

  return (
    <div
      className="screen select select-v2"
      style={{ ['--sel-accent' as string]: selAccent }}
    >
      <div className="menu-vignette" aria-hidden />
      <div className="menu-scanlines" aria-hidden />

      <div className="select-inner pixel-text">
        <div className="select-top">
          <button
            className="btn-pixel btn-back"
            onClick={onBack}
            aria-label="back"
          >
            <span className="btn-chev">◂</span>
            <span className="btn-label">BACK</span>
          </button>

          <div className="select-title-wrap">
            <div className="title-kicker">
              <span className="chev">▸</span>
              <span>CHOOSE YOUR ROLL</span>
              <span className="chev">◂</span>
            </div>
            <div className="tagline-ribbon select-ribbon">
              <span className="tr-bracket">[</span>
              <span className="tr-track" key={selected}>
                {selUnlocked
                  ? (selChar?.tagline ?? 'PICK A FATE')
                  : (selChar?.unlockHint ?? 'SEALED BY FATE')}
              </span>
              <span className="tr-bracket">]</span>
            </div>
          </div>
        </div>

        <div className="select-grid-v2">
          {chars.map((c) => {
            const unlocked = isUnlocked(c.id);
            const hi = meta.highScores[c.id] ?? 0;
            const isSel = selected === c.id;
            return (
              <button
                key={c.id}
                className={`char-tile ${isSel ? 'selected' : ''} ${!unlocked ? 'locked' : ''}`}
                onClick={() => {
                  playSfx('ui_click');
                  setSelected(c.id);
                }}
                style={{
                  ['--tile-accent' as string]: unlocked ? c.color : 'var(--fg-dim)',
                }}
              >
                <span className="tile-corner tc-tl" aria-hidden />
                <span className="tile-corner tc-tr" aria-hidden />
                <span className="tile-corner tc-bl" aria-hidden />
                <span className="tile-corner tc-br" aria-hidden />

                <div className="char-portrait-wrap">
                  <CharacterPortrait characterId={c.id} size={72} fullBody={false} />
                </div>

                <div className="char-tile-name">
                  {unlocked ? c.name : '???'}
                </div>

                {unlocked && hi > 0 && (
                  <div className="char-tile-hi">
                    <span className="hi-dot">◆</span>
                    HI {hi}
                  </div>
                )}
                {!unlocked && (
                  <div className="char-tile-lock" aria-hidden>
                    ✕
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="dossier-card" aria-live="polite">
          <div className="dossier-head">
            <span className="sh-line" />
            <span className="sh-label">DOSSIER</span>
            <span className="sh-line" />
          </div>
          {selChar && (
            <div className="dossier-body">
              <div className="dossier-row">
                <span className="dossier-key">NAME</span>
                <span
                  className="dossier-val dossier-name"
                  style={{ color: selUnlocked ? selChar.color : 'var(--fg-dim)' }}
                >
                  {selUnlocked ? selChar.name : 'UNKNOWN'}
                </span>
              </div>
              <div className="dossier-row">
                <span className="dossier-key">CREED</span>
                <span className="dossier-val">
                  {selUnlocked ? selChar.tagline : (selChar.unlockHint ?? 'LOCKED')}
                </span>
              </div>
              <div className="dossier-desc">
                {selUnlocked
                  ? selChar.description
                  : 'Complete more runs to unlock this chalice.'}
              </div>

              {selUnlocked && selChar.startingDice[0] && (
                <div className="dossier-die">
                  <div className="dossier-die-head">
                    <span className="sh-line" />
                    <span className="sh-label">STARTING DIE</span>
                    <span className="sh-line" />
                  </div>
                  <div className="die-faces">
                    {buildDossierFaces(selChar).map((row) => (
                      <div className="die-face-row" key={row.value}>
                        <span
                          className="die-pip"
                          style={{ color: row.color }}
                          aria-hidden
                        >
                          {row.value}
                        </span>
                        <span
                          className="die-kind"
                          style={{ color: row.color }}
                          title={row.label}
                        >
                          {row.label}
                        </span>
                        {row.element !== 'none' && (
                          <span className={`die-elem elem-${row.element}`}>
                            {row.element.toUpperCase()}
                          </span>
                        )}
                        {row.gambit && (
                          <span className="die-elem die-gambit">GAMBIT</span>
                        )}
                        <span className="die-desc">{row.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="select-foot">
          <button
            className={`btn-pixel btn-primary-v2 btn-roll ${!selUnlocked ? 'locked' : ''}`}
            onClick={onPlay}
            disabled={!selUnlocked}
          >
            <span className="btn-chev">▸</span>
            <span className="btn-body">
              <span className="btn-label">{selUnlocked ? 'ROLL' : 'SEALED'}</span>
              <span className="btn-sub">
                {selUnlocked ? 'CAST THE DIE' : 'KEEP ROLLING TO UNLOCK'}
              </span>
            </span>
            <span className="btn-dot">{pip}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
