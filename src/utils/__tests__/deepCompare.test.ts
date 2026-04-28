import { deepEqual, deepEqualDeps } from "../deepCompare";

describe("deepEqual", () => {
  it("should handle primitives correctly", () => {
    expect(deepEqual(1, 1)).toBe(true);
    expect(deepEqual("hello", "hello")).toBe(true);
    expect(deepEqual(true, true)).toBe(true);
    expect(deepEqual(null, null)).toBe(true);
    expect(deepEqual(undefined, undefined)).toBe(true);

    expect(deepEqual(1, 2)).toBe(false);
    expect(deepEqual("hello", "world")).toBe(false);
    expect(deepEqual(true, false)).toBe(false);
    expect(deepEqual(null, undefined)).toBe(false);
  });

  it("should handle arrays correctly", () => {
    expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(deepEqual(["a", "b"], ["a", "b"])).toBe(true);
    expect(deepEqual([], [])).toBe(true);

    expect(deepEqual([1, 2, 3], [1, 2, 4])).toBe(false);
    expect(deepEqual([1, 2], [1, 2, 3])).toBe(false);
    expect(deepEqual(["a"], ["b"])).toBe(false);
  });

  it("should handle objects correctly", () => {
    expect(deepEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
    expect(deepEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
    expect(deepEqual({}, {})).toBe(true);

    expect(deepEqual({ a: 1, b: 2 }, { a: 1, b: 3 })).toBe(false);
    expect(deepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    expect(deepEqual({ a: 1 }, { b: 1 })).toBe(false);
  });

  it("should handle nested objects", () => {
    const obj1 = { user: { name: "John", age: 30 }, settings: { theme: "dark" } };
    const obj2 = { user: { name: "John", age: 30 }, settings: { theme: "dark" } };
    const obj3 = { user: { name: "Jane", age: 30 }, settings: { theme: "dark" } };

    expect(deepEqual(obj1, obj2)).toBe(true);
    expect(deepEqual(obj1, obj3)).toBe(false);
  });

  it("should handle dates", () => {
    const date1 = new Date("2023-01-01");
    const date2 = new Date("2023-01-01");
    const date3 = new Date("2023-01-02");

    expect(deepEqual(date1, date2)).toBe(true);
    expect(deepEqual(date1, date3)).toBe(false);
  });

  it("should handle functions", () => {
    const fn1 = () => {};
    const fn2 = () => {};

    expect(deepEqual(fn1, fn1)).toBe(true);
    expect(deepEqual(fn1, fn2)).toBe(false);
  });
});

describe("deepEqualDeps", () => {
  it("should compare dependency arrays correctly", () => {
    expect(deepEqualDeps([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(deepEqualDeps([{ a: 1 }, "hello"], [{ a: 1 }, "hello"])).toBe(true);
    expect(deepEqualDeps([], [])).toBe(true);

    expect(deepEqualDeps([1, 2, 3], [1, 2, 4])).toBe(false);
    expect(deepEqualDeps([1, 2], [1, 2, 3])).toBe(false);
    expect(deepEqualDeps([{ a: 1 }], [{ a: 2 }])).toBe(false);
  });

  it("should handle complex nested dependencies", () => {
    const deps1 = [{ user: { name: "John" } }, ["setting1", "setting2"], 42];
    const deps2 = [{ user: { name: "John" } }, ["setting1", "setting2"], 42];
    const deps3 = [{ user: { name: "Jane" } }, ["setting1", "setting2"], 42];

    expect(deepEqualDeps(deps1, deps2)).toBe(true);
    expect(deepEqualDeps(deps1, deps3)).toBe(false);
  });
});
