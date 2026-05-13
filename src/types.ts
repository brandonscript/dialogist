import type { ComponentType, CSSProperties, ReactNode, Ref, RefObject } from "react";

import type { DialogActionEvent, DialogCallbackRegistration, DialogCloseEvent } from "./types/callbacks";

// Re-export callback types for convenience
export type {
  DialogActionEvent,
  DialogCallbackRegistration,
  DialogCallbacksTriggerFn,
  DialogCloseEvent,
  DialogEventName,
  DialogistEventMap,
  DialogistEventMapWith,
  UseDialogEmit,
  UseDialogOff,
  UseDialogOn,
} from "./types/callbacks";

export type DialogKeySegment = string | number;
export type DialogKeyArray = ReadonlyArray<DialogKeySegment>;
export type DialogKey = DialogKeySegment | DialogKeyArray;

/** Main body, status bar, or footer: React nodes or a component type (resolved at render). */
// biome-ignore lint/suspicious/noExplicitAny: ComponentType must accept any props
export type DialogPartContent = ReactNode | ComponentType<any>;

/**
 * Pass to `dialog.open()` when `message` or `content` is a typed component.
 * TypeScript infers `P` from the component and enforces `props` against it.
 * Use either `message` or `content` — they are aliases; `content` takes precedence if both are set.
 *
 * @example
 * dialog.open({
 *   type: "custom",
 *   message: MyDialog,        // or: content: MyDialog
 *   props: { foo: 1 },        // ← typed as MyDialogProps
 * });
 */
export type DialogConfigWithTypedMessage<P extends Record<string, unknown>> = Partial<
  Omit<BaseDialogConfig, "message" | "content" | "props">
> &
  ({ message: ComponentType<P>; content?: never; props: P } | { content: ComponentType<P>; message?: never; props: P });

export type DialogCloseReason = "action" | "programmatic" | "backdrop" | "escape" | "replace";

/**
 * Conflict policy when a second `open()` conflicts. Does not include `throw` — use {@link BaseDialogConfig.throwOnConflict}
 * when the resolved policy is **`block`** or replace is not allowed for the key relationship.
 *
 * - **`block`:** keep state; then {@link BaseDialogConfig.throwOnConflict} decides throw vs resolve with {@link DialogCloseEvent.blocked}.
 * - **`replaceSameKey` / `replaceSameRoot` / `replaceAny`:** authorize a **replace** when key rules match: same resolved key (`replaceSameKey`), same first segment (`replaceSameRoot`), or any key (`replaceAny`). Applies to an in-place config swap when the same key is already open, and to superseding the active row when the incoming key differs from the active key.
 */
export type DialogConflictPolicy = "block" | "replaceAny" | "replaceSameRoot" | "replaceSameKey";

/** How {@link DialogConflictResolver.attemptedDialogKey} relates to {@link DialogConflictResolver.activeDialogKey} for this conflict. */
export type DialogConflictKeyRelation = "sameKey" | "sameRoot" | "unrelated";

/**
 * Baseline outcome for this open attempt from {@link DialogConflictResolver.activePolicy} and key rules alone,
 * before a valid string return from an `onConflict` **function** overrides the resolved policy.
 */
export type DialogConflictDecision = "replace" | "block";

/**
 * Context passed to an `onConflict` **function** when the library is deciding **conflict policy** for a
 * conflicting `open()` (before in-place replace vs block is applied).
 *
 * **Situation:** {@link DialogConflictResolver.keyRelation} summarizes how the attempted key relates to the active key (`sameKey`, `sameRoot` for matching first `::` segment, or `unrelated`). Compare the two key strings directly when you need more detail.
 *
 * **Baseline:** {@link DialogConflictResolver.activePolicy} is the conflict policy implied by **string literals only**
 * on the active config, then the provider, then **`block`**. {@link DialogConflictResolver.decision} is whether that
 * baseline would **replace** or **block** for this open's keys. If an `onConflict` **function** returns
 * `undefined` (including an implicit `void` return), or any value that is not a valid {@link DialogConflictPolicy}, the engine uses
 * {@link DialogConflictResolver.activePolicy} as the resolved policy (see {@link BaseDialogConfig.onConflict}).
 *
 * **Conflict policy (`onConflict`):** only the **active (top)** dialog's policy applies first: literal or
 * function on that config; if `onConflict` is **omitted** on the active config, the provider's `onConflict`
 * is used. The incoming `open()` config's `onConflict` is **not** used to choose conflict policy.
 *
 * **Throw (`throwOnConflict`):** compare active vs incoming, then provider, then default **`false`**: if incoming is unset, use active (then provider); if active is unset, use incoming (then provider); if **both** set, **active** wins.
 *
 * {@link BaseDialogConfig.throwOnConflict} is read only when the open is **blocked** (resolved policy is **`block`** or replace is not allowed for the keys).
 */
