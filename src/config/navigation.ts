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
  external?: boolean;
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
  { title: "Collections", label: "Collections", href: "/collections", icon: "Library" },
  { title: "Anime", label: "Anime", href: "https://necros.pages.dev", icon: "Swords", external: true },
  { title: "Drama", label: "Drama", href: "/drama", icon: "Drama" },
  {
    title: "Pinoy Movies",
    label: "Pinoy Movies",
    href: "https://silip.pages.dev",
    icon: "Globe",
    external: true,
  },
];

/** @deprecated Use mainNavigation */
export const mainNav = mainNavigation;

export const mainNavItems = mainNavigation;

/** Mobile bottom navigation. */
export const mobileNavigation: NavItem[] = [
  { title: "Home", label: "Home", href: "/", icon: "House" },
  { title: "Movies", label: "Movies", href: "/movies", icon: "Film" },
  { title: "TV", label: "TV", href: "/tv", icon: "Tv" },
  { title: "Collections", label: "Collections", href: "/collections", icon: "Library" },
  { title: "Anime", label: "Anime", href: "https://necros.pages.dev", icon: "Swords", external: true },
  { title: "Drama", label: "Drama", href: "/drama", icon: "Drama" },
  {
    title: "Pinoy Movies",
    label: "Pinoy Movies",
    href: "https://silip.pages.dev",
    icon: "Globe",
    external: true,
  },
  { title: "Search", label: "Search", href: "/search", icon: "Search" },
];

export const mobileNavItems = mobileNavigation;

/** Footer link sections. */
export const footerLinks: NavItem[] = [
  { label: "Movies", href: "/movies" },
  { label: "TV Shows", href: "/tv" },
  { label: "Collections", href: "/collections" },
  { label: "Anime", href: "https://necros.pages.dev", external: true },
  { label: "Drama", href: "/drama" },
  { label: "Pinoy Movies", href: "https://silip.pages.dev", external: true },
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
