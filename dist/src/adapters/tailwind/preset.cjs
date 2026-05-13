/**
 * Tailwind v3 preset that maps Dialogist CSS variables onto Tailwind's theme tokens.
 *
 * Add to your config:
 * ```js
 * module.exports = {
 *   presets: [require("dialogist/tailwind/preset.cjs")],
 *   content: ["./src/**\/*.{ts,tsx}"],
 * };
 * ```
 *
 * Tokens exposed (matching shadcn-style names so `bg-primary`, `text-foreground` etc.
 * work out of the box):
 * - `bg-background`, `text-foreground`, `bg-primary`, `text-primary-foreground`
 * - `bg-secondary`, `text-secondary-foreground`
 * - `bg-muted`, `text-muted-foreground`
 * - `border-input`, `ring-ring`
 *
 * The `dialogist/styles.css` file already publishes the underlying `--dialogist-*`
 * variables; this preset just aliases them under the names Tailwind utilities expect.
 */
module.exports = {
  theme: {
    extend: {
      colors: {
        background: "var(--dialogist-bg-paper)",
        foreground: "var(--dialogist-text-primary)",
        primary: {
          DEFAULT: "var(--dialogist-primary-main)",
          foreground: "var(--dialogist-primary-contrastText)",
        },
        secondary: {
          DEFAULT: "var(--dialogist-secondary-main)",
          foreground: "var(--dialogist-secondary-contrastText)",
        },
        muted: {
          DEFAULT: "var(--dialogist-bg-secondary)",
          foreground: "var(--dialogist-text-secondary)",
        },
        accent: {
          DEFAULT: "var(--dialogist-bg-secondary)",
          foreground: "var(--dialogist-text-primary)",
        },
        border: "color-mix(in srgb, var(--dialogist-text-primary) 12%, transparent)",
        input: "color-mix(in srgb, var(--dialogist-text-primary) 20%, transparent)",
        ring: "var(--dialogist-primary-main)",
      },
      borderRadius: {
        dialogist: "var(--dialogist-border-radius)",
      },
    },
  },
};
