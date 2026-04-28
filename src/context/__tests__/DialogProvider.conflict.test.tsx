import { act, renderHook, waitFor } from "@testing-library/react";
import { type ReactNode, useContext } from "react";
import type { BaseDialogConfig } from "../../types";
import { useDialog } from "../../useDialog";
import { DialogProvider } from "../DialogProvider";
import { DialogStateContext } from "../DialogStateContext";

const wrapper = ({ children }: { children: ReactNode }) => <DialogProvider>{children}</DialogProvider>;

type ProviderConflictOptions = {
  onConflict?: BaseDialogConfig["onConflict"];
  throwOnConflict?: boolean;
};

const createWrapper =
  (options?: ProviderConflictOptions) =>
  ({ children }: { children: ReactNode }) => (
    <DialogProvider onConflict={options?.onConflict} throwOnConflict={options?.throwOnConflict}>
      {children}
    </DialogProvider>
  );

describe("DialogProvider conflict handling", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("defaults type to custom when unspecified", async () => {
    const { result } = renderHook(
      () => {
        const dialog = useDialog("default-type-dialog");
        const state = useContext(DialogStateContext);
        return { dialog, state };
      },
      { wrapper },
    );

    await act(async () => {
      result.current.dialog.open({ message: "Hello", actions: [{ id: "close", title: "Close" }] });
    });

    await waitFor(() => {
      expect(result.current.state?.dialogs).toHaveLength(1);
    });
    expect(result.current.state?.dialogs?.[0].type).toBe("custom");
  });

  it("maps content to message for custom dialogs", async () => {
    const { result } = renderHook(
      () => {
        const dialog = useDialog("content-alias-dialog");
        const state = useContext(DialogStateContext);
        return { dialog, state };
      },
      { wrapper },
    );

    await act(async () => {
      result.current.dialog.open({ content: "body-via-content", actions: [{ id: "close", title: "Close" }] });
    });

    await waitFor(() => {
      expect(result.current.state?.dialogs).toHaveLength(1);
    });
    expect(result.current.state?.dialogs?.[0].config.message).toBe("body-via-content");
    expect("content" in (result.current.state?.dialogs?.[0].config ?? {})).toBe(false);
  });

  it("prefers content over message when both are provided", async () => {
    const { result } = renderHook(
      () => {
        const dialog = useDialog("content-over-message-dialog");
        const state = useContext(DialogStateContext);
        return { dialog, state };
      },
      { wrapper },
    );

    await act(async () => {
      result.current.dialog.open({
        message: "via-message",
        content: "via-content",
        actions: [{ id: "close", title: "Close" }],
      });
    });

    await waitFor(() => {
      expect(result.current.state?.dialogs).toHaveLength(1);
    });
    expect(result.current.state?.dialogs?.[0].config.message).toBe("via-content");
  });

  it("rejects conflicting open when throwOnConflict is true", async () => {
    const { result } = renderHook(() => useDialog("conflict-id"), { wrapper });

    await act(async () => {
      result.current.open({ type: "alert", message: "Primary instance" });
    });

    await expect(
      (async () => {
        await act(async () => {
          await result.current.open({
            type: "alert",
            message: "Primary instance",
            throwOnConflict: true,
          });
        });
      })(),
    ).rejects.toThrow(/Blocked open:.*"conflict-id"/);
  });

  it("resolves with blocked event for default onConflict block", async () => {
    const consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const { result } = renderHook(() => useDialog("conflict-id"), { wrapper });

    await act(async () => {
      result.current.open({ type: "alert", message: "Primary instance" });
    });

    const conflictResultPromise = (async () => {
      let conflictResult: unknown;
      await act(async () => {
        conflictResult = await result.current.open({
          type: "alert",
          message: "Primary instance",
        });
      });
      return conflictResult;
    })();

    await expect(conflictResultPromise).resolves.toEqual(
      expect.objectContaining({ ok: false, cancelled: false, blocked: true, resolveValue: false }),
    );
    await waitFor(() => {
      expect(document.querySelectorAll('[role="dialog"]').length).toBe(1);
    });
    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("blocks parallel dialogs", async () => {
    const consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const { result } = renderHook(
      () => {
        const primary = useDialog("primary-dialog");
        const secondary = useDialog("secondary-dialog");
        const state = useContext(DialogStateContext);
        return { primary, secondary, state };
      },
      { wrapper },
    );

    await act(async () => {
      result.current.primary.open({ type: "alert", message: "Primary" });
    });

    const secondaryResultPromise = (async () => {
      let secondaryResult: unknown;
      await act(async () => {
        secondaryResult = await result.current.secondary.open({ type: "alert", message: "Secondary" });
      });
      return secondaryResult;
    })();

    await expect(secondaryResultPromise).resolves.toEqual(
      expect.objectContaining({ ok: false, cancelled: false, blocked: true, resolveValue: false }),
    );
    await waitFor(() => {
      expect(result.current.state?.dialogs).toHaveLength(1);
    });
    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("notSameKey prefers active dialog throwOnConflict over incoming", async () => {
    const { result } = renderHook(
      () => {
        const primary = useDialog("primary-chaining-incumbent");
        const secondary = useDialog("secondary-chaining-incumbent");
        const state = useContext(DialogStateContext);
        return { primary, secondary, state };
      },
      { wrapper },
    );

    await act(async () => {
      result.current.primary.open({
        type: "alert",
        message: "Primary",
        onConflict: "block",
        throwOnConflict: false,
      });
    });

    await waitFor(() => {
      expect(result.current.state?.dialogs).toHaveLength(1);
    });

    const secondaryResultPromise = (async () => {
      let secondaryResult: unknown;
      await act(async () => {
        secondaryResult = await result.current.secondary.open({
          type: "alert",
          message: "Secondary",
          throwOnConflict: true,
        });
      });
      return secondaryResult;
    })();

    await expect(secondaryResultPromise).resolves.toEqual(
      expect.objectContaining({ ok: false, cancelled: false, blocked: true, resolveValue: false }),
    );
    await waitFor(() => {
      expect(result.current.state?.dialogs).toHaveLength(1);
    });
  });

  it("sameKey uses incoming throwOnConflict when active omits it", async () => {
    const { result } = renderHook(() => useDialog("same-key-precedence"), { wrapper });

    await act(async () => {
      result.current.open({ type: "alert", message: "Same", onConflict: "block" });
    });

    await expect(
      (async () => {
        await act(async () => {
          await result.current.open({
            type: "alert",
            message: "Same",
            throwOnConflict: true,
          });
        });
      })(),
    ).rejects.toThrow(/Blocked open:.*"same-key-precedence"/);
  });

  it("normalizes array-based ids and prevents conflicting opens", async () => {
    const consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const { result } = renderHook(
      () => {
        const dialog = useDialog(["array", "dialog"]);
        const state = useContext(DialogStateContext);
        return { dialog, state };
      },
      { wrapper },
    );

    await act(async () => {
      result.current.dialog.open({ type: "alert", message: "Primary" });
    });

    const conflictResultPromise = (async () => {
      let conflictResult: unknown;
      await act(async () => {
        conflictResult = await result.current.dialog.open({ type: "alert", message: "Primary" });
      });
      return conflictResult;
    })();

    await expect(conflictResultPromise).resolves.toEqual(
      expect.objectContaining({ ok: false, cancelled: false, blocked: true, resolveValue: false }),
    );
    expect(consoleSpy).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(result.current.state?.dialogs).toHaveLength(1);
    });
    const activeDialog = result.current.state?.dialogs?.[0];
    expect(activeDialog?.key).toBe("array::dialog");
    expect(activeDialog?.keySegments).toEqual(["array", "dialog"]);
    expect(activeDialog?.config.dialogKey).toEqual(["array", "dialog"]);
    consoleSpy.mockRestore();
  });

  it("default provider onConflict blocks unchanged re-open without console warning", async () => {
    const consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const policyWrapper = createWrapper();
    const { result } = renderHook(() => useDialog("conflict-id"), { wrapper: policyWrapper });

    await act(async () => {
      result.current.open({ type: "alert", message: "Primary instance" });
    });

    let conflictResult: unknown;
    await act(async () => {
      conflictResult = await result.current.open({ type: "alert", message: "Primary instance" });
    });
    expect(conflictResult).toEqual(
      expect.objectContaining({ ok: false, cancelled: false, blocked: true, resolveValue: false }),
    );
    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("throws when provider throwOnConflict is true", async () => {
    const policyWrapper = createWrapper({ throwOnConflict: true });
    const { result } = renderHook(() => useDialog("conflict-id"), { wrapper: policyWrapper });

    await act(async () => {
      result.current.open({ type: "alert", message: "Primary instance" });
    });

    await expect(
      (async () => {
        await act(async () => {
          await result.current.open({ type: "alert", message: "Primary instance" });
        });
      })(),
    ).rejects.toThrow(/Blocked open:.*"conflict-id"/);
  });

  it("notSameKey honors replaceAny on the active dialog and resolves the superseded open as replaced", async () => {
    const { result } = renderHook(
      () => {
        const primary = useDialog("primary-x");
        const secondary = useDialog("secondary-x");
        const state = useContext(DialogStateContext);
        return { primary, secondary, state };
      },
      { wrapper },
    );

    let primaryPromise!: Promise<unknown>;
    await act(async () => {
      primaryPromise = result.current.primary.open({
        type: "alert",
        message: "Primary",
        onConflict: "replaceAny",
      });
    });

    await waitFor(() => {
      expect(result.current.state?.dialogs).toHaveLength(1);
    });

    const internalIdBeforeReplace = result.current.state?.dialogs?.[0].internalId;

    await act(async () => {
      void result.current.secondary.open({
        type: "alert",
        message: "Secondary",
      });
    });

    await waitFor(() => {
      expect(result.current.state?.dialogs).toHaveLength(1);
      expect(result.current.state?.dialogs?.[0].key).toBe("secondary-x");
      expect(result.current.state?.dialogs?.[0].internalId).toBe(internalIdBeforeReplace);
    });

    await expect(primaryPromise).resolves.toEqual(
      expect.objectContaining({
        reason: "replace",
        ok: true,
        cancelled: false,
        resolveValue: "replaced",
      }),
    );
  });

  it("sameRoot keyRelation: replaceSameRoot preserves internalId on the active row", async () => {
    const { result } = renderHook(
      () => {
        const primary = useDialog("same-root-cross-a");
        const child = useDialog(["same-root-cross-a", "child"]);
        const state = useContext(DialogStateContext);
        return { primary, child, state };
      },
      { wrapper },
    );

    await act(async () => {
      result.current.primary.open({
        type: "alert",
        message: "Primary",
        onConflict: "replaceSameRoot",
      });
    });

    await waitFor(() => {
      expect(result.current.state?.dialogs).toHaveLength(1);
    });

    const internalIdBefore = result.current.state?.dialogs?.[0].internalId;

    await act(async () => {
      void result.current.child.open({
        type: "alert",
        message: "Child",
      });
    });

    await waitFor(() => {
      expect(result.current.state?.dialogs).toHaveLength(1);
      expect(result.current.state?.dialogs?.[0].key).toBe("same-root-cross-a::child");
      expect(result.current.state?.dialogs?.[0].internalId).toBe(internalIdBefore);
    });
  });

  it("notSameKey still throws when blocked and incoming sets throwOnConflict", async () => {
    const { result } = renderHook(
      () => {
        const primary = useDialog("primary-y");
        const secondary = useDialog("secondary-y");
        return { primary, secondary };
      },
      { wrapper },
    );

    await act(async () => {
      result.current.primary.open({ type: "alert", message: "Primary", onConflict: "block" });
    });

    await expect(
      (async () => {
        await act(async () => {
          await result.current.secondary.open({
            type: "alert",
            message: "Secondary",
            throwOnConflict: true,
          });
        });
      })(),
    ).rejects.toThrow(/Blocked open:.*"secondary-y"/);
  });

  it("sameKey uses active onConflict when the incoming open also sets onConflict", async () => {
    const { result } = renderHook(
      () => {
        const dialog = useDialog("merge-active-wins");
        const state = useContext(DialogStateContext);
        return { dialog, state };
      },
      { wrapper },
    );

    await act(async () => {
      result.current.dialog.open({ type: "alert", message: "x", onConflict: "replaceSameKey" });
    });

    await act(async () => {
      void result.current.dialog.open({ type: "alert", message: "x", onConflict: "block" });
    });

    await waitFor(() => {
      expect((result.current.state?.dialogs?.[0].config as BaseDialogConfig).onConflict).toBe("block");
    });
  });

  it("sameKey ignores incoming replaceSameKey when active omits onConflict (implicit block)", async () => {
    const { result } = renderHook(
      () => {
        const dialog = useDialog("incoming-replace-blocked");
        const state = useContext(DialogStateContext);
        return { dialog, state };
      },
      { wrapper },
    );

    await act(async () => {
      result.current.dialog.open({ type: "alert", message: "x" });
    });

    let ev: unknown;
    await act(async () => {
      ev = await result.current.dialog.open({
        type: "alert",
        message: "x",
        onConflict: "replaceSameKey",
      });
    });

    expect(ev).toEqual(expect.objectContaining({ ok: false, cancelled: false, blocked: true, resolveValue: false }));
    expect((result.current.state?.dialogs?.[0].config as BaseDialogConfig).onConflict).toBeUndefined();
  });

  it("same key does not apply a content update when conflict policy is implicit block", async () => {
    const { result } = renderHook(
      () => {
        const dialog = useDialog("same-key-diff-message");
        const state = useContext(DialogStateContext);
        return { dialog, state };
      },
      { wrapper },
    );

    await act(async () => {
      result.current.dialog.open({ type: "alert", message: "first" });
    });

    let ev: unknown;
    await act(async () => {
      ev = await result.current.dialog.open({ type: "alert", message: "second" });
    });

    expect(ev).toEqual(expect.objectContaining({ ok: false, cancelled: false, blocked: true, resolveValue: false }));
    expect((result.current.state?.dialogs?.[0].config as BaseDialogConfig).message).toBe("first");
  });

  it("sameKey keeps active block when incoming sets replaceSameKey", async () => {
    const { result } = renderHook(
      () => {
        const dialog = useDialog("merge-incoming-loses");
        const state = useContext(DialogStateContext);
        return { dialog, state };
      },
      { wrapper },
    );

    await act(async () => {
      result.current.dialog.open({ type: "alert", message: "x", onConflict: "block" });
    });

    let ev: unknown;
    await act(async () => {
      ev = await result.current.dialog.open({ type: "alert", message: "x", onConflict: "replaceSameKey" });
    });

    expect(ev).toEqual(expect.objectContaining({ ok: false, cancelled: false, blocked: true, resolveValue: false }));
    expect((result.current.state?.dialogs?.[0].config as BaseDialogConfig).onConflict).toBe("block");
  });
});
