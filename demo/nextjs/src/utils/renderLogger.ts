"use client";

const LABEL = "Dialogist renders";

let total = 0;
let pending = 0;
let scheduled = false;

const flush = (): void => {
  scheduled = false;
  if (pending === 0) return;
  total += pending;

  console.log(
    `%c${LABEL}: %c${total} %c(+${pending})`,
    "color:#6D78D5;font-weight:600;",
    "color:#1d1d20;",
    "color:#6b7280;",
  );
  pending = 0;
};

export const logGlobalRender = (): void => {
  pending += 1;
  if (!scheduled) {
    scheduled = true;
    // Batch logs to one line per frame
    if (typeof window !== "undefined" && "requestAnimationFrame" in window) {
      window.requestAnimationFrame(flush);
    } else {
      setTimeout(flush, 0);
    }
  }
};

export const resetGlobalRenderCount = (): void => {
  total = 0;
  pending = 0;
  scheduled = false;

  console.log(`%c${LABEL}: %creset`, "color:#6D78D5;font-weight:600;", "color:#6b7280;");
};

export const renderLogger = { log: logGlobalRender, reset: resetGlobalRenderCount } as const;
