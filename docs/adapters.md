# Dialogist adapters

Dialogist's core (state machine, slot registry, hooks, conflict policies, FLIP animations, CSS variables) is **UI-library agnostic**. Each supported UI library is a thin "adapter" that maps Dialogist's slot interface onto that library's components.

This doc covers what ships, how to pick one, and how to migrate between them.

## What ships

| Adapter        | Subpath import           | Default `Base` slot                                      | Notes                                              |
| -------------- | ------------------------ | -------------------------------------------------------- | -------------------------------------------------- |
| Headless DOM   | _none_ (built-in)        | `HeadlessBase` (`<div role="dialog">` + portal + focus trap) | Zero peer deps beyond React.                       |
| MUI            | `dialogist/mui`          | MUI `<Dialog>` styled with `dialogistStyles`             | The original / canonical adapter.                  |
| Base UI        | `dialogist/base-ui`      | `Dialog.Root` + `Dialog.Portal` + `Dialog.Popup`         | Headless primitives from MUI's Base UI.            |
| shadcn         | `dialogist/shadcn`       | Base UI primitives + shadcn class conventions            | Drop-in for shadcn-style apps; no Radix needed.    |
| Tailwind       | `dialogist/tailwind`     | `HeadlessBase` + Tailwind utility classes                | DOM-only; works alongside any Tailwind config.     |

You can also mix and match — `slots` is a per-component object, so e.g. `{ ...muiSlots, Title: MyCustomTitle }` is a valid configuration.

## Headless DOM (default)

Use this when you want zero UI-library peers, or when you're going to fully customize each slot yourself.

```tsx
import "dialogist/styles.css";
import { DialogProvider } from "dialogist";

export const App = () => (
  <DialogProvider cssMode="external">{/* ... */}</DialogProvider>
);
```

`HeadlessBase` provides:

- A focus-trapped, scroll-locked, portal-rendered modal
- Escape-to-close and backdrop-click-to-close
- Focus restoration on close
- Forwards `slotProps.paper.ref` for the FLIP resize animation

## MUI

```tsx
import "dialogist/styles.css";
import { DialogProvider } from "dialogist";
import { dialogistExtendMuiTheme, muiSlots, MuiDialogistAdapterProvider } from "dialogist/mui";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const theme = createTheme(dialogistExtendMuiTheme(/* your base ThemeOptions */));

export const App = () => (
  <ThemeProvider theme={theme}>
    {/* MuiDialogistAdapterProvider feeds MUI theme tokens (transitions, spacing) into Dialogist */}
    <MuiDialogistAdapterProvider>
      <DialogProvider slots={muiSlots}>{/* ... */}</DialogProvider>
    </MuiDialogistAdapterProvider>
  </ThemeProvider>
);
```

The MUI adapter:

- Uses `@mui/material/Dialog`, `DialogTitle`, `DialogContent`, `DialogActions`, `Button`, `Typography`
- Maps MUI theme tokens (`palette`, `typography`, transitions, `theme.spacing`) onto Dialogist CSS variables via `dialogistExtendMuiTheme`
- Honors all MUI sx/styled overrides on slot components

## Base UI

```tsx
import "dialogist/styles.css";
import { DialogProvider } from "dialogist";
import { baseUiSlots } from "dialogist/base-ui";

export const App = () => (
  <DialogProvider slots={baseUiSlots}>{/* ... */}</DialogProvider>
);
```

The Base UI adapter:

