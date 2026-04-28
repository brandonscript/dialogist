import { typeof as _typeof } from '../../_virtual/_rollupPluginBabelHelpers.js';
import { isValidElement } from 'react';

/**
 * Deep structural equality helper (also used by dependency-array utilities).
 *
 * - **React elements:** compares `type` and `props` only (no special handling of outer `key`).
 * - **Plain objects:** enumerable **own** keys only (no prototype walk).
 * - **`NaN`** is treated as equal to **`NaN`**.
 */
var _deepEqual = function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a === "number" && typeof b === "number" && Number.isNaN(a) && Number.isNaN(b)) return true;
  if (a == null || b == null) return false;
  if (_typeof(a) !== _typeof(b)) return false;

  // Handle React elements by comparing type and props only
  if (/*#__PURE__*/isValidElement(a) && /*#__PURE__*/isValidElement(b)) {
    // Compare element type (component/function or string) by reference/value
    if (a.type !== b.type) return false;
    // Compare props deeply (ignores internal non-enumerable fields like _owner)
    return _deepEqual(a.props, b.props);
  }

  // Handle primitives
  if (_typeof(a) !== "object") return a === b;

  // Handle arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (var i = 0; i < a.length; i++) {
      // Handle sparse arrays properly - check if index exists
      var aHasIndex = i in a;
      var bHasIndex = i in b;
      if (aHasIndex !== bHasIndex) return false; // One sparse, one not

      if (aHasIndex && !_deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  // Early return if one is array and other isn't
  if (Array.isArray(a) || Array.isArray(b)) {
    return false;
  }

  // Handle dates
  if (a instanceof Date && b instanceof Date) {
    var aTime = a.getTime();
    var bTime = b.getTime();

    // Handle invalid dates (NaN === NaN should be true for dates)
    if (Number.isNaN(aTime) && Number.isNaN(bTime)) return true;
    return aTime === bTime;
  }

  // Handle functions (by reference only)
  if (typeof a === "function" && typeof b === "function") {
    return a === b;
  }

  // Handle objects
  if (_typeof(a) === "object" && _typeof(b) === "object") {
    var aObj = a;
    var bObj = b;
    var keysA = Object.keys(aObj);
    var keysB = Object.keys(bObj);
    if (keysA.length !== keysB.length) return false;
    for (var _i = 0, _keysA = keysA; _i < _keysA.length; _i++) {
      var key = _keysA[_i];
      if (!keysB.includes(key)) return false;
      if (!_deepEqual(aObj[key], bObj[key])) return false;
    }
    return true;
  }
  return false;
};
var deepEqualDeps = function deepEqualDeps(depsA, depsB) {
  if (depsA.length !== depsB.length) return false;
  for (var i = 0; i < depsA.length; i++) {
    if (!_deepEqual(depsA[i], depsB[i])) return false;
  }
  return true;
};

export { _deepEqual as deepEqual, deepEqualDeps };
//# sourceMappingURL=deepCompare.js.map
