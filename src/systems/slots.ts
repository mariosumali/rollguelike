import type { Character } from '../types';
import type { SlotState } from '../content/upgrades/types';
import { BALANCE } from '../config/balance';

export function createSlotLayout(character: Character): SlotState[] {
  const count = BALANCE.slot.slotsPerCharacter;
  void character;
  return Array.from({ length: count }, (_, i) => ({
    index: i,
    replacerId: null,
    supplementIds: [],
    // Supplements are dormant while global relics own run-shaping passives.
    supplementCap: 0,
  }));
}

export function isSlotLocked(character: Character, slotIndex: number): boolean {
  return (character.lockedSlots ?? []).includes(slotIndex);
}

export function slotAllowsReplacer(character: Character, slotIndex: number): boolean {
  if (isSlotLocked(character, slotIndex)) return false;
  return true;
}

export function slotAllowedTags(character: Character, slotIndex: number): string[] | null {
  const r = (character.restrictedKinds ?? []).find((x) => x.slotIndex === slotIndex);
  if (!r || !r.allowedTags || r.allowedTags.length === 0) return null;
  return r.allowedTags;
}

export function canPlaceSupplement(slot: SlotState): boolean {
  void slot;
  return false;
}

export function expandSlot(slot: SlotState): boolean {
  // Dormant supplement capacity system retained for possible future reuse.
  void slot;
  return false;
}
