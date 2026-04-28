#!/bin/bash

# Bump version for the published package: root package.json, package-lock.json,
# and the README package version line.
# Usage: ./scripts/version.sh <version>
# Run from the repository root.

set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <version>"
  echo "Example: $0 1.2.3"
  exit 1
fi

NEW_VERSION="$1"

if ! [[ $NEW_VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?(\+[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?$ ]]; then
  echo "Error: Invalid semantic version format. Expected X.Y.Z or a valid semver with prerelease/build."
  exit 1
fi

git_root=$(git rev-parse --show-toplevel 2>/dev/null) || git_root=""
if [ -n "$git_root" ]; then
  cd "$git_root" || exit 1
fi

echo "Setting version to $NEW_VERSION..."

jq --arg version "$NEW_VERSION" '.version = $version' package.json > package.json.tmp && mv package.json.tmp package.json

if [[ -f package-lock.json ]]; then
  jq --arg version "$NEW_VERSION" '.version = $version | .packages[""].version = $version' package-lock.json > package-lock.json.tmp &&
    mv package-lock.json.tmp package-lock.json
fi

if [[ -f README.md ]]; then
  perl -i -pe "s/^\\*\\*Package version:\\*\\* .*/**Package version:** $NEW_VERSION/" README.md
fi

echo "✓ Version updated to $NEW_VERSION"
echo ""
echo "Next steps:"
echo "  1. Review: git diff"
echo "  2. Commit: git add package.json package-lock.json README.md && git commit -m \"chore: bump version to $NEW_VERSION\""
echo "  3. Tag:   git tag -a \"v$NEW_VERSION\" -m \"v$NEW_VERSION\""
echo "  4. Push:  git push origin main && git push origin \"v$NEW_VERSION\""
echo "  5. Release (GitHub CLI): gh release create \"v$NEW_VERSION\" --title \"v$NEW_VERSION\" --generate-notes"
echo "  6. Publish: npm run release   # or npm run release:dry-run first"
