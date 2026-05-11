"use client";

import { useMediaQuery } from "@mui/material";
import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from "react";

import { useLocalStorage } from "@/hooks/useLocalStorage";

export const MOBILE_BREAKPOINT = "(max-width: 899.95px)";

interface DemoStateContextType {
  isMobile: boolean;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  setFullscreen: (fullscreen: boolean) => void;
  sandboxContainer: HTMLElement | null;
  setSandboxContainer: (element: HTMLElement | null) => void;
  isMobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
}

const DemoStateContext = createContext<DemoStateContextType | undefined>(undefined);

export const DemoStateProvider = ({ children }: { children: ReactNode }) => {
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT, { defaultMatches: false });
  const [storedFullscreen, setIsFullscreen] = useLocalStorage("dialogist-demo-fullscreen", true);
  const [sandboxContainer, setSandboxContainer] = useState<HTMLElement | null>(null);
  const [isMobileNavOpen, setMobileNavOpen] = useState(false);

  const isFullscreen = isMobile ? true : storedFullscreen;

  const toggleFullscreen = useCallback(() => {
    if (isMobile) return;
    setIsFullscreen((prev) => !prev);
  }, [isMobile, setIsFullscreen]);

  const setFullscreen = useCallback(
    (fullscreen: boolean) => {
      if (isMobile) return;
      setIsFullscreen(fullscreen);
    },
    [isMobile, setIsFullscreen],
  );

  const value = useMemo(
    () => ({
      isMobile,
      isFullscreen,
      toggleFullscreen,
      setFullscreen,
      sandboxContainer,
      setSandboxContainer,
      isMobileNavOpen,
      setMobileNavOpen,
    }),
    [isMobile, isFullscreen, toggleFullscreen, setFullscreen, sandboxContainer, isMobileNavOpen],
  );

  return <DemoStateContext.Provider value={value}>{children}</DemoStateContext.Provider>;
};

export const useDemoState = () => {
  const context = useContext(DemoStateContext);
  if (context === undefined) {
    throw new Error("useDemoState must be used within a DemoStateProvider");
  }
  return context;
};
