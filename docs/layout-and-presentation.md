# Layout and presentation

Control alignment, extra chrome (status bar / footer), and which React components render each slot.

Interactive walkthrough: [Layout and presentation](https://brandonscript.github.io/dialogist/layout-and-presentation).

## Content style

```tsx
dialog.open({
  contentStyle: {
    align: "space-between",
    textAlign: "left",
    maxWidth: 400,
    minHeight: 180,
  },
});
```

`contentStyle.align` is flex alignment of the body; `textAlign` is text alignment inside it. You can also set `minWidth` / `maxWidth` / `minHeight` / `maxHeight`.

Paper-level size lives on the config itself: `width`, `minWidth`, `maxWidth`, `borderRadius`, `overflow`, `className`.

## Actions style

```tsx
dialog.open({
  actions: [
    { id: "cancel", title: "Cancel" },
    { id: "ok", title: "Save" },
  ],
  actionsStyle: { align: "space-between", gap: 1 },
});
```

`align` values follow flex justification (`start`, `center`, `end`, `space-between`, …). `gap` is between groups; `intraGroupGap` is inside a group. See [Action groups](./actions-and-results.md).

## App-wide defaults

Set `defaultOptions` on `DialogProvider` so every dialog inherits layout (and other config) unless an `open()` overrides it:

```tsx
const App = () => (
  <DialogProvider
    defaultOptions={{
      contentStyle: { textAlign: "center", maxWidth: 400 },
      actionsStyle: { align: "end" },
    }}
  >
    {children}
  </DialogProvider>
);
```

## Status bar and footer

Optional slots above the body (`statusBar`) and below the actions (`footer`). Strings or JSX both work.

```tsx
dialog.open({
  type: "confirm",
  message: "Are you sure?",
  statusBar: "Saving changes…",
  footer: "Last saved at 12:34 PM",
});
```

These slots update independently via [slot hooks](./updating-content.md).

## Custom components in slots

```tsx
const message = (
  <p>
    You can use <strong>HTML</strong> or <strong>React</strong> components in the body.
  </p>
);
const statusBar = <StatusBar isLoading={isLoading} />;
const footer = <Footer lastSavedAt={lastSavedAt} />;

dialog.open({
  type: "confirm",
  message,
  statusBar,
  footer,
});
```

Content passed to a single `open()` call is a snapshot. For live updates, register [reactive slots](./updating-content.md) instead of re-opening.

## Replacing slot components

Follow the MUI slots / `slotProps` pattern on `DialogProvider` (or per dialog via adapter slots):

```tsx
<DialogProvider
  slots={{ Title: MyCustomTitle }}
  slotProps={{ title: { className: "custom-class" } }}
>
  {children}
</DialogProvider>
```

Use `dialogistClasses` when you need to target Dialogist’s class names from custom slot components. Theme tokens are CSS variables (`--dialogist-*`); see [Adapters](./adapters.md) for `cssMode` and MUI theme mapping.
