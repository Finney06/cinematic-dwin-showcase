import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

/** How many steps back the admin can go. Ten is plenty and keeps memory flat. */
export const HISTORY_LIMIT = 10;

/** Edits made within this window collapse into one step, so typing a sentence
 *  undoes as a sentence rather than a letter at a time. */
const BURST_MS = 500;

export interface HistoryControls {
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  /** Steps available, shown in the control's tooltip. */
  depth: number;
}

const EditHistoryContext = createContext<{
  controls: HistoryControls | null;
  register: (controls: HistoryControls | null) => void;
}>({ controls: null, register: () => {} });

/**
 * Undo/redo for the admin.
 *
 * Each editor keeps its own draft state as usual and hands it to
 * `useUndoRedo`, which records snapshots and publishes undo/redo into this
 * context. Whichever editor is on screen owns the controls, so the buttons in
 * the page header and the keyboard shortcuts always act on what's in front of
 * you — and there is only ever one history to think about.
 */
export const EditHistoryProvider = ({ children }: { children: ReactNode }) => {
  const [controls, setControls] = useState<HistoryControls | null>(null);

  const register = useCallback((next: HistoryControls | null) => setControls(next), []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "z") return;
      // Let the browser handle undo inside a field the user is actively typing
      // in — overriding that is more surprising than helpful.
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) return;

      if (event.shiftKey) {
        if (controls?.canRedo) {
          event.preventDefault();
          controls.redo();
        }
      } else if (controls?.canUndo) {
        event.preventDefault();
        controls.undo();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [controls]);

  const value = useMemo(() => ({ controls, register }), [controls, register]);

  return <EditHistoryContext.Provider value={value}>{children}</EditHistoryContext.Provider>;
};

export const useEditHistory = () => useContext(EditHistoryContext);

/**
 * Records an editor's draft state so it can be stepped backwards and forwards.
 *
 * Pass the state and its setter; call `reset` after loading a record or saving
 * one, so history starts from what's actually on the server rather than
 * letting an undo reach back past a save.
 */
export function useUndoRedo<T>(value: T, apply: (next: T) => void) {
  const { register } = useEditHistory();

  const past = useRef<T[]>([]);
  const future = useRef<T[]>([]);
  const latest = useRef<T>(value);
  /** The state a burst of typing started from — the point an undo returns to. */
  const burstBase = useRef<T>(value);
  const burstTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Set while we apply a snapshot, so it isn't recorded as a fresh edit. */
  const applying = useRef(false);
  const [, bump] = useState(0);

  const commitBurst = useCallback(() => {
    if (burstTimer.current === null) return;
    clearTimeout(burstTimer.current);
    burstTimer.current = null;
    past.current = [...past.current, burstBase.current].slice(-HISTORY_LIMIT);
    future.current = [];
    bump((n) => n + 1);
  }, []);

  useEffect(() => {
    if (applying.current) {
      applying.current = false;
      latest.current = value;
      return;
    }
    if (Object.is(value, latest.current)) return;

    const previous = latest.current;
    latest.current = value;

    if (burstTimer.current === null) burstBase.current = previous;
    else clearTimeout(burstTimer.current);

    burstTimer.current = setTimeout(commitBurst, BURST_MS);
  }, [value, commitBurst]);

  const step = useCallback(
    (direction: "undo" | "redo") => {
      commitBurst();
      const from = direction === "undo" ? past : future;
      if (!from.current.length) return;

      const target =
        direction === "undo" ? from.current[from.current.length - 1] : from.current[0];
      from.current = direction === "undo" ? from.current.slice(0, -1) : from.current.slice(1);

      const to = direction === "undo" ? future : past;
      to.current =
        direction === "undo"
          ? [latest.current, ...to.current].slice(0, HISTORY_LIMIT)
          : [...to.current, latest.current].slice(-HISTORY_LIMIT);

      applying.current = true;
      latest.current = target;
      apply(target);
      bump((n) => n + 1);
    },
    [apply, commitBurst]
  );

  /** Forget everything — call when a different record is loaded, or on save. */
  const reset = useCallback((next: T) => {
    if (burstTimer.current !== null) {
      clearTimeout(burstTimer.current);
      burstTimer.current = null;
    }
    past.current = [];
    future.current = [];
    latest.current = next;
    burstBase.current = next;
    bump((n) => n + 1);
  }, []);

  const canUndo = past.current.length > 0 || burstTimer.current !== null;
  const canRedo = future.current.length > 0;

  useEffect(() => {
    register({
      undo: () => step("undo"),
      redo: () => step("redo"),
      canUndo,
      canRedo,
      depth: past.current.length,
    });
    return () => register(null);
  }, [register, step, canUndo, canRedo]);

  useEffect(
    () => () => {
      if (burstTimer.current !== null) clearTimeout(burstTimer.current);
    },
    []
  );

  return { reset, canUndo, canRedo };
}
