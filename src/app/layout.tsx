import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

const GA_ID = "G-C6KT3V4GW5";

export const metadata: Metadata = {
  title: {
    default: "Mori — Watch Free Movies, TV Shows & Anime Online in HD",
    template: "%s",
  },
  description:
    "Stream free movies, TV shows, anime, Pinoy teleserye & KDrama online in HD. No sign-up. Watch now on Mori.",
  keywords: [
    "free movies",
    "watch online",
    "streaming",
    "TV shows",
    "anime",
    "pinoy tambayan",
    "pinoy teleserye",
    "kdrama",
    "tagalog dubbed",
    "HD",
    "Mori",
  ],
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "Mori — Watch Free Movies, TV Shows & Anime Online in HD",
    description:
      "Stream free movies, TV shows, anime, Pinoy teleserye & KDrama online in HD. No sign-up.",
    siteName: "Mori",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mori — Watch Free Movies, TV Shows & Anime Online in HD",
    description:
      "Stream free movies, TV shows, anime, Pinoy teleserye & KDrama online in HD. No sign-up.",
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://morimovie.netlify.app",
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
        <meta
          name="google-site-verification"
          content="z610VJnXqK14_YxsE__qgJwPHOUxSJIcDhjFmO9MHis"
        />
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
          href="https://vidsrc.mov"
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
        <script
          async
          src="https://pl29360734.profitablecpmratenetwork.com/1d/8c/65/1d8c6541dcf8fe08a691fdd72627a917.js"
        />
        <script
          async
          src="https://pl29360736.profitablecpmratenetwork.com/b4/a0/18/b4a018fd53e73b05da8c99c85735b46f.js"
        />
        {children}
      </body>
      <GoogleAnalytics gaId={GA_ID} />
    </html>
  );
}
