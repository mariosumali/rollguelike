import type { Character } from '../types';
import type { SlotState } from '../content/upgrades/types';
import { BALANCE } from '../config/balance';

export function createSlotLayout(character: Character): SlotState[] {
  const count = BALANCE.slot.slotsPerCharacter;
  const cap = BALANCE.slot.supplementsDefault;
  const defaults = character.defaultFaces ?? [];
  return Array.from({ length: count }, (_, i) => ({
    index: i,
    replacerId: defaults[i]?.upgradeId ?? null,
    supplementIds: [],
    supplementCap: cap,
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
  return slot.supplementIds.length < slot.supplementCap;
}

export function expandSlot(slot: SlotState): boolean {
  if (slot.supplementCap >= BALANCE.slot.supplementsMax) return false;
  slot.supplementCap += 1;
  return true;
}
