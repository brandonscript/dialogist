import type { ImperativeHandleRefType } from "../types";
/**
 * Subscribe to imperative handle registration/clear and to `.current` updates when the ref can be
 * safely patched (see {@link registerDialogImperativeHandle}). Identity of `.current` is compared
 * with `Object.is`; in-place mutation of the same object instance is not detected.
 */
export declare const subscribeDialogImperativeHandle: (key: string, listener: () => void) => (() => void);
export declare const registerDialogImperativeHandle: (key: string, handle: ImperativeHandleRefType<unknown> | null | undefined) => void;
export declare const getDialogImperativeHandle: <Handle>(key: string) => import("react").RefObject<Handle | null> | null;
export declare const getDialogImperativeHandleValue: <Handle>(key: string) => Handle | null;
export declare const clearDialogImperativeHandle: (key: string, handle?: ImperativeHandleRefType<unknown> | null) => void;
