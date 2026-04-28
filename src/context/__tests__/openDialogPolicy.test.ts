import type { BaseDialogConfig, DialogConflictPolicy, DialogConflictResolver } from "../../types";
import {
  createOpenDialogConflict,
  dialogConflictKeyRelation,
  formatBlockedOpenConflictError,
  isDialogConflictPolicy,
  isOpenReplaceAllowed,
  openConflictReplaceAllowedForKeys,
  resolveLiteralOnlyConflictPolicy,
  resolveOpenConflictPolicy,
} from "../openDialogPolicy";

const mkConflict = (overrides: Partial<DialogConflictResolver> = {}): DialogConflictResolver => ({
  attemptedDialogKey: "a",
  activeDialogKey: "b",
  keyRelation: "unrelated",
  activePolicy: "block",
  decision: "block",
  ...overrides,
});

describe("openDialogPolicy", () => {
  describe("dialogConflictKeyRelation", () => {
    it("returns unrelated when active is null", () => {
      expect(dialogConflictKeyRelation("k", null)).toBe("unrelated");
    });

    it("returns sameKey when keys are equal", () => {
      expect(dialogConflictKeyRelation("flow::a", "flow::a")).toBe("sameKey");
    });

    it("returns sameRoot when first segment matches", () => {
      expect(dialogConflictKeyRelation("checkout-flow", "checkout-flow::step-1")).toBe("sameRoot");
    });

    it("returns unrelated when roots differ", () => {
      expect(dialogConflictKeyRelation("primary-x", "secondary-x")).toBe("unrelated");
    });
  });

  describe("isDialogConflictPolicy", () => {
    it("accepts policy strings", () => {
      expect(isDialogConflictPolicy("block")).toBe(true);
      expect(isDialogConflictPolicy("replaceAny")).toBe(true);
    });
    it("rejects invalid values", () => {
      expect(isDialogConflictPolicy(undefined)).toBe(false);
      expect(isDialogConflictPolicy(false)).toBe(false);
      expect(isDialogConflictPolicy("nope")).toBe(false);
    });
  });

  describe("resolveLiteralOnlyConflictPolicy", () => {
    it("prefers active string over provider", () => {
      expect(
        resolveLiteralOnlyConflictPolicy({ type: "custom", onConflict: "replaceAny" } as BaseDialogConfig, "block"),
      ).toBe("replaceAny");
    });
    it("uses provider when active omits or is function", () => {
      expect(resolveLiteralOnlyConflictPolicy({ type: "custom" } as BaseDialogConfig, "replaceSameRoot")).toBe(
        "replaceSameRoot",
      );
      expect(
        resolveLiteralOnlyConflictPolicy(
          { type: "custom", onConflict: () => "replaceAny" } as BaseDialogConfig,
          "replaceSameKey",
        ),
      ).toBe("replaceSameKey");
    });
    it("defaults to block", () => {
      expect(resolveLiteralOnlyConflictPolicy({ type: "custom" } as BaseDialogConfig, undefined)).toBe("block");
    });
  });

  describe("createOpenDialogConflict", () => {
    it("sets keyRelation and activePolicy and decision for same key", () => {
      const c = createOpenDialogConflict({
        attemptedDialogKey: "k",
        activeDialogKey: "k",
        targetRowKey: "k",
        activeDialogConfig: { type: "custom", onConflict: "replaceSameKey" } as BaseDialogConfig,
        providerOnConflict: "block",
      });
      expect(c.attemptedDialogKey).toBe("k");
      expect(c.activeDialogKey).toBe("k");
      expect(c.keyRelation).toBe("sameKey");
      expect(c.activePolicy).toBe("replaceSameKey");
      expect(c.decision).toBe("replace");
    });

    it("sets unrelated and decision block when policy is block", () => {
      const c = createOpenDialogConflict({
        attemptedDialogKey: "secondary-x",
        activeDialogKey: "primary-x",
        targetRowKey: "primary-x",
        activeDialogConfig: { type: "custom" } as BaseDialogConfig,
        providerOnConflict: undefined,
      });
      expect(c.keyRelation).toBe("unrelated");
      expect(c.activePolicy).toBe("block");
      expect(c.decision).toBe("block");
    });
  });

  describe("formatBlockedOpenConflictError", () => {
    it("includes keys and policy fields", () => {
      const msg = formatBlockedOpenConflictError(
        mkConflict({
          attemptedDialogKey: "conflict-id",
          activeDialogKey: "conflict-id",
          keyRelation: "sameKey",
          activePolicy: "block",
          decision: "block",
        }),
      );
      expect(msg).toContain("conflict-id");
      expect(msg).toContain("sameKey");
      expect(msg).toContain("activePolicy=block");
      expect(msg).toContain("decision=block");
    });
  });

  describe("openConflictReplaceAllowedForKeys", () => {
    it("returns false for block", () => {
      expect(openConflictReplaceAllowedForKeys("block", "x", "y")).toBe(false);
    });

    it("returns true for replaceAny", () => {
      expect(openConflictReplaceAllowedForKeys("replaceAny", "x", "y")).toBe(true);
    });

    it("replaceSameKey requires equal keys", () => {
      expect(openConflictReplaceAllowedForKeys("replaceSameKey", "flow::a", "flow::a")).toBe(true);
      expect(openConflictReplaceAllowedForKeys("replaceSameKey", "flow::a", "flow::b")).toBe(false);
    });

    it("replaceSameRoot uses first segment", () => {
      expect(openConflictReplaceAllowedForKeys("replaceSameRoot", "flow", "flow::step")).toBe(true);
      expect(openConflictReplaceAllowedForKeys("replaceSameRoot", "flow::a", "flow::b")).toBe(true);
      expect(openConflictReplaceAllowedForKeys("replaceSameRoot", "flow", "other::x")).toBe(false);
    });
  });

  describe("isOpenReplaceAllowed", () => {
    it("is false when policy is block even if keys match", () => {
      expect(isOpenReplaceAllowed("block", "k", "k")).toBe(false);
    });

    it("is true when policy allows keys", () => {
      expect(isOpenReplaceAllowed("replaceSameKey", "k", "k")).toBe(true);
    });
  });

  describe("resolveOpenConflictPolicy", () => {
    const sampleConflict = mkConflict();

    it("uses active dialog onConflict literal first", () => {
      const cfg = { onConflict: "replaceAny" as const, type: "custom" as const };
      expect(
        resolveOpenConflictPolicy({
          activeDialogConfig: cfg as BaseDialogConfig,
          providerOnConflict: "block",
          conflict: sampleConflict,
        }),
      ).toBe("replaceAny");
    });

    it("falls back to provider when active omits onConflict", () => {
      expect(
        resolveOpenConflictPolicy({
          activeDialogConfig: { type: "custom" } as BaseDialogConfig,
          providerOnConflict: "replaceSameRoot",
          conflict: sampleConflict,
        }),
      ).toBe("replaceSameRoot");
    });

    it("defaults to block", () => {
      expect(
        resolveOpenConflictPolicy({
          activeDialogConfig: { type: "custom" } as BaseDialogConfig,
          conflict: sampleConflict,
        }),
      ).toBe("block");
    });

    it("invokes function onConflict with conflict", () => {
      const fn = jest.fn().mockReturnValue("replaceSameKey" as const);
      expect(
        resolveOpenConflictPolicy({
          activeDialogConfig: { type: "custom", onConflict: fn } as BaseDialogConfig,
          conflict: sampleConflict,
        }),
      ).toBe("replaceSameKey");
      expect(fn).toHaveBeenCalledWith(sampleConflict);
    });

    it("uses conflict.activePolicy when active function returns undefined", () => {
      const conflict = mkConflict({ activePolicy: "replaceSameKey", decision: "replace" });
      expect(
        resolveOpenConflictPolicy({
          activeDialogConfig: {
            type: "custom",
            onConflict: () => undefined,
          } as BaseDialogConfig,
          providerOnConflict: "replaceAny",
          conflict,
        }),
      ).toBe("replaceSameKey");
    });

    it("does not invoke provider onConflict when active is a function that returns void", () => {
      const providerFn = jest.fn().mockReturnValue("replaceAny" as const);
      const conflict = mkConflict({ activePolicy: "block", decision: "block" });
      expect(
        resolveOpenConflictPolicy({
          activeDialogConfig: {
            type: "custom",
            onConflict: () => undefined,
          } as BaseDialogConfig,
          providerOnConflict: providerFn,
          conflict,
        }),
      ).toBe("block");
      expect(providerFn).not.toHaveBeenCalled();
    });

    it("uses activePolicy when active function returns invalid value", () => {
      const conflict = mkConflict({ activePolicy: "replaceAny", decision: "replace" });
      expect(
        resolveOpenConflictPolicy({
          activeDialogConfig: {
            type: "custom",
            onConflict: () => false as unknown as DialogConflictPolicy,
          } as BaseDialogConfig,
          conflict,
        }),
      ).toBe("replaceAny");
    });
  });
});
