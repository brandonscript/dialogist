import { deepEqual } from "../deepCompare";

describe("deepEqual", () => {
  describe("primitives", () => {
    it("should handle numbers correctly", () => {
      expect(deepEqual(1, 1)).toBe(true);
      expect(deepEqual(0, 0)).toBe(true);
      expect(deepEqual(-1, -1)).toBe(true);
      expect(deepEqual(3.14, 3.14)).toBe(true);
      expect(deepEqual(Infinity, Infinity)).toBe(true);
      expect(deepEqual(-Infinity, -Infinity)).toBe(true);
      expect(deepEqual(NaN, NaN)).toBe(true);

      expect(deepEqual(1, 2)).toBe(false);
      expect(deepEqual(0, -0)).toBe(true); // 0 === -0
      expect(deepEqual(1, "1")).toBe(false);
      expect(deepEqual(Infinity, -Infinity)).toBe(false);
    });

    it("should handle strings correctly", () => {
      expect(deepEqual("hello", "hello")).toBe(true);
      expect(deepEqual("", "")).toBe(true);
      expect(deepEqual("123", "123")).toBe(true);
      expect(deepEqual("unicode: 🚀", "unicode: 🚀")).toBe(true);

      expect(deepEqual("hello", "world")).toBe(false);
      expect(deepEqual("Hello", "hello")).toBe(false);
      expect(deepEqual("123", 123)).toBe(false);
      expect(deepEqual("", " ")).toBe(false);
    });

    it("should handle booleans correctly", () => {
      expect(deepEqual(true, true)).toBe(true);
      expect(deepEqual(false, false)).toBe(true);

      expect(deepEqual(true, false)).toBe(false);
      expect(deepEqual(true, 1)).toBe(false);
      expect(deepEqual(false, 0)).toBe(false);
      expect(deepEqual(true, "true")).toBe(false);
    });

    it("should handle null and undefined correctly", () => {
      expect(deepEqual(null, null)).toBe(true);
      expect(deepEqual(undefined, undefined)).toBe(true);

      expect(deepEqual(null, undefined)).toBe(false);
      expect(deepEqual(null, 0)).toBe(false);
      expect(deepEqual(null, false)).toBe(false);
      expect(deepEqual(null, "")).toBe(false);
      expect(deepEqual(undefined, 0)).toBe(false);
      expect(deepEqual(undefined, false)).toBe(false);
    });
  });

  describe("arrays", () => {
    it("should handle empty arrays", () => {
      expect(deepEqual([], [])).toBe(true);
    });

    it("should handle simple arrays", () => {
      expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
      expect(deepEqual(["a", "b"], ["a", "b"])).toBe(true);
      expect(deepEqual([true, false], [true, false])).toBe(true);

      expect(deepEqual([1, 2, 3], [1, 2, 4])).toBe(false);
      expect(deepEqual([1, 2], [1, 2, 3])).toBe(false);
      expect(deepEqual([1, 2, 3], [1, 2])).toBe(false);
      expect(deepEqual(["a"], ["b"])).toBe(false);
      expect(deepEqual([1, 2, 3], [3, 2, 1])).toBe(false); // Order matters
    });

    it("should handle nested arrays", () => {
      expect(deepEqual([1, [2, 3]], [1, [2, 3]])).toBe(true);
      expect(
        deepEqual(
          [
            [1, 2],
            [3, 4],
          ],
          [
            [1, 2],
            [3, 4],
          ],
        ),
      ).toBe(true);
      expect(deepEqual([[[1]]], [[[1]]])).toBe(true);
      expect(deepEqual([], [[]])).toBe(false);

      expect(deepEqual([1, [2, 3]], [1, [2, 4]])).toBe(false);
      expect(
        deepEqual(
          [
            [1, 2],
            [3, 4],
          ],
          [
            [1, 2],
            [3, 5],
          ],
        ),
      ).toBe(false);
      expect(deepEqual([[[1]]], [[[2]]])).toBe(false);
    });

    it("should handle mixed type arrays", () => {
      expect(deepEqual([1, "hello", true], [1, "hello", true])).toBe(true);
      expect(deepEqual([null, undefined, 0], [null, undefined, 0])).toBe(true);
      expect(deepEqual([{}, []], [{}, []])).toBe(true);

      expect(deepEqual([1, "hello"], ["hello", 1])).toBe(false);
      expect(deepEqual([null, undefined], [undefined, null])).toBe(false);
    });

    it("should handle sparse arrays", () => {
      // biome-ignore lint/suspicious/noSparseArray: testing sparse array behavior
      const sparse1 = [1, , 3];
      // biome-ignore lint/suspicious/noSparseArray: testing sparse array behavior
      const sparse2 = [1, , 3];
      const dense = [1, undefined, 3];

      expect(deepEqual(sparse1, sparse2)).toBe(true);
      expect(deepEqual(sparse1, dense)).toBe(false); // sparse vs dense
    });
  });

  describe("objects", () => {
    it("should handle empty objects", () => {
      expect(deepEqual({}, {})).toBe(true);
    });

    it("should handle simple objects", () => {
      expect(deepEqual({ a: 1 }, { a: 1 })).toBe(true);
      expect(deepEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
      expect(deepEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true); // Order doesn't matter

      expect(deepEqual({ a: 1 }, { a: 2 })).toBe(false);
      expect(deepEqual({ a: 1 }, { b: 1 })).toBe(false);
      expect(deepEqual({ a: 1, b: 2 }, { a: 1 })).toBe(false);
      expect(deepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    });

    it("should handle nested objects", () => {
      const obj1 = { user: { name: "John", age: 30 }, settings: { theme: "dark" } };
      const obj2 = { user: { name: "John", age: 30 }, settings: { theme: "dark" } };
      const obj3 = { user: { name: "Jane", age: 30 }, settings: { theme: "dark" } };
      const obj4 = { settings: { theme: "dark" }, user: { age: 30, name: "John" } }; // Different order

      expect(deepEqual(obj1, obj2)).toBe(true);
      expect(deepEqual(obj1, obj4)).toBe(true); // Order doesn't matter
      expect(deepEqual(obj1, obj3)).toBe(false);
    });

    it("should handle objects with various value types", () => {
      const complex1 = {
        num: 42,
        str: "hello",
        bool: true,
        nil: null,
        undef: undefined,
        arr: [1, 2, 3],
        obj: { nested: "value" },
      };
      const complex2 = {
        num: 42,
        str: "hello",
        bool: true,
        nil: null,
        undef: undefined,
        arr: [1, 2, 3],
        obj: { nested: "value" },
      };
      const complex3 = { ...complex2, num: 43 };

      expect(deepEqual(complex1, complex2)).toBe(true);
      expect(deepEqual(complex1, complex3)).toBe(false);
    });

    it("should handle objects with array values", () => {
      const obj1 = { items: [1, 2, 3], tags: ["a", "b"] };
      const obj2 = { items: [1, 2, 3], tags: ["a", "b"] };
      const obj3 = { items: [1, 2, 4], tags: ["a", "b"] };

      expect(deepEqual(obj1, obj2)).toBe(true);
      expect(deepEqual(obj1, obj3)).toBe(false);
    });
  });

  describe("dates", () => {
    it("should handle identical dates", () => {
      const date1 = new Date("2023-01-01T00:00:00Z");
      const date2 = new Date("2023-01-01T00:00:00Z");

      expect(deepEqual(date1, date2)).toBe(true);
      expect(deepEqual(date1, date1)).toBe(true); // Same reference
    });

    it("should handle different dates", () => {
      const date1 = new Date("2023-01-01");
      const date2 = new Date("2023-01-02");
      const date3 = new Date("2023-01-01T01:00:00Z");

      expect(deepEqual(date1, date2)).toBe(false);
      expect(deepEqual(date1, date3)).toBe(false);
    });

    it("should handle invalid dates", () => {
      const invalidDate1 = new Date("invalid");
      const invalidDate2 = new Date("invalid");
      const validDate = new Date("2023-01-01");

      expect(deepEqual(invalidDate1, invalidDate2)).toBe(true); // Both NaN
      expect(deepEqual(invalidDate1, validDate)).toBe(false);
    });

    it("should not confuse dates with objects", () => {
      const date = new Date("2023-01-01");
      const obj = { getTime: () => date.getTime() };

      expect(deepEqual(date, obj)).toBe(false);
    });
  });

  describe("functions", () => {
    it("should handle identical function references", () => {
      const fn = () => "hello";

      expect(deepEqual(fn, fn)).toBe(true);
    });

    it("should handle different function references", () => {
      const fn1 = () => "hello";
      const fn2 = () => "hello";
      const fn3 = () => "world";

      expect(deepEqual(fn1, fn2)).toBe(false); // Different references
      expect(deepEqual(fn1, fn3)).toBe(false);
    });

    it("should handle built-in functions", () => {
      expect(deepEqual(console.log, console.log)).toBe(true);
      expect(deepEqual(console.log, console.error)).toBe(false);
    });

    it("should not confuse functions with objects", () => {
      const fn = () => {};
      const obj = {};

      expect(deepEqual(fn, obj)).toBe(false);
    });
  });

  describe("mixed types", () => {
    it("should handle primitive vs object comparisons", () => {
      expect(deepEqual(1, { value: 1 })).toBe(false);
      expect(deepEqual("hello", ["h", "e", "l", "l", "o"])).toBe(false);
      expect(deepEqual(true, { valueOf: () => true })).toBe(false);
    });

    it("should handle array vs object comparisons", () => {
      expect(deepEqual([1, 2], { 0: 1, 1: 2 })).toBe(false);
      expect(deepEqual([], {})).toBe(false);
    });

    it("should handle complex mixed structures", () => {
      const structure1 = {
        users: [
          { id: 1, name: "John", meta: { created: new Date("2023-01-01") } },
          { id: 2, name: "Jane", meta: { created: new Date("2023-01-02") } },
        ],
        settings: {
          theme: "dark",
          features: ["feature1", "feature2"],
          callbacks: {
            onSave: () => {},
            onLoad: () => {},
          },
        },
      };

      const structure2 = {
        users: [
          { id: 1, name: "John", meta: { created: new Date("2023-01-01") } },
          { id: 2, name: "Jane", meta: { created: new Date("2023-01-02") } },
        ],
        settings: {
          theme: "dark",
          features: ["feature1", "feature2"],
          callbacks: {
            onSave: structure1.settings.callbacks.onSave, // Same reference
            onLoad: structure1.settings.callbacks.onLoad, // Same reference
          },
        },
      };

      const structure3 = JSON.parse(JSON.stringify(structure1)); // Deep clone (functions will be lost)

      expect(deepEqual(structure1, structure2)).toBe(true);
      expect(deepEqual(structure1, structure3)).toBe(false); // Functions are lost in clone
    });
  });

  describe("edge cases", () => {
    it("should handle same reference comparisons quickly", () => {
      const obj = { deeply: { nested: { object: [1, 2, 3] } } };

      expect(deepEqual(obj, obj)).toBe(true);
    });

    it("should handle null/undefined in different positions", () => {
      expect(deepEqual({ a: null }, { a: undefined })).toBe(false);
      expect(deepEqual([null], [undefined])).toBe(false);
      expect(deepEqual(null, {})).toBe(false);
      expect(deepEqual(undefined, [])).toBe(false);
    });

    it("should handle objects with null prototype", () => {
      const obj1 = Object.create(null);
      const obj2 = Object.create(null);
      obj1.key = "value";
      obj2.key = "value";

      expect(deepEqual(obj1, obj2)).toBe(true);
    });

    it("should handle objects with inherited properties", () => {
      class Parent {
        inherited = "value";
      }
      class Child extends Parent {
        own = "property";
      }

      const child1 = new Child();
      const child2 = new Child();

      // Only compares own enumerable properties
      expect(deepEqual(child1, child2)).toBe(true);
    });

    it("should handle symbol properties", () => {
      const sym = Symbol("test");
      const obj1 = { [sym]: "value", normal: "prop" };
      const obj2 = { [sym]: "value", normal: "prop" };

      // Object.keys doesn't include symbol properties, so they're ignored
      expect(deepEqual(obj1, obj2)).toBe(true);
    });

    it("should handle large objects efficiently", () => {
      const large1: Record<string, number> = {};
      const large2: Record<string, number> = {};

      // Create objects with 1000 properties
      for (let i = 0; i < 1000; i++) {
        large1[`prop${i}`] = i;
        large2[`prop${i}`] = i;
      }

      const start = performance.now();
      const result = deepEqual(large1, large2);
      const end = performance.now();

      expect(result).toBe(true);
      expect(end - start).toBeLessThan(100); // Should complete within 100ms
    });
  });

  describe("React-specific scenarios", () => {
    it("should handle React element-like objects", () => {
      const element1 = {
        type: "div",
        props: { className: "container", children: "Hello" },
        key: null,
        ref: null,
      };
      const element2 = {
        type: "div",
        props: { className: "container", children: "Hello" },
        key: null,
        ref: null,
      };
      const element3 = {
        ...element2,
        props: { ...element2.props, children: "World" },
      };

      expect(deepEqual(element1, element2)).toBe(true);
      expect(deepEqual(element1, element3)).toBe(false);
    });

    it("should handle dependency arrays with complex objects", () => {
      const deps1 = [{ user: { name: "John" } }, ["setting1", "setting2"], 42, new Date("2023-01-01")];
      const deps2 = [{ user: { name: "John" } }, ["setting1", "setting2"], 42, new Date("2023-01-01")];
      const deps3 = [{ user: { name: "Jane" } }, ["setting1", "setting2"], 42, new Date("2023-01-01")];

      expect(deepEqual(deps1, deps2)).toBe(true);
      expect(deepEqual(deps1, deps3)).toBe(false);
    });
  });
});
