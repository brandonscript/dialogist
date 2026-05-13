/**
 * Serialize a JSS-like style object (the same shape as `dialogistStyles`) into a CSS
 * string. Top-level keys are treated as selectors (or `@keyframes` blocks).
 */
export declare const serializeStylesToCss: (styles: Record<string, unknown>) => string;
