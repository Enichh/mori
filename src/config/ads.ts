// ---------------------------------------------------------------------------
// Mori ― Ad Configuration (planetsrecipe.com / Adsterra)
// ---------------------------------------------------------------------------
//
// AD ZONES:
//   1  Native Banner  ― placed below header (main layout) + bottom of watch pages
//   2  Social Bar     ― global, right before </body>
//   3  Popunder       ― global, in root layout
//   4  Leaderboard    ― global, top of body (728×90, desktop)
//   5  Mobile Banner  ― global, before </body> (320×50, mobile)
//   6  Smartlink      ― footer link + watch fallback
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

  leaderboard: {
    key: "71dc6385b2c0c75d52ba9fd2a82528b4",
    scriptSrc:
      "https://planetsrecipe.com/71dc6385b2c0c75d52ba9fd2a82528b4/invoke.js",
  },

  mobileBanner: {
    key: "3088bbf776fc5356b5244c8814e8a099",
    scriptSrc:
      "https://planetsrecipe.com/3088bbf776fc5356b5244c8814e8a099/invoke.js",
  },

  smartlink: {
    url: "https://planetsrecipe.com/sr7uxc6yf?key=9d98f7dfb8f91a8589fa910ec585b635",
  },
} as const;
