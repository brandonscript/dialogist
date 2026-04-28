"use client";
import { useLayoutEffect, useEffect, useRef } from 'react';
import { shallowEqual } from '../utils/shallowCompare.js';

var shallowCompare = function shallowCompare(prevValue, currValue) {
  if (!prevValue || !currValue) {
    return false;
  }
  if (prevValue === currValue) {
    return true;
  }
  if (prevValue.length !== currValue.length) {
    return false;
  }
  for (var i = 0; i < prevValue.length; i += 1) {
    if (!shallowEqual(prevValue[i], currValue[i])) {
      return false;
    }
  }
  return true;
};
var useShallowCompare = function useShallowCompare(dependencies) {
  var ref = useRef([]);
  var updateRef = useRef(0);
  if (!shallowCompare(ref.current, dependencies)) {
    ref.current = dependencies;
    updateRef.current += 1;
  }
  return [updateRef.current];
};

/**
 * Works exactly like `useEffect`, but performs shallow dependencies comparison
 * instead of referential comparison.
 *
 * This is useful when you have object or array dependencies that are recreated
 * on each render but have the same shallow content. With regular `useEffect`,
 * the effect would run on every render. With `useShallowEffect`, it will only
 * run when the shallow content actually changes.
 *
 * @example
 * ```tsx
 * // Will be called on each render with useEffect
 * useEffect(() => {}, [{ a: 1 }]);
 *
 * // Will be called only once with useShallowEffect
 * useShallowEffect(() => {}, [{ a: 1 }]);
 * ```
 *
 * @param cb - Effect callback function
 * @param dependencies - Optional dependency array (shallow compared)
 */
var useShallowEffect = function useShallowEffect(cb, dependencies) {
  // biome-ignore lint/correctness/useExhaustiveDependencies: deps come from useShallowCompare — a stable counter that changes only on shallow inequivalence
  useEffect(cb, useShallowCompare(dependencies));
};

/** Like {@link useShallowEffect} but runs synchronously after DOM updates, before browser paint. */
var useLayoutShallowEffect = function useLayoutShallowEffect(cb, dependencies) {
  // biome-ignore lint/correctness/useExhaustiveDependencies: deps come from useShallowCompare — a stable counter that changes only on shallow inequivalence
  useLayoutEffect(cb, useShallowCompare(dependencies));
};

export { useLayoutShallowEffect, useShallowEffect };
//# sourceMappingURL=useShallowEffect.js.map
