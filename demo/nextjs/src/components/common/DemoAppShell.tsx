"use client";

import { Box } from "@mui/material";
import { useDemoState } from "../../contexts/DemoStateContext";
import { useDemoRouteScroll } from "../../hooks/useDemoRouteScroll";
import { AppTopBar } from "./AppTopBar";
import { DemoSidebar } from "./DemoSidebar";
import { Sandbox } from "./Sandbox";
import { TabBar } from "./TabBar";

/** Isolated so `usePathname` / scroll effects do not re-render the whole shell on every URL change. */
const DemoRouteScroll = () => {
  useDemoRouteScroll();
  return null;
}

/**
 * Lives in the root layout as a sibling of the route `children` slot (not inside `[[...slug]]/page`).
 * That way a client navigation only swaps the tiny page segment; this tree is not a parent of that
 * slot, so React does not tear down the whole demo on every URL change.
 */
export const DemoAppShell = () => {
  const { isFullscreen } = useDemoState();

  return (
    <>
      <DemoRouteScroll />
      <Box
        data-dialog-mode={isFullscreen ? "fullscreen" : "windowed"}
        sx={{
          display: "grid",
          gridTemplateAreas: `
          "header header"
          "tabs tabs"
          "sidebar sandbox"
        `,
          gridTemplateRows: "auto auto 1fr",
          gridTemplateColumns: "1fr 2fr",
          height: "100vh",
          backgroundColor: (t) => t.palette.background.default,
        }}
      >
        <Box sx={{ gridArea: "header" }}>
          <AppTopBar />
        </Box>

        <Box sx={{ gridArea: "tabs" }}>
          <TabBar />
        </Box>

        <Box
          id="sidebar-scroll-container"
          sx={{
            gridArea: "sidebar",
            overflowY: "auto",
            borderRight: (t) => `1px solid ${t.palette.divider}`,
            backgroundColor: (t) => t.palette.background.paper,
          }}
        >
          <DemoSidebar />
        </Box>

        <Box sx={{ gridArea: "sandbox" }}>
          <Sandbox />
        </Box>
      </Box>
    </>
  );
}
