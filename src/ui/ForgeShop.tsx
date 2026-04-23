import { useCallback, useEffect, useRef, useState } from 'react';
import { useStore, getRunState } from '../state/store';
import {
  rerollForgeShopOffers,
  forgeShopDone,
  forgeShopSkipForHeal,
  expandSlotCap,
  canPlaceOfferInSlot,
  placeForgeOfferInSlot,
  sellFromSlot,
  forgeSellValue,
  canMoveReplacer,
  canMoveSupplement,
  moveOrSwapReplacer,
  moveOrSwapSupplement,
} from '../engine/engine';
import { getFaceUpgrade } from '../content/upgrades/faceRegistry';
import { getFaceName } from '../content/upgrades/faceNames';
import { getCharacter } from '../content/characters/registry';
import { playSfx } from '../audio/sfx';
import { BALANCE } from '../config/balance';
import type { Rarity, RunState } from '../types';
import type { FaceUpgrade } from '../content/upgrades/types';
import type { ForgeShopOffer } from '../state/store';

const RARITY_COLORS: Record<Rarity, string> = {
  common: 'var(--common)',
  rare: 'var(--rare)',
  epic: 'var(--epic)',
  legendary: 'var(--legendary)',
};

type DragSource =
  | { kind: 'offer'; offerIndex: number; offer: ForgeShopOffer }
  | { kind: 'slot-replacer'; slotIndex: number; upgradeId: string }
  | { kind: 'slot-supplement'; slotIndex: number; pos: number; upgradeId: string };

interface DragState {
  source: DragSource;
  pointerId: number;
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
  label: string;
  rarity: Rarity;
  hoverDrop: string | null;
}

interface SellConfirm {
  source: DragSource;
  refund: number;
  name: string;
}

interface DetailsView {
  upgrade: FaceUpgrade;
  displayName: string;
  currentTier: number | null;
  nextTier: number | null;
  price: number | null;
  isDefault: boolean;
  isOffer: boolean;
}

const DRAG_THRESHOLD = 4;

