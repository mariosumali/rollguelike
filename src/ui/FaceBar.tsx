import { useEffect, useRef, useState } from 'react';
import { getRunState } from '../state/store';
import { getFaceUpgrade } from '../content/upgrades/faceRegistry';
import { getFaceIconRows, getFaceIconCacheKey } from '../content/upgrades/faceIcons';
import { getFaceName } from '../content/upgrades/faceNames';
import { buildFaceIconCanvas } from '../sprites/dice';
import type { Rarity } from '../types';

const RARITY_COLORS: Record<Rarity, string> = {
  common: 'var(--common)',
  rare: 'var(--rare)',
  epic: 'var(--epic)',
  legendary: 'var(--legendary)',
};

function FaceIcon({ upgradeId, characterId }: { upgradeId: string | null; characterId: string | null }) {
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

    const scale = Math.max(1, Math.floor(Math.min(c.width / src.width, c.height / src.height)));
    const drawW = src.width * scale;
    const drawH = src.height * scale;
    const dx = Math.round((c.width - drawW) / 2);
    const dy = Math.round((c.height - drawH) / 2);
    ctx.drawImage(src, 0, 0, src.width, src.height, dx, dy, drawW, drawH);
  }, [upgradeId, characterId]);

  return <canvas ref={ref} width={28} height={28} className="fb-icon" />;
}

export function FaceBar() {
  const [, forceTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => forceTick((t) => t + 1), 250);
    return () => window.clearInterval(id);
  }, []);

  const run = getRunState();
  if (!run) return null;

  const slots = run.slotLayout ?? [];
  const characterId = run.characterId ?? null;
  const faces = Array.from({ length: 6 }, (_, i) => {
    const slot = slots[i];
    const replacerId = slot?.replacerId ?? null;
    const up = replacerId ? getFaceUpgrade(replacerId) : null;
    const supCount = slot?.supplementIds.length ?? 0;
    return { value: i + 1, replacerId, upgrade: up, supCount };
  });

  return (
    <div className="face-bar pixel-text" aria-label="face bindings">
      {faces.map((f) => {
        const rarity = f.upgrade?.rarity;
        const accent = rarity ? RARITY_COLORS[rarity] : 'var(--fg-dim)';
        const name = f.upgrade
          ? getFaceName(f.upgrade.id, characterId, f.upgrade.name)
          : '—';
        const kindTag = !f.upgrade
          ? 'EMPTY'
          : f.upgrade.kind === 'replacer'
            ? ''
            : 'MOD';
        return (
          <div
            key={f.value}
            className={`fb-chip ${f.upgrade ? '' : 'is-empty'}`}
            style={{ ['--fb-accent' as string]: accent }}
            title={
              f.upgrade
                ? `Face ${f.value} · ${name}${f.supCount > 0 ? ` (+${f.supCount})` : ''}\n${f.upgrade.description}`
                : `Face ${f.value} · empty slot`
            }
          >
            <div className="fb-chip-head">
              <span className="fb-pip" aria-hidden>{f.value}</span>
              {kindTag && <span className="fb-kind">{kindTag}</span>}
            </div>
            <FaceIcon upgradeId={f.replacerId} characterId={characterId} />
            <div className="fb-name" aria-label={name}>
              {name}
            </div>
            {f.supCount > 0 && (
              <div className="fb-sup-dots" aria-label={`${f.supCount} supplements`}>
                {Array.from({ length: Math.min(f.supCount, 4) }).map((_, i) => (
                  <span key={i} className="fb-sup-dot">◆</span>
                ))}
                {f.supCount > 4 && <span className="fb-sup-more">+{f.supCount - 4}</span>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
