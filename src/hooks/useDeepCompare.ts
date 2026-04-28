"use client";

import type { DependencyList, EffectCallback } from "react";
import { useEffect, useMemo, useRef } from "react";

import { deepEqualDeps } from "../utils/deepCompare";

/**
 * Like `useMemo`, but uses **deep** equality on `deps`. The memoized value **only** changes when
 * `deps` are deep-different; **`factory` identity is ignored** — list any closed-over values that
 * must trigger recomputation inside `deps` as well.
 */
export const useDeepMemo = <T>(factory: () => T, deps: DependencyList): T => {
  const previousDepsRef = useRef<DependencyList | undefined>(undefined);
  const memoizedValueRef = useRef<T | undefined>(undefined);

  const depsChanged = useMemo(() => {
    if (!previousDepsRef.current) return true;
    return !deepEqualDeps(previousDepsRef.current, deps);
  }, [deps]);

  return useMemo(() => {
    if (depsChanged) {
      previousDepsRef.current = deps;
      memoizedValueRef.current = factory();
    }
    return memoizedValueRef.current as T;
  }, [depsChanged, factory, deps]);
};

/**
 * A version of `useEffect` that uses deep equality comparison for dependencies
 * instead of referential equality. Useful for complex objects and arrays.
 *
 * **Strict Mode:** On remount, React runs cleanup then the effect again. If `deps` are still
 * deep-equal, the inner effect body does not run again — so subscriptions removed in cleanup
 * are not restored. Prefer plain `useEffect` for subscribe/unsubscribe when deps are stable.
 */
export const useDeepEffect = (effect: EffectCallback, deps: DependencyList): void => {
  const previousDepsRef = useRef<DependencyList | undefined>(undefined);
  const cleanupRef = useRef<ReturnType<EffectCallback> | undefined>(undefined);

  useEffect(() => {
    const depsChanged = !previousDepsRef.current || !deepEqualDeps(previousDepsRef.current, deps);

    if (depsChanged) {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = undefined;
      }

      previousDepsRef.current = [...deps];
      cleanupRef.current = effect();
    }

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = undefined;
      }
    };
    // biome-ignore lint/correctness/useExhaustiveDependencies: deps is intentionally forwarded as-is — same pattern as useEffect(fn, deps)
  }, deps);
};

export const useDeepCallback = <Args extends unknown[], R>(
  callback: (...args: Args) => R,
  deps: DependencyList,
): ((...args: Args) => R) => useDeepMemo(() => callback, deps) as (...args: Args) => R;
