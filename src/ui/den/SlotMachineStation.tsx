import { useEffect, useRef, useState } from 'react';
import { playSfx } from '../../audio/sfx';
import { haptic, HAPTIC } from '../../audio/haptics';

export type SlotMachineSymbol = 'seven' | 'bell' | 'gem' | 'skull' | 'coin' | 'cherry';
export type SlotMachinePhase = 'idle' | 'spinning' | 'resolved';
export type SlotMachineResolution = 'big' | 'small' | 'lose';

const SYMBOLS: SlotMachineSymbol[] = ['seven', 'bell', 'gem', 'skull', 'coin', 'cherry'];

const SYMBOL_LABEL: Record<SlotMachineSymbol, string> = {
  seven: '7',
  bell: 'BELL',
  gem: 'GEM',
  skull: 'SKULL',
  coin: 'COIN',
  cherry: 'CHERRY',
};

const REEL_COUNT = 3;
const SYMBOL_SIZE = 44;
const REEL_WIDTH = SYMBOL_SIZE + 4;
const REEL_HEIGHT = SYMBOL_SIZE * 3;
const FRAME_PAD = 8;

const STRIP_LENGTH = 24;

interface ReelState {
  strip: SlotMachineSymbol[];
  offset: number;
  speed: number;
  spinning: boolean;
  stopAt: number;
  finalIndex: number;
  stopPlayed: boolean;
}

function drawSymbol(ctx: CanvasRenderingContext2D, x: number, y: number, s: SlotMachineSymbol): void {
  const cx = x + SYMBOL_SIZE / 2;
  const cy = y + SYMBOL_SIZE / 2;

  ctx.save();
  switch (s) {
    case 'seven': {
      ctx.fillStyle = '#1a0505';
      ctx.fillRect(x + 4, y + 4, SYMBOL_SIZE - 8, SYMBOL_SIZE - 8);
      ctx.fillStyle = '#ff3a3a';
      ctx.font = 'bold 30px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('7', cx + 1, cy + 1);
      ctx.fillStyle = '#ff8a8a';
      ctx.fillText('7', cx, cy);
      break;
    }
    case 'bell': {
      ctx.fillStyle = '#d49a28';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 14);
      ctx.quadraticCurveTo(cx + 14, cy - 14, cx + 14, cy + 6);
      ctx.lineTo(cx - 14, cy + 6);
      ctx.quadraticCurveTo(cx - 14, cy - 14, cx, cy - 14);
      ctx.fill();
      ctx.fillStyle = '#ffe89a';
      ctx.fillRect(cx - 10, cy - 10, 4, 4);
      ctx.fillStyle = '#8a5a18';
      ctx.fillRect(cx - 16, cy + 6, 32, 3);
      ctx.fillStyle = '#d49a28';
      ctx.beginPath();
      ctx.arc(cx, cy + 12, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffe89a';
      ctx.fillRect(cx - 2, cy - 18, 4, 4);
      break;
    }
    case 'gem': {
      ctx.fillStyle = '#62b8ff';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 14);
      ctx.lineTo(cx + 12, cy);
      ctx.lineTo(cx, cy + 14);
      ctx.lineTo(cx - 12, cy);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#b8e0ff';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 14);
      ctx.lineTo(cx + 6, cy - 4);
      ctx.lineTo(cx - 6, cy - 4);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - 2, cy - 10, 2, 2);
      break;
    }
    case 'skull': {
      ctx.fillStyle = '#d6dde8';
      ctx.beginPath();
      ctx.arc(cx, cy - 2, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(cx - 8, cy + 4, 16, 8);
      ctx.fillStyle = '#1a1a2a';
      ctx.fillRect(cx - 6, cy - 4, 4, 4);
      ctx.fillRect(cx + 2, cy - 4, 4, 4);
      ctx.fillRect(cx - 1, cy + 2, 2, 3);
      ctx.fillRect(cx - 5, cy + 10, 2, 3);
      ctx.fillRect(cx - 1, cy + 10, 2, 3);
      ctx.fillRect(cx + 3, cy + 10, 2, 3);
      break;
    }
    case 'coin': {
      const grad = ctx.createRadialGradient(cx - 4, cy - 5, 2, cx, cy, 14);
      grad.addColorStop(0, '#ffe89a');
      grad.addColorStop(0.6, '#ffd86b');
      grad.addColorStop(1, '#8a5a18');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#6b4b2a';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#6b4b2a';
      ctx.font = 'bold 14px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('$', cx, cy + 1);
      break;
    }
    case 'cherry': {
      ctx.strokeStyle = '#6ae07a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 6, cy + 2);
      ctx.quadraticCurveTo(cx, cy - 12, cx + 6, cy + 2);
      ctx.stroke();
      ctx.fillStyle = '#e23c4c';
      ctx.beginPath();
      ctx.arc(cx - 6, cy + 6, 6, 0, Math.PI * 2);
      ctx.arc(cx + 6, cy + 6, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff8a8a';
      ctx.beginPath();
      ctx.arc(cx - 8, cy + 4, 1.5, 0, Math.PI * 2);
      ctx.arc(cx + 4, cy + 4, 1.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }
  ctx.restore();
}

function makeStrip(finalSymbol: SlotMachineSymbol, reelSeed: number): { strip: SlotMachineSymbol[]; finalIndex: number } {
  const strip: SlotMachineSymbol[] = [];
  for (let i = 0; i < STRIP_LENGTH; i++) {
    strip.push(SYMBOLS[(i * 2 + reelSeed) % SYMBOLS.length]!);
  }
  const finalIndex = STRIP_LENGTH - 3;
  strip[finalIndex] = finalSymbol;
  strip[(finalIndex + 1) % STRIP_LENGTH] = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]!;
  strip[(finalIndex - 1 + STRIP_LENGTH) % STRIP_LENGTH] = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]!;
  return { strip, finalIndex };
}

