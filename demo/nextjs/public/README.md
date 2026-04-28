# Icons

This directory contains the favicon and app icons for the Dialogist Demo.

## Files

- `favicon.ico` - Classic ICO favicon for broad browser support
- `favicon.svg` - Modern SVG favicon (scales cleanly)
- `favicon-96x96.png` - PNG favicon for contexts that prefer raster icons
- `apple-touch-icon.png` - Apple touch icon (180x180)
- `web-app-manifest-192x192.png` - PWA manifest icon (192x192, maskable)
- `web-app-manifest-512x512.png` - PWA manifest icon (512x512, maskable)
- `manifest.json` - Web app manifest for PWA support

## Design

The icon represents a dialog window with:

- Blue primary color (#1976d2) background
- White dialog window with gray title bar
- Red close button
- Content lines representing text
- Cancel (gray) and Confirm (blue) buttons

## Browser support

- Modern browsers: SVG and/or ICO favicon via `layout.tsx` metadata
- iOS devices: `apple-touch-icon.png`
- PWA install: `manifest.json` with PNG maskable icons plus SVG where supported