export interface DialogConflictResolver {
  /** Dialog key of the incoming `open()` call that triggered the conflict. */
  attemptedDialogKey: string;
  /** Dialog key of the currently active (top) dialog at the time of the conflict. */
  activeDialogKey: string | null;
  /** How the attempted key relates to the active key (see {@link DialogConflictKeyRelation}). */
  keyRelation: DialogConflictKeyRelation;
  /**
   * Policy from **string literals only**: active `onConflict` if it is a string, else provider string, else
   * `"block"`. Never invokes `onConflict` functions. Pairs with {@link DialogConflictResolver.activeDialogKey} as the active side's literal baseline.
   */
  activePolicy: DialogConflictPolicy;
  /** Whether {@link activePolicy} would allow replace for this attempt's keys: in-place when {@link DialogConflictKeyRelation} is `sameKey`, or superseding the active row when it is `sameRoot` or `unrelated`, per policy rules. */
  decision: DialogConflictDecision;
}

/**
 * Payload for `canClose` predicates: aligned with {@link DialogCloseEvent} (same `dialogKey` string and action
 * optionals) but omits outcome fields that do not exist until a close commits. Adds {@link keySegments} and
 * {@link config} for guard logic.
 */
/** `canClose` receives the same action fields as {@link DialogCloseEvent} but allows any `actionId` string (custom buttons). */
export type DialogCloseResolver<TResolveValue = unknown> = Omit<
  DialogCloseEvent<TResolveValue, string>,
  "ok" | "cancelled" | "blocked" | "resolveValue"
> & {
  config: DialogStoredConfig;
  keySegments: DialogKeyArray;
};

export type DialogCanCloseEvaluator = (willClose: DialogCloseResolver) => boolean;
export type DialogCanCloseValue = boolean | DialogCanCloseEvaluator;

export type ImperativeHandleRefType<Handle = unknown> = RefObject<Handle | null> | null;

/**
 * Dialog Slot System
 *
 * Dialogist uses a slot-based architecture aligned with MUI's component customization patterns.
 * Each dialog has multiple slots (title, content, actions, statusBar, footer) that can be
 * customized in two ways:
 *
 * 1. **Component Replacement (via `slots` prop)**: Replace the entire component for a slot
 *    - Example: `slots={{ Title: MyCustomTitle }}`
 *    - Follows MUI's `slots` prop pattern
 *
 * 2. **Slot Props (via `slotProps` prop)**: Pass props to slot components
 *    - Example: `slotProps={{ title: { className: 'custom-class' } }}`
 *    - Follows MUI's `slotProps` prop pattern
 *
 * 3. **Reactive Slot Content (via hooks)**: Register dynamic content that updates based on dependencies
 *    - Example: `useDialogTitle("my-dialog", () => \`Count: ${count}\`, [count])`
 *    - Uses the Slot Registry system for dependency tracking and performance optimization
 *    - Each slot can update independently without re-rendering other parts
 *
 * The slot system enables:
 * - Performance: Isolated updates prevent unnecessary re-renders
 * - Flexibility: Mix static component replacement with dynamic reactive content
 * - MUI Alignment: Follows MUI's established slot/slotProps pattern for consistency
 *
 * Available slots: title, content, actions, statusBar, footer, props
 */
export interface DialogTitleSlotProps {
  id?: string;
  className?: string;
  children?: React.ReactNode;
}

export interface DialogContentSlotProps {
  id?: string;
  className?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  [key: string]: unknown;
}

export interface DialogActionsContainerSlotProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** MUI-only escape hatch consumed by the MUI adapter; ignored by other adapters. */
  sx?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface DialogComponents {
  /** Base dialog component. Replaces the default dialog component. */
  Base?: React.ComponentType<BaseDialogProps>;
  /** Title slot. Replaces the default title component. */
  Title?: React.ComponentType<DialogTitleSlotProps>;
  /** Main dialog content slot. Replaces the default content area. */
  Content?: React.ComponentType<DialogContentSlotProps>;
  /** Actions container slot. Replaces the default actions container component. */
  ActionsContainer?: React.ComponentType<DialogActionsContainerSlotProps>;
  /** Status bar slot. Replaces the default status bar component. */
  StatusBar?: React.ComponentType<StatusBarProps>;
  /** Footer slot. Replaces the default footer component. */
  Footer?: React.ComponentType<FooterProps>;
  /** Actions slot. Replaces the default actions component. */
  Actions?: React.ComponentType<ActionsProps>;
}

