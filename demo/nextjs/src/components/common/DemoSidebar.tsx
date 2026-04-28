"use client";

import { Box, Typography } from "@mui/material";
import { FlexBox } from "@mui-flexy/v7";
import { memo } from "react";

import { DemoNavScopeProvider } from "../../contexts/DemoNavScope";
import { DemoCopyLink } from "./DemoCopyLink";
import { DEMO_REGISTRY, getCardElementId, getCardName, getCardSlug, getCategoryElementId } from "./demoNavData";

const DemoSidebarInner = () => {
  return (
    <FlexBox p={2} column id="demo-sidebar">
      {DEMO_REGISTRY.map(({ label, sectionSlug, cards }) => (
        <FlexBox column key={sectionSlug} mb={4} id={getCategoryElementId(sectionSlug)}>
          <DemoCopyLink
            variant="section"
            pathToCopy={`/${sectionSlug}`}
            ariaLabel="Copy link to this section"
            sx={{ mb: 2, ml: 2, alignItems: "center", width: "100%", boxSizing: "border-box" }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                color: "color-mix(in srgb, currentColor 50%, white)",
                fontSize: "1.25rem",
                letterSpacing: "-0.01em",
                textTransform: "lowercase",
              }}
            >
              {label}
            </Typography>
          </DemoCopyLink>
          <FlexBox column gap={1} id={`${getCategoryElementId(sectionSlug)}-children`}>
            {cards.map((card) => {
              const _name = getCardName(card);
              const cardSlug = getCardSlug(card);
              const { component: Component } = card;
              return (
                <Box key={`${sectionSlug}-${cardSlug}`} id={getCardElementId(sectionSlug, cardSlug)}>
                  <DemoNavScopeProvider sectionSlug={sectionSlug} cardSlug={cardSlug}>
                    <Component />
                  </DemoNavScopeProvider>
                </Box>
              );
            })}
          </FlexBox>
        </FlexBox>
      ))}
    </FlexBox>
  );
}

/** Memoized so client navigations (pathname) do not re-render every demo card / RenderTracker. */
export const DemoSidebar = memo(DemoSidebarInner);
