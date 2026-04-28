# Development Guidelines

> **⚠️ CRITICAL: These guidelines MUST be followed. Violating these rules will result in incorrect behavior and wasted time.**

## Project Overview

Dialogist is a centralized dialog manager for React applications, similar to Notistack but for dialogs. It provides a single package solution for managing all dialogs in your application with a promise-based API, style-agnostic core, and MUI integration.

**Current state:** Single package (future: multi-package architecture planned)

### MCP Servers / Agents

- **✅ ALWAYS use the mui-mcp agent for MUI documentation**

### Two Central Principles

**1. Application-Level Dialog Management**

- Dialogs are managed at the application level, not component level
- Single source of truth for all dialog state across the app
- Any component can open/close/update dialogs via hooks
- Promise-based API enables async workflows and sequential dialogs
- Eliminates prop drilling and local dialog state management

**2. Slot-Based Isolation for Performance**

- Dialog content is split into "slots" (title, content, actions, statusBar, footer, props)
- Each slot can update independently without re-rendering other parts
- Example: External state can enable/disable an action button without re-rendering dialog content
- Uses dependency tracking (like useEffect) or deep props comparison
- Prevents unnecessary re-renders and improves performance in complex dialogs
- Achieved via the Slot Registry system and useDialogSlot hooks
- Aligns with MUI's component slot pattern for consistency and familiarity

## 🚫 ABSOLUTE PROHIBITIONS (Never Do These)

### Development Server Management

- **❌ NEVER start the dev server** with `npm run dev` unless explicitly requested
- **❌ NEVER stop or kill the dev server** unless explicitly requested
- **❌ NEVER run `npm run build`** unless explicitly requested
- **❌ NEVER make git commits** unless explicitly requested
- **❌ NEVER kill processes on ports** or restart servers

> **Why:** The dev server is typically already running with HMR at http://localhost:5607. Changes are automatically reflected without restarting.

### Backwards Compatibility & Deprecation

- **❌ NEVER shim**, polyfill, or add compatibility layers for old behavior unless explicitly requested
- **❌ NEVER mark anything as `@deprecated`** or add deprecation warnings unless explicitly requested
- **❌ NEVER preserve old APIs or interfaces** alongside new ones for "backwards compatibility" unless explicitly requested

> **Why:** Shims and deprecation layers add complexity, bloat the bundle, and obscure intent. Make clean, direct changes. If a breaking change is needed, make it cleanly.

## 🎯 MANDATORY REQUIREMENTS (Always Do These)

### UI/UX Content Style

- **✅ ALWAYS use "Sentence case"** over "Title Case" for ALL user-facing content
- **✅ Apply to:** button text, dialog titles, labels, form fields, and any UI copy
- **✅ Examples:** "Save changes" ✅ | "Save Changes" ❌

### Code Separation

- **✅ Core functionality ONLY in `src/`** - this is what gets published
- **✅ Demo code ONLY in `demo/`** - for examples and testing only
- **✅ NEVER implement core features in demo folder**

### TypeScript function style (`src/`)

- **✅ Prefer `const` with arrow functions** for exported APIs and module-local helpers (`const foo = () => {}`).
- **✅ Use `function` declarations** when they carry real weight: hoisting before use in the same file, generators, or when a named `function` improves stack traces in a specific hotspot (rare).

## Code Organization & Build System

### `src/` directory (publishable library)

- Core dialog management logic (contexts, hooks, types)
- Built with Rollup, published to npm
- Uses only React built-ins and minimal dependencies (deepmerge-ts, clsx)
- Exports via `src/index.ts`
- Must work with any MUI v7+ application

### `demo/nextjs/` directory (demo application)

- Next.js 15 app showcasing all features
- Uses additional UI libraries (@mui-flexy/v7, react-icons)
- Custom theme (`demoTheme.ts`) and components
- Runs at http://localhost:5607 with HMR
- Examples organized by complexity in the order they will appear in the demo (1_getting_started, 2_actions_results, 3_closing_dialogs, 4_layout_presentation, 5_updating_dialog_content, 6_dialog_state_data_flow, 7_data_providers, 8_dialog_orchestration)
- Demo has two purposes: 1) it is a way to test the implementation(s) are working correctly as we are developing, and 2) documentation for package users.
- Demo is tested with Playwright (38 tests): `npx playwright test -c demo/tests/playwright.config.ts`. See `demo/tests/README.md` for details.

### Build outputs

- `dist/` - compiled library code (gitignored)
- Generated via `npm run build`

### Testing Requirements

- **✅ ALWAYS update existing tests** when making changes
- **✅ ALWAYS create new tests** for new functionality
- **✅ Follow existing test patterns** and naming conventions
- **✅ Maintain test coverage** for code quality

## Testing Approach

