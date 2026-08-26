# AGENTS.md — Mori

> Durable guidance for AI coding agents and contributors. Written from a
> direct inspection of the source tree, manifests, and configs; treat this as
> the source of truth for the current repository.

## What this project is

Mori is a **free, no-sign-up streaming web app** for movies, TV shows, anime,
drama, and live sports. It is a **static** Next.js front-end with **no
backend** of its own: all media metadata comes from external APIs (primarily
TMDB), anime stream URLs come from the 1Anime CDN, sports come from the
cdnlivetv API, and video playback is delegated to third-party iframe embed
providers. Monetization is via Adsterra ad zones served through
`planetsrecipe.com`.

Core capabilities:

- Browse/trending/collection pages for movies, TV, anime, drama (KDrama),
  and collections.
- Full detail + watch pages for each media type, with multiple embed-server
  fallbacks.
- Live sports categories (basketball, football/`soccer`, baseball, hockey,
  american-football/`nfl`, fight/`ufc`, tennis, golf, cricket, rugby,
  motorsport, afl, darts, billiards) driven by cached JSON feeds.
- Client-side watch progress + watch history persisted to `localStorage`.
- Dark theme with a lime-green accent (`#C5FF4A`), a "cinematic terminal"
  aesthetic (scanlines, marquee, ASCII-float animations).
- Static export deploy to Netlify with edge-cached API proxies.

## Tech stack

| Layer | Technology | Version (pinned in `package-lock.json`) |
|---|---|---|
| Framework | Next.js (App Router) | `^15.1.0` |
| Runtime | React | `^19.0.0` |
| Language | TypeScript (strict) | `^5.7.0` |
| Styling | Tailwind CSS | `^3.4.0` |
| Typography plugin | `@tailwindcss/typography` | `^0.5.15` |
| Icons | `lucide-react` | `^0.468.0` |
| Video playback | `hls.js` | `^1.6.16` |
| Class merging | `clsx` + `tailwind-merge` | `^2.1.1` / `^2.6.0` |
| Google Analytics | `@next/third-parties` | `^16.2.5` |
| Testing | Vitest | `^2.1.0` |
| Build tooling | `eslint` 9 + `eslint-config-next`, `postcss`, `autoprefixer` | see `package.json` |
| Package manager | npm (`package-lock.json`, lockfileVersion 3) | — |
| Deploy target | Netlify (static export) | see `netlify.toml` |

There is **no database**. There is also **no** React state library (no Redux /
Zustand / Jotai) and no server-side runtime — this is a pure static client.

## How to run

All commands are npm scripts defined in `package.json`.

```bash
npm install            # install dependencies

npm run dev            # local dev server at http://localhost:3000
npm run build          # production build (server mode)
NEXT_EXPORT=true npm run build   # static export -> ./out (what Netlify runs)
npm start              # serve a production build (requires npm run build first)

npm run lint           # lint (eslint-config-next)

npm run test           # run Vitest once
npm run test:watch     # Vitest in watch mode

npm run test:providers # node test-providers.mjs — live embed-provider health check
```

### Required environment variables

Create `.env.local` (git-ignored — see `.gitignore`, which ignores all
`.env*` except `.env.example`):

