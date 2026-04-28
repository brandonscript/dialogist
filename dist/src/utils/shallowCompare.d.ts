/**
 * Performs a standard shallow equality comparison (1-level).
 * Checks if two values are equal, or if they are objects/arrays,
 * checks if their keys/items are strictly equal.
 */
export declare const shallowEqual: (a: unknown, b: unknown) => boolean;
/**
 * Performs a 2-level shallow equality comparison.
 * Level 0: Reference equality.
 * Level 1: Shallow equality of keys/items (using shallowEqual).
 *
 * This is useful for handling objects with inline styles or nested props
 * without the performance cost of full deep comparison.
 *
 * Performance: O(M) where M is the number of keys/items at the top 2 levels.
 * Significantly faster than deep comparison for large structures, while still
 * handling common React patterns like inline objects/arrays.
 *
 * @example
 * // Returns true (inline style object handled)
 * shallowEqualLevel2(
 *   { style: { color: 'red' } },
 *   { style: { color: 'red' } }
 * );
 *
 * // Returns false (deep difference caught)
 * shallowEqualLevel2(
 *   { style: { color: 'red' } },
 *   { style: { color: 'blue' } }
 * );
 */
export declare const shallowEqualLevel2: (a: unknown, b: unknown) => boolean;
