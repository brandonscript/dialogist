import { type SetStateAction } from "react";
export interface UseDialogExternalSyncOptions<T> {
    externalValue: T;
    setExternalValue: (next: T) => void;
    debounceMs?: number;
    throttleMs?: number;
    isEqual?: (a: T, b: T) => boolean;
}
export interface UseDialogExternalSyncReturn<T> {
    value: T;
    /** Like React `setState`: pass the next value or an updater `(prev) => next`. */
    setValue: (next: SetStateAction<T>) => void;
    meta: {
        isEditing: boolean;
        hasExternalUpdatePending: boolean;
    };
}
/**
 * Sync hook for dialog-local state with external state.
 *
 * This hook manages bidirectional synchronization between dialog-local state and external state
 * (e.g., React Context, Redux, React Query). The dialog is treated as the authoritative owner
 * during editing, with external changes applied when idle.
 *
 * Key features:
 * - Echo detection: Ignores updates that match pending writes or current local value
 * - Idle detection: Applies external updates when editing stops for `debounceMs`
 * - Throttling: Delays writes to external state by `throttleMs` while editing (default: 0, immediate)
 * - Non-blocking: External updates are queued while editing, preventing conflicts
 *
 * **Re-renders vs remounts:** `externalValue` is usually passed as a prop (or read from a store subscription).
 * When it changes, the consuming component re-renders and this hook's effect runs — that applies
 * `EXTERNAL_CHANGED` through the reducer; it does **not** re-initialize reducer state (initial state is
 * mount-only). React preserves hook state across re-renders as long as the component instance stays mounted.
 * Prefer a **stable** `setExternalValue` (e.g. a `useState` setter) so you do not churn effect dependencies.
 *
 * @param options - Configuration options
 * @param options.externalValue - Current value from external state
 * @param options.setExternalValue - Function to update external state (prefer a stable reference)
 * @param options.debounceMs - Delay in milliseconds before considering editing idle (default: 400)
 * @param options.throttleMs - Delay in milliseconds before writing to external state while editing (default: 0, immediate)
 * @param options.isEqual - Equality function for comparing values (default: shallowEqualLevel2)
 * @returns Object with `value` (local value), `setValue` (local setter or updater function), and `meta` (sync state)
 *
 * @example
 * ```tsx
 * const { value: localTodos, setValue: setLocalTodos, meta } = useDialogExternalSync({
 *   externalValue: currentTodos,
 *   setExternalValue: setTodos,
 *   debounceMs: 400
 * });
 * ```
 */
export declare const useDialogExternalSync: <T>({ externalValue, setExternalValue, debounceMs, throttleMs, isEqual, }: UseDialogExternalSyncOptions<T>) => UseDialogExternalSyncReturn<T>;
