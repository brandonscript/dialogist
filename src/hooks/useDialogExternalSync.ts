"use client";

import { type SetStateAction, useCallback, useEffect, useMemo, useReducer, useRef } from "react";

import { shallowEqualLevel2 } from "../utils/shallowCompare";

interface SyncState<T> {
  localValue: T;
  externalSnapshot: T;
  isEditing: boolean;
  hasExternalUpdatePending: boolean;
  pendingExternalWrite: T | null;
}

type SyncAction<T> =
  | { type: "LOCAL_EDIT"; next: T | ((prev: T) => T) }
  | { type: "EXTERNAL_CHANGED"; next: T }
  | { type: "LOCAL_IDLE" };

const createReducer = <T>(isEqual: (a: T, b: T) => boolean) => {
  return (state: SyncState<T>, action: SyncAction<T>): SyncState<T> => {
    switch (action.type) {
      case "LOCAL_EDIT": {
        const next =
          typeof action.next === "function" ? (action.next as (prev: T) => T)(state.localValue) : action.next;
        return {
          ...state,
          localValue: next,
          isEditing: true,
          pendingExternalWrite: next,
        };
      }

      case "EXTERNAL_CHANGED": {
        const next = action.next;

        // If this matches what we *just* asked external to be, treat as echo.
        if (state.pendingExternalWrite !== null && isEqual(next, state.pendingExternalWrite)) {
          return {
            ...state,
            externalSnapshot: next,
            pendingExternalWrite: null,
            hasExternalUpdatePending: false,
          };
        }

        // If identical to local, it's also effectively an echo.
        if (isEqual(next, state.localValue)) {
          return {
            ...state,
            externalSnapshot: next,
            pendingExternalWrite: null,
            hasExternalUpdatePending: false,
          };
        }

        if (!state.isEditing) {
          // Idle: apply immediately
          return {
            ...state,
            externalSnapshot: next,
            localValue: next,
            hasExternalUpdatePending: false,
            pendingExternalWrite: null, // we didn't initiate this
          };
        }

        // Editing: remember external changed, but don't overwrite local yet
        return {
          ...state,
          externalSnapshot: next,
          hasExternalUpdatePending: true,
          // keep pendingExternalWrite as-is; we still may have a local write in flight
        };
      }

      case "LOCAL_IDLE": {
        if (!state.hasExternalUpdatePending) {
          return {
            ...state,
            isEditing: false,
          };
        }

        // Idle and we have a pending external update: apply it now
        return {
          ...state,
          isEditing: false,
          localValue: state.externalSnapshot,
          hasExternalUpdatePending: false,
          pendingExternalWrite: null, // now we're aligned with external
        };
      }

      default:
        return state;
    }
  };
};

export interface UseDialogExternalSyncOptions<T> {
  externalValue: T;
  setExternalValue: (next: T) => void;
  debounceMs?: number;
  throttleMs?: number;
  isEqual?: (a: T, b: T) => boolean;
}

export interface UseDialogExternalSyncReturn<T> {
  value: T;
  /** Like React `setState`: pass the next value or an updater `(prev) => next`. */
  setValue: (next: SetStateAction<T>) => void;
  meta: {
    isEditing: boolean;
    hasExternalUpdatePending: boolean;
  };
}

/**
 * Sync hook for dialog-local state with external state.
 *
 * This hook manages bidirectional synchronization between dialog-local state and external state
 * (e.g., React Context, Redux, React Query). The dialog is treated as the authoritative owner
 * during editing, with external changes applied when idle.
 *
 * Key features:
 * - Echo detection: Ignores updates that match pending writes or current local value
 * - Idle detection: Applies external updates when editing stops for `debounceMs`
 * - Throttling: Delays writes to external state by `throttleMs` while editing (default: 0, immediate)
 * - Non-blocking: External updates are queued while editing, preventing conflicts
 *
 * **Re-renders vs remounts:** `externalValue` is usually passed as a prop (or read from a store subscription).
 * When it changes, the consuming component re-renders and this hook's effect runs — that applies
 * `EXTERNAL_CHANGED` through the reducer; it does **not** re-initialize reducer state (initial state is
 * mount-only). React preserves hook state across re-renders as long as the component instance stays mounted.
 * Prefer a **stable** `setExternalValue` (e.g. a `useState` setter) so you do not churn effect dependencies.
 *
 * @param options - Configuration options
 * @param options.externalValue - Current value from external state
 * @param options.setExternalValue - Function to update external state (prefer a stable reference)
 * @param options.debounceMs - Delay in milliseconds before considering editing idle (default: 400)
 * @param options.throttleMs - Delay in milliseconds before writing to external state while editing (default: 0, immediate)
 * @param options.isEqual - Equality function for comparing values (default: shallowEqualLevel2)
 * @returns Object with `value` (local value), `setValue` (local setter or updater function), and `meta` (sync state)
 *
 * @example
 * ```tsx
 * const { value: localTodos, setValue: setLocalTodos, meta } = useDialogExternalSync({
 *   externalValue: currentTodos,
 *   setExternalValue: setTodos,
 *   debounceMs: 400
 * });
 * ```
 */
