"use client";

import { type KeyboardEvent, type MouseEvent, useCallback, useRef } from "react";

import { dialogistClasses } from "../classes";
import type { ActionsStyle, DialogActionProps, DialogActionsInput, DialogConfig, DialogKey } from "../types";
import type { DialogCloseEvent } from "../types/callbacks";
import { useDialog } from "../useDialog";

// --- Public types ---

export type FlowStepName = string;

export interface FlowStepNextTarget<TDialogState = unknown> {
  step: FlowStepName | "end";
  label?: string;
  /**
   * Sort key for the action row (lower = further left in LTR). Next/Finish buttons default to
   * `100`, `101`, … when omitted.
   */
  order?: number;
  canProceed?: (ctx: { dialogState?: TDialogState }) => boolean;
}

export type FlowStepNext<TDialogState = unknown> =
  | FlowStepName
  | FlowStepNextTarget<TDialogState>
  | (FlowStepName | FlowStepNextTarget<TDialogState>)[];

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
  onStep?: (event: FlowStepEvent<TDialogState> & { reason: FlowResolveEvent<TDialogState>["reason"] }) => void;
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
  onStep?: (event: FlowStepEvent<TDialogState> & { reason: FlowResolveEvent<TDialogState>["reason"] }) => void;
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

// --- Internal sentinel for flow-driven action resolution ---

type FlowActionResolveValue =
  | { __flowAction: "cancel" }
  | { __flowAction: "back" }
  | { __flowAction: "next"; step: FlowStepName | "end" };

const DEFAULT_CANCEL_ORDER = -1;
const DEFAULT_BACK_ORDER = 0;
const CUSTOM_ORDER_BASE = 10;
const NEXT_ORDER_BASE = 100;

type OrderedFlowAction = { order: number; seq: number; action: DialogActionProps };

// --- Internal helpers ---

// biome-ignore lint/suspicious/noExplicitAny: internal type alias for unparameterized flow steps
type AnyFlowStepConfig = FlowStepConfig<any>;
// biome-ignore lint/suspicious/noExplicitAny: internal type alias for unparameterized flow defaults
type AnyFlowDefaults = FlowDefaults<any>;

const isFlowActionValue = (v: unknown): v is FlowActionResolveValue => {
  if (!v || typeof v !== "object" || !("__flowAction" in v)) return false;
  const a = v as { __flowAction: string };
  return a.__flowAction === "cancel" || a.__flowAction === "back" || a.__flowAction === "next";
};

const decodeFlowAction = (
  resolveValue: unknown,
): { kind: "cancel" } | { kind: "back" } | { kind: "next"; step: FlowStepName | "end" } | undefined => {
  if (!isFlowActionValue(resolveValue)) return undefined;
  if (resolveValue.__flowAction === "cancel") return { kind: "cancel" };
  if (resolveValue.__flowAction === "back") return { kind: "back" };
  const step = resolveValue.step === undefined ? "end" : resolveValue.step;
  return { kind: "next", step };
};

/** Flow-built Cancel / Back vs step actions + Next/Finish (always two groups for layout). */
const flowActionNavSide = (a: DialogActionProps): "left" | "right" => {
  const d = decodeFlowAction(a.resolveValue);
  return d?.kind === "cancel" || d?.kind === "back" ? "left" : "right";
};

const toGroupedFlowActions = (flat: DialogActionProps[]): DialogActionsInput => {
  const left: DialogActionProps[] = [];
  const right: DialogActionProps[] = [];
  for (const action of flat) {
    (flowActionNavSide(action) === "left" ? left : right).push(action);
  }
  if (left.length === 0 || right.length === 0) return flat;
  return [left, right];
};

