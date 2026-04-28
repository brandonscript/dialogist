"use client";

import CssBaseline from "@mui/material/CssBaseline";
import NoSsr from "@mui/material/NoSsr";
import { ThemeProvider } from "@mui/material/styles";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { DialogProvider } from "dialogist";

import { DEMO_DIALOG_BORDER_RADIUS } from "@/constants/dialogDefaults";

import { DemoStateProvider } from "../../contexts/DemoStateContext";
import { RenderTrackingProvider } from "../../contexts/RenderTrackingContext";
import { theme } from "../../demoTheme";
import { DemoDialogBase } from "./DemoDialogBase";

interface ClientProvidersProps {
  children: React.ReactNode;
}

type DialogProviderChildren = React.ComponentProps<typeof DialogProvider>["children"];

export const ClientProviders = ({ children }: ClientProvidersProps) => {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RenderTrackingProvider>
          <NoSsr>
            <DemoStateProvider>
              <DialogProvider
                slots={{ Base: DemoDialogBase }}
                defaultOptions={{ borderRadius: DEMO_DIALOG_BORDER_RADIUS }}
              >
                {children as DialogProviderChildren}
              </DialogProvider>
            </DemoStateProvider>
          </NoSsr>
        </RenderTrackingProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
