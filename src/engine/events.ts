export type GameEventKind =
  | 'wave-start'
  | 'wave-end'
  | 'boss-warn'
  | 'upgrade-offer'
  | 'player-damaged'
  | 'player-died'
  | 'roll-start'
  | 'roll-land';

type Listener = (payload?: unknown) => void;

const listeners = new Map<GameEventKind, Set<Listener>>();

export function onEvent(kind: GameEventKind, fn: Listener): () => void {
  let set = listeners.get(kind);
  if (!set) {
    set = new Set();
    listeners.set(kind, set);
  }
  set.add(fn);
  return () => set!.delete(fn);
}

export function emitEvent(kind: GameEventKind, payload?: unknown): void {
  const set = listeners.get(kind);
  if (!set) return;
  for (const fn of set) fn(payload);
}

export function clearListeners(): void {
  listeners.clear();
}
