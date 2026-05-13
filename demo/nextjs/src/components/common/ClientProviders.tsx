"use client";

import CssBaseline from "@mui/material/CssBaseline";
import NoSsr from "@mui/material/NoSsr";
import { ThemeProvider } from "@mui/material/styles";
import { type DialogComponents, DialogProvider } from "dialogist";
import { baseUiSlots } from "dialogist/base-ui";
import { muiSlots } from "dialogist/mui";
import { shadcnSlots } from "dialogist/shadcn";
import { tailwindSlots } from "dialogist/tailwind";
import { useMemo } from "react";

import { DEMO_DIALOG_BORDER_RADIUS } from "@/constants/dialogDefaults";

import { AdapterProvider, type DemoAdapterId, useDemoAdapter } from "../../contexts/AdapterContext";
import { DemoStateProvider } from "../../contexts/DemoStateContext";
import { RenderTrackingProvider } from "../../contexts/RenderTrackingContext";
import { theme } from "../../demoTheme";
import { DemoDialogBase } from "./DemoDialogBase";

interface ClientProvidersProps {
  children: React.ReactNode;
}

type DialogProviderChildren = React.ComponentProps<typeof DialogProvider>["children"];

const slotsForAdapter = (adapterId: DemoAdapterId): DialogComponents => {
  switch (adapterId) {
    case "base-ui":
      return baseUiSlots;
    case "shadcn":
      return shadcnSlots;
    case "tailwind":
      return tailwindSlots;
    // The MUI demo wraps the MUI Base in DemoDialogBase to keep the sandbox/fullscreen
    // container behavior. The other adapters use their default Base.
    default:
      return { ...muiSlots, Base: DemoDialogBase };
  }
};

const ProviderForAdapter = ({ children }: { children: React.ReactNode }) => {
  const { adapterId } = useDemoAdapter();
  const slots = useMemo(() => slotsForAdapter(adapterId), [adapterId]);

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