/**
 * Props that can be passed to slot components via the `slotProps` prop.
 * Each key corresponds to a slot name, and the value contains props to pass to that slot's component.
 *
 * @example
 * ```tsx
 * <DialogProvider
 *   slots={{ Title: MyCustomTitle }}
 *   slotProps={{
 *     title: { className: 'custom-title-class' },
 *     statusBar: { className: 'custom-status-bar' }
 *   }}
 * >
 * ```
 */
export interface DialogSlotProps {
  base?: Partial<BaseDialogProps>;
  title?: Partial<DialogTitleSlotProps>;
  content?: Partial<DialogContentSlotProps>;
  actionsContainer?: Partial<DialogActionsContainerSlotProps>;
  statusBar?: Partial<StatusBarProps>;
  footer?: Partial<FooterProps>;
  actions?: Partial<ActionsProps>;
}

/**
 * Structural props for the dialog "paper" element shared across adapters.
 * Adapters that wrap a richer component library (e.g. MUI Paper, Base UI Popup) accept
 * any extra props they need via the `[key: string]: unknown` index signature.
 */
export interface DialogPaperSlotProps {
  ref?: Ref<HTMLDivElement>;
  className?: string;
  style?: CSSProperties;
  [key: string]: unknown;
}

/**
 * Structural props for the backdrop element shared across adapters.
 */
export interface DialogBackdropSlotProps {
  className?: string;
  style?: CSSProperties;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  [key: string]: unknown;
}

export interface BaseDialogProps
  extends React.PropsWithChildren<{
    open: boolean;
    onClose: () => void;
    overflow?: "visible" | "hidden";
    /** Portal target for adapters that support one (Base UI / MUI). Headless ignores. */
    container?: Element | (() => Element | null) | null;
    /** When true, the underlying Base will not render its own backdrop */
    hideBackdrop?: boolean;
  }> {
  /** DOM id applied to the dialog root */
  id?: string;
  className?: string;
  slotProps?: {
    paper?: DialogPaperSlotProps;
    backdrop?: DialogBackdropSlotProps;
    [key: string]: unknown;
  };
  /** ARIA attributes for accessibility linkage */
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  /** Optional focus flags forwarded to the Base implementation. */
  disableAutoFocus?: boolean;
  disableEnforceFocus?: boolean;
  disableRestoreFocus?: boolean;
  /** Optional paper radius for custom `Base` implementations (maps to `--dialogist-border-radius` when supported). */
  borderRadius?: number | string;
}

export interface StatusBarProps {
  className?: string;
  content: React.ReactNode;
  dialogKey: string;
  dialogType: string;
}

export interface FooterProps {
  className?: string;
  content: React.ReactNode;
  dialogKey: string;
}

/** Flat list or grouped: each top-level element is a "slot" for layout. Single actions become groups of one. */
export type DialogActionsInput<T = unknown> =
  | DialogActionProps<T>[]
  | (DialogActionProps<T> | DialogActionProps<T>[])[];

/**
 * Props for a single dialog action (button).
 *
 * @template T - The type of resolveValue. Use with useDialog<T>() or dialog.open<T>() for strong typing.
 */
export interface DialogActionProps<T = unknown> {
  /** Optional id for the action; used in DialogCloseEvent.actionId when reason is "action" */
  id?: string;
  className?: string;
  title?: string;
  component?: React.ComponentType<unknown>;
  props?: Record<string, unknown>;
  children?: React.ReactNode;
  /**
   * Value to resolve the open() promise with when this action is clicked.
   * If set and props.onClick is not provided, an onClick handler is auto-wired to close the dialog with this value.
   * If both are set, props.onClick takes precedence and you must call dialog.close(resolveValue) yourself.
   */
  resolveValue?: T;
  /** When true, keep backdrop visible during close→next-open transition */
  preserveBackdrop?: boolean;
}

/** Alignment of action groups within the actions container (maps to flexbox justify-content) */
export type DialogActionsAlign = "start" | "center" | "end" | "space-between" | "space-around" | "space-evenly";

/** Style options for the actions container (align, gap, and future options) */
export interface ActionsStyle {
  /** Alignment of action groups: start (left), center, end (right), space-between, etc. */
  align?: DialogActionsAlign;
  /**
   * Flex `gap` on the actions **row** (between sibling group wrappers). When there is only one
   * group, this is also the gap between buttons in that group unless {@link intraGroupGap} is set.
   */
  gap?: number | string;
  /**
   * Flex `gap` **inside** each group box (between buttons in the same cluster). When omitted and
   * there are multiple groups, inner spacing defaults to `1` (theme spacing). Set explicitly to
   * match {@link gap} if you want the same spacing inside groups as between them.
   */
  intraGroupGap?: number | string;
}

