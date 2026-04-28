"use client";

import { createContext, type ReactNode, useContext, useState } from "react";

import { useLocalStorage } from "@/hooks/useLocalStorage";

interface DemoStateContextType {
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  setFullscreen: (fullscreen: boolean) => void;
  sandboxContainer: HTMLElement | null;
  setSandboxContainer: (element: HTMLElement | null) => void;
}

const DemoStateContext = createContext<DemoStateContextType | undefined>(undefined);

export const DemoStateProvider = ({ children }: { children: ReactNode }) => {
  const [isFullscreen, setIsFullscreen] = useLocalStorage("dialogist-demo-fullscreen", true);
  const [sandboxContainer, setSandboxContainer] = useState<HTMLElement | null>(null);

  const toggleFullscreen = () => setIsFullscreen((prev) => !prev);
  const setFullscreen = (fullscreen: boolean) => setIsFullscreen(fullscreen);

  return (
    <DemoStateContext.Provider
      value={{
        isFullscreen,
        toggleFullscreen,
        setFullscreen,
        sandboxContainer,
        setSandboxContainer,
      }}
    >
      {children}
    </DemoStateContext.Provider>
  );
}

export const useDemoState = () => {
  const context = useContext(DemoStateContext);
  if (context === undefined) {
    throw new Error("useDemoState must be used within a DemoStateProvider");
  }
  return context;
}
