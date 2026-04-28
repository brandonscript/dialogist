import type { DialogKey, DialogKeyArray, DialogKeySegment } from "../types";

const DELIMITER = "::";
const DELIMITER_ERROR = `[Dialogist] dialogKey segments cannot contain "${DELIMITER}".`;

export interface DialogKeyObject {
  parts: DialogKeyArray;
  str: string;
}

interface ResolveDialogKeyOptions {
  autogenerate?: boolean;
}

export const coerceDialogKeyArray = (key?: DialogKey): DialogKeyArray | undefined => {
  if (key === undefined) return undefined;
  if (Array.isArray(key)) {
    return [...key] as DialogKeyArray;
  }
  if (typeof key === "string" && key.includes(DELIMITER)) {
    return key.split(DELIMITER).map((segment) => segment as DialogKeySegment);
  }
  return [key] as DialogKeyArray;
};

const canonicalizeDialogKeyParts = (parts: DialogKeyArray): DialogKeyArray => {
  const canonical = parts.map((segment) => String(segment));
  for (const segment of canonical) {
    if (segment.includes(DELIMITER)) {
      throw new Error(DELIMITER_ERROR);
    }
  }
  return canonical as DialogKeyArray;
};

export const ensureDialogKeyArray = (key?: DialogKey): DialogKeyArray | undefined => {
  if (key === undefined) return undefined;
  const parts = coerceDialogKeyArray(key);
  if (!parts || parts.length === 0) return undefined;
  return canonicalizeDialogKeyParts(parts.slice() as DialogKeyArray);
};

export const dialogKeyArrayToId = (segments: DialogKeyArray): string =>
  segments.map((segment) => String(segment)).join(DELIMITER);

export const resolveDialogKey = (key?: DialogKey, options?: ResolveDialogKeyOptions): DialogKeyObject => {
  if (key === undefined && options?.autogenerate) {
    const generatedId = `dialog-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    return {
      parts: [generatedId],
      str: generatedId,
    };
  }

  const parts = coerceDialogKeyArray(key);
  if (!parts || parts.length === 0) {
    throw new Error("[Dialogist] dialogKey is required.");
  }
  const safeParts = canonicalizeDialogKeyParts(parts.slice() as DialogKeyArray);
  return {
    parts: safeParts,
    str: dialogKeyArrayToId(safeParts),
  };
};

export const normalizeDialogKey = (key?: DialogKey): string | undefined => {
  if (key === undefined) return undefined;
  return resolveDialogKey(key).str;
};

export const dialogKeyArrayEquals = (a: DialogKeyArray, b: DialogKeyArray): boolean => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (String(a[i]) !== String(b[i])) return false;
  }
  return true;
};

/**
 * Returns `true` when `key` is equal to `prefix` **or** when `key` has `prefix` as a proper
 * segment-aligned prefix (i.e. `key` starts with `prefix + "::"`).
 *
 * Used to enable root-key matching for `closeDialog` and `useDialogIsOpen` when a composite
 * flow-step key is active — e.g. `dialogKeyStartsWith("checkout-flow::step-1", "checkout-flow")`
 * returns `true`.
 */
export const dialogKeyStartsWith = (key: string, prefix: string): boolean =>
  key === prefix || key.startsWith(prefix + DELIMITER);

/** True when both keys share the same first segment (segment-aligned root), e.g. `a::1` and `a::2`. */
export const dialogKeySameRoot = (a: string, b: string): boolean => {
  const ra = a.split(DELIMITER)[0] ?? a;
  const rb = b.split(DELIMITER)[0] ?? b;
  return String(ra) === String(rb);
};
