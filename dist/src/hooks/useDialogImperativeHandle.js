"use client";
import { useImperativeHandle } from 'react';
import { useDialog } from '../useDialog.js';

/**
 * Convenience hook that combines `useDialog().imperativeHandle()` and React's
 * `useImperativeHandle` into a single call.
 *
 * Use this inside a dialog body component to expose internal state back to the
 * caller via the imperative handle registry.
 *
 * The parent component still needs to register a ref with `dialog.setImperativeHandle(ref)`,
 * and callers can read the live value with `useDialogImperativeValue(dialogKey)`.
 *
 * @param dialogKey - The dialog key to bind the handle to.
 * @param init - Factory that returns the value to expose. Re-runs when `deps` change.
 * @param deps - Values the factory depends on (same semantics as `useEffect` deps).
 *   The factory re-runs and the exposed handle updates whenever any value in this
 *   array changes. Omit to re-run on every render.
 *
 * @example
 * // Inside dialog body — optionally pass your own type as the generic:
 * useDialogImperativeHandle<MyValidationState>("my-dialog", () => ({ isValid, errorText }), [isValid, errorText]);
 *
 * // In parent component:
 * const ref = useRef<MyValidationState>(null);
 * dialog.setImperativeHandle(ref);
 *
 * // Read from anywhere:
 * const state = useDialogImperativeValue<MyValidationState | null>("my-dialog");
 */
var useDialogImperativeHandle = function useDialogImperativeHandle(dialogKey, init, deps) {
  var dialog = useDialog(dialogKey);
  var handle = dialog.imperativeHandle();
  // biome-ignore lint/correctness/useExhaustiveDependencies: deps is forwarded from the caller — same contract as useImperativeHandle
  useImperativeHandle(handle, init, deps);
};

export { useDialogImperativeHandle };
//# sourceMappingURL=useDialogImperativeHandle.js.map
