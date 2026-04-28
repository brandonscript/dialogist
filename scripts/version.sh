#!/bin/bash

# A simple script to set the version across all packages
# Usage: ./scripts/version.sh [version]

if [ -z "$1" ]; then
  echo "Usage: $0 <version>"
  echo "Example: $0 1.2.3"
  exit 1
fi

NEW_VERSION="$1"

# Validate semantic version format
if ! [[ $NEW_VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?(\+[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?$ ]]; then
  echo "Error: Invalid semantic version format. Expected format: X.Y.Z"
  exit 1
fi

echo "Setting version to $NEW_VERSION across all packages..."

# Update root package.json
jq --arg version "$NEW_VERSION" '.version = $version' package.json > package.json.tmp && mv package.json.tmp package.json

# Single package - only root package.json to update
echo "✓ Single package version updated"

echo "✓ Version updated to $NEW_VERSION"
echo "Remember to commit these changes and create a git tag:"
echo "  git add ."
echo "  git commit -m \"chore: bump version to $NEW_VERSION\""
echo "  git tag v$NEW_VERSION"