function resolvePayout(result: SlotMachineSymbol[]): SlotMachineResolution {
  if (result[0] === result[1] && result[1] === result[2]) return 'big';
  if (result[0] === result[1] || result[1] === result[2] || result[0] === result[2]) return 'small';
  return 'lose';
}

function randomFinals(): SlotMachineSymbol[] {
  const finals: SlotMachineSymbol[] = [];
  for (let i = 0; i < REEL_COUNT; i++) {
    finals.push(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]!);
  }
  // Slight bias: ~14% chance all three match for a jackpot feel.
  if (Math.random() < 0.14) {
    const winner = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]!;
    finals[0] = winner;
    finals[1] = winner;
    finals[2] = winner;
  }
  return finals;
}

function normalizeFinals(finalSymbols?: SlotMachineSymbol[] | null): SlotMachineSymbol[] {
  const fallback = randomFinals();
  return Array.from({ length: REEL_COUNT }, (_, i) => finalSymbols?.[i] ?? fallback[i]!);
}

interface SlotMachineRigProps {
  spinKey: number;
  finalSymbols?: SlotMachineSymbol[] | null;
  onResolved?: (symbols: SlotMachineSymbol[], resolution: SlotMachineResolution) => void;
}

export function SlotMachineRig({ spinKey, finalSymbols, onResolved }: SlotMachineRigProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const phaseRef = useRef<SlotMachinePhase>('idle');
  const finalSymbolsRef = useRef<SlotMachineSymbol[] | null | undefined>(finalSymbols);
  const onResolvedRef = useRef<typeof onResolved>(onResolved);
  const [resolution, setResolution] = useState<SlotMachineResolution | null>(null);

  const totalWidth = REEL_COUNT * REEL_WIDTH + (REEL_COUNT - 1) * 4 + FRAME_PAD * 2;
  const totalHeight = REEL_HEIGHT + FRAME_PAD * 2;

  const reelsRef = useRef<ReelState[]>(
    Array.from({ length: REEL_COUNT }, (_, i) => ({
      strip: Array.from({ length: STRIP_LENGTH }, (_, j) => SYMBOLS[(i + j) % SYMBOLS.length]!),
      offset: 0,
      speed: 0,
      spinning: false,
      stopAt: 0,
      finalIndex: 0,
      stopPlayed: true,
    })),
  );

  useEffect(() => {
    finalSymbolsRef.current = finalSymbols;
  }, [finalSymbols]);

  useEffect(() => {
    onResolvedRef.current = onResolved;
  }, [onResolved]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    let lastT = performance.now();

    const render = (now: number) => {
      const dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;

      ctx.clearRect(0, 0, totalWidth, totalHeight);

      // frame
      ctx.fillStyle = '#1a0a22';
      ctx.fillRect(0, 0, totalWidth, totalHeight);
      ctx.strokeStyle = '#c77cff';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, totalWidth - 2, totalHeight - 2);

      const reels = reelsRef.current;
      let allStopped = phaseRef.current === 'spinning';
      for (let i = 0; i < reels.length; i++) {
        const reel = reels[i]!;
        if (reel.spinning) {
          reel.offset += reel.speed * dt;
          if (reel.offset >= SYMBOL_SIZE * STRIP_LENGTH) {
            reel.offset -= SYMBOL_SIZE * STRIP_LENGTH;
          }
          if (now >= reel.stopAt) {
            reel.spinning = false;
            const targetOffset = reel.finalIndex * SYMBOL_SIZE - SYMBOL_SIZE;
            reel.offset = ((targetOffset % (SYMBOL_SIZE * STRIP_LENGTH)) + SYMBOL_SIZE * STRIP_LENGTH) % (SYMBOL_SIZE * STRIP_LENGTH);
            if (!reel.stopPlayed) {
              reel.stopPlayed = true;
              playSfx('slot_stop');
              haptic(HAPTIC.tap);
            }
          }
        }
        allStopped = allStopped && !reel.spinning;

        const rx = FRAME_PAD + i * (REEL_WIDTH + 4);
        const ry = FRAME_PAD;

        ctx.save();
        ctx.beginPath();
        ctx.rect(rx, ry, REEL_WIDTH, REEL_HEIGHT);
        ctx.clip();

        ctx.fillStyle = '#05050c';
        ctx.fillRect(rx, ry, REEL_WIDTH, REEL_HEIGHT);

        const scroll = reel.offset % (SYMBOL_SIZE * STRIP_LENGTH);
        const firstIdx = Math.floor(scroll / SYMBOL_SIZE);
        const yShift = -(scroll % SYMBOL_SIZE);

        for (let s = -1; s < 4; s++) {
          const idx = ((firstIdx + s) % STRIP_LENGTH + STRIP_LENGTH) % STRIP_LENGTH;
          const sy = ry + s * SYMBOL_SIZE + yShift;
          drawSymbol(ctx, rx + 2, sy, reel.strip[idx]!);
        }

        ctx.restore();

        ctx.strokeStyle = '#3a1e5c';
        ctx.lineWidth = 1;
        ctx.strokeRect(rx + 0.5, ry + 0.5, REEL_WIDTH - 1, REEL_HEIGHT - 1);
      }

      const midY = FRAME_PAD + SYMBOL_SIZE;
      ctx.strokeStyle =
        resolution === 'big'
          ? '#ffd86b'
          : resolution === 'small'
            ? '#c77cff'
            : resolution === 'lose'
              ? 'rgba(120, 60, 180, 0.45)'
              : 'rgba(199, 124, 255, 0.65)';
      ctx.lineWidth = 2;
      ctx.strokeRect(FRAME_PAD - 2, midY - 2, totalWidth - (FRAME_PAD - 2) * 2, SYMBOL_SIZE + 4);

      if (allStopped && phaseRef.current === 'spinning') {
        phaseRef.current = 'resolved';
        const result = reels.map((r) => r.strip[r.finalIndex]!);
        const res = resolvePayout(result);
        setResolution(res);
        if (res === 'big') {
          playSfx('slot_win_big');
          haptic([30, 30, 60]);
        } else if (res === 'small') {
          playSfx('slot_win_small');
          haptic(HAPTIC.upgrade);
        }
        onResolvedRef.current?.(result, res);
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [totalWidth, totalHeight, resolution]);

  useEffect(() => {
    if (spinKey <= 0 || phaseRef.current === 'spinning') return;
    phaseRef.current = 'spinning';
    setResolution(null);

    const finals = normalizeFinals(finalSymbolsRef.current);
    const now = performance.now();
    const reels = reelsRef.current;
    for (let i = 0; i < reels.length; i++) {
      const reel = reels[i]!;
      const { strip, finalIndex } = makeStrip(finals[i]!, i);
      reel.strip = strip;
      reel.finalIndex = finalIndex;
      reel.offset = Math.random() * SYMBOL_SIZE * STRIP_LENGTH;
      reel.speed = 1400 + Math.random() * 180;
      reel.spinning = true;
      reel.stopPlayed = false;
      reel.stopAt = now + 900 + i * 450;
    }

    playSfx('slot_spin');
    haptic(HAPTIC.tap);
  }, [spinKey]);

  return (
    <canvas
      ref={canvasRef}
      width={totalWidth}
      height={totalHeight}
      className="slot-canvas"
    />
  );
}

export function SlotMachineStation() {
  const [phase, setPhase] = useState<SlotMachinePhase>('idle');
  const [resolution, setResolution] = useState<SlotMachineResolution | null>(null);
  const [resultSymbols, setResultSymbols] = useState<string[] | null>(null);
  const [spinKey, setSpinKey] = useState(0);
  const [pulls, setPulls] = useState(0);

  const pull = () => {
    if (phase === 'spinning') return;
    setPhase('spinning');
    setResolution(null);
    setResultSymbols(null);
    setSpinKey((key) => key + 1);
    setPulls((n) => n + 1);
  };

  const spinning = phase === 'spinning';
  const resultLabel =
    phase === 'idle'
      ? 'PULL THE LEVER'
      : phase === 'spinning'
        ? 'SPINNING...'
        : resolution === 'big'
          ? `JACKPOT · 3× ${resultSymbols?.[0]}`
          : resolution === 'small'
            ? `TWO-OF-A-KIND · ${resultSymbols?.join(' · ')}`
            : `NO MATCH · ${resultSymbols?.join(' · ')}`;

  const resultClass =
    phase === 'resolved'
      ? resolution === 'big'
        ? 'result-big'
        : resolution === 'small'
          ? 'result-small'
          : 'result-lose'
      : 'result-idle';

  return (
    <div className="station-slot">
      <div className="station-intro pixel-text">
        Three reels. Match them all for the jackpot. Cost: nothing in the sandbox.
      </div>
      <div className="slot-wrap">
        <SlotMachineRig
          spinKey={spinKey}
          onResolved={(symbols, res) => {
            setPhase('resolved');
            setResolution(res);
            setResultSymbols(symbols.map((symbol) => SYMBOL_LABEL[symbol]));
          }}
        />
      </div>
      <div className={`slot-result pixel-text ${resultClass}`} aria-live="polite">
        {resultLabel}
      </div>
      <button type="button" className="slot-lever pixel-text" onClick={pull} disabled={spinning}>
        ▸ {spinning ? 'ROLLING' : 'PULL'}
        <span className="slot-lever-sub">PULL {pulls.toString().padStart(3, '0')}</span>
      </button>
    </div>
  );
}
