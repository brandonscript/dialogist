/**
 * Performs a standard shallow equality comparison (1-level).
 * Checks if two values are equal, or if they are objects/arrays,
 * checks if their keys/items are strictly equal.
 */
export const shallowEqual = (a: unknown, b: unknown): boolean => {
  if (Object.is(a, b)) return true;

  if (typeof a !== "object" || a === null || typeof b !== "object" || b === null) {
    return false;
  }

  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!Object.is(a[i], b[i])) return false;
    }
    return true;
  }

  if (Array.isArray(b)) return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (let i = 0; i < keysA.length; i++) {
    if (
      !Object.hasOwn(b, keysA[i]) ||
      !Object.is((a as Record<string, unknown>)[keysA[i]], (b as Record<string, unknown>)[keysA[i]])
    ) {
      return false;
    }
  }

  return true;
};

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
export const shallowEqualLevel2 = (a: unknown, b: unknown): boolean => {
  if (Object.is(a, b)) return true;

  if (typeof a !== "object" || a === null || typeof b !== "object" || b === null) {
    return false;
  }

  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!shallowEqual(a[i], b[i])) return false;
    }
    return true;
  }

  if (Array.isArray(b)) return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (let i = 0; i < keysA.length; i++) {
    const key = keysA[i];
    if (!Object.hasOwn(b, key)) return false;

    // Compare values using 1-level shallow equality
    if (!shallowEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])) return false;
  }

  return true;
};
