# Dialog orchestration

Multi-step flows, overlapping `open()` calls, handlers owned by a different component than the opener, and virtualized lists that share a dialog.

Interactive walkthrough: [Dialog orchestration](https://brandonscript.github.io/dialogist/dialog-orchestration).

## Dialog keys

A key is a string or an array of segments. Arrays join with `::`:

```tsx
useDialog("checkout");
useDialog(["checkout", userId, "shipping"]); // "checkout::userId::shipping"
```

`replaceSameRoot` treats keys that share the first segment as related. `next` / `back` on `useDialog` navigate composite-key steps.

## Multi-step flows (`useDialogFlow`)

`useDialogFlow` returns `{ start }`. Each step is a dialog config; Dialogist builds Cancel / Back / Next / Finish from `defaults` and `next`.

```tsx
const { start } = useDialogFlow(["multi-step-flow"], {
  defaults: {
    cancel: { show: "always", label: "Cancel" },
  },
  steps: {
    "step-1": {
      title: "Step 1",
      message: "Welcome to the flow.",
      next: "step-2",
    },
    "step-2": {
      title: "Step 2",
      message: "Choose your path.",
      next: ["step-3a", "step-3b"],
    },
    "step-3a": {
      title: "Step 3 (one)",
      message: "You chose the first path.",
      nextLabel: "Path one",
    },
    "step-3b": {
      title: "Step 3 (two)",
      message: "You chose the second path.",
      nextLabel: "Path two",
    },
  },
});

const StartFlowButton = () => (
  <button type="button" onClick={() => start("step-1")}>
    Start flow
  </button>
);
```

`next` can be a step name, an array of targets (one button each), or an object with `step`, `label`, and `canProceed`.

`resolveStep` overrides routing when a step closes:

```tsx
review: {
  title: "Review and confirm",
  content: <CheckoutReview />,
  resolveStep: ({ reason, dialogState }) => {
    // return a step name, "start", "back", "end", or undefined (default next / finish)
    if (reason === "end" && dialogState?.requiresApproval) {
      return "approval";
    }
  },
}
```

Lifecycle: `onStep` (defaults), plus per-step `onEnd`, `onCancel`, `onBack`. State from `useDialogImperativeHandle` is passed into `canProceed` as `dialogState`.

Update only the active step by targeting the composite key:

```tsx
useDialogSlots(["multi-step-flow", "step-1"], {
  content: [() => <Step1Content title={title} message={message} />, [title, message]],
});

useDialogSlots(["multi-step-flow", "step-2"], {
  content: [() => <Step2Content title={title} message={message} />, [title, message]],
});
```

## Open conflicts (`onConflict`)

Only **one** dialog is active. A second `open()` is a conflict. Policy is taken from the **active** dialog first, then `DialogProvider` / `defaultOptions` if the active row omitted `onConflict`. The incoming `open()`’s `onConflict` does **not** override that. Default: `"block"`.

| Policy | Effect |
| ------ | ------ |
| `block` | Incoming `open()` does not replace the active dialog |
| `replaceSameKey` | Replace when the keys match |
| `replaceSameRoot` | Replace when keys share a root segment |
| `replaceAny` | Incoming open replaces whatever is active |

`throwOnConflict` is read only when the open would block: `true` rejects the promise; `false` / unset resolves with `{ blocked: true, cancelled: false }`. If both sides set it, the **active** dialog wins.

```tsx
const dialogPrimary = useDialog("primary");
const dialogChild = useDialog(["primary", "child"]);
const dialogOther = useDialog(["other"]);

dialogPrimary.open({ type: "alert", message: "Hello" });

const result = await dialogPrimary.open({ type: "alert", message: "Hello" });
if (result.blocked) {
  // blocked by policy
}

dialogPrimary
  .open({
    type: "alert",
    message: "Hello",
    throwOnConflict: true,
    onConflict: "replaceSameRoot",
  })
  .catch(console.error);

dialogChild.open({
  type: "alert",
  message: "Hello, again",
  onConflict: "replaceSameKey",
});

dialogOther.open({
  type: "alert",
  message: "Hello, another",
  onConflict: (conflict: DialogConflictResolver) => {
    const { attemptedDialogKey, activeDialogKey, activePolicy, keyRelation, decision } = conflict;
    if (conflict.activeDialogKey?.includes("checkout")) {
      return "block";
    }
    return "replaceAny";
  },
});
```

A function may return a policy or `undefined`. `undefined` uses `conflict.activePolicy` for that layer (no fall-through to the provider if the active row supplied only the function).

`DialogConflictResolver` includes `attemptedDialogKey`, `activeDialogKey`, `keyRelation` (`sameKey` | `sameRoot` | `unrelated`), `activePolicy`, and `decision` (`replace` | `block`).

You can also set `onConflict` / `throwOnConflict` on `DialogProvider`.

## Syncing handlers across components

`useDialog` keeps `canClose` / `onClose` / click handlers in sync when that hook instance is the opener. If another component calls `openDialog` from `useDialogActionsContext`, register handlers with `useDialogHandlers` and pass `ownerToken` into the open:

```tsx
const DIALOG_KEY = "save-reminder";

const HandleUnsavedChangesForm = () => {
  const [isSaved, setIsSaved] = useState(false);

  const { ownerToken } = useDialogHandlers(DIALOG_KEY, {
    canClose: () => isSaved,
    onClose: (event) => {
      console.log("closed", event.reason);
    },
  });

  return <SaveButton ownerToken={ownerToken} onSave={() => setIsSaved(true)} />;
};

const SaveButton = ({ ownerToken, onSave }: { ownerToken: symbol; onSave: () => void }) => {
  const { openDialog } = useDialogActionsContext();

  return (
    <button
      type="button"
      onClick={() => {
        void openDialog({
          dialogKey: DIALOG_KEY,
          type: "confirm",
          title: "Unsaved changes",
          message: "Save before leaving?",
          onConflict: "replaceSameKey",
          ownerToken,
        });
      }}
    >
      Open dialog
    </button>
  );
};
```

## List virtualization

**One shared dialog** for every row — replace on the same key:

```tsx
const dialog = useDialog("item-dialog");

const handleOpen = (row: RowData) => {
  dialog.open({
    type: "alert",
    title: `Row ${row.id}`,
    message: <RowDetail row={row} />,
    onConflict: "replaceSameKey",
  });
};
```

**Per-row keys** under one root — each row calls `useDialog(["item-dialog", row.id])` with `onConflict: "replaceSameRoot"` so opening another row replaces the open one without needing a shared controller.
