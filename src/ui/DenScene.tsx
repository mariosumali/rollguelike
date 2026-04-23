import { useState } from 'react';
import { useStore } from '../state/store';
import { playSfx } from '../audio/sfx';
import { CoinFlipStation } from './den/CoinFlipStation';
import { SlotMachineStation } from './den/SlotMachineStation';
import { RouletteStation } from './den/RouletteStation';

interface Station {
  id: StationId;
  name: string;
  tagline: string;
  glyph: string;
  status: 'coming-soon' | 'prototype';
}

type StationId = 'coin' | 'slot' | 'roulette' | 'cards';

const STATIONS: Station[] = [
  {
    id: 'coin',
    name: 'COIN FLIP',
    tagline: 'Binary fate. Tap to flip.',
    glyph: '◉',
    status: 'prototype',
  },
  {
    id: 'slot',
    name: 'SLOT MACHINE',
    tagline: 'Three reels. One jackpot.',
    glyph: '▦',
    status: 'prototype',
  },
  {
    id: 'roulette',
    name: 'ROULETTE',
    tagline: 'Place your bets before it spins.',
    glyph: '◎',
    status: 'prototype',
  },
  {
    id: 'cards',
    name: 'CARD DRAW',
    tagline: 'A hand of four. Play wisely.',
    glyph: '♠',
    status: 'coming-soon',
  },
];

export function DenScene() {
  const setScreen = useStore((s) => s.setScreen);
  const [activeStation, setActiveStation] = useState<StationId | null>(null);

  const onBack = () => {
    playSfx('ui_click');
    setScreen('menu');
  };

  const onPickStation = (id: StationId) => {
    playSfx('ui_click');
    setActiveStation((cur) => (cur === id ? null : id));
  };

  const active = activeStation ? STATIONS.find((s) => s.id === activeStation) ?? null : null;

  return (
    <div className="screen den pixel-text">
      <div className="menu-vignette" aria-hidden />
      <div className="menu-scanlines" aria-hidden />

      <div className="den-toolbar">
        <button className="toolbar-btn" aria-label="back to menu" onClick={onBack}>
          ◂
        </button>
      </div>

      <div className="den-inner">
        <div className="den-heading">
          <h1 className="den-title">THE DEN</h1>
          <div className="den-sub">[ WHERE FATE GETS WEIRDER ]</div>
        </div>

        <div className="den-intro">
          A sandbox for new gambling rigs. Each station here is a prototype for
          a mechanic we might fold into a run.
        </div>

        <div className="den-stations">
          {STATIONS.map((station) => {
            const isActive = activeStation === station.id;
            return (
              <button
                key={station.id}
                type="button"
                className={`den-station ${isActive ? 'active' : ''}`}
                onClick={() => onPickStation(station.id)}
                aria-pressed={isActive}
              >
                <div className="den-station-head">
                  <span className="den-station-glyph" aria-hidden>
                    {station.glyph}
                  </span>
                  <span className="den-station-name">{station.name}</span>
                </div>
                <div className="den-station-tag">{station.tagline}</div>
                <div className={`den-station-status status-${station.status}`}>
                  {station.status === 'coming-soon' ? 'COMING SOON' : 'PROTOTYPE'}
                </div>
              </button>
            );
          })}
        </div>

        <div className={`den-stage ${active ? 'is-active' : ''}`} aria-live="polite">
          {active ? (
            <>
              <div className="den-stage-head">
                <span className="den-stage-glyph" aria-hidden>{active.glyph}</span>
                <span className="den-stage-name">{active.name}</span>
              </div>
              <div className="den-stage-body">
                {active.id === 'coin' ? (
                  <CoinFlipStation />
                ) : active.id === 'slot' ? (
                  <SlotMachineStation />
                ) : active.id === 'roulette' ? (
                  <RouletteStation />
                ) : (
                  <>
                    {active.tagline}
                    <br />
                    <span className="den-stage-hint">Rig not wired up yet — tap a different station.</span>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="den-stage-empty">
              Pick a station above to load its rig.
            </div>
          )}
        </div>

        <div className="den-foot">
          <span className="foot-seg">SANDBOX</span>
          <span className="foot-dot">◆</span>
          <span className="foot-seg">NO RUN AFFECTED</span>
        </div>
      </div>
    </div>
  );
}
