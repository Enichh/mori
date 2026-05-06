import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Mori — Stream Movies, TV Shows & Anime",
    template: "%s | Mori",
  },
  description:
    "Stream the latest Movies, TV Shows, and Anime in stunning quality. Powered by TMDB with a fast, beautiful player.",
  keywords: ["movies", "tv shows", "anime", "streaming", "watch free", "mori"],
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "Mori — Stream Movies, TV Shows & Anime",
    description:
      "Stream the latest Movies, TV Shows, and Anime in stunning quality.",
    siteName: "Mori",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mori — Stream Movies, TV Shows & Anime",
    description:
      "Stream the latest Movies, TV Shows, and Anime in stunning quality.",
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" data-scroll-behavior="smooth">
      <head>
        <link
          rel="preconnect"
          href="https://www.vidking.net"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://multiembed.mov"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://streamingnow.mov"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://player.embed-api.stream"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://www.2embed.cc"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://mostream.us"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://streamvaultsrc.click"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://ezvidapi.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://embedmaster.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://image.tmdb.org"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://www.vidking.net" />
        <link rel="dns-prefetch" href="https://multiembed.mov" />
        <link rel="dns-prefetch" href="https://image.tmdb.org" />
      </head>
      <body className="font-body bg-background text-foreground min-h-screen">
        {children}
      </body>
    </html>
  );
}
