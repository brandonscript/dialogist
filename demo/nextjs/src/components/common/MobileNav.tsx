"use client";

import { Box, Divider, Drawer, IconButton, Typography } from "@mui/material";
import { FlexBox } from "@mui-flexy/v7";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { LuMenu, LuX } from "react-icons/lu";

import { useDemoState } from "../../contexts/DemoStateContext";
import {
  buildDemoPath,
  DEMO_REGISTRY,
  getCardName,
  getCardSlug,
  getSubHeadingSlug,
  getSubHeadingsForNav,
} from "./demoNavData";

export const MobileNavTrigger = () => {
  const { setMobileNavOpen } = useDemoState();
  return (
    <IconButton
      aria-label="Open navigation"
      onClick={() => setMobileNavOpen(true)}
      sx={{
        display: { xs: "inline-flex", md: "none" },
        color: "secondary.main",
        p: 0.75,
        mr: 0.5,
        "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.08)" },
      }}
    >
      <LuMenu size={22} />
    </IconButton>
  );
};

export const MobileNavOverlay = () => {
  const { isMobileNavOpen, setMobileNavOpen } = useDemoState();
  const pathname = usePathname();

  const pathSegments = pathname.split("/").filter(Boolean);
  const activeSectionSlug = pathSegments[0] ?? null;
  const activeCardSlug = pathSegments[1] ?? null;

  useEffect(() => {
    if (pathname) setMobileNavOpen(false);
  }, [pathname, setMobileNavOpen]);

  return (
    <Drawer
      anchor="top"
      open={isMobileNavOpen}
      onClose={() => setMobileNavOpen(false)}
      sx={{ display: { xs: "block", md: "none" } }}
      PaperProps={{
        sx: {
          width: "100vw",
          height: "100dvh",
          overflowY: "auto",
          backgroundColor: (t) => t.palette.background.paper,
        },
      }}
    >
      <FlexBox
        x="space-between"
        y="center"
        sx={{
          px: 2,
          minHeight: 56,
          borderBottom: (t) => `1px solid ${t.palette.divider}`,
          backgroundColor: (t) => t.palette.background.secondary,
          position: "sticky",
          top: 0,
          zIndex: 1,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, textTransform: "lowercase", color: "secondary.main" }}>
          Dialogist
        </Typography>
        <IconButton
          aria-label="Close navigation"
          onClick={() => setMobileNavOpen(false)}
          sx={{
            color: "secondary.main",
            p: 0.75,
            "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.08)" },
          }}
        >
          <LuX size={22} />
        </IconButton>
      </FlexBox>

      <Box sx={{ py: 2, px: 2 }}>
        {DEMO_REGISTRY.map((section, sectionIndex) => {
          const isSectionActive = activeSectionSlug === section.sectionSlug;
          return (
            <Box key={section.sectionSlug}>
              {sectionIndex > 0 && <Divider sx={{ my: 1.5 }} />}

              <Box
                component={Link}
                href={`/${section.sectionSlug}`}
                prefetch={false}
                scroll={false}
                onClick={() => setMobileNavOpen(false)}
                sx={{
                  display: "block",
                  textDecoration: "none",
                  color: isSectionActive ? "primary.main" : "text.secondary",
                  fontWeight: 700,
                  fontSize: "0.7rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  py: 0.75,
                  mb: 0.5,
                  "&:hover": { color: "text.primary" },
                }}
              >
                {section.label}
              </Box>

              {section.cards.map((card) => {
                const cardSlug = getCardSlug(card);
                const cardPath = buildDemoPath(section.sectionSlug, cardSlug);
                const isCardActive = isSectionActive && activeCardSlug === cardSlug;
                const subHeadings = getSubHeadingsForNav(card);

                return (
                  <Box key={cardSlug}>
                    <Box
                      sx={{
                        pl: 1.5,
                        borderLeft: "2px solid",
                        borderColor: isCardActive ? "primary.main" : "transparent",
                      }}
                    >
                      <Box
                        component={Link}
                        href={cardPath}
                        prefetch={false}
                        scroll={false}
                        onClick={() => setMobileNavOpen(false)}
                        sx={{
                          display: "block",
                          textDecoration: "none",
                          color: isCardActive ? "text.primary" : "text.secondary",
                          fontWeight: isCardActive ? 600 : 400,
                          fontSize: "0.875rem",
                          py: 0.4,
                          "&:hover": { color: "text.primary" },
                        }}
                      >
                        {getCardName(card)}
                      </Box>
                    </Box>

                    {subHeadings.map((sub) => {
                      const subSlug = getSubHeadingSlug(sub);
                      return (
                        <Box
                          key={subSlug}
                          component={Link}
                          href={`${cardPath}#${encodeURIComponent(subSlug)}`}
                          prefetch={false}
                          scroll={false}
                          onClick={() => setMobileNavOpen(false)}
                          sx={{
                            display: "block",
                            textDecoration: "none",
                            color: "text.disabled",
                            fontSize: "0.78rem",
                            pl: 3,
                            py: 0.3,
                            "&:hover": { color: "text.secondary" },
                          }}
                        >
                          {sub.name}
                        </Box>
                      );
                    })}
                  </Box>
                );
              })}
            </Box>
          );
        })}
      </Box>
    </Drawer>
  );
};
