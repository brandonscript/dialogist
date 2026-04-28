import { deriveEffectiveActions } from "../dialogActions";

const noopClose = (
  _key: string,
  _opts?: { cancelled?: boolean; preserveBackdrop?: boolean; actionEvent?: any; resolveValue?: unknown },
) => {};

describe("dialogActions", () => {
  describe("deriveEffectiveActions", () => {
    it("returns built-in confirm actions when type is confirm and no explicit actions", () => {
      const groups = deriveEffectiveActions(
        {
          type: "confirm",
          cancelLabel: "Abort",
          okLabel: "Proceed",
        } as any,
        "test",
        "dialog-actions-internal",
        noopClose,
      );
      expect(groups).toHaveLength(1);
      expect(groups[0]).toHaveLength(2);
      expect(groups[0][0].title).toBe("Abort");
      expect(groups[0][1].title).toBe("Proceed");
      expect(groups[0][0].resolveValue).toBe(false);
      expect(groups[0][1].resolveValue).toBe(true);
      expect(typeof groups[0][0].props?.onClick).toBe("function");
      expect(typeof groups[0][1].props?.onClick).toBe("function");
    });

    it("returns built-in alert actions when type is alert and no explicit actions", () => {
      const groups = deriveEffectiveActions(
        { type: "alert", okLabel: "Got it" } as any,
        "test",
        "dialog-actions-internal",
        noopClose,
      );
      expect(groups).toHaveLength(1);
      expect(groups[0]).toHaveLength(1);
      expect(groups[0][0].title).toBe("Got it");
      expect(groups[0][0].resolveValue).toBe(false);
    });

    it("returns built-in custom actions when type is custom and no explicit actions", () => {
      const groups = deriveEffectiveActions(
        { type: "custom", message: () => null } as any,
        "test",
        "dialog-actions-internal",
        noopClose,
      );
      expect(groups).toHaveLength(1);
      expect(groups[0]).toHaveLength(1);
      expect(groups[0][0].title).toBe("Close");
    });

    it("returns empty array when actions is explicitly set to [] (no built-in fallback)", () => {
      const groups = deriveEffectiveActions(
        { type: "custom", message: () => null, actions: [] } as any,
        "test",
        "dialog-actions-internal",
        noopClose,
      );
      expect(groups).toHaveLength(0);
    });

    it("returns empty array for confirm with explicit empty actions (no built-in fallback)", () => {
      const groups = deriveEffectiveActions(
        { type: "confirm", actions: [] } as any,
        "test",
        "dialog-actions-internal",
        noopClose,
      );
      expect(groups).toHaveLength(0);
    });

    it("uses explicit actions when provided (custom type) and hydrates those without onClick", () => {
      const groups = deriveEffectiveActions(
        {
          type: "custom",
          message: () => null,
          actions: [
            { id: "save", title: "Save", resolveValue: "saved" },
            { id: "discard", title: "Discard", resolveValue: false },
          ],
        } as any,
        "test",
        "dialog-actions-internal",
        noopClose,
      );
      expect(groups).toHaveLength(1);
      expect(groups[0]).toHaveLength(2);
      expect(groups[0][0].title).toBe("Save");
      expect(groups[0][1].title).toBe("Discard");
      expect(typeof groups[0][0].props?.onClick).toBe("function");
      expect(typeof groups[0][1].props?.onClick).toBe("function");

      let closedWith: any;
      const captureClose = (_k: string, opts: any) => {
        closedWith = opts;
      };
      const hydrated = deriveEffectiveActions(
        {
          type: "custom",
          message: () => null,
          actions: [{ id: "save", title: "Save", resolveValue: "saved" }],
        } as any,
        "test",
        "dialog-actions-internal",
        captureClose,
      );
      (hydrated[0][0].props as any).onClick?.({} as any);
      expect(closedWith.resolveValue).toBe("saved");
      expect(closedWith.actionEvent?.actionId).toBe("save");
    });

    it("restricts confirm to only cancel and ok actions", () => {
      const groups = deriveEffectiveActions(
        {
          type: "confirm",
          cancelLabel: "No",
          okLabel: "Yes",
          actions: [
            { id: "cancel", title: "No", resolveValue: false },
            { id: "ok", title: "Yes", resolveValue: true },
          ],
        } as any,
        "test",
        "dialog-actions-internal",
        noopClose,
      );
      expect(groups).toHaveLength(1);
      expect(groups[0]).toHaveLength(2);
      expect(groups[0][0].id).toBe("cancel");
      expect(groups[0][0].title).toBe("No");
      expect(groups[0][1].id).toBe("ok");
      expect(groups[0][1].title).toBe("Yes");
    });

    it("restricts alert to only ok action", () => {
      const groups = deriveEffectiveActions(
        {
          type: "alert",
          okLabel: "Got it",
          actions: [{ id: "ok", title: "Got it", resolveValue: false }],
        } as any,
        "test",
        "dialog-actions-internal",
        noopClose,
      );
      expect(groups).toHaveLength(1);
      expect(groups[0]).toHaveLength(1);
      expect(groups[0][0].id).toBe("ok");
      expect(groups[0][0].title).toBe("Got it");
    });

    it("treats a single unnamed action on alert as ok (built-in mode, not custom)", () => {
      const groups = deriveEffectiveActions(
        {
          type: "alert",
          okLabel: "Got it",
          actions: [{ title: "Got it", resolveValue: false }],
        } as any,
        "test",
        "dialog-actions-internal",
        noopClose,
      );
      expect(groups).toHaveLength(1);
      expect(groups[0]).toHaveLength(1);
      expect(groups[0][0].title).toBe("Got it");
      expect(typeof (groups[0][0].props as any)?.onClick).toBe("function");
    });

    it("treats two unnamed actions on confirm as cancel then ok (built-in mode)", () => {
      const groups = deriveEffectiveActions(
        {
          type: "confirm",
          cancelLabel: "No",
          okLabel: "Yes",
          actions: [
            { title: "No", resolveValue: false },
            { title: "Yes", resolveValue: true },
          ],
        } as any,
        "test",
        "dialog-actions-internal",
        noopClose,
      );
      expect(groups).toHaveLength(1);
      expect(groups[0]).toHaveLength(2);
      expect(groups[0][0].title).toBe("No");
      expect(groups[0][1].title).toBe("Yes");
    });

    it("treats as custom and renders all actions when confirm receives custom action ids", () => {
      const groups = deriveEffectiveActions(
        {
          type: "confirm",
          cancelLabel: "Abort",
          okLabel: "Proceed",
          actions: [
            { id: "save", title: "Save", resolveValue: "saved" },
            { id: "discard", title: "Discard", resolveValue: false },
          ],
        } as any,
        "test",
        "dialog-actions-internal",
        noopClose,
      );
      expect(groups).toHaveLength(1);
      expect(groups[0]).toHaveLength(2);
      expect(groups[0][0].id).toBe("save");
      expect(groups[0][0].title).toBe("Save");
      expect(groups[0][1].id).toBe("discard");
      expect(groups[0][1].title).toBe("Discard");
    });

    it("falls back to built-in when alert/confirm has only ok/cancel ids but invalid for type", () => {
      const groups = deriveEffectiveActions(
        {
          type: "alert",
          okLabel: "Got it",
          actions: [{ id: "cancel", title: "Cancel", resolveValue: false }],
        } as any,
        "test",
        "dialog-actions-internal",
        noopClose,
      );
      expect(groups).toHaveLength(1);
      expect(groups[0]).toHaveLength(1);
      expect(groups[0][0].id).toBe("ok");
      expect(groups[0][0].title).toBe("Got it");
    });

    it("wraps custom onClick so reactive actionHandlers can override at click time", () => {
      const customOnClick = jest.fn();
      const groups = deriveEffectiveActions(
        {
          type: "custom",
          message: () => null,
          actions: [{ id: "custom", title: "Custom", props: { onClick: customOnClick } }],
        } as any,
        "test",
        "dialog-actions-internal",
        noopClose,
      );
      expect(groups).toHaveLength(1);
      expect(groups[0]).toHaveLength(1);
      expect((groups[0][0].props as any).onClick).not.toBe(customOnClick);
      (groups[0][0].props as any).onClick({});
      expect(customOnClick).toHaveBeenCalledTimes(1);
    });

    it("supports nested action groups [[A,B], C] for custom type", () => {
      const groups = deriveEffectiveActions(
        {
          type: "custom",
          message: () => null,
          actions: [
            [
              { id: "cancel", title: "Cancel", resolveValue: false },
              { id: "draft", title: "Draft", resolveValue: "draft" },
            ],
            { id: "save", title: "Save", resolveValue: "save" },
          ],
        } as any,
        "test",
        "dialog-actions-internal",
        noopClose,
      );
      expect(groups).toHaveLength(2);
      expect(groups[0]).toHaveLength(2);
      expect(groups[1]).toHaveLength(1);
      expect(groups[0][0].title).toBe("Cancel");
      expect(groups[0][1].title).toBe("Draft");
      expect(groups[1][0].title).toBe("Save");
    });
  });
});