const KIND_GLYPH: Record<'replacer' | 'supplement' | 'default', string> = {
  replacer: '◆',
  supplement: '+',
  default: '◇',
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
  const skipHealCost = BALANCE.shop.skipHealCost(hud.wave);
  const slotExpandCost = BALANCE.shop.slotExpandCost(hud.wave);
  const purchased = useStore((s) => s.forgeShopPurchased);
  const character = run ? getCharacter(run.characterId) : null;

  const [drag, setDrag] = useState<DragState | null>(null);
  const dragRef = useRef<DragState | null>(null);
  dragRef.current = drag;

  const pendingDragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    init: Omit<DragState, 'x' | 'y' | 'hoverDrop'>;
  } | null>(null);

  const [sellConfirm, setSellConfirm] = useState<SellConfirm | null>(null);
  const [details, setDetails] = useState<DetailsView | null>(null);

  const openDetails = useCallback((view: DetailsView) => {
    playSfx('ui_click');
    setDetails(view);
  }, []);
  const closeDetails = useCallback(() => {
    playSfx('ui_click');
    setDetails(null);
  }, []);

  useEffect(() => {
    if (!details) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDetails(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [details]);

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
    if (purchased) return;
    if (hud.gold < skipHealCost) return;
    playSfx('ui_click');
    forgeShopSkipForHeal();
  };

  const onExpand = (slotIndex: number) => {
    if (hud.gold < slotExpandCost) return;
    playSfx('ui_click');
    expandSlotCap(slotIndex);
  };

  const offerTapShortcut = useCallback(
    (index: number) => {
      const offer = offers[index];
      if (!offer || !run) return;
      // Try the pre-computed preferred slot first; fall back to the first valid slot.
      const prefer = offer.slotIndex;
      const candidates: number[] = [];
      if (prefer >= 0) candidates.push(prefer);
      for (let i = 0; i < run.slotLayout.length; i++) {
        if (!candidates.includes(i)) candidates.push(i);
      }
      for (const i of candidates) {
        if (hud.gold < offer.price) return;
        if (canPlaceOfferInSlot(run, offer, i)) {
          if (placeForgeOfferInSlot(index, i)) return;
        }
      }
    },
    [offers, run, hud.gold],
  );

  const findDropTarget = (x: number, y: number): string | null => {
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    if (!el) return null;
    const t = el.closest<HTMLElement>('[data-drop]');
    return t?.dataset.drop ?? null;
  };

  const handlePointerMove = useCallback((ev: PointerEvent) => {
    const pending = pendingDragRef.current;
    const current = dragRef.current;
    if (pending && !current) {
      if (ev.pointerId !== pending.pointerId) return;
      const dx = ev.clientX - pending.startX;
      const dy = ev.clientY - pending.startY;
      if (dx * dx + dy * dy < DRAG_THRESHOLD * DRAG_THRESHOLD) return;
      // Commit drag.
      const init = pending.init;
      const next: DragState = {
        ...init,
        x: ev.clientX,
        y: ev.clientY,
        hoverDrop: findDropTarget(ev.clientX, ev.clientY),
      };
      setDrag(next);
      dragRef.current = next;
      return;
    }
    if (!current || ev.pointerId !== current.pointerId) return;
    ev.preventDefault();
    const hover = findDropTarget(ev.clientX, ev.clientY);
    const next: DragState = {
      ...current,
      x: ev.clientX,
      y: ev.clientY,
      hoverDrop: hover,
    };
    setDrag(next);
    dragRef.current = next;
  }, []);

  const handlePointerUp = useCallback(
    (ev: PointerEvent) => {
      const pending = pendingDragRef.current;
      const current = dragRef.current;

      if (pending && !current && ev.pointerId === pending.pointerId) {
        // No drag movement: treat as tap.
        if (pending.init.source.kind === 'offer') {
          playSfx('ui_click');
          offerTapShortcut(pending.init.source.offerIndex);
        }
        pendingDragRef.current = null;
        return;
      }

      if (!current || ev.pointerId !== current.pointerId) return;

      const hoverKey = findDropTarget(ev.clientX, ev.clientY);
      const source = current.source;

      // Clear drag state first.
      setDrag(null);
      dragRef.current = null;
      pendingDragRef.current = null;

      if (!hoverKey) return;

      const slotMatch = /^slot-(\d+)$/.exec(hoverKey);
      if (slotMatch) {
        const slotIndex = parseInt(slotMatch[1]!, 10);
        const run2 = getRunState();
        if (!run2) return;

        if (source.kind === 'offer') {
          if (hud.gold < source.offer.price) {
            playSfx('ui_click');
            return;
          }
          if (!canPlaceOfferInSlot(run2, source.offer, slotIndex)) {
            playSfx('ui_click');
            return;
          }
          placeForgeOfferInSlot(source.offerIndex, slotIndex);
          return;
        }

        if (source.kind === 'slot-replacer') {
          if (source.slotIndex === slotIndex) return;
          if (!canMoveReplacer(run2, source.slotIndex, slotIndex)) {
            playSfx('ui_click');
            return;
          }
          moveOrSwapReplacer(source.slotIndex, slotIndex);
          return;
        }

        if (source.kind === 'slot-supplement') {
          if (source.slotIndex === slotIndex) return;
          if (!canMoveSupplement(run2, source.slotIndex, source.pos, slotIndex)) {
            playSfx('ui_click');
            return;
          }
          moveOrSwapSupplement(source.slotIndex, source.pos, slotIndex);
          return;
        }
      }

      if (hoverKey === 'sell') {
        const run2 = getRunState();
        if (!run2) return;
        if (source.kind === 'offer') return;
        const kind: 'replacer' | 'supplement' =
          source.kind === 'slot-replacer' ? 'replacer' : 'supplement';
        const pos = source.kind === 'slot-supplement' ? source.pos : 0;
        const refund = forgeSellValue(run2, source.slotIndex, kind, pos);
        if (refund <= 0) {
          playSfx('ui_click');
          return;
        }
        const up = getFaceUpgrade(source.upgradeId);
        setSellConfirm({
          source,
          refund,
          name: up
            ? getFaceName(up.id, run2.characterId, up.name)
            : 'UPGRADE',
        });
      }
    },
    [hud.gold, offerTapShortcut],
  );

  useEffect(() => {
    const onMove = (e: PointerEvent) => handlePointerMove(e);
    const onUp = (e: PointerEvent) => handlePointerUp(e);
    const onCancel = (e: PointerEvent) => {
      if (dragRef.current && e.pointerId === dragRef.current.pointerId) {
        setDrag(null);
        dragRef.current = null;
      }
      if (pendingDragRef.current && e.pointerId === pendingDragRef.current.pointerId) {
        pendingDragRef.current = null;
      }
    };
    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
    };
  }, [handlePointerMove, handlePointerUp]);

  const beginDrag = (
    e: React.PointerEvent<HTMLElement>,
    source: DragSource,
    label: string,
    rarity: Rarity,
  ) => {
    if (e.button !== undefined && e.button !== 0) return;
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    pendingDragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      init: {
        source,
        pointerId: e.pointerId,
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top,
        width: rect.width,
        height: rect.height,
        label,
        rarity,
      },
    };
  };

  const cancelSell = () => {
    playSfx('ui_click');
    setSellConfirm(null);
  };

  const confirmSell = () => {
    if (!sellConfirm) return;
    const { source } = sellConfirm;
    const kind: 'replacer' | 'supplement' =
      source.kind === 'slot-replacer' ? 'replacer' : 'supplement';
    const pos = source.kind === 'slot-supplement' ? source.pos : 0;
    if (source.kind === 'offer') return;
    const refunded = sellFromSlot(source.slotIndex, kind, pos);
    if (refunded > 0) playSfx('upgrade_pick');
    setSellConfirm(null);
  };

  const dragging = drag !== null;
  const draggingSource = drag?.source.kind ?? null;

  return (
    <div
      className="overlay upgrade-overlay upgrade-v2 forge-v3"
      style={{
        touchAction: dragging ? 'none' : undefined,
        userSelect: dragging ? 'none' : undefined,
      }}
    >
      <div className="menu-vignette" aria-hidden />
      <div className="menu-scanlines" aria-hidden />

      <div className="upgrade-panel-v2 pixel-text forge-panel">
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

        <div className="upg-picks-row">
          <span className="sh-line" />
          <span className="upg-picks-label">
            GOLD · <span className="gold-amount">{hud.gold}</span>
          </span>
          <span className="sh-line" />
        </div>

        <div className="forge-body">
          <div className="forge-body-col">
            <div className="forge-section-label">OFFERS</div>
            <div className="forge-offers-row">
              {offers.length === 0 && (
                <div className="forge-empty">— NO OFFERS —</div>
              )}
              {offers.map((o, i) => {
                const up = getFaceUpgrade(o.id);
                if (!up) return null;
                const canAfford = hud.gold >= o.price;
                const disabled = !canAfford;
                const tierLabel = o.nextTier === 5 ? 'T5★' : `T${o.nextTier}`;
                const isDraggingThis =
                  drag?.source.kind === 'offer' && drag.source.offerIndex === i;
                const displayName = getFaceName(up.id, character?.id, up.name);
                const kindGlyph = KIND_GLYPH[up.kind];
                return (
                  <div
                    key={`${o.id}-${i}`}
                    role="button"
                    aria-label={`OFFER ${displayName} — ${up.rarity} T${o.nextTier} — ${o.price}G — ${up.description}`}
                    className={`upg-card-v2 forge-offer forge-offer-compact rarity-${up.rarity} ${
                      disabled ? 'is-disabled' : ''
                    } ${isDraggingThis ? 'is-dragging' : ''}`}
                    onPointerDown={(e) => {
                      if (disabled) return;
                      beginDrag(
                        e,
                        { kind: 'offer', offerIndex: i, offer: o },
                        displayName,
                        up.rarity,
                      );
                    }}
                    style={{ ['--card-accent' as string]: RARITY_COLORS[up.rarity] }}
                    aria-disabled={disabled}
                  >
                    <span className="card-corner cc-tl" aria-hidden />
                    <span className="card-corner cc-tr" aria-hidden />
                    <span className="card-corner cc-bl" aria-hidden />
                    <span className="card-corner cc-br" aria-hidden />

                    <button
                      type="button"
                      className="forge-info-btn"
                      aria-label={`Details for ${displayName}`}
                      title={`Details · ${displayName}`}
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        openDetails({
                          upgrade: up,
                          displayName,
                          currentTier: o.nextTier - 1,
                          nextTier: o.nextTier,
                          price: o.price,
                          isDefault: false,
                          isOffer: true,
                        });
                      }}
                    >
                      i
                    </button>

                    <div className="forge-offer-row-top">
                      <span
                        className="forge-kind-icon"
                        aria-label={up.kind}
                        title={up.kind.toUpperCase()}
                      >
                        {kindGlyph}
                      </span>
                      <span className="forge-offer-tier">{tierLabel}</span>
                    </div>
                    <div className="upg-card-name">{displayName}</div>
                    <div className="forge-offer-row-bot" aria-hidden>
                      <span className="forge-offer-price">
                        <span className="gold-amount">{o.price}</span>G
                      </span>
                      {o.slotIndex >= 0 && (
                        <span
                          className="forge-offer-slot-hint"
                          title={`Tap to place in face ${o.slotIndex + 1}`}
                        >
                          →{o.slotIndex + 1}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {run && character && (
            <div className="forge-body-col">
              <div className="forge-section-label">DICE</div>
              <div className="forge-slots-grid">
                {run.slotLayout.map((slot) => {
                  let canDrop = false;
                  if (drag) {
                    const src = drag.source;
                    if (src.kind === 'offer') {
                      canDrop =
                        canPlaceOfferInSlot(run, src.offer, slot.index) &&
                        hud.gold >= src.offer.price;
                    } else if (src.kind === 'slot-replacer') {
                      canDrop = canMoveReplacer(run, src.slotIndex, slot.index);
                    } else if (src.kind === 'slot-supplement') {
                      canDrop = canMoveSupplement(
                        run,
                        src.slotIndex,
                        src.pos,
                        slot.index,
                      );
                    }
                  }
                  return (
                    <SlotTile
                      key={slot.index}
                      run={run}
                      slot={slot}
                      drag={drag}
                      dragCanDropHere={canDrop}
                      beginDrag={beginDrag}
                      expandCost={slotExpandCost}
                      gold={hud.gold}
                      onExpand={onExpand}
                      onOpenDetails={openDetails}
                    />
                  );
                })}
              </div>

              <SellZone
                active={
                  draggingSource === 'slot-replacer' ||
                  draggingSource === 'slot-supplement'
                }
                hovered={drag?.hoverDrop === 'sell'}
              />
            </div>
          )}
        </div>

        <div
          className="upg-footer forge-footer"
          style={{ marginTop: 4, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <button
            className="upg-card-v2 forge-action-btn"
            onClick={onReroll}
            disabled={hud.gold < rerollCost}
            title={`Reroll offers · ${rerollCost}G`}
            aria-label={`Reroll · ${rerollCost} gold`}
          >
            <span className="fab-icon" aria-hidden>↻</span>
            <span className="fab-price">{rerollCost}G</span>
          </button>
          <button
            className="upg-card-v2 forge-action-btn"
            onClick={onSkip}
            disabled={purchased || hud.gold < skipHealCost}
            title={
              purchased
                ? 'Cannot skip for heal after purchasing'
                : hud.gold < skipHealCost
                  ? `Need ${skipHealCost}G`
                  : `Skip shop and restore HP · ${skipHealCost}G`
            }
            aria-label={`Heal and skip · ${skipHealCost} gold`}
          >
            <span className="fab-icon" aria-hidden>♥</span>
            <span className="fab-price">{skipHealCost}G</span>
          </button>
          <button
            className="upg-card-v2 forge-action-btn forge-action-done"
            onClick={onDone}
            aria-label="Done"
            title="Leave forge"
          >
            <span className="fab-icon" aria-hidden>✓</span>
            <span className="fab-price">DONE</span>
          </button>
        </div>
      </div>

      {drag && (
        <div
          className="forge-drag-ghost pixel-text"
          style={{
            left: drag.x - drag.offsetX,
            top: drag.y - drag.offsetY,
            width: Math.max(120, Math.min(260, drag.width)),
            ['--card-accent' as string]: RARITY_COLORS[drag.rarity],
          }}
          aria-hidden
        >
          <span className="ghost-label">{drag.label}</span>
          <span className="ghost-hint">
            {drag.source.kind === 'offer'
              ? 'DROP ON A FACE'
              : 'DROP ON FACE · OR SELL'}
          </span>
        </div>
      )}

      {details && (
        <div
          className="overlay forge-details-modal"
          role="dialog"
          aria-modal="true"
          onClick={closeDetails}
        >
          <div
            className="forge-details-panel pixel-text"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="forge-details-close"
              aria-label="Close details"
              onClick={closeDetails}
            >
              ✕
            </button>

            <div className="panel-kicker">
              <span className="chev">▸</span>
              <span>
                {details.upgrade.rarity.toUpperCase()}
                {details.isDefault ? ' · DEFAULT' : ''}
                {' · '}
                {details.upgrade.kind === 'replacer' ? 'REPLACER' : 'SUPPLEMENT'}
              </span>
              <span className="chev">◂</span>
            </div>

            <div
              className="fdp-name"
              style={{ ['--card-accent' as string]: RARITY_COLORS[details.upgrade.rarity] }}
            >
              {details.displayName}
            </div>

            {(details.currentTier !== null || details.nextTier !== null) && (
              <div className="fdp-tier-row">
                {details.currentTier !== null && details.currentTier > 0 && (
                  <span className="fdp-tier-chip">
                    OWNED · T{details.currentTier}
                  </span>
                )}
                {details.nextTier !== null && (
                  <span className="fdp-tier-chip fdp-tier-next">
                    {details.nextTier === 5 ? 'T5 · EVOLVE' : `NEXT · T${details.nextTier}`}
                  </span>
                )}
              </div>
            )}

            <div className="fdp-desc">{details.upgrade.description}</div>

            {details.nextTier === 5 && details.upgrade.evolution && (
              <div className="fdp-evolution">
                <div className="fdp-evo-head">
                  ★ {details.upgrade.evolution.name}
                </div>
                <div className="fdp-evo-flavor">
                  {details.upgrade.evolution.flavor ?? details.upgrade.description}
                </div>
              </div>
            )}

            {details.price !== null && (
              <div className="fdp-price-row">
                PRICE · <span className="gold-amount">{details.price}G</span>
              </div>
            )}

            <div className="fdp-hint">
              {details.isOffer
                ? 'TAP CARD TO BUY · DRAG TO PLACE'
                : details.isDefault
                  ? 'DEFAULT FACE — CANNOT BE SOLD'
                  : 'DRAG TO MOVE · DROP ON ✕ TO SELL'}
            </div>
          </div>
        </div>
      )}

      {sellConfirm && (
        <div className="overlay forge-sell-confirm" role="dialog" aria-modal="true">
          <div className="forge-sell-panel pixel-text">
            <div className="panel-kicker">
              <span className="chev">▸</span>
              <span>CONFIRM SELL</span>
              <span className="chev">◂</span>
            </div>
            <div className="fsp-name">{sellConfirm.name}</div>
            <div className="fsp-refund">
              REFUND · <span className="gold-amount">{sellConfirm.refund}G</span>
            </div>
            <div className="fsp-warn">THIS CANNOT BE UNDONE</div>
            <div className="fsp-buttons">
              <button className="upg-card-v2" onClick={cancelSell}>
                CANCEL
              </button>
              <button
                className="upg-card-v2fsp-confirm"
                style={{ ['--card-accent' as string]: 'var(--danger)' }}
                onClick={confirmSell}
              >
                SELL · {sellConfirm.refund}G
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface SlotTileProps {
  run: RunState;
  slot: import('../content/upgrades/types').SlotState;
  drag: DragState | null;
  dragCanDropHere: boolean;
  beginDrag: (
    e: React.PointerEvent<HTMLElement>,
    source: DragSource,
    label: string,
    rarity: Rarity,
  ) => void;
  expandCost: number;
  gold: number;
  onExpand: (slotIndex: number) => void;
  onOpenDetails: (view: DetailsView) => void;
}

function SlotTile({
  run,
  slot,
  drag,
  dragCanDropHere,
  beginDrag,
  expandCost,
  gold,
  onExpand,
  onOpenDetails,
}: SlotTileProps) {
  const character = getCharacter(run.characterId);
  const defaults = character?.defaultFaces ?? [];
  const defaultId = defaults[slot.index]?.upgradeId ?? null;
  const replacerUp = slot.replacerId ? getFaceUpgrade(slot.replacerId) : null;
  const isDefaultReplacer = slot.replacerId !== null && slot.replacerId === defaultId;
  const isHovered = drag?.hoverDrop === `slot-${slot.index}`;
  const isSourceSlot =
    (drag?.source.kind === 'slot-replacer' &&
      drag.source.slotIndex === slot.index) ||
    (drag?.source.kind === 'slot-supplement' &&
      drag.source.slotIndex === slot.index);

  const dropClass = drag
    ? isSourceSlot
      ? 'drop-source'
      : isHovered
        ? dragCanDropHere
          ? 'drop-hover-ok'
          : 'drop-hover-bad'
        : dragCanDropHere
          ? 'drop-valid'
          : ''
    : '';

  const supplementCap = slot.supplementCap;
  const isMax = supplementCap >= BALANCE.slot.supplementsMax;
  const canExpand = !isMax && gold >= expandCost;

  const usedSup = slot.supplementIds.length;

  return (
    <div
      role="region"
      aria-label={`FACE ${slot.index + 1}`}
      className={`forge-slot ${dropClass}`}
      data-drop={`slot-${slot.index}`}
    >
      <div className="forge-slot-head">
        <span className="forge-slot-face">{slot.index + 1}</span>
        <span
          className="forge-slot-pips"
          aria-label={`${usedSup} of ${supplementCap} supplements used`}
          title={`Supplements ${usedSup}/${supplementCap}`}
        >
          {Array.from({ length: supplementCap }).map((_, i) => (
            <span
              key={i}
              className={`forge-pip ${i < usedSup ? 'is-filled' : ''}`}
              aria-hidden
            />
          ))}
        </span>
      </div>

      <div className="forge-slot-replacer">
        {replacerUp ? (
          <div
            className={`forge-chip rarity-${replacerUp.rarity} ${
              isDefaultReplacer ? 'is-default' : ''
            } ${
              drag?.source.kind === 'slot-replacer' &&
              drag.source.slotIndex === slot.index
                ? 'is-dragging'
                : ''
            }`}
            style={{ ['--card-accent' as string]: RARITY_COLORS[replacerUp.rarity] }}
            onPointerDown={(e) => {
              if (isDefaultReplacer) return; // can't sell default
              beginDrag(
                e,
                {
                  kind: 'slot-replacer',
                  slotIndex: slot.index,
                  upgradeId: replacerUp.id,
                },
                getFaceName(replacerUp.id, character?.id, replacerUp.name),
                replacerUp.rarity,
              );
            }}
            title={
              isDefaultReplacer
                ? `Default · ${replacerUp.description}`
                : `${replacerUp.description} · drag to sell`
            }
          >
            <span
              className="chip-kind-icon"
              aria-hidden
              title={isDefaultReplacer ? 'Default' : 'Replacer'}
            >
              {isDefaultReplacer ? KIND_GLYPH.default : KIND_GLYPH.replacer}
            </span>
            <span className="chip-name">
              {getFaceName(replacerUp.id, character?.id, replacerUp.name)}
            </span>
            <span className="chip-tier">T{run.ownedFaceUpgrades[replacerUp.id] ?? 1}</span>
            <button
              type="button"
              className="forge-info-btn chip-info"
              aria-label={`Details for ${getFaceName(replacerUp.id, character?.id, replacerUp.name)}`}
              title="Details"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetails({
                  upgrade: replacerUp,
                  displayName: getFaceName(replacerUp.id, character?.id, replacerUp.name),
                  currentTier: run.ownedFaceUpgrades[replacerUp.id] ?? 1,
                  nextTier: null,
                  price: null,
                  isDefault: isDefaultReplacer,
                  isOffer: false,
                });
              }}
            >
              i
            </button>
          </div>
        ) : (
          <div className="forge-chip is-empty">
            <span className="chip-kind-icon" aria-hidden>{KIND_GLYPH.replacer}</span>
            <span className="chip-name">— EMPTY —</span>
          </div>
        )}
      </div>

      <div className="forge-slot-supplements">
        {Array.from({ length: supplementCap }).map((_, i) => {
          const id = slot.supplementIds[i];
          const up = id ? getFaceUpgrade(id) : null;
          if (!up) {
            return (
              <div key={i} className="forge-chip is-empty is-sub">
                <span className="chip-kind-icon" aria-hidden>{KIND_GLYPH.supplement}</span>
                <span className="chip-name">—</span>
              </div>
            );
          }
          const isDragging =
            drag?.source.kind === 'slot-supplement' &&
            drag.source.slotIndex === slot.index &&
            drag.source.pos === i;
          return (
            <div
              key={`${id}-${i}`}
              className={`forge-chip is-sub rarity-${up.rarity} ${
                isDragging ? 'is-dragging' : ''
              }`}
              style={{ ['--card-accent' as string]: RARITY_COLORS[up.rarity] }}
              onPointerDown={(e) => {
                beginDrag(
                  e,
                  {
                    kind: 'slot-supplement',
                    slotIndex: slot.index,
                    pos: i,
                    upgradeId: up.id,
                  },
                  up.name,
                  up.rarity,
                );
              }}
              title={`${up.description} · drag to sell`}
            >
              <span className="chip-kind-icon" aria-hidden title="Supplement">
                {KIND_GLYPH.supplement}
              </span>
              <span className="chip-name">{up.name}</span>
              <span className="chip-tier">T{run.ownedFaceUpgrades[up.id] ?? 1}</span>
              <button
                type="button"
                className="forge-info-btn chip-info"
                aria-label={`Details for ${up.name}`}
                title="Details"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDetails({
                    upgrade: up,
                    displayName: up.name,
                    currentTier: run.ownedFaceUpgrades[up.id] ?? 1,
                    nextTier: null,
                    price: null,
                    isDefault: false,
                    isOffer: false,
                  });
                }}
              >
                i
              </button>
            </div>
          );
        })}
      </div>

      <button
        className="forge-slot-expand"
        onClick={() => onExpand(slot.index)}
        disabled={!canExpand}
        title={
          isMax
            ? 'Supplement cap is max'
            : `Expand supplement cap · ${expandCost}G`
        }
        aria-label={isMax ? 'Supplement cap max' : `Expand cap · ${expandCost} gold`}
      >
        {isMax ? 'MAX' : `+ ${expandCost}G`}
      </button>
    </div>
  );
}

function SellZone({ active, hovered }: { active: boolean; hovered: boolean }) {
  return (
    <div
      className={`forge-sell-zone ${active ? 'is-active' : ''} ${
        hovered ? 'is-hover' : ''
      }`}
      data-drop="sell"
      title="Drop here to sell for 50% refund"
    >
      <span className="sell-icon" aria-hidden>✕</span>
      <span className="sell-label">SELL · -50%</span>
    </div>
  );
}
