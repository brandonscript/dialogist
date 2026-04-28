import { chainEventHandlers } from "../chainEventHandlers";

type TestHandlers = {
  onClick?: (value: number) => void;
  onFocus?: () => void;
  label?: string;
};

describe("chainEventHandlers", () => {
  it("chains handlers for the same key in order", () => {
    const calls: string[] = [];
    const first = { onClick: (value: number) => calls.push(`first:${value}`) };
    const second = { onClick: (value: number) => calls.push(`second:${value}`) };

    const chained = chainEventHandlers<TestHandlers>(first, second);
    chained.onClick?.(7);

    expect(calls).toEqual(["first:7", "second:7"]);
  });

  it("lets later non-function values override earlier ones", () => {
    const first = { label: "primary", onFocus: () => {} };
    const second = { label: "override" };

    const chained = chainEventHandlers<TestHandlers>(first, second);

    expect(chained.label).toBe("override");
  });

  it("ignores undefined handler objects", () => {
    const calls: string[] = [];
    const first = { onClick: () => calls.push("first") };

    const chained = chainEventHandlers<TestHandlers>(undefined, first);
    chained.onClick?.(0);

    expect(calls).toEqual(["first"]);
  });
});
