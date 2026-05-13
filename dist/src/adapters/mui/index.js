import { MuiBase } from './MuiBase.js';
import { MuiFooter, MuiStatusBar, MuiActions, MuiActionsContainer, MuiContent, MuiTitle } from './MuiSlots.js';
export { MuiDialogistAdapterProvider } from './MuiDialogistAdapterProvider.js';
export { DialogistMuiGlobalStyles, dialogistExtendMuiTheme } from './theme.js';

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


/** Default `slots` bundle for `<DialogProvider slots={muiSlots}>`. */
var muiSlots = {
  Base: MuiBase,
  Title: MuiTitle,
  Content: MuiContent,
  ActionsContainer: MuiActionsContainer,
  Actions: MuiActions,
  StatusBar: MuiStatusBar,
  Footer: MuiFooter
};

export { MuiActions, MuiActionsContainer, MuiBase, MuiContent, MuiFooter, MuiStatusBar, MuiTitle, muiSlots };
//# sourceMappingURL=index.js.map
