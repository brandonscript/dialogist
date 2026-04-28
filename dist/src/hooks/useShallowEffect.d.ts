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
export declare const useShallowEffect: (cb: () => void, dependencies?: React.DependencyList) => void;
/** Like {@link useShallowEffect} but runs synchronously after DOM updates, before browser paint. */
export declare const useLayoutShallowEffect: (cb: () => void, dependencies?: React.DependencyList) => void;
