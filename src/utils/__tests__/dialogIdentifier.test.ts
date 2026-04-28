import { resolveDialogKey } from "../dialogKey";

describe("resolveDialogKey", () => {
  it("normalizes a string key", () => {
    expect(resolveDialogKey("my-dialog")).toEqual({
      parts: ["my-dialog"],
      str: "my-dialog",
    });
  });

  it("normalizes a numeric key", () => {
    expect(resolveDialogKey(123)).toEqual({
      parts: ["123"],
      str: "123",
    });
  });

  it("normalizes an array key using the '::' delimiter", () => {
    expect(resolveDialogKey(["a", 1, "b"])).toEqual({
      parts: ["a", "1", "b"],
      str: "a::1::b",
    });
  });

  it("throws on an empty array key", () => {
    expect(() => resolveDialogKey([] as any)).toThrow("[Dialogist] dialogKey is required.");
  });

  it("throws when a segment contains the delimiter", () => {
    expect(() => resolveDialogKey(["a::b"])).toThrow('[Dialogist] dialogKey segments cannot contain "::".');
  });
});
