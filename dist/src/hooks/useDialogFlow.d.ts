import type { ActionsStyle, DialogConfig, DialogKey } from "../types";
export type FlowStepName = string;
export interface FlowStepNextTarget<TDialogState = unknown> {
    step: FlowStepName | "end";
    label?: string;
    /**
     * Sort key for the action row (lower = further left in LTR). Next/Finish buttons default to
     * `100`, `101`, … when omitted.
     */
    order?: number;
    canProceed?: (ctx: {
        dialogState?: TDialogState;
    }) => boolean;
}
export type FlowStepNext<TDialogState = unknown> = FlowStepName | FlowStepNextTarget<TDialogState> | (FlowStepName | FlowStepNextTarget<TDialogState>)[];
export interface FlowStepAction {
    id?: string;
    label: string;
    /**
     * Sort key for the action row (lower = further left in LTR). Defaults to `10`, `11`, … in
     * declaration order when omitted.
     */
    order?: number;
    onClick?: () => void;
    props?: Record<string, unknown>;
}
/**
 * Base event passed to step lifecycle hooks (onEnd, onCancel, onBack).
 * Contains the current step, previous step, and optional imperative dialog state.
 */
export interface FlowStepEvent<TDialogState = unknown> {
    step: FlowStepName;
    prevStep?: FlowStepName;
    /** Imperative dialog state from useDialogImperativeHandle() (Phase 2 – currently undefined). */
    dialogState?: TDialogState;
}
/**
 * Event passed to resolveStep. Extends FlowStepEvent with the close reason so routing logic
 * can branch on what the user actually did (next, back, end, or cancel).
 */
export interface FlowResolveEvent<TDialogState = unknown> extends FlowStepEvent<TDialogState> {
    reason: "next" | "back" | "end" | "cancel";
}
/**
 * Return type for resolveStep:
 * - A step name — navigate to that step.
 * - `"end"` — explicitly finish the flow regardless of the configured `next`.
 * - `"back"` — go back to the previous step.
 * - `"start"` — restart from the initial step.
 * - `undefined` — fall through to default routing (respects the configured `next` target,
 *   or ends the flow if none is configured).
 */
