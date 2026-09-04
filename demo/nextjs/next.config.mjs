import path from "path";
import { fileURLToPath } from "url";

// Force Dialogist and the app to share ONE copy of MUI and Emotion by pointing
// aliases to the app's node_modules directories (not concrete file paths).
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..");
const isGitHubPages = process.env.GITHUB_PAGES === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? (isGitHubPages ? "/dialogist" : "");

/** Turbopack aliases are relative to the demo app root. */
const turbopackAliases = {
  dialogist: "../../src/index.ts",
  "dialogist/classes": "../../src/classes.ts",
  "dialogist/mui": "../../src/adapters/mui/index.ts",
  "dialogist/base-ui": "../../src/adapters/base-ui/index.ts",
  "dialogist/shadcn": "../../src/adapters/shadcn/index.ts",
  "dialogist/tailwind": "../../src/adapters/tailwind/index.ts",
  "@mui/material": "./node_modules/@mui/material",
  "@mui/system": "./node_modules/@mui/system",
  "@mui/utils": "./node_modules/@mui/utils",
  "@emotion/react": "./node_modules/@emotion/react",
  "@emotion/styled": "./node_modules/@emotion/styled",
  react: "./node_modules/react",
  "react-dom": "./node_modules/react-dom",
  "react/jsx-runtime": "./node_modules/react/jsx-runtime.js",
  "react/jsx-dev-runtime": "./node_modules/react/jsx-dev-runtime.js",
  "deepmerge-ts": "./node_modules/deepmerge-ts",
  "#dialogist": "../../src",
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  ...(isGitHubPages
    ? {
        distDir: ".next-pages",
        output: "export",
        trailingSlash: true,
        basePath,
        images: {
          unoptimized: true,
        },
      }
    : {}),
  transpilePackages: [
    "dialogist",
    // Ensure a single, transpiled copy of MUI/Emotion is used across the app and dialogist
    "@mui/material",
    "@mui/system",
    "@mui/utils",
    "@emotion/react",
    "@emotion/styled",
  ],
  outputFileTracingRoot: repoRoot,
  experimental: { externalDir: true },
  turbopack: { resolveAlias: turbopackAliases },
};

export default nextConfig;
