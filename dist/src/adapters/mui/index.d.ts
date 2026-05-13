/**
 * MUI adapter for Dialogist.
 *
 * Provides:
 * - `muiSlots`: `slots` bundle for `<DialogProvider slots={muiSlots}>` rendering with
 *   MUI's Dialog primitives (Dialog, Paper, DialogTitle, DialogContent, DialogActions).
 * - `dialogistExtendMuiTheme(theme)`: wires Dialogist CSS variables to a host MUI theme.
 * - `DialogistMuiGlobalStyles`: optional MUI `GlobalStyles` based injection (use with
 *   `<DialogProvider cssMode="none" />`).
 * - `MuiDialogistAdapterProvider`: wires MUI theme spacing/transitions into Dialogist's
 *   adapter context so the FLIP resize animation honors MUI tokens.
 *
 * Usage:
 * ```tsx
 * import { ThemeProvider } from "@mui/material/styles";
 * import { DialogProvider } from "dialogist";
 * import { dialogistExtendMuiTheme, muiSlots, MuiDialogistAdapterProvider } from "dialogist/mui";
 *
 * const theme = dialogistExtendMuiTheme(myMuiTheme);
 *
 * <ThemeProvider theme={theme}>
 *   <MuiDialogistAdapterProvider>
 *     <DialogProvider slots={muiSlots}>...</DialogProvider>
 *   </MuiDialogistAdapterProvider>
 * </ThemeProvider>
 * ```
 */
import type { DialogComponents } from "../../types";
export { MuiBase } from "./MuiBase";
export { MuiDialogistAdapterProvider } from "./MuiDialogistAdapterProvider";
export { MuiActions, MuiActionsContainer, MuiContent, MuiFooter, MuiStatusBar, MuiTitle, } from "./MuiSlots";
export { DialogistMuiGlobalStyles, dialogistExtendMuiTheme } from "./theme";
/** Default `slots` bundle for `<DialogProvider slots={muiSlots}>`. */
export declare const muiSlots: DialogComponents;
