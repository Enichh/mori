// ---------------------------------------------------------------------------
// Mori ― Navigation definition
// ---------------------------------------------------------------------------

export interface NavItem {
  label: string;
  href: string;
  title?: string;
  icon?: string;
  description?: string;
  children?: NavItem[];
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

/** Primary top-level navigation (used by Header). */
export const mainNavigation: NavItem[] = [
  { title: "Home", label: "Home", href: "/", icon: "House" },
  { title: "Movies", label: "Movies", href: "/movies", icon: "Film" },
  { title: "TV Shows", label: "TV Shows", href: "/tv", icon: "Tv" },
  { title: "Anime", label: "Anime", href: "/anime", icon: "Swords" },
  { title: "Pinoy", label: "Pinoy 🇵🇭", href: "/pinoy", icon: "Flag" },
  { title: "KDrama", label: "KDrama 🇰🇷", href: "/kdrama", icon: "Drama" },
];

/** @deprecated Use mainNavigation */
export const mainNav = mainNavigation;

export const mainNavItems = mainNavigation;

/** Mobile bottom navigation. */
export const mobileNavigation: NavItem[] = [
  { title: "Home", label: "Home", href: "/", icon: "House" },
  { title: "Movies", label: "Movies", href: "/movies", icon: "Film" },
  { title: "TV", label: "TV", href: "/tv", icon: "Tv" },
  { title: "Anime", label: "Anime", href: "/anime", icon: "Swords" },
  { title: "Pinoy", label: "Pinoy 🇵🇭", href: "/pinoy", icon: "Flag" },
  { title: "KDrama", label: "KDrama 🇰🇷", href: "/kdrama", icon: "Drama" },
  { title: "Search", label: "Search", href: "/search", icon: "Search" },
];

export const mobileNavItems = mobileNavigation;

/** Footer link sections. */
export const footerLinks: NavItem[] = [
  { label: "Movies", href: "/movies" },
  { label: "TV Shows", href: "/tv" },
  { label: "Anime", href: "/anime" },
  { label: "Pinoy 🇵🇭", href: "/pinoy" },
  { label: "KDrama 🇰🇷", href: "/kdrama" },
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
];
