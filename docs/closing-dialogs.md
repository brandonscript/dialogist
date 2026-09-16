# Closing dialogs

A dialog can close from an action click, Escape, backdrop click, `dialog.close()`, or `dialog.replace()`. Every path produces a `DialogCloseEvent`. Field list: [API cheat sheet](./api.md#dialogcloseevent).

Interactive walkthrough: [Closing dialogs](https://brandonscript.github.io/dialogist/closing-dialogs).

## Ways to close

Handle all of them with `onClose`, or by awaiting `open()`:

```tsx
const handleClose = (event: DialogCloseEvent) => {
  switch (event.reason) {
    case "action":
      console.log("Closed by action button");
      break;
    case "escape":
      console.log("Closed by Escape");
      break;
    case "backdrop":
      console.log("Closed by backdrop click");
      break;
    case "programmatic":
      console.log("Closed by dialog.close()");
      break;
    case "replace":
      console.log("Superseded by another open()");
      break;
  }
};

dialog.open({ type: "alert", message: "Processing…" }, { onClose: handleClose });

const event = await dialog.open({ type: "alert", message: "Processing…" });
handleClose(event);
```

### `dialog.close()`

Close from outside the dialog (for example when a job finishes):

```tsx
const { open, close, isOpen } = useDialog("processing-dialog");

useEffect(() => {
  if (isProcessing && !isOpen) {
    open({ type: "alert", message: "Processing…" });
  } else if (!isProcessing && isOpen) {
    close();
  }
}, [isProcessing, open, close, isOpen]);
```

### `dialog.replace()`

Swap the open dialog in place (same key) without dropping the backdrop:

```tsx
const { open, replace } = useDialog("processing-dialog");

useEffect(() => {
  if (isProcessing) {
    open({ type: "alert", message: "Processing…" });
  } else {
    replace({
      type: "confirm",
      message: "Done processing. Do you want to see the results?",
    });
  }
}, [isProcessing, open, replace]);
```

`preserveBackdrop` on an action (or `preserveBackdropOnOk` / `preserveBackdropOnCancel` on confirm) keeps the backdrop during a transition into the next dialog.

## DialogCloseEvent payload

```tsx
const isAction = (event: DialogCloseEvent): event is DialogActionEvent =>
  event.reason === "action";

dialog.open({
  type: "confirm",
  title: "Close handling demo",
  message: "Try Escape, backdrop click, or buttons.",
  onClose: (event: DialogCloseEvent) => {
    console.log(event.reason);
    if (isAction(event)) {
      // action, actionId, buttonText are present
    }
  },
});
```

| Field | Meaning |
| ----- | ------- |
| `ok` | Confirmed |
| `cancelled` | User dismiss (not used for conflict-blocked opens) |
| `blocked` | `open()` settled without opening because policy blocked it |
| `reason` | `"action"` \| `"backdrop"` \| `"escape"` \| `"programmatic"` \| `"replace"` |
| `resolveValue` | From the clicked action, when `reason === "action"` |

Built-in events: `willClose`, `didClose`, `close`, `okClick`, `cancel`, `closePrevented`. Subscribe with `dialog.on(...)`.

## Preventing close

`canClose` is a boolean or a function. When it returns `false`, the close is ignored and `closePrevented` fires.

```tsx
const [allowClose, setAllowClose] = useState(false);
const dialog = useDialog("my-dialog", {
  type: "confirm",
  canClose: () => allowClose,
});

dialog.open({ title: "Save?", message: "Unsaved changes remain." });

dialog.on("closePrevented", ({ reason }) => {
  // reason is "backdrop" | "escape" | "action"
});
```

Use this for unsaved-changes guards. Pair with [useDialogHandlers](./orchestration.md) when the component that owns `canClose` is not the one calling `open()`.
