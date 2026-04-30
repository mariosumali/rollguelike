import { useEffect, useRef, useState } from 'react';
import { playSfx } from '../../audio/sfx';
import { haptic, HAPTIC } from '../../audio/haptics';

export type RouletteBetKind = 'red' | 'black' | 'green';
export type RoulettePhase = 'idle' | 'spinning' | 'resolved';
export interface RouletteSpinResult {
  slot: number;
  color: RouletteBetKind;
  paid: number;
}

const SLOT_COUNT = 12;
const CANVAS_SIZE = 220;
const CENTER = CANVAS_SIZE / 2;
const WHEEL_R_OUTER = 104;
const WHEEL_R_INNER = 36;
const BALL_R = 4;
const BALL_TRACK_OUTER = 94;
const BALL_TRACK_INNER = 70;

// 12 slots: slot 0 = green; remaining alternating red/black.
// Colors by slot index (0..11).
export function rouletteSlotColor(idx: number): RouletteBetKind {
  if (idx === 0) return 'green';
  return idx % 2 === 1 ? 'red' : 'black';
}

function slotHex(c: RouletteBetKind): string {
  if (c === 'green') return '#2e6a2e';
  if (c === 'red') return '#c8322e';
  return '#141422';
}

function slotHexBright(c: RouletteBetKind): string {
  if (c === 'green') return '#6ae07a';
  if (c === 'red') return '#ff6a5a';
  return '#3a3a55';
}

interface SpinState {
  active: boolean;
  startedAt: number;
  duration: number;
  startWheel: number;
  startBall: number;
  endWheel: number;
  endBall: number;
  finalSlot: number;
  lastTickAngle: number;
  tickPlayed: boolean;
}