```
TMDB_API_KEY=your_tmdb_api_key        # server-side source of truth
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Two TMDB key conventions exist in the codebase; note both:

- The **service layer** (`src/services/tmdb/client.ts` `envApiKey()`) checks
  `TMDB_API_KEY` first, then falls back to `NEXT_PUBLIC_TMDB_API_KEY`.
- The **home page** (`src/app/(main)/home-client.tsx`) reads
  `NEXT_PUBLIC_TMDB_API_KEY` directly (see "Known drift").

Without a TMDB key, the app still boots but media grids render empty. The
Google Analytics ID `G-C6KT3V4GW5` is **hardcoded** in `src/app/layout.tsx`
(no env var).

### External services / network dependencies

Everything is proxied client-side or via Netlify redirects; no local services
to start. Network origins are declared in `next.config.ts` (`rewrites`) and
`netlify.toml` (`[[redirects]]`). See "External API map" below.

## Directory structure

```
mori/
├── package.json / package-lock.json   # deps + scripts (npm)
├── tsconfig.json                      # path aliases @/* -> ./src/*, plus per-scope aliases
├── next.config.ts                     # static-export toggle, rewrites, image hosts
├── netlify.toml                       # deploy, cache headers, API redirects
├── tailwind.config.ts                 # design tokens (colors/fonts/animations)
├── postcss.config.js                  # tailwind + autoprefixer
├── vitest.config.ts                   # node env, @ alias
├── test-providers.mjs                 # pre-deploy embed provider health check
│
└── src/                               # ALL application source lives here
    ├── app/                           # Next.js App Router (routes & layouts)
    │   ├── layout.tsx                 # root layout: fonts, ads, GA, preconnects
    │   ├── globals.css                # Tailwind base/components, design system
    │   ├── error.tsx / not-found.tsx  # error + 404 pages
    │   ├── loading.tsx                # global loading UI
    │   ├── robots.ts / sitemap.ts     # SEO
    │   ├── (main)/                    # route group: browsable public pages
    │   │   ├── layout.tsx             # header/footer/mobile-nav wrapper
    │   │   ├── page.tsx               # (server shell) -> home-client.tsx
    │   │   ├── home-client.tsx        # "use client" home data fetch
    │   │   ├── movies/  tv/  anime/  drama/  collections/  search/
    │   │   ├── dmca/  privacy/
    │   │   └── ...                    # each has page.tsx + *-client.tsx
    │   ├── (watch)/                   # route group: immersive watch pages
    │   │   ├── layout.tsx             # "use client" back-bar overlay
    │   │   └── watch/{movie,tv,anime,sport}/[id]/
    │   └── api/watch-progress/        # EMPTY — route removed, client-only now
    │
    ├── components/                    # React components grouped by domain
    │   ├── layout/                    # header, footer, sidebar, mobile-nav, sister-sites-modal
    │   ├── media/                     # media-card, media-grid, media-hero, cast/season/episode lists, watch-history, recommendations
    │   ├── player/                    # video players + server/selector/navigator (13+ embeds)
    │   ├── search/                    # search bar/input/results
    │   ├── ads/                       # inline-ad, native-banner
    │   ├── common/                    # back-button, genre-filter, pagination, sort-dropdown, tmdb-attribution
    │   ├── seo/                       # movie-jsonld
    │   └── ui/                        # button, badge, card, dialog, dropdown, input, skeleton, tabs, pagination, select-sort, genre-filter
    │
    ├── config/                        # site-wide constants
    │   ├── site.ts                    # siteConfig (name, player default, feature flags)
    │   ├── navigation.ts              # nav items (browse/action/sister/footer)
    │   └── ads.ts                     # AD_CONFIG (6 Adsterra zones)
    │
    ├── hooks/                         # client-side React hooks
    │   ├── use-cached-fetch.ts        # localStorage-cached fetch
    │   ├── use-debounce.ts
    │   ├── use-local-storage.ts       # persistent state + cross-tab sync
    │   └── use-watch-progress.ts      # resume playback position
    │
    ├── lib/                           # pure utilities + constants
    │   ├── constants.ts               # URLs, IDs, VIDEO_SERVERS map, brand
    │   ├── format.ts                  # formatRuntime/formatDate/formatVoteAverage/… (DUPLICATED — see drift)
    │   ├── utils.ts                   # cn(), formatDate/formatRuntime/getTmdbImageUrl (DUPLICATED — see drift)
    │   ├── tmdb-image.ts              # getPosterUrl/getBackdropUrl/getProfileUrl/getStillUrl
    │   ├── watch-history.ts           # localStorage history helpers
    │   └── smartlink.ts               # NO-OP stubs (smartlink removed)
    │
    ├── services/                      # API layer (singletons + mappers + cache)
    │   ├── index.ts                   # facade barrel: TmdbService, AnilistService, ConsumetService
    │   ├── cache/                     # ICache + MemoryCache (TTL + LRU)
    │   ├── tmdb/                      # client.ts, movies, tv, anime, search, genres, regional, types.ts(DTOs)
    │   ├── anilist/                   # client (GraphQL), anime
    │   ├── consumet/                  # 1Anime CDN stream client
    │   ├── vidking/                   # player-url, events, config, types
    │   ├── vidlink/                   # URL builder (single file index.ts)
    │   └── analytics/                 # AnalyticsService (localStorage watch progress)
    │
    ├── types/                         # domain types (exported, camelCase)
    │   ├── media.ts  player.ts  sports.ts  api.ts  index.ts
    │
    └── __tests__/                     # Vitest tests (node env)
        ├── providers/                 # vidlink.test.ts
        └── services/                  # anilist*, anime-*, consumet, category-services, video-player-servers