/** Text alignment inside dialog content */
export type DialogContentTextAlign = "left" | "center" | "right" | "justify";

/** Style options for default/non-custom dialog content */
export interface ContentStyle {
  /** Flex alignment for content within the content container */
  align?: DialogActionsAlign;
  /** Text alignment applied to content */
  textAlign?: DialogContentTextAlign;
  /** Optional min width for dialog content area (number = px) */
  minWidth?: number | string;
  /** Optional max width for dialog content area (number = px) */
  maxWidth?: number | string;
  /** Optional minimum height for dialog content area (number = px) */
  minHeight?: number | string;
  /** Optional max height for dialog content area (number = px) */
  maxHeight?: number | string;
}

export interface ActionsProps {
  className?: string;
  /** Flattened actions; prefer actionGroups when rendering with layout */
  actions: DialogActionProps<unknown>[];
  /** Groups for layout: each group is rendered together; space-between applies across groups */
  actionGroups: DialogActionProps<unknown>[][];
  /** Style options for the actions container (align, gap, etc.) */
  actionsStyle?: ActionsStyle;
  dialogKey: string;
  // Either provide a common button component for all actions
  ButtonComponent?: React.ComponentType<unknown>;
  // Or provide specific components for each action position
  ActionComponents?: React.ComponentType<unknown>[];
}

export interface BaseDialogConfig {
  className?: string;
  dialogKey?: DialogKey;
  type: DialogType;
  title?: ReactNode;
  message?: DialogPartContent;
  /** Same role as `message` for the main body. If both are set, `content` is used. */
  content?: DialogPartContent;
  /** Fires for all close paths (button, Escape, backdrop, programmatic). Receives DialogCloseEvent. Runs async (setTimeout 0) after willClose. Use dialog.on("close") for same. */
  onClose?: (event: DialogCloseEvent) => void;
  /** Duration (ms) to wait before firing didClose. Default 300. */
  closeAnimationDuration?: number;
  /**
   * Guard evaluated before any close attempt; return false to keep the dialog open. Use dialog.on("closePrevented") when blocked.
   * When a function, receives {@link DialogCloseResolver} (aligned with {@link DialogCloseEvent} plus `config` and `keySegments`).
   */
  canClose?: DialogCanCloseValue;
  footer?: DialogPartContent;
  statusBar?: DialogPartContent;
  /** Border radius applied to dialog parts. Affects default components by default, custom components when set explicitly */
  borderRadius?: number | string;
  overflow?: "visible" | "hidden";
  /**
   * When a second `open()` would **block** (resolved {@link DialogConflictPolicy} is `"block"` or replace is not allowed for the key relationship), `true` rejects the `open()` promise; `false` resolves with `blocked: true` on {@link DialogCloseEvent} (default).
   * Active vs incoming vs provider (see {@link DialogConflictResolver}); default `false` when unset everywhere. **Conflict policy** (`onConflict`) is resolved separately (see {@link DialogConflictResolver}).
   */
  throwOnConflict?: boolean;
  /**
   * Conflict policy for a conflicting second `open()`. Governs **same-key** updates (in-place swap) and opens where **keyRelation** is not **sameKey** that would supersede the active dialog: a non-`block` policy on the **active** dialog (then provider / default) can authorize replace; `replaceSameKey` / `replaceSameRoot` / `replaceAny` further restrict by incoming vs active key relationship.
   * A function receives {@link DialogConflictResolver}. Return a {@link DialogConflictPolicy} to override; return nothing / `undefined` or a non-policy value to use {@link DialogConflictResolver.activePolicy} for that layer. Evaluated on the **active** dialog's config first; provider fills in when the active dialog **omits** `onConflict` (see {@link DialogConflictResolver}).
   */
  onConflict?: DialogConflictPolicy | ((conflict: DialogConflictResolver) => DialogConflictPolicy | undefined);
  /**
   * Optional CSS sizing for the dialog paper. When provided, values are applied
   * to the Dialog paper via sx. Numbers are treated as px, strings are passed through.
   */
  width?: number | string;
  minWidth?: number | string;
  /** Max width of the dialog paper. Accepts any CSS maxWidth value (number = px, or any CSS string). */
  maxWidth?: CSSProperties["maxWidth"];
  /**
   * Accessibility-focused restore behavior for focus after close.
   * Defaults to true (restore focus to the opener). Set to false to disable.
   */
  a11yRestoreFocus?: boolean;
  /**
   * When opening via `useDialogActionsContext().openDialog()`, pass the `ownerToken` from {@link useDialogHandlers}
   * so reactive handler merges from that hook apply to this open. Stripped before the row is stored in provider state.
   */
  ownerToken?: symbol;
  /** Optional throttle for live bridge pushing to props (ms) */
  liveThrottleMs?: number;
  /** Optional imperative handle ref */
  imperativeHandleRef?: ImperativeHandleRefType<unknown>;
  /** Custom actions to replace built-in buttons; supports flat array or grouped [[A,B], C] */
  actions?: DialogActionsInput;
  /** Style options for the actions container (align, gap, etc.) */
  actionsStyle?: ActionsStyle;
  /** Style options for default/non-custom content */
  contentStyle?: ContentStyle;
}

