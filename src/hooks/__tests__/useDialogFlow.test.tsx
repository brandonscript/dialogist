import { act, renderHook } from "@testing-library/react";
import type { DialogCloseEvent } from "../../types/callbacks";
import { useDialog } from "../../useDialog";
import { useDialogFlow } from "../useDialogFlow";

jest.mock("../../useDialog", () => ({
  useDialog: jest.fn(),
}));

const mockUseDialog = useDialog as jest.MockedFunction<typeof useDialog>;

const actionEvent = (resolveValue: unknown): DialogCloseEvent => ({
  dialogKey: "k",
  reason: "action",
  ok: true,
  cancelled: false,
  resolveValue,
});

type FlowActionLike = { props?: { disabled?: boolean }; resolveValue?: unknown; children?: string };

const isNextFlowAction = (a: FlowActionLike) =>
  typeof a.resolveValue === "object" &&
  a.resolveValue !== null &&
  "__flowAction" in a.resolveValue &&
  (a.resolveValue as { __flowAction: string }).__flowAction === "next";

const isCancelFlowAction = (a: FlowActionLike) =>
  typeof a.resolveValue === "object" &&
  a.resolveValue !== null &&
  "__flowAction" in a.resolveValue &&
  (a.resolveValue as { __flowAction: string }).__flowAction === "cancel";

/** useDialogFlow always emits grouped actions `[left, right]`; flatten for label / order assertions. */
const flattenFlowActions = (actions: unknown): FlowActionLike[] => {
  if (!Array.isArray(actions) || actions.length === 0) return [];
  const first = actions[0];
  if (Array.isArray(first)) return (actions as FlowActionLike[][]).flat();
  return actions as FlowActionLike[];
};

