"use client";

import { Box, Divider, Drawer, Fade, IconButton } from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef, useEffect } from "react";
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

/** Height of the AppTopBar — used to offset the Drawer so the bar stays visible. */
const APPBAR_HEIGHT = 56;

const NavFade = forwardRef<HTMLDivElement, React.ComponentProps<typeof Fade>>(
  function NavFade(props, ref) {
    return <Fade {...props} ref={ref} timeout={200} />;
  },
);

const iconBoxSx = (visible: boolean, rotateHidden: string) => ({
  position: "absolute" as const,
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "opacity 0.22s ease, transform 0.25s ease",
  opacity: visible ? 1 : 0,
  transform: visible ? "rotate(0deg) scale(1)" : `${rotateHidden} scale(0.4)`,
  pointerEvents: "none" as const,
});

export const MobileNavTrigger = () => {
  const { isMobileNavOpen, setMobileNavOpen } = useDemoState();
  return (
    <IconButton
      aria-label={isMobileNavOpen ? "Close navigation" : "Open navigation"}
      onClick={() => setMobileNavOpen(!isMobileNavOpen)}
      sx={{
        display: { xs: "inline-flex", md: "none" },
        color: "secondary.main",
        p: 0.75,
        mr: 0.5,
        position: "relative",
        "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.08)" },
      }}
    >
      <Box sx={iconBoxSx(!isMobileNavOpen, "rotate(90deg)")}>
        <LuMenu size={22} />
      </Box>
      <Box sx={iconBoxSx(isMobileNavOpen, "rotate(-90deg)")}>
        <LuX size={22} />
      </Box>
      {/* Keeps the button sized correctly */}
      <Box sx={{ width: 22, height: 22, visibility: "hidden" }} aria-hidden />
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
      slots={{ transition: NavFade }}
      sx={{
        display: { xs: "block", md: "none" },
        top: `${APPBAR_HEIGHT}px`,
      }}
      PaperProps={{
        sx: {
          top: `${APPBAR_HEIGHT}px`,
          width: "100vw",
          height: `calc(100dvh - ${APPBAR_HEIGHT}px)`,
          overflowY: "auto",
          borderRadius: 0,
          backgroundColor: (t) => t.palette.background.paper,
        },
      }}
      slotProps={{
        backdrop: { sx: { top: `${APPBAR_HEIGHT}px` } },
      }}
    >
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
