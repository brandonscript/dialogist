"use client";

import { createElement, type ElementType, isValidElement, useCallback } from "react";

import { type DialogSlot, type SlotType, useDialogSlotRegistry } from "../context/DialogSlotRegistry";
import type { DialogActionsInput, DialogKey } from "../types";
import { resolveDialogKey } from "../utils/dialogKey";
import { useLayoutShallowEffect } from "./useShallowEffect";

/**
 * Title, content, status bar, footer: any {@link React.ReactNode}, or a factory `() => ReactNode` (invoked when the slot
 * resolves). `forwardRef` / `memo` / `lazy` object types are rendered with `createElement` and no props. For a plain
 * function component, use `() => <MyComponent />` or `<MyComponent />` — a bare `MyComponent` reference is invoked as a
 * zero-arg factory (same as today), which is wrong for components that use hooks.
 *
 * {@link SlotPropsValue} stays objects or `() => object` only.
 */
export type SlotContentValue = React.ReactNode | ElementType;

/**
 * Actions slot: same shape as `open().actions` / {@link DialogActionsInput} — flat list, grouped rows, or a factory.
 * This is data for the action model, not a React tree (see {@link resolveSlotValue} for title/content/footer/statusBar).
 */
export type SlotActionsValue = DialogActionsInput | (() => DialogActionsInput);

type SlotPropsValue = (() => Record<string, unknown>) | Record<string, unknown>;

/**
 * Two-element tuple for {@link useDialogSlots} only: `[value, deps]`. Both are required — there is no implied deps
 * (unlike the named hooks, which default empty deps to `[value]`).
 */
export type SlotTuple<T> = readonly [T, React.DependencyList];

export type DialogSlotsConfig = {
  title?: SlotTuple<SlotContentValue>;
  content?: SlotTuple<SlotContentValue>;
  actions?: SlotTuple<SlotActionsValue>;
  statusBar?: SlotTuple<SlotContentValue>;
  footer?: SlotTuple<SlotContentValue>;
  props?: SlotTuple<SlotPropsValue>;
};

const EMPTY_DEPS: React.DependencyList = [];

/**
 * For {@link useDialogTitle}, {@link useDialogContent}, {@link useDialogProps}, {@link useDialogActions},
 * {@link useDialogStatusBar}, and {@link useDialogFooter}: when the dependency argument is omitted or `[]`, deps
 * default to `[value]` (the title/content/props object or factory) so the slot tracks that reference. {@link useDialogSlots}
 * does not use this — each entry must be an explicit two-element tuple `[value, deps]`.
 */
const resolveSlotDeps = <T>(value: T, deps: React.DependencyList): React.DependencyList =>
  deps.length > 0 ? deps : [value];

/**
 * Resolves a renderable slot to a React node: elements pass through; plain functions are invoked as factories;
 * `forwardRef` / `memo` / `lazy` objects (identified by `$$typeof`) are rendered via `createElement`.
 */
const resolveNodeSlot = (value: SlotContentValue): React.ReactNode => {
  if (isValidElement(value)) return value;
  if (typeof value === "function") {
    return (value as () => React.ReactNode)();
  }
  if (typeof value === "object" && value !== null && "$$typeof" in value) {
    return createElement(value as unknown as ElementType);
  }
  return value as React.ReactNode;
};

/** Resolves an object/data slot: calls it if it's a factory, otherwise uses the value directly.
 * Used for actions (`DialogActionsInput`) and props (`Record<string, unknown>`) — not React node slots. */
const resolveObjSlot = <T>(value: T | (() => T)): T => (typeof value === "function" ? (value as () => T)() : value);

export interface UseDialogSlotOptions {
  /** Dialog key */
  dialogKey: DialogKey;
  /** Type of slot (title, content, actions, etc.) */
  slotType: SlotType;
  /** Factory that returns slot content; memoized with `deps`, same contract as `useEffect`. */
  factory: () => unknown;
  /** Dependencies that trigger slot updates (like useEffect) */
  deps: React.DependencyList;
  /** When `false`, removes this slot from the registry. Used by `useDialogSlots` for optional slots */
  enabled?: boolean;
}

/**
 * Low-level hook to register a dialog slot with automatic dependency tracking.
 * Works like `useEffect` but registers content for dialog slots.
 *
 * @example
 * ```typescript
 * useDialogSlot({
 *   dialogKey: "my-dialog",
 *   slotType: "content",
 *   factory: () => <MyComponent prop={someState} />,
 *   dependencies: [someState],
 * });
 * ```
 */
export const useDialogSlot = ({ dialogKey, slotType, factory, deps = [], enabled = true }: UseDialogSlotOptions) => {
  const { registerSlot, removeSlot } = useDialogSlotRegistry();
  const rKey = resolveDialogKey(dialogKey);

  // Same contract as useEffect: list everything the factory reads in `dependencies`; `factory` identity is ignored when deps are unchanged.
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional deps list for slot invalidation
  const stableFactory = useCallback(factory, deps);

  useLayoutShallowEffect(() => {
    if (!enabled) {
      removeSlot(rKey.str, slotType);
      return;
    }
    // Layout effect: register before paint so open dialogs merge slot updates in the same frame.
    const slot: DialogSlot = {
      key: rKey.str,
      slotType,
      factory: stableFactory,
      deps,
    };

    registerSlot(slot);
  }, [rKey.str, slotType, registerSlot, removeSlot, enabled, stableFactory]);
};