- Unit tests: Jest + React Testing Library (src/context/**tests**, src/hooks/**tests**)
- E2E tests: Playwright (demo/tests/)
- Test patterns: Mock providers, test hooks, verify callbacks
- Always update tests when changing behavior

## Theme System Architecture

### CSS Variables (Framework-Agnostic Core)

- Dialogist uses CSS variables for all styling (`--dialogist-*`)
- Defined in `dialogistStyles` object in `src/theme/dialogTheme.ts`
- Allows runtime theming without rebuilding
- Variables cover: colors, spacing, typography, border radius, component-specific styles

### MUI Theme Integration

- `dialogistExtendMuiTheme()` function maps MUI theme values to CSS variables
- Applied via `baseDialogistMuiComponents` object
- Maps MUI Dialog, DialogTitle, DialogContent, DialogActions, Backdrop components
- Theme extension is done in consuming application (see demo example)

### Theme Inheritance Flow

```
Demo Theme (demoTheme.ts)
  ↓
dialogistExtendMuiTheme() - maps MUI theme to CSS vars
  ↓
CSS Variables (--dialogist-*) - runtime styling
  ↓
Dialog Components - consume variables via var(...)
```

### Custom Component Styling

- `DialogProvider` accepts `slots` and `slotProps` props for custom dialog parts
- Custom components can override: Base, Title, Body, ActionsContainer, StatusBar, Footer, Actions
- Demo uses custom `DemoDialogBase` to handle sandbox/fullscreen container switching
- Custom components still respect CSS variables unless explicitly overridden

## Core Concepts & Patterns

### Dialog State Management

- **DialogProvider**: Root provider, manages dialog queue and state
- **Contexts**: Separate state and actions contexts to prevent unnecessary re-renders
  - `DialogStateContext` - current dialogs (only scaffolding subscribes)
  - `DialogActionsContext` - open/close functions (stable, rarely changes)
  - `DialogCallbacksContext` - event system for lifecycle hooks

### useDialog Hook

- Primary API for opening/closing dialogs
- Takes dialog ID and optional initial config
- Returns: `{ open, openAsync, toggle, close, closeAll, on, off, emit }`
- Initial config merged with each open() call
- Promise-based for async workflows

### Dialog Slots (Live Updates)

- **Slot Registry**: Allows components to register reactive dialog content
- **useDialogSlot hooks**: `useDialogContent`, `useDialogTitle`, `useDialogProps`, etc.
- Enables live updates when state changes (e.g., polling data, user interactions)
- Dependency tracking: either deps-based (like useEffect) or props-based (deep comparison)
- Registered slots merged with config when dialog opens
- Follows MUI's slot pattern: components can be replaced via `components` prop, and reactive content registered via hooks

### Dialog Types (unified actions model)

- Primary model: `actions` array drives all buttons; each action can have `id`, `resolveValue`, `preserveBackdrop`
- **Default type**: When `type` is omitted, defaults to `"custom"`; custom without `component` uses `message` as content via pass-through
- **alert**: Single OK button; explicit `actions` restricted to `[id=ok]` only
- **confirm**: Cancel + Confirm buttons; explicit `actions` restricted to `[id=cancel, id=confirm]` only
- **custom**: Full flexibility; any `actions` allowed; single Close button default when no `actions` provided
- Provide explicit `actions` to add/replace buttons; `deriveEffectiveActions` in `src/utils/dialogActions.ts` handles legacy translation and action restrictions

### Open conflicts & replacement

- `onConflict`: conflict policy `"block"` | `"replaceAny"` | `"replaceSameRoot"` | `"replaceSameKey"` or `(conflict: DialogConflictResolver) => DialogConflictPolicy | undefined` — **only the active dialog's** literal or function is evaluated first (then `DialogProvider` / `defaultOptions` when the active dialog **omits** `onConflict`); default **`block`**. The conflicting `open()`'s `onConflict` does not override conflict policy. **`DialogConflictResolver`** supplies `attemptedDialogKey`, `activeDialogKey`, `keyRelation` (`sameKey` | `sameRoot` | `unrelated`), **`activePolicy`** (literal-only baseline: active string, else provider string, else `block`), and **`decision`** (`replace` | `block` from that baseline and keys). If an `onConflict` **function** returns nothing / `undefined` or a non-policy value, the engine uses **`conflict.activePolicy`** for that layer (and does not fall through to the provider when the active row supplied only that function). Replace-style literals authorize **same-key** in-place updates and opens where **keyRelation** is not **sameKey** that supersede the active row, scoped by key relationship (`replaceSameKey` / `replaceSameRoot` / `replaceAny`). `throwOnConflict?: boolean` is read when the open would **block** (policy `block` or replace not allowed for the keys); `true` rejects the `open()` promise with an error message derived from the conflict (keys, `keyRelation`, `activePolicy`, `decision`); `false`/unset resolves the `open()` promise with `blocked: true` (and `cancelled: false`) on `DialogCloseEvent`. **Throw:** both active and incoming set → **active** wins; else unset incoming → active (then provider); unset active → incoming (then provider); defaults **`false`**.
- `preserveBackdropOnOk/Cancel`: Keep backdrop during transitions

## Key Implementation Patterns

### Memoization & Re-render Prevention

- Heavy use of `useMemo`, `useCallback`, `memo()` throughout
- Custom deep comparison hooks: `useDeepMemo`, `useDeepEffect`, `useDeepCallback`
- `useMemoizedDialogParts` - prevents dialog content re-renders
- Context splitting pattern to isolate state changes

### Dependency Tracking

- Dialog deps system: `contentDeps`, `actionsDeps`, `titleDeps`, etc.
- Stored in `config._dialogDeps` (internal field)
- Used to determine if dialog content should update on re-open
- Deep comparison via `deepEqual` utility

### DialogKey Normalization

- IDs can be string or array: `"my-dialog"` or `["dialog", userId, itemId]`
- `normalizeDialogKey()` converts arrays to dot-separated strings
- Enables dynamic dialog IDs based on props/state

### Component Slot System

- `DialogComponents` interface defines replaceable slot components
- `DialogSlotProps` interface defines props that can be passed to slot components
- Use `slots` prop to replace slot components: `slots={{ Title: MyCustomTitle }}`
- Use `slotProps` prop to pass props to slot components: `slotProps={{ title: { className: 'custom-class' } }}`
- Follows MUI's established `slots`/`slotProps` pattern for consistency
- Default MUI components provided by `DialogScaffolding`
- Custom components receive props with proper types and merged slotProps
- Demo shows pattern in `ClientProviders.tsx`

## 📋 COMPONENT GUIDELINES

### React Components - Source Code (`src/`)

- **✅ Use built-in React components only**
- **✅ No third-party UI libraries** in source code unless explicitly requested by the user

### React Components - Demo Code (`demo/`)

- **✅ ALWAYS use `@mui-flexy/v7` library** for React components that require CSS "flex" or "grid" layout
- **✅ Use `FlexBox` instead of `Box`** (more flexible API)
- **✅ Use `GridBox` instead of `Grid`** (more flexible API)
- **✅ FlexBox props:**
  - `row` - creates horizontal stack (row is default if neither of the row or column props are provided)
  - `column` - creates vertical stack
  - `x` - horizontal alignment: "left", "center", "right", as well as all CSS align-items values for "justify-content" when row is used, "align-items" when column is used
  - `y` - vertical alignment: "top", "center", "bottom", as well as all CSS align-items values for "align-items" when row is used, "justify-content" when column is used

## 🔄 WORKFLOW GUIDELINES

### Before Making Changes

1. **Check if dev server is running** (don't start it)
2. **Identify if change affects `src/` or `demo/`**
3. **Plan test updates** if modifying existing functionality

### During Development

1. **Use sentence case** for all new UI text
2. **Follow component guidelines** based on location
3. **Make incremental changes** to avoid breaking HMR

### After Making Changes

1. **Update tests** if functionality changed
2. **Verify sentence case** in all new UI elements
3. **Check code separation** - core features in `src/`, demos in `demo/`

## Common Development Scenarios

### Adding a new dialog feature to the library (src/)

1. Add types to `src/types.ts` or `src/types/callbacks.ts`
2. Implement logic in contexts/hooks
3. Update `DialogScaffolding` if rendering changes needed
4. Add unit tests
5. Update exports in `src/index.ts`
6. Create demo example showing the feature

### Adding a demo example (demo/)

1. Create new card component in appropriate section folder
2. Use `BaseDemoCard` wrapper for consistency
3. Follow sentence case for all UI text
4. Use `@mui-flexy/v7` for layouts
5. Add to sidebar in `DemoSidebar.tsx`
6. Add to page in `app/page.tsx`

### Modifying theme/styling

1. For library: Update `dialogistStyles` in `src/theme/dialogTheme.ts`
2. For MUI mapping: Update `baseDialogistMuiComponents`
3. For demo only: Modify `demo/nextjs/src/demoTheme.ts`
4. CSS variable naming: `--dialogist-{category}-{property}`
5. Test in both demo and hypothetical consuming apps

### Working with dialog state

- Read state: Use `DialogStateContext` (causes re-renders)
- Trigger actions: Use `DialogActionsContext` (stable)
- Lifecycle events: Use callbacks context with `on/off/emit`
- Custom events: Use dialog.emit() for component-to-parent communication

## 🚨 ENFORCEMENT REMINDERS

- **These rules exist because they prevent common mistakes**
- **Following them saves time and prevents frustration**
- **When in doubt, ask before proceeding with prohibited actions**
- **The user manages their own build process and dev server**

## Critical Reminders

- The library (`src/`) must remain framework-agnostic at its core
- CSS variables are the theming contract - don't hardcode colors/spacing
- Dialog IDs should be descriptive and unique per dialog purpose
- Use sentence case for ALL user-facing strings (not just demo)
- Keep dependencies minimal - every new dependency increases bundle size
- The goal is a lightweight, flexible dialog system that works everywhere

---

> **💡 Remember:** The goal is efficient development with minimal disruption to the existing workflow.
