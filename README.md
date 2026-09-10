<h1 align="center">
  <img src="assets/readme/logo.png" width="72" height="72" alt="Dialogist logo" align="absmiddle" />
  &nbsp;dialogist
</h1>

<p align="center"><strong>Centralized, promise-based dialogs for React.</strong></p>

<p align="center">
  <a href="https://www.npmjs.com/package/dialogist" target="_blank" rel="noopener noreferrer">npm</a>
    ·
  <a href="https://brandonscript.github.io/dialogist/" target="_blank" rel="noopener noreferrer">Documentation</a>
    ·
  <a href="https://github.com/brandonscript/dialogist" target="_blank" rel="noopener noreferrer">GitHub</a>
    ·
  <a href="https://github.com/brandonscript/dialogist/issues" target="_blank" rel="noopener noreferrer">Issues</a>
    ·
  <a href="./LICENSE" target="_blank" rel="noopener noreferrer">License</a>
</p>

## What is Dialogist?

Dialogist is a **centralized dialog manager** for React apps: one provider, hooks from anywhere, no prop drilling. It's built with a style/component-agnostic core, ships first-class adapters for several popular UI libraries, and uses slot-based updates so titles, content, actions, and the dialog backplane can refresh independently without re-rendering the entire component tree.

### Choose your UI library

The same dialog logic can render through whichever UI library you're already using. Pick one — or none, and use the headless DOM defaults — and `import` its adapter under a subpath:

| Adapter        | Import                                               | Peer dependencies                                              |
| -------------- | ---------------------------------------------------- | -------------------------------------------------------------- |
| Headless DOM   | _(default — no import needed)_                       | None beyond `react`/`react-dom`                                |
| MUI            | `import { muiSlots } from "dialogist/mui"`           | `@mui/material` ^7 or ^9, `@emotion/react`, `@emotion/styled`  |
| Base UI        | `import { baseUiSlots } from "dialogist/base-ui"`    | `@base-ui-components/react` ^1.0.0-rc.0                        |
| shadcn         | `import { shadcnSlots } from "dialogist/shadcn"`     | `@base-ui-components/react`, `tailwindcss` + `tailwindcss-animate` |
| Tailwind       | `import { tailwindSlots } from "dialogist/tailwind"` | `tailwindcss` (with the included preset)                       |

All peer dependencies are **optional** — you only install the libraries for the adapter(s) you actually use. See the [Adapters guide](./docs/adapters.md) for setup snippets and migration notes per adapter.

## Screenshots

<img src="assets/readme/getting-started-alert.png" alt="Alert dialog example from the Dialogist demo" />

<img src="assets/readme/getting-started-confirm.png" alt="Confirmation dialog example from the Dialogist demo" />

## Features

- One `DialogProvider`, dialogs opened from any component
- Promise-based `open()` for async flows
- Slot registry and hooks for state-reactive re-rendering
- Dialog keys to uniquely identify and track dialog instances
- Conflict policies to handle overlapping opens
- TypeScript-first API

## Install

```bash
npm install dialogist
```

**Package version:** 1.1.0

Required peer dependencies: `react` `>=18.0.0` and `react-dom` `>=18.0.0`.

All UI-library peers (`@mui/material`, `@emotion/react`, `@emotion/styled`, `@base-ui-components/react`, `tailwindcss`) are **optional** — install only the ones for the adapter you choose. See [Adapters](./docs/adapters.md) for per-adapter setup.

## Quick start

```tsx
import { DialogProvider, useDialog } from "dialogist";

function App() {
  return (
    <DialogProvider>
      <MyComponent />
    </DialogProvider>
  );
}

function MyComponent() {
  const dialog = useDialog("delete-item");

  const handleDelete = async () => {
    const event = await dialog.open({
      type: "confirm",
      title: "Delete item",
      message: "This action cannot be undone.",
      okLabel: "Delete",
      cancelLabel: "Cancel",
    });

    if (event.ok) {
      // Confirmed
    }
  };

  return <button onClick={handleDelete}>Delete item</button>;
}
```

## Documentation

- Interactive examples: <a href="https://brandonscript.github.io/dialogist/" target="_blank" rel="noopener noreferrer">https://brandonscript.github.io/dialogist/</a>
- API guide: <a href="./docs/index.md" target="_blank" rel="noopener noreferrer"><code>docs/</code></a> (getting started, adapters, actions, slots, conflicts, flows)

## License

<a href="./LICENSE" target="_blank" rel="noopener noreferrer">MIT</a>

## Ethical use

Per the <a href="https://firstdonoharm.dev/" target="_blank" rel="noopener noreferrer">Hippocratic License 3.0</a>, you may not use, copy, modify, or employ this project's source code to cause harm or in any way violate internationally recognized human rights.