const createNodeDialogSlotHook =
  (slotType: SlotType) =>
  (dialogKey: DialogKey, content: SlotContentValue, deps: React.DependencyList = []) =>
    useDialogSlot({
      dialogKey,
      slotType,
      factory: () => resolveNodeSlot(content),
      deps: resolveSlotDeps(content, deps),
    });

const createObjectDialogSlotHook =
  <T>(slotType: SlotType) =>
  (dialogKey: DialogKey, value: T | (() => T), deps: React.DependencyList = []) =>
    useDialogSlot({
      dialogKey,
      slotType,
      factory: () => resolveObjSlot<T>(value),
      deps: resolveSlotDeps(value, deps),
    });

/**
 * Register dialog content: React nodes, `() => ReactNode` factories, or `forwardRef` / `memo` / `lazy` types. See
 * {@link SlotContentValue}. For plain function components prefer `() => <Component />` or `<Component />`. Props use
 * {@link useDialogProps} (object or `() => object` only).
 *
 * If `dependencies` is omitted or `[]`, deps default to `[content]`.
 */
export const useDialogContent = createNodeDialogSlotHook("content");

/**
 * Register dialog title — same shapes as {@link useDialogContent} / {@link SlotContentValue}.
 *
 * If `dependencies` is omitted or `[]`, deps default to `[title]`.
 */
export const useDialogTitle = createNodeDialogSlotHook("title");

/**
 * Register dialog actions — a static array of action configs or a factory that returns that array.
 *
 * If `dependencies` is omitted or `[]`, deps default to `[actions]`.
 */
export const useDialogActions = createObjectDialogSlotHook<DialogActionsInput>("actions");

/**
 * Register dialog status bar — same accepted shapes as {@link useDialogContent}.
 *
 * If `dependencies` is omitted or `[]`, deps default to `[content]`.
 */
export const useDialogStatusBar = createNodeDialogSlotHook("statusBar");

/**
 * Register dialog footer — same accepted shapes as {@link useDialogContent}.
 *
 * If `dependencies` is omitted or `[]`, deps default to `[content]`.
 */
export const useDialogFooter = createNodeDialogSlotHook("footer");

/**
 * Register partial dialog config fields (same top-level keys as `open()` / `BaseDialogConfig`), merged into the live
 * dialog state—e.g. `borderRadius`, `overflow`, `width`, `contentStyle`, `actionsStyle`, `className`. Not React props
 * for one DOM node; the provider applies these to the dialog shell via scaffolding.
 *
 * Accepts a plain props object or `() => object` only (no component types).
 *
 * If `dependencies` is omitted or `[]`, deps default to `[props]`.
 */
export const useDialogProps = createObjectDialogSlotHook<Record<string, unknown>>("props");

/** Each `useDialogSlots` entry must be exactly `[value, deps]` (length 2). */
const assertValidSlotTuple = <T>(tuple: unknown, slotType: SlotType): tuple is SlotTuple<T> => {
  const errMsg = `[Dialogist] useDialogSlots: "${slotType}" must be a two-element tuple [value, deps], with a dependency array (or empty []) as the second element.`;
  if (!Array.isArray(tuple) || tuple.length !== 2) throw new Error(errMsg);
  if (!Array.isArray(tuple[1])) throw new Error(errMsg);
  return true;
};

const useRegisterSlotFromTuple = <T>(
  dialogKey: DialogKey,
  slotType: SlotType,
  tuple: SlotTuple<T> | undefined,
  map: (value: T) => unknown,
  whenDisabled: unknown,
): void => {
  const enabled = tuple !== undefined;
  let deps: React.DependencyList = EMPTY_DEPS;
  let value: T | undefined;
  if (enabled && assertValidSlotTuple<T>(tuple, slotType)) {
    value = tuple[0]; // T — narrowed
    deps = tuple[1]; // React.DependencyList — narrowed
  }
  useDialogSlot({
    dialogKey,
    slotType,
    factory: () => (!enabled || value === undefined ? whenDisabled : map(value)),
    deps,
    enabled,
  });
};

/**
 * Register multiple dialog slots in one call. Each set slot must be a {@link SlotTuple}: **always** two elements
 * `[value, deps]` — never omit the dependency array (use `[]` if you intend no external deps). Unlike the named
 * hooks, there is no implied deps from `value` alone.
 *
 * @example
 * ```tsx
 * useDialogSlots(DIALOG_KEY, {
 *   title: [`Todo list (${todos.length} items)`, [todos.length]],
 *   content: [() => <TodoList todos={todos} />, [todos]],
 *   props: [{ overflow: "visible" }, []],
 * });
 * ```
 */
export const useDialogSlots = (dialogKey: DialogKey, slots: DialogSlotsConfig) => {
  useRegisterSlotFromTuple<SlotContentValue>(dialogKey, "title", slots.title, resolveNodeSlot, undefined);
  useRegisterSlotFromTuple<SlotContentValue>(dialogKey, "content", slots.content, resolveNodeSlot, undefined);
  useRegisterSlotFromTuple<SlotActionsValue>(dialogKey, "actions", slots.actions, resolveObjSlot, []);
  useRegisterSlotFromTuple<SlotContentValue>(dialogKey, "statusBar", slots.statusBar, resolveNodeSlot, undefined);
  useRegisterSlotFromTuple<SlotContentValue>(dialogKey, "footer", slots.footer, resolveNodeSlot, undefined);
  useRegisterSlotFromTuple<SlotPropsValue>(dialogKey, "props", slots.props, resolveObjSlot, {});
};
