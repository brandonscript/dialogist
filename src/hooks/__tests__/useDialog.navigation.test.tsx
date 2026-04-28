import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { useContext } from "react";

import { DialogProvider } from "../../context/DialogProvider";
import { DialogStateContext } from "../../context/DialogStateContext";
import { useDialog } from "../../useDialog";

const wrapper = ({ children }: { children: ReactNode }) => <DialogProvider>{children}</DialogProvider>;

describe("useDialog next/back composite key", () => {
  it("throws when next() is used with only one key segment", async () => {
    const { result } = renderHook(() => useDialog(["only-root"]), { wrapper });

    await act(async () => {
      void result.current.open({ type: "custom", title: "T", message: " " });
    });

    expect(() => {
      void result.current.next("step-2");
    }).toThrow(/at least two segments/);
  });

  it("throws when back(targetStep) is used with only one key segment (after replace to a flat key)", async () => {
    const { result } = renderHook(
      () => {
        const d = useDialog(["flow", "a"]);
        const state = useContext(DialogStateContext);
        return { d, state };
      },
      { wrapper },
    );

    await act(async () => {
      void result.current.d.open({ type: "custom", title: "A", message: " " });
    });
    await act(async () => {
      void result.current.d.next("b", { title: "B", message: " " });
    });
    await act(async () => {
      void result.current.d.replace({ type: "custom", dialogKey: "solo", title: "S", message: " " });
    });

    await waitFor(() => {
      expect(result.current.state?.dialogs?.[0]?.key).toBe("solo");
    });

    expect(() => {
      void result.current.d.back("a");
    }).toThrow(/at least two segments/);
  });

  it("allows next() when key has root and step", async () => {
    const { result } = renderHook(
      () => {
        const d = useDialog(["flow", "step-1"]);
        const state = useContext(DialogStateContext);
        return { d, state };
      },
      { wrapper },
    );

    await act(async () => {
      void result.current.d.open({ type: "custom", title: "One", message: " " });
    });

    await waitFor(() => {
      expect(result.current.state?.dialogs?.[0]?.key).toBe("flow::step-1");
    });

    await act(async () => {
      void result.current.d.next("step-2", { title: "Two", message: " " });
    });

    await waitFor(() => {
      expect(result.current.state?.dialogs?.[0]?.key).toBe("flow::step-2");
    });
  });
});
