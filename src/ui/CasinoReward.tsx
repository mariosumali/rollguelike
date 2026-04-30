import { useEffect, useMemo, useRef, useState } from 'react';
import { haptic, HAPTIC } from '../audio/haptics';
import { playSfx } from '../audio/sfx';
import { getRunState, useStore } from '../state/store';
import {
  claimCasinoReward,
  convertCasinoRewardToGold,
  getCasinoFaceRewardSlots,
  openCasinoChest,
  resolveCasinoGame,
  settleCasinoGame,
} from '../engine/engine';
import {
  CASINO_GAME_LABELS,
  CHEST_TIER_LABELS,
  LUCK_GRADE_LABELS,
} from '../systems/chestRewards';
import { getCharacter } from '../content/characters/registry';
import { getFaceUpgrade } from '../content/upgrades/faceRegistry';
import { getFaceName } from '../content/upgrades/faceNames';
import { getUpgrade } from '../content/upgrades/registry';
import { mulberry32, shuffle } from '../engine/rng';
import { BaubleIcon, RelicIcon } from './RelicIcon';
import { SlotMachineRig, type SlotMachineSymbol } from './den/SlotMachineStation';
import { RouletteRig, type RouletteBetKind, type RouletteSpinResult } from './den/RouletteStation';
import type {
  CasinoChestReward,
  CasinoChestTier,
  CasinoGameId,
  CasinoGameResult,
  CasinoIntermissionState,
  CasinoOutcome,
  CasinoRewardKind,
  Rarity,
} from '../types';

const RARITY_COLORS: Record<Rarity, string> = {
  common: 'var(--common)',
  rare: 'var(--rare)',
  epic: 'var(--epic)',
  legendary: 'var(--legendary)',
};

const OUTCOME_LABEL: Record<CasinoOutcome, string> = {
  miss: 'MISS',
  small: 'SMALL WIN',
  big: 'BIG WIN',
  jackpot: 'JACKPOT',
};

const KIND_LABEL: Record<CasinoRewardKind, string> = {
  gold: 'GOLD',
  heal: 'HEAL',
  face: 'FACE',
  bauble: 'BAUBLE',
  relic: 'RELIC',
  forgeDiscount: 'FORGE DISCOUNT',
};

const CHEST_OPEN_TAPS: Record<CasinoChestTier, number> = {
  rusty: 3,
  copper: 3,
  bronze: 3,
  iron: 4,
  silver: 4,
  gold: 4,
  diamond: 4,
  jackpot: 4,
};

const CHEST_SHAKE_MS = 380;
const CHEST_OPEN_MS = 1250;
const RESULT_HOLD_MS = 1850;
const PRE_ANNOUNCE_HOLD_MS: Partial<Record<CasinoGameId, number>> = {
  slots: 1600,
  roulette: 1600,
  coinFlip: 1600,
};
const GAME_ANIM_MS: Record<CasinoGameId, number> = {
  slots: 2100,
  roulette: 2100,
  blackjack: 1350,
  coinFlip: 1500,
};

type BlackjackAction = 'hit' | 'stand';
type BlackjackCard = {
  rank: string;
  value: number;
};
type BlackjackHand = {
  deck: BlackjackCard[];
  player: BlackjackCard[];
  dealer: BlackjackCard[];
  revealed: boolean;
  settled: boolean;
  action?: BlackjackAction;
};

const BLACKJACK_RANKS: BlackjackCard[] = [
  { rank: 'A', value: 11 },
  { rank: '2', value: 2 },
  { rank: '3', value: 3 },
  { rank: '4', value: 4 },
  { rank: '5', value: 5 },
  { rank: '6', value: 6 },
  { rank: '7', value: 7 },
  { rank: '8', value: 8 },
  { rank: '9', value: 9 },
  { rank: '10', value: 10 },
  { rank: 'J', value: 10 },
  { rank: 'Q', value: 10 },
  { rank: 'K', value: 10 },
];

function blackjackTotal(cards: BlackjackCard[]): number {
  let total = cards.reduce((sum, card) => sum + card.value, 0);
  let aces = cards.filter((card) => card.rank === 'A').length;
  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }
  return total;
}

function createBlackjackHand(seed: number): BlackjackHand {
  const deck = shuffle(
    mulberry32((seed ^ 0x5f3759df) >>> 0),
    Array.from({ length: 4 }, () => BLACKJACK_RANKS).flat(),
  );
  return {
    deck: deck.slice(4),
    player: [deck[0]!, deck[2]!],
    dealer: [deck[1]!, deck[3]!],
    revealed: false,
    settled: false,
  };
}

