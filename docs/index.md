# Dialogist documentation

Interactive examples: [https://brandonscript.github.io/dialogist/](https://brandonscript.github.io/dialogist/).

## Guides

| Guide | Covers |
| ----- | ------ |
| [Getting started](./getting-started.md) | `DialogProvider`, `useDialog`, `open()`, alert / confirm / custom |
| [API cheat sheet](./api.md) | `DialogConfig`, `DialogCloseEvent`, `useDialog` return, events |
| [Adapters](./adapters.md) | Headless, MUI, Base UI, shadcn, Tailwind, `cssMode` |
| [Actions and results](./actions-and-results.md) | Built-in labels, custom `actions`, groups, `DialogActionEvent` |
| [Closing dialogs](./closing-dialogs.md) | Close reasons, `close` / `replace`, `canClose` |
| [Layout and presentation](./layout-and-presentation.md) | `contentStyle`, `actionsStyle`, status bar, footer, slots |
| [Updating content](./updating-content.md) | Slot hooks, imperative setters, `replaceSameKey` |
| [State and data flow](./state-and-data-flow.md) | Imperative handles, `useDialogExternalSync`, events |
| [Data providers](./data-providers.md) | Context, React Query, Jotai, RTK, Zustand |
| [Orchestration](./orchestration.md) | `useDialogFlow`, `onConflict`, handlers, array keys |

## Current API

- Open with `dialog.open({ type: "alert" | "confirm" | "custom", ... })`.
- `open()` returns `Promise<DialogCloseEvent>`.
- Import UI adapters from subpaths: `dialogist/mui`, `dialogist/base-ui`, `dialogist/shadcn`, `dialogist/tailwind`.
- Field lists: [API cheat sheet](./api.md).
