import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const extraArgs = process.argv.slice(2);

const pkgPath = join(root, "package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
const name = pkg.name;
if (typeof name !== "string" || !name) {
  console.error("publish-package: package.json is missing a string name");
  process.exit(1);
}

/** @param {string} cmd @param {string[]} args */
const run = (cmd, args) => {
  const result = spawnSync(cmd, args, { cwd: root, stdio: "inherit", shell: false });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
};

run("npm", ["run", "build"]);

const publishArgs = ["publish", ...extraArgs];
if (name.startsWith("@")) {
  publishArgs.splice(1, 0, "--access", "public");
}

run("npm", publishArgs);
