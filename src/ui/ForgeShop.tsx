import { useEffect, useState } from 'react';
import { useStore } from '../state/store';
import {
  buyForgeShopOffer,
  rerollForgeShopOffers,
  forgeShopDone,
  forgeShopSkipForHeal,
  expandSlotCap,
} from '../engine/engine';
import { getFaceUpgrade } from '../content/upgrades/faceRegistry';
import { playSfx } from '../audio/sfx';
import { BALANCE } from '../config/balance';
import { getRunState } from '../state/store';
import type { Rarity } from '../types';

const RARITY_COLORS: Record<Rarity, string> = {
  common: 'var(--common)',
  rare: 'var(--rare)',
  epic: 'var(--epic)',
  legendary: 'var(--legendary)',
};

export function ForgeShop() {
  const offers = useStore((s) => s.forgeShopOffers);
  const hud = useStore((s) => s.hud);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 140);
    return () => window.clearInterval(id);
  }, []);
  void tick;

  const run = getRunState();
  const rerollCost = BALANCE.shop.rerollCost(hud.wave);
  const slotExpandCost = BALANCE.shop.slotExpandCost(hud.wave);

  const onBuy = (index: number) => {
    const offer = offers[index];
    if (!offer) return;
    if (offer.slotIndex < 0) return;
    if (hud.gold < offer.price) return;
    playSfx('ui_click');
    buyForgeShopOffer(index);
  };

  const onReroll = () => {
    if (hud.gold < rerollCost) return;
    playSfx('ui_click');
    rerollForgeShopOffers();
  };

  const onDone = () => {
    playSfx('ui_click');
    forgeShopDone();
  };

  const onSkip = () => {
    playSfx('ui_click');
    forgeShopSkipForHeal();
  };

  const onExpand = (slotIndex: number) => {
    if (hud.gold < slotExpandCost) return;
    playSfx('ui_click');
    expandSlotCap(slotIndex);
  };

  return (
    <div className="overlay upgrade-overlay upgrade-v2">
      <div className="menu-vignette" aria-hidden />
      <div className="menu-scanlines" aria-hidden />

      <div className="upgrade-panel-v2 pixel-text">
        <span className="panel-corner pc-tl" aria-hidden />
        <span className="panel-corner pc-tr" aria-hidden />
        <span className="panel-corner pc-bl" aria-hidden />
        <span className="panel-corner pc-br" aria-hidden />

        <div className="panel-kicker">
          <span className="chev">▸</span>
          <span>WAVE {String(hud.wave).padStart(2, '0')} · FORGE</span>
          <span className="chev">◂</span>
        </div>

        <h2 className="panel-title-v2" aria-label="FORGE">
          <span className="pt-shadow" aria-hidden>FORGE</span>
          <span className="pt-main">FORGE</span>
        </h2>

        <div className="tagline-ribbon upg-ribbon">
          <span className="tr-bracket">[</span>
          <span className="tr-track">ETCH YOUR DICE · SHAPE THE ROLL</span>
          <span className="tr-bracket">]</span>
        </div>

        <div className="upg-picks-row">
          <span className="sh-line" />
          <span className="upg-picks-label">
            GOLD · <span className="gold-amount">{hud.gold}</span>
          </span>
          <span className="sh-line" />
        </div>

        <div className="upgrade-cards-v2">
          {offers.map((o, i) => {
            const up = getFaceUpgrade(o.id);
            if (!up) return null;
            const canAfford = hud.gold >= o.price;
            const slotOk = o.slotIndex >= 0;
            const disabled = !canAfford || !slotOk;
            const tierLabel = o.nextTier === 5 ? 'T5 EVOLVE' : `T${o.nextTier}`;
            return (
              <button
                key={`${o.id}-${i}`}
                className={`upg-card-v2 rarity-${up.rarity} ${disabled ? 'is-disabled' : ''}`}
                onClick={() => onBuy(i)}
                disabled={disabled}
                style={{ ['--card-accent' as string]: RARITY_COLORS[up.rarity] }}
              >
                <span className="card-corner cc-tl" aria-hidden />
                <span className="card-corner cc-tr" aria-hidden />
                <span className="card-corner cc-bl" aria-hidden />
                <span className="card-corner cc-br" aria-hidden />

                <div className="upg-card-head">
                  <span className="upg-rarity">
                    {up.rarity.toUpperCase()} · {tierLabel}
                  </span>
                  <span className="upg-cat">{up.kind}</span>
                </div>
                <div className="upg-card-name">{up.name}</div>
                <div className="upg-card-desc">
                  {o.nextTier === 5 && up.evolution
                    ? `${up.evolution.name}: ${up.evolution.flavor ?? up.description}`
                    : up.description}
                </div>
                <div className="upg-card-foot" aria-hidden>
                  <span className="chev">▸</span>
                  <span className="foot-label">
                    {slotOk ? `${o.price}G · SLOT ${o.slotIndex + 1}` : 'NO SLOT'}
                  </span>
                  <span className="chev">◂</span>
                </div>
              </button>
            );
          })}
        </div>

        {run && (
          <div className="shop-slots" style={{ marginTop: 12 }}>
            <div className="upg-picks-row">
              <span className="sh-line" />
              <span className="upg-picks-label">SLOT CAPS</span>
              <span className="sh-line" />
            </div>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginTop: 6 }}>
              {run.slotLayout.map((s) => {
                const canExpand = s.supplementCap < BALANCE.slot.supplementsMax && hud.gold >= slotExpandCost;
                return (
                  <button
                    key={s.index}
                    className="upg-card-v2"
                    style={{ padding: '6px 10px', minWidth: 0, fontSize: 10 }}
                    onClick={() => onExpand(s.index)}
                    disabled={!canExpand}
                    title={`Slot ${s.index + 1}: ${s.supplementIds.length}/${s.supplementCap}`}
                  >
                    S{s.index + 1} {s.supplementIds.length}/{s.supplementCap}
                    {s.supplementCap < BALANCE.slot.supplementsMax && (
                      <span style={{ marginLeft: 4, opacity: 0.7 }}>+{slotExpandCost}G</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="upg-footer" style={{ marginTop: 14, display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button
            className="upg-card-v2"
            style={{ padding: '8px 14px', minWidth: 0 }}
            onClick={onReroll}
            disabled={hud.gold < rerollCost}
          >
            REROLL · {rerollCost}G
          </button>
          <button
            className="upg-card-v2"
            style={{ padding: '8px 14px', minWidth: 0 }}
            onClick={onSkip}
          >
            SKIP · HEAL
          </button>
          <button
            className="upg-card-v2"
            style={{ padding: '8px 14px', minWidth: 0 }}
            onClick={onDone}
          >
            LEAVE
          </button>
        </div>
      </div>
    </div>
  );
}
