import {
  coerceDialogKeyArray,
  dialogKeyArrayEquals,
  dialogKeyArrayToId,
  dialogKeySameRoot,
  dialogKeyStartsWith,
  ensureDialogKeyArray,
  normalizeDialogKey,
  resolveDialogKey,
} from "../dialogKey";

describe("dialogKey utilities", () => {
  it("coerces keys into arrays", () => {
    expect(coerceDialogKeyArray("alpha")).toEqual(["alpha"]);
    expect(coerceDialogKeyArray(["alpha", 2])).toEqual(["alpha", 2]);
  });

  it("normalizes keys into ids", () => {
    expect(normalizeDialogKey("alpha")).toBe("alpha");
    expect(normalizeDialogKey(["alpha", 2, "beta"])).toBe("alpha::2::beta");
    expect(normalizeDialogKey(undefined)).toBeUndefined();
  });

  it("resolves dialog key parts and id together", () => {
    expect(resolveDialogKey("alpha")).toEqual({ parts: ["alpha"], str: "alpha" });
    expect(resolveDialogKey(["alpha", 2, "beta"])).toEqual({ parts: ["alpha", "2", "beta"], str: "alpha::2::beta" });
    expect(() => resolveDialogKey(undefined as unknown as string)).toThrow("[Dialogist] dialogKey is required.");
  });

  it("canonicalizes numeric and string segments as equal keys", () => {
    const numeric = resolveDialogKey(["a", 1, "b"]);
    const stringy = resolveDialogKey(["a", "1", "b"]);

    expect(numeric.parts).toEqual(["a", "1", "b"]);
    expect(stringy.parts).toEqual(["a", "1", "b"]);
    expect(numeric.str).toBe("a::1::b");
    expect(stringy.str).toBe("a::1::b");
    expect(numeric.str).toBe(stringy.str);
  });

  it("can generate a key when missing", () => {
    const rKey = resolveDialogKey(undefined, { autogenerate: true });
    expect(rKey.parts).toHaveLength(1);
    expect(typeof rKey.parts[0]).toBe("string");
    expect(rKey.str).toBe(rKey.parts[0]);
    expect(rKey.str.startsWith("dialog-")).toBe(true);
  });

  it("creates stable array copies for dialog keys", () => {
    const key = ["alpha", 2] as const;
    const result = ensureDialogKeyArray(key);

    expect(result).toEqual(["alpha", "2"]);
    expect(result).not.toBe(key);
  });

  it("compares dialog key arrays", () => {
    expect(dialogKeyArrayEquals(["a", 1], ["a", 1])).toBe(true);
    expect(dialogKeyArrayEquals(["a", 1], ["a", "1"])).toBe(true);
    expect(dialogKeyArrayEquals(["a", 1], ["a", 2])).toBe(false);
  });

  it("joins dialog key segments into ids", () => {
    expect(dialogKeyArrayToId(["alpha", 2, "beta"])).toBe("alpha::2::beta");
  });

  it("rejects segments containing delimiter", () => {
    expect(() => resolveDialogKey(["a::b"])).toThrow('[Dialogist] dialogKey segments cannot contain "::".');
  });
});

describe("dialogKeyStartsWith", () => {
  it("returns true for an exact match", () => {
    expect(dialogKeyStartsWith("checkout-flow", "checkout-flow")).toBe(true);
  });

  it("returns true when the key has the prefix as a proper segment-aligned prefix", () => {
    expect(dialogKeyStartsWith("checkout-flow::step-1", "checkout-flow")).toBe(true);
    expect(dialogKeyStartsWith("ns::checkout-flow::step-1", "ns::checkout-flow")).toBe(true);
  });

  it("returns false when the key only shares a string prefix but not a segment boundary", () => {
    expect(dialogKeyStartsWith("checkout-flow-extra", "checkout-flow")).toBe(false);
    expect(dialogKeyStartsWith("checkout-flow-extra::step-1", "checkout-flow")).toBe(false);
  });

  it("returns false for unrelated keys", () => {
    expect(dialogKeyStartsWith("other-dialog", "checkout-flow")).toBe(false);
    expect(dialogKeyStartsWith("other-dialog::step-1", "checkout-flow")).toBe(false);
  });

  it("returns false when prefix is longer than key", () => {
    expect(dialogKeyStartsWith("checkout-flow", "checkout-flow::step-1")).toBe(false);
  });
});

describe("dialogKeySameRoot", () => {
  it("returns true when the first segment matches", () => {
    expect(dialogKeySameRoot("checkout-flow::step-1", "checkout-flow::step-2")).toBe(true);
  });

  it("returns false when only a string prefix matches", () => {
    expect(dialogKeySameRoot("checkout-flow-extra::step-1", "checkout-flow::step-1")).toBe(false);
  });
});