const resolveNextTargets = (
  // biome-ignore lint/suspicious/noExplicitAny: internal helper accepts unparameterized next
  next: FlowStepNext<any> | undefined,
  defaults: AnyFlowDefaults | undefined,
  steps: Record<string, AnyFlowStepConfig>,
): FlowStepNextTarget[] => {
  const labelForStep = (stepName: string) =>
    stepName === "end" ? (defaults?.end?.label ?? "Finish") : (steps[stepName]?.nextLabel ?? "Next");

  if (next === undefined) {
    return [{ step: "end", label: defaults?.end?.label ?? "Finish" }];
  }
  if (typeof next === "string") {
    return [{ step: next, label: labelForStep(next) }];
  }
  if (Array.isArray(next)) {
    return next.map((t) =>
      typeof t === "string" ? { step: t, label: labelForStep(t) } : { ...t, label: t.label ?? labelForStep(t.step) },
    );
  }
  return [{ ...next, label: next.label ?? labelForStep(next.step) }];
};

const shouldShowCancel = (stepName: FlowStepName, cancel: FlowCancelConfig | undefined): boolean => {
  if (!cancel?.show) return false;
  if (cancel.show === "always") return true;
  return cancel.show.includes(stepName);
};

const buildStepActions = (
  stepName: FlowStepName,
  step: AnyFlowStepConfig,
  isFirstStep: boolean,
  defaults: AnyFlowDefaults | undefined,
  /** True only when Back is newly appearing (forward transition from step 1 → step 2). */
  isBackNewlyAppearing: boolean,
  steps: Record<string, AnyFlowStepConfig>,
): DialogActionsInput => {
  const cancelCfg = defaults?.cancel;
  const ordered: OrderedFlowAction[] = [];
  let seq = 0;

  if (shouldShowCancel(stepName, cancelCfg)) {
    ordered.push({
      order: cancelCfg?.order ?? DEFAULT_CANCEL_ORDER,
      seq: seq++,
      action: {
        children: cancelCfg?.label ?? "Cancel",
        props: { variant: "text", ...cancelCfg?.props },
        resolveValue: { __flowAction: "cancel" } satisfies FlowActionResolveValue,
        preserveBackdrop: true,
      },
    });
  }

  const userBackClassName = defaults?.back?.props?.className as string | undefined;
  const backAppearClass = isBackNewlyAppearing ? dialogistClasses.flowBackAppear : undefined;
  ordered.push({
    order: DEFAULT_BACK_ORDER,
    seq: seq++,
    action: {
      children: defaults?.back?.label ?? "Back",
      props: isFirstStep
        ? { variant: "outlined", ...defaults?.back?.props, disabled: true, style: { visibility: "hidden" } }
        : {
            variant: "outlined",
            ...defaults?.back?.props,
            ...(backAppearClass || userBackClassName
              ? {
                  className: [backAppearClass, userBackClassName].filter(Boolean).join(" "),
                }
              : {}),
          },
      resolveValue: { __flowAction: "back" } satisfies FlowActionResolveValue,
      preserveBackdrop: true,
    },
  });

  (step.actions ?? []).forEach((action: FlowStepAction, i: number) => {
    ordered.push({
      order: action.order ?? CUSTOM_ORDER_BASE + i,
      seq: seq++,
      action: {
        id: action.id,
        children: action.label,
        props: {
          ...action.props,
          ...(action.onClick
            ? {
                onClick: (e: MouseEvent | KeyboardEvent) => {
                  action.onClick?.();
                  (action.props?.onClick as ((ev: typeof e) => void) | undefined)?.(e);
                },
              }
            : {}),
        },
      },
    });
  });

  const targets = resolveNextTargets(step.next, defaults, steps);
  targets.forEach((t, i) => {
    const can = t.canProceed?.({ dialogState: undefined });
    const disabled = can === false;
    const label = t.label ?? (t.step === "end" ? (defaults?.end?.label ?? "Finish") : "Next");
    const isFinishTarget = t.step === "end";
    ordered.push({
      order: t.order ?? NEXT_ORDER_BASE + i,
      seq: seq++,
      action: {
        children: label,
        props: {
          variant: "contained",
          ...(isFinishTarget ? defaults?.end?.props : defaults?.next?.props),
          disabled,
        },
        resolveValue: { __flowAction: "next", step: t.step } satisfies FlowActionResolveValue,
        preserveBackdrop: true,
      },
    });
  });

  ordered.sort((a, b) => a.order - b.order || a.seq - b.seq);

  const flat = ordered.map((o) => o.action);
  return toGroupedFlowActions(flat);
};

