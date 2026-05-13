"use client";

import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";

export type DemoAdapterId = "mui" | "base-ui" | "shadcn" | "tailwind";

export const DEMO_ADAPTERS: ReadonlyArray<{ id: DemoAdapterId; label: string; hint: string }> = [
  { id: "mui", label: "MUI", hint: "@mui/material — current default" },
  { id: "base-ui", label: "Base UI", hint: "@base-ui-components/react primitives" },
  { id: "shadcn", label: "shadcn", hint: "Base UI + shadcn class conventions" },
  { id: "tailwind", label: "Tailwind", hint: "Headless DOM + Tailwind utilities" },
] as const;

interface AdapterContextValue {
  adapterId: DemoAdapterId;
  setAdapterId: (id: DemoAdapterId) => void;
}

const AdapterContext = createContext<AdapterContextValue | undefined>(undefined);

const STORAGE_KEY = "dialogist:demoAdapter";

const isAdapterId = (value: string | null): value is DemoAdapterId =>
  value !== null && DEMO_ADAPTERS.some((entry) => entry.id === value);

export const AdapterProvider = ({ children }: { children: ReactNode }) => {
  const [adapterId, setAdapterIdState] = useState<DemoAdapterId>("mui");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isAdapterId(stored)) setAdapterIdState(stored);
  }, []);

  const value = useMemo<AdapterContextValue>(
    () => ({
      adapterId,
      setAdapterId: (id) => {
        setAdapterIdState(id);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(STORAGE_KEY, id);
        }
      },
    }),
    [adapterId],
  );

  return <AdapterContext.Provider value={value}>{children}</AdapterContext.Provider>;
};

export const useDemoAdapter = (): AdapterContextValue => {
  const ctx = useContext(AdapterContext);
  if (!ctx) throw new Error("useDemoAdapter must be used inside <AdapterProvider>");
  return ctx;
};