function drawBlackjackCard(deck: BlackjackCard[]): [BlackjackCard, BlackjackCard[]] {
  return [deck[0] ?? BLACKJACK_RANKS[9]!, deck.slice(1)];
}

function settleBlackjackHand(
  action: BlackjackAction,
  player: BlackjackCard[],
  dealer: BlackjackCard[],
  deck: BlackjackCard[],
): BlackjackHand {
  let nextDeck = deck;
  const nextDealer = [...dealer];
  const playerTotal = blackjackTotal(player);
  if (playerTotal <= 21) {
    while (blackjackTotal(nextDealer) < 17) {
      const [card, remainingDeck] = drawBlackjackCard(nextDeck);
      nextDealer.push(card);
      nextDeck = remainingDeck;
    }
  }
  return {
    deck: nextDeck,
    player,
    dealer: nextDealer,
    revealed: true,
    settled: true,
    action,
  };
}

function serializeBlackjackChoice(hand: BlackjackHand): string {
  return [
    'blackjack',
    hand.action ?? 'stand',
    blackjackTotal(hand.player),
    blackjackTotal(hand.dealer),
    hand.player.length,
    hand.dealer.length,
  ].join(':');
}

function needsPreAnnouncementHold(game: CasinoGameId): boolean {
  return game === 'slots' || game === 'roulette' || game === 'coinFlip';
}

function slotSymbolsForResult(result: CasinoGameResult | null): SlotMachineSymbol[] | null {
  if (!result) return null;
  switch (result.outcome) {
    case 'jackpot':
      return ['seven', 'seven', 'seven'];
    case 'big':
      return ['bell', 'bell', 'bell'];
    case 'small':
      return ['coin', 'coin', 'gem'];
    case 'miss':
      return ['skull', 'gem', 'coin'];
  }
}

const ROULETTE_SLOTS: Record<RouletteBetKind, number[]> = {
  green: [0],
  red: [1, 3, 5, 7, 9, 11],
  black: [2, 4, 6, 8, 10],
};

function rouletteFinalSlotForResult(
  result: CasinoGameResult | null,
  bet: RouletteBetKind | null,
  seed: number,
): number | null {
  if (!result || !bet) return null;
  if (result.outcome === 'jackpot') return 0;

  const winningColor = bet === 'green' ? 'green' : bet;
  const losingColor = bet === 'black' ? 'red' : 'black';
  const targetColor = result.outcome === 'big' ? winningColor : losingColor;
  const slots = ROULETTE_SLOTS[targetColor] ?? ROULETTE_SLOTS.red;
  return slots[Math.abs(seed + result.label.length) % slots.length] ?? slots[0]!;
}

function coinFaceForResult(choice: string | null, result: CasinoGameResult | null): 'heads' | 'tails' | 'edge' | null {
  if (!result) return null;
  if (result.outcome === 'jackpot') return 'edge';
  const calledFace = choice === 'tails' ? 'tails' : 'heads';
  if (result.outcome === 'big') return calledFace;
  return calledFace === 'heads' ? 'tails' : 'heads';
}

function coinFaceText(face: 'heads' | 'tails' | 'edge'): string {
  if (face === 'edge') return 'EDGE';
  return face.toUpperCase();
}

function ResultReveal({
  gameLabel,
  result,
  chestTier,
}: {
  gameLabel: string;
  result?: CasinoGameResult;
  chestTier: CasinoChestTier;
}) {
  const outcome = result?.outcome ?? 'small';
  const chestLine = !result
    ? 'CHEST LOCKING IN'
    : result.chestDelta > 0
      ? `CHEST TIER +${result.chestDelta}`
      : result.chestDelta < 0
        ? 'CHEST TIER -1'
        : 'CHEST TIER HOLDS';

  return (
    <div className={`casino-result-stage outcome-${outcome}`} aria-live="polite">
      <div className="casino-section-label">{gameLabel.toUpperCase()} RESULT</div>
      <div className={`casino-result-burst outcome-${outcome}`}>
        {result ? OUTCOME_LABEL[result.outcome] : 'RESULT LOCKED'}
      </div>
      <div className="casino-result-detail">{result?.label ?? 'The table settles.'}</div>
      <div className="casino-result-next">
        {chestLine} · {CHEST_TIER_LABELS[chestTier].toUpperCase()} CHEST
      </div>
      <div className="casino-result-wait">CHEST ROLLING IN...</div>
    </div>
  );
}

