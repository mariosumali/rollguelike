import { useEffect, useRef, useState } from 'react';
import { playSfx } from '../../audio/sfx';
import { haptic, HAPTIC } from '../../audio/haptics';

type Face = 'H' | 'T';
type Mode = 'arc' | 'spin';

interface FlipState {
  active: boolean;
  startedAt: number;
  duration: number;
  outcome: Face;
  played: boolean;
}

const ARC_W = 112;
const ARC_H = 160;
const ARC_PEAK = 82;
const ARC_REST_FROM_BOTTOM = 42;
const SPIN_W = 112;
const SPIN_H = 112;

const COIN_R = 28;
const COIN_THICKNESS = 7;

const GLYPH_H: number[][] = [
  [1, 0, 0, 0, 1],
  [1, 0, 0, 0, 1],
  [1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1],
  [1, 0, 0, 0, 1],
];

const GLYPH_T: number[][] = [
  [1, 1, 1, 1, 1],
  [0, 0, 1, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 0, 1, 0, 0],
];

function drawCoin(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  flipPhase: number,
  displayFace: Face,
  shine: number,
): void {
  const cosPhase = Math.cos(flipPhase * Math.PI);
  const ry = COIN_R * Math.abs(cosPhase);
  const halfT = COIN_THICKNESS / 2;
  const edge = ry < 2;

  ctx.save();

  if (edge) {
    const edgeGrad = ctx.createLinearGradient(cx, cy - halfT, cx, cy + halfT);
    edgeGrad.addColorStop(0, '#6b4410');
    edgeGrad.addColorStop(0.35, '#c88a18');
    edgeGrad.addColorStop(0.55, '#ffe89a');
    edgeGrad.addColorStop(0.8, '#d49a28');
    edgeGrad.addColorStop(1, '#4a2a08');
    ctx.fillStyle = edgeGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, COIN_R, halfT, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2a1804';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 250, 220, 0.6)';
    ctx.fillRect(cx - COIN_R + 3, cy - 1, COIN_R * 2 - 6, 1);
    ctx.restore();
    return;
  }

  const facingFront = cosPhase > 0;
  const tiltAmt = 1 - ry / COIN_R;
  const rimVisible = tiltAmt * halfT * 1.6;

  if (rimVisible > 0.4) {
    const rimShift = facingFront ? rimVisible : -rimVisible;
    const rimGrad = ctx.createLinearGradient(cx - COIN_R, cy, cx + COIN_R, cy);
    rimGrad.addColorStop(0, '#3a2408');
    rimGrad.addColorStop(0.5, '#8a5a18');
    rimGrad.addColorStop(1, '#3a2408');
    ctx.fillStyle = rimGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy + rimShift, COIN_R, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2a1804';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  const grad = ctx.createRadialGradient(
    cx - COIN_R * 0.45,
    cy - ry * 0.55,
    COIN_R * 0.1,
    cx + COIN_R * 0.15,
    cy + ry * 0.3,
    COIN_R * 1.15,
  );
  grad.addColorStop(0, '#fff6c8');
  grad.addColorStop(0.2, '#ffe89a');
  grad.addColorStop(0.55, '#ffd86b');
  grad.addColorStop(0.85, '#c88a1c');
  grad.addColorStop(1, '#6b4410');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(cx, cy, COIN_R, ry, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#2a1804';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 250, 220, 0.75)';
  ctx.lineWidth = 1.25;
  ctx.beginPath();
  ctx.ellipse(cx, cy - Math.max(0.4, ry * 0.06), COIN_R - 3, Math.max(1, ry - 3), 0, Math.PI * 0.15, Math.PI * 0.95);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(80, 45, 10, 0.55)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(cx, cy + Math.max(0.4, ry * 0.06), COIN_R - 3, Math.max(1, ry - 3), 0, Math.PI * 1.05, Math.PI * 1.95);
  ctx.stroke();

  const glyph = displayFace === 'H' ? GLYPH_H : GLYPH_T;
  const px = 4;
  const glyphW = glyph[0]!.length * px;
  const glyphH = glyph.length * px;
  const squash = ry / COIN_R;
  const gx = Math.round(cx - glyphW / 2);
  const gy = Math.round(cy - (glyphH * squash) / 2);
  ctx.fillStyle = 'rgba(255, 250, 220, 0.35)';
  for (let r = 0; r < glyph.length; r++) {
    for (let c = 0; c < glyph[r]!.length; c++) {
      if (!glyph[r]![c]) continue;
      ctx.fillRect(gx + c * px + 1, Math.round(gy + r * px * squash) + 1, px, Math.max(1, Math.round(px * squash)));
    }
  }
  ctx.fillStyle = '#3a2008';
  for (let r = 0; r < glyph.length; r++) {
    for (let c = 0; c < glyph[r]!.length; c++) {
      if (!glyph[r]![c]) continue;
      ctx.fillRect(gx + c * px, Math.round(gy + r * px * squash), px, Math.max(1, Math.round(px * squash)));
    }
  }

  if (shine > 0) {
    ctx.globalAlpha = Math.min(1, shine);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(cx - COIN_R * 0.42, cy - ry * 0.55, COIN_R * 0.28, Math.max(0.5, ry * 0.2), -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = Math.min(1, shine * 0.5);
    ctx.beginPath();
    ctx.ellipse(cx + COIN_R * 0.25, cy - ry * 0.35, COIN_R * 0.14, Math.max(0.4, ry * 0.1), -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

function drawShadow(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number): void {
  ctx.save();
  const spread = COIN_R * (1 + (1 - scale) * 0.6);
  const alpha = 0.45 * Math.max(0.15, scale);
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, spread);
  grad.addColorStop(0, `rgba(0, 0, 0, ${alpha})`);
  grad.addColorStop(0.55, `rgba(0, 0, 0, ${alpha * 0.55})`);
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(cx, cy, spread, Math.max(2.5, 5 * scale), 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function useFlipAnimator(mode: Mode, width: number, height: number) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const requestRenderRef = useRef<() => void>(() => undefined);
  const flipRef = useRef<FlipState>({ active: false, startedAt: 0, duration: 0, outcome: 'H', played: false });
  const restingFace = useRef<Face>('H');
  const [outcome, setOutcome] = useState<Face | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    const drawFrame = (now: number): boolean => {
      ctx.clearRect(0, 0, width, height);

      const groundY = mode === 'arc' ? height - ARC_REST_FROM_BOTTOM : height / 2;
      const cxBase = width / 2;

      const flip = flipRef.current;
      let cy = groundY;
      let flipPhase = 0;
      let faceForRender: Face = restingFace.current;
      let shadowScale = 1;
      let shine = 0.2;
      let keepAnimating = false;

      if (flip.active) {
        keepAnimating = true;
        const t = Math.min(1, (now - flip.startedAt) / flip.duration);
        const rotations = mode === 'arc' ? 6.5 : 9.5;
        const eased = mode === 'arc' ? t : 1 - Math.pow(1 - t, 3);
        const totalRot = rotations * eased;
        flipPhase = totalRot % 1;

        const halfRotsDone = Math.floor(totalRot * 2);
        faceForRender = halfRotsDone % 2 === 0 ? 'H' : 'T';

        if (mode === 'arc') {
          const arc = 4 * t * (1 - t);
          cy = groundY - ARC_PEAK * arc;
          shadowScale = 1 - arc * 0.55;
        } else {
          shine = 0.35 + 0.25 * Math.sin(now / 40);
        }

        if (t >= 1) {
          flip.active = false;
          keepAnimating = false;
          faceForRender = flip.outcome;
          flipPhase = 0;
          restingFace.current = flip.outcome;
          setOutcome(flip.outcome);
          if (!flip.played) {
            flip.played = true;
            playSfx(flip.outcome === 'H' ? 'coin_land_heads' : 'coin_land_tails');
            haptic(HAPTIC.land);
          }
        }
      }

      if (mode === 'arc') {
        drawShadow(ctx, cxBase, groundY + 14, shadowScale);
      }
      drawCoin(ctx, cxBase, cy, flipPhase, faceForRender, shine);

      return keepAnimating;
    };

    const render = (now: number) => {
      rafRef.current = null;
      if (drawFrame(now)) {
        rafRef.current = requestAnimationFrame(render);
      }
    };

    requestRenderRef.current = () => {
      if (rafRef.current == null) {
        rafRef.current = requestAnimationFrame(render);
      }
    };

    drawFrame(performance.now());
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      requestRenderRef.current = () => undefined;
    };
  }, [mode, width, height]);

  const flip = () => {
    if (flipRef.current.active) return;
    const outcome: Face = Math.random() < 0.5 ? 'H' : 'T';
    flipRef.current = {
      active: true,
      startedAt: performance.now(),
      duration: mode === 'arc' ? 1400 : 1100,
      outcome,
      played: false,
    };
    setOutcome(null);
    playSfx('coin_flip');
    haptic(HAPTIC.tap);
    requestRenderRef.current();
  };

  return { canvasRef, outcome, flip, flipping: flipRef.current.active };
}

function CoinRig({ mode, title, tagline }: { mode: Mode; title: string; tagline: string }) {
  const W = mode === 'arc' ? ARC_W : SPIN_W;
  const H = mode === 'arc' ? ARC_H : SPIN_H;
  const { canvasRef, outcome, flip } = useFlipAnimator(mode, W, H);

  const label = outcome == null ? '—' : outcome === 'H' ? 'HEADS' : 'TAILS';

  return (
    <div className="coin-rig">
      <div className="coin-rig-head pixel-text">
        <span className="coin-rig-title">{title}</span>
        <span className="coin-rig-tag">{tagline}</span>
      </div>
      <div className="coin-rig-stage">
        <canvas ref={canvasRef} width={W} height={H} className="coin-canvas" />
      </div>
      <div className={`coin-rig-result pixel-text result-${outcome ?? 'idle'}`}>
        {label}
      </div>
      <button type="button" className="coin-rig-btn pixel-text" onClick={flip}>
        ▸ FLIP
      </button>
    </div>
  );
}

export function CoinFlipStation() {
  return (
    <div className="station-coin">
      <div className="station-intro pixel-text">
        Binary fate. One arcs through the air, one spins in place. Same odds, different theatre.
      </div>
      <div className="coin-rig-row">
        <CoinRig mode="arc" title="ARC FLIP" tagline="THROW · RISE · FALL" />
        <CoinRig mode="spin" title="SPIN FLIP" tagline="EDGE-ON · IN PLACE" />
      </div>
    </div>
  );
}
