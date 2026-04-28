import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

import { DEMO_FULLSCREEN_STORAGE_KEY, DEMO_SANDBOX_HEADER } from "./constants";
import { getCardElementId } from "./demo-nav-ids";

export const buildDemoPath = (sectionSlug: string, cardSlug: string): string => {
  return `/${sectionSlug}/${cardSlug}`;
};

export class DemoPage {
  constructor(private readonly page: Page) {}

  async goto(path: string): Promise<void> {
    await this.page.goto(path, { waitUntil: "networkidle" });
    await this.expectShellLoaded();
  }

  async gotoCard(sectionSlug: string, cardSlug: string): Promise<void> {
    await this.goto(buildDemoPath(sectionSlug, cardSlug));
  }

  async expectShellLoaded(): Promise<void> {
    await expect(this.page.locator(DEMO_SANDBOX_HEADER)).toBeVisible();
    await expect(this.page.locator(DEMO_SANDBOX_HEADER).getByRole("heading", { level: 1 })).toContainText(/Dialogist/i);
  }

  modeLocator(): Locator {
    return this.page.locator("[data-dialog-mode]");
  }

  async expectWindowed(): Promise<void> {
    await expect(this.modeLocator()).toHaveAttribute("data-dialog-mode", "windowed");
    await expect(this.page.locator("body")).toHaveAttribute("data-dialog-sandbox-container", /.+/);
  }

  async expectFullscreen(): Promise<void> {
    await expect(this.modeLocator()).toHaveAttribute("data-dialog-mode", "fullscreen");
    await expect(this.page.locator("body")).not.toHaveAttribute("data-dialog-sandbox-container");
  }

  /** Sets fullscreen preference before hydration (e.g. in `addInitScript`). */
  static windowedStorageInitScript(): string {
    return `
      window.localStorage.setItem(${JSON.stringify(DEMO_FULLSCREEN_STORAGE_KEY)}, JSON.stringify(false));
    `;
  }

  fullscreenSwitch(): Locator {
    return this.page.getByRole("switch", { name: /^Fullscreen$/i });
  }

  async setFullscreen(wanted: boolean): Promise<void> {
    const sw = this.fullscreenSwitch();
    await sw.scrollIntoViewIfNeeded();
    const checked = await sw.isChecked();
    if (checked !== wanted) {
      await sw.click();
    }
    if (wanted) {
      await this.expectFullscreen();
    } else {
      await this.expectWindowed();
    }
  }

  cardHeading(title: string): Locator {
    return this.page.getByRole("heading", { name: title, exact: true });
  }

  async expectCardVisible(title: string): Promise<void> {
    await expect(this.cardHeading(title)).toBeVisible();
  }

  cardRoot(sectionSlug: string, cardSlug: string): Locator {
    return this.page.locator(`#${getCardElementId(sectionSlug, cardSlug)}`);
  }

  async clickButtonInCard(sectionSlug: string, cardSlug: string, name: string | RegExp): Promise<void> {
    const root = this.cardRoot(sectionSlug, cardSlug);
    await root.scrollIntoViewIfNeeded();
    const btn = root.getByRole("button", { name }).first();
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
  }

  async clickByTestId(testId: string, options?: { waitForEnabled?: boolean }): Promise<void> {
    const el = this.page.getByTestId(testId);
    await el.scrollIntoViewIfNeeded();
    if (options?.waitForEnabled !== false) {
      await expect(el).toBeEnabled({ timeout: 20_000 });
    }
    await el.click();
  }

  async dismissDialog(buttonName: string | RegExp): Promise<void> {
    await this.page.getByRole("dialog").getByRole("button", { name: buttonName }).first().click();
    await expect(this.page.getByRole("dialog")).toHaveCount(0);
  }
}
