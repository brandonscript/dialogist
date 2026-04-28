"use client";
import { typeof as _typeof } from '../../_virtual/_rollupPluginBabelHelpers.js';
import { useCallback, isValidElement, createElement } from 'react';
import { useDialogSlotRegistry } from '../context/DialogSlotRegistry.js';
import { resolveDialogKey } from '../utils/dialogKey.js';
import { useLayoutShallowEffect } from './useShallowEffect.js';

/**
 * Title, content, status bar, footer: any {@link React.ReactNode}, or a factory `() => ReactNode` (invoked when the slot
 * resolves). `forwardRef` / `memo` / `lazy` object types are rendered with `createElement` and no props. For a plain
 * function component, use `() => <MyComponent />` or `<MyComponent />` — a bare `MyComponent` reference is invoked as a
 * zero-arg factory (same as today), which is wrong for components that use hooks.
 *
 * {@link SlotPropsValue} stays objects or `() => object` only.
 */

/**
 * Actions slot: same shape as `open().actions` / {@link DialogActionsInput} — flat list, grouped rows, or a factory.
 * This is data for the action model, not a React tree (see {@link resolveSlotValue} for title/content/footer/statusBar).
 */

/**
 * Two-element tuple for {@link useDialogSlots} only: `[value, deps]`. Both are required — there is no implied deps
 * (unlike the named hooks, which default empty deps to `[value]`).
 */

var EMPTY_DEPS = [];

/**
 * For {@link useDialogTitle}, {@link useDialogContent}, {@link useDialogProps}, {@link useDialogActions},
 * {@link useDialogStatusBar}, and {@link useDialogFooter}: when the dependency argument is omitted or `[]`, deps
 * default to `[value]` (the title/content/props object or factory) so the slot tracks that reference. {@link useDialogSlots}
 * does not use this — each entry must be an explicit two-element tuple `[value, deps]`.
 */
var resolveSlotDeps = function resolveSlotDeps(value, deps) {
  return deps.length > 0 ? deps : [value];
};

/**
 * Resolves a renderable slot to a React node: elements pass through; plain functions are invoked as factories;
 * `forwardRef` / `memo` / `lazy` objects (identified by `$$typeof`) are rendered via `createElement`.
 */
var resolveNodeSlot = function resolveNodeSlot(value) {
  if (/*#__PURE__*/isValidElement(value)) return value;
  if (typeof value === "function") {
    return value();
  }
  if (_typeof(value) === "object" && value !== null && "$$typeof" in value) {
    return /*#__PURE__*/createElement(value);
  }
  return value;
};

/** Resolves an object/data slot: calls it if it's a factory, otherwise uses the value directly.
 * Used for actions (`DialogActionsInput`) and props (`Record<string, unknown>`) — not React node slots. */
var resolveObjSlot = function resolveObjSlot(value) {
  return typeof value === "function" ? value() : value;
};
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
var useDialogSlot = function useDialogSlot(_ref) {
  var dialogKey = _ref.dialogKey,
    slotType = _ref.slotType,
    factory = _ref.factory,
    _ref$deps = _ref.deps,
    deps = _ref$deps === void 0 ? [] : _ref$deps,
    _ref$enabled = _ref.enabled,
    enabled = _ref$enabled === void 0 ? true : _ref$enabled;
  var _useDialogSlotRegistr = useDialogSlotRegistry(),
    registerSlot = _useDialogSlotRegistr.registerSlot,
    removeSlot = _useDialogSlotRegistr.removeSlot;
  var rKey = resolveDialogKey(dialogKey);

  // Same contract as useEffect: list everything the factory reads in `dependencies`; `factory` identity is ignored when deps are unchanged.
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional deps list for slot invalidation
  var stableFactory = useCallback(factory, deps);
  useLayoutShallowEffect(function () {
    if (!enabled) {
      removeSlot(rKey.str, slotType);
      return;
    }
    // Layout effect: register before paint so open dialogs merge slot updates in the same frame.
    var slot = {
      key: rKey.str,
      slotType: slotType,
      factory: stableFactory,
      deps: deps
    };
    registerSlot(slot);
  }, [rKey.str, slotType, registerSlot, removeSlot, enabled, stableFactory]);
};
var createNodeDialogSlotHook = function createNodeDialogSlotHook(slotType) {
  return function (dialogKey, content) {
    var deps = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
    return useDialogSlot({
      dialogKey: dialogKey,
      slotType: slotType,
      factory: function factory() {
        return resolveNodeSlot(content);
      },
      deps: resolveSlotDeps(content, deps)
    });
  };
};
var createObjectDialogSlotHook = function createObjectDialogSlotHook(slotType) {
  return function (dialogKey, value) {
    var deps = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
    return useDialogSlot({
      dialogKey: dialogKey,
      slotType: slotType,
      factory: function factory() {
        return resolveObjSlot(value);
      },
      deps: resolveSlotDeps(value, deps)
    });
  };
};