export const useDialogExternalSync = <T>({
  externalValue,
  setExternalValue,
  debounceMs = 400,
  throttleMs = 0,
  isEqual = shallowEqualLevel2,
}: UseDialogExternalSyncOptions<T>): UseDialogExternalSyncReturn<T> => {
  const reducer = useMemo(() => createReducer(isEqual), [isEqual]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: only initialize once
  const initialState = useMemo<SyncState<T>>(
    () => ({
      localValue: externalValue,
      externalSnapshot: externalValue,
      isEditing: false,
      hasExternalUpdatePending: false,
      pendingExternalWrite: null,
    }),
    [],
  );

  const [state, dispatch] = useReducer(reducer, initialState);

  // Track if this is the initial mount to avoid dispatching on first render
  const isInitialMount = useRef(true);

  // Throttle timer ref for external writes
  const throttleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingThrottledWriteRef = useRef<T | null>(null);

  // Feed externalValue changes into the reducer
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      // Skip dispatch on initial mount since initialState already uses externalValue
      return;
    }
    dispatch({ type: "EXTERNAL_CHANGED", next: externalValue });
  }, [externalValue]);

  // Write-through with throttling when there's a pendingExternalWrite (local-origin change)
  useEffect(() => {
    if (state.pendingExternalWrite === null) {
      // Clear any pending throttled write if we're not writing anymore
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
        throttleTimerRef.current = null;
      }
      pendingThrottledWriteRef.current = null;
      return;
    }

    // If throttling is disabled (throttleMs <= 0), write immediately
    if (throttleMs <= 0) {
      setExternalValue(state.pendingExternalWrite);
      // We *don't* clear pendingExternalWrite here; we wait for EXTERNAL_CHANGED
      // to echo back and match it, then reducer clears it.
      return;
    }

    // Throttling enabled: schedule the write
    pendingThrottledWriteRef.current = state.pendingExternalWrite;

    // Clear existing timer if a new write comes in before the throttle expires
    if (throttleTimerRef.current) {
      clearTimeout(throttleTimerRef.current);
    }

    // Schedule throttled write
    throttleTimerRef.current = setTimeout(() => {
      if (pendingThrottledWriteRef.current !== null) {
        setExternalValue(pendingThrottledWriteRef.current);
        pendingThrottledWriteRef.current = null;
      }
      throttleTimerRef.current = null;
    }, throttleMs);

    return () => {
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
        throttleTimerRef.current = null;
      }
    };
  }, [state.pendingExternalWrite, setExternalValue, throttleMs]);

  // Idle detection: when editing stops for debounceMs,
  // dispatch LOCAL_IDLE, which may also apply pending external.
  // Also flush any pending throttled write immediately when going idle.
  useEffect(() => {
    if (!state.isEditing) {
      // Flush any pending throttled write immediately when not editing
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
        throttleTimerRef.current = null;
      }
      if (pendingThrottledWriteRef.current !== null) {
        setExternalValue(pendingThrottledWriteRef.current);
        pendingThrottledWriteRef.current = null;
      }
      return;
    }

    const id = setTimeout(() => {
      // Flush any pending throttled write before marking as idle
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
        throttleTimerRef.current = null;
      }
      if (pendingThrottledWriteRef.current !== null) {
        setExternalValue(pendingThrottledWriteRef.current);
        pendingThrottledWriteRef.current = null;
      }
      dispatch({ type: "LOCAL_IDLE" });
    }, debounceMs);

    return () => clearTimeout(id);
  }, [state.isEditing, debounceMs, setExternalValue]);

  const setLocalValue = useCallback((next: SetStateAction<T>) => {
    dispatch({ type: "LOCAL_EDIT", next });
  }, []);

  return useMemo(
    () => ({
      value: state.localValue,
      setValue: setLocalValue,
      meta: {
        isEditing: state.isEditing,
        hasExternalUpdatePending: state.hasExternalUpdatePending,
      },
    }),
    [state.localValue, state.isEditing, state.hasExternalUpdatePending, setLocalValue],
  );
};
