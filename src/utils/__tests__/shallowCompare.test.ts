import { shallowEqual, shallowEqualLevel2 } from "../shallowCompare";

describe("shallowEqual", () => {
  it("returns true for identical primitives", () => {
    expect(shallowEqual(1, 1)).toBe(true);
    expect(shallowEqual("a", "a")).toBe(true);
  });

  it("returns false for different primitives", () => {
    expect(shallowEqual(1, 2)).toBe(false);
    expect(shallowEqual("a", "b")).toBe(false);
  });

  it("compares arrays by shallow values", () => {
    expect(shallowEqual([1, 2], [1, 2])).toBe(true);
    expect(shallowEqual([1, 2], [2, 1])).toBe(false);
  });

  it("compares objects by own keys and values", () => {
    expect(shallowEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
    expect(shallowEqual({ a: 1 }, { a: 2 })).toBe(false);
  });
});

describe("shallowEqualLevel2", () => {
  it("compares nested objects at one level deep", () => {
    const first = { style: { color: "red" }, count: 1 };
    const second = { style: { color: "red" }, count: 1 };
    const third = { style: { color: "blue" }, count: 1 };

    expect(shallowEqualLevel2(first, second)).toBe(true);
    expect(shallowEqualLevel2(first, third)).toBe(false);
  });

  it("compares arrays of objects shallowly", () => {
    const first = [{ id: 1 }, { id: 2 }];
    const second = [{ id: 1 }, { id: 2 }];
    const third = [{ id: 2 }, { id: 1 }];

    expect(shallowEqualLevel2(first, second)).toBe(true);
    expect(shallowEqualLevel2(first, third)).toBe(false);
  });
});
