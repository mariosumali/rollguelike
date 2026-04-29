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
  buyForgeBaubleOffer,
  buyForgeRelicOffer,
} from '../engine/engine';
import { getFaceUpgrade } from '../content/upgrades/faceRegistry';
import { getUpgrade } from '../content/upgrades/registry';
import { getFaceName } from '../content/upgrades/faceNames';
import { getFaceIconRows, getFaceIconCacheKey } from '../content/upgrades/faceIcons';
import { getCharacter } from '../content/characters/registry';
import { buildFaceIconCanvas } from '../sprites/dice';
import { playSfx } from '../audio/sfx';
import { BALANCE } from '../config/balance';
import { BaubleIcon, RelicIcon } from './RelicIcon';
import type { Rarity, RunState } from '../types';
import type { FaceUpgrade, SlotState } from '../content/upgrades/types';
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
  offerLabel: string | null;
  replacesName: string | null;
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

function FaceIcon({
  upgradeId,
  characterId,
  size = 36,
}: {
  upgradeId: string | null;
  characterId: string | null;
  size?: number;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, c.width, c.height);
    if (!upgradeId) return;
    const up = getFaceUpgrade(upgradeId);
    const rows = getFaceIconRows(upgradeId, up?.icon, characterId);
    if (!rows) return;
    const src = buildFaceIconCanvas(rows, getFaceIconCacheKey(upgradeId, characterId));
    if (!src) return;
    const scale = Math.max(
      1,
      Math.floor(Math.min(c.width / src.width, c.height / src.height)),
    );
    const drawW = src.width * scale;
    const drawH = src.height * scale;
    const dx = Math.round((c.width - drawW) / 2);
    const dy = Math.round((c.height - drawH) / 2);
    ctx.drawImage(src, 0, 0, src.width, src.height, dx, dy, drawW, drawH);
  }, [upgradeId, characterId]);

  return (
    <canvas
      ref={ref}
      width={size}
      height={size}
      className="forge-face-icon"
      aria-hidden
    />
  );
}

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
  const [selectedFace, setSelectedFace] = useState<number | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const warningTimeoutRef = useRef<number | null>(null);
  const suppressClickUntilRef = useRef<number>(0);

  const showWarning = useCallback((msg: string) => {
    playSfx('ui_click');
    setWarning(msg);
    if (warningTimeoutRef.current !== null) {
      window.clearTimeout(warningTimeoutRef.current);
    }
    warningTimeoutRef.current = window.setTimeout(() => {
      setWarning(null);
      warningTimeoutRef.current = null;
    }, 2200);
  }, []);

  useEffect(() => {
    return () => {
      if (warningTimeoutRef.current !== null) {
        window.clearTimeout(warningTimeoutRef.current);
      }
    };
  }, []);

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

  const findEmptySlotForOffer = useCallback((runState: RunState, offer: ForgeShopOffer): number => {
    const upgrade = getFaceUpgrade(offer.id);
    if (!upgrade || upgrade.kind !== 'replacer' || upgrade.upgradesFrom) return -1;
    const preferredSlot = runState.slotLayout[offer.slotIndex];
    if (
      preferredSlot?.replacerId === null &&
      canPlaceOfferInSlot(runState, offer, preferredSlot.index)
    ) {
      return preferredSlot.index;
    }
    const slot = runState.slotLayout.find(
      (candidate) =>
        // Auto-place is intentionally limited to baseline slots; replacing a forge face still needs a drag.
        candidate.replacerId === null &&
        canPlaceOfferInSlot(runState, offer, candidate.index),
    );
    return slot?.index ?? -1;
  }, []);

  const placeOfferInEmptySlot = useCallback(
    (offerIndex: number, offer: ForgeShopOffer) => {
      if (hud.gold < offer.price) {
        showWarning(`NEED ${offer.price}G`);
        return;
      }
      const runState = getRunState();
      if (!runState) return;
      const slotIndex = findEmptySlotForOffer(runState, offer);
      if (slotIndex < 0) {
        showWarning('DRAG ONTO A FACE TO PLACE');
        return;
      }
      if (!placeForgeOfferInSlot(offerIndex, slotIndex)) {
        showWarning(`FACE ${slotIndex + 1} CAN'T HOST THIS`);
        return;
      }
      setSelectedFace(slotIndex);
    },
    [findEmptySlotForOffer, hud.gold, showWarning],
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
        const source = pending.init.source;
        pendingDragRef.current = null;
        if (source.kind === 'offer') {
          placeOfferInEmptySlot(source.offerIndex, source.offer);
        }
        return;
      }

      if (!current || ev.pointerId !== current.pointerId) return;

      const hoverKey = findDropTarget(ev.clientX, ev.clientY);
      const source = current.source;

      // Clear drag state first, and suppress the trailing click on whichever
      // element the drop landed on (prevents face-tile selection from toggling
      // as a side effect of a drop).
      suppressClickUntilRef.current = Date.now() + 200;
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
            showWarning(`NEED ${source.offer.price}G`);
            return;
          }
          const up = getFaceUpgrade(source.offer.id);
          const targetSlot = run2.slotLayout[slotIndex];
          if (up?.kind === 'supplement' && targetSlot &&
              targetSlot.supplementIds.length >= targetSlot.supplementCap) {
            showWarning(
              `FACE ${slotIndex + 1} IS FULL · ${targetSlot.supplementIds.length}/${targetSlot.supplementCap}`,
            );
            return;
          }
          if (!canPlaceOfferInSlot(run2, source.offer, slotIndex)) {
            showWarning(`FACE ${slotIndex + 1} CAN'T HOST THIS`);
            return;
          }
          placeForgeOfferInSlot(source.offerIndex, slotIndex);
          setSelectedFace(slotIndex);
          return;
        }

        if (source.kind === 'slot-replacer') {
          if (source.slotIndex === slotIndex) return;
          if (!canMoveReplacer(run2, source.slotIndex, slotIndex)) {
            showWarning(`CAN'T MOVE TO FACE ${slotIndex + 1}`);
            return;
          }
          moveOrSwapReplacer(source.slotIndex, slotIndex);
          setSelectedFace(slotIndex);
          return;
        }

        if (source.kind === 'slot-supplement') {
          if (source.slotIndex === slotIndex) return;
          if (!canMoveSupplement(run2, source.slotIndex, source.pos, slotIndex)) {
            const targetSlot = run2.slotLayout[slotIndex];
            if (targetSlot && targetSlot.supplementIds.length >= targetSlot.supplementCap) {
              showWarning(
                `FACE ${slotIndex + 1} IS FULL · ${targetSlot.supplementIds.length}/${targetSlot.supplementCap}`,
              );
            } else {
              showWarning(`CAN'T MOVE TO FACE ${slotIndex + 1}`);
            }
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
    [hud.gold, placeOfferInEmptySlot, showWarning],
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
          <span>
            WAVE {String(hud.wave).padStart(2, '0')} · FORGE
            {hud.runMutatorShortName ? ` · ${hud.runMutatorShortName}` : ''}
          </span>
          <span className="chev">◂</span>
        </div>

        <h2 className="panel-title-v2" aria-label="FORGE">
          <span className="pt-shadow" aria-hidden>FORGE</span>
          <span className="pt-main">FORGE</span>
        </h2>

        {(hud.roomLine || hud.omenLine) && (
          <div className="tagline-ribbon upg-ribbon forge-room-ribbon">
            <span className="tr-bracket">[</span>
            <span className="tr-track">{hud.omenLine || hud.roomLine}</span>
            <span className="tr-bracket">]</span>
          </div>
        )}

        <div className="upg-picks-row">
          <span className="sh-line" />
          <span className="upg-picks-label">
            GOLD · <span className="gold-amount">{hud.gold}</span>
            {hud.forgeBonusLabel ? ` · ${hud.forgeBonusLabel}` : ''}
            {hud.biomeName ? ` · ${hud.biomeName}` : ''}
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
                if (o.kind === 'relic' || o.kind === 'bauble') {
                  const item = getUpgrade(o.id);
                  if (!item) return null;
                  const isBauble = o.kind === 'bauble';
                  const label = isBauble ? 'BAUBLE' : 'RELIC';
                  const canAfford = hud.gold >= o.price;
                  const disabled = !canAfford || purchased;
                  return (
                    <button
                      key={`${o.id}-${i}`}
                      type="button"
                      aria-label={`${label} ${item.name} — ${item.rarity} — ${o.price}G — ${item.desc}`}
                      className={`upg-card-v2 forge-offer forge-offer-compact forge-offer-relic ${isBauble ? 'forge-offer-bauble' : ''} rarity-${item.rarity} ${
                        disabled ? 'is-disabled' : ''
                      }`}
                      onClick={() => {
                        if (disabled) return;
                        playSfx('ui_click');
                        const bought = isBauble ? buyForgeBaubleOffer(i) : buyForgeRelicOffer(i);
                        if (!bought) showWarning(`NEED ${o.price}G`);
                      }}
                      style={{ ['--card-accent' as string]: RARITY_COLORS[item.rarity] }}
                      disabled={disabled}
                    >
                      <span className="card-corner cc-tl" aria-hidden />
                      <span className="card-corner cc-tr" aria-hidden />
                      <span className="card-corner cc-bl" aria-hidden />
                      <span className="card-corner cc-br" aria-hidden />
                      <div className="forge-offer-row-top">
                        <span className="forge-kind-icon relic-kind-icon" aria-label={label.toLowerCase()} title={label}>
                          {isBauble ? '◈' : '✦'}
                        </span>
                        <span className="forge-offer-tier">{label}</span>
                      </div>
                      <div className="forge-offer-icon forge-relic-icon" aria-hidden>
                        {isBauble ? <BaubleIcon upgrade={item} size={48} /> : <RelicIcon upgrade={item} size={54} />}
                      </div>
                      <div className="upg-card-name">{item.name}</div>
                      <div className="forge-offer-replaces forge-relic-lore">
                        {isBauble ? item.desc : item.lore ?? item.desc}
                      </div>
                      <div className="forge-offer-row-bot" aria-hidden>
                        <span className="forge-offer-price">
                          <span className="gold-amount">{o.price}</span>G
                        </span>
                        <span className="forge-offer-drag-hint" title={`Buy ${label.toLowerCase()}`}>
                          BUY
                        </span>
                      </div>
                    </button>
                  );
                }
                const up = getFaceUpgrade(o.id);
                if (!up) return null;
                const canAfford = hud.gold >= o.price;
                const disabled = !canAfford;
                const predecessor = up.upgradesFrom ? getFaceUpgrade(up.upgradesFrom) : null;
                const predecessorName = predecessor
                  ? getFaceName(predecessor.id, character?.id, predecessor.name)
                  : null;
                const offerLabel = predecessorName ? 'UPGRADE' : 'NEW';
                const isDraggingThis =
                  drag?.source.kind === 'offer' && drag.source.offerIndex === i;
                const displayName = getFaceName(up.id, character?.id, up.name);
                const kindGlyph = KIND_GLYPH[up.kind];
                const isSupplementOffer = up.kind === 'supplement';
                const showForgeIcon =
                  up.kind === 'replacer' || up.kind === 'supplement';
                return (
                  <div
                    key={`${o.id}-${i}`}
                    role="button"
                    aria-label={`OFFER ${
                      isSupplementOffer ? 'SUPPLEMENT · ' : ''
                    }${displayName} — ${up.rarity} — ${o.price}G — ${up.description}`}
                    className={`upg-card-v2 forge-offer forge-offer-compact rarity-${up.rarity} ${
                      isSupplementOffer ? 'forge-offer-supplement' : ''
                    } ${disabled ? 'is-disabled' : ''} ${
                      isDraggingThis ? 'is-dragging' : ''
                    }`}
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
                          offerLabel,
                          replacesName: predecessorName,
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
                        title={
                          isSupplementOffer
                            ? 'SUPPLEMENT (add-on; stacks on a weapon face)'
                            : up.kind.toUpperCase()
                        }
                      >
                        {kindGlyph}
                      </span>
                      <span className="forge-offer-tier">{offerLabel}</span>
                    </div>
                    {showForgeIcon && (
                      <div className="forge-offer-icon" aria-hidden>
                        <FaceIcon
                          upgradeId={up.id}
                          characterId={character?.id ?? null}
                          size={44}
                        />
                      </div>
                    )}
                    {isSupplementOffer && (
                      <div className="forge-offer-role" aria-hidden>
                        SUPPLEMENT
                      </div>
                    )}
                    <div className="upg-card-name">{displayName}</div>
                    {predecessorName && (
                      <div className="forge-offer-replaces">REPLACES {predecessorName}</div>
                    )}
                    <div className="forge-offer-row-bot" aria-hidden>
                      <span className="forge-offer-price">
                        <span className="gold-amount">{o.price}</span>G
                      </span>
                      <span className="forge-offer-drag-hint" title="Click to replace a baseline face, or drag onto a face">
                        TAP
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {run && character && (
            <div className="forge-body-col">
              <div className="forge-section-label">DICE · TAP A FACE</div>
              <div className="forge-dice-grid">
                {run.slotLayout.map((slot) => {
                  let canDrop = false;
                  let dropFull = false;
                  if (drag) {
                    const src = drag.source;
                    if (src.kind === 'offer') {
                      canDrop =
                        canPlaceOfferInSlot(run, src.offer, slot.index) &&
                        hud.gold >= src.offer.price;
                      const up = getFaceUpgrade(src.offer.id);
                      dropFull =
                        up?.kind === 'supplement' &&
                        slot.supplementIds.length >= slot.supplementCap;
                    } else if (src.kind === 'slot-replacer') {
                      canDrop = canMoveReplacer(run, src.slotIndex, slot.index);
                    } else if (src.kind === 'slot-supplement') {
                      canDrop = canMoveSupplement(
                        run,
                        src.slotIndex,
                        src.pos,
                        slot.index,
                      );
                      dropFull =
                        !canDrop &&
                        slot.supplementIds.length >= slot.supplementCap &&
                        src.slotIndex !== slot.index;
                    }
                  }
                  return (
                    <FaceTile
                      key={slot.index}
                      slot={slot}
                      drag={drag}
                      dragCanDropHere={canDrop}
                      dragRejectedFull={dropFull}
                      isSelected={selectedFace === slot.index}
                      onSelect={() => {
                        if (Date.now() < suppressClickUntilRef.current) return;
                        setSelectedFace((prev) =>
                          prev === slot.index ? null : slot.index,
                        );
                      }}
                      characterId={character.id}
                    />
                  );
                })}
              </div>

              {selectedFace !== null && run.slotLayout[selectedFace] && (
                <FaceDetailsPanel
                  run={run}
                  slot={run.slotLayout[selectedFace]!}
                  drag={drag}
                  beginDrag={beginDrag}
                  expandCost={slotExpandCost}
                  gold={hud.gold}
                  onExpand={onExpand}
                  onOpenDetails={openDetails}
                  onClose={() => setSelectedFace(null)}
                />
              )}

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

            {(details.offerLabel || details.replacesName) && (
              <div className="fdp-tier-row">
                {details.offerLabel && (
                  <span className="fdp-tier-chip fdp-tier-next">
                    {details.offerLabel}
                  </span>
                )}
                {details.replacesName && (
                  <span className="fdp-tier-chip">
                    REPLACES · {details.replacesName}
                  </span>
                )}
              </div>
            )}

            <div className="fdp-desc">{details.upgrade.description}</div>

            {details.price !== null && (
              <div className="fdp-price-row">
                PRICE · <span className="gold-amount">{details.price}G</span>
              </div>
            )}

            <div className="fdp-hint">
              {details.isOffer
                ? 'CLICK TO REPLACE A BASELINE FACE · DRAG TO CHOOSE'
                : details.isDefault
                  ? 'DEFAULT FACE — CANNOT BE SOLD'
                  : 'DRAG TO MOVE · DROP ON ✕ TO SELL'}
            </div>
          </div>
        </div>
      )}

      {warning && (
        <div
          className="forge-warning pixel-text"
          role="alert"
          aria-live="polite"
        >
          <span className="forge-warning-icon" aria-hidden>✕</span>
          <span>{warning}</span>
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

interface FaceTileProps {
  slot: SlotState;
  drag: DragState | null;
  dragCanDropHere: boolean;
  dragRejectedFull: boolean;
  isSelected: boolean;
  onSelect: () => void;
  characterId: string | null;
}

function FaceTile({
  slot,
  drag,
  dragCanDropHere,
  dragRejectedFull,
  isSelected,
  onSelect,
  characterId,
}: FaceTileProps) {
  const replacerId = slot.replacerId;
  const replacerUp = replacerId ? getFaceUpgrade(replacerId) : null;
  const baseline = characterId ? getCharacter(characterId)?.defaultFaces?.[slot.index] : undefined;
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

  const rarity = replacerUp?.rarity;
  const accent = rarity ? RARITY_COLORS[rarity] : 'var(--fg-dim)';
  const displayName = replacerUp
    ? getFaceName(replacerUp.id, characterId, replacerUp.name)
    : baseline?.name ?? null;
  const showFullBadge = dragRejectedFull && isHovered;

  return (
    <button
      type="button"
      role="button"
      aria-label={
        displayName
          ? `Face ${slot.index + 1} · ${displayName}${isSelected ? ' · selected' : ''}`
          : `Face ${slot.index + 1}${isSelected ? ' · selected' : ''}`
      }
      aria-pressed={isSelected}
      className={`forge-face-tile ${dropClass} ${isSelected ? 'is-selected' : ''} ${
        replacerUp ? '' : 'is-empty'
      }`}
      style={{ ['--card-accent' as string]: accent }}
      data-drop={`slot-${slot.index}`}
      onClick={(e) => {
        // Guard: ignore click fired as the tail of a drag release.
        if (drag) {
          e.preventDefault();
          return;
        }
        onSelect();
      }}
      title={
        displayName
          ? `${displayName} · tap to view`
          : `Face ${slot.index + 1} · tap to view`
      }
    >
      <span className="forge-face-num" aria-hidden>
        {slot.index + 1}
      </span>
      <span className="forge-face-art" aria-hidden>
        {replacerId ? (
          <FaceIcon upgradeId={replacerId} characterId={characterId} size={40} />
        ) : (
          <span className="forge-face-empty-glyph">◆</span>
        )}
      </span>
      {showFullBadge && (
        <span className="forge-face-badge">FULL</span>
      )}
      {isSelected && (
        <span className="forge-face-caret" aria-hidden>▾</span>
      )}
    </button>
  );
}

interface FaceDetailsPanelProps {
  run: RunState;
  slot: SlotState;
  drag: DragState | null;
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
  onClose: () => void;
}

function FaceDetailsPanel({
  run,
  slot,
  drag,
  beginDrag,
  expandCost,
  gold,
  onExpand,
  onOpenDetails,
  onClose,
}: FaceDetailsPanelProps) {
  const character = getCharacter(run.characterId);
  const baseline = character?.defaultFaces?.[slot.index];
  const replacerUp = slot.replacerId ? getFaceUpgrade(slot.replacerId) : null;
  void expandCost;
  void gold;
  void onExpand;

  return (
    <div
      className="forge-face-details pixel-text"
      role="region"
      aria-label={`Face ${slot.index + 1} details`}
    >
      <div className="forge-face-details-head">
        <span className="forge-face-details-title">
          FACE {slot.index + 1}
        </span>
        <button
          type="button"
          className="forge-face-details-close"
          onClick={onClose}
          aria-label="Close face details"
          title="Close"
        >
          ✕
        </button>
      </div>

      <div className="forge-slot-replacer">
        {replacerUp ? (
          <div
            className={`forge-chip rarity-${replacerUp.rarity} ${
              drag?.source.kind === 'slot-replacer' &&
              drag.source.slotIndex === slot.index
                ? 'is-dragging'
                : ''
            }`}
            style={{ ['--card-accent' as string]: RARITY_COLORS[replacerUp.rarity] }}
            onPointerDown={(e) => {
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
            title={`${replacerUp.description} · drag to sell`}
          >
            <span
              className="chip-kind-icon"
              aria-hidden
              title="Replacer"
            >
              {KIND_GLYPH.replacer}
            </span>
            <span className="chip-name">
              {getFaceName(replacerUp.id, character?.id, replacerUp.name)}
            </span>
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
                  offerLabel: null,
                  replacesName: null,
                  price: null,
                  isDefault: false,
                  isOffer: false,
                });
              }}
            >
              i
            </button>
          </div>
        ) : (
          <div className="forge-chip is-empty" title={baseline?.description ?? 'Baseline face'}>
            <span className="chip-kind-icon" aria-hidden>{KIND_GLYPH.default}</span>
            <span className="chip-name">{baseline?.name ?? 'BASELINE'}</span>
          </div>
        )}
      </div>

      <div className="forge-relic-note">
        {replacerUp
          ? 'Forge weapons can be moved or sold. Baseline faces stay underneath.'
          : 'Baseline face. Drop a forge weapon here to replace it.'}
      </div>
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
