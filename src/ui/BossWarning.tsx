import { useStore } from '../state/store';
import { getEnemyType } from '../content/enemies/registry';

export function BossWarning() {
  const bossId = useStore((s) => s.bossWarnTypeId);
  const type = bossId ? getEnemyType(bossId) : null;
  const name = (type?.name ?? 'Boss Incoming').toUpperCase();
  const dossier = type?.bossDossier;
  const title = (dossier?.title ?? type?.role ?? 'House Warden').toUpperCase();
  const lore = dossier?.lore ?? type?.lore ?? 'The House sends a warden to change the rules.';
  const rule = dossier?.rule ?? type?.mechanicDesc ?? 'Watch the dice. This boss changes the rules.';
  const weakness = dossier?.weakness ?? type?.weakness ?? 'Adapt quickly and punish the opening.';
  const phaseHint = dossier?.phaseLines?.[1] ?? type?.threat ?? 'The rule escalates as the warden weakens.';

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

        <div className="boss-warn-title">{title}</div>

        <div className="tagline-ribbon upg-ribbon">
          <span className="tr-bracket">[</span>
          <span className="tr-track">{lore}</span>
          <span className="tr-bracket">]</span>
        </div>

        <div className="boss-dossier">
          <div className="boss-dossier-row">
            <span>RULE</span>
            <strong>{rule}</strong>
          </div>
          <div className="boss-dossier-row">
            <span>CRACK</span>
            <strong>{weakness}</strong>
          </div>
          <div className="boss-dossier-row">
            <span>PHASE</span>
            <strong>{phaseHint}</strong>
          </div>
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
