import type React from "react";
import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://devbattle.gg"),
  title: "devbattle.gg - Real-time Coding Battles",
  description:
    "The ultimate platform for competitive programming and skill development. Join real-time coding battles, earn XP, and dominate the leaderboard.",
  keywords: [
    "coding",
    "programming",
    "battles",
    "competition",
    "developers",
    "algorithms",
  ],
  authors: [{ name: "DevBattle Team" }],
  icons: {
    icon: [
      { url: "/favicon-light.ico", media: "(prefers-color-scheme: dark)" },
      { url: "/favicon-dark.ico", media: "(prefers-color-scheme: light)" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
    other: [
      { rel: "android-chrome-192x192", url: "/android-chrome-192x192.png" },
      { rel: "android-chrome-512x512", url: "/android-chrome-512x512.png" },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "devbattle.gg - Real-time Coding Battles",
    description:
      "Join real-time coding battles, earn XP, and dominate the leaderboard.",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "devbattle.gg Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "devbattle.gg - Real-time Coding Battles",
    description:
      "Join real-time coding battles, earn XP, and dominate the leaderboard.",
  },
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.className} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
