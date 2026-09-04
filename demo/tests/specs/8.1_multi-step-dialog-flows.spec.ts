import { expect } from "@playwright/test";

import {
  expectDialogStructure,
  expectResultDisplay,
  forEachAdapter,
} from "../helpers/card-test-helpers";

const SECTION = "dialog-orchestration";
const CARD = "multi-step-dialog-flows";
const CARD_TITLE = "Multi-step dialog flows";

const startFlow = async (
  d: Parameters<Parameters<typeof forEachAdapter>[4]>[0]["d"],
  page: Parameters<Parameters<typeof forEachAdapter>[4]>[0]["page"],
) => {
  const card = d.cardRoot(SECTION, CARD);
  await card.getByRole("button", { name: "Start dialog flow" }).click();
  return page.getByRole("dialog");
};

forEachAdapter("path one: step1 → step2 → step3a → done", SECTION, CARD, CARD_TITLE, async ({ page, d }) => {
  const card = d.cardRoot(SECTION, CARD);
  const dialog = await startFlow(d, page);

  // Step 1
  await expectDialogStructure(page, { title: "Step 1", message: /Welcome to the flow/i });
  await dialog.getByRole("button", { name: /^Next$/i }).click();

  // Step 2 — two path buttons
  await expectDialogStructure(page, { title: "Step 2", message: /Choose your path/i });
  await dialog.getByRole("button", { name: /Path one/i }).click();

  // Step 3a
  await expectDialogStructure(page, { title: "Step 3 (one)", message: /first path/i });
  await dialog.getByRole("button", { name: /^Done$/i }).click();

  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expectResultDisplay(card, /End/i, "success");
});

forEachAdapter("path two: step1 → step2 → step3b → done", SECTION, CARD, CARD_TITLE, async ({ page, d }) => {
  const card = d.cardRoot(SECTION, CARD);
  const dialog = await startFlow(d, page);

  // Step 1
  await dialog.getByRole("button", { name: /^Next$/i }).click();

  // Step 2
  await expectDialogStructure(page, { title: "Step 2" });
  await dialog.getByRole("button", { name: /Path two/i }).click();

  // Step 3b
  await expectDialogStructure(page, { title: "Step 3 (two)", message: /second path/i });
  await dialog.getByRole("button", { name: /^Done$/i }).click();

  await expect(page.getByRole("dialog")).toHaveCount(0);
});