- Uses `@base-ui-components/react/dialog` parts (`Dialog.Root`, `Dialog.Portal`, `Dialog.Backdrop`, `Dialog.Popup`, `Dialog.Title`, `Dialog.Description`)
- Defers focus management, scroll-lock, and pointer dismissal to Base UI (so `disableAutoFocus`, `disableRestoreFocus`, `disableEnforceFocus` on `BaseDialogProps` map to Base UI's `modal` / `initialFocus` / `finalFocus` instead of our headless implementation)
- Reuses the framework-agnostic headless slots for `Actions`, `StatusBar`, `Footer` (no library wrapper needed for plain DOM elements)

## shadcn

```tsx
import "dialogist/styles.css";
import { DialogProvider } from "dialogist";
import { shadcnSlots } from "dialogist/shadcn";

export const App = () => (
  <DialogProvider slots={shadcnSlots}>{/* ... */}</DialogProvider>
);
```

The shadcn adapter is **Base UI primitives wrapped in shadcn's class conventions** — `data-[state=open]:animate-in`, `bg-background`, `tailwindcss-animate` keyframes, etc. It does **not** depend on Radix.

Requires:

- `@base-ui-components/react`
- A Tailwind setup with `tailwindcss-animate` (otherwise the animations are no-ops, but the dialog still functions and styles correctly)

### "Copy into your app" workflow

shadcn-style users often prefer to inline their UI components rather than import them from a library. Copy `dialogist/shadcn/template` (`src/adapters/shadcn/templates/dialog.tsx` in this repo) into your project's `src/components/ui/dialog.tsx` and customize freely:

```tsx
import { DialogProvider } from "dialogist";
import { Dialog, DialogTitle, DialogContent } from "@/components/ui/dialog";

<DialogProvider slots={{ Base: Dialog, Title: DialogTitle, Content: DialogContent }}>...</DialogProvider>
```

## Tailwind

```tsx
import "dialogist/styles.css";
import { DialogProvider } from "dialogist";
import { tailwindSlots } from "dialogist/tailwind";

export const App = () => (
  <DialogProvider slots={tailwindSlots} cssMode="external">{/* ... */}</DialogProvider>
);
```

The Tailwind adapter is pure DOM (using the headless `Base`) plus utility-class styling on every other slot.

### Tailwind v3

Add the preset to your `tailwind.config.cjs`:

```js
module.exports = {
  presets: [require("dialogist/tailwind/preset.cjs")],
  content: ["./src/**/*.{ts,tsx}"],
};
```

The preset aliases `bg-primary`, `text-foreground`, etc. onto the `--dialogist-*` CSS variables, so the same utility classes work in both your app and inside dialogs.

### Tailwind v4

Tailwind v4 uses `@theme` blocks instead of presets. Copy the snippet from [`src/adapters/tailwind/theme.css`](../src/adapters/tailwind/theme.css) into your global stylesheet:

```css
@import "tailwindcss";
@import "dialogist/styles.css";

@theme {
  --color-background: var(--dialogist-bg-paper);
  --color-foreground: var(--dialogist-text-primary);
  /* ...etc — see the full snippet in the file above */
}
```

## CSS modes

`<DialogProvider cssMode="...">` controls how the structural CSS (the `--dialogist-*` variables and the FLIP keyframes) gets onto the page:

- `"inject"` (default): Dialogist injects a single `<style>` tag in `<head>`. Refcounted across providers.
- `"external"`: Don't inject; you've imported `dialogist/styles.css` (or otherwise have it loaded). Recommended for Tailwind/shadcn/Base UI adapters since you'll usually want to control your own CSS pipeline.
- `"none"`: Don't inject and don't expect external loading. Useful in tests or when you've fully overridden every slot and don't need the variables.

## Migration notes

### From a pre-adapter Dialogist

If you used Dialogist before adapters existed, your setup looked like:

```tsx
import { DialogProvider, dialogistExtendMuiTheme } from "dialogist";
```

Migrate by:

1. Updating the theme import to the MUI subpath:
   ```diff
   - import { dialogistExtendMuiTheme } from "dialogist";
   + import { dialogistExtendMuiTheme } from "dialogist/mui";
   ```
2. (Optional) Pass `slots={muiSlots}` to `DialogProvider` if you want the MUI adapter explicitly. Without it, you get the headless DOM defaults — which look nothing like MUI.
3. (Optional) Wrap with `<MuiDialogistAdapterProvider>` so MUI's transition tokens drive Dialogist's FLIP animations. Otherwise Dialogist falls back to sensible (MUI-like) defaults.

### Switching between adapters

The state machine, dialog identifiers, conflict policies, slot registry hooks, and CSS variables are identical across adapters. To switch:

1. Change your `slots` prop on `DialogProvider`.
2. Install / uninstall the relevant peer dependencies.
3. Adjust your CSS pipeline (inject vs external).
4. Look for any custom slot components that hard-coded MUI internals (`sx`, `variant="contained"`, etc.) and adjust them for your new adapter's styling conventions.

The demo app's "Rendered with" picker swaps adapters at runtime — try it to see what stays the same and what changes.
