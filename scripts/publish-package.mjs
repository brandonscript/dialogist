import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const extraArgs = process.argv.slice(2);
const isDryRun = extraArgs.includes("--dry-run");
const skipTagCheck = process.env.SKIP_RELEASE_TAG_CHECK === "1";

const pkgPath = join(root, "package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
const name = pkg.name;
if (typeof name !== "string" || !name) {
  console.error("publish-package: package.json is missing a string name");
  process.exit(1);
}

if (typeof pkg.version !== "string" || !pkg.version) {
  console.error("publish-package: package.json is missing a valid version");
  process.exit(1);
}

/** Require a git tag v{version} on HEAD before a real publish (skipped for --dry-run). */
const assertReleaseGitTag = (version) => {
  if (skipTagCheck || isDryRun) return;
  const tag = `v${version}`;
  const tagOk = spawnSync("git", ["rev-parse", "-q", "--verify", `refs/tags/${tag}`], {
    cwd: root,
  });
  if (tagOk.status !== 0) {
    console.error(`publish-package: missing git tag ${tag} for ${name}@${version}.`);
    console.error(
      `  Create it on the release commit, then push: git tag -a ${tag} -m "Release ${version}" && git push origin ${tag}`,
    );
    console.error(`  (Override: SKIP_RELEASE_TAG_CHECK=1 npm run release)`);
    process.exit(1);
  }
  const atHead = spawnSync("git", ["describe", "--tags", "--exact-match", "HEAD"], {
    cwd: root,
    encoding: "utf8",
  });
  const headTag = atHead.stdout?.trim();
  if (atHead.status !== 0 || headTag !== tag) {
    console.error(
      `publish-package: HEAD must match release tag ${tag} (current: ${headTag || "not exactly tagged"}).`,
    );
    console.error(
      `  Check out the tagged commit or tag this commit: git tag -a ${tag} -m "Release ${version}"`,
    );
    process.exit(1);
  }
};

assertReleaseGitTag(pkg.version);

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
