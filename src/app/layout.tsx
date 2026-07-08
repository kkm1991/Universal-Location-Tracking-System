import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

// Import leaflet CSS locally to avoid CDN blocking
import "leaflet/dist/leaflet.css";

export const metadata: Metadata = {
  title: "Universal Tracker | Real-time Location Tracking",
  description: "Track people, vehicles, and assets in real-time with enterprise-grade security and multi-tenant isolation.",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Preconnect to tile servers for faster initial load */}
        <link rel="preconnect" href="https://a.tile.openstreetmap.org" />
        <link rel="preconnect" href="https://b.tile.openstreetmap.org" />
        <link rel="preconnect" href="https://c.tile.openstreetmap.org" />
        <link rel="dns-prefetch" href="https://a.tile.openstreetmap.org" />
        <link rel="dns-prefetch" href="https://b.tile.openstreetmap.org" />
        <link rel="dns-prefetch" href="https://c.tile.openstreetmap.org" />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased bg-[#0a0a0f] text-[#f1f5f9] min-h-screen selection:bg-indigo-500/30 selection:text-white`}
      >
        {children}
      </body>
    </html>
  );
}
