// ---------------------------------------------------------------------------
// Mori ― Navigation definition (single source of truth)
//
// Split into three distinct roles so no single nav surface mixes destinations
// with actions, and no link appears in more than one place:
//   - browseNavItems   → where you GO (desktop top bar, mobile bottom tabs)
//   - actionNavItems   → things you DO (desktop pills, mobile "Support" section)
//   - sisterNavItems   → other network sites (mobile "Our Sites" + footer)
// ---------------------------------------------------------------------------

export interface NavItem {
  label: string;
  href: string;
  title?: string;
  icon?: string;
  description?: string;
  children?: NavItem[];
  external?: boolean;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

/** Primary destinations — persistent nav (top bar / bottom tabs). */
export const browseNavItems: NavItem[] = [
  { label: "Home", href: "/", icon: "Home" },
  { label: "Movies", href: "/movies", icon: "Film" },
  { label: "TV Shows", href: "/tv", icon: "Tv" },
  { label: "Collections", href: "/collections", icon: "Library" },
];

/** Actions / utility — desktop pills + mobile "Support" hamburger section. */
export const actionNavItems: NavItem[] = [
  {
    label: "Support Us",
    href: "https://ko-fi.com/enichhh",
    icon: "Heart",
    external: true,
  },
  {
    label: "Feedback",
    href: "https://the-network-cwy.pages.dev/feedback",
    icon: "MessageSquare",
    external: true,
  },
];

/** Sister sites — mobile "Our Sites" hamburger section + footer. */
export const sisterNavItems: NavItem[] = [
  {
    label: "Anime",
    href: "https://necros.pages.dev",
    icon: "Swords",
    external: true,
  },
  {
    label: "Manga",
    href: "https://kageru.pages.dev",
    icon: "BookOpen",
    external: true,
  },
  {
    label: "Pinoy Movies",
    href: "https://silip.pages.dev",
    icon: "Globe",
    external: true,
  },
];

// ---------------------------------------------------------------------------
// Backward-compatible exports (used by Header / Footer / other importers)
// ---------------------------------------------------------------------------

/** Combined desktop list: browse + actions + sister sites. */
export const mainNavigation: NavItem[] = [
  ...browseNavItems,
  ...actionNavItems,
  ...sisterNavItems,
];

/** @deprecated Use browseNavItems / actionNavItems / sisterNavItems */
export const mainNav = mainNavigation;

export const mainNavItems = mainNavigation;

/** @deprecated Use browseNavItems (bottom tab bar) */
export const mobileNavigation: NavItem[] = [...browseNavItems];

export const mobileNavItems = mobileNavigation;

// ---------------------------------------------------------------------------
// Footer link sections
// ---------------------------------------------------------------------------

export const footerLinks: NavItem[] = [
  { label: "Movies", href: "/movies" },
  { label: "TV Shows", href: "/tv" },
  { label: "Collections", href: "/collections" },
  ...sisterNavItems,
];

export const footerNav: NavSection[] = [
  {
    title: "Browse",
    items: footerLinks,
  },
  {
    title: "Genres",
    items: [
      { label: "Action", href: "/genre/action" },
      { label: "Comedy", href: "/genre/comedy" },
      { label: "Drama", href: "/genre/drama" },
      { label: "Horror", href: "/genre/horror" },
      { label: "Animation", href: "/genre/animation" },
    ],
  },
  {
    title: "Collections",
    items: [
      { label: "Marvel (MCU)", href: "/collections?q=mcu" },
      { label: "Harry Potter", href: "/collections?q=harry-potter" },
      { label: "Star Wars", href: "/collections?q=star-wars" },
      { label: "Lord of the Rings", href: "/collections?q=lotr" },
      { label: "Fast & Furious", href: "/collections?q=fast" },
    ],
  },
];
