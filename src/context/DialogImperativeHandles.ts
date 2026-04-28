"use client";

import type { MutableRefObject } from "react";

import type { ImperativeHandleRefType } from "../types";

const registry = new Map<string, ImperativeHandleRefType<unknown> | null>();
const listenersByKey = new Map<string, Set<() => void>>();
const patchedRefs = new WeakSet<object>();
const pendingNotifyKeys = new Set<string>();

const flushDialogImperativeListeners = (key: string): void => {
  const set = listenersByKey.get(key);
  if (!set) return;
  set.forEach((listener) => {
    try {
      listener();
    } catch {
      /* ignore subscriber errors */
    }
  });
};

/** Deferred so `register` / `.current` writes do not synchronously re-render during React commit. */
const scheduleNotifyDialogImperativeListeners = (key: string): void => {
  if (pendingNotifyKeys.has(key)) return;
  pendingNotifyKeys.add(key);
  queueMicrotask(() => {
    pendingNotifyKeys.delete(key);
    flushDialogImperativeListeners(key);
  });
};

/**
 * Subscribe to imperative handle registration/clear and to `.current` updates when the ref can be
 * safely patched (see {@link registerDialogImperativeHandle}). Identity of `.current` is compared
 * with `Object.is`; in-place mutation of the same object instance is not detected.
 */
export const subscribeDialogImperativeHandle = (key: string, listener: () => void): (() => void) => {
  let set = listenersByKey.get(key);
  if (!set) {
    set = new Set();
    listenersByKey.set(key, set);
  }
  set.add(listener);
  return () => {
    const s = listenersByKey.get(key);
    if (!s) return;
    s.delete(listener);
    if (s.size === 0) {
      listenersByKey.delete(key);
    }
  };
};

const tryPatchRefCurrentNotifier = (key: string, ref: ImperativeHandleRefType<unknown>): void => {
  if (!ref || typeof ref !== "object" || patchedRefs.has(ref)) {
    return;
  }
  try {
    const desc = Object.getOwnPropertyDescriptor(ref, "current");
    if (desc?.configurable === false) {
      return;
    }
    let value = (ref as MutableRefObject<unknown>).current;
    Object.defineProperty(ref, "current", {
      configurable: true,
      enumerable: true,
      get() {
        return value;
      },
      set(next: unknown) {
        if (!Object.is(value, next)) {
          value = next;
          scheduleNotifyDialogImperativeListeners(key);
        } else {
          value = next;
        }
      },
    });
    patchedRefs.add(ref);
  } catch {
    /* ref may be sealed or non-extensible */
  }
};

export const registerDialogImperativeHandle = (
  key: string,
  handle: ImperativeHandleRefType<unknown> | null | undefined,
): void => {
  if (!handle) {
    clearDialogImperativeHandle(key);
    return;
  }
  tryPatchRefCurrentNotifier(key, handle);
  registry.set(key, handle);
  scheduleNotifyDialogImperativeListeners(key);
};

export const getDialogImperativeHandle = <Handle>(key: string) =>
  (registry.get(key) as ImperativeHandleRefType<Handle>) ?? null;

export const getDialogImperativeHandleValue = <Handle>(key: string): Handle | null => {
  const ref = registry.get(key) as ImperativeHandleRefType<Handle> | null | undefined;
  return (ref?.current as Handle) ?? null;
};

export const clearDialogImperativeHandle = (key: string, handle?: ImperativeHandleRefType<unknown> | null): void => {
  const existing = registry.get(key);
  if (!existing) return;
  if (handle && existing !== handle) return;
  registry.delete(key);
  scheduleNotifyDialogImperativeListeners(key);
};
