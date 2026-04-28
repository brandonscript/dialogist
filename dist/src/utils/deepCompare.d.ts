/**
 * Deep structural equality helper (also used by dependency-array utilities).
 *
 * - **React elements:** compares `type` and `props` only (no special handling of outer `key`).
 * - **Plain objects:** enumerable **own** keys only (no prototype walk).
 * - **`NaN`** is treated as equal to **`NaN`**.
 */
export declare const deepEqual: (a: unknown, b: unknown) => boolean;
/**
 * Deep comparison function specifically for dependency arrays
 */
export declare const deepEqualDeps: (depsA: React.DependencyList, depsB: React.DependencyList) => boolean;