const buildStepConfig = (
  stepName: FlowStepName,
  step: AnyFlowStepConfig,
  compositeKey: DialogKey,
  isFirstStep: boolean,
  defaults: AnyFlowDefaults | undefined,
  isBackNewlyAppearing = false,
  steps: Record<string, AnyFlowStepConfig> = {},
): DialogConfig => {
  const actions = buildStepActions(stepName, step, isFirstStep, defaults, isBackNewlyAppearing, steps);
  const mergedActionsStyle: ActionsStyle = { ...defaults?.actionsStyle, ...step.actionsStyle };
  const actionsStyle = Object.keys(mergedActionsStyle).length > 0 ? mergedActionsStyle : undefined;
  return {
    type: "custom",
    dialogKey: compositeKey,
    title: step.title,
    ...(step.content !== undefined
      ? { content: step.content }
      : step.message !== undefined
        ? { message: step.message }
        : { message: " " }),
    maxWidth: step.maxWidth ?? defaults?.maxWidth,
    minWidth: step.minWidth ?? defaults?.minWidth,
    width: step.width ?? defaults?.width,
    actions,
    ...(actionsStyle ? { actionsStyle } : {}),
  };
};

/** Builds the per-step dialog key used by {@link useDialogFlow} (flow key + step segment). */
const flowStepKey = (dialogKey: DialogKey, stepName: FlowStepName): DialogKey =>
  Array.isArray(dialogKey) ? [...(dialogKey as (string | number)[]), stepName] : [String(dialogKey), stepName];

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
export const useDialogFlow = <TDialogState = unknown>(dialogKey: DialogKey, flow: DialogFlowConfig<TDialogState>) => {
  const dialog = useDialog(dialogKey);
  const flowRef = useRef(flow);
  flowRef.current = flow;

  const start = useCallback(
    async (initialStepName: FlowStepName) => {
      const steps = flowRef.current.steps;
      const defaults = flowRef.current.defaults;

      const stepDef = steps[initialStepName];
      if (!stepDef) {
        throw new Error(`[Dialogist] useDialogFlow: Step "${initialStepName}" not found in steps definition.`);
      }

      const flowStack: FlowStepName[] = [initialStepName];
      const initialKey = flowStepKey(dialogKey, initialStepName);
      const initialConfig = buildStepConfig(initialStepName, stepDef, initialKey, true, defaults, false, steps);

      let lastResult: DialogCloseEvent = await dialog.open(initialConfig);
      // Tracks the step shown immediately before the current one — updated on every navigation
      // so that back-then-forward correctly reports prevStep as the step backed out of.
      let prevStep: FlowStepName | undefined;

      const cleanup = () => {
        dialog.close(undefined, { force: true });
      };

      try {
        while (true) {
          if (lastResult.blocked) {
            break;
          }

          const currentStepName = flowStack[flowStack.length - 1];
          const step = steps[currentStepName];
          if (!step) {
            throw new Error(`[Dialogist] useDialogFlow: Step "${currentStepName}" not found in steps definition.`);
          }

          // 1. Decode base reason from the close event
          const flowAction = lastResult.reason === "action" ? decodeFlowAction(lastResult.resolveValue) : undefined;

          let reason: FlowResolveEvent["reason"];
          if (!flowAction || flowAction.kind === "cancel" || lastResult.reason !== "action") {
            reason = "cancel";
          } else if (flowAction.kind === "back") {
            reason = "back";
          } else {
            reason = flowAction.step === "end" ? "end" : "next";
          }

          // 2. Build event objects
          const stepEvent: FlowStepEvent<TDialogState> = {
            step: currentStepName,
            prevStep,
            dialogState: undefined,
          };
          const resolveEvent: FlowResolveEvent<TDialogState> = { ...stepEvent, reason };

          // 3. Fire per-reason lifecycle hooks (step-level first, then global)
          if (reason === "cancel") {
            step.onCancel?.(stepEvent);
            defaults?.onCancel?.(stepEvent);
          } else if (reason === "back") {
            step.onBack?.(stepEvent);
            defaults?.onBack?.(stepEvent);
          } else if (reason === "next") {
            step.onNext?.(stepEvent);
            defaults?.onNext?.(stepEvent);
          } else {
            // "end"
            step.onEnd?.(stepEvent);
            defaults?.onEnd?.(stepEvent);
          }
          // Always fires for every step transition — useful for per-step or global analytics
          step.onStep?.(resolveEvent);
          defaults?.onStep?.(resolveEvent);

          // 4. Call resolveStep for routing override (step-level only)
          const stepRedirect = step.resolveStep?.(resolveEvent);

          // 5. Determine final routing action
          let finalAction: FlowResolveAction;
          if (stepRedirect !== undefined) {
            finalAction = stepRedirect;
          } else {
            switch (reason) {
              case "cancel":
              case "end":
                finalAction = "end";
                break;
              case "back":
                finalAction = "back";
                break;
              case "next":
                finalAction = (flowAction as { kind: "next"; step: FlowStepName | "end" }).step;
                break;
            }
          }

          // 6. Execute routing
          if (!finalAction || finalAction === "end") break;

          if (finalAction === "back") {
            if (flowStack.length <= 1) break;
            flowStack.pop();
            const targetStepName = flowStack[flowStack.length - 1];
            if (!targetStepName) break;
            const targetDef = steps[targetStepName];
            if (!targetDef) break;
            const targetIsFirstStep = flowStack.length === 1;
            const targetKey = flowStepKey(dialogKey, targetStepName);
            prevStep = currentStepName;
            // Rebuild fresh config with no animation class (Back was already visible on this step).
            const prevConfig = buildStepConfig(
              targetStepName,
              targetDef,
              targetKey,
              targetIsFirstStep,
              defaults,
              false,
              steps,
            );
            lastResult = (await dialog.replace(prevConfig)) as DialogCloseEvent;
            continue;
          }

          if (finalAction === "start") {
            flowStack.length = 0;
            flowStack.push(initialStepName);
            const restartKey = flowStepKey(dialogKey, initialStepName);
            prevStep = currentStepName;
            const restartConfig = buildStepConfig(
              initialStepName,
              steps[initialStepName],
              restartKey,
              true,
              defaults,
              false,
              steps,
            );
            lastResult = (await dialog.replace(restartConfig)) as DialogCloseEvent;
            continue;
          }

          // Navigate forward to a named step
          const nextStepName = finalAction;
          const nextDef = steps[nextStepName];
          if (!nextDef) {
            throw new Error(`[Dialogist] useDialogFlow: Step "${nextStepName}" not found in steps definition.`);
          }
          prevStep = currentStepName;
          flowStack.push(nextStepName);
          const nextKey = flowStepKey(dialogKey, nextStepName);
          // Animate Back only when it's newly appearing: the stack just grew from 1 to 2.
          const isBackNewlyAppearing = flowStack.length === 2;
          const nextConfig = buildStepConfig(
            nextStepName,
            nextDef,
            nextKey,
            false,
            defaults,
            isBackNewlyAppearing,
            steps,
          );
          lastResult = (await dialog.replace(nextConfig)) as DialogCloseEvent;
        }
      } finally {
        cleanup();
      }
    },
    [dialog, dialogKey],
  );

  return { start };
};
