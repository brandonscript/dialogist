import { render, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";

import { dialogistClasses } from "../classes";
import type { DialogState } from "../types";
import { DialogScaffolding } from "./DialogScaffolding";

const buildDialog = (config: DialogState["config"], overrides?: Partial<DialogState>): DialogState => ({
  key: "content-style-test",
  keySegments: ["content-style-test"],
  type: config.type,
  config,
  internalId: "content-style-internal-id",
  ...overrides,
});

describe("DialogScaffolding contentStyle", () => {
  it("maps a11yRestoreFocus=false to disableRestoreFocus on Base dialog", async () => {
    const BaseSpy = jest.fn(({ children }: { children?: ReactNode }) => <div>{children}</div>);
    const dialog = buildDialog({
      type: "confirm",
      title: "Focus restore test",
      message: "Check prop forwarding",
      a11yRestoreFocus: false,
    });

    render(<DialogScaffolding dialogs={[dialog]} onClose={jest.fn()} slots={{ Base: BaseSpy }} />);

    await waitFor(() => {
      expect(BaseSpy).toHaveBeenCalled();
    });

    const baseProps = BaseSpy.mock.calls[0][0] as { disableRestoreFocus?: boolean };
    expect(baseProps.disableRestoreFocus).toBe(true);
  });

  it("applies contentStyle align/textAlign vars for non-custom dialogs", async () => {
    const dialog = buildDialog({
      type: "confirm",
      title: "Content style test",
      message: "Hello world",
      contentStyle: {
        align: "space-between",
        textAlign: "right",
        maxWidth: 400,
        minHeight: 180,
      },
    });

    render(<DialogScaffolding dialogs={[dialog]} onClose={jest.fn()} />);

    await waitFor(() => {
      const contentElement = document.body.querySelector(`.${dialogistClasses.content}`) as HTMLElement | null;
      expect(contentElement).toBeTruthy();
      expect(contentElement?.style.display).toBe("flex");
      expect(contentElement?.style.flexDirection).toBe("column");
      expect(contentElement?.style.alignItems).toBe("stretch");
      expect(contentElement?.style.justifyContent).toBe("space-between");
      expect(contentElement?.style.textAlign).toBe("right");
      expect(contentElement?.style.maxWidth).toBe("400px");
      expect(contentElement?.style.minHeight).toBe("180px");
      expect(contentElement?.style.getPropertyValue("--dialogist-content-justify")).toBe("space-between");
      expect(contentElement?.style.getPropertyValue("--dialogist-content-text-align")).toBe("right");
      expect(contentElement?.style.getPropertyValue("--dialogist-content-max-width")).toBe("400px");
      expect(contentElement?.style.getPropertyValue("--dialogist-content-min-height")).toBe("180px");
    });
  });

  it("does not force non-custom contentStyle vars for custom dialog content", async () => {
    const CustomContent = () => <div data-testid="custom-content">Custom content</div>;
    const dialog = buildDialog({
      type: "custom",
      title: "Custom content style test",
      message: CustomContent,
      contentStyle: {
        align: "space-evenly",
        textAlign: "center",
      },
    });

    render(<DialogScaffolding dialogs={[dialog]} onClose={jest.fn()} />);

    await waitFor(() => {
      const customContent = document.body.querySelector("[data-testid='custom-content']");
      expect(customContent).toBeTruthy();
    });

    const contentElement = document.body.querySelector(`.${dialogistClasses.content}`) as HTMLElement | null;
    expect(contentElement).toBeTruthy();
    expect(contentElement?.style.getPropertyValue("--dialogist-content-justify")).toBe("");
    expect(contentElement?.style.getPropertyValue("--dialogist-content-text-align")).toBe("");
  });

  it("sets content id on custom dialogs so aria-describedby resolves", async () => {
    const CustomContent = () => <div>Body</div>;
    const dialog = buildDialog({
      type: "custom",
      title: "Custom a11y",
      message: CustomContent,
    });

    render(<DialogScaffolding dialogs={[dialog]} onClose={jest.fn()} />);

    await waitFor(() => {
      const expectedId = "dialogist-content-style-test-content";
      const contentEl = document.getElementById(expectedId);
      expect(contentEl).toBeTruthy();
      const dialogEl = document.querySelector('[role="dialog"]');
      expect(dialogEl?.getAttribute("aria-describedby")).toBe(expectedId);
    });
  });
});
