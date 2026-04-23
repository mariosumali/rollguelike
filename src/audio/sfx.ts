import { playTone, playNoiseBurst, playChord } from './synth';

type SfxId =
  | 'roll_start'
  | 'roll_land'
  | 'dice_tumble'
  | 'shot'
  | 'hit'
  | 'kill'
  | 'shield'
  | 'shield_block'
  | 'heal'
  | 'pulse'
  | 'wave_clear'
  | 'boss_warn'
  | 'boss_kill'
  | 'damage'
  | 'game_over'
  | 'ui_click'
  | 'ui_reroll'
  | 'upgrade_pick'
  | 'soul'
  | 'reaction'
  | 'reflect'
  | 'coin_flip'
  | 'coin_land_heads'
  | 'coin_land_tails'
  | 'slot_spin'
  | 'slot_stop'
  | 'slot_win_small'
  | 'slot_win_big'
  | 'roulette_spin'
  | 'roulette_tick'
  | 'roulette_land';

const SFX: Record<SfxId, () => void> = {
  roll_start: () => {
    playTone({ wave: 'square', freq: 140, freqEnd: 90, duration: 0.07, volume: 0.22, attack: 0.002, decay: 0.02 });
    playNoiseBurst(0.08, 2200, 0.15);
  },
  roll_land: () => {
    playTone({ wave: 'square', freq: 300, freqEnd: 220, duration: 0.09, volume: 0.25, attack: 0.002 });
    playNoiseBurst(0.05, 1200, 0.18);
  },
  dice_tumble: () => {
    // Gentle tumbling: soft triangle taps + low-pass noise, easy settle.
    const tapAt = (delay: number, freq: number, gain: number, noiseCut: number) => {
      setTimeout(() => {
        playTone({ wave: 'triangle', freq, freqEnd: freq * 0.78, duration: 0.055, volume: gain, attack: 0.004, decay: 0.025 });
        playNoiseBurst(0.035, noiseCut, gain * 0.5);
      }, delay);
    };
    tapAt(0, 240, 0.09, 900);
    tapAt(120, 200, 0.08, 800);
    tapAt(240, 270, 0.07, 950);
    setTimeout(() => {
      playTone({ wave: 'triangle', freq: 210, freqEnd: 140, duration: 0.14, volume: 0.11, attack: 0.006 });
      playNoiseBurst(0.06, 600, 0.07);
    }, 400);
  },
  shot: () => {
    playTone({ wave: 'triangle', freq: 660, freqEnd: 360, duration: 0.08, volume: 0.18 });
  },
  hit: () => {
    playTone({ wave: 'square', freq: 220, freqEnd: 140, duration: 0.06, volume: 0.2 });
    playNoiseBurst(0.04, 800, 0.1);
  },
  kill: () => {
    playTone({ wave: 'square', freq: 540, freqEnd: 180, duration: 0.12, volume: 0.22 });
    playNoiseBurst(0.08, 2000, 0.12);
  },
  shield: () => {
    playChord([440, 660, 880], { wave: 'triangle', duration: 0.18, volume: 0.18, attack: 0.01 });
  },
  shield_block: () => {
    playTone({ wave: 'square', freq: 900, duration: 0.1, volume: 0.24 });
    playTone({ wave: 'triangle', freq: 600, duration: 0.2, volume: 0.15 });
  },
  heal: () => {
    playChord([523, 659, 784], { wave: 'sine', duration: 0.3, volume: 0.16, attack: 0.02 });
  },
  pulse: () => {
    playTone({ wave: 'sawtooth', freq: 160, freqEnd: 60, duration: 0.22, volume: 0.2 });
    playNoiseBurst(0.18, 600, 0.12);
  },
  wave_clear: () => {
    playChord([523, 659, 784, 1046], { wave: 'triangle', duration: 0.35, volume: 0.18, attack: 0.02 });
  },
  boss_warn: () => {
    playTone({ wave: 'sawtooth', freq: 110, freqEnd: 55, duration: 0.6, volume: 0.25, vibrato: 6 });
    playTone({ wave: 'square', freq: 220, duration: 0.4, volume: 0.12 });
  },
  boss_kill: () => {
    playChord([220, 330, 440, 660], { wave: 'sawtooth', duration: 0.6, volume: 0.22 });
    playNoiseBurst(0.4, 2000, 0.14);
  },
  damage: () => {
    playTone({ wave: 'sawtooth', freq: 180, freqEnd: 80, duration: 0.22, volume: 0.28 });
    playNoiseBurst(0.15, 500, 0.18);
  },
  game_over: () => {
    playChord([220, 196, 165, 131], { wave: 'triangle', duration: 0.9, volume: 0.22 });
  },
  ui_click: () => {
    playTone({ wave: 'square', freq: 880, duration: 0.04, volume: 0.12 }, 'ui');
  },
  ui_reroll: () => {
    playTone({ wave: 'square', freq: 440, freqEnd: 660, duration: 0.08, volume: 0.15 }, 'ui');
    playTone({ wave: 'square', freq: 660, freqEnd: 880, duration: 0.08, volume: 0.12 }, 'ui');
  },
  upgrade_pick: () => {
    playChord([523, 659, 784, 1046], { wave: 'triangle', duration: 0.4, volume: 0.2, attack: 0.01 });
  },
  soul: () => {
    playTone({ wave: 'sine', freq: 660, freqEnd: 1320, duration: 0.18, volume: 0.15 });
  },
  reaction: () => {
    playChord([330, 440, 554, 660], { wave: 'sawtooth', duration: 0.25, volume: 0.22 });
    playNoiseBurst(0.2, 2000, 0.15);
  },
  reflect: () => {
    playTone({ wave: 'square', freq: 880, freqEnd: 1320, duration: 0.07, volume: 0.18 });
  },

  coin_flip: () => {
    playTone({ wave: 'triangle', freq: 520, freqEnd: 1200, duration: 0.14, volume: 0.14, attack: 0.002 });
    playNoiseBurst(0.06, 3200, 0.06);
  },
  coin_land_heads: () => {
    playChord([988, 1319, 1760], { wave: 'triangle', duration: 0.28, volume: 0.18, attack: 0.002, decay: 0.06 });
    playTone({ wave: 'sine', freq: 2200, duration: 0.08, volume: 0.08 });
  },
  coin_land_tails: () => {
    playChord([392, 523, 659], { wave: 'triangle', duration: 0.28, volume: 0.16, attack: 0.002, decay: 0.06 });
    playNoiseBurst(0.05, 600, 0.08);
  },

  slot_spin: () => {
    playTone({ wave: 'sawtooth', freq: 90, freqEnd: 220, duration: 0.25, volume: 0.1, vibrato: 12 });
    playNoiseBurst(0.22, 1400, 0.07);
  },
  slot_stop: () => {
    playTone({ wave: 'square', freq: 220, freqEnd: 140, duration: 0.06, volume: 0.22, attack: 0.001 });
    playNoiseBurst(0.035, 500, 0.1);
  },
  slot_win_small: () => {
    playChord([523, 659, 784], { wave: 'triangle', duration: 0.3, volume: 0.18, attack: 0.01 });
  },
  slot_win_big: () => {
    playChord([523, 659, 784, 1046, 1319], { wave: 'triangle', duration: 0.55, volume: 0.22, attack: 0.02, decay: 0.08 });
    playNoiseBurst(0.3, 3600, 0.1);
  },

  roulette_spin: () => {
    playTone({ wave: 'sawtooth', freq: 70, freqEnd: 140, duration: 0.55, volume: 0.1, vibrato: 5 });
    playNoiseBurst(0.5, 900, 0.05);
  },
  roulette_tick: () => {
    playTone({ wave: 'square', freq: 1500, duration: 0.02, volume: 0.14, attack: 0.0005, decay: 0.005 });
  },
  roulette_land: () => {
    playTone({ wave: 'triangle', freq: 660, freqEnd: 300, duration: 0.25, volume: 0.18 });
    playNoiseBurst(0.09, 700, 0.1);
  },
};

export function playSfx(id: SfxId): void {
  try {
    SFX[id]?.();
  } catch {}
}
