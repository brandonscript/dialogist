# State and data flow

Keep dialog UI in sync with React state, external stores, and high-frequency updates without tearing down the open dialog.

Interactive walkthrough: [Dialog state and data flow](https://brandonscript.github.io/dialogist/dialog-state-and-data-flow).

## Exposing state from inside the dialog

`useDialogImperativeHandle` lets dialog content publish a snapshot to the parent. The parent attaches a ref with `setImperativeHandle` and reads it with `useDialogImperativeValue`.

```tsx
const DIALOG_KEY = "feedback-dialog";

const DialogContent = () => {
  useDialogImperativeHandle<FeedbackDialogState>(
    DIALOG_KEY,
    () => ({ isValid, errorText, charCount, value }),
    [isValid, errorText],
  );
  return <>{/* dialog content */}</>;
};

const ParentComponent = () => {
  const dialog = useDialog(DIALOG_KEY);
  const ref = useRef<FeedbackDialogState>(null);
  dialog.setImperativeHandle(ref);

  const { isValid, errorText } = useDialogImperativeValue<FeedbackDialogState | null>(DIALOG_KEY) ?? {};

  useEffect(() => {
    if (errorText) {
      console.error("Validation error:", errorText);
    } else if (isValid) {
      console.log("Validation passed");
    }
  }, [isValid, errorText]);

  return (
    <button
      onClick={() =>
        dialog.open({
          type: "confirm",
          title: "Enter a value",
          content: <DialogContent />,
        })
      }
    >
      Provide feedback
    </button>
  );
};
```

The factory re-runs when its dependency array changes (same idea as `useEffect`).

## Two-way sync with an external store

`useDialogExternalSync` keeps a local working copy while the user edits, then reconciles with an external value (`debounceMs` / `throttleMs`).

```tsx
const DialogContent = ({ note, setNote }: { note: string; setNote: (n: string) => void }) => {
  const { value: localNote, setValue: setLocalNote } = useDialogExternalSync({
    externalValue: note,
    setExternalValue: setNote,
    debounceMs: 200,
    throttleMs: 1000,
  });

  return (
    <textarea
      value={localNote}
      onChange={(e) => setLocalNote(e.target.value)}
    />
  );
};

const ParentComponent = () => {
  const [note, setNote] = useState("Hello");
  const dialog = useDialog(DIALOG_KEY);

  useDialogSlots(DIALOG_KEY, {
    title: ["Edit note", []],
    content: [() => <DialogContent note={note} setNote={setNote} />, [note, setNote]],
  });

  return (
    <>
      <p>External (committed): {note}</p>
      <button type="button" onClick={() => dialog.open()}>
        Edit note
      </button>
    </>
  );
};
```

While the user is typing, local changes win. External updates are queued and applied after the idle delay.

## High-frequency updates

Combine external sync with `setDialogStateValue` / `useDialogStateValue` and `dialog.emit` / `dialog.on` for live UI (sliders, live previews). `liveThrottleMs` on the dialog config throttles live bridge / props pushes.

```tsx
const DialogContent = ({ borderRadius, setBorderRadius }) => {
  const dialog = useDialog(DIALOG_KEY);
  const { value: localRadius, setValue: setLocalRadius } = useDialogExternalSync({
    externalValue: borderRadius,
    setExternalValue: setBorderRadius,
    throttleMs: 500,
  });

  useEffect(() => {
    setDialogStateValue(DIALOG_KEY, "borderRadiusLocal", localRadius);
  }, [localRadius]);

  return (
    <input
      type="range"
      value={localRadius}
      onChange={(e) => {
        const n = Number(e.target.value);
        setLocalRadius(n);
        dialog.emit("borderRadius", n);
      }}
    />
  );
};

const ParentComponent = () => {
  const [borderRadius, setBorderRadius] = useState(12);
  const [innerDialogValue] = useDialogStateValue(DIALOG_KEY, "borderRadiusLocal", borderRadius);
  const dialog = useDialog(DIALOG_KEY);

  useEffect(() => {
    const unsubscribe = dialog.on("borderRadius", (value: number) => {
      console.log("Internal border radius:", value);
    });
    return unsubscribe;
  }, [dialog]);

  return (
    <button type="button" onClick={() => dialog.open()}>
      Open
    </button>
  );
};
```

Custom event names are typed via declaration merging on `DialogistEventMap`.

## Debouncing in the dialog content

You can also debounce inside the content component (for example `use-debounce`) and push to the parent:

```tsx
const DialogContent = ({ onChange }: { onChange: (v: string) => void }) => {
  const [value, setValue] = useState("");
  const [debouncedValue, { flush }] = useDebounce(value, 400);

  useEffect(() => {
    onChange(debouncedValue);
    return () => {
      flush();
    };
  }, [debouncedValue, flush, onChange]);

  return <input value={value} onChange={(e) => setValue(e.target.value)} />;
};

const ParentComponent = () => {
  const [textFieldValue, setTextFieldValue] = useState("");
  const dialog = useDialog("debounced-text-dialog", {
    content: <DialogContent onChange={setTextFieldValue} />,
  });

  return <button onClick={() => dialog.open()}>Open</button>;
};
```

## Streaming / polling inside content

Prefer a self-contained `type: "custom"` component that owns its own effects. Dialogist injects `onClose` into `message` / `content` components. Clean up intervals and sockets on unmount.

```tsx
const PollingContent = ({ onClose, seedData = [] }) => {
  const [data, setData] = useState(seedData);
  const [isPolling, setIsPolling] = useState(true);

  useEffect(() => {
    if (!isPolling) return;
    const interval = setInterval(async () => {
      setData((prev) => [await fetchLatestData(), ...prev.slice(0, 9)]);
    }, 2000);
    return () => clearInterval(interval);
  }, [isPolling]);

  return (
    <>
      {/* render rows */}
      <button onClick={() => onClose?.()}>Close</button>
    </>
  );
};

dialog.open({
  type: "custom",
  title: "Live updates",
  message: PollingContent,
});
```

Store helpers: `useDialogStateValue`, `setDialogStateValue`, `setDialogStateValueFromDialog`, `setDialogStateValueFromExternal`, `clearDialogStateValue`, `getDialogStateValue`.
