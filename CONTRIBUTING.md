# Contributing

Project conventions, testing, and layout rules: [AGENTS.md](./AGENTS.md).

## Run the demo locally

The interactive docs app is in [`demo/nextjs`](./demo/nextjs). From the repository root:

```bash
npm install
cd demo/nextjs && npm install && cd ../..
npm run demo:nextjs
```

Open http://localhost:5607. A smaller adapter-only Vite app lives in [`demo/minimal-adapters`](./demo/minimal-adapters).

Issues and pull requests are welcome. For larger changes, open an issue first so we can align on direction. Please run all tests (add or update tests to cover your changes) and update the demo app if applicable. All code accepted to `main` must be reviewed by a human.

If you contribute to this project, you agree to adhere to the [ethical use](./README.md#ethical-use) terms.

## Publishing (maintainers)

1. **Bump the version** (updates root `package.json`, `package-lock.json`, and the **Package version** line in the readme):

   ```bash
   ./scripts/version.sh X.Y.Z
   ```

2. **Sanity-check** tests, types, and what would be published:

   ```bash
   npm test
   npm run typecheck
   npm run release:dry-run
   ```

   Extra `npm publish` flags go after `--`, for example `npm run release -- --dry-run --tag beta`.

   Avoid naming an npm script `publish`: `npm publish` runs the package **publish** lifecycle and would recurse into that script.

3. **Publish** when logged into npm with permission to publish `dialogist`:

   ```bash
   npm run release
   ```

   Prefer the GitHub Actions path below. Do not `npm publish` locally unless you have a specific reason.

4. **Tag and GitHub Release** (after the version bump is on `main`):

   ```bash
   git tag -a vX.Y.Z -m "Release vX.Y.Z"
   git push origin main
   git push origin vX.Y.Z
   gh release create vX.Y.Z --title "vX.Y.Z" --generate-notes --latest
   ```

   A git tag is not a GitHub Release. Pushing `v*` publishes npm via [`.github/workflows/publish.yml`](./.github/workflows/publish.yml). The repo sidebar Releases list only updates if you also run `gh release create`.

### Automated publishing with GitHub Actions

CI builds and publishes to npm when a tag matching `v*` is pushed. The workflow:

- Ensures the tag version matches the `package.json` version
- Runs the full build (`npm run build`)
- Publishes with OIDC (see the workflow for the current auth setup)

**How it works**

1. Create a new version locally (for example `./scripts/version.sh X.Y.Z`).
2. Push the commit **and** the annotated tag to GitHub.
3. GitHub Actions runs `publish.yml` and publishes the package.

The workflow file lives at `.github/workflows/publish.yml`.
