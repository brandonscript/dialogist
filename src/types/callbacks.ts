/** Built-in action ids when no custom TActionId is specified */
type BuiltInActionId = "ok" | "cancel";

/** Resolves actionId: built-in only when TActionId is default (never), otherwise built-in | TActionId */
type ResolveActionId<TActionId extends string> = [TActionId] extends [never]
  ? BuiltInActionId
  : BuiltInActionId | TActionId;

/** Resolves action: built-in only when TActionId is default (never), otherwise "okClicked" | "cancelClicked" | custom ids with "Clicked" suffix */
type ResolveAction<TActionId extends string> = [TActionId] extends [never]
  ? "okClicked" | "cancelClicked"
  : "okClicked" | "cancelClicked" | `${TActionId}Clicked`;

/**
 * Unified close event for all dialog close paths.
 * Returned by dialog.open() and passed to close handlers.
 * When reason is "action", use DialogActionEvent for the narrowed type.
 *
 * @template TResolveValue - The type of resolveValue when closed via an action button. Use dialog.open<T>() or useDialog<T>() for strong typing.
 * @template TActionId - Union of custom action ids. Default (never) = built-in "ok" | "cancel" only. Specify e.g. "draft" | "delete" to add custom ids.
 */
export interface DialogCloseEvent<TResolveValue = unknown, TActionId extends string = never> {
  dialogKey: string;
  reason: "action" | "programmatic" | "backdrop" | "escape" | "replace";
  /** True when user confirmed (OK, Confirm, or non-cancel action). Mutually exclusive with cancelled. */
  ok: boolean;
  /** True when the user dismissed the dialog (Cancel button, backdrop, escape). Not used for conflict-blocked opens; see `blocked`. */
  cancelled: boolean;
  /**
   * True when this `open()` settled without opening because conflict policy blocked the request (`throwOnConflict` was
   * false or unset). Mutually exclusive with {@link ok}. When `true`, {@link cancelled} is `false` so it is not confused
   * with a user cancel.
   */
  blocked?: boolean;
  /** Value from the action's resolveValue when closed via button; false when cancelled or conflict-blocked. */
  resolveValue?: TResolveValue;
  /** Present when reason === "action" */
  action?: ResolveAction<TActionId>;
  /** Present when reason === "action" */
  actionId?: ResolveActionId<TActionId>;
  /** Present when reason === "action" */
  buttonText?: string;
  /** Present when reason === "action" */
  nativeEvent?: React.MouseEvent | React.KeyboardEvent;
}

/**
 * Subtype of DialogCloseEvent when reason is "action".
 * Use for onOkClick, onCancelClick, and okClick/cancel event handlers where action fields are guaranteed.
 *
 * @template TResolveValue - The type of resolveValue.
 * @template TActionId - Union of custom action ids. Default (never) = built-in "ok" | "cancel" only. Specify e.g. "draft" | "delete" to add custom ids.
 */
export interface DialogActionEvent<TResolveValue = unknown, TActionId extends string = never>
  extends DialogCloseEvent<TResolveValue, TActionId> {
  reason: "action";
  action: ResolveAction<TActionId>;
  actionId: ResolveActionId<TActionId>;
  buttonText?: string;
  nativeEvent?: React.MouseEvent | React.KeyboardEvent;
}

export interface DialogCallbacks {
  willOpen: (() => void)[];
  didOpen: (() => void)[];
  willClose: ((event: DialogCloseEvent) => void)[];
  didClose: ((event: DialogCloseEvent) => void)[];
  didCancel: ((event: DialogCloseEvent) => void)[];
  busy: (() => void)[];
  /**
   * Custom event registry keyed by dialogKey, then event name → listeners
   * { [dialogKey]: { [eventName]: Set<fn> } }
   */
  custom: Record<string, Record<string, Set<(payload?: unknown) => void>>>;
}

/**
 * Map of dialog event names to their payload types.
 * Extend this interface via declaration merging so every custom event name is typed; there is no untyped string escape hatch on `dialog.emit` / `dialog.on` / `dialog.off` (see {@link UseDialogEmit}).
 *
 * @example
 * ```ts
 * // In your app's .d.ts file (e.g. dialogist-augment.d.ts)
 * import "dialogist";
 *
 * declare module "dialogist" {
 *   interface DialogistEventMap {
 *     myCustomEvent: { foo: string; bar: number };
 *   }
 * }
 * ```
 *
 * Then use with full type safety:
 * ```ts
 * dialog.on("myCustomEvent", (payload) => payload.foo); // payload is { foo: string; bar: number }
 * dialog.emit("myCustomEvent", { foo: "a", bar: 1 });
 * ```
 */
export interface DialogistEventMap {
  willClose: DialogCloseEvent;
  didClose: DialogCloseEvent;
  close: DialogCloseEvent;
  okClick: DialogActionEvent;
  cancel: DialogCloseEvent;
  closePrevented: { reason: import("../types").DialogCloseReason; closeEvent: DialogCloseEvent };
}

/**
 * Built-in {@link DialogistEventMap} merged with extra keys (e.g. `DialogistEventMapWith<{ x: number }>`).
 */
export type DialogistEventMapWith<TExtra extends Record<string, unknown> = Record<string, never>> = DialogistEventMap &
  TExtra;

/** `dialog.on` for a `useDialog` instance — keys and payloads come only from {@link DialogistEventMap} (including app augmentations). */
export type UseDialogOn = <K extends keyof DialogistEventMap>(
  event: K,
  handler: (payload?: DialogistEventMap[K]) => void,
) => () => void;

/** `dialog.off` for a `useDialog` instance — same contract as {@link UseDialogOn}. */
export type UseDialogOff = <K extends keyof DialogistEventMap>(
  event: K,
  handler: (payload?: DialogistEventMap[K]) => void,
) => void;

/** `dialog.emit` for a `useDialog` instance — keys and payloads come only from {@link DialogistEventMap} (including app augmentations). */
export type UseDialogEmit = <K extends keyof DialogistEventMap>(event: K, payload?: DialogistEventMap[K]) => void;

/** Built-in event names. Use keyof DialogistEventMap for augmented set. */
export type DialogEventName = keyof DialogistEventMap;

export interface DialogCallbackRegistration {
  willOpen: (callback: () => void) => () => void;
  didOpen: (callback: () => void) => () => void;
  willClose: (callback: (event: DialogCloseEvent) => void) => () => void;
  didClose: (callback: (event: DialogCloseEvent) => void) => () => void;
  didCancel: (callback: (event: DialogCloseEvent) => void) => () => void;
  busy: (callback: () => void) => () => void;
  /** Register a custom event handler scoped to a dialog key */
  on: (dialogKey: string, event: string, handler: (payload?: unknown) => void) => () => void;
  /** Emit a custom event scoped to a dialog key */
  emit: (dialogKey: string, event: string, payload?: unknown) => void;
  /** Remove a previously registered handler (no-op if not present) */
  off: (dialogKey: string, event: string, handler: (payload?: unknown) => void) => void;
}

/** Narrow {@link DialogCallbacks} lifecycle dispatch: close-related events require {@link DialogCloseEvent}. */
export type DialogCallbacksTriggerFn = {
  (event: "willClose" | "didClose" | "didCancel", closeEvent: DialogCloseEvent): void;
  (event: "willOpen" | "didOpen" | "busy"): void;
};
