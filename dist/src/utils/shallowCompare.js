import { typeof as _typeof } from '../../_virtual/_rollupPluginBabelHelpers.js';

/**
 * Performs a standard shallow equality comparison (1-level).
 * Checks if two values are equal, or if they are objects/arrays,
 * checks if their keys/items are strictly equal.
 */
var shallowEqual = function shallowEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (_typeof(a) !== "object" || a === null || _typeof(b) !== "object" || b === null) {
    return false;
  }
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false;
    for (var i = 0; i < a.length; i++) {
      if (!Object.is(a[i], b[i])) return false;
    }
    return true;
  }
  if (Array.isArray(b)) return false;
  var keysA = Object.keys(a);
  var keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (var _i = 0; _i < keysA.length; _i++) {
    if (!Object.hasOwn(b, keysA[_i]) || !Object.is(a[keysA[_i]], b[keysA[_i]])) {
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
var shallowEqualLevel2 = function shallowEqualLevel2(a, b) {
  if (Object.is(a, b)) return true;
  if (_typeof(a) !== "object" || a === null || _typeof(b) !== "object" || b === null) {
    return false;
  }
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false;
    for (var i = 0; i < a.length; i++) {
      if (!shallowEqual(a[i], b[i])) return false;
    }
    return true;
  }
  if (Array.isArray(b)) return false;
  var keysA = Object.keys(a);
  var keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (var _i2 = 0; _i2 < keysA.length; _i2++) {
    var key = keysA[_i2];
    if (!Object.hasOwn(b, key)) return false;

    // Compare values using 1-level shallow equality
    if (!shallowEqual(a[key], b[key])) return false;
  }
  return true;
};

export { shallowEqual, shallowEqualLevel2 };
//# sourceMappingURL=shallowCompare.js.map
