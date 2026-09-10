# Actions and results

Buttons are driven by the `actions` array. Alert and confirm still accept `okLabel` / `cancelLabel`; custom dialogs use `actions` for anything else.

Interactive walkthrough: [Actions and results](https://brandonscript.github.io/dialogist/actions-and-results).

## Built-in labels

```tsx
dialog.open({
  type: "confirm",
  okLabel: "Approve",
  cancelLabel: "Not now",
});
```

Alert uses a single OK button (`okLabel`). Confirm uses Cancel + Confirm. Those types restrict explicit `actions` to the built-in ids (`ok` for alert; `cancel` and `ok` for confirm).

## Custom actions

Omitting `type` (or setting `"custom"`) allows any action ids. Each action can set `id`, `title` / `children`, `props`, `resolveValue`, and `preserveBackdrop`.

```tsx
const dialog = useDialog("save-dialog");

dialog.open({
  actions: [
    { id: "cancel", title: "Cancel", resolveValue: false },
    { id: "draft", title: "Save as draft", resolveValue: { draft: true } },
    { id: "ok", title: "Save", resolveValue: { save: true } },
  ],
  actionsStyle: { align: "space-between", gap: 1 },
});
```

`resolveValue` is what `open()` resolves with on that button (`event.resolveValue`).

## Action groups

Nest arrays to group buttons visually. A nested array is one group; a lone action is its own group.

```tsx
dialog.open({
  actions: [
    [
      { id: "cancel", title: "Cancel", resolveValue: false },
      { id: "draft", title: "Save as draft", resolveValue: { draft: true } },
    ],
    { id: "save", title: "Save", resolveValue: { save: true } },
  ],
  actionsStyle: { align: "space-between", gap: 1 },
});
```

`actionsStyle.intraGroupGap` controls spacing inside a group; `gap` is between groups.

## Action events

Callbacks fire when a button is clicked. They are optional; awaiting `open()` is equivalent for most flows.

```tsx
dialog.open({
  type: "confirm",
  onOkClick: () => {
    // user confirmed
  },
  onCancelClick: () => {
    // user cancelled
  },
});
```

```tsx
const event = await dialog.open({ type: "confirm" });

if (event.ok) {
  // user confirmed
} else if (event.blocked) {
  // a conflicting open() was blocked by conflict policy (not a button dismiss)
} else {
  // user cancelled (Cancel, backdrop, or Escape)
}
```

## DialogActionEvent payload

`onOkClick` / `onCancelClick` receive a `DialogActionEvent` (a `DialogCloseEvent` with `reason: "action"`):

```tsx
onOkClick: (event: DialogActionEvent) => {
  const { dialogKey, action, actionId, buttonText } = event;
  console.log({ dialogKey, action, actionId, buttonText });
};

onCancelClick: (event: DialogActionEvent) => {
  // handle cancel
};
```

When awaiting `open()`, narrow on `reason` before reading action fields:

```tsx
const event = await dialog.open({ type: "confirm" });

if (event.reason === "action") {
  const { dialogKey, action, actionId, buttonText } = event;
  console.log({ dialogKey, action, actionId, buttonText });
}
```

| Field | Meaning |
| ----- | ------- |
| `dialogKey` | Normalized key of the dialog |
| `action` | `"okClicked"` / `"cancelClicked"` / `` `${id}Clicked` `` |
| `actionId` | `"ok"` / `"cancel"` / custom id |
| `buttonText` | Visible label |
| `resolveValue` | From the action definition |
| `nativeEvent` | The click / keyboard event |
