"use client";

import { Box, Button } from "@mui/material";
import { FlexBox } from "@mui-flexy/v7";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { DEMO_REGISTRY, getCategoryElementId, getElementScrollTop } from "./demoNavData";

const SECTIONS = DEMO_REGISTRY.map((s) => ({
  sectionSlug: s.sectionSlug,
  label: s.tabLabel,
}));

/** How long after the last scroll event before the click-lock is released (ms). */
const SCROLL_END_DEBOUNCE_MS = 200;

export const TabBar = () => {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<string | null>(SECTIONS[0]?.sectionSlug || null);

  /**
   * When the user clicks a tab we lock the active highlight to that tab so the
   * scroll handler can't override it while the page is auto-scrolling.  The lock
   * is released once scrolling has been idle for SCROLL_END_DEBOUNCE_MS.
   */
  const clickLockedTabRef = useRef<string | null>(null);
  const scrollEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const computeActiveFromScroll = useCallback(() => {
    const scrollContainer = document.getElementById("sidebar-scroll-container");
    if (!scrollContainer) return;

    const scrollTop = scrollContainer.scrollTop;
    const threshold = scrollTop + 80;

    for (let i = SECTIONS.length - 1; i >= 0; i--) {
      const element = document.getElementById(getCategoryElementId(SECTIONS[i].sectionSlug));
      if (element) {
        const elementTop = getElementScrollTop(element, scrollContainer);
        if (elementTop <= threshold) {
          setActiveTab(SECTIONS[i].sectionSlug);
          return;
        }
      }
    }
    setActiveTab(SECTIONS[0]?.sectionSlug || null);
  }, []);

  // Sync activeTab with pathname on load / URL-driven navigation (e.g. back/forward).
  useEffect(() => {
    if (clickLockedTabRef.current) return;
    const parts = pathname.split("/").filter(Boolean);
    const matched = parts[0] ? SECTIONS.find((s) => s.sectionSlug === parts[0]) : null;
    if (matched) setActiveTab(matched.sectionSlug);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      // While locked to a clicked tab, ignore scroll-driven updates.
      if (clickLockedTabRef.current) {
        // Reset the debounce timer so the lock lifts only after scrolling stops.
        if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current);
        scrollEndTimerRef.current = setTimeout(() => {
          clickLockedTabRef.current = null;
          computeActiveFromScroll();
        }, SCROLL_END_DEBOUNCE_MS);
        return;
      }

      computeActiveFromScroll();
    };

    const scrollContainer = document.getElementById("sidebar-scroll-container");
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
      const timeoutId = setTimeout(computeActiveFromScroll, 100);
      return () => {
        scrollContainer.removeEventListener("scroll", handleScroll);
        clearTimeout(timeoutId);
        if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current);
      };
    }
  }, [computeActiveFromScroll]);

  const handleTabClick = useCallback((sectionSlug: string) => {
    setActiveTab(sectionSlug);
    clickLockedTabRef.current = sectionSlug;
    if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current);
  }, []);

  return (
    <Box
      sx={{
        bgcolor: (t) => `color-mix(in srgb, ${t.palette.background.secondary} 92.5%, white)`,
        borderBottom: (t) => `1px solid ${t.palette.divider}`,
      }}
    >
      <FlexBox
        x="left"
        y="center"
        sx={{
          minHeight: 40,
          px: 2,
        }}
      >
        {SECTIONS.map((section) => {
          const tabActive = activeTab === section.sectionSlug;
          return (
            <Button
              key={section.sectionSlug}
              component={Link}
              href={`/${section.sectionSlug}`}
              prefetch={false}
              scroll={false}
              onClick={() => handleTabClick(section.sectionSlug)}
              sx={{
                minHeight: 40,
                textTransform: "none",
                color: tabActive ? "secondary.main" : "rgba(255, 255, 255, 0.7)",
                fontSize: "0.75rem",
                fontWeight: tabActive ? 600 : 500,
                px: 3,
                position: "relative",
                borderRadius: 0,
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                },
                "&::after": tabActive
                  ? {
                      content: '""',
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 2,
                      backgroundColor: "secondary.main",
                    }
                  : {},
              }}
            >
              {section.label}
            </Button>
          );
        })}
      </FlexBox>
    </Box>
  );
};
