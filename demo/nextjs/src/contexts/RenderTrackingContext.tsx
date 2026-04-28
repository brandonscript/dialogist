"use client";

import { createContext, type ReactNode, useContext, useState } from "react";

import { renderLogger } from "../utils/renderLogger";

interface RenderTrackingContextValue {
  showRenderTracking: boolean;
  toggleRenderTracking: () => void;
  resetCounter: number;
  resetRenderTracking: () => void;
  // Global loading flag: true until any tracker reports ready (non-skeleton)
  isGlobalLoading: boolean;
  // Called by individual trackers once they transition out of skeleton
  notifyTrackerReady: () => void;
}

const RenderTrackingContext = createContext<RenderTrackingContextValue | null>(null);

export const RenderTrackingProvider = ({ children }: { children: ReactNode }) => {
  const [showRenderTracking, setShowRenderTracking] = useState(true); // Default to on
  const [resetCounter, setResetCounter] = useState(0);
  const [hasAnyTrackerReportedReady, setHasAnyTrackerReportedReady] = useState(false);

  const toggleRenderTracking = () => {
    setShowRenderTracking((prev) => {
      // If turning back on (was false, now true), reset all counters
      if (!prev) {
        setResetCounter((count) => count + 1);
        // Do not reset hasAnyTrackerReportedReady here; we consider initialization session-wide
      }
      return !prev;
    });
  };

  const resetRenderTracking = () => {
    setResetCounter((count) => count + 1);
    // Reset the global console counter as well
    renderLogger.reset();
  };

  const notifyTrackerReady = () => {
    // One-way flip: once any tracker is ready, disable global loading
    setHasAnyTrackerReportedReady((ready) => (ready ? ready : true));
  };

  const contextValue: RenderTrackingContextValue = {
    showRenderTracking,
    toggleRenderTracking,
    resetCounter,
    resetRenderTracking,
    isGlobalLoading: !hasAnyTrackerReportedReady,
    notifyTrackerReady,
  };

  return <RenderTrackingContext.Provider value={contextValue}>{children}</RenderTrackingContext.Provider>;
}

export const useRenderTracking = () => {
  const context = useContext(RenderTrackingContext);
  if (!context) {
    throw new Error("useRenderTracking must be used within a RenderTrackingProvider");
  }
  return context;
}
