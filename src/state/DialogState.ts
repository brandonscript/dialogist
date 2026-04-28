"use client";

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";

import { shallowEqualLevel2 } from "../utils/shallowCompare";

type Listener = () => void;
type DialogStateSource = "dialog" | "external";

const isProduction = (): boolean => {
  return (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV === "production";
};

interface DialogStateEntry<T> {
  value: T;
  source: DialogStateSource;
  version: number;
  updatedAt: number;
}

class DialogState {
  private entries = new Map<string, DialogStateEntry<unknown>>();
  private listeners = new Map<string, Set<Listener>>();

  private emit(key: string): void {
    const listeners = this.listeners.get(key);
    if (listeners)
      listeners.forEach((l) => {
        l();
      });
  }

  getEntry<T>(key: string): DialogStateEntry<T> | undefined {
    return this.entries.get(key) as DialogStateEntry<T> | undefined;
  }

  getValue<T>(key: string): T | undefined {
    return this.entries.get(key)?.value as T | undefined;
  }

  ensure<T>(key: string, initialValue: T, source: DialogStateSource = "external"): DialogStateEntry<T> {
    let existing = this.entries.get(key) as DialogStateEntry<T> | undefined;
    if (!existing) {
      existing = {
        value: initialValue,
        source,
        version: 0,
        updatedAt: Date.now(),
      };
      this.entries.set(key, existing);
    }
    return existing;
  }

  set<T>(key: string, value: T, source?: DialogStateSource): DialogStateEntry<T> {
    const prev = this.entries.get(key) as DialogStateEntry<T> | undefined;
    const nextSource = source ?? prev?.source ?? "external";
    const valueChanged = !prev || !shallowEqualLevel2(prev.value, value);
    const sourceChanged = !prev || prev.source !== nextSource;
    // biome-ignore lint/style/noNonNullAssertion: if !valueChanged then !prev is false, so prev is defined
    if (!valueChanged && !sourceChanged) return prev!;
    const nextEntry: DialogStateEntry<T> = {
      value,
      source: nextSource,
      version: prev ? prev.version + 1 : 1,
      updatedAt: Date.now(),
    };
    this.entries.set(key, nextEntry);
    this.emit(key);
    return nextEntry;
  }

  setSource(key: string, source: DialogStateSource): void {
    const prev = this.entries.get(key);
    if (!prev || prev.source === source) return;
    const next: DialogStateEntry<unknown> = {
      ...prev,
      source,
      version: prev.version + 1,
      updatedAt: Date.now(),
    };
    this.entries.set(key, next);
    this.emit(key);
  }

  clear(key: string): void {
    this.entries.delete(key);
    this.listeners.delete(key);
  }

  subscribe(key: string, listener: Listener): () => void {
    let set = this.listeners.get(key);
    if (!set) {
      set = new Set<Listener>();
      this.listeners.set(key, set);
    }
    set.add(listener);
    return () => {
      const s = this.listeners.get(key);
      if (!s) return;
      s.delete(listener);
      if (s.size === 0) this.listeners.delete(key);
    };
  }
}

const dialogState = new DialogState();

const makeKey = (dialogKey: string, key: string): string => {
  return `${dialogKey}::${key}`;
};

/**
 * Subscribe to a realtime dialog value from the dialog state system.
 *
 * This hook uses React's `useSyncExternalStore` to subscribe to a dialog's state value.
 * State values are out-of-band updates that do NOT cause dialog re-renders, making them ideal
 * for real-time visual updates during user interactions (e.g., dragging a slider).
 *
 * The dialog state system is separate from dialog React state and is designed for high-frequency updates
 * that need to be reflected immediately without triggering dialog content re-renders.
 *
 * @param dialogKey - The dialog identifier
 * @param key - The key for the specific state value within the dialog
 * @param initialValue - Seed value applied only when this store entry is first created (same contract as
 *   `useState(initialValue)`). After that, updates must go through the returned setter; changing `initialValue` on a
 *   later render for the same `dialogKey` + `key` is ignored and emits a dev-only warning.
 * @param sourceFilter - Optional filter: "dialog" (only dialog updates), "external" (only external updates), or "any" (all updates, default)
 * @returns A tuple `[value, setValue]` where:
 *   - `value`: The current live value from the state system (filtered by source if specified)
 *   - `setValue`: Function to update the live value
 */
export const useDialogStateValue = <T>(
  dialogKey: string,
  key: string,
  initialValue: T,
  sourceFilter: DialogStateSource | "any" = "any",
) => {
  const storeKey = makeKey(dialogKey, key);
  const lastMatchingValueRef = useRef<T>(initialValue);
  const seededInitialRef = useRef(initialValue);
  const seededStoreKeyRef = useRef(storeKey);

  useEffect(() => {
    const storeKeyChanged = seededStoreKeyRef.current !== storeKey;
    if (storeKeyChanged) {
      seededStoreKeyRef.current = storeKey;
      seededInitialRef.current = initialValue;
      dialogState.ensure(storeKey, initialValue);
      return;
    }

    if (!Object.is(seededInitialRef.current, initialValue)) {
      if (!isProduction()) {
        console.warn(
          `[dialogist] useDialogStateValue: \`initialValue\` changed for the same store key (${storeKey}). ` +
            "The initial value is only applied when the entry is first created; use the returned setter to update the value.",
        );
      }
      seededInitialRef.current = initialValue;
    }

    dialogState.ensure(storeKey, initialValue);
  }, [storeKey, initialValue]);

  const getSnapshot = useCallback(() => {
    const entry = dialogState.getEntry<T>(storeKey);
    if (!entry) return lastMatchingValueRef.current;
    if (sourceFilter === "any" || entry.source === sourceFilter) {
      lastMatchingValueRef.current = entry.value;
      return entry.value;
    }
    return lastMatchingValueRef.current;
  }, [storeKey, sourceFilter]);

  const subscribe = useCallback((listener: Listener) => dialogState.subscribe(storeKey, listener), [storeKey]);

  const value = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const setValue = useCallback(
    (next: T, source?: DialogStateSource) => dialogState.set<T>(storeKey, next, source),
    [storeKey],
  );

  return [value, setValue] as const;
};

/**
 * Subscribe to the source metadata for a dialog state value.
 *
 * @param initial - Applied only when this store entry is first created. Later changes are ignored (use the setter)
 *   and trigger a dev-only warning for the same `dialogKey` + `key`.
 */
export const useDialogStateSource = (dialogKey: string, key: string, initial: DialogStateSource = "external") => {
  const storeKey = makeKey(dialogKey, key);
  const seededInitialRef = useRef(initial);
  const seededStoreKeyRef = useRef(storeKey);

  useEffect(() => {
    const storeKeyChanged = seededStoreKeyRef.current !== storeKey;
    if (storeKeyChanged) {
      seededStoreKeyRef.current = storeKey;
      seededInitialRef.current = initial;
      dialogState.ensure<unknown>(storeKey, undefined, initial);
      return;
    }

    if (seededInitialRef.current !== initial) {
      if (!isProduction()) {
        console.warn(
          `[dialogist] useDialogStateSource: \`initial\` source changed for the same store key (${storeKey}). ` +
            "The initial source is only applied when the entry is first created; use the returned setter to update the source.",
        );
      }
      seededInitialRef.current = initial;
    }

    dialogState.ensure<unknown>(storeKey, undefined, initial);
  }, [storeKey, initial]);

  const getSnapshot = useCallback(
    () => dialogState.getEntry<unknown>(storeKey)?.source ?? initial,
    [storeKey, initial],
  );
  const subscribe = useCallback((listener: Listener) => dialogState.subscribe(storeKey, listener), [storeKey]);
  const value = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const setValue = useCallback((next: DialogStateSource) => dialogState.setSource(storeKey, next), [storeKey]);
  return [value, setValue] as const;
};

/**
 * Imperatively set a dialog state value and optionally mark its source.
 *
 * @param dialogKey - The dialog identifier
 * @param key - The key for the specific state value
 * @param value - The value to set
 * @param source - Optional source: "dialog" (from dialog interaction) or "external" (external state). If not provided, only the value is updated.
 */
export const setDialogStateValue = <T>(dialogKey: string, key: string, value: T, source?: DialogStateSource) => {
  dialogState.set<T>(makeKey(dialogKey, key), value, source);
};

/**
 * Convenience function to set a dialog state value from within a dialog.
 * Automatically marks the source as "dialog".
 */
export const setDialogStateValueFromDialog = <T>(dialogKey: string, key: string, value: T) => {
  setDialogStateValue(dialogKey, key, value, "dialog");
};

/**
 * Convenience function to set a dialog state value from external state.
 * Automatically marks the source as "external".
 */
export const setDialogStateValueFromExternal = <T>(dialogKey: string, key: string, value: T) => {
  setDialogStateValue(dialogKey, key, value, "external");
};

export const clearDialogStateValue = (dialogKey: string, key: string) => {
  dialogState.clear(makeKey(dialogKey, key));
};

/**
 * Read a dialog state value without subscribing.
 */
export const getDialogStateValue = <T>(dialogKey: string, key: string): T | undefined => {
  return dialogState.getValue<T>(makeKey(dialogKey, key));
};

export type { DialogStateEntry, DialogStateSource };