// Confirmation dialog specific options
export interface ConfirmDialogConfig extends BaseDialogConfig {
  type: "confirm";
  /** Primary action label for confirm dialogs (same semantic role as alert's okLabel) */
  okLabel?: string;
  cancelLabel?: string;
  onOkClick?: (event: DialogActionEvent) => void;
  onCancelClick?: (event: DialogActionEvent) => void;
  /** When true, keep backdrop visible during close→next-open transition triggered by OK */
  preserveBackdropOnOk?: boolean;
  /** When true, keep backdrop visible during close→next-open transition triggered by Cancel */
  preserveBackdropOnCancel?: boolean;
}

// Alert dialog specific options
export interface AlertDialogConfig extends BaseDialogConfig {
  type: "alert";
  okLabel?: string;
  onOkClick?: (event: DialogActionEvent) => void;
}

// Custom dialog options
export interface CustomDialogConfig extends BaseDialogConfig {
  type: "custom";
  /** Merged into the body when `message` / `content` is a component type. */
  props?: Record<string, unknown>;
}

// Union type for all dialog configs
export type DialogConfig = ConfirmDialogConfig | AlertDialogConfig | CustomDialogConfig;

/**
 * @internal Extra fields merged into `open()` by the library; not part of hand-written dialog configs.
 * `_dialogDeps` is stripped before storing. `_backdropHold` may appear on stored rows during transitions.
 */
export interface DialogOpenInternalFields {
  _dialogDeps?: import("./useDialog").DialogDeps;
  _backdropHold?: boolean;
}

/** Config passed into `openDialog` / `replaceDialog` (includes transient internal fields). */
export type DialogOpenConfig = DialogConfig & Partial<DialogOpenInternalFields> & { ownerToken?: symbol };

/** Config persisted on a dialog row (optional `_backdropHold` during backdrop hold). */
export type DialogStoredConfig = DialogConfig & Partial<Pick<DialogOpenInternalFields, "_backdropHold">>;

// Dialog types
export type DialogType = "confirm" | "alert" | "custom";

// Internal dialog state
export interface DialogState {
  key: string;
  keySegments: DialogKeyArray;
  type: DialogType;
  config: DialogStoredConfig;
  resolve?: (value: import("./types/callbacks").DialogCloseEvent) => void;
  reject?: (reason?: unknown) => void;
  /** Element that had focus when dialog opened (for focus restoration) */
  previousActiveElement?: HTMLElement | null;
  /** Whether the dialog was opened via keyboard (A11y) */
  openedViaKeyboard?: boolean;
  /** Stable internal ID for React reconciliation (prevents remount during replacement) */
  internalId: string;
}

export interface DialogCloseOptions {
  cancelled?: boolean;
  preserveBackdrop?: boolean;
  /** Internal: action data when close was triggered by a button */
  actionEvent?: {
    action: DialogCloseEvent["action"];
    actionId?: string;
    buttonText?: string;
    nativeEvent?: React.MouseEvent | React.KeyboardEvent;
  };
  resolveValue?: unknown;
  reason?: DialogCloseReason;
  force?: boolean;
}

export interface DialogContextValue {
  dialogs: DialogState[];
  openDialog: (config: DialogOpenConfig) => Promise<DialogCloseEvent>;
  closeDialog: (key: string, options?: DialogCloseOptions) => void;
  closeAllDialogs: (options?: { force?: boolean }) => void;
  replaceDialog: (dialogKey: string, config: DialogOpenConfig) => Promise<DialogCloseEvent>;
  callbacks: DialogCallbackRegistration;
  slots?: DialogComponents;
}
