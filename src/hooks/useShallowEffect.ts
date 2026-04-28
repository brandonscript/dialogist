"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

import { shallowEqual } from "../utils/shallowCompare";

const shallowCompare = (prevValue?: React.DependencyList | null, currValue?: React.DependencyList) => {
  if (!prevValue || !currValue) {
    return false;
  }
  if (prevValue === currValue) {
    return true;
  }
  if (prevValue.length !== currValue.length) {
    return false;
  }
  for (let i = 0; i < prevValue.length; i += 1) {
    if (!shallowEqual(prevValue[i], currValue[i])) {
      return false;
    }
  }
  return true;
};

const useShallowCompare = (dependencies?: React.DependencyList) => {
  const ref = useRef<React.DependencyList | null | undefined>([]);
  const updateRef = useRef<number>(0);
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
export const useShallowEffect = (cb: () => void, dependencies?: React.DependencyList): void => {
  // biome-ignore lint/correctness/useExhaustiveDependencies: deps come from useShallowCompare — a stable counter that changes only on shallow inequivalence
  useEffect(cb, useShallowCompare(dependencies));
};

/** Like {@link useShallowEffect} but runs synchronously after DOM updates, before browser paint. */
export const useLayoutShallowEffect = (cb: () => void, dependencies?: React.DependencyList): void => {
  // biome-ignore lint/correctness/useExhaustiveDependencies: deps come from useShallowCompare — a stable counter that changes only on shallow inequivalence
  useLayoutEffect(cb, useShallowCompare(dependencies));
};
