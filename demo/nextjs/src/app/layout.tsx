import type { Metadata, Viewport } from "next";
import { Lexend } from "next/font/google";

import "./globals.css";

import { ClientProviders } from "../components/common/ClientProviders";
import { DemoAppShell } from "../components/common/DemoAppShell";

const lexend = Lexend({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const withBasePath = (path: string): string => {
  return `${basePath}${path}`;
};

export const metadata: Metadata = {
  title: "Dialogist demo & docs",
  description: "Demo application showcasing Dialogist dialog management",
  icons: {
    icon: [
      { url: withBasePath("/favicon.svg"), type: "image/svg+xml" },
      { url: withBasePath("/favicon-96x96.png"), sizes: "96x96", type: "image/png" },
    ],
    shortcut: [withBasePath("/favicon.ico")],
    apple: [{ url: withBasePath("/apple-touch-icon.png"), sizes: "180x180", type: "image/png" }],
    other: [
      {
        rel: "mask-icon",
        url: withBasePath("/favicon.svg"),
        color: "#1976d2",
      },
    ],
  },
  manifest: withBasePath("/manifest.json"),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1976d2",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={lexend.variable} suppressHydrationWarning>
        {/* suppressHydrationWarning avoids hydration errors when browser extensions (e.g. Cursor) inject attributes like data-cursor-element-id into the DOM */}
        <div id="__app__" suppressHydrationWarning>
          <ClientProviders>
            <DemoAppShell />
            {children}
          </ClientProviders>
        </div>
      </body>
    </html>
  );
}
