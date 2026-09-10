# Getting started

Dialogist is a centralized, promise-based dialog manager for React. Wrap the app once with `DialogProvider`, then open dialogs from any component with `useDialog`.

Use `dialog.open({ type })`. `open()` returns a `Promise<DialogCloseEvent>`.

Interactive walkthrough: [The basics](https://brandonscript.github.io/dialogist/the-basics).

## Install

```bash
npm install dialogist
```

Peer dependencies: `react` and `react-dom` `>=18`. UI-library peers are optional — install only the adapter you use. See [Adapters](./adapters.md).

## Provider

```tsx
import "dialogist/styles.css";
import { DialogProvider, useDialog } from "dialogist";

function App() {
  return (
    <DialogProvider>
      <MyComponent />
    </DialogProvider>
  );
}
```

`cssMode` controls how structural CSS lands on the page:

- `"inject"` (default) — Dialogist injects a refcounted `<style>` tag.
- `"external"` — you imported `dialogist/styles.css` (recommended with Tailwind / shadcn / Base UI).
- `"none"` — no injection; useful in tests or when every slot is fully custom.

Pass `slots` for a UI library adapter (`muiSlots`, `baseUiSlots`, `shadcnSlots`, `tailwindSlots`). Headless DOM is the default when `slots` is omitted.

## Alert dialog

Register a dialog with a unique id, then call `open()`:

```tsx
const dialog = useDialog("my-dialog");

dialog.open({
  type: "alert",
  title: "Heads up",
  message: "Something important just happened.",
});
```

Alert dialogs have one message and one OK button. Explicit `actions` are restricted to `[id=ok]`.

## Confirmation dialog

```tsx
const dialog = useDialog("my-dialog");

dialog.open({
  type: "confirm",
  message: "Are you sure you want to proceed?",
  onOkClick: () => {
    // user confirmed
  },
  onCancelClick: () => {
    // user cancelled
  },
});
```

Confirm dialogs have Cancel + Confirm. Explicit `actions` are restricted to ids `cancel` and `ok`.

## Await the result

`open()` is always a promise. Await it instead of using callbacks when the caller should branch on the outcome:

```tsx
const dialog = useDialog("my-dialog");

const event = await dialog.open({
  type: "confirm",
  title: "Confirm action",
  message: "Do you want to proceed?",
});

console.log(event.ok); // true if the user confirmed
```

`DialogCloseEvent` fields you will use most:

| Field | Meaning |
| ----- | ------- |
| `ok` | User confirmed (OK / Confirm / a non-cancel action) |
| `cancelled` | User dismissed (Cancel, backdrop, or Escape) |
| `blocked` | Conflicting `open()` was blocked by policy (not a user cancel) |
| `reason` | `"action"` \| `"backdrop"` \| `"escape"` \| `"programmatic"` \| `"replace"` |
| `resolveValue` | From the clicked action’s `resolveValue` |

```tsx
const event = await dialog.open({ type: "confirm" });

if (event.ok) {
  // user confirmed
} else if (event.blocked) {
  // conflicting open() was blocked
} else {
  // user cancelled
}
```

## Dialog configuration

Hook defaults merge with each `open()` call. Per-open options win.

```tsx
const dialog = useDialog("edit-name-dialog", {
  type: "alert",
  title: "Edit your name",
  message: "Choose a display name for your profile before saving.",
  okLabel: "Save",
  cancelLabel: "Cancel",
});

dialog.open({
  type: "confirm",
  title: `Edit your name, ${name}?`,
  message: <EditNameDialogContent name={name} />,
  okLabel: name.trim() ? "Save" : "Invalid name",
  cancelLabel: "Keep editing",
});
```

Handlers you can set on the hook or on `open()`:

```tsx
onOkClick(event: DialogActionEvent)
onCancelClick(event: DialogActionEvent)
onClick(actionId: string, event: DialogActionEvent) // custom actions

onClose(event: DialogCloseEvent)
canClose: boolean | ((willClose: DialogCloseResolver) => boolean)

onConflict: DialogConflictPolicy | ((conflict: DialogConflictResolver) => DialogConflictPolicy | undefined)
```

## Custom dialogs

When `type` is omitted it defaults to `"custom"`. Custom dialogs accept any `actions`. With no `actions`, Dialogist shows a single Close button. `message` / `content` can be a string, JSX, or a component.

```tsx
const dialog = useDialog("edit-item");

dialog.open({
  type: "custom",
  title: "Edit item",
  message: <ItemEditor />,
  actions: [
    { id: "cancel", title: "Cancel", resolveValue: false },
    { id: "save", title: "Save", resolveValue: true },
  ],
});
```

## What `useDialog` returns

```ts
const dialog = useDialog(key?, initialConfig?, deps?);
```

| Member | Role |
| ------ | ---- |
| `open` | Open (or same-key update). Returns `Promise<DialogCloseEvent>` |
| `isOpen` | Whether this key is currently open |
| `toggle` / `close` / `closeAll` | Visibility |
| `replace` / `next` / `back` | Replace the active row; composite-key step navigation |
| `on` / `off` / `emit` | Typed events (`willClose`, `didClose`, `closePrevented`, plus custom names) |
| `setTitle` / `setContent` / `setStatusBar` / `setFooter` / `setProps` | Imperative slot writes |
| `setImperativeHandle` | Attach a parent ref to child-exposed state |

`key` may be a string or an array (`["checkout", userId]`), which normalizes to a `::`-joined string. See [Orchestration](./orchestration.md).
