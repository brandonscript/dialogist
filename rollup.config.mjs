import alias from "@rollup/plugin-alias";
import babel from "@rollup/plugin-babel";
import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import { readFileSync } from "node:fs";
import { dirname, resolve as resolvePath } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const replaceEntries = () => ({
  preventAssignment: true,
  delimiters: ["", ""],
  include: ["src/**/*.ts", "src/**/*.tsx"],
  "process.env.NODE_ENV": JSON.stringify("production"),
});

const hasUseClientDirective = (fileName) => {
  if (!fileName || !/[/\\]src[/\\].+\.[tj]sx?$/.test(fileName)) return false;
  return readFileSync(fileName, "utf8").trimStart().startsWith('"use client";');
};

const preserveUseClientDirectives = () => ({
  name: "preserve-use-client-directives",
  renderChunk(code, chunk) {
    if (!hasUseClientDirective(chunk.facadeModuleId) || code.startsWith('"use client";')) {
      return null;
    }

    return {
      code: `"use client";\n${code}`,
      map: null,
    };
  },
});

export default {
  input: [
    "src/index.ts",
    "classes.ts",
    "src/adapters/mui/index.ts",
    "src/adapters/base-ui/index.ts",
    "src/adapters/shadcn/index.ts",
    "src/adapters/shadcn/templates/dialog.tsx",
    "src/adapters/tailwind/index.ts",
  ],
  output: [
    {
      dir: "dist",
      format: "es",
      exports: "named",
      sourcemap: true,
      strict: false,
      preserveModules: true,
      entryFileNames: "[name].js",
      globals: {
        "react/jsx-runtime": "jsxRuntime",
        "react-dom/client": "ReactDOM",
        react: "React",
      },
    },
  ],
  plugins: [
    json(),
    peerDepsExternal(),
    resolve({
      extensions: [".ts", ".tsx"],
      dedupe: ["react", "react-dom", "@mui/material", "@mui/system", "@emotion/*"],
    }),
    alias({
      entries: [
        {
          find: "#dialogist",
          replacement: resolvePath(__dirname, "src"),
        },
      ],
    }),
    babel({
      extensions: [".ts", ".tsx"],
      babelHelpers: "bundled",
      exclude: ["node_modules/**", "dist/**", "demo/**", "tests/**"],
      include: ["src/**"],
      presets: [
        "@babel/preset-env",
        [
          "@babel/preset-react",
          {
            runtime: "automatic",
          },
        ],
        "@babel/preset-typescript",
      ],
    }),
    replace(replaceEntries()),
    preserveUseClientDirectives(),
  ],
  external: ["react", "react-dom", /^@mui\/.*$/, /^@emotion\/.*$/, /^@base-ui-components\/.*$/],
  onwarn(warning, warn) {
    if (warning.code === "MODULE_LEVEL_DIRECTIVE" && warning.message.includes('"use client"')) {
      return;
    }

    warn(warning);
  },
};
