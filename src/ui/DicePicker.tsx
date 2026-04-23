import { useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '../state/store';
import { playSfx } from '../audio/sfx';
import { initSprites } from '../sprites';
import {
  DIE_THEME_IDS,
  DIE_THEME_LABELS,
  DIE_THEME_UNLOCKS,
  DIE_THEMES,
  buildDieSpriteSet,
  type DieThemeId,
} from '../sprites/dice';

interface Props {
  onClose: () => void;
}

const PREVIEW_SIZE = 48;
const FACE_PATTERN: readonly number[] = [1, 2, 3, 4, 5, 6];

function DieSwatch({
  themeId,
  face,
  active,
  locked,
  onPick,
}: {
  themeId: DieThemeId;
  face: number;
  active: boolean;
  locked: boolean;
  onPick: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const set = useMemo(() => {
    initSprites();
    return buildDieSpriteSet(DIE_THEMES[themeId]);
  }, [themeId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, PREVIEW_SIZE, PREVIEW_SIZE);
    const idx = Math.max(0, Math.min(5, face - 1));
    const img = set.faces[idx]!;
    const scale = Math.floor(PREVIEW_SIZE / set.size);
    const drawW = set.size * scale;
    const drawH = set.size * scale;
    const px = Math.round((PREVIEW_SIZE - drawW) / 2);
    const py = Math.round((PREVIEW_SIZE - drawH) / 2);
    ctx.drawImage(img, 0, 0, set.size, set.size, px, py, drawW, drawH);
  }, [set, face]);

  const label = DIE_THEME_LABELS[themeId];
  const cls = `dice-swatch ${active ? 'active' : ''} ${locked ? 'locked' : ''}`.trim();

  return (
    <button
      type="button"
      className={cls}
      onClick={onPick}
      aria-pressed={active}
      aria-label={locked ? `${label} die — locked` : `${label} die`}
    >
      <span className="dice-swatch-art" aria-hidden>
        <canvas
          ref={canvasRef}
          width={PREVIEW_SIZE}
          height={PREVIEW_SIZE}
          className="dice-swatch-canvas"
        />
        {locked && <span className="dice-swatch-lock pixel-text" aria-hidden>🔒</span>}
      </span>
      <span className="dice-swatch-label pixel-text">{locked ? '???' : label}</span>
      {active && !locked && (
        <span className="dice-swatch-check pixel-text" aria-hidden>✓</span>
      )}
    </button>
  );
}

export function DicePicker({ onClose }: Props) {
  const selected = useStore((s) => s.settings.dieTheme);
  const setSettings = useStore((s) => s.setSettings);
  const unlocked = useStore((s) => s.meta.unlockedDiceThemes);

  const unlockedSet = useMemo(() => new Set(unlocked ?? []), [unlocked]);
  const [hoveredLocked, setHoveredLocked] = useState<DieThemeId | null>(null);

  const pick = (id: DieThemeId) => {
    if (!unlockedSet.has(id)) {
      playSfx('ui_click');
      setHoveredLocked(id);
      return;
    }
    playSfx('ui_click');
    setSettings({ dieTheme: id });
    setHoveredLocked(null);
  };

  const unlockedCount = DIE_THEME_IDS.filter((id) => unlockedSet.has(id)).length;

  const hintTheme = hoveredLocked ?? null;
  const hintRule = hintTheme ? DIE_THEME_UNLOCKS[hintTheme] : null;

  return (
    <div className="overlay dice-picker-overlay" onClick={onClose}>
      <div className="dice-picker-panel" onClick={(e) => e.stopPropagation()}>
        <div className="dice-picker-head pixel-text">
          <span>DICE LOOK</span>
          <span className="dice-picker-count">
            {unlockedCount}/{DIE_THEME_IDS.length}
          </span>
          <button
            type="button"
            className="btn btn-ghost dice-picker-close"
            onClick={() => {
              playSfx('ui_click');
              onClose();
            }}
            aria-label="close"
          >
            ✕
          </button>
        </div>
        <div className="dice-picker-sub pixel-text">
          Pick how your die looks. Complete challenges to unlock more.
        </div>
        <div className="dice-picker-grid">
          {DIE_THEME_IDS.map((id, i) => (
            <DieSwatch
              key={id}
              themeId={id}
              face={FACE_PATTERN[i % FACE_PATTERN.length]!}
              active={selected === id}
              locked={!unlockedSet.has(id)}
              onPick={() => pick(id)}
            />
          ))}
        </div>
        <div
          className={`dice-picker-hint pixel-text ${hintRule ? 'active' : ''}`}
          role="status"
          aria-live="polite"
        >
          {hintRule ? (
            <>
              <span className="dice-picker-hint-title">
                🔒 {DIE_THEME_LABELS[hintTheme!]}
              </span>
              <span className="dice-picker-hint-desc">{hintRule.description}</span>
            </>
          ) : (
            <span className="dice-picker-hint-placeholder">
              Tap a locked die to see its challenge.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
