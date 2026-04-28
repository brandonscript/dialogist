import type { BaseDialogConfig, DialogConfig, DialogOpenConfig, DialogState, DialogStoredConfig } from "../../types";
import type { DialogDeps } from "../../useDialog";
import { getActiveDialogKey, shouldDialogUpdate } from "../DialogProvider.utils";

// Test helper to create dialog configs
const createDialogConfig = (
  overrides: Partial<BaseDialogConfig | DialogConfig> = {},
  deps?: DialogDeps,
): DialogOpenConfig | DialogStoredConfig => {
  const base: BaseDialogConfig = {
    type: "alert",
    title: "Test Dialog",
    message: "Test message",
    ...overrides,
  };

  if (deps) {
    return { ...base, _dialogDeps: deps } as DialogOpenConfig;
  }

  return base as DialogStoredConfig;
};

// Test helper to create dialog states
const createDialogState = (id: string, overrides: Partial<BaseDialogConfig | DialogConfig> = {}): DialogState => {
  return {
    key: id,
    keySegments: [id],
    type: "alert",
    config: { ...(createDialogConfig(overrides) as DialogStoredConfig), dialogKey: [id] },
    resolve: () => {},
    reject: () => {},
    internalId: "utils-test-internal",
  };
};

describe("shouldDialogUpdate", () => {
  describe("no dependency arrays specified", () => {
    it("should return false for identical configs", () => {
      const config1 = createDialogConfig({
        type: "alert",
        title: "Test",
        message: "Hello",
      });
      const config2 = createDialogConfig({
        type: "alert",
        title: "Test",
        message: "Hello",
      });

      expect(shouldDialogUpdate(config1, config2)).toBe(false);
    });

    it("should return true for different configs", () => {
      const config1 = createDialogConfig({
        type: "alert",
        title: "Test",
        message: "Hello",
      });
      const config2 = createDialogConfig({
        type: "alert",
        title: "Test",
        message: "World", // Different message
      });

      expect(shouldDialogUpdate(config1, config2)).toBe(true);
    });

    it("should return true for configs with different props", () => {
      const config1 = createDialogConfig({
        type: "alert",
        borderRadius: 8,
        overflow: "hidden",
      });
      const config2 = createDialogConfig({
        type: "alert",
        borderRadius: 16, // Different border radius
        overflow: "hidden",
      });

      expect(shouldDialogUpdate(config1, config2)).toBe(true);
    });

    it("should handle complex nested configs", () => {
      const config1 = createDialogConfig({
        type: "custom",
        message: () => null,
        props: {
          user: { name: "John", settings: { theme: "dark" } },
          items: [1, 2, 3],
        },
      } as any);

      const config2 = createDialogConfig({
        type: "custom",
        message: config1.message, // Same reference
        props: {
          user: { name: "John", settings: { theme: "dark" } },
          items: [1, 2, 3],
        },
      } as any);

      expect(shouldDialogUpdate(config1, config2)).toBe(false);
    });
  });

  describe("props comparison (always performed)", () => {
    it("should detect prop changes even with empty deps", () => {
      const config1 = createDialogConfig(
        {
          type: "alert",
          title: "Original",
          borderRadius: 8,
        },
        {},
      );

      const config2 = createDialogConfig(
        {
          type: "alert",
          title: "Changed", // Title prop changed
          borderRadius: 8,
        },
        {},
      );

      expect(shouldDialogUpdate(config1, config2)).toBe(true);
    });

    it("should detect borderRadius changes", () => {
      const config1 = createDialogConfig(
        {
          type: "alert",
          borderRadius: 8,
        },
        { contentDeps: [] },
      );

      const config2 = createDialogConfig(
        {
          type: "alert",
          borderRadius: 16, // Border radius changed
        },
        { contentDeps: [] },
      );

      expect(shouldDialogUpdate(config1, config2)).toBe(true);
    });

    it("should detect overflow changes", () => {
      const config1 = createDialogConfig(
        {
          type: "alert",
          overflow: "hidden",
        },
        { contentDeps: [] },
      );

      const config2 = createDialogConfig(
        {
          type: "alert",
          overflow: "visible", // Overflow changed
        },
        { contentDeps: [] },
      );

      expect(shouldDialogUpdate(config1, config2)).toBe(true);
    });

    it("should ignore _dialogDeps when comparing props", () => {
      const config1 = createDialogConfig(
        {
          type: "alert",
          title: "Same",
        },
        { contentDeps: [1, 2, 3] },
      );

      const config2 = createDialogConfig(
        {
          type: "alert",
          title: "Same",
        },
        { contentDeps: [4, 5, 6] },
      ); // Different deps, same props

      // Should return true because deps changed, but not because of props
      expect(shouldDialogUpdate(config1, config2)).toBe(true);
    });
  });

  describe("old config has no deps, new config has deps", () => {
    it("should return true when transitioning from no deps to deps", () => {
      const config1 = createDialogConfig({
        type: "alert",
        title: "Test",
      }); // No deps

      const config2 = createDialogConfig(
        {
          type: "alert",
          title: "Test",
        },
        { contentDeps: [] },
      ); // Has deps

      expect(shouldDialogUpdate(config1, config2)).toBe(true);
    });
  });

  describe("simple dependency arrays", () => {
    it("should detect contentDeps changes", () => {
      const config1 = createDialogConfig(
        {},
        {
          contentDeps: [1, 2, 3],
        },
      );

      const config2 = createDialogConfig(
        {},
        {
          contentDeps: [1, 2, 4], // Changed
        },
      );

      expect(shouldDialogUpdate(config1, config2)).toBe(true);
    });

    it("should detect titleDeps changes", () => {
      const config1 = createDialogConfig(
        {},
        {
          titleDeps: [{ user: "John" }],
        },
      );

      const config2 = createDialogConfig(
        {},
        {
          titleDeps: [{ user: "Jane" }], // Changed
        },
      );

      expect(shouldDialogUpdate(config1, config2)).toBe(true);
    });

    it("should detect statusBarDeps changes", () => {
      const config1 = createDialogConfig(
        {},
        {
          statusBarDeps: ["status1", "status2"],
        },
      );

      const config2 = createDialogConfig(
        {},
        {
          statusBarDeps: ["status1", "status3"], // Changed
        },
      );

      expect(shouldDialogUpdate(config1, config2)).toBe(true);
    });

    it("should detect footerDeps changes", () => {
      const config1 = createDialogConfig(
        {},
        {
          footerDeps: [{ visible: true }],
        },
      );

      const config2 = createDialogConfig(
        {},
        {
          footerDeps: [{ visible: false }], // Changed
        },
      );

      expect(shouldDialogUpdate(config1, config2)).toBe(true);
    });

    it("should return false for identical simple deps", () => {
      const complexObj = {
        user: { name: "John", age: 30 },
        settings: { theme: "dark" },
        items: [1, 2, 3],
      };

      const config1 = createDialogConfig(
        {},
        {
          contentDeps: [complexObj, "string", 42],
          titleDeps: [new Date("2023-01-01")],
          statusBarDeps: [],
          footerDeps: [true, false, null],
        },
      );

      const config2 = createDialogConfig(
        {},
        {
          contentDeps: [
            { user: { name: "John", age: 30 }, settings: { theme: "dark" }, items: [1, 2, 3] },
            "string",
            42,
          ],
          titleDeps: [new Date("2023-01-01")],
          statusBarDeps: [],
          footerDeps: [true, false, null],
        },
      );

      expect(shouldDialogUpdate(config1, config2)).toBe(false);
    });

    it("should handle undefined deps correctly", () => {
      const config1 = createDialogConfig(
        {},
        {
          contentDeps: [1, 2, 3],
          // titleDeps undefined
        },
      );

      const config2 = createDialogConfig(
        {},
        {
          contentDeps: [1, 2, 3],
          titleDeps: [], // Was undefined, now empty array
        },
      );

      expect(shouldDialogUpdate(config1, config2)).toBe(true);
    });

    it("should handle both undefined deps correctly", () => {
      const config1 = createDialogConfig(
        {},
        {
          contentDeps: [1, 2, 3],
          // titleDeps undefined
        },
      );

      const config2 = createDialogConfig(
        {},
        {
          contentDeps: [1, 2, 3],
          // titleDeps still undefined
        },
      );

      expect(shouldDialogUpdate(config1, config2)).toBe(false);
    });
  });

  describe("actionsDeps (nested arrays)", () => {
    it("should detect changes in actionsDeps structure", () => {
      const config1 = createDialogConfig(
        {},
        {
          actionsDeps: [
            [1, 2, 3], // Action 0 deps
            ["a", "b"], // Action 1 deps
          ],
        },
      );

      const config2 = createDialogConfig(
        {},
        {
          actionsDeps: [
            [1, 2, 3], // Action 0 deps (same)
            ["a", "c"], // Action 1 deps (changed)
          ],
        },
      );

      expect(shouldDialogUpdate(config1, config2)).toBe(true);
    });

    it("should detect length changes in actionsDeps", () => {
      const config1 = createDialogConfig(
        {},
        {
          actionsDeps: [
            [1, 2, 3],
            ["a", "b"],
          ],
        },
      );

      const config2 = createDialogConfig(
        {},
        {
          actionsDeps: [
            [1, 2, 3],
            ["a", "b"],
            [true], // New action added
          ],
        },
      );

      expect(shouldDialogUpdate(config1, config2)).toBe(true);
    });

    it("should return false for identical actionsDeps", () => {
      const config1 = createDialogConfig(
        {},
        {
          actionsDeps: [
            [{ user: "John" }, 42],
            [new Date("2023-01-01"), "status"],
            [], // Empty deps for action 2
          ],
        },
      );

      const config2 = createDialogConfig(
        {},
        {
          actionsDeps: [[{ user: "John" }, 42], [new Date("2023-01-01"), "status"], []],
        },
      );

      expect(shouldDialogUpdate(config1, config2)).toBe(false);
    });

    it("should handle transition from no actionsDeps to actionsDeps", () => {
      const config1 = createDialogConfig(
        {},
        {
          contentDeps: [1, 2, 3],
          // actionsDeps undefined
        },
      );

      const config2 = createDialogConfig(
        {},
        {
          contentDeps: [1, 2, 3],
          actionsDeps: [[]], // Now has actionsDeps
        },
      );

      expect(shouldDialogUpdate(config1, config2)).toBe(true);
    });

    it("should handle both actionsDeps undefined", () => {
      const config1 = createDialogConfig(
        {},
        {
          contentDeps: [1, 2, 3],
          // actionsDeps undefined
        },
      );

      const config2 = createDialogConfig(
        {},
        {
          contentDeps: [1, 2, 3],
          // actionsDeps still undefined
        },
      );

      expect(shouldDialogUpdate(config1, config2)).toBe(false);
    });
  });

  describe("complex scenarios", () => {
    it("should handle mixed dependency types", () => {
      const config1 = createDialogConfig(
        {
          type: "custom",
          title: "Complex Dialog",
          borderRadius: 12,
        } as any,
        {
          contentDeps: [{ data: "value1" }],
          titleDeps: ["title1"],
          actionsDeps: [
            [1, 2], // Action 0
            ["a", "b"], // Action 1
          ],
        },
      );

      const config2 = createDialogConfig(
        {
          type: "custom",
          title: "Complex Dialog", // Same
          borderRadius: 12, // Same
        } as any,
        {
          contentDeps: [{ data: "value2" }], // Changed
          titleDeps: ["title1"], // Same
          actionsDeps: [
            [1, 2], // Same
            ["a", "b"], // Same
          ],
        },
      );

      expect(shouldDialogUpdate(config1, config2)).toBe(true);
    });

    it("should return false when everything is identical", () => {
      const sharedData = {
        user: { name: "John", preferences: { theme: "dark" } },
        items: [1, 2, { id: 3, name: "item" }],
      };

      const config1 = createDialogConfig(
        {
          type: "alert",
          title: "Test",
          message: "Hello",
          borderRadius: 8,
          overflow: "visible",
        },
        {
          contentDeps: [sharedData, "static"],
          titleDeps: [new Date("2023-01-01"), 42],
          statusBarDeps: [],
          footerDeps: [true, { visible: false }],
          actionsDeps: [[1, 2, 3], [sharedData.user], []],
        },
      );

      const config2 = createDialogConfig(
        {
          type: "alert",
          title: "Test",
          message: "Hello",
          borderRadius: 8,
          overflow: "visible",
        },
        {
          contentDeps: [
            { user: { name: "John", preferences: { theme: "dark" } }, items: [1, 2, { id: 3, name: "item" }] },
            "static",
          ],
          titleDeps: [new Date("2023-01-01"), 42],
          statusBarDeps: [],
          footerDeps: [true, { visible: false }],
          actionsDeps: [[1, 2, 3], [{ name: "John", preferences: { theme: "dark" } }], []],
        },
      );

      expect(shouldDialogUpdate(config1, config2)).toBe(false);
    });

    it("should handle React component props changes", () => {
      const Component = () => null;

      const config1 = createDialogConfig({
        type: "custom",
        message: Component,
        props: {
          user: { id: 1, name: "John" },
          settings: { theme: "dark" },
          onSave: () => {},
        },
      } as any);

      const config2 = createDialogConfig({
        type: "custom",
        message: Component, // Same component
        props: {
          user: { id: 1, name: "Jane" }, // Different user name
          settings: { theme: "dark" }, // Same settings
          onSave: (config1 as import("../../types").CustomDialogConfig).props?.onSave, // Same function reference
        },
      } as any);

      expect(shouldDialogUpdate(config1, config2)).toBe(true);
    });

    it("should handle performance with large dependency arrays", () => {
      // Create large dependency arrays
      const largeDeps1 = Array.from({ length: 1000 }, (_, i) => ({ id: i, value: `item${i}` }));
      const largeDeps2 = Array.from({ length: 1000 }, (_, i) => ({ id: i, value: `item${i}` }));

      const config1 = createDialogConfig(
        {},
        {
          contentDeps: largeDeps1,
        },
      );

      const config2 = createDialogConfig(
        {},
        {
          contentDeps: largeDeps2,
        },
      );

      const start = performance.now();
      const result = shouldDialogUpdate(config1, config2);
      const end = performance.now();

      expect(result).toBe(false);
      expect(end - start).toBeLessThan(100); // Should complete within 100ms
    });
  });

  describe("edge cases", () => {
    it("should handle same reference configs", () => {
      const config = createDialogConfig({}, { contentDeps: [1, 2, 3] });

      expect(shouldDialogUpdate(config, config)).toBe(false);
    });

    it("should handle configs with null/undefined values", () => {
      const config1 = createDialogConfig(
        {
          type: "alert",
          title: null,
          message: undefined,
        },
        {
          contentDeps: [null, undefined],
        },
      );

      const config2 = createDialogConfig(
        {
          type: "alert",
          title: null,
          message: undefined,
        },
        {
          contentDeps: [null, undefined],
        },
      );

      expect(shouldDialogUpdate(config1, config2)).toBe(false);
    });

    it("should handle empty dependency arrays", () => {
      const config1 = createDialogConfig(
        {},
        {
          contentDeps: [],
          titleDeps: [],
          statusBarDeps: [],
          footerDeps: [],
          actionsDeps: [],
        },
      );

      const config2 = createDialogConfig(
        {},
        {
          contentDeps: [],
          titleDeps: [],
          statusBarDeps: [],
          footerDeps: [],
          actionsDeps: [],
        },
      );

      expect(shouldDialogUpdate(config1, config2)).toBe(false);
    });

    it("should handle mixed empty and populated deps", () => {
      const config1 = createDialogConfig(
        {},
        {
          contentDeps: [1, 2, 3],
          titleDeps: [],
          actionsDeps: [[], [1, 2]],
        },
      );

      const config2 = createDialogConfig(
        {},
        {
          contentDeps: [1, 2, 3],
          titleDeps: [],
          actionsDeps: [[], [1, 2]],
        },
      );

      expect(shouldDialogUpdate(config1, config2)).toBe(false);
    });
  });
});

describe("getActiveDialogKey", () => {
  it("should return null for empty dialog array", () => {
    expect(getActiveDialogKey([])).toBe(null);
  });

  it("should return the only dialog ID for single dialog", () => {
    const dialogs = [createDialogState("test-dialog")];

    expect(getActiveDialogKey(dialogs)).toBe("test-dialog");
  });

  it("should return the last (topmost) dialog ID for multiple dialogs", () => {
    const dialogs = [
      createDialogState("first-dialog"),
      createDialogState("second-dialog"),
      createDialogState("third-dialog"),
    ];

    expect(getActiveDialogKey(dialogs)).toBe("third-dialog");
  });

  it("should handle dialogs with complex IDs", () => {
    const dialogs = [createDialogState("dialog-12345-abc"), createDialogState("custom-dialog-with-long-name")];

    expect(getActiveDialogKey(dialogs)).toBe("custom-dialog-with-long-name");
  });
});
