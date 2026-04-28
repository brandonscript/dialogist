export const SUBNAV_WIDTH = 252;

export const toSlug = (str: string): string => {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

export const getCategoryElementId = (sectionSlug: string): string => {
  return `demo-category-${sectionSlug}`;
};

export const getCardElementId = (sectionSlug: string, cardSlug: string): string => {
  return `demo-card-${sectionSlug}-${cardSlug}`;
};

export const getSubHeadingElementId = (sectionSlug: string, cardSlug: string, subSlug: string): string => {
  return `demo-subheading-${sectionSlug}-${cardSlug}-${subSlug}`;
};

/** Server-safe path for `next/link` (leading slash, no hash). */
export const buildDemoPath = (sectionSlug: string, cardSlug?: string): string => {
  if (cardSlug) return `/${sectionSlug}/${cardSlug}`;
  return `/${sectionSlug}`;
};

export const getElementScrollTop = (element: HTMLElement, scrollContainer: HTMLElement): number => {
  const elementRect = element.getBoundingClientRect();
  const containerRect = scrollContainer.getBoundingClientRect();
  return scrollContainer.scrollTop + elementRect.top - containerRect.top;
};
