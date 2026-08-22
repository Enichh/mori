import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { AD_CONFIG } from "@/config/ads";
import { SisterSitesModal } from "@/components/layout/sister-sites-modal";
import { Inter_Tight, JetBrains_Mono, PT_Serif } from "next/font/google";
import "./globals.css";

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-body",
});

const ptSerif = PT_Serif({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-heading",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-mono",
});

const GA_ID = "G-C6KT3V4GW5";

export const metadata: Metadata = {
  title: {
    default: "Mori — Watch Free Movies, TV Shows & Anime Online in HD",
    template: "%s",
  },
  description:
    "Stream free movies, TV shows, anime & drama online in HD. No sign-up. Watch now on Mori.",
  keywords: [
    "free movies",
    "watch online",
    "streaming",
    "TV shows",
    "anime",
    "drama",
    "tagalog dubbed",
    "HD",
    "Mori",
    "sports streaming",
    "live sports",
    "NBA streams",
    "NFL streams",
    "UFC streams",
    "football streams",
  ],
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "Mori — Watch Free Movies, TV Shows & Anime Online in HD",
    description:
      "Stream free movies, TV shows, anime & drama online in HD. No sign-up.",
    siteName: "Mori",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mori — Watch Free Movies, TV Shows & Anime Online in HD",
    description:
      "Stream free movies, TV shows, anime & drama online in HD. No sign-up.",
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
    <html
      lang="en"
      className={`dark ${interTight.variable} ${ptSerif.variable} ${jetbrainsMono.variable}`}
      data-scroll-behavior="smooth"
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta
          name="google-site-verification"
          content="z610VJnXqK14_YxsE__qgJwPHOUxSJIcDhjFmO9MHis"
        />
        <link
          rel="preconnect"
          href="https://111movies.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://111movies.net"
          crossOrigin="anonymous"
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
          href="https://www.2embed.cc"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://111movies.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://player.videasy.net"
          crossOrigin="anonymous"
        />

        <link
          rel="preconnect"
          href="https://vidsrc.mov"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://vidlink.pro"
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
        <link
          rel="preconnect"
          href="https://cdnlivetv.tv"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://www.vidking.net" />
        <link rel="dns-prefetch" href="https://multiembed.mov" />
        <link rel="dns-prefetch" href="https://image.tmdb.org" />
        <link rel="dns-prefetch" href="https://api.cdnlivetv.ru" />
      </head>
      <body className="font-body bg-background text-foreground min-h-screen">
        {/* ── Leaderboard (728×90, desktop) ── */}
        <script
          async
          data-cfasync="false"
          src={AD_CONFIG.leaderboard.scriptSrc}
        />
        {/* ── Popunder ── */}
        <script async data-cfasync="false" src={AD_CONFIG.popunder.scriptSrc} />
        {children}
        <SisterSitesModal />
        {/* ── Social Bar ── */}
        <script async data-cfasync="false" src={AD_CONFIG.socialBar.scriptSrc} />
        {/* ── Mobile Banner (320×50) ── */}
        <script async data-cfasync="false" src={AD_CONFIG.mobileBanner.scriptSrc} />
      </body>
      <GoogleAnalytics gaId={GA_ID} />
    </html>
  );
}
