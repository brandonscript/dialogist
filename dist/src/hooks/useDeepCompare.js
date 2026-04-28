"use client";
import { toConsumableArray as _toConsumableArray } from '../../_virtual/_rollupPluginBabelHelpers.js';
import { useRef, useMemo, useEffect } from 'react';
import { deepEqualDeps } from '../utils/deepCompare.js';

/**
 * Like `useMemo`, but uses **deep** equality on `deps`. The memoized value **only** changes when
 * `deps` are deep-different; **`factory` identity is ignored** — list any closed-over values that
 * must trigger recomputation inside `deps` as well.
 */
var useDeepMemo = function useDeepMemo(factory, deps) {
  var previousDepsRef = useRef(undefined);
  var memoizedValueRef = useRef(undefined);
  var depsChanged = useMemo(function () {
    if (!previousDepsRef.current) return true;
    return !deepEqualDeps(previousDepsRef.current, deps);
  }, [deps]);
  return useMemo(function () {
    if (depsChanged) {
      previousDepsRef.current = deps;
      memoizedValueRef.current = factory();
    }
    return memoizedValueRef.current;
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
var useDeepEffect = function useDeepEffect(effect, deps) {
  var previousDepsRef = useRef(undefined);
  var cleanupRef = useRef(undefined);
  useEffect(function () {
    var depsChanged = !previousDepsRef.current || !deepEqualDeps(previousDepsRef.current, deps);
    if (depsChanged) {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = undefined;
      }
      previousDepsRef.current = _toConsumableArray(deps);
      cleanupRef.current = effect();
    }
    return function () {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = undefined;
      }
    };
    // biome-ignore lint/correctness/useExhaustiveDependencies: deps is intentionally forwarded as-is — same pattern as useEffect(fn, deps)
  }, deps);
};
var useDeepCallback = function useDeepCallback(callback, deps) {
  return useDeepMemo(function () {
    return callback;
  }, deps);
};

export { useDeepCallback, useDeepEffect, useDeepMemo };
//# sourceMappingURL=useDeepCompare.js.map
