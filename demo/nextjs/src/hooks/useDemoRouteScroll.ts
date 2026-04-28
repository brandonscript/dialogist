"use client";

import { useParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { findCardBySlugs, findSectionBySlug } from "../components/common/demoNavData";
import {
  buildDemoPath,
  getCardElementId,
  getCategoryElementId,
  getElementScrollTop,
  getSubHeadingElementId,
} from "../components/common/demoNavUtils";

const SCROLL_OFFSET = 16;

const scrollSidebarToElement = (element: HTMLElement | null, behavior: ScrollBehavior = "smooth"): void => {
  const scrollContainer = document.getElementById("sidebar-scroll-container");
  if (!scrollContainer || !element) return;
  const top = getElementScrollTop(element, scrollContainer) - SCROLL_OFFSET;
  scrollContainer.scrollTo({ top: Math.max(0, top), behavior });
};

export type ScrollDemoSidebarOptions = {
  behavior?: ScrollBehavior;
};

/**
 * Imperatively scroll the left demo sidebar for slug segments + optional hash.
 * Used from the route hook and when the URL is unchanged (e.g. subnav re-click).
 */
export const scrollDemoSidebarToSlugAndHash = (
  slugSegments: string[],
  hash: string,
  options?: ScrollDemoSidebarOptions,
): number => {
  const behavior = options?.behavior ?? "smooth";
  const run = () => {
    const scrollContainer = document.getElementById("sidebar-scroll-container");
    if (!scrollContainer) return;

    if (slugSegments.length === 0) {
      return;
    }

    const sectionSlug = slugSegments[0];
    if (!findSectionBySlug(sectionSlug)) {
      scrollContainer.scrollTo({ top: 0, behavior });
      return;
    }

    if (slugSegments.length === 1) {
      const el = document.getElementById(getCategoryElementId(sectionSlug));
      scrollSidebarToElement(el, behavior);
      return;
    }

    const cardSlug = slugSegments[1];
    const found = findCardBySlugs(sectionSlug, cardSlug);
    if (!found) {
      scrollContainer.scrollTo({ top: 0, behavior });
      return;
    }

    const hashValue = hash.startsWith("#") ? hash.slice(1) : hash;
    const decodedHash = hashValue ? decodeURIComponent(hashValue) : "";

    if (decodedHash) {
      const subEl = document.getElementById(getSubHeadingElementId(sectionSlug, cardSlug, decodedHash));
      if (subEl) {
        scrollSidebarToElement(subEl, behavior);
        return;
      }
    }

    const cardEl = document.getElementById(getCardElementId(sectionSlug, cardSlug));
    scrollSidebarToElement(cardEl, behavior);
  };

  return requestAnimationFrame(run);
};

/**
 * Scrolls the demo sidebar to match the current path (`[[...slug]]`) and optional hash (subsection).
 */
export const useDemoRouteScroll = (): void => {
  const _pathname = usePathname();
  const params = useParams();
  const slugParam = params.slug as string[] | undefined;
  const slugSegments = slugParam?.filter(Boolean) ?? [];
  const _slugKey = slugParam?.join("/") ?? "";
  const [hash, setHash] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setHash(window.location.hash);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    const frame = scrollDemoSidebarToSlugAndHash(slugSegments, hash);
    return () => cancelAnimationFrame(frame);
  }, [hash, slugSegments]);
};

/** Absolute URL string for clipboard (client only). */
export const getDemoAbsoluteUrl = (pathWithOptionalHash: string): string => {
  if (typeof window === "undefined") return pathWithOptionalHash;
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return new URL(`${basePath}${pathWithOptionalHash}`, window.location.origin).href;
};

export const demoPathFromSegments = (segments: string[]): string => {
  if (segments.length === 0) return "/";
  return buildDemoPath(segments[0], segments[1]);
};