function GamePrompt({ game, seed }: { game: CasinoGameId; seed: number }) {
  const [animating, setAnimating] = useState(false);
  const [choice, setChoice] = useState<string | null>(null);
  const [visibleResult, setVisibleResult] = useState<CasinoGameResult | null>(null);
  const [pendingSlotResult, setPendingSlotResult] = useState<CasinoGameResult | null>(null);
  const [slotSpinKey, setSlotSpinKey] = useState(0);
  const [pendingRouletteResult, setPendingRouletteResult] = useState<CasinoGameResult | null>(null);
  const [rouletteSpinResult, setRouletteSpinResult] = useState<RouletteSpinResult | null>(null);
  const [rouletteSpinKey, setRouletteSpinKey] = useState(0);
  const [blackjack, setBlackjack] = useState<BlackjackHand>(() => createBlackjackHand(seed));
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setAnimating(false);
    setChoice(null);
    setVisibleResult(null);
    setPendingSlotResult(null);
    setSlotSpinKey(0);
    setPendingRouletteResult(null);
    setRouletteSpinResult(null);
    setRouletteSpinKey(0);
    setBlackjack(createBlackjackHand(seed));
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [game, seed]);

  const startGame = (nextChoice?: string) => {
    if (animating || visibleResult) return;
    const chosen = nextChoice ?? null;
    setChoice(chosen);
    setAnimating(true);
    playSfx(game === 'slots' ? 'slot_spin' : game === 'roulette' ? 'roulette_spin' : game === 'coinFlip' ? 'coin_flip' : 'ui_reroll');
    haptic(HAPTIC.tap);
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      if (needsPreAnnouncementHold(game)) {
        const result = settleCasinoGame(chosen ?? undefined);
        if (!result) return;
        setAnimating(false);
        setVisibleResult(result);
        if (game === 'slots') {
          playSfx('slot_stop');
          haptic(HAPTIC.land);
        } else if (game === 'roulette') {
          playSfx('roulette_land');
          haptic(HAPTIC.land);
        } else {
          const face = coinFaceForResult(chosen, result);
          playSfx(face === 'tails' ? 'coin_land_tails' : 'coin_land_heads');
          haptic(HAPTIC.land);
        }
        timerRef.current = window.setTimeout(() => {
          timerRef.current = null;
          resolveCasinoGame(chosen ?? undefined);
        }, PRE_ANNOUNCE_HOLD_MS[game] ?? 0);
        return;
      }
      resolveCasinoGame(chosen ?? undefined);
    }, GAME_ANIM_MS[game]);
  };

  const startSlots = () => {
    if (animating || visibleResult || pendingSlotResult) return;
    const result = settleCasinoGame();
    if (!result) return;
    setChoice(null);
    setPendingSlotResult(result);
    setAnimating(true);
    setSlotSpinKey((key) => key + 1);
  };

  const finishSlots = () => {
    if (!pendingSlotResult) return;
    const result = pendingSlotResult;
    setPendingSlotResult(null);
    setAnimating(false);
    setVisibleResult(result);
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      resolveCasinoGame();
    }, PRE_ANNOUNCE_HOLD_MS.slots ?? 0);
  };

  const pickRouletteBet = (bet: RouletteBetKind) => {
    if (animating || visibleResult || pendingRouletteResult) return;
    setChoice(bet);
    playSfx('ui_click');
    haptic(HAPTIC.tap);
  };

  const startRoulette = () => {
    if (animating || visibleResult || pendingRouletteResult) return;
    const bet = choice === 'green' || choice === 'black' || choice === 'red' ? choice : null;
    if (!bet) return;
    const result = settleCasinoGame(bet);
    if (!result) return;
    setPendingRouletteResult(result);
    setRouletteSpinResult(null);
    setAnimating(true);
    setRouletteSpinKey((key) => key + 1);
  };

  const finishRoulette = (spinResult: RouletteSpinResult) => {
    if (!pendingRouletteResult) return;
    const result = pendingRouletteResult;
    setRouletteSpinResult(spinResult);
    setPendingRouletteResult(null);
    setAnimating(false);
    setVisibleResult(result);
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      resolveCasinoGame(choice ?? undefined);
    }, PRE_ANNOUNCE_HOLD_MS.roulette ?? 0);
  };

  const finishBlackjack = (nextHand: BlackjackHand) => {
    if (animating || visibleResult) return;
    setBlackjack(nextHand);
    setChoice(nextHand.action ?? null);
    setAnimating(true);
    playSfx('ui_reroll');
    haptic(HAPTIC.tap);
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      resolveCasinoGame(serializeBlackjackChoice(nextHand));
    }, GAME_ANIM_MS.blackjack);
  };

  const hitBlackjack = () => {
    if (animating || blackjack.settled || blackjackTotal(blackjack.player) >= 21) return;
    const [card, nextDeck] = drawBlackjackCard(blackjack.deck);
    const nextPlayer = [...blackjack.player, card];
    const nextTotal = blackjackTotal(nextPlayer);
    if (nextTotal >= 21) {
      finishBlackjack(settleBlackjackHand('hit', nextPlayer, blackjack.dealer, nextDeck));
      return;
    }
    playSfx('ui_click');
    haptic(HAPTIC.tap);
    setBlackjack({
      ...blackjack,
      deck: nextDeck,
      player: nextPlayer,
    });
  };

  const standBlackjack = () => {
    if (animating || blackjack.settled) return;
    finishBlackjack(settleBlackjackHand('stand', blackjack.player, blackjack.dealer, blackjack.deck));
  };

  if (game === 'slots') {
    const slotResult = pendingSlotResult ?? visibleResult;
    const finalSymbols = slotSymbolsForResult(slotResult);
    const slotResultClass = !visibleResult
      ? 'result-idle'
      : visibleResult.outcome === 'miss'
        ? 'result-lose'
        : visibleResult.outcome === 'small'
          ? 'result-small'
          : 'result-big';
    return (
      <div className={`casino-play-box ${animating ? 'is-playing' : ''} ${visibleResult ? 'is-settled' : ''}`}>
        <div className="station-slot casino-slot-station">
          <div className="slot-wrap casino-slot-wrap" aria-hidden>
            <SlotMachineRig
              key={`casino-slot-${seed}`}
              spinKey={slotSpinKey}
              finalSymbols={finalSymbols}
              onResolved={finishSlots}
            />
          </div>
          <div className={`slot-result pixel-text ${slotResultClass}`} aria-live="polite">
            {visibleResult
              ? `REELS STOPPED · ${visibleResult.label.toUpperCase()}`
              : animating
                ? 'SPINNING...'
                : 'PULL THE LEVER'}
          </div>
          <button
            type="button"
            className="slot-lever pixel-text casino-slot-lever"
            onClick={startSlots}
            disabled={animating || Boolean(visibleResult)}
          >
            ▸ {visibleResult ? 'PENDING' : animating ? 'ROLLING' : 'PULL'}
            <span className="slot-lever-sub">{visibleResult ? 'PAYOUT' : 'LEVER'}</span>
          </button>
        </div>
      </div>
    );
  }
  if (game === 'roulette') {
    const rouletteBet = choice === 'green' || choice === 'black' || choice === 'red' ? choice : null;
    const rouletteResult = pendingRouletteResult ?? visibleResult;
    const finalSlot = rouletteFinalSlotForResult(rouletteResult, rouletteBet, seed);
    const rouletteResultClass = !visibleResult
      ? 'result-idle'
      : visibleResult.outcome === 'miss'
        ? 'result-lose'
        : 'result-big';

    let rouletteResultText = 'PLACE A BET';
    if (animating) {
      rouletteResultText = 'SPINNING...';
    } else if (visibleResult) {
      const color = rouletteSpinResult?.color.toUpperCase() ?? rouletteBet?.toUpperCase() ?? 'TABLE';
      rouletteResultText = rouletteSpinResult
        ? `LANDED ${rouletteSpinResult.slot} · ${color} · ${visibleResult.label.toUpperCase()}`
        : `BALL LANDED · ${visibleResult.label.toUpperCase()}`;
    } else if (rouletteBet) {
      rouletteResultText = `BET ${rouletteBet.toUpperCase()} · SPIN WHEN READY`;
    }

    return (
      <div className={`casino-play-box ${animating ? 'is-playing' : ''} ${visibleResult ? 'is-settled' : ''}`}>
        <div className="station-roulette casino-roulette-station">
          <div className="station-intro pixel-text">
            Place a bet. Ball rides the rim, settles into a slot. Green 0 pays the moon.
          </div>
          <div className="roulette-wrap" aria-hidden>
            <RouletteRig
              key={`casino-roulette-${seed}`}
              spinKey={rouletteSpinKey}
              bet={rouletteBet}
              finalSlot={finalSlot}
              onResolved={finishRoulette}
            />
          </div>
          <div className={`roulette-result pixel-text ${rouletteResultClass}`} aria-live="polite">
            {rouletteResultText}
          </div>
          <div className="roulette-bets pixel-text">
            {(['red', 'black', 'green'] as RouletteBetKind[]).map((bet) => (
              <button
                key={bet}
                type="button"
                className={`roulette-bet-btn bet-${bet} ${rouletteBet === bet ? 'is-active' : ''}`}
                onClick={() => pickRouletteBet(bet)}
                disabled={animating || Boolean(visibleResult)}
              >
                {bet === 'red' ? 'RED · 2×' : bet === 'black' ? 'BLACK · 2×' : 'GREEN · 12×'}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="roulette-spin-btn pixel-text"
            onClick={startRoulette}
            disabled={animating || Boolean(visibleResult) || !rouletteBet}
          >
            ▸ {animating ? 'SPINNING' : 'SPIN'}
          </button>
        </div>
      </div>
    );
  }
  if (game === 'blackjack') {
    const playerTotal = blackjackTotal(blackjack.player);
    const dealerTotal = blackjack.revealed ? blackjackTotal(blackjack.dealer) : blackjack.dealer[0]?.value ?? 0;
    return (
      <div className={`casino-play-box casino-blackjack-box ${animating ? 'is-playing' : ''}`}>
        <div className="casino-blackjack-table" aria-live="polite">
          <div className="casino-blackjack-row">
            <span className="casino-blackjack-label">DEALER {blackjack.revealed ? dealerTotal : '?'}</span>
            <div className={`casino-cards casino-blackjack-cards ${animating ? 'is-playing' : ''}`}>
              {blackjack.dealer.map((card, index) => (
                <span key={`dealer-${index}-${card.rank}`} className={!blackjack.revealed && index > 0 ? 'is-hidden' : ''}>
                  {blackjack.revealed || index === 0 ? card.rank : '?'}
                </span>
              ))}
            </div>
          </div>
          <div className="casino-blackjack-row">
            <span className="casino-blackjack-label">YOU {playerTotal}</span>
            <div className={`casino-cards casino-blackjack-cards ${animating ? 'is-playing' : ''}`}>
              {blackjack.player.map((card, index) => (
                <span key={`player-${index}-${card.rank}`}>{card.rank}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="casino-bet-row casino-blackjack-actions">
          <button
            className="btn-pixel casino-choice-btn choice-hit casino-blackjack-action"
            onClick={hitBlackjack}
            disabled={animating || blackjack.settled || playerTotal >= 21}
          >
            HIT
          </button>
          <button
            className="btn-pixel casino-choice-btn choice-stand casino-blackjack-action"
            onClick={standBlackjack}
            disabled={animating || blackjack.settled}
          >
            STAND
          </button>
        </div>
      </div>
    );
  }
  const landedFace = coinFaceForResult(choice, visibleResult);
  const coinGlyph = landedFace === 'edge'
    ? 'E'
    : landedFace === 'tails' || (!landedFace && choice === 'tails')
      ? 'T'
      : 'H';
  return (
    <div className={`casino-play-box ${animating ? 'is-playing' : ''} ${visibleResult ? 'is-settled' : ''}`}>
      <div className={`casino-coin ${animating ? 'is-playing' : ''} ${visibleResult ? 'is-settled' : ''}`} aria-hidden>
        <span>{coinGlyph}</span>
      </div>
      {visibleResult && landedFace ? (
        <div className="casino-play-status casino-play-result">
          LANDED {coinFaceText(landedFace)} · {visibleResult.label.toUpperCase()}
        </div>
      ) : (
        choice && <div className="casino-play-status">CALLED {choice.toUpperCase()}</div>
      )}
      <div className="casino-bet-row casino-coin-actions">
        <button className="btn-pixel casino-choice-btn choice-heads casino-coin-choice" onClick={() => startGame('heads')} disabled={animating || Boolean(visibleResult)}>HEADS</button>
        <button className="btn-pixel casino-choice-btn choice-tails casino-coin-choice" onClick={() => startGame('tails')} disabled={animating || Boolean(visibleResult)}>TAILS</button>
      </div>
    </div>
  );
}

function casinoRewardBundle(casino: CasinoIntermissionState): CasinoChestReward[] {
  if (casino.rewards && casino.rewards.length > 0) return casino.rewards;
  return casino.reward ? [casino.reward] : [];
}

function isFaceReward(reward: CasinoChestReward): reward is CasinoChestReward & { kind: 'face'; id: string } {
  return reward.kind === 'face';
}

function rewardText(reward: CasinoChestReward, characterId: string): { title: string; detail: string; rarity: Rarity | null } {
  if (reward.kind === 'face') {
    const face = getFaceUpgrade(reward.id);
    return {
      title: face ? getFaceName(face.id, characterId, face.name) : reward.label,
      detail: face?.description ?? 'Install this face on a valid die side.',
      rarity: reward.rarity,
    };
  }
  if (reward.kind === 'bauble' || reward.kind === 'relic') {
    const upgrade = getUpgrade(reward.id);
    return {
      title: upgrade?.name ?? reward.label,
      detail: upgrade?.desc ?? 'Add this to your run.',
      rarity: reward.rarity,
    };
  }
  if (reward.kind === 'gold') {
    return { title: reward.label, detail: `Gain ${reward.amount} gold.`, rarity: null };
  }
  if (reward.kind === 'heal') {
    return { title: reward.label, detail: `Restore ${reward.amount} HP.`, rarity: null };
  }
  if (reward.kind === 'forgeDiscount') {
    return {
      title: reward.label,
      detail: `Your next full forge is ${Math.round(reward.amount * 100)}% cheaper.`,
      rarity: null,
    };
  }
  return {
    title: reward.label,
    detail: 'Add this to your haul.',
    rarity: null,
  };
}

function RewardArt({ reward }: { reward: CasinoChestReward }) {
  if (reward.kind === 'bauble' || reward.kind === 'relic') {
    const upgrade = getUpgrade(reward.id);
    if (upgrade) {
      return (
        <div className="casino-reward-icon">
          {reward.kind === 'bauble'
            ? <BaubleIcon upgrade={upgrade} size={58} />
            : <RelicIcon upgrade={upgrade} size={64} />}
        </div>
      );
    }
  }
  if (reward.kind === 'face') return <div className="casino-reward-glyph">◆</div>;
  if (reward.kind === 'heal') return <div className="casino-reward-glyph">+</div>;
  if (reward.kind === 'forgeDiscount') return <div className="casino-reward-glyph">%</div>;
  return <div className="casino-reward-glyph">$</div>;
}

function RewardTile({ reward, characterId }: { reward: CasinoChestReward; characterId: string }) {
  const { title, detail, rarity } = rewardText(reward, characterId);
  return (
    <div
      className={`casino-reward-tile ${rarity ? `rarity-${rarity}` : ''}`}
      style={rarity ? { ['--card-accent' as string]: RARITY_COLORS[rarity] } : undefined}
    >
      <div className="upg-card-head">
        <span className="upg-rarity">{rarity ? rarity.toUpperCase() : reward.tier.toUpperCase()}</span>
        <span className="upg-cat">{KIND_LABEL[reward.kind]}</span>
      </div>
      <RewardArt reward={reward} />
      <div className="upg-card-name">{title}</div>
      <div className="upg-card-desc">{detail}</div>
    </div>
  );
}

function casinoSlotLabel(slotIndex: number): { name: string; description: string; kind: string } {
  const run = getRunState();
  const slot = run?.slotLayout[slotIndex];
  const character = run ? getCharacter(run.characterId) : undefined;
  const replacer = slot?.replacerId ? getFaceUpgrade(slot.replacerId) : null;
  if (replacer) {
    return {
      name: getFaceName(replacer.id, run?.characterId ?? null, replacer.name),
      description: replacer.description,
      kind: 'FORGE',
    };
  }

  const baseline = character?.defaultFaces?.[slotIndex];
  return {
    name: baseline?.name ?? 'Baseline',
    description: baseline?.description ?? 'Baseline face',
    kind: 'BASE',
  };
}

function RewardView() {
  const casino = useStore((s) => s.casinoState);
  const hud = useStore((s) => s.hud);
  const rewards = useMemo(() => (casino ? casinoRewardBundle(casino) : []), [casino]);
  const faceReward = rewards.find(isFaceReward);
  const faceSlots = useMemo(() => getCasinoFaceRewardSlots(), [faceReward?.id]);
  if (!casino || rewards.length === 0) return null;

  const convertGold = rewards.reduce((sum, reward) => {
    if ('convertGold' in reward) return sum + reward.convertGold;
    if (reward.kind === 'forgeDiscount') return sum + Math.max(10, Math.round(reward.amount * 120));
    if (reward.kind === 'heal') return sum + Math.max(3, Math.floor(reward.amount * 0.5));
    return sum + reward.amount;
  }, 0);
  const rewardCountLabel = rewards.length === 1 ? '1 reward' : `${rewards.length} rewards`;
  const canConvert = rewards.some((reward) => reward.kind !== 'gold');

  return (
    <div className="casino-reward-card casino-reward-bundle">
      <div className="upg-card-head">
        <span className="upg-rarity">{casino.chestTier.toUpperCase()}</span>
        <span className="upg-cat">CHEST HAUL</span>
      </div>
      <div className="upg-card-name">{CHEST_TIER_LABELS[casino.chestTier]}</div>
      <div className="upg-card-desc">Claim {rewardCountLabel} from this chest.</div>
      <div className="casino-reward-bundle-grid">
        {rewards.map((reward, index) => (
          <RewardTile key={`${reward.kind}-${'id' in reward ? reward.id : reward.label}-${index}`} reward={reward} characterId={hud.characterId} />
        ))}
      </div>

      {faceReward ? (
        <>
          <div className="casino-slot-row">
            {faceSlots.length === 0 && <span className="casino-small-note">NO VALID SLOT</span>}
            {faceSlots.map((slot) => {
              const currentFace = casinoSlotLabel(slot);
              return (
                <button
                  key={slot}
                  className="btn-pixel btn-ghost-v2 casino-face-choice"
                  onClick={() => claimCasinoReward(slot)}
                  title={`Face ${slot + 1} · ${currentFace.name}\n${currentFace.description}`}
                  aria-label={`Put reward on face ${slot + 1}, currently ${currentFace.name}`}
                >
                  <span className="casino-face-choice-num">FACE {slot + 1}</span>
                  <span className="casino-face-choice-name">{currentFace.name}</span>
                  <span className="casino-face-choice-kind">{currentFace.kind}</span>
                </button>
              );
            })}
          </div>
          {canConvert && (
            <button className="btn-pixel btn-ghost-v2 casino-convert casino-prize-action" onClick={() => convertCasinoRewardToGold()}>
              CONVERT ALL TO {convertGold}G
            </button>
          )}
        </>
      ) : (
        <div className="casino-slot-row casino-prize-actions">
          <button className="btn-pixel btn-primary-v2 casino-prize-action" onClick={() => claimCasinoReward()}>
            {rewards.length === 1 ? 'CLAIM' : 'CLAIM ALL'}
          </button>
          {canConvert && (
            <button className="btn-pixel btn-ghost-v2 casino-prize-action" onClick={() => convertCasinoRewardToGold()}>
              CONVERT ALL TO {convertGold}G
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function CasinoReward() {
  const casino = useStore((s) => s.casinoState);
  const hud = useStore((s) => s.hud);
  const [chestTaps, setChestTaps] = useState(0);
  const [chestShakeTick, setChestShakeTick] = useState(0);
  const [chestShaking, setChestShaking] = useState(false);
  const [chestOpeningQueued, setChestOpeningQueued] = useState(false);
  const [chestOpening, setChestOpening] = useState(false);
  const [revealedChestKey, setRevealedChestKey] = useState<string | null>(null);
  const resultTimerRef = useRef<number | null>(null);
  const shakeTimerRef = useRef<number | null>(null);
  const springTimerRef = useRef<number | null>(null);
  const openTimerRef = useRef<number | null>(null);
  const chestRevealKey = casino?.phase === 'chest'
    ? `${casino.seed}:${casino.chestTier}:${casino.result?.outcome ?? 'pending'}:${casino.result?.label ?? 'pending'}`
    : null;

  const clearChestTimers = () => {
    if (resultTimerRef.current !== null) {
      window.clearTimeout(resultTimerRef.current);
      resultTimerRef.current = null;
    }
    if (shakeTimerRef.current !== null) {
      window.clearTimeout(shakeTimerRef.current);
      shakeTimerRef.current = null;
    }
    if (springTimerRef.current !== null) {
      window.clearTimeout(springTimerRef.current);
      springTimerRef.current = null;
    }
    if (openTimerRef.current !== null) {
      window.clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
  };

  useEffect(() => {
    clearChestTimers();
    setChestTaps(0);
    setChestShakeTick(0);
    setChestShaking(false);
    setChestOpeningQueued(false);
    setChestOpening(false);
    if (chestRevealKey) {
      setRevealedChestKey(null);
      resultTimerRef.current = window.setTimeout(() => {
        resultTimerRef.current = null;
        setRevealedChestKey(chestRevealKey);
      }, RESULT_HOLD_MS);
    } else {
      setRevealedChestKey(null);
    }
  }, [chestRevealKey]);

  useEffect(() => {
    return clearChestTimers;
  }, []);

  if (!casino) return null;
  const gameLabel = casino.game ? CASINO_GAME_LABELS[casino.game] : 'Mystery Table';
  const result = casino.result;
  const requiredChestTaps = CHEST_OPEN_TAPS[casino.chestTier];
  const chestReady = casino.phase === 'chest' && revealedChestKey === chestRevealKey;
  const chestPrompt = chestOpening
    ? 'SPRINGING OPEN'
    : chestOpeningQueued
      ? 'CRACKING OPEN'
    : chestTaps === 0
      ? 'TAP TO SHAKE'
      : `TAPS ${chestTaps}/${requiredChestTaps}`;

  const handleChestTap = () => {
    if (casino.phase !== 'chest' || chestOpeningQueued || chestOpening) return;
    const nextTaps = Math.min(chestTaps + 1, requiredChestTaps);
    if (shakeTimerRef.current !== null) window.clearTimeout(shakeTimerRef.current);
    setChestTaps(nextTaps);
    setChestShakeTick((tick) => tick + 1);
    setChestShaking(true);
    playSfx('ui_click');
    haptic(HAPTIC.tap);
    shakeTimerRef.current = window.setTimeout(() => {
      shakeTimerRef.current = null;
      setChestShaking(false);
    }, CHEST_SHAKE_MS);

    if (nextTaps < requiredChestTaps) return;
    setChestOpeningQueued(true);
    springTimerRef.current = window.setTimeout(() => {
      springTimerRef.current = null;
      setChestOpening(true);
      playSfx('upgrade_pick');
      haptic(HAPTIC.upgrade);
      openTimerRef.current = window.setTimeout(() => {
        openTimerRef.current = null;
        openCasinoChest();
      }, CHEST_OPEN_MS);
    }, CHEST_SHAKE_MS);
  };

  return (
    <div className="overlay upgrade-overlay upgrade-v2 casino-overlay">
      <div className="menu-vignette" aria-hidden />
      <div className="menu-scanlines" aria-hidden />

      <div className="upgrade-panel-v2 pixel-text casino-panel">
        <span className="panel-corner pc-tl" aria-hidden />
        <span className="panel-corner pc-tr" aria-hidden />
        <span className="panel-corner pc-bl" aria-hidden />
        <span className="panel-corner pc-br" aria-hidden />

        <div className="panel-kicker">
          <span className="chev">▸</span>
          <span>WAVE {String(hud.wave).padStart(2, '0')} · CASINO</span>
          <span className="chev">◂</span>
        </div>

        <h2 className="panel-title-v2" aria-label="CASINO">
          <span className="pt-shadow" aria-hidden>CASINO</span>
          <span className="pt-main">CASINO</span>
        </h2>

        <div className="tagline-ribbon upg-ribbon">
          <span className="tr-bracket">[</span>
          <span className="tr-track">
            LUCK · {LUCK_GRADE_LABELS[casino.luckGrade].toUpperCase()} {casino.luckScore}
            {' · '}
            CHEST · {CHEST_TIER_LABELS[casino.chestTier].toUpperCase()}
          </span>
          <span className="tr-bracket">]</span>
        </div>

        {(casino.phase === 'play' || casino.phase === 'choose') && casino.game && (
          <>
            <div className="casino-section-label">{gameLabel.toUpperCase()}</div>
            <GamePrompt game={casino.game} seed={casino.seed} />
          </>
        )}

        {casino.phase === 'chest' && !chestReady && (
          <ResultReveal gameLabel={gameLabel} result={result} chestTier={casino.chestTier} />
        )}

        {casino.phase === 'chest' && chestReady && (
          <div className={`casino-chest-stage is-entering outcome-${result?.outcome ?? 'small'}`}>
            <div className={`casino-result-badge outcome-${result?.outcome ?? 'small'}`}>
              {result ? `${OUTCOME_LABEL[result.outcome]} · ${result.label}` : 'RESULT LOCKED'}
            </div>
            <button
              className={[
                'casino-chest',
                `casino-chest-${casino.chestTier}`,
                `casino-chest-tap-${Math.min(chestTaps, requiredChestTaps)}`,
                chestShaking && !chestOpening ? 'is-shaking' : '',
                chestShakeTick % 2 === 0 ? 'shake-even' : 'shake-odd',
                chestOpening ? 'is-opening' : '',
              ].filter(Boolean).join(' ')}
              onClick={handleChestTap}
              disabled={chestOpeningQueued || chestOpening}
              aria-label={`${CHEST_TIER_LABELS[casino.chestTier]}. ${chestPrompt}.`}
            >
              <span key={chestOpening ? 'open' : `shake-${chestShakeTick}`} className="casino-chest-sprite" aria-hidden>
                <span className="casino-chest-glow" />
                <span className="casino-chest-interior" />
                <span className="casino-chest-ornaments">
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </span>
                <span className="casino-chest-loot-pop">
                  <span />
                  <span />
                  <span />
                  <span />
                </span>
                <span className="casino-chest-lid" />
                <span className="casino-chest-body" />
                <span className="casino-chest-lock" />
              </span>
              <span className="casino-chest-label">{chestPrompt}</span>
              <span className="casino-chest-hint">
                {CHEST_TIER_LABELS[casino.chestTier].toUpperCase()}
              </span>
            </button>
          </div>
        )}

        {casino.phase === 'reward' && <RewardView />}
      </div>
    </div>
  );
}
