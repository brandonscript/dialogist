import { createElement, forwardRef, isValidElement, memo, type ReactElement } from "react";

import { resolveDialogPartContent } from "../resolveDialogPartContent";

describe("resolveDialogPartContent", () => {
  it("returns null for null, undefined, false", () => {
    expect(resolveDialogPartContent(null)).toBeNull();
    expect(resolveDialogPartContent(undefined)).toBeNull();
    expect(resolveDialogPartContent(false)).toBeNull();
  });

  it("passes through strings and numbers", () => {
    expect(resolveDialogPartContent("hi")).toBe("hi");
    expect(resolveDialogPartContent(42)).toBe(42);
  });

  it("passes through valid elements", () => {
    const el = createElement("span", null, "x");
    expect(resolveDialogPartContent(el)).toBe(el);
  });

  it("creates element from function component", () => {
    const Cmp = () => createElement("div", null, "a");
    const out = resolveDialogPartContent(Cmp);
    expect(isValidElement(out)).toBe(true);
  });

  it("merges componentProps for function component", () => {
    const Cmp = (p: { "data-x"?: string }) => createElement("div", { "data-x": p["data-x"] });
    const out = resolveDialogPartContent(Cmp, { "data-x": "foo" });
    expect(isValidElement(out)).toBe(true);
    expect((out as ReactElement<{ "data-x"?: string }>).props["data-x"]).toBe("foo");
  });

  it("handles forwardRef", () => {
    const Fr = forwardRef<HTMLDivElement>((_, ref) => createElement("div", { ref }));
    const out = resolveDialogPartContent(Fr);
    expect(isValidElement(out)).toBe(true);
  });

  it("handles memo", () => {
    const Inner = () => null;
    const M = memo(Inner);
    const out = resolveDialogPartContent(M);
    expect(isValidElement(out)).toBe(true);
  });

  it("passes through arrays as ReactNode", () => {
    const a = [createElement("i", { key: "a" }), "b"];
    expect(resolveDialogPartContent(a as never)).toBe(a);
  });
});
