import { useEffect, useState } from 'react';
import { getRunState, useStore } from '../state/store';
import { resumeGame, returnToMainMenu, quitRun } from '../engine/engine';
import { playSfx } from '../audio/sfx';
import { SettingsPanel } from './SettingsPanel';
import { getUpgrade } from '../content/upgrades/registry';
import { getFaceUpgrade } from '../content/upgrades/faceRegistry';
import { getFaceName } from '../content/upgrades/faceNames';
import { getCharacter } from '../content/characters/registry';
import { BaubleIcon, RelicIcon } from './RelicIcon';
import type { Rarity, RunState } from '../types';

const RARITY_COLORS: Record<Rarity, string> = {
  common: 'var(--common)',
  rare: 'var(--rare)',
  epic: 'var(--epic)',
  legendary: 'var(--legendary)',
};

type ActiveUpgrade = { id: string; stacks: number };

function PauseBuildSummary({
  run,
  activeUpgrades,
}: {
  run: RunState | null;
  activeUpgrades: ActiveUpgrade[];
}) {
  const characterId = run?.characterId ?? null;
  const slots = run?.slotLayout ?? [];
  const equippedFaceIds = new Set<string>();
  slots.forEach((slot) => {
    if (slot.replacerId) equippedFaceIds.add(slot.replacerId);
  });
  const equippedFaceCount = slots.reduce(
    (count, slot) => count + (slot.replacerId ? 1 : 0),
    0,
  );
  const relicUpgrades = activeUpgrades.filter((a) => getUpgrade(a.id)?.category === 'relic');
  const baubleUpgrades = activeUpgrades.filter((a) => getUpgrade(a.id)?.category === 'bauble');
  const runUpgrades = activeUpgrades.filter((a) => {
    const category = getUpgrade(a.id)?.category;
    return category !== 'relic' && category !== 'bauble';
  });

  const benchFaces = Object.entries(run?.ownedFaceUpgrades ?? {})
    .filter(([id]) => !equippedFaceIds.has(id))
    .map(([id]) => ({ upgrade: getFaceUpgrade(id) }))
    .filter((entry): entry is { upgrade: NonNullable<ReturnType<typeof getFaceUpgrade>> } =>
      Boolean(entry.upgrade),
    );

  return (
    <div className="pause-build-v2" aria-label="Current build">
      <div className="build-head-v2">
        <span className="sh-line" />
        <span className="build-title-v2">BUILD</span>
        <span className="build-count-v2">
          {activeUpgrades.length + equippedFaceCount + benchFaces.length} UPGRADES
        </span>
        <span className="sh-line" />
      </div>

      <div className="build-section-v2">
        <div className="build-section-label">DICE FACES</div>
        <div className="pause-face-grid-v2">
          {Array.from({ length: 6 }).map((_, i) => {
            const slot = slots[i];
            const replacer = slot?.replacerId ? getFaceUpgrade(slot.replacerId) : null;
            const baseline = run ? getCharacter(run.characterId)?.defaultFaces?.[i] : undefined;
            const accent = replacer ? RARITY_COLORS[replacer.rarity] : 'var(--fg-dim)';
            const replacerName = replacer
              ? getFaceName(replacer.id, characterId, replacer.name)
              : baseline?.name ?? 'Baseline';

            return (
              <div
                key={i}
                className={`pause-face-slot-v2 ${replacer ? '' : 'is-empty'}`}
                style={{ ['--card-accent' as string]: accent }}
                title={
                  replacer
                    ? `${replacerName}\n${replacer.description}`
                    : `Face ${i + 1} · ${replacerName}\n${baseline?.description ?? 'Baseline face'}`
                }
              >
                <div className="pause-face-main-v2">
                  <span className="pause-face-value-v2">{i + 1}</span>
                  <span className="pause-face-name-v2">{replacerName}</span>
                </div>
                <div className="pause-face-sups-v2">
                  <span className="pause-face-empty-v2">
                    {replacer ? 'FORGE WEAPON' : 'BASELINE'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="build-section-v2">
        <div className="build-section-label">RELICS</div>
        <div className="pause-relic-list-v2">
          {relicUpgrades.length === 0 && <div className="empty-v2">NO RELICS YET</div>}
          {relicUpgrades.map((a) => {
            const up = getUpgrade(a.id);
            if (!up) return null;
            return (
              <div
                key={a.id}
                className="drawer-row-v2 pause-relic-row-v2"
                style={{ ['--card-accent' as string]: RARITY_COLORS[up.rarity] }}
              >
                <RelicIcon upgrade={up} size={40} />
                <div>
                  <div className="drawer-row-head">
                    <span className="drawer-name">
                      {up.name}{a.stacks > 1 ? ` ×${a.stacks}` : ''}
                    </span>
                    <span className="drawer-rarity">{up.rarity.toUpperCase()}</span>
                  </div>
                  {up.lore && <div className="drawer-desc">{up.lore}</div>}
                  <div className="drawer-desc">{up.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="build-section-v2">
        <div className="build-section-label">BAUBLES</div>
        <div className="pause-bauble-grid-v2">
          {baubleUpgrades.length === 0 && <div className="empty-v2">NO BAUBLES YET</div>}
          {baubleUpgrades.map((a) => {
            const up = getUpgrade(a.id);
            if (!up) return null;
            return (
              <div
                key={a.id}
                className="pause-bauble-chip-v2"
                style={{ ['--card-accent' as string]: RARITY_COLORS[up.rarity] }}
                title={`${up.name}${a.stacks > 1 ? ` x${a.stacks}` : ''}\n${up.desc}`}
              >
                <BaubleIcon upgrade={up} size={34} />
                {a.stacks > 1 && <span className="pause-bauble-stack-v2">x{a.stacks}</span>}
              </div>
            );
          })}
        </div>
      </div>

      {benchFaces.length > 0 && (
        <div className="build-section-v2">
          <div className="build-section-label">OWNED · NOT EQUIPPED</div>
          <div className="pause-chip-list-v2">
            {benchFaces.map(({ upgrade }) => (
              <span
                key={upgrade.id}
                className="pause-build-chip-v2"
                style={{ ['--card-accent' as string]: RARITY_COLORS[upgrade.rarity] }}
                title={upgrade.description}
              >
                {getFaceName(upgrade.id, characterId, upgrade.name)}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="build-section-v2">
        <div className="build-section-label">RUN UPGRADES</div>
        <div className="pause-upgrade-list-v2">
          {runUpgrades.length === 0 && <div className="empty-v2">NO RUN UPGRADES YET</div>}
          {runUpgrades.map((a) => {
            const up = getUpgrade(a.id);
            if (!up) return null;
            return (
              <div
                key={a.id}
                className="drawer-row-v2 pause-upgrade-row-v2"
                style={{ ['--card-accent' as string]: RARITY_COLORS[up.rarity] }}
              >
                <div className="drawer-row-head">
                  <span className="drawer-name">
                    {up.name}{a.stacks > 1 ? ` ×${a.stacks}` : ''}
                  </span>
                  <span className="drawer-rarity">{up.rarity.toUpperCase()}</span>
                </div>
                <div className="drawer-desc">{up.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function PauseMenu() {
  const hud = useStore((s) => s.hud);
  const confirmQuit = useStore((s) => s.settings.confirmQuit);
  const activeUpgrades = useStore((s) => s.activeUpgrades);
  const [showSettings, setShowSettings] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 140);
    return () => window.clearInterval(id);
  }, []);
  const pip = (tick & 1) === 0 ? '•' : '·';
  const run = getRunState();
  const runUpgrades = run?.upgrades ?? activeUpgrades;

  if (showSettings) {
    return (
      <div className="overlay pause-overlay pause-v2">
        <div className="menu-vignette" aria-hidden />
        <div className="menu-scanlines" aria-hidden />
        <SettingsPanel onClose={() => setShowSettings(false)} inline />
      </div>
    );
  }

  return (
    <div className="overlay pause-overlay pause-v2">
      <div className="menu-vignette" aria-hidden />
      <div className="menu-scanlines" aria-hidden />

      <div className="pause-panel-v2 pixel-text">
        <span className="panel-corner pc-tl" aria-hidden />
        <span className="panel-corner pc-tr" aria-hidden />
        <span className="panel-corner pc-bl" aria-hidden />
        <span className="panel-corner pc-br" aria-hidden />

        <div className="panel-kicker">
          <span className="chev">▸</span>
          <span>WAVE {String(hud.wave).padStart(2, '0')} · PAUSED</span>
          <span className="chev">◂</span>
        </div>

        <h2 className="panel-title-v2" aria-label="Paused">
          <span className="pt-shadow" aria-hidden>PAUSED</span>
          <span className="pt-main">PAUSED</span>
        </h2>

        <div className="tagline-ribbon pause-ribbon">
          <span className="tr-bracket">[</span>
          <span className="tr-track">DRAW A BREATH · FATE WAITS</span>
          <span className="tr-bracket">]</span>
        </div>

        <PauseBuildSummary run={run} activeUpgrades={runUpgrades} />

        <div className="pause-btns-v2">
          <button
            className="btn-pixel btn-primary-v2"
            onClick={() => { playSfx('ui_click'); resumeGame(); }}
          >
            <span className="btn-chev">▸</span>
            <span className="btn-body">
              <span className="btn-label">RESUME</span>
              <span className="btn-sub">BACK TO THE FRAY</span>
            </span>
            <span className="btn-dot">{pip}</span>
          </button>
          <button
            className="btn-pixel btn-ghost-v2"
            onClick={() => { playSfx('ui_click'); setShowSettings(true); }}
          >
            <span className="btn-chev">⚙</span>
            <span className="btn-body">
              <span className="btn-label">SETTINGS</span>
            </span>
            <span className="btn-dot">{pip}</span>
          </button>
          <button
            className="btn-pixel btn-ghost-v2"
            onClick={() => { playSfx('ui_click'); returnToMainMenu(); }}
          >
            <span className="btn-chev back-triangle" aria-hidden />
            <span className="btn-body">
              <span className="btn-label">MAIN MENU</span>
              <span className="btn-sub">KEEP THIS RUN</span>
            </span>
            <span className="btn-dot">{pip}</span>
          </button>
          <button
            className="btn-pixel btn-danger-v2"
            onClick={() => {
              playSfx('ui_click');
              if (confirmQuit) setShowQuitConfirm(true);
              else quitRun();
            }}
          >
            <span className="btn-chev">✕</span>
            <span className="btn-body">
              <span className="btn-label">QUIT RUN</span>
              <span className="btn-sub">FORFEIT THE ROLL</span>
            </span>
            <span className="btn-dot">{pip}</span>
          </button>
        </div>
      </div>

      {showQuitConfirm && (
        <div
          className="overlay confirm-overlay"
          onClick={() => { playSfx('ui_click'); setShowQuitConfirm(false); }}
        >
          <div className="confirm-panel pixel-text" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-title">ABANDON RUN?</div>
            <div className="confirm-body">
              Your current progress will be lost. The fate of the dice resets.
            </div>
            <div className="confirm-actions">
              <button
                className="btn btn-ghost"
                onClick={() => { playSfx('ui_click'); setShowQuitConfirm(false); }}
              >
                Keep playing
              </button>
              <button
                className="btn btn-danger"
                onClick={() => { playSfx('ui_click'); setShowQuitConfirm(false); quitRun(); }}
              >
                Quit run
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