export type FlowResolveAction = FlowStepName | "end" | "back" | "start" | undefined;
export interface FlowCancelConfig {
    show?: "always" | FlowStepName[];
    label?: string;
    props?: Record<string, unknown>;
    /**
     * Sort key for the action row (lower = further left in LTR). Defaults to `-1` so Cancel stays
     * left of Back (`0`), custom actions (`10+`), and Next/Finish (`100+`) unless you set a higher
     * value (for example `5` to place Cancel after Back).
     */
    order?: number;
}
export interface FlowBackConfig {
    /** Override the label. Defaults to `"Back"`. */
    label?: string;
    /** Extra MUI Button props applied to the Back button (e.g. `{ variant: "outlined" }`). */
    props?: Record<string, unknown>;
}
export interface FlowNextConfig {
    /**
     * Extra MUI Button props applied to intermediate Next buttons (i.e. buttons that advance
     * to a named step, not the terminal Finish button). E.g. `{ variant: "contained" }`.
     */
    props?: Record<string, unknown>;
}
export interface FlowEndConfig {
    label?: string;
    props?: Record<string, unknown>;
}
export interface FlowDefaults<TDialogState = unknown> {
    maxWidth?: DialogConfig["maxWidth"];
    /** Applied to the dialog paper (same as `open()` / {@link DialogConfig}). */
    minWidth?: DialogConfig["minWidth"];
    width?: DialogConfig["width"];
    /**
     * {@link DialogConfig.actionsStyle} for every step (merged with each step's `actionsStyle`).
     * Flow-built actions are always two groups: **(Cancel + Back)** and **(step `actions` + Next/Finish)** —
     * use `gap` for space between those groups and `intraGroupGap` for space between buttons inside a group.
     */
    actionsStyle?: ActionsStyle;
    cancel?: FlowCancelConfig;
    /** Styling / label for the Back button that appears on all non-first steps. */
    back?: FlowBackConfig;
    /** Default props applied to intermediate Next buttons (not the terminal Finish button). */
    next?: FlowNextConfig;
    end?: FlowEndConfig;
    /**
     * Called on every step transition regardless of reason. Receives a FlowStepEvent extended
     * with the transition reason — useful for global analytics or logging across the entire flow.
     * Fires after the step-level onStep (if any).
     */
    onStep?: (event: FlowStepEvent<TDialogState> & {
        reason: FlowResolveEvent<TDialogState>["reason"];
    }) => void;
    /**
     * Called whenever any step advances to the next step (reason = "next").
     * Fires after the step-level onNext (if any).
     */
    onNext?: (event: FlowStepEvent<TDialogState>) => void;
    /**
     * Called whenever any step finishes the flow (reason = "end").
     * Fires after the step-level onEnd (if any).
     */
    onEnd?: (event: FlowStepEvent<TDialogState>) => void;
    /**
     * Called whenever any step is cancelled (Cancel button, backdrop, Escape).
     * Fires after the step-level onCancel (if any).
     */
    onCancel?: (event: FlowStepEvent<TDialogState>) => void;
    /**
     * Called whenever the user navigates back from any step.
     * Fires after the step-level onBack (if any).
     */
    onBack?: (event: FlowStepEvent<TDialogState>) => void;
}
export interface FlowStepConfig<TDialogState = unknown> {
    title?: DialogConfig["title"];
    /** Overrides {@link FlowDefaults} for this step only. */
    maxWidth?: DialogConfig["maxWidth"];
    minWidth?: DialogConfig["minWidth"];
    width?: DialogConfig["width"];
    /** Overrides {@link FlowDefaults.actionsStyle} for this step only (shallow merge over defaults). */
    actionsStyle?: ActionsStyle;
    /** Main body content for this step. Same role as `message` — `content` takes precedence if both are set. */
    content?: DialogConfig["content"];
    /** Alias for `content`. If both are set, `content` takes precedence. */
    message?: DialogConfig["message"];
    /**
     * Label for the button used to navigate *to* this step when it is referenced by name (string)
     * in another step's `next` config. Has no effect when the step is referenced via a
     * `FlowStepNextTarget` object (use `FlowStepNextTarget.label` instead).
     */
    nextLabel?: string;
    next?: FlowStepNext<TDialogState>;
    actions?: FlowStepAction[];
    /**
     * Custom routing override for this step. When defined, its return value controls navigation:
     * a step ID navigates there, `"end"` finishes the flow, `"back"` goes back, `"start"` restarts.
     * Return `undefined` to fall through to default routing — the configured `next` target is
     * respected, or the flow ends if no `next` is configured.
     */
    resolveStep?: (event: FlowResolveEvent<TDialogState>) => FlowResolveAction;
    /**
     * Called on every transition out of this step, regardless of reason. Receives the full
     * resolve event including `reason`. Fires before the global `defaults.onStep`.
     */
    onStep?: (event: FlowStepEvent<TDialogState> & {
        reason: FlowResolveEvent<TDialogState>["reason"];
    }) => void;
    /** Called when this step advances to the next step (reason = "next"). */
    onNext?: (event: FlowStepEvent<TDialogState>) => void;
    /** Called when this step finishes the flow (reason = "end"). */
    onEnd?: (event: FlowStepEvent<TDialogState>) => void;
    /** Called when this step is cancelled (Cancel button, backdrop, Escape). */
    onCancel?: (event: FlowStepEvent<TDialogState>) => void;
    /** Called when the user navigates back from this step. */
    onBack?: (event: FlowStepEvent<TDialogState>) => void;
}
export interface DialogFlowConfig<TDialogState = unknown> {
    defaults?: FlowDefaults<TDialogState>;
    steps: Record<FlowStepName, FlowStepConfig<TDialogState>>;
}
/**
 * Runs a multi-step dialog flow. Each step opens with a composite {@link DialogKey}: the same key
 * you pass to this hook, with the step name appended as the final segment (e.g. flow
 * `"checkout"` and step `"shipping"` → `["checkout", "shipping"]`).
 *
 * For reactive content while a step is visible, register slots with that same composite key:
 * `useDialogSlots(["checkout", "shipping"], { ... })`. If the step name is a variable, use
 * `["checkout", stepName]` or `[...rootSegments, stepName]` when the flow key is an array.
 *
 * To close from outside without knowing the active step, call `useDialog(flowRoot).close()` on
 * the same root key — prefix matching resolves the open composite key.
 *
 * Paper sizing (`maxWidth`, `minWidth`, `width`) can be set on {@link FlowDefaults} for the whole
 * flow, or on individual {@link FlowStepConfig} entries to override for that step only.
 *
 * Built-in flow actions are always two groups — **Cancel + Back** and **step actions + Next/Finish**
 * — so use {@link FlowDefaults.actionsStyle} `gap` / `intraGroupGap` like {@link DialogConfig.actionsStyle}.
 */
export declare const useDialogFlow: <TDialogState = unknown>(dialogKey: DialogKey, flow: DialogFlowConfig<TDialogState>) => {
    start: (initialStepName: FlowStepName) => Promise<void>;
};
