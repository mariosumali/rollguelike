import { useEffect, useState } from 'react';
import { useStore } from '../state/store';
import { pickUpgrade, rerollUpgradeOffers } from '../engine/engine';
import { getUpgrade } from '../content/upgrades/registry';
import { playSfx } from '../audio/sfx';
import { BaubleIcon, RelicIcon } from './RelicIcon';
import type { Rarity } from '../types';

const RARITY_COLORS: Record<Rarity, string> = {
  common: 'var(--common)',
  rare: 'var(--rare)',
  epic: 'var(--epic)',
  legendary: 'var(--legendary)',
};

export function UpgradeSelect() {
  const offers = useStore((s) => s.upgradeOffers);
  const picksRemaining = useStore((s) => s.upgradePicksRemaining);
  const activeUpgrades = useStore((s) => s.activeUpgrades);
  const isBossWave = useStore((s) => s.hud.isBossWave);
  const hud = useStore((s) => s.hud);
  const [rerolled, setRerolled] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 140);
    return () => window.clearInterval(id);
  }, []);
  const pip = (tick & 1) === 0 ? '•' : '·';

  const onPick = (id: string) => {
    playSfx('ui_click');
    pickUpgrade(id);
  };

  const onReroll = () => {
    if (rerolled) return;
    playSfx('ui_click');
    setRerolled(true);
    rerollUpgradeOffers();
  };

  const title = isBossWave ? 'BOSS REWARD' : 'UPGRADE';
  const roomCopy = hud.roomLine || hud.omenLine;
  const tagline = isBossWave
    ? `THE WARDEN KNEELS${roomCopy ? ` · ${roomCopy}` : ' · CLAIM A GIFT'}`
    : `CAST A NEW FATE${roomCopy ? ` · ${roomCopy}` : ' · BEND THE ODDS'}`;

  return (
    <div className="overlay upgrade-overlay upgrade-v2">
      <div className="menu-vignette" aria-hidden />
      <div className="menu-scanlines" aria-hidden />

      <div className={`upgrade-panel-v2 pixel-text ${isBossWave ? 'is-boss' : ''}`}>
        <span className="panel-corner pc-tl" aria-hidden />
        <span className="panel-corner pc-tr" aria-hidden />
        <span className="panel-corner pc-bl" aria-hidden />
        <span className="panel-corner pc-br" aria-hidden />

        <div className="panel-kicker">
          <span className="chev">▸</span>
          <span>
            WAVE {String(hud.wave).padStart(2, '0')} · ALTAR
            {hud.runMutatorShortName ? ` · ${hud.runMutatorShortName}` : ''}
          </span>
          <span className="chev">◂</span>
        </div>

        <h2 className="panel-title-v2" aria-label={title}>
          <span className="pt-shadow" aria-hidden>{title}</span>
          <span className="pt-main">{title}</span>
        </h2>

        <div className="tagline-ribbon upg-ribbon">
          <span className="tr-bracket">[</span>
          <span className="tr-track">
            {tagline}{hud.forgeBonusLabel ? ` · NEXT ${hud.forgeBonusLabel}` : ''}
          </span>
          <span className="tr-bracket">]</span>
        </div>

        <div className="upg-picks-row">
          <span className="sh-line" />
          <span className="upg-picks-label">
            PICKS · {Array.from({ length: Math.max(1, picksRemaining) }).map((_, i) => (
              <span key={i} className={`pick-pip ${i < picksRemaining ? 'on' : 'off'}`}>◆</span>
            ))}
          </span>
          <span className="sh-line" />
        </div>

        <div className="upgrade-cards-v2">
          {offers.map((o) => {
            const up = getUpgrade(o.id);
            if (!up) return null;
            const existing = activeUpgrades.find((a) => a.id === o.id);
            const stackLabel = existing ? `×${existing.stacks + 1}/${up.maxStack}` : '';
            const isRelic = up.category === 'relic';
            const isBauble = up.category === 'bauble';
            return (
              <button
                key={o.id}
                className={`upg-card-v2 rarity-${o.rarity} ${isRelic ? 'is-relic-card' : ''} ${isBauble ? 'is-bauble-card' : ''}`}
                onClick={() => onPick(o.id)}
                style={{ ['--card-accent' as string]: RARITY_COLORS[o.rarity] }}
              >
                <span className="card-corner cc-tl" aria-hidden />
                <span className="card-corner cc-tr" aria-hidden />
                <span className="card-corner cc-bl" aria-hidden />
                <span className="card-corner cc-br" aria-hidden />

                <div className="upg-card-head">
                  <span className="upg-rarity">
                    {o.rarity.toUpperCase()}{stackLabel ? ` ${stackLabel}` : ''}
                  </span>
                  <span className="upg-cat">{isRelic ? 'RELIC' : isBauble ? 'BAUBLE' : up.category}</span>
                </div>
                {isRelic && (
                  <div className="upg-relic-art" aria-hidden>
                    <RelicIcon upgrade={up} size={58} />
                  </div>
                )}
                {isBauble && (
                  <div className="upg-relic-art upg-bauble-art" aria-hidden>
                    <BaubleIcon upgrade={up} size={48} />
                  </div>
                )}
                <div className="upg-card-name">{up.name}</div>
                {isRelic && up.lore && <div className="upg-card-lore">{up.lore}</div>}
                <div className="upg-card-desc">{up.desc}</div>
                <div className="upg-card-foot" aria-hidden>
                  <span className="chev">▸</span>
                  <span className="foot-label">CLAIM</span>
                  <span className="chev">◂</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="upg-foot-v2">
          <button
            className={`btn-pixel btn-ghost-v2 ${rerolled ? 'is-used' : ''}`}
            onClick={onReroll}
            disabled={rerolled}
          >
            <span className="btn-chev">↻</span>
            <span className="btn-body">
              <span className="btn-label">{rerolled ? 'REROLLED' : 'REROLL'}</span>
              <span className="btn-sub">{rerolled ? 'ONCE PER ALTAR' : 'FREE CAST'}</span>
            </span>
            <span className="btn-dot">{pip}</span>
          </button>
          <button
            className="btn-pixel btn-ghost-v2"
            onClick={() => { playSfx('ui_click'); setShowDrawer((v) => !v); }}
          >
            <span className="btn-chev">☰</span>
            <span className="btn-body">
              <span className="btn-label">{showDrawer ? 'HIDE' : 'INVENTORY'}</span>
              <span className="btn-sub">{activeUpgrades.length} HELD</span>
            </span>
            <span className="btn-dot">{pip}</span>
          </button>
        </div>

        {showDrawer && (
          <div className="upg-drawer-v2">
            {activeUpgrades.length === 0 && <div className="empty-v2">NO UPGRADES YET</div>}
            {activeUpgrades.map((a) => {
              const up = getUpgrade(a.id);
              if (!up) return null;
              return (
                <div
                  key={a.id}
                  className={`drawer-row-v2 rarity-${up.rarity}`}
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
        )}
      </div>
    </div>
  );
}
