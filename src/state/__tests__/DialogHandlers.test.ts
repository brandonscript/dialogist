import {
  clearDialogHandlersRow,
  resolveHandler,
  seedDialogHandlers,
  tryClearReactiveHandlers,
} from "../DialogHandlers";

describe("resolveHandler", () => {
  afterEach(() => {
    clearDialogHandlersRow("dlg", "int-a");
    clearDialogHandlersRow("dlg2", "int-b");
  });

  it("returns fallback when the store row is missing", () => {
    const fb = () => true;
    expect(resolveHandler("missing", "x", "canClose", fb)).toBe(fb);
  });

  it("returns reactive value when set", () => {
    const reactive = () => false;
    seedDialogHandlers("dlg", "int-a", undefined, { canClose: reactive });
    const fb = () => true;
    expect(resolveHandler("dlg", "int-a", "canClose", fb)).toBe(reactive);
  });

  it("returns config fallback after reactive field is cleared for the owner", () => {
    const owner = Symbol("owner");
    const reactive = () => false;
    const fallback = () => true;
    seedDialogHandlers("dlg2", "int-b", owner, { canClose: reactive });
    tryClearReactiveHandlers("dlg2", "int-b", owner, ["canClose"]);
    expect(resolveHandler("dlg2", "int-b", "canClose", fallback)).toBe(fallback);
  });
});