```

## Architectural rules (hard constraints)

1. **Static-only front-end.** There is no backend, no server API routes in
   use, and no database. Do not introduce a server, an ORM, or a database
   dependency.
2. **Service-layer separation.** API access goes through `src/services/*`
   classes. Raw `fetch()` calls to an external API do **not** belong inside
   React components or hooks (one legacy exception: `home-client.tsx` — do not
   expand that pattern; prefer the service layer for new work).
3. **DTO vs. domain type split.** TMDB/DTO shapes live in
   `src/services/*/types.ts` (snake_case, *not* re-exported from the facade).
   Public domain types live in `src/types/*` (camelCase). Map between them with
   mapper functions inside the service file.
4. **Singleton clients share a cache.** `TmdbClient`, `AnilistService`,
   `ConsumetService` are accessed via `getInstance()`; they hold a shared
   `MemoryCache` (5-minute TTL, 500-entry LRU max). Prefer the facade
   (`TmdbService.getInstance()`) over the raw client.
5. **Graceful degradation.** Paginated/list methods return empty shapes
   (`{ page: 1, results: [], … }`) on failure rather than throwing; detail
   methods throw. Page components use `Promise.allSettled` for parallel
   independent fetches so one failure doesn't kill the whole page.
6. **Client/server boundary.** Mark client components with `"use client"` at
   the top of the file. Server pages (`page.tsx`) are thin shells; the
   interactive work lives in a sibling `*-client.tsx`.
7. **`NEXT_EXPORT` controls output mode.** `next.config.ts` sets
   `output: "export"` only when `NEXT_EXPORT=true`. Static export means every
   route must be pre-renderable (`generateStaticParams` for dynamic `[id]`
   routes — see `src/app/(watch)/watch/movie/[id]/page.tsx` which uses a
   `placeholder` param).
8. **No emojis — anywhere.** See "No-emojis rule" below. Use Lucide icons.

## TypeScript conventions

- **File naming:** kebab-case (`media-card.tsx`, `use-cached-fetch.ts`,
  `tmdb-image.ts`).
- **Components:** PascalCase. **Functions/methods:** camelCase. **Constants:**
  `UPPER_SNAKE_CASE` (`TMDB_BASE_URL`, `VIDEO_SERVERS`).
- **Interfaces:** PascalCase. Service *contracts* use an `I` prefix
  (`IMovieService`, `ICache`, `IAnalyticsService`); domain types do not
  (`Movie`, `WatchProgress`). Classes implement their `I*` interface.
- **Type-only imports:** use `import type { … }` for type-only names.
- **Path aliases** (from `tsconfig.json`): `@/*` -> `./src/*`, plus
  `@services/*`, `@components/*`, `@hooks/*`, `@lib/*`, `@types/*`,
  `@config/*`. Prefer these over relative `../../` paths.
- **Section header comments** use the exact separator style
  `// -----… Mori ― Description -----…`.
- **JSDoc** on complex functions/classes explaining *why* and *single
  responsibility*. Props interfaces get a one-line description.
- **Strict mode is on** (`strict: true`). Note: the home page and a few
  mappers use `any` and `as` casts (`home-client.tsx` notably) — avoid
  copying that; keep new code typed.

## React / Next.js conventions

- **No global state library.** Use local state, `useLocalStorage`,
  `useCachedFetch`, and window `CustomEvent`s (`"mori:history-updated"`,
  `"mori:watch-progress"`, `"mori:history-updated"`) for cross-component
  communication.
- **`cn()` utility** (`src/lib/utils.ts`) merges Tailwind classes via
  `clsx` + `tailwind-merge`. Use it for conditional classes.
- **Variant styling** via typed lookup objects (`variantStyles`,
  `sizeStyles` as `const`), not inline conditional ternaries.
- **Design tokens** are centralized in `tailwind.config.ts`: colors
  (`background`, `foreground`, `primary` = `#C5FF4A`, `muted`, `card`,
  `border`, `accent`, `destructive`), fonts (`--font-heading` = PT Serif,
  `--font-body` = Inter Tight, `--font-mono` = JetBrains Mono), custom
  font-size/spacing/borderRadius scales, and keyframes (fade-in, slide-up,
  pulse-glow, marquee, scanline-drift, etc.). The shared layout class is
  `.container-cine` (`max-w-[1496px]`).
- **Data fetching hook:** `useCachedFetch(key, fetcher, ttlMs)` (localStorage
  cache, hydration-safe). `useWatchProgress` + `useLocalStorage` persist
  playback state.

## Service / API conventions

- Every service-layer HTTP client wraps results in `APIResponse<T>`
  (`{ success, data?, error? }` — `src/types/api.ts`) or throws on detail
  lookups.
- **TMDB client** (`src/services/tmdb/client.ts`) is the transport; it appends
  the API key via query params, caches by `tmdb:{endpoint}:{queryString}`,
  and wraps non-OK responses into `APIResponse` with a truncated error body.
- **Mappers** are private functions in the service file (e.g.
  `mapMovieResult`, `mapMovieDetail`) that convert snake_case DTOs to camelCase
  domain types.
- **Barrel exports:** services expose their public API through `index.ts`
  (e.g. `src/services/tmdb/index.ts` re-exports the facade, sub-services, and
  interfaces). Import only from the facade/barrel.

## Database conventions

N/A. There is no database. Client state persists to `localStorage` under keys
prefixed `mori:` (`mori:watch-history`, `mori:watch-progress:<type>:<id>`,
`mori:cache:<key>`). Watch history is capped (20 entries in
`src/lib/watch-history.ts`; 100 in `src/services/analytics/watch-progress.ts` —
two parallel implementations coexist, see drift).

## Security posture

- **No authentication / authorization.** All content is public.
- **Secrets** live in env vars (`.env.local`, git-ignored). The TMDB key is
  currently also referenced as `NEXT_PUBLIC_TMDB_API_KEY` (exposed to the
  client — accepted trade-off in this codebase, but don't introduce new
  client-exposed secrets).
- **Security headers** are set in `netlify.toml` (the `/*` header block):
  `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`,
  `X-XSS-Protection: 1; mode=block`, and a restrictive `Permissions-Policy`.
  Preserve these when editing `netlify.toml`.
- **No user-generated content** is stored server-side; URL params to external
  providers are validated by those providers.
- Ad-provider scripts from `planetsrecipe.com` are loaded via `<script async
  data-cfasync="false">` in the root layout — treat `src/config/ads.ts` IDs as
  sensitive-enough not to rotate casually.

## External API map

Declared in `next.config.ts` (`rewrites`, dev proxy) and `netlify.toml`
(`[[redirects]]`, prod proxy):

| Local path | Upstream | Purpose |
|---|---|---|
| `/api/anilist` | `https://graphql.anilist.co` | AniList GraphQL (anime metadata) |
| `/api/1anime/*` | `https://cdn-eu.1ani.me/*` | Anime episode streams (1Anime CDN) |
| `/api/reanime/*` | `https://reanime.to/api/*` | Re:ANIME / FlixCloud |
| `/api/sports/*` | `https://api.cdnlivetv.ru/api/v1/*` | Live sports events |

Direct (non-proxied) origins: `https://api.themoviedb.org/3` and
`https://image.tmdb.org/t/p` (TMDB), plus the embed providers listed in
`test-providers.mjs` and the `PlayerServer` union in `src/types/player.ts`.

## Testing / validation

- **Framework:** Vitest, `environment: "node"`, `@` alias (`vitest.config.ts`).
- **Location:** `src/__tests__/`, organized as `providers/` and `services/`,
  naming `[feature].test.ts`.
- **Run:** `npm run test`, `npm run test:watch`.
- Current tests are light (mostly constants checks and the `buildVidlinkUrl`
  unit suite); many are implementation-pinning assertions rather than
  behavioral coverage. Add focused unit tests for pure functions (mappers, URL
  builders, format utilities) following the RED-GREEN-REFACTOR style.
- **Pre-deploy health check:** `npm run test:providers` runs
  `test-providers.mjs`, which probes all 13 embed providers for
  reachability/frame-blocking and exits non-zero on hard failures.
- There is **no type-check script** (`tsc`) and **no CI config** in the repo;
  `npm run lint` is the only static check wired up.

## What NOT to do

- Do not add a backend, database, or auth system.
- Do not use emoji characters anywhere (see rule below).
- Do not introduce a state-management library.
- Do not put raw `fetch()` calls to external APIs in components/hooks — use the
  `services/` layer. (Exception that already exists: `home-client.tsx`; don't
  replicate it.)
- Do not export DTO types from the service facade or leak snake_case DTO shapes
  into components — domain types only.
- Do not hardcode new magic strings/URLs; add them to `src/lib/constants.ts`.
- Do not touch `netlify.toml` security headers, redirects, or cache rules
  without understanding the static-export + edge-cache implications.
- Do not rename paths referenced by `tsconfig.json` aliases or
  `next.config.ts` rewrites.
- Do not add new client-exposed secrets (`NEXT_PUBLIC_*`) without a strong
  reason.
- Do not recreate removed generated artifacts such as `AI.MD`,
  `repomix-output.xml`, `_docs/`, build output, or cached sports-feed files
  unless the project explicitly requires them again.

## No-emojis rule (project-wide invariant)

Mori forbids emoji characters in **code, UI text, comments, commit messages,
and any output**. Use these replacements:

| Instead of | Use |
|---|---|
| Any emoji icon | Lucide React icons (`lucide-react`) |
| Emoji in text | Plain text |
| Emoji bullets | Standard list markers or Lucide `Dot` |
| Flag emojis | Country-code text or nothing |
| Emoji in commit messages | Plain ASCII |

Lucide imports commonly used across this codebase:

```tsx
import { Film, Tv, Swords, Globe, Search, Home, Menu, X, Play,
         History, Clock, Sparkles, Library, ExternalLink,
         ChevronDown, ChevronUp, LoaderCircle, AlertTriangle,
         ShieldAlert, BookOpen, Heart } from "lucide-react";
```

Scan for Unicode emoji ranges before committing/emitting any output; replace
immediately if found.

## Context files for future AI sessions

- `package.json` — exact deps, scripts, and versions.
- `next.config.ts` — output mode, image hosts, rewrites.
- `netlify.toml` — deploy target, security headers, cache + redirect rules.
- `tsconfig.json` — TypeScript strictness and path aliases.
- `tailwind.config.ts` — full design-token/theme definitions.
- `src/lib/constants.ts` — URL/id/brand constants (single source of truth).
- `src/types/` (`media.ts`, `player.ts`, `sports.ts`, `api.ts`) — domain model.
- `src/services/` — service layer, cache, and API clients.
- `test-providers.mjs` — the canonical list of embed providers (13) + their
  URL formats.
- `vitest.config.ts` and `src/__tests__/` — test setup and existing coverage.
- `AGENTS.md` — this document; current repository guidance for AI agents and contributors.

### Historical cleanup notes

The following obsolete artifacts were removed after verification against the
current source tree:

- **Output mode:** static export via `NEXT_EXPORT=true` (not
  `output: "standalone"`).
- **No `sports/`, `vidhide/`, `vidplay/`, `vidstream/` service directories**
  actually exist; the live `services/` are `analytics`, `anilist`, `cache`,
  `consumet`, `tmdb`, `vidking`, `vidlink`.
- **(main) routes are** `anime`, `collections`, `dmca`, `drama`, `movies`,
  `privacy`, `search`, `tv` — there is **no** `sports`, `pinoy`, or `kdrama`
  page group (KDrama lives under `drama/`; Filipino content is served via the
  `regional` TMDB service but has no dedicated route group).
- **Ads:** `config/ads.ts` defines **six** zones (native banner, social bar,
  popunder, leaderboard, mobile banner, smartlink), not four.
- **Smartlink:** `src/lib/smartlink.ts` is now **no-op stubs** ("Smartlinks
  removed").
- **Home page** fetches TMDB directly with `NEXT_PUBLIC_TMDB_API_KEY`,
  bypassing the service layer.
- **Duplicate formatting helpers** exist: `formatRuntime`/`formatDate`/
  `formatVoteAverage` are defined in **both** `src/lib/format.ts` and
  `src/lib/utils.ts` with slightly different behavior/signatures. Verify which
  one a caller imports before editing.
- **Two watch-history implementations** coexist: `src/lib/watch-history.ts`
  (cap 20) and `src/services/analytics/watch-progress.ts` (cap 100).
