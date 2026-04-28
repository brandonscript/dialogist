"use client";

import { Box } from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { scrollDemoSidebarToSlugAndHash } from "../../hooks/useDemoRouteScroll";
import {
  buildDemoPath,
  DEMO_REGISTRY,
  findSectionBySlug,
  getAllCardRoutes,
  getCardElementId,
  getCardName,
  getCardSlug,
  getElementScrollTop,
  getSubHeadingSlug,
  getSubHeadingsForNav,
  SUBNAV_WIDTH,
} from "./demoNavData";

const ALL_CARD_ROUTES = getAllCardRoutes();

type CardRouteKey = `${string}/${string}`;

const routeKey = (sectionSlug: string, cardSlug: string): CardRouteKey => {
  return `${sectionSlug}/${cardSlug}`;
};

export const DemoSubNav = () => {
  const pathname = usePathname();
  const [_subnavRevealTick, setSubnavRevealTick] = useState(0);
  const [activeKey, setActiveKey] = useState<CardRouteKey | null>(
    ALL_CARD_ROUTES[0] ? routeKey(ALL_CARD_ROUTES[0].sectionSlug, ALL_CARD_ROUTES[0].cardSlug) : null,
  );
  const activeRef = useRef<HTMLDivElement | null>(null);

  const activeRoute = activeKey?.split("/") as [string, string] | undefined;
  const activeSectionSlugFromScroll = activeRoute?.[0];

  const pathSegments = pathname.split("/").filter(Boolean);
  const sectionFromPath = pathSegments[0] ? findSectionBySlug(pathSegments[0]) : undefined;
  const activeSection =
    sectionFromPath ??
    (activeSectionSlugFromScroll ? findSectionBySlug(activeSectionSlugFromScroll) : undefined) ??
    DEMO_REGISTRY[0];

  useEffect(() => {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length >= 2) {
      setActiveKey(routeKey(parts[0], parts[1]));
    } else if (parts.length === 1) {
      const sec = findSectionBySlug(parts[0]);
      if (sec?.cards[0]) {
        setActiveKey(routeKey(sec.sectionSlug, getCardSlug(sec.cards[0])));
      }
    }
  }, [pathname]);

  useEffect(() => {
    const scrollContainer = document.getElementById("sidebar-scroll-container");
    if (!scrollContainer) return;

    const handleScroll = () => {
      const scrollTop = scrollContainer.scrollTop;
      const threshold = scrollTop + 100;

      for (let i = ALL_CARD_ROUTES.length - 1; i >= 0; i--) {
        const { sectionSlug, cardSlug } = ALL_CARD_ROUTES[i];
        const element = document.getElementById(getCardElementId(sectionSlug, cardSlug));
        if (element) {
          const elementTop = getElementScrollTop(element, scrollContainer);
          if (elementTop <= threshold) {
            setActiveKey(routeKey(sectionSlug, cardSlug));
            return;
          }
        }
      }
      if (ALL_CARD_ROUTES[0]) {
        setActiveKey(routeKey(ALL_CARD_ROUTES[0].sectionSlug, ALL_CARD_ROUTES[0].cardSlug));
      }
    };

    scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
    const timeoutId = setTimeout(handleScroll, 100);
    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll);
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, []);

  return (
    <Box
      component="nav"
      aria-label="Demo sub-navigation"
      sx={{
        position: "absolute",
        top: 0,
        right: 0,
        height: "100%",
        width: SUBNAV_WIDTH,
        overflowY: "auto",
        py: 3,
        pr: 2,
        pl: 2.5,
        borderLeft: (t) => `1px solid ${t.palette.divider}`,
        backgroundColor: (t) => `color-mix(in srgb, ${t.palette.background.default} 80%, transparent)`,
        backdropFilter: "blur(8px)",
        scrollbarWidth: "thin",
        display: { xs: "none", lg: "block" },
        "&::-webkit-scrollbar": { width: 4 },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: (t) => t.palette.action.hover,
          borderRadius: 2,
        },
      }}
    >
      <Box
        sx={{
          fontWeight: 600,
          letterSpacing: "0.03em",
          color: "text.disabled",
          mb: 2,
          fontSize: "0.75rem",
          textTransform: "lowercase",
        }}
      >
        {activeSection.label}
      </Box>

      {activeSection.cards.map((card) => {
        const cardSlug = getCardSlug(card);
        const sectionSlug = activeSection.sectionSlug;
        const k = routeKey(sectionSlug, cardSlug);
        const isActive = activeKey === k;
        const cardPath = buildDemoPath(sectionSlug, cardSlug);
        return (
          <Box key={k}>
            <Box
              ref={isActive ? activeRef : undefined}
              sx={{
                fontSize: "0.78rem",
                lineHeight: 1.5,
                py: 0.3,
                pl: 1.5,
                borderLeft: "2px solid",
                borderColor: isActive ? "primary.contrastText" : "transparent",
                color: isActive ? "primary.contrastText" : "text.secondary",
                fontWeight: isActive ? 600 : 400,
                transition: "color 0.15s, border-color 0.15s, font-weight 0.15s",
                "&:hover": {
                  color: isActive ? "primary.contrastText" : "text.primary",
                },
              }}
            >
              <Box
                component={Link}
                href={cardPath}
                prefetch={false}
                scroll={false}
                onClick={() => {
                  if (pathname === cardPath && typeof window !== "undefined") {
                    scrollDemoSidebarToSlugAndHash(pathname.split("/").filter(Boolean), window.location.hash);
                    setActiveKey(k);
                    setSubnavRevealTick((t) => t + 1);
                  }
                }}
                sx={{
                  color: "inherit",
                  textDecoration: "none",
                  display: "block",
                  fontWeight: "inherit",
                }}
              >
                {getCardName(card)}
              </Box>
            </Box>
            {getSubHeadingsForNav(card).map((sub, subIndex, arr) => {
              const subSlug = getSubHeadingSlug(sub);
              const isLast = subIndex === arr.length - 1;
              const href = `${cardPath}#${encodeURIComponent(subSlug)}`;
              return (
                <Box
                  key={`${k}__${sub.name}__${subSlug}`}
                  sx={{
                    fontSize: "0.72rem",
                    lineHeight: 1.5,
                    py: 0.4,
                    pb: isLast ? 1 : 0.4,
                    pl: 3,
                    color: "text.disabled",
                    transition: "color 0.15s",
                    "&:hover": { color: "text.secondary" },
                  }}
                >
                  <Box
                    component={Link}
                    href={href}
                    prefetch={false}
                    scroll={false}
                    onClick={() => {
                      if (typeof window === "undefined") return;
                      setActiveKey(k);
                      setSubnavRevealTick((t) => t + 1);
                      scrollDemoSidebarToSlugAndHash(
                        cardPath.split("/").filter(Boolean),
                        `#${encodeURIComponent(subSlug)}`,
                      );
                    }}
                    sx={{
                      color: "inherit",
                      textDecoration: "none",
                      display: "block",
                    }}
                  >
                    {sub.name}
                  </Box>
                </Box>
              );
            })}
          </Box>
        );
      })}
    </Box>
  );
};
