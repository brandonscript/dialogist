# API cheat sheet

Compact field lists for `useDialog`, `open()`, `DialogCloseEvent`, and `DialogProvider`. Narrative guides: [getting started](./getting-started.md), [actions](./actions-and-results.md), [closing](./closing-dialogs.md), [orchestration](./orchestration.md).

```ts
import { DialogProvider, useDialog } from "dialogist";
import type { DialogCloseEvent, DialogActionEvent } from "dialogist";
```

## `useDialog`

```ts
const dialog = useDialog(key?, initialConfig?, deps?);
```

`key` is a string or array (`["checkout", userId]` → `"checkout::userId"`). Hook defaults merge with each `open()`; per-open options win.

| Member | Role |
| ------ | ---- |
| `open(config?)` | Open or same-key update. Returns `Promise<DialogCloseEvent>` |
| `isOpen` | Whether this key is on the stack |
| `toggle` / `close` / `closeAll` | Visibility |
| `replace` / `next` / `back` | In-place replace; composite-key step navigation |
| `on` / `off` / `emit` | Typed events (see [Events](#events)) |
| `canClose` | Current close guard |
| `setTitle` / `setContent` / `setStatusBar` / `setFooter` / `setProps` | Imperative slot writes |
| `setImperativeHandle` | Attach a parent ref to child-exposed state |

Prefer `useDialogIsOpen(key)` when you only need open state.

## `open()` / `DialogConfig`

`type` omitted → `"custom"`. `content` wins if both `message` and `content` are set.

### Always relevant

| Option | Meaning |
| ------ | ------- |
| `type` | `"alert"` \| `"confirm"` \| `"custom"` |
| `dialogKey` | String or array; usually taken from `useDialog(key)` |
| `title` | React node |
| `message` / `content` | Node, JSX, or component type |
| `props` | Props for a component body (`type: "custom"`) |
| `actions` | Flat or grouped `[[left…], [right…]]` |
| `actionsStyle` | `{ align, gap, intraGroupGap }` |
| `contentStyle` | `{ align, textAlign, min/maxWidth, min/maxHeight }` |
| `footer` / `statusBar` | Extra slots |
| `width` / `minWidth` / `maxWidth` / `borderRadius` / `overflow` / `className` | Paper |
| `onClose` | All close paths |
| `canClose` | `boolean` or `(willClose) => boolean` |
| `onConflict` | `"block"` \| `"replaceSameKey"` \| `"replaceSameRoot"` \| `"replaceAny"` or a function |
| `throwOnConflict` | On block: reject vs `{ blocked: true }` |
| `a11yRestoreFocus` | Default `true` |
| `closeAnimationDuration` | Default `300`; delays `didClose` |
| `liveThrottleMs` | Throttle live props / bridge pushes |
| `ownerToken` | From `useDialogHandlers` when opening via `openDialog` |

### Type-specific

| Type | Extra options | Action ids |
| ---- | ------------- | ---------- |
| `alert` | `okLabel`, `onOkClick` | `ok` only |
| `confirm` | `okLabel`, `cancelLabel`, `onOkClick`, `onCancelClick`, `preserveBackdropOnOk` / `OnCancel` | `cancel` + `ok` |
| `custom` | `props`; any `actions` (default Close if omitted) | any |

### `DialogActionProps`

| Field | Meaning |
| ----- | ------- |
| `id` | Used as `event.actionId` |
| `title` / `children` | Label |
| `props` | Passed to the button component |
| `resolveValue` | Becomes `event.resolveValue` when this button closes |
| `preserveBackdrop` | Keep backdrop during the next open |
| `component` | Replace the default button |

## `DialogCloseEvent`

Returned by `open()` and passed to `onClose`. When `reason === "action"`, narrow to `DialogActionEvent`.

| Field | Meaning |
| ----- | ------- |
| `dialogKey` | Normalized key |
| `ok` | Confirmed (OK / non-cancel action) |
| `cancelled` | User dismiss (Cancel, backdrop, Escape). Not set for conflict blocks |
| `blocked` | `open()` settled without opening (`throwOnConflict` was false) |
| `reason` | `"action"` \| `"backdrop"` \| `"escape"` \| `"programmatic"` \| `"replace"` |
| `resolveValue` | From the clicked action |
| `action` / `actionId` / `buttonText` / `nativeEvent` | Present when `reason === "action"` |

```ts
const event = await dialog.open({ type: "confirm" });
if (event.ok) { /* confirmed */ }
else if (event.blocked) { /* conflict */ }
else { /* cancelled */ }
```

## `DialogProvider`

| Prop | Meaning |
| ---- | ------- |
| `slots` | Replace slot components (`muiSlots`, `baseUiSlots`, …) |
| `slotProps` | Props per slot (`title`, `content`, …) |
| `defaultOptions` | Merged into every `open()` |
| `onConflict` / `throwOnConflict` | Fallback when the active dialog omits them |
| `cssMode` | `"inject"` (default) \| `"external"` \| `"none"` |

Prefer `cssMode="external"` plus `import "dialogist/styles.css"` with Tailwind / shadcn / Base UI. `DialogistGlobalStyles` is the same injector if you need it outside the provider. See [Adapters](./adapters.md).

## Events

Built-in `dialog.on` / `off` / `emit` names:

| Event | Payload |
| ----- | ------- |
| `willClose` / `didClose` / `close` | `DialogCloseEvent` |
| `okClick` | `DialogActionEvent` |
| `cancel` | `DialogCloseEvent` |
| `closePrevented` | `{ reason, closeEvent }` |

Custom names need declaration merging:

```ts
// e.g. dialogist-augment.d.ts
import "dialogist";

declare module "dialogist" {
  interface DialogistEventMap {
    borderRadius: number;
  }
}
```

```ts
dialog.emit("borderRadius", 12);
dialog.on("borderRadius", (n) => console.log(n));
```

## Other hooks (short)

| Hook | Use when |
| ---- | -------- |
| `useDialogSlots` / `useDialogContent` / `useDialogTitle` / … | Live slot updates — [Updating content](./updating-content.md) |
| `useDialogExternalSync` | Local copy vs external store — [State and data flow](./state-and-data-flow.md) |
| `useDialogFlow` | Multi-step wizards — [Orchestration](./orchestration.md) |
| `useDialogHandlers` | `canClose` owned by a different component than `open()` |
| `useDialogTrigger` | `bindTrigger` / `bindToggle` plus `aria-haspopup` |
| `useDialogImperativeHandle` / `useDialogImperativeValue` | Child → parent state |
| `useDialogActionsContext` | `openDialog` / `closeDialog` without a `useDialog` instance |
