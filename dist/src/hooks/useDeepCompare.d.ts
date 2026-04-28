import type { DependencyList, EffectCallback } from "react";
/**
 * Like `useMemo`, but uses **deep** equality on `deps`. The memoized value **only** changes when
 * `deps` are deep-different; **`factory` identity is ignored** — list any closed-over values that
 * must trigger recomputation inside `deps` as well.
 */
export declare const useDeepMemo: <T>(factory: () => T, deps: DependencyList) => T;
/**
 * A version of `useEffect` that uses deep equality comparison for dependencies
 * instead of referential equality. Useful for complex objects and arrays.
 *
 * **Strict Mode:** On remount, React runs cleanup then the effect again. If `deps` are still
 * deep-equal, the inner effect body does not run again — so subscriptions removed in cleanup
 * are not restored. Prefer plain `useEffect` for subscribe/unsubscribe when deps are stable.
 */
export declare const useDeepEffect: (effect: EffectCallback, deps: DependencyList) => void;
export declare const useDeepCallback: <Args extends unknown[], R>(callback: (...args: Args) => R, deps: DependencyList) => ((...args: Args) => R);
