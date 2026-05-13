import { render } from "@testing-library/react";

import {
  DEFAULT_DIALOGIST_ADAPTER,
  DialogistAdapterProvider,
  useDialogistAdapter,
} from "../DialogistAdapterContext";

const Probe = ({ onValue }: { onValue: (value: ReturnType<typeof useDialogistAdapter>) => void }) => {
  const adapter = useDialogistAdapter();
  onValue(adapter);
  return null;
};

describe("DialogistAdapterContext", () => {
  it("returns default adapter when no provider is mounted", () => {
    const received: { value: ReturnType<typeof useDialogistAdapter> | null } = { value: null };
    render(<Probe onValue={(v) => { received.value = v; }} />);
    expect(received.value).not.toBeNull();
    expect(received.value).toBe(DEFAULT_DIALOGIST_ADAPTER);
  });

  it("default resolveSpacing turns numbers into 8px-multiplied strings", () => {
    expect(DEFAULT_DIALOGIST_ADAPTER.resolveSpacing(2, 1)).toBe("16px");
    expect(DEFAULT_DIALOGIST_ADAPTER.resolveSpacing(undefined, 3)).toBe("24px");
    expect(DEFAULT_DIALOGIST_ADAPTER.resolveSpacing("1.5rem", 1)).toBe("1.5rem");
  });

  it("default transition tokens match the legacy hardcoded fallbacks", () => {
    expect(DEFAULT_DIALOGIST_ADAPTER.transitionDuration).toBe(150);
    expect(DEFAULT_DIALOGIST_ADAPTER.transitionEasing).toBe("cubic-bezier(0.4, 0, 0.2, 1)");
  });

  it("merges partial overrides from DialogistAdapterProvider over defaults", () => {
    const received: { value: ReturnType<typeof useDialogistAdapter> | null } = { value: null };
    render(
      <DialogistAdapterProvider value={{ transitionDuration: 320 }}>
        <Probe onValue={(v) => { received.value = v; }} />
      </DialogistAdapterProvider>,
    );
    expect(received.value?.transitionDuration).toBe(320);
    expect(received.value?.transitionEasing).toBe(DEFAULT_DIALOGIST_ADAPTER.transitionEasing);
    expect(received.value?.resolveSpacing).toBe(DEFAULT_DIALOGIST_ADAPTER.resolveSpacing);
  });
});
