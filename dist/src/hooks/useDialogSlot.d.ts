import { type ElementType } from "react";
import { type SlotType } from "../context/DialogSlotRegistry";
import type { DialogActionsInput, DialogKey } from "../types";
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
export declare const useDialogSlot: ({ dialogKey, slotType, factory, deps, enabled }: UseDialogSlotOptions) => void;
/**
 * Register dialog content: React nodes, `() => ReactNode` factories, or `forwardRef` / `memo` / `lazy` types. See
 * {@link SlotContentValue}. For plain function components prefer `() => <Component />` or `<Component />`. Props use
 * {@link useDialogProps} (object or `() => object` only).
 *
 * If `dependencies` is omitted or `[]`, deps default to `[content]`.
 */
export declare const useDialogContent: (dialogKey: DialogKey, content: SlotContentValue, deps?: React.DependencyList) => void;
/**
 * Register dialog title — same shapes as {@link useDialogContent} / {@link SlotContentValue}.
 *
 * If `dependencies` is omitted or `[]`, deps default to `[title]`.
 */
export declare const useDialogTitle: (dialogKey: DialogKey, content: SlotContentValue, deps?: React.DependencyList) => void;
/**
 * Register dialog actions — a static array of action configs or a factory that returns that array.
 *
 * If `dependencies` is omitted or `[]`, deps default to `[actions]`.
 */
export declare const useDialogActions: (dialogKey: DialogKey, value: DialogActionsInput | (() => DialogActionsInput), deps?: React.DependencyList) => void;
/**
 * Register dialog status bar — same accepted shapes as {@link useDialogContent}.
 *
 * If `dependencies` is omitted or `[]`, deps default to `[content]`.
 */
export declare const useDialogStatusBar: (dialogKey: DialogKey, content: SlotContentValue, deps?: React.DependencyList) => void;
/**
 * Register dialog footer — same accepted shapes as {@link useDialogContent}.
 *
 * If `dependencies` is omitted or `[]`, deps default to `[content]`.
 */
export declare const useDialogFooter: (dialogKey: DialogKey, content: SlotContentValue, deps?: React.DependencyList) => void;
/**
 * Register partial dialog config fields (same top-level keys as `open()` / `BaseDialogConfig`), merged into the live
 * dialog state—e.g. `borderRadius`, `overflow`, `width`, `contentStyle`, `actionsStyle`, `className`. Not React props
 * for one DOM node; the provider applies these to the dialog shell via scaffolding.
 *
 * Accepts a plain props object or `() => object` only (no component types).
 *
 * If `dependencies` is omitted or `[]`, deps default to `[props]`.
 */
export declare const useDialogProps: (dialogKey: DialogKey, value: Record<string, unknown> | (() => Record<string, unknown>), deps?: React.DependencyList) => void;
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
export declare const useDialogSlots: (dialogKey: DialogKey, slots: DialogSlotsConfig) => void;
export {};
