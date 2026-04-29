import { useEffect, useMemo, useRef, useState } from 'react';
import { haptic, HAPTIC } from '../audio/haptics';
import { playSfx } from '../audio/sfx';
import { useStore } from '../state/store';
import {
  claimCasinoReward,
  convertCasinoRewardToGold,
  getCasinoFaceRewardSlots,
  openCasinoChest,
  resolveCasinoGame,
} from '../engine/engine';
import {
  CASINO_GAME_LABELS,
  CHEST_TIER_LABELS,
  LUCK_GRADE_LABELS,
} from '../systems/chestRewards';
import { getFaceUpgrade } from '../content/upgrades/faceRegistry';
import { getFaceName } from '../content/upgrades/faceNames';
import { getUpgrade } from '../content/upgrades/registry';
import { mulberry32, shuffle } from '../engine/rng';
import { BaubleIcon, RelicIcon } from './RelicIcon';
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
const GAME_ANIM_MS: Record<CasinoGameId, number> = {
  slots: 1700,
  roulette: 2100,
  blackjack: 1350,
  coinFlip: 1250,
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
  const [blackjack, setBlackjack] = useState<BlackjackHand>(() => createBlackjackHand(seed));
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setAnimating(false);
    setChoice(null);
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
    if (animating) return;
    const chosen = nextChoice ?? null;
    setChoice(chosen);
    setAnimating(true);
    playSfx(game === 'slots' ? 'slot_spin' : game === 'roulette' ? 'roulette_spin' : game === 'coinFlip' ? 'coin_flip' : 'ui_reroll');
    haptic(HAPTIC.tap);
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      resolveCasinoGame(chosen ?? undefined);
    }, GAME_ANIM_MS[game]);
  };

  const finishBlackjack = (nextHand: BlackjackHand) => {
    if (animating) return;
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
    return (
      <div className={`casino-play-box ${animating ? 'is-playing' : ''}`}>
        <div className={`casino-machine ${animating ? 'is-playing' : ''}`} aria-hidden>
          <span><b>7</b><b>◆</b><b>$</b><b>7</b></span>
          <span><b>◆</b><b>$</b><b>7</b><b>◆</b></span>
          <span><b>$</b><b>7</b><b>◆</b><b>$</b></span>
        </div>
        <button
          className="btn-pixel btn-primary-v2 casino-main-action"
          onClick={() => startGame()}
          disabled={animating}
        >
          {animating ? 'REELS SPINNING' : 'PULL LEVER'}
        </button>
      </div>
    );
  }
  if (game === 'roulette') {
    return (
      <div className={`casino-play-box ${animating ? 'is-playing' : ''}`}>
        <div className={`casino-wheel ${animating ? 'is-playing' : ''}`} aria-hidden>
          <span className="casino-wheel-ball" />
        </div>
        {choice && <div className="casino-play-status">BET {choice.toUpperCase()} · BALL IN MOTION</div>}
        <div className="casino-bet-row">
          <button className="btn-pixel btn-ghost-v2" onClick={() => startGame('red')} disabled={animating}>BET RED</button>
          <button className="btn-pixel btn-ghost-v2" onClick={() => startGame('black')} disabled={animating}>BET BLACK</button>
          <button className="btn-pixel btn-primary-v2" onClick={() => startGame('green')} disabled={animating}>RISK GREEN</button>
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
            className="btn-pixel btn-ghost-v2 casino-blackjack-action"
            onClick={hitBlackjack}
            disabled={animating || blackjack.settled || playerTotal >= 21}
          >
            HIT
          </button>
          <button
            className="btn-pixel btn-primary-v2 casino-blackjack-action"
            onClick={standBlackjack}
            disabled={animating || blackjack.settled}
          >
            STAND
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className={`casino-play-box ${animating ? 'is-playing' : ''}`}>
      <div className={`casino-coin ${animating ? 'is-playing' : ''}`} aria-hidden>
        <span>{choice === 'tails' ? 'T' : 'H'}</span>
      </div>
      {choice && <div className="casino-play-status">CALLED {choice.toUpperCase()}</div>}
      <div className="casino-bet-row casino-coin-actions">
        <button className="btn-pixel btn-ghost-v2 casino-coin-choice" onClick={() => startGame('heads')} disabled={animating}>HEADS</button>
        <button className="btn-pixel btn-ghost-v2 casino-coin-choice" onClick={() => startGame('tails')} disabled={animating}>TAILS</button>
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
            {faceSlots.map((slot) => (
              <button key={slot} className="btn-pixel btn-ghost-v2" onClick={() => claimCasinoReward(slot)}>
                FACE {slot + 1}
              </button>
            ))}
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
