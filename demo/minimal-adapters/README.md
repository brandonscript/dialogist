# Dialogist minimal adapters

A ~80-line Vite app proving Dialogist's adapters work standalone. Use it as a copy-paste reference for setting up Dialogist with each supported UI library.

## Run

```bash
cd demo/minimal-adapters
npm install
npm run dev
```

Then open http://localhost:5610 and use the picker to swap between:

- **Headless** — pure DOM defaults (no peer libraries needed beyond React)
- **MUI** — `@mui/material` Dialog parts
- **Base UI** — `@base-ui-components/react` parts
- **shadcn** — Base UI primitives + shadcn class conventions
- **Tailwind** — Headless DOM + Tailwind utility classes

## Why this exists

The full demo (`demo/nextjs/`) is a feature-rich showcase with custom theming, sandbox containers, and dozens of example cards. This app is intentionally minimal — its job is to demonstrate that each adapter functions correctly on its own with the smallest possible setup, and to serve as a starting template for new projects.

## Setup snippets

### MUI

```tsx
import "dialogist/styles.css";
import { DialogProvider } from "dialogist";
import { muiSlots, dialogistExtendMuiTheme } from "dialogist/mui";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const theme = createTheme(dialogistExtendMuiTheme(/* base options */));

<ThemeProvider theme={theme}>
  <DialogProvider slots={muiSlots}>...</DialogProvider>
</ThemeProvider>
```

### Base UI

```tsx
import "dialogist/styles.css";
import { DialogProvider } from "dialogist";
import { baseUiSlots } from "dialogist/base-ui";

<DialogProvider slots={baseUiSlots}>...</DialogProvider>
```

### shadcn (Base UI + class conventions)

Requires `tailwindcss` + `tailwindcss-animate` for enter/exit animations.

```tsx
import "dialogist/styles.css";
import { DialogProvider } from "dialogist";
import { shadcnSlots } from "dialogist/shadcn";

<DialogProvider slots={shadcnSlots}>...</DialogProvider>
```

### Tailwind (DOM + utilities)

```tsx
import "dialogist/styles.css";
import { DialogProvider } from "dialogist";
import { tailwindSlots } from "dialogist/tailwind";

<DialogProvider slots={tailwindSlots} cssMode="external">...</DialogProvider>
```

For Tailwind v3, add the preset to your `tailwind.config.cjs`:

```js
module.exports = { presets: [require("dialogist/tailwind/preset.cjs")] };
```

For Tailwind v4, copy `dialogist/tailwind/theme.css` into your global stylesheet under `@theme`.
