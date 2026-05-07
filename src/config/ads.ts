// ---------------------------------------------------------------------------
// Mori ― Ad Configuration (planetsrecipe.com / Adsterra)
// ---------------------------------------------------------------------------
//
// AD ZONES:
//   1  Native Banner  ― placed below header (main layout) + bottom of watch pages
//   2  Social Bar     ― global, in root layout
//   3  Popunder       ― global, in root layout
//   4  Smartlink      ― footer link + watch fallback
//
// Native Banner uses a container-div pattern. Each invoke.js targets a
// specific container ID. The same ID may appear on different pages,
// just not twice on the same page.
// ---------------------------------------------------------------------------

export const AD_CONFIG = {
  nativeBanner: {
    containerId: "container-5c5604d861e766bf948b2109b8b3c63c",
    scriptSrc:
      "https://planetsrecipe.com/5c5604d861e766bf948b2109b8b3c63c/invoke.js",
  },

  socialBar: {
    scriptSrc:
      "https://planetsrecipe.com/b4/a0/18/b4a018fd53e73b05da8c99c85735b46f.js",
  },

  popunder: {
    scriptSrc:
      "https://planetsrecipe.com/1d/8c/65/1d8c6541dcf8fe08a691fdd72627a917.js",
  },

  smartlink: {
    url: "https://planetsrecipe.com/sr7uxc6yf?key=9d98f7dfb8f91a8589fa910ec585b635",
  },
} as const;
