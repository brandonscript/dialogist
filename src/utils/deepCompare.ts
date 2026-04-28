import { isValidElement } from "react";

/**
 * Deep structural equality helper (also used by dependency-array utilities).
 *
 * - **React elements:** compares `type` and `props` only (no special handling of outer `key`).
 * - **Plain objects:** enumerable **own** keys only (no prototype walk).
 * - **`NaN`** is treated as equal to **`NaN`**.
 */
export const deepEqual = (a: unknown, b: unknown): boolean => {
  if (a === b) return true;
  if (typeof a === "number" && typeof b === "number" && Number.isNaN(a) && Number.isNaN(b)) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;

  // Handle React elements by comparing type and props only
  if (isValidElement(a) && isValidElement(b)) {
    // Compare element type (component/function or string) by reference/value
    if (a.type !== b.type) return false;
    // Compare props deeply (ignores internal non-enumerable fields like _owner)
    return deepEqual(a.props, b.props);
  }

  // Handle primitives
  if (typeof a !== "object") return a === b;

  // Handle arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      // Handle sparse arrays properly - check if index exists
      const aHasIndex = i in a;
      const bHasIndex = i in b;

      if (aHasIndex !== bHasIndex) return false; // One sparse, one not

      if (aHasIndex && !deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  // Early return if one is array and other isn't
  if (Array.isArray(a) || Array.isArray(b)) {
    return false;
  }

  // Handle dates
  if (a instanceof Date && b instanceof Date) {
    const aTime = a.getTime();
    const bTime = b.getTime();

    // Handle invalid dates (NaN === NaN should be true for dates)
    if (Number.isNaN(aTime) && Number.isNaN(bTime)) return true;

    return aTime === bTime;
  }

  // Handle functions (by reference only)
  if (typeof a === "function" && typeof b === "function") {
    return a === b;
  }

  // Handle objects
  if (typeof a === "object" && typeof b === "object") {
    const aObj = a as Record<string, unknown>;
    const bObj = b as Record<string, unknown>;

    const keysA = Object.keys(aObj);
    const keysB = Object.keys(bObj);

    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
      if (!keysB.includes(key)) return false;
      if (!deepEqual(aObj[key], bObj[key])) return false;
    }

    return true;
  }

  return false;
};

/**
 * Deep comparison function specifically for dependency arrays
 */
export const deepEqualDeps = (depsA: React.DependencyList, depsB: React.DependencyList): boolean => {
  if (depsA.length !== depsB.length) return false;

  for (let i = 0; i < depsA.length; i++) {
    if (!deepEqual(depsA[i], depsB[i])) return false;
  }

  return true;
};
