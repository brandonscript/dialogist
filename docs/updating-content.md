# Updating dialog content

Dialog content is split into slots (title, content, actions, statusBar, footer, props). Each slot can update without re-rendering the others.

Interactive walkthrough: [Updating dialog content](https://brandonscript.github.io/dialogist/updating-dialog-content).

## Reactive slot hooks

Register a render function and a dependency array (like `useEffect`). When a dependency changes, that slot re-renders.

```tsx
const DIALOG_KEY = "reactive-slots-demo";
const [isLoading, setIsLoading] = useState(false);
const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

const dialog = useDialog(DIALOG_KEY);

dialog.open({
  type: "confirm",
  message: "Processing your request.",
});

useDialogContent(DIALOG_KEY, () => <Body text={dialogMessage} />, [dialogMessage]);
useDialogStatusBar(DIALOG_KEY, () => <StatusBar isLoading={isLoading} />, [isLoading]);
useDialogFooter(DIALOG_KEY, () => <Footer lastSavedAt={lastSavedAt} />, [lastSavedAt]);
```

Or register several slots together. Each entry is `[value, deps]`:

```tsx
useDialogSlots(DIALOG_KEY, {
  content: [() => <Body text={dialogMessage} />, [dialogMessage]],
  statusBar: [() => <StatusBar isLoading={isLoading} />, [isLoading]],
  footer: [() => <Footer lastSavedAt={lastSavedAt} />, [lastSavedAt]],
});
```

Named hooks: `useDialogTitle`, `useDialogContent`, `useDialogActions`, `useDialogStatusBar`, `useDialogFooter`, `useDialogProps`. `useDialogProps` merges config fields (size, overflow, …), not DOM props.

Registered slots merge with the config when the dialog opens.

## Imperative setters

Push updates without re-calling `open()`. Useful when you already have a `useDialog` instance and want explicit control over which state each slot observes.

```tsx
const dialog = useDialog(DIALOG_KEY);

dialog.open({
  type: "confirm",
  statusBar: <StatusBar isLoading={true} />,
  footer: <Footer lastSavedAt={null} />,
});

useEffect(() => {
  dialog.setTitle(isLoading ? "Loading…" : "Save your work?");
  dialog.setContent(<Body text={dialogMessage} />);
}, [isLoading, dialogMessage]);

useEffect(() => {
  dialog.setStatusBar(<StatusBar isLoading={isLoading} />);
}, [isLoading]);

useEffect(() => {
  dialog.setFooter(<Footer lastSavedAt={lastSavedAt} />);
}, [lastSavedAt]);
```

Setters: `setTitle`, `setContent`, `setStatusBar`, `setFooter`, `setProps`.

## Replacing an open dialog

If another `open()` for the same key should refresh the visible dialog, set `onConflict: "replaceSameKey"` on the **active** dialog (or on `DialogProvider`). The incoming call’s `onConflict` does not choose the policy. See [Orchestration](./orchestration.md).

```tsx
const EditEntityDialogButton = ({ entityId }: { entityId: string }) => {
  const { open } = useDialog("edit-entity-dialog");

  const handleClick = () => {
    open({
      type: "confirm",
      title: `Edit entity ${entityId}`,
      message: <EntityEditor entityId={entityId} />,
      statusBar: <StatusBar entityId={entityId} />,
      footer: <Footer entityId={entityId} />,
      onConflict: "replaceSameKey",
    });
  };

  return <button onClick={handleClick}>Edit</button>;
};
```

## Why slots exist

Put ticking or high-frequency UI in its own component (or its own slot). A title that updates every second does not need to re-render a large form body:

```tsx
const DialogTitleTicker = memo(function DialogTitleTicker() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(intervalId);
  }, []);

  return seconds === 0 ? "Add a comment" : `Add a comment (${seconds}s elapsed)`;
});

useDialogSlots("comment-dialog", {
  title: [() => <DialogTitleTicker />, []],
  content: [() => <CommentForm />, []],
});
```