function drawWheel(
  ctx: CanvasRenderingContext2D,
  wheelAngle: number,
  highlightSlot: number | null,
): void {
  ctx.save();
  ctx.translate(CENTER, CENTER);

  // outer rim
  ctx.fillStyle = '#5a2a0a';
  ctx.beginPath();
  ctx.arc(0, 0, WHEEL_R_OUTER + 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8a5a20';
  ctx.beginPath();
  ctx.arc(0, 0, WHEEL_R_OUTER + 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.rotate(wheelAngle);

  const sliceAngle = (Math.PI * 2) / SLOT_COUNT;
  for (let i = 0; i < SLOT_COUNT; i++) {
    const a0 = i * sliceAngle - sliceAngle / 2;
    const a1 = a0 + sliceAngle;
    const color = rouletteSlotColor(i);
    ctx.fillStyle = highlightSlot === i ? slotHexBright(color) : slotHex(color);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, WHEEL_R_OUTER, a0, a1);
    ctx.closePath();
    ctx.fill();

    // separator lines
    ctx.strokeStyle = '#05050c';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a0) * WHEEL_R_OUTER, Math.sin(a0) * WHEEL_R_OUTER);
    ctx.stroke();

    // number
    ctx.save();
    const midA = (a0 + a1) / 2;
    ctx.rotate(midA);
    ctx.fillStyle = '#ffe89a';
    ctx.font = 'bold 10px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(i), WHEEL_R_OUTER - 14, 0);
    ctx.restore();
  }

  // inner hub
  ctx.fillStyle = '#2c2f55';
  ctx.beginPath();
  ctx.arc(0, 0, WHEEL_R_INNER, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c77cff';
  ctx.lineWidth = 2;
  ctx.stroke();

  // hub spokes
  ctx.strokeStyle = '#6a7082';
  ctx.lineWidth = 1;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * WHEEL_R_INNER, Math.sin(a) * WHEEL_R_INNER);
    ctx.stroke();
  }

  // hub cap
  ctx.fillStyle = '#ffd86b';
  ctx.beginPath();
  ctx.arc(0, 0, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawBall(ctx: CanvasRenderingContext2D, ballAngle: number, trackRadius: number): void {
  const bx = CENTER + Math.cos(ballAngle) * trackRadius;
  const by = CENTER + Math.sin(ballAngle) * trackRadius;
  ctx.save();
  // shadow
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(bx + 1, by + 2, BALL_R, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  // body
  const grad = ctx.createRadialGradient(bx - 1, by - 1, 1, bx, by, BALL_R);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(1, '#9fa7bd');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(bx, by, BALL_R, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPointer(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  ctx.fillStyle = '#ffd86b';
  ctx.strokeStyle = '#4a2a0c';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(CENTER, 4);
  ctx.lineTo(CENTER - 6, 16);
  ctx.lineTo(CENTER + 6, 16);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function roulettePaid(bet: RouletteBetKind | null, color: RouletteBetKind): number {
  if (bet === 'red' && color === 'red') return 2;
  if (bet === 'black' && color === 'black') return 2;
  if (bet === 'green' && color === 'green') return 12;
  return 0;
}

interface RouletteRigProps {
  spinKey: number;
  bet: RouletteBetKind | null;
  finalSlot?: number | null;
  onResolved?: (result: RouletteSpinResult) => void;
}

export function RouletteRig({ spinKey, bet, finalSlot, onResolved }: RouletteRigProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const wheelAngleRef = useRef(0);
  const ballAngleRef = useRef(0);
  const spinRef = useRef<SpinState | null>(null);
  const phaseRef = useRef<RoulettePhase>('idle');
  const betRef = useRef<RouletteBetKind | null>(bet);
  const finalSlotRef = useRef<number | null | undefined>(finalSlot);
  const onResolvedRef = useRef<typeof onResolved>(onResolved);

  const [phase, setPhase] = useState<RoulettePhase>('idle');
  const [landedSlot, setLandedSlot] = useState<number | null>(null);

  useEffect(() => {
    betRef.current = bet;
  }, [bet]);

  useEffect(() => {
    finalSlotRef.current = finalSlot;
  }, [finalSlot]);

  useEffect(() => {
    onResolvedRef.current = onResolved;
  }, [onResolved]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    const render = (now: number) => {
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      const spin = spinRef.current;
      let trackRadius = BALL_TRACK_OUTER;
      let highlight: number | null = phase === 'resolved' ? landedSlot : null;

      if (spin && spin.active) {
        const tRaw = Math.min(1, (now - spin.startedAt) / spin.duration);
        const eased = 1 - Math.pow(1 - tRaw, 3);
        wheelAngleRef.current = spin.startWheel + (spin.endWheel - spin.startWheel) * eased;
        ballAngleRef.current = spin.startBall + (spin.endBall - spin.startBall) * eased;
        trackRadius = BALL_TRACK_OUTER - (BALL_TRACK_OUTER - BALL_TRACK_INNER) * eased;

        const da = Math.abs(ballAngleRef.current - spin.lastTickAngle);
        if (da > Math.PI / 6) {
          spin.lastTickAngle = ballAngleRef.current;
          playSfx('roulette_tick');
        }

        if (tRaw >= 1) {
          spin.active = false;
          phaseRef.current = 'resolved';
          setPhase('resolved');
          setLandedSlot(spin.finalSlot);
          highlight = spin.finalSlot;
          playSfx('roulette_land');
          haptic(HAPTIC.land);
          const color = rouletteSlotColor(spin.finalSlot);
          const paid = roulettePaid(betRef.current, color);
          if (paid > 0) haptic(HAPTIC.upgrade);
          onResolvedRef.current?.({ slot: spin.finalSlot, color, paid });
        }
      } else if (phaseRef.current === 'idle') {
        // Slow idle drift so the wheel breathes.
        wheelAngleRef.current += 0.0015;
      }

      drawWheel(ctx, wheelAngleRef.current, highlight);
      drawBall(ctx, ballAngleRef.current, trackRadius);
      drawPointer(ctx);

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [phase, landedSlot]);

  useEffect(() => {
    if (spinKey <= 0 || phaseRef.current === 'spinning' || !betRef.current) return;

    const resolvedFinalSlot = finalSlotRef.current ?? Math.floor(Math.random() * SLOT_COUNT);
    const sliceAngle = (Math.PI * 2) / SLOT_COUNT;

    const wheelTurns = 5 + Math.random() * 2;
    const ballTurns = 9 + Math.random() * 2;

    const startWheel = wheelAngleRef.current;
    const startBall = ballAngleRef.current;
    const endWheel = startWheel + Math.PI * 2 * wheelTurns;
    const slotWorld = endWheel + resolvedFinalSlot * sliceAngle;
    const targetBall = slotWorld;
    let endBall = targetBall;
    while (endBall > startBall - Math.PI * 2 * ballTurns) {
      endBall -= Math.PI * 2;
    }

    spinRef.current = {
      active: true,
      startedAt: performance.now(),
      duration: 3600,
      startWheel,
      startBall,
      endWheel,
      endBall,
      finalSlot: resolvedFinalSlot,
      lastTickAngle: startBall,
      tickPlayed: false,
    };

    phaseRef.current = 'spinning';
    setPhase('spinning');
    setLandedSlot(null);
    playSfx('roulette_spin');
    haptic(HAPTIC.tap);
  }, [spinKey]);

  return <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} className="roulette-canvas" />;
}

export function RouletteStation() {
  const [bet, setBet] = useState<RouletteBetKind | null>(null);
  const [phase, setPhase] = useState<RoulettePhase>('idle');
  const [landedSlot, setLandedSlot] = useState<number | null>(null);
  const [win, setWin] = useState<null | RouletteSpinResult>(null);
  const [spinKey, setSpinKey] = useState(0);

  const pickBet = (b: RouletteBetKind) => {
    if (phase === 'spinning') return;
    setBet(b);
    playSfx('ui_click');
    haptic(HAPTIC.tap);
  };

  const spin = () => {
    if (phase === 'spinning' || !bet) return;
    setPhase('spinning');
    setLandedSlot(null);
    setWin(null);
    setSpinKey((key) => key + 1);
  };

  const disabled = phase === 'spinning';

  const betLabel = (b: RouletteBetKind) => (b === 'red' ? 'RED · 2×' : b === 'black' ? 'BLACK · 2×' : 'GREEN · 12×');

  let resultText = 'PLACE A BET';
  if (phase === 'spinning') resultText = 'SPINNING...';
  else if (phase === 'resolved' && landedSlot != null && win) {
    const color = win.color.toUpperCase();
    resultText = win.paid > 0
      ? `LANDED ${landedSlot} · ${color} · PAID ${win.paid}×`
      : `LANDED ${landedSlot} · ${color} · MISS`;
  } else if (bet) {
    resultText = `BET ${bet.toUpperCase()} · SPIN WHEN READY`;
  }

  const resultClass =
    phase === 'resolved'
      ? win && win.paid > 0
        ? 'result-big'
        : 'result-lose'
      : 'result-idle';

  return (
    <div className="station-roulette">
      <div className="station-intro pixel-text">
        Place a bet. Ball rides the rim, settles into a slot. Green 0 pays the moon.
      </div>
      <div className="roulette-wrap">
        <RouletteRig
          spinKey={spinKey}
          bet={bet}
          onResolved={(result) => {
            setPhase('resolved');
            setLandedSlot(result.slot);
            setWin(result);
          }}
        />
      </div>
      <div className={`roulette-result pixel-text ${resultClass}`} aria-live="polite">
        {resultText}
      </div>
      <div className="roulette-bets pixel-text">
        {(['red', 'black', 'green'] as RouletteBetKind[]).map((b) => (
          <button
            key={b}
            type="button"
            className={`roulette-bet-btn bet-${b} ${bet === b ? 'is-active' : ''}`}
            onClick={() => pickBet(b)}
            disabled={disabled}
          >
            {betLabel(b)}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="roulette-spin-btn pixel-text"
        onClick={spin}
        disabled={disabled || !bet}
      >
        ▸ {phase === 'spinning' ? 'SPINNING' : 'SPIN'}
      </button>
    </div>
  );
}
