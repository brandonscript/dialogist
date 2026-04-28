/** Mirrors `toSlug` in `demo/nextjs/src/components/common/demoNavUtils.ts`. */
export const toSlug = (str: string): string => {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};
