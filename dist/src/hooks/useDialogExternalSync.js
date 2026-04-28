"use client";
import { slicedToArray as _slicedToArray, objectSpread2 as _objectSpread2 } from '../../_virtual/_rollupPluginBabelHelpers.js';
import { useMemo, useReducer, useRef, useEffect, useCallback } from 'react';
import { shallowEqualLevel2 } from '../utils/shallowCompare.js';

var createReducer = function createReducer(isEqual) {
  return function (state, action) {
    switch (action.type) {
      case "LOCAL_EDIT":
        {
          var next = typeof action.next === "function" ? action.next(state.localValue) : action.next;
          return _objectSpread2(_objectSpread2({}, state), {}, {
            localValue: next,
            isEditing: true,
            pendingExternalWrite: next
          });
        }
      case "EXTERNAL_CHANGED":
        {
          var _next = action.next;

          // If this matches what we *just* asked external to be, treat as echo.
          if (state.pendingExternalWrite !== null && isEqual(_next, state.pendingExternalWrite)) {
            return _objectSpread2(_objectSpread2({}, state), {}, {
              externalSnapshot: _next,
              pendingExternalWrite: null,
              hasExternalUpdatePending: false
            });
          }

          // If identical to local, it's also effectively an echo.
          if (isEqual(_next, state.localValue)) {
            return _objectSpread2(_objectSpread2({}, state), {}, {
              externalSnapshot: _next,
              pendingExternalWrite: null,
              hasExternalUpdatePending: false
            });
          }
          if (!state.isEditing) {
            // Idle: apply immediately
            return _objectSpread2(_objectSpread2({}, state), {}, {
              externalSnapshot: _next,
              localValue: _next,
              hasExternalUpdatePending: false,
              pendingExternalWrite: null // we didn't initiate this
            });
          }

          // Editing: remember external changed, but don't overwrite local yet
          return _objectSpread2(_objectSpread2({}, state), {}, {
            externalSnapshot: _next,
            hasExternalUpdatePending: true
            // keep pendingExternalWrite as-is; we still may have a local write in flight
          });
        }
      case "LOCAL_IDLE":
        {
          if (!state.hasExternalUpdatePending) {
            return _objectSpread2(_objectSpread2({}, state), {}, {
              isEditing: false
            });
          }

          // Idle and we have a pending external update: apply it now
          return _objectSpread2(_objectSpread2({}, state), {}, {
            isEditing: false,
            localValue: state.externalSnapshot,
            hasExternalUpdatePending: false,
            pendingExternalWrite: null // now we're aligned with external
          });
        }
      default:
        return state;
    }
  };
};
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
var useDialogExternalSync = function useDialogExternalSync(_ref) {
  var externalValue = _ref.externalValue,
    setExternalValue = _ref.setExternalValue,
    _ref$debounceMs = _ref.debounceMs,
    debounceMs = _ref$debounceMs === void 0 ? 400 : _ref$debounceMs,
    _ref$throttleMs = _ref.throttleMs,
    throttleMs = _ref$throttleMs === void 0 ? 0 : _ref$throttleMs,
    _ref$isEqual = _ref.isEqual,
    isEqual = _ref$isEqual === void 0 ? shallowEqualLevel2 : _ref$isEqual;
  var reducer = useMemo(function () {
    return createReducer(isEqual);
  }, [isEqual]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: only initialize once
  var initialState = useMemo(function () {
    return {
      localValue: externalValue,
      externalSnapshot: externalValue,
      isEditing: false,
      hasExternalUpdatePending: false,
      pendingExternalWrite: null
    };
  }, []);
  var _useReducer = useReducer(reducer, initialState),
    _useReducer2 = _slicedToArray(_useReducer, 2),
    state = _useReducer2[0],
    dispatch = _useReducer2[1];

  // Track if this is the initial mount to avoid dispatching on first render
  var isInitialMount = useRef(true);

  // Throttle timer ref for external writes
  var throttleTimerRef = useRef(null);
  var pendingThrottledWriteRef = useRef(null);

  // Feed externalValue changes into the reducer
  useEffect(function () {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      // Skip dispatch on initial mount since initialState already uses externalValue
      return;
    }
    dispatch({
      type: "EXTERNAL_CHANGED",
      next: externalValue
    });
  }, [externalValue]);

  // Write-through with throttling when there's a pendingExternalWrite (local-origin change)
  useEffect(function () {
    if (state.pendingExternalWrite === null) {
      // Clear any pending throttled write if we're not writing anymore
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
        throttleTimerRef.current = null;
      }
      pendingThrottledWriteRef.current = null;
      return;
    }

    // If throttling is disabled (throttleMs <= 0), write immediately
    if (throttleMs <= 0) {
      setExternalValue(state.pendingExternalWrite);
      // We *don't* clear pendingExternalWrite here; we wait for EXTERNAL_CHANGED
      // to echo back and match it, then reducer clears it.
      return;
    }

    // Throttling enabled: schedule the write
    pendingThrottledWriteRef.current = state.pendingExternalWrite;

    // Clear existing timer if a new write comes in before the throttle expires
    if (throttleTimerRef.current) {
      clearTimeout(throttleTimerRef.current);
    }

    // Schedule throttled write
    throttleTimerRef.current = setTimeout(function () {
      if (pendingThrottledWriteRef.current !== null) {
        setExternalValue(pendingThrottledWriteRef.current);
        pendingThrottledWriteRef.current = null;
      }
      throttleTimerRef.current = null;
    }, throttleMs);
    return function () {
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
        throttleTimerRef.current = null;
      }
    };
  }, [state.pendingExternalWrite, setExternalValue, throttleMs]);

  // Idle detection: when editing stops for debounceMs,
  // dispatch LOCAL_IDLE, which may also apply pending external.
  // Also flush any pending throttled write immediately when going idle.
  useEffect(function () {
    if (!state.isEditing) {
      // Flush any pending throttled write immediately when not editing
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
        throttleTimerRef.current = null;
      }
      if (pendingThrottledWriteRef.current !== null) {
        setExternalValue(pendingThrottledWriteRef.current);
        pendingThrottledWriteRef.current = null;
      }
      return;
    }
    var id = setTimeout(function () {
      // Flush any pending throttled write before marking as idle
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
        throttleTimerRef.current = null;
      }
      if (pendingThrottledWriteRef.current !== null) {
        setExternalValue(pendingThrottledWriteRef.current);
        pendingThrottledWriteRef.current = null;
      }
      dispatch({
        type: "LOCAL_IDLE"
      });
    }, debounceMs);
    return function () {
      return clearTimeout(id);
    };
  }, [state.isEditing, debounceMs, setExternalValue]);
  var setLocalValue = useCallback(function (next) {
    dispatch({
      type: "LOCAL_EDIT",
      next: next
    });
  }, []);
  return useMemo(function () {
    return {
      value: state.localValue,
      setValue: setLocalValue,
      meta: {
        isEditing: state.isEditing,
        hasExternalUpdatePending: state.hasExternalUpdatePending
      }
    };
  }, [state.localValue, state.isEditing, state.hasExternalUpdatePending, setLocalValue]);
};

export { useDialogExternalSync };
//# sourceMappingURL=useDialogExternalSync.js.map
