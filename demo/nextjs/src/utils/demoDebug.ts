const debugLoggingEnabled = typeof process !== "undefined" && process.env.NEXT_PUBLIC_DIALOGIST_DEBUG_LOGS === "true";

export const isDialogistDemoDebugLoggingEnabled = (): boolean => debugLoggingEnabled;

export const demoDebugLog = (...args: unknown[]): void => {
  if (debugLoggingEnabled) {
    console.log(...args);
  }
};

export const scheduleIdleOrTimeout = (cb: () => void): void => {
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    window.requestIdleCallback(() => {
      cb();
    });
  } else {
    setTimeout(cb, 0);
  }
};

export const isDialogistDemoInstrumentationEnabled = (): boolean =>
  debugLoggingEnabled && typeof performance !== "undefined" && process.env.NODE_ENV !== "production";

export const runDialogistDemoInstrumentation = (label: string, fn: () => void): void => {
  if (!isDialogistDemoInstrumentationEnabled()) {
    fn();
    return;
  }
  const start = performance.now();
  demoDebugLog(`[Dialogist][${label}] start`, { timestamp: start });
  try {
    fn();
  } finally {
    demoDebugLog(`[Dialogist][${label}] end`, { duration: performance.now() - start });
  }
};
