"use client";

import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import NoSsr from "@mui/material/NoSsr";
import { ThemeProvider, useTheme } from "@mui/material/styles";
import { type DialogComponents, DialogProvider } from "dialogist";
import { baseUiSlots } from "dialogist/base-ui";
import { muiSlots } from "dialogist/mui";
import { shadcnSlots } from "dialogist/shadcn";
import { tailwindSlots } from "dialogist/tailwind";
import { useEffect, useMemo } from "react";

import { DEMO_DIALOG_BORDER_RADIUS } from "@/constants/dialogDefaults";

import { AdapterProvider, type DemoAdapterId, useDemoAdapter } from "../../contexts/AdapterContext";
import { DemoStateProvider } from "../../contexts/DemoStateContext";
import { RenderTrackingProvider } from "../../contexts/RenderTrackingContext";
import { theme } from "../../demoTheme";
import { DemoBaseUiBase, DemoHeadlessBase, DemoShadcnBase } from "./DemoAdapterBases";
import { DemoBaseUiActions } from "./DemoBaseUiActions";
import { DemoDialogBase } from "./DemoDialogBase";

/**
 * Injects the demo's MUI theme colors as CSS variables on :root so that non-MUI
 * adapter dialogs (Base UI, shadcn, Tailwind headless) resolve `--dialogist-*`
 * to the actual demo-theme values rather than the library's built-in fallbacks.
 *
 * MUI dialogs already receive these values via `dialogistExtendMuiTheme`, which
 * scopes them to `.Dialogist-base.MuiDialog-root`. This fills the gap for
 * non-MUI adapter Base components.
 */
const ThemeVarsInjector = () => {
  const t = useTheme();
  return (
    <GlobalStyles
      styles={{
        ":root": {
          "--dialogist-primary-main": t.palette.primary.main,
          "--dialogist-primary-contrastText": t.palette.primary.contrastText,
          "--dialogist-text-primary": t.palette.text.primary,
          "--dialogist-text-secondary": t.palette.text.secondary,
          "--dialogist-bg-paper": t.palette.background.paper,
          "--dialogist-font-family": typeof t.typography.fontFamily === "string" ? t.typography.fontFamily : "sans-serif",
          // Match the backdrop fade duration used by MUI's Dialog Fade component in the demo.
          "--dialogist-backdrop-duration": "380ms",
        },
      }}
    />
  );
};

interface ClientProvidersProps {
  children: React.ReactNode;
}

type DialogProviderChildren = React.ComponentProps<typeof DialogProvider>["children"];

const slotsForAdapter = (adapterId: DemoAdapterId): DialogComponents => {
  switch (adapterId) {
    case "base-ui":
      return { ...baseUiSlots, Base: DemoBaseUiBase, Actions: DemoBaseUiActions };
    case "shadcn":
      return { ...shadcnSlots, Base: DemoShadcnBase };
    case "tailwind":
      return { ...tailwindSlots, Base: DemoHeadlessBase };
    // The MUI demo wraps the MUI Base in DemoDialogBase to keep the sandbox/fullscreen
    // container behavior. The other adapters use their own demo Base wrappers above.
    default:
      return { ...muiSlots, Base: DemoDialogBase };
  }
};

const ProviderForAdapter = ({ children }: { children: React.ReactNode }) => {
  const { adapterId } = useDemoAdapter();
  const slots = useMemo(() => slotsForAdapter(adapterId), [adapterId]);

  // Stamp the active adapter on <body> so per-adapter CSS overrides can scope their
  // selectors with [data-dialogist-adapter="shadcn"] etc.
  useEffect(() => {
    document.body.setAttribute("data-dialogist-adapter", adapterId);
    return () => {
      document.body.removeAttribute("data-dialogist-adapter");
    };
  }, [adapterId]);

  return (
    // The `key` re-mounts DialogProvider when the adapter changes — slots aren't reactive.
    <DialogProvider key={adapterId} slots={slots} defaultOptions={{ borderRadius: DEMO_DIALOG_BORDER_RADIUS }}>
      {children as DialogProviderChildren}
    </DialogProvider>
  );
};

export const ClientProviders = ({ children }: ClientProvidersProps) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ThemeVarsInjector />
      <RenderTrackingProvider>
        <NoSsr>
          <AdapterProvider>
            <DemoStateProvider>
              <ProviderForAdapter>{children}</ProviderForAdapter>
            </DemoStateProvider>
          </AdapterProvider>
        </NoSsr>
      </RenderTrackingProvider>
    </ThemeProvider>
  );
};
