#!/bin/bash

# Script to clean up test artifacts and build files

echo "Cleaning up test artifacts and build files..."

# Remove test results
rm -rf tests/e2e/test-results/
rm -rf tests/e2e/html-report/
rm -rf test-results/
rm -rf playwright-report/

# Remove build artifacts
rm -rf packages/*/dist/
rm -rf demos/*/dist/
rm -rf docs/static/

# Remove node_modules from packages (keep root)
find packages/ -name "node_modules" -type d -exec rm -rf {} +
find demos/ -name "node_modules" -type d -exec rm -rf {} +

# Remove coverage reports
rm -rf coverage/

echo "✓ Cleanup complete"


