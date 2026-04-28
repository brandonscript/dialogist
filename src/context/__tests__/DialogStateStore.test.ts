import type { DialogKeyArray, DialogState } from "../../types";
import { dialogStateStore } from "../DialogStateStore";

const mk = (key: string, parts: string[]): DialogState => ({
  key,
  keySegments: parts as unknown as DialogKeyArray,
  type: "custom",
  internalId: "test-internal",
  config: {
    type: "custom",
    message: "m",
    dialogKey: parts as unknown as DialogKeyArray,
  },
});

describe("DialogStateStore.get", () => {
  afterEach(() => {
    dialogStateStore.replaceDialogsSnapshotWithoutNotify([]);
  });

  it("returns the most recently inserted row when multiple keys share the same prefix", () => {
    dialogStateStore.setDialogs([mk("flow::1", ["flow", "1"]), mk("flow::2", ["flow", "2"])]);
    expect(dialogStateStore.get("flow")?.key).toBe("flow::2");
  });

  it("still returns an exact key match when present", () => {
    dialogStateStore.setDialogs([mk("flow::1", ["flow", "1"])]);
    expect(dialogStateStore.get("flow::1")?.key).toBe("flow::1");
  });
});
