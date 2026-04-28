import path from "path";
import { fileURLToPath } from "url";

// Force Dialogist and the app to share ONE copy of MUI and Emotion by pointing
// aliases to the app's node_modules directories (not concrete file paths).
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..");
const demoNodeModules = path.resolve(__dirname, "node_modules");
const isGitHubPages = process.env.GITHUB_PAGES === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? (isGitHubPages ? "/dialogist" : "");

/** Force shared packages to resolve from the demo app, even when Next infers the repo as workspace root. */
const sharedAliases = {
  "dialogist$": path.resolve(repoRoot, "src/index.ts"),
  "dialogist/classes$": path.resolve(repoRoot, "src/classes.ts"),
  "@mui/material": path.resolve(demoNodeModules, "@mui/material"),
  "@mui/system": path.resolve(demoNodeModules, "@mui/system"),
  "@mui/utils": path.resolve(demoNodeModules, "@mui/utils"),
  "@emotion/react": path.resolve(demoNodeModules, "@emotion/react"),
  "@emotion/styled": path.resolve(demoNodeModules, "@emotion/styled"),
  "deepmerge-ts": path.resolve(demoNodeModules, "deepmerge-ts"),
  "#dialogist": path.resolve(repoRoot, "src"),
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  ...(isGitHubPages
    ? {
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
    "@mui/material-nextjs",
    "@mui/system",
    "@mui/utils",
    "@emotion/react",
    "@emotion/styled",
  ],
  outputFileTracingRoot: repoRoot,
  experimental: { externalDir: true },
  turbopack: { resolveAlias: sharedAliases },
  // For Webpack (non-Turbopack) builds, e.g. `next build` without Turbopack
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = { ...(config.resolve.alias || {}), ...sharedAliases };
    return config;
  },
};

export default nextConfig;
