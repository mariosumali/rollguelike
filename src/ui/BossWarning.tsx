import { useStore } from '../state/store';
import { getEnemyType } from '../content/enemies/registry';

export function BossWarning() {
  const bossId = useStore((s) => s.bossWarnTypeId);
  const type = bossId ? getEnemyType(bossId) : null;
  const name = (type?.name ?? 'Boss Incoming').toUpperCase();

  return (
    <div className="overlay boss-warn boss-warn-v2">
      <div className="boss-warn-flash" aria-hidden />
      <div className="menu-scanlines boss-warn-scanlines" aria-hidden />

      <div className="boss-warn-inner pixel-text">
        <span className="panel-corner pc-tl boss-corner" aria-hidden />
        <span className="panel-corner pc-tr boss-corner" aria-hidden />
        <span className="panel-corner pc-bl boss-corner" aria-hidden />
        <span className="panel-corner pc-br boss-corner" aria-hidden />

        <div className="boss-warn-head">
          <span className="bw-chev">▶</span>
          <span className="boss-warn-sub">!! WARNING !!</span>
          <span className="bw-chev">◀</span>
        </div>

        <div className="boss-warn-name-wrap">
          <span className="bwn-shadow" aria-hidden>{name}</span>
          <span className="bwn-main">{name}</span>
        </div>

        <div className="boss-warn-foot">
          <span className="bw-line" />
          <span className="boss-warn-sub">APPROACHING</span>
          <span className="bw-line" />
        </div>
      </div>
    </div>
  );
}
