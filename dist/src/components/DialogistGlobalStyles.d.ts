/**
 * Inject the static `dialogistStyles` block once per document. Re-mounted providers share
 * a refcount so the `<style>` tag stays in the DOM until the last provider unmounts.
 *
 * Pass `mode="external"` to skip injection entirely (consumers import a CSS file via
 * `import "dialogist/styles.css"` instead). Pass `mode="none"` to opt out completely (an
 * adapter such as the MUI adapter may render its own MUI `GlobalStyles` if preferred).
 */
export type DialogistGlobalStylesMode = "inject" | "external" | "none";
export interface DialogistGlobalStylesProps {
    mode?: DialogistGlobalStylesMode;
}
export declare const DialogistGlobalStyles: ({ mode }: DialogistGlobalStylesProps) => null;
