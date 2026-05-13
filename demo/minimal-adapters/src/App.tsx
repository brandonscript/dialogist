import "dialogist/styles.css";

import { type DialogComponents, DialogProvider } from "dialogist";
import { baseUiSlots } from "dialogist/base-ui";
import { muiSlots } from "dialogist/mui";
import { shadcnSlots } from "dialogist/shadcn";
import { tailwindSlots } from "dialogist/tailwind";
import { useState } from "react";

import { OpenButton } from "./OpenButton";

const ADAPTERS = [
  { id: "headless", label: "Headless (default)", slots: undefined as DialogComponents | undefined },
  { id: "mui", label: "MUI", slots: muiSlots },
  { id: "base-ui", label: "Base UI", slots: baseUiSlots },
  { id: "shadcn", label: "shadcn", slots: shadcnSlots },
  { id: "tailwind", label: "Tailwind", slots: tailwindSlots },
] as const;

type AdapterId = (typeof ADAPTERS)[number]["id"];

export const App = () => {
  const [adapterId, setAdapterId] = useState<AdapterId>("headless");
  const active = ADAPTERS.find((a) => a.id === adapterId) ?? ADAPTERS[0];

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: 24, maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ marginTop: 0 }}>Dialogist minimal adapters</h1>
      <p>
        A minimal Vite app that proves Dialogist's adapters work standalone. Use the picker to swap the
        underlying UI library — the dialog logic and CSS variables stay the same.
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "16px 0" }}>
        {ADAPTERS.map((adapter) => (
          <button
            type="button"
            key={adapter.id}
            onClick={() => setAdapterId(adapter.id)}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: "1px solid #ccc",
              background: adapter.id === adapterId ? "#1976d2" : "white",
              color: adapter.id === adapterId ? "white" : "black",
              cursor: "pointer",
            }}
          >
            {adapter.label}
          </button>
        ))}
      </div>
      <DialogProvider key={adapterId} slots={active.slots} cssMode="external">
        <OpenButton adapterLabel={active.label} />
      </DialogProvider>
    </main>
  );
};
