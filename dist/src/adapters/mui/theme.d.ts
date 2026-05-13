/**
 * Layer Dialogist-friendly MUI overrides into a host MUI theme. Consumer values win over
 * Dialogist defaults via `deepmerge`. Pass the result to MUI's `<ThemeProvider theme={...}>`.
 */
export declare const dialogistExtendMuiTheme: <T extends object = object>(theme: T) => T;
/**
 * Render `dialogistStyles` via MUI's `GlobalStyles` instead of the framework-agnostic
 * `<style>` injector. Use when consumers want emotion's deduping / SSR pipeline rather
 * than the built-in injector. Pair with `<DialogProvider cssMode="none" />`.
 */
export declare const DialogistMuiGlobalStyles: {
    (): import("react/jsx-runtime").JSX.Element;
    displayName: string;
};
