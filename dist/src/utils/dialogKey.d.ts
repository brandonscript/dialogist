import type { DialogKey, DialogKeyArray } from "../types";
export interface DialogKeyObject {
    parts: DialogKeyArray;
    str: string;
}
interface ResolveDialogKeyOptions {
    autogenerate?: boolean;
}
export declare const coerceDialogKeyArray: (key?: DialogKey) => DialogKeyArray | undefined;
export declare const ensureDialogKeyArray: (key?: DialogKey) => DialogKeyArray | undefined;
export declare const dialogKeyArrayToId: (segments: DialogKeyArray) => string;
export declare const resolveDialogKey: (key?: DialogKey, options?: ResolveDialogKeyOptions) => DialogKeyObject;
export declare const normalizeDialogKey: (key?: DialogKey) => string | undefined;
export declare const dialogKeyArrayEquals: (a: DialogKeyArray, b: DialogKeyArray) => boolean;
/**
 * Returns `true` when `key` is equal to `prefix` **or** when `key` has `prefix` as a proper
 * segment-aligned prefix (i.e. `key` starts with `prefix + "::"`).
 *
 * Used to enable root-key matching for `closeDialog` and `useDialogIsOpen` when a composite
 * flow-step key is active — e.g. `dialogKeyStartsWith("checkout-flow::step-1", "checkout-flow")`
 * returns `true`.
 */
export declare const dialogKeyStartsWith: (key: string, prefix: string) => boolean;
/** True when both keys share the same first segment (segment-aligned root), e.g. `a::1` and `a::2`. */
export declare const dialogKeySameRoot: (a: string, b: string) => boolean;
export {};