/**
 * Register dialog content: React nodes, `() => ReactNode` factories, or `forwardRef` / `memo` / `lazy` types. See
 * {@link SlotContentValue}. For plain function components prefer `() => <Component />` or `<Component />`. Props use
 * {@link useDialogProps} (object or `() => object` only).
 *
 * If `dependencies` is omitted or `[]`, deps default to `[content]`.
 */
var useDialogContent = createNodeDialogSlotHook("content");

/**
 * Register dialog title — same shapes as {@link useDialogContent} / {@link SlotContentValue}.
 *
 * If `dependencies` is omitted or `[]`, deps default to `[title]`.
 */
var useDialogTitle = createNodeDialogSlotHook("title");

/**
 * Register dialog actions — a static array of action configs or a factory that returns that array.
 *
 * If `dependencies` is omitted or `[]`, deps default to `[actions]`.
 */
var useDialogActions = createObjectDialogSlotHook("actions");

/**
 * Register dialog status bar — same accepted shapes as {@link useDialogContent}.
 *
 * If `dependencies` is omitted or `[]`, deps default to `[content]`.
 */
var useDialogStatusBar = createNodeDialogSlotHook("statusBar");

/**
 * Register dialog footer — same accepted shapes as {@link useDialogContent}.
 *
 * If `dependencies` is omitted or `[]`, deps default to `[content]`.
 */
var useDialogFooter = createNodeDialogSlotHook("footer");

/**
 * Register partial dialog config fields (same top-level keys as `open()` / `BaseDialogConfig`), merged into the live
 * dialog state—e.g. `borderRadius`, `overflow`, `width`, `contentStyle`, `actionsStyle`, `className`. Not React props
 * for one DOM node; the provider applies these to the dialog shell via scaffolding.
 *
 * Accepts a plain props object or `() => object` only (no component types).
 *
 * If `dependencies` is omitted or `[]`, deps default to `[props]`.
 */
var useDialogProps = createObjectDialogSlotHook("props");

/** Each `useDialogSlots` entry must be exactly `[value, deps]` (length 2). */
var assertValidSlotTuple = function assertValidSlotTuple(tuple, slotType) {
  var errMsg = "[Dialogist] useDialogSlots: \"".concat(slotType, "\" must be a two-element tuple [value, deps], with a dependency array (or empty []) as the second element.");
  if (!Array.isArray(tuple) || tuple.length !== 2) throw new Error(errMsg);
  if (!Array.isArray(tuple[1])) throw new Error(errMsg);
  return true;
};
var useRegisterSlotFromTuple = function useRegisterSlotFromTuple(dialogKey, slotType, tuple, map, whenDisabled) {
  var enabled = tuple !== undefined;
  var deps = EMPTY_DEPS;
  var value;
  if (enabled && assertValidSlotTuple(tuple, slotType)) {
    value = tuple[0]; // T — narrowed
    deps = tuple[1]; // React.DependencyList — narrowed
  }
  useDialogSlot({
    dialogKey: dialogKey,
    slotType: slotType,
    factory: function factory() {
      return !enabled || value === undefined ? whenDisabled : map(value);
    },
    deps: deps,
    enabled: enabled
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
var useDialogSlots = function useDialogSlots(dialogKey, slots) {
  useRegisterSlotFromTuple(dialogKey, "title", slots.title, resolveNodeSlot, undefined);
  useRegisterSlotFromTuple(dialogKey, "content", slots.content, resolveNodeSlot, undefined);
  useRegisterSlotFromTuple(dialogKey, "actions", slots.actions, resolveObjSlot, []);
  useRegisterSlotFromTuple(dialogKey, "statusBar", slots.statusBar, resolveNodeSlot, undefined);
  useRegisterSlotFromTuple(dialogKey, "footer", slots.footer, resolveNodeSlot, undefined);
  useRegisterSlotFromTuple(dialogKey, "props", slots.props, resolveObjSlot, {});
};

export { useDialogActions, useDialogContent, useDialogFooter, useDialogProps, useDialogSlot, useDialogSlots, useDialogStatusBar, useDialogTitle };
//# sourceMappingURL=useDialogSlot.js.map
