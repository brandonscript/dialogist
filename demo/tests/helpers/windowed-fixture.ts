import { test as base } from "@playwright/test";

import { DemoPage } from "./demo-page";

type Fixtures = {
  demoPage: DemoPage;
};

/**
 * Card tests: default to windowed sandbox (localStorage + post-navigation assert).
 * General app tests should import `test` from `@playwright/test` instead.
 */
export const test = base.extend<Fixtures>({
  page: async ({ page }, use) => {
    await page.addInitScript(DemoPage.windowedStorageInitScript());
    await use(page);
  },
  demoPage: async ({ page }, use) => {
    await use(new DemoPage(page));
  },
});

export { expect } from "@playwright/test";