describe("useDialogFlow", () => {
  let mockOpen: jest.Mock;
  let mockReplace: jest.Mock;
  let mockClose: jest.Mock;

  beforeEach(() => {
    mockOpen = jest.fn();
    mockReplace = jest.fn();
    mockClose = jest.fn();
    mockUseDialog.mockReturnValue({
      open: mockOpen,
      replace: mockReplace,
      close: mockClose,
    } as unknown as ReturnType<typeof useDialog>);
  });

  it("throws when the initial step is missing", async () => {
    const { result } = renderHook(() => useDialogFlow(["flow", "x"], { steps: {} }));

    await expect(result.current.start("missing")).rejects.toThrow('Step "missing" not found');
  });

  it("navigates forward using string next", async () => {
    mockOpen.mockResolvedValueOnce(actionEvent({ __flowAction: "next", step: "step-2" }));
    mockReplace.mockResolvedValueOnce(actionEvent({ __flowAction: "next", step: "end" }));

    const { result } = renderHook(() =>
      useDialogFlow(["flow", "placeholder"], {
        steps: {
          "step-1": { title: "One", next: "step-2" },
          "step-2": { title: "Two" },
        },
      }),
    );

    await act(async () => {
      await result.current.start("step-1");
    });

    expect(mockOpen).toHaveBeenCalledWith(
      expect.objectContaining({
        dialogKey: ["flow", "placeholder", "step-1"],
        type: "custom",
      }),
    );
    expect(mockReplace).toHaveBeenCalledWith(expect.objectContaining({ dialogKey: ["flow", "placeholder", "step-2"] }));
  });

  it("passes defaults maxWidth, minWidth, and width through to open", async () => {
    mockOpen.mockResolvedValueOnce(actionEvent({ __flowAction: "next", step: "end" }));

    const { result } = renderHook(() =>
      useDialogFlow("flow-root", {
        defaults: { maxWidth: 400, minWidth: 300, width: "min(100%, 520px)" },
        steps: { only: { title: "T" } },
      }),
    );

    await act(async () => {
      await result.current.start("only");
    });

    expect(mockOpen).toHaveBeenCalledWith(
      expect.objectContaining({
        maxWidth: 400,
        minWidth: 300,
        width: "min(100%, 520px)",
      }),
    );
  });

  it("lets step maxWidth, minWidth, and width override defaults", async () => {
    mockOpen.mockResolvedValueOnce(actionEvent({ __flowAction: "next", step: "end" }));

    const { result } = renderHook(() =>
      useDialogFlow("flow-root", {
        defaults: { maxWidth: 400, minWidth: 300, width: 200 },
        steps: {
          only: { title: "T", maxWidth: 500, minWidth: 280, width: "100%" },
        },
      }),
    );

    await act(async () => {
      await result.current.start("only");
    });

    expect(mockOpen).toHaveBeenCalledWith(
      expect.objectContaining({
        maxWidth: 500,
        minWidth: 280,
        width: "100%",
      }),
    );
  });

  it("always groups Cancel/Back vs step+Next and merges defaults.actionsStyle with step.actionsStyle", async () => {
    mockOpen.mockResolvedValueOnce(actionEvent({ __flowAction: "next", step: "end" }));

    const { result } = renderHook(() =>
      useDialogFlow("f", {
        defaults: {
          cancel: { show: "always" },
          actionsStyle: { gap: 3, intraGroupGap: 1, align: "center" },
        },
        steps: {
          only: { title: "T", actionsStyle: { gap: 4 } },
        },
      }),
    );

    await act(async () => {
      await result.current.start("only");
    });

    const cfg = mockOpen.mock.calls[0][0] as {
      actions?: unknown;
      actionsStyle?: { gap?: number; intraGroupGap?: number; align?: string };
    };
    expect(cfg.actionsStyle).toEqual({ gap: 4, intraGroupGap: 1, align: "center" });
    expect(Array.isArray(cfg.actions)).toBe(true);
    expect((cfg.actions as unknown[][]).length).toBe(2);
    const left = (cfg.actions as unknown[][])[0] as FlowActionLike[];
    const right = (cfg.actions as unknown[][])[1] as FlowActionLike[];
    expect(left.some((a) => isCancelFlowAction(a))).toBe(true);
    expect(left.some((a) => a.children === "Back")).toBe(true);
    expect(right.some((a) => isNextFlowAction(a))).toBe(true);
  });

  it("sets disabled on next when canProceed returns false", async () => {
    mockOpen.mockResolvedValueOnce(actionEvent({ __flowAction: "next", step: "end" }));

    const { result } = renderHook(() =>
      useDialogFlow(["a", "b"], {
        steps: {
          only: {
            title: "T",
            next: { step: "end", label: "Finish", canProceed: () => false },
          },
        },
      }),
    );

    await act(async () => {
      await result.current.start("only");
    });

    const cfg = mockOpen.mock.calls[0][0] as { actions?: unknown };
    const actions = flattenFlowActions(cfg.actions);
    const finishBtn = actions.filter((a) => isNextFlowAction(a)).pop();
    expect(finishBtn?.props?.disabled).toBe(true);
  });

  it("builds multiple next buttons from array next", async () => {
    mockOpen.mockResolvedValueOnce(actionEvent({ __flowAction: "next", step: "b" }));
    mockReplace.mockResolvedValueOnce(actionEvent({ __flowAction: "next", step: "end" }));

    const { result } = renderHook(() =>
      useDialogFlow(["a", "b"], {
        steps: {
          branch: {
            title: "Branch",
            next: [
              { step: "a", label: "A" },
              { step: "b", label: "B" },
            ],
          },
          a: { title: "A" },
          b: { title: "B" },
        },
      }),
    );

    await act(async () => {
      await result.current.start("branch");
    });

    const cfg = mockOpen.mock.calls[0][0] as { actions?: unknown };
    const labels = flattenFlowActions(cfg.actions).map((a) => a.children);
    expect(labels).toContain("A");
    expect(labels).toContain("B");
  });

  it("calls dialog.replace with prev step config for back navigation", async () => {
    mockOpen.mockResolvedValueOnce(actionEvent({ __flowAction: "next", step: "step-2" }));
    mockReplace
      .mockResolvedValueOnce(actionEvent({ __flowAction: "back" })) // step-2: user clicks Back
      .mockResolvedValueOnce(actionEvent({ __flowAction: "next", step: "end" })); // step-1 restored: user finishes

    const { result } = renderHook(() =>
      useDialogFlow(["flow", "p"], {
        steps: {
          "step-1": { title: "One", next: "step-2" },
          "step-2": { title: "Two" },
        },
      }),
    );

    await act(async () => {
      await result.current.start("step-1");
    });

    expect(mockReplace).toHaveBeenCalledWith(expect.objectContaining({ dialogKey: ["flow", "p", "step-1"] }));
  });

  it("uses resolveStep to override default next target", async () => {
    mockOpen.mockResolvedValueOnce(actionEvent({ __flowAction: "next", step: "step-2" }));
    mockReplace
      .mockResolvedValueOnce(actionEvent({ __flowAction: "next", step: "end" })) // step-2 resolveStep → step-3
      .mockResolvedValueOnce(actionEvent({ __flowAction: "next", step: "end" })); // step-3 ends

    const resolveStep = jest.fn().mockReturnValue("step-3");

    const { result } = renderHook(() =>
      useDialogFlow(["flow", "p"], {
        steps: {
          "step-1": { title: "One", next: "step-2" },
          "step-2": { title: "Two", resolveStep },
          "step-3": { title: "Three" },
        },
      }),
    );

    await act(async () => {
      await result.current.start("step-1");
    });

    expect(resolveStep).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith(expect.objectContaining({ dialogKey: ["flow", "p", "step-3"] }));
  });

  it("passes reason=next to resolveStep for intermediate next actions", async () => {
    mockOpen.mockResolvedValueOnce(actionEvent({ __flowAction: "next", step: "step-2" }));
    mockReplace.mockResolvedValueOnce(actionEvent({ __flowAction: "next", step: "end" }));

    const resolveStep = jest.fn().mockReturnValue(undefined);

    const { result } = renderHook(() =>
      useDialogFlow(["flow", "p"], {
        steps: {
          "step-1": { title: "One", next: "step-2", resolveStep },
          "step-2": { title: "Two" },
        },
      }),
    );

    await act(async () => {
      await result.current.start("step-1");
    });

    expect(resolveStep).toHaveBeenCalledWith(expect.objectContaining({ reason: "next" }));
  });

  it("passes reason=end to resolveStep for terminal actions", async () => {
    mockOpen.mockResolvedValueOnce(actionEvent({ __flowAction: "next", step: "end" }));

    const resolveStep = jest.fn().mockReturnValue(undefined);

    const { result } = renderHook(() =>
      useDialogFlow(["flow", "p"], {
        steps: {
          only: { title: "One", resolveStep },
        },
      }),
    );

    await act(async () => {
      await result.current.start("only");
    });

    expect(resolveStep).toHaveBeenCalledWith(expect.objectContaining({ reason: "end" }));
  });

  it("passes reason=back to resolveStep for Back actions", async () => {
    mockOpen.mockResolvedValueOnce(actionEvent({ __flowAction: "next", step: "step-2" }));
    mockReplace
      .mockResolvedValueOnce(actionEvent({ __flowAction: "back" })) // step-2 Back
      .mockResolvedValueOnce(actionEvent({ __flowAction: "next", step: "end" })); // step-1 restored

    const resolveStep = jest.fn().mockReturnValue(undefined);

    const { result } = renderHook(() =>
      useDialogFlow(["flow", "p"], {
        steps: {
          "step-1": { title: "One", next: "step-2" },
          "step-2": { title: "Two", resolveStep },
        },
      }),
    );

    await act(async () => {
      await result.current.start("step-1");
    });

    expect(resolveStep).toHaveBeenCalledWith(expect.objectContaining({ reason: "back" }));
  });

  it("passes reason=cancel to resolveStep for Cancel actions", async () => {
    mockOpen.mockResolvedValueOnce(actionEvent({ __flowAction: "cancel" }));

    const resolveStep = jest.fn().mockReturnValue(undefined);

    const { result } = renderHook(() =>
      useDialogFlow(["flow", "p"], {
        defaults: { cancel: { show: "always" } },
        steps: {
          only: { title: "One", resolveStep },
        },
      }),
    );

    await act(async () => {
      await result.current.start("only");
    });

    expect(resolveStep).toHaveBeenCalledWith(expect.objectContaining({ reason: "cancel" }));
  });

  it("resolveStep can intercept cancel and navigate to a step", async () => {
    mockOpen.mockResolvedValueOnce(actionEvent({ __flowAction: "cancel" }));
    mockReplace.mockResolvedValueOnce(actionEvent({ __flowAction: "next", step: "end" }));

    const { result } = renderHook(() =>
      useDialogFlow(["flow", "p"], {
        defaults: { cancel: { show: "always" } },
        steps: {
          "step-1": {
            title: "One",
            resolveStep: ({ reason }) => (reason === "cancel" ? "step-2" : undefined),
          },
          "step-2": { title: "Two" },
        },
      }),
    );

    await act(async () => {
      await result.current.start("step-1");
    });

    expect(mockReplace).toHaveBeenCalledWith(expect.objectContaining({ dialogKey: ["flow", "p", "step-2"] }));
  });

  it("restarts when resolveStep returns start", async () => {
    mockOpen.mockResolvedValueOnce(actionEvent({ __flowAction: "next", step: "step-2" }));
    mockReplace
      .mockResolvedValueOnce(actionEvent({ __flowAction: "next", step: "end" })) // step-2: resolveStep → "start"
      .mockResolvedValueOnce(actionEvent({ __flowAction: "next", step: "end" })); // restarted step-1: ends

    const { result } = renderHook(() =>
      useDialogFlow(["flow", "p"], {
        steps: {
          "step-1": { title: "One", next: "step-2" },
          "step-2": {
            title: "Two",
            resolveStep: () => "start",
          },
        },
      }),
    );

    await act(async () => {
      await result.current.start("step-1");
    });

    expect(mockReplace).toHaveBeenCalledWith(expect.objectContaining({ dialogKey: ["flow", "p", "step-1"] }));
  });

  describe("lifecycle hooks", () => {
    it("calls step onCancel when Cancel is clicked", async () => {
      const onCancel = jest.fn();
      mockOpen.mockResolvedValueOnce(actionEvent({ __flowAction: "cancel" }));

      const { result } = renderHook(() =>
        useDialogFlow(["f", "p"], {
          defaults: { cancel: { show: "always" } },
          steps: {
            "step-1": { title: "One", next: "step-2", onCancel },
          },
        }),
      );

      await act(async () => {
        await result.current.start("step-1");
      });

      expect(onCancel).toHaveBeenCalledWith(expect.objectContaining({ step: "step-1" }));
    });

    it("calls defaults.onCancel for every step cancel (global analytics)", async () => {
      const globalOnCancel = jest.fn();
      mockOpen.mockResolvedValueOnce(actionEvent({ __flowAction: "cancel" }));

      const { result } = renderHook(() =>
        useDialogFlow(["f", "p"], {
          defaults: {
            cancel: { show: "always" },
            onCancel: globalOnCancel,
          },
          steps: {
            only: { title: "One" },
          },
        }),
      );

      await act(async () => {
        await result.current.start("only");
      });

      expect(globalOnCancel).toHaveBeenCalledWith(expect.objectContaining({ step: "only" }));
    });

    it("calls step onCancel before defaults.onCancel", async () => {
      const callOrder: string[] = [];
      mockOpen.mockResolvedValueOnce(actionEvent({ __flowAction: "cancel" }));

      const { result } = renderHook(() =>
        useDialogFlow(["f", "p"], {
          defaults: {
            cancel: { show: "always" },
            onCancel: () => callOrder.push("global"),
          },
          steps: {
            only: {
              title: "One",
              onCancel: () => callOrder.push("step"),
            },
          },
        }),
      );

      await act(async () => {
        await result.current.start("only");
      });

      expect(callOrder).toEqual(["step", "global"]);
    });

    it("calls step onBack when Back is clicked", async () => {
      const onBack = jest.fn();
      mockOpen.mockResolvedValueOnce(actionEvent({ __flowAction: "next", step: "step-2" }));
      mockReplace
        .mockResolvedValueOnce(actionEvent({ __flowAction: "back" })) // step-2: Back
        .mockResolvedValueOnce(actionEvent({ __flowAction: "next", step: "end" })); // step-1: end

      const { result } = renderHook(() =>
        useDialogFlow(["f", "p"], {
          steps: {
            "step-1": { title: "One", next: "step-2" },
            "step-2": { title: "Two", onBack },
          },
        }),
      );

      await act(async () => {
        await result.current.start("step-1");
      });

      expect(onBack).toHaveBeenCalledWith(expect.objectContaining({ step: "step-2" }));
    });

    it("calls defaults.onBack for every step back navigation", async () => {
      const globalOnBack = jest.fn();
      mockOpen.mockResolvedValueOnce(actionEvent({ __flowAction: "next", step: "step-2" }));
      mockReplace
        .mockResolvedValueOnce(actionEvent({ __flowAction: "back" })) // step-2: Back
        .mockResolvedValueOnce(actionEvent({ __flowAction: "next", step: "end" })); // step-1: end

      const { result } = renderHook(() =>
        useDialogFlow(["f", "p"], {
          defaults: { onBack: globalOnBack },
          steps: {
            "step-1": { title: "One", next: "step-2" },
            "step-2": { title: "Two" },
          },
        }),
      );

      await act(async () => {
        await result.current.start("step-1");
      });

      expect(globalOnBack).toHaveBeenCalledWith(expect.objectContaining({ step: "step-2" }));
    });

    it("calls step onEnd when finishing the flow", async () => {
      const onEnd = jest.fn();
      mockOpen.mockResolvedValueOnce(actionEvent({ __flowAction: "next", step: "end" }));

      const { result } = renderHook(() =>
        useDialogFlow(["f", "p"], {
          steps: {
            only: { title: "One", onEnd },
          },
        }),
      );

      await act(async () => {
        await result.current.start("only");
      });

      expect(onEnd).toHaveBeenCalledWith(expect.objectContaining({ step: "only" }));
    });

    it("calls step onNext when navigating forward to another step", async () => {
      const onNext = jest.fn();
      mockOpen.mockResolvedValueOnce(actionEvent({ __flowAction: "next", step: "step-2" }));
      mockReplace.mockResolvedValueOnce(actionEvent({ __flowAction: "next", step: "end" }));

      const { result } = renderHook(() =>
        useDialogFlow(["f", "p"], {
          steps: {
            "step-1": { title: "One", next: "step-2", onNext },
            "step-2": { title: "Two" },
          },
        }),
      );

      await act(async () => {
        await result.current.start("step-1");
      });

      expect(onNext).toHaveBeenCalledWith(expect.objectContaining({ step: "step-1" }));
    });

    it("calls defaults.onNext when navigating forward to another step", async () => {
      const globalOnNext = jest.fn();
      mockOpen.mockResolvedValueOnce(actionEvent({ __flowAction: "next", step: "step-2" }));
      mockReplace.mockResolvedValueOnce(actionEvent({ __flowAction: "next", step: "end" }));

      const { result } = renderHook(() =>
        useDialogFlow(["f", "p"], {
          defaults: { onNext: globalOnNext },
          steps: {
            "step-1": { title: "One", next: "step-2" },
            "step-2": { title: "Two" },
          },
        }),
      );

      await act(async () => {
        await result.current.start("step-1");
      });

      expect(globalOnNext).toHaveBeenCalledTimes(1);
      expect(globalOnNext).toHaveBeenCalledWith(expect.objectContaining({ step: "step-1" }));
    });

    it("calls defaults.onEnd only when the flow finishes", async () => {
      const globalOnEnd = jest.fn();
      mockOpen.mockResolvedValueOnce(actionEvent({ __flowAction: "next", step: "step-2" }));
      mockReplace.mockResolvedValueOnce(actionEvent({ __flowAction: "next", step: "end" }));

      const { result } = renderHook(() =>
        useDialogFlow(["f", "p"], {
          defaults: { onEnd: globalOnEnd },
          steps: {
            "step-1": { title: "One", next: "step-2" },
            "step-2": { title: "Two" },
          },
        }),
      );

      await act(async () => {
        await result.current.start("step-1");
      });

      expect(globalOnEnd).toHaveBeenCalledTimes(1);
      expect(globalOnEnd).toHaveBeenCalledWith(expect.objectContaining({ step: "step-2" }));
    });

    it("sets prevStep to the backed-out step when closing after back navigation", async () => {
      const onEnd = jest.fn();
      mockOpen.mockResolvedValueOnce(actionEvent({ __flowAction: "next", step: "step-2" }));
      mockReplace
        .mockResolvedValueOnce(actionEvent({ __flowAction: "back" })) // step-2: Back
        .mockResolvedValueOnce(actionEvent({ __flowAction: "next", step: "end" })); // step-1: Finish

      const { result } = renderHook(() =>
        useDialogFlow(["f", "p"], {
          steps: {
            "step-1": { title: "One", next: "step-2", onEnd },
            "step-2": { title: "Two" },
          },
        }),
      );

      await act(async () => {
        await result.current.start("step-1");
      });

      // step-1 closes after having backed out of step-2 — prevStep should be "step-2"
      expect(onEnd).toHaveBeenCalledWith(expect.objectContaining({ step: "step-1", prevStep: "step-2" }));
    });

    it("passes prevStep in lifecycle event", async () => {
      const onEnd = jest.fn();
      mockOpen.mockResolvedValueOnce(actionEvent({ __flowAction: "next", step: "step-2" }));
      mockReplace.mockResolvedValueOnce(actionEvent({ __flowAction: "next", step: "end" }));

      const { result } = renderHook(() =>
        useDialogFlow(["f", "p"], {
          steps: {
            "step-1": { title: "One", next: "step-2" },
            "step-2": { title: "Two", onEnd },
          },
        }),
      );

      await act(async () => {
        await result.current.start("step-1");
      });

      expect(onEnd).toHaveBeenCalledWith(expect.objectContaining({ step: "step-2", prevStep: "step-1" }));
    });
  });

  describe("defaults.onStep global hook", () => {
    it("calls defaults.onStep on every step transition with the reason", async () => {
      const globalOnStep = jest.fn();
      mockOpen.mockResolvedValueOnce(actionEvent({ __flowAction: "next", step: "step-2" }));
      mockReplace.mockResolvedValueOnce(actionEvent({ __flowAction: "next", step: "end" }));

      const { result } = renderHook(() =>
        useDialogFlow(["flow", "p"], {
          defaults: { onStep: globalOnStep },
          steps: {
            "step-1": { title: "One", next: "step-2" },
            "step-2": { title: "Two" },
          },
        }),
      );

      await act(async () => {
        await result.current.start("step-1");
      });

      expect(globalOnStep).toHaveBeenCalledTimes(2);
      expect(globalOnStep).toHaveBeenCalledWith(expect.objectContaining({ step: "step-1", reason: "next" }));
      expect(globalOnStep).toHaveBeenCalledWith(expect.objectContaining({ step: "step-2", reason: "end" }));
    });

    it("calls defaults.onStep with reason=cancel on cancel", async () => {
      const globalOnStep = jest.fn();
      mockOpen.mockResolvedValueOnce(actionEvent({ __flowAction: "cancel" }));

      const { result } = renderHook(() =>
        useDialogFlow(["flow", "p"], {
          defaults: { cancel: { show: "always" }, onStep: globalOnStep },
          steps: {
            only: { title: "One" },
          },
        }),
      );

      await act(async () => {
        await result.current.start("only");
      });

      expect(globalOnStep).toHaveBeenCalledWith(expect.objectContaining({ reason: "cancel" }));
    });
  });

  describe("cancel button visibility", () => {
    it("omits cancel when defaults.cancel.show does not include the step", async () => {
      mockOpen.mockResolvedValueOnce(actionEvent({ __flowAction: "next", step: "end" }));

      const { result } = renderHook(() =>
        useDialogFlow(["f", "p"], {
          defaults: { cancel: { show: ["other"] } },
          steps: {
            only: { title: "T" },
          },
        }),
      );

      await act(async () => {
        await result.current.start("only");
      });

      const cfg = mockOpen.mock.calls[0][0] as { actions?: unknown };
      const cancelActions = flattenFlowActions(cfg.actions).filter((a) => isCancelFlowAction(a));
      expect(cancelActions).toHaveLength(0);
    });

    it("sorts cancel after back when cancel.order is greater than back", async () => {
      mockOpen.mockResolvedValueOnce(actionEvent({ __flowAction: "next", step: "step-2" }));
      mockReplace.mockResolvedValueOnce(actionEvent({ __flowAction: "next", step: "end" }));

      const { result } = renderHook(() =>
        useDialogFlow(["a", "b"], {
          defaults: {
            cancel: { show: "always", order: 5 },
          },
          steps: {
            "step-1": { title: "One", next: "step-2" },
            "step-2": { title: "Two" },
          },
        }),
      );

      await act(async () => {
        await result.current.start("step-1");
      });

      const step2Config = mockReplace.mock.calls[0][0] as { actions?: unknown };
      const actions = flattenFlowActions(step2Config.actions);
      const labels = actions.map((a) => a.children);
      const backIdx = labels.indexOf("Back");
      const cancelIdx = labels.indexOf("Cancel");
      expect(backIdx).toBeGreaterThanOrEqual(0);
      expect(cancelIdx).toBeGreaterThanOrEqual(0);
      expect(backIdx).toBeLessThan(cancelIdx);
    });
  });

  describe("non-action close treated as cancel", () => {
    it("treats backdrop close as cancel", async () => {
      const onCancel = jest.fn();
      mockOpen.mockResolvedValueOnce({
        dialogKey: "k",
        reason: "backdrop",
        ok: false,
        cancelled: true,
      });

      const { result } = renderHook(() =>
        useDialogFlow(["f", "p"], {
          steps: {
            only: { title: "T", onCancel },
          },
        }),
      );

      await act(async () => {
        await result.current.start("only");
      });

      expect(onCancel).toHaveBeenCalled();
    });

    it("treats escape close as cancel", async () => {
      const onCancel = jest.fn();
      mockOpen.mockResolvedValueOnce({
        dialogKey: "k",
        reason: "escape",
        ok: false,
        cancelled: true,
      });

      const { result } = renderHook(() =>
        useDialogFlow(["f", "p"], {
          steps: {
            only: { title: "T", onCancel },
          },
        }),
      );

      await act(async () => {
        await result.current.start("only");
      });

      expect(onCancel).toHaveBeenCalled();
    });

    it("passes reason=cancel to resolveStep for backdrop close", async () => {
      const resolveStep = jest.fn().mockReturnValue(undefined);
      mockOpen.mockResolvedValueOnce({
        dialogKey: "k",
        reason: "backdrop",
        ok: false,
        cancelled: true,
      });

      const { result } = renderHook(() =>
        useDialogFlow(["f", "p"], {
          steps: {
            only: { title: "T", resolveStep },
          },
        }),
      );

      await act(async () => {
        await result.current.start("only");
      });

      expect(resolveStep).toHaveBeenCalledWith(expect.objectContaining({ reason: "cancel" }));
    });
  });
});
