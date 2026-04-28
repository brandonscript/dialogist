import { clearDialogHandlersRow, seedDialogHandlers } from "../../state/DialogHandlers";
import type { BaseDialogConfig, DialogCloseReason } from "../../types";
import { evaluateDialogCanClose } from "../dialogCanClose";

describe("dialogCanClose", () => {
  const reason: DialogCloseReason = "programmatic";
  const internalId = "test-internal";

  afterEach(() => {
    clearDialogHandlersRow("can-close-default", internalId);
    clearDialogHandlersRow("can-close-config", internalId);
    clearDialogHandlersRow("can-close-live", internalId);
    clearDialogHandlersRow("can-close-predicate", internalId);
    clearDialogHandlersRow("can-close-throw", internalId);
  });

  it("defaults to true when no guard is set", () => {
    const key = "can-close-default";
    const config: BaseDialogConfig = { type: "alert" };

    expect(evaluateDialogCanClose(key, internalId, config, reason)).toBe(true);
  });

  it("respects config.canClose when provided", () => {
    const key = "can-close-config";
    const config: BaseDialogConfig = { type: "alert", canClose: false };

    expect(evaluateDialogCanClose(key, internalId, config, reason)).toBe(false);
  });

  it("uses live canClose values when set", () => {
    const key = "can-close-live";
    const config: BaseDialogConfig = { type: "alert", canClose: true };

    seedDialogHandlers(key, internalId, Symbol("owner"), { canClose: false });

    expect(evaluateDialogCanClose(key, internalId, config, reason)).toBe(false);
  });

  it("invokes predicate guards with context", () => {
    const key = "can-close-predicate";
    const guard = jest.fn(() => true);
    const config: BaseDialogConfig = { type: "alert", canClose: guard };

    expect(evaluateDialogCanClose(key, internalId, config, reason)).toBe(true);
    expect(guard).toHaveBeenCalledWith(
      expect.objectContaining({
        dialogKey: "can-close-predicate",
        keySegments: ["can-close-predicate"],
        config,
        reason,
      }),
    );
  });

  it("blocks close when a guard throws", () => {
    const key = "can-close-throw";
    const guard = jest.fn(() => {
      throw new Error("boom");
    });
    const config: BaseDialogConfig = { type: "alert", canClose: guard };

    expect(evaluateDialogCanClose(key, internalId, config, reason)).toBe(false);
  });
});
