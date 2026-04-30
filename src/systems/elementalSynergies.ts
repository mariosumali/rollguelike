import type { Element, RunState } from '../types';
import { getCharacter } from '../content/characters/registry';
import { getFaceUpgrade } from '../content/upgrades/faceRegistry';
import type { Effect, FaceUpgrade } from '../content/upgrades/types';

export type SynergyElement = Exclude<Element, 'none'>;

export interface ElementalSynergyState {
  counts: Record<SynergyElement, number>;
  active: Record<SynergyElement, 0 | 3 | 5>;
  label: string;
  desc: string;
  milestones: string[];
}

const ELEMENTS: SynergyElement[] = ['fire', 'ice', 'poison', 'lightning', 'arcane'];

const TAG_TO_ELEMENT: Record<string, SynergyElement> = {
  fire: 'fire',
  burn: 'fire',
  ice: 'ice',
  frost: 'ice',
  water: 'ice',
  poison: 'poison',
  venom: 'poison',
  lightning: 'lightning',
  storm: 'lightning',
  arc: 'lightning',
  arcane: 'arcane',
  void: 'arcane',
};

const SET_NAMES: Record<SynergyElement, { three: string; five: string; desc3: string; desc5: string }> = {
  fire: {
    three: 'EMBER 3',
    five: 'INFERNO 5',
    desc3: 'Fire hits and burns hit much harder; burning kills ignite nearby enemies.',
    desc5: 'Every third fire roll detonates a large inferno wave.',
  },
  ice: {
    three: 'RIME 3',
    five: 'SHATTER 5',
    desc3: 'Freezes last longer and chilled enemies take heavy bonus damage.',
    desc5: 'Frozen kills shatter into frost damage and spread a new freeze.',
  },
  poison: {
    three: 'VENOM 3',
    five: 'PLAGUE 5',
    desc3: 'Poison lasts longer, ticks harder, and spreads on poisoned kills.',
    desc5: 'Poison hits mark enemies with plague pulses that punish packs and bosses.',
  },
  lightning: {
    three: 'SPARK 3',
    five: 'STORM 5',
    desc3: 'Lightning damage, chain reach, and charged vulnerability are much stronger.',
    desc5: 'Every third lightning roll calls a storm strike across the board.',
  },
  arcane: {
    three: 'RIFT 3',
    five: 'PRISM 5',
    desc3: 'Arcane pulses, beams, and reactions hit wider and harder.',
    desc5: 'Reactions echo with larger prism pulses and arcane counts as a mixed-build wildcard.',
  },
};

function emptyCounts(): Record<SynergyElement, number> {
  return { fire: 0, ice: 0, poison: 0, lightning: 0, arcane: 0 };
}

function elementFromTags(tags: readonly string[] | undefined): SynergyElement | null {
  for (const tag of tags ?? []) {
    const element = TAG_TO_ELEMENT[tag.toLowerCase()];
    if (element) return element;
  }
  return null;
}

function elementFromEffect(effect: Effect): SynergyElement | null {
  const explicit = 'element' in effect ? effect.element : undefined;
  if (explicit && explicit !== 'none') return explicit;
  switch (effect.verb) {
    case 'applyStatus':
      if (effect.status === 'burn') return 'fire';
      if (effect.status === 'freeze' || effect.status === 'slow' || effect.status === 'stun') return 'ice';
      if (effect.status === 'poison') return 'poison';
      if (effect.status === 'mark') return 'arcane';
      return null;
    case 'chainLightning':
    case 'column':
      return 'lightning';
    case 'flamePillar':
      return 'fire';
    case 'frostBurst':
      return 'ice';
    case 'pull':
    case 'beam':
      return null;
    default:
      return null;
  }
}

function elementFromUpgrade(upgrade: FaceUpgrade | null): SynergyElement | null {
  if (!upgrade) return null;
  const tagged = elementFromTags(upgrade.tags);
  if (tagged) return tagged;
  for (const effect of upgrade.effect.effects) {
    const element = elementFromEffect(effect);
    if (element) return element;
  }
  return null;
}

function slotElement(run: RunState, slotIndex: number): SynergyElement | null {
  const slot = run.slotLayout?.[slotIndex];
  const replacer = slot?.replacerId ? getFaceUpgrade(slot.replacerId) ?? null : null;
  const replacerElement = elementFromUpgrade(replacer);
  if (replacerElement) return replacerElement;

  const character = getCharacter(run.characterId);
  const baseline = character?.defaultFaces?.[slotIndex]?.face.element;
  return baseline && baseline !== 'none' ? baseline : null;
}

export function collectElementalSynergy(run: RunState | null | undefined): ElementalSynergyState {
  const counts = emptyCounts();
  if (!run) {
    return { counts, active: { fire: 0, ice: 0, poison: 0, lightning: 0, arcane: 0 }, label: '', desc: '', milestones: [] };
  }

  for (let i = 0; i < 6; i++) {
    const element = slotElement(run, i);
    if (element) counts[element]++;
  }

  const active: ElementalSynergyState['active'] = { fire: 0, ice: 0, poison: 0, lightning: 0, arcane: 0 };
  for (const element of ELEMENTS) {
    active[element] = counts[element] >= 5 ? 5 : counts[element] >= 3 ? 3 : 0;
  }

  const labels: string[] = [];
  const descs: string[] = [];
  const milestones: string[] = [];
  for (const element of ELEMENTS) {
    const level = active[element];
    if (!level) continue;
    const names = SET_NAMES[element];
    labels.push(level >= 5 ? names.five : names.three);
    descs.push(level >= 5 ? names.desc5 : names.desc3);
    milestones.push(`${element}_${level}`);
  }

  return {
    counts,
    active,
    label: labels.join(' · '),
    desc: descs.join(' '),
    milestones,
  };
}

export function hasElementalSet(run: RunState, element: SynergyElement, level: 3 | 5): boolean {
  return collectElementalSynergy(run).active[element] >= level;
}

export function syncElementalMilestones(run: RunState, synergy = collectElementalSynergy(run)): void {
  if (synergy.milestones.length === 0) return;
  const seen = new Set(run.elementalMilestonesSeen ?? []);
  for (const id of synergy.milestones) seen.add(id);
  run.elementalMilestonesSeen = Array.from(seen);
}
