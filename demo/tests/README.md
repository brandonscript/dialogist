## Playwright E2E tests for the Dialogist demo

### What's covered

- **`demo-app.spec.ts`** – general shell tests: fullscreen toggle, keyboard toggle, render tracking on/off/reset, and primary-button design-token assertions.
- **`cards.spec.ts`** – one test per demo card (33 cards). Each test navigates to the card's route in **windowed mode**, asserts the card heading is visible, opens a dialog (or asserts doc content), and dismisses it.

### Run

From the repo root:

```bash
npx playwright test -c demo/tests/playwright.config.ts
```

The config automatically starts a dedicated dev server on **port 5608** (Turbopack) when none is already running there, so you do not need to start anything manually. If a server is already running on 5608 it is reused.

### First-time setup

Install the Chromium browser once:

```bash
npx playwright install chromium
```

### Structure

```
demo/tests/
  playwright.config.ts      # Playwright config (port 5608, Chromium only)
  specs/
    demo-app.spec.ts        # App-shell & design-token tests
    cards.spec.ts           # Per-card data-driven suite
  helpers/
    windowed-fixture.ts     # Fixture that forces windowed mode via localStorage
    demo-page.ts            # Page Object Model (DemoPage)
    card-scenarios.ts       # 33-entry scenario table
    constants.ts            # Shared selectors / localStorage keys
    demo-nav-ids.ts         # getCardElementId() mirror
    to-slug.ts              # toSlug() mirror
```
