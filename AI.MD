# Mori — AI Context

## Project Overview

Mori is a Next.js 15 streaming application that provides access to movies, TV shows, anime, and live sports. It uses TMDB (The Movie Database) as the primary data source for media, AniList for anime metadata, and integrates multiple video player services (Vidking, Vidhide, Vidlink, Vidplay, Vidstream, Consumet, etc.). The app features a dark theme with a lime green accent (#C5FF4A), watch history tracking, support for regional content (Pinoy, KDrama), and live sports streaming across 15+ categories. Built with TypeScript and Tailwind CSS, it follows a service-oriented architecture with caching, type-safe data transformation, and includes a Vitest testing framework.

## Tech Stack

- **Framework**: Next.js 15.1.0 (App Router, standalone output)
- **Runtime**: React 19.0.0
- **Language**: TypeScript 5.7.0 (strict mode)
- **Styling**: Tailwind CSS 3.4.0 with custom design system
- **Icons**: Lucide React 0.468.0
- **Data Sources**: TMDB API, AniList API, Sports API (cdnlivetv), Vidking, Vidhide, Vidlink, Vidplay, Vidstream, Consumet, etc.
- **Utilities**: clsx 2.1.1, tailwind-merge 2.6.0, zod 3.24.1
- **Testing**: Vitest 2.1.0
- **Deployment**: Netlify (configured via netlify.toml)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (main)/            # Main content pages group
│   │   ├── anime/         # Anime listing and detail pages
│   │   ├── kdrama/        # KDrama listing and detail pages
│   │   ├── movies/        # Movie listing and detail pages
│   │   ├── pinoy/         # Pinoy movie listing and detail pages
│   │   ├── search/        # Search page with client component
│   │   ├── sports/        # Sports listing and detail pages (NEW)
│   │   ├── tv/            # TV show listing and detail pages
│   │   ├── dmca/          # DMCA page (NEW)
│   │   ├── privacy/       # Privacy page (NEW)
│   │   ├── layout.tsx     # Main layout with header/footer
│   │   └── page.tsx       # Home page
│   ├── (watch)/           # Watch pages group
│   │   ├── watch/
│   │   │   ├── anime/     # Anime watch page with dedicated player (NEW)
│   │   │   ├── movie/     # Movie watch page
│   │   │   ├── sport/     # Sports watch page (NEW)
│   │   │   └── tv/        # TV show watch page
│   │   └── layout.tsx     # Watch layout
│   ├── api/               # API routes
│   │   └── watch-progress/ # Empty (route removed, now client-side only)
│   ├── layout.tsx         # Root layout
│   ├── globals.css        # Global styles
│   ├── error.tsx          # Error page
│   ├── not-found.tsx      # 404 page
│   ├── robots.ts          # SEO robots.txt
│   └── sitemap.ts         # SEO sitemap
├── components/            # React components organized by domain
│   ├── ads/               # Ad components (native-banner, inline-ad) (NEW)
│   ├── common/            # Common UI components (back-button, genre-filter, pagination, etc.) (NEW)
│   ├── layout/            # Header, footer, sidebar, mobile nav
│   ├── media/             # Media cards, grids, hero, info
│   ├── player/            # Video player components (12+ player integrations)
│   │   ├── consumet-player.tsx (NEW)
│   │   ├── vidlink-player.tsx (NEW)
│   │   ├── vidplay-player.tsx (NEW)
│   │   └── vidstream-player.tsx (NEW)
│   ├── search/            # Search bar, input, results
│   ├── seo/               # SEO components (movie-jsonld) (NEW)
│   ├── sports/            # Sports components (sport-card, sport-grid, sport-hero, live-badge, sport-filter) (NEW)
│   └── ui/                # Reusable UI components (button, card, dialog, etc.)
├── config/                # Site configuration and navigation
│   ├── ads.ts             # Ad configuration (planetsrecipe.com zones) (NEW)
│   ├── navigation.ts      # Nav items for header, footer, mobile
│   └── site.ts            # Site metadata and feature flags
├── hooks/                 # Custom React hooks
│   ├── use-debounce.ts    # Debounced values
│   ├── use-local-storage.ts # localStorage persistence
│   └── use-watch-progress.ts # Watch progress tracking
├── lib/                   # Utility functions and constants
│   ├── constants.ts       # App constants (URLs, IDs, colors)
│   ├── format.ts          # Date, runtime, vote formatting
│   ├── smartlink.ts       # Smartlink utility for monetization (NEW)
│   ├── tmdb-image.ts      # TMDB image URL builders
│   ├── utils.ts           # General utilities (cn, formatDate, etc.)
│   └── watch-history.ts   # Watch history management
├── services/              # API service layer with caching
│   ├── analytics/         # Analytics service for watch progress (NEW)
│   ├── anilist/           # AniList API client and services (NEW)
│   ├── cache/             # In-memory caching implementation
│   ├── consumet/          # Consumet API integration (NEW)
│   ├── sports/            # Sports API client and services (NEW)
│   ├── tmdb/              # TMDB API client and services
│   ├── vidhide/           # Vidhide player integration
│   ├── vidking/           # Vidking player integration
│   ├── vidlink/           # Vidlink player integration (NEW)
│   ├── vidplay/           # Vidplay player integration (NEW)
│   ├── vidstream/         # Vidstream player integration (NEW)
│   └── index.ts           # Service facade exports
├── types/                 # TypeScript type definitions
│   ├── api.ts             # API response types
│   ├── index.ts           # Type re-exports
│   ├── media.ts           # Media domain types (Movie, TVShow, Anime)
│   ├── player.ts          # Player and video types
│   └── sports.ts          # Sports domain types (NEW)
└── __tests__/             # Test files (NEW)
    ├── providers/         # Player provider tests
    └── services/          # Service tests (anilist, consumet, etc.)
```

## Architecture

**Layered Architecture:**

- **Presentation Layer**: Next.js App Router pages and React components
- **Business Logic Layer**: Custom hooks and component logic
- **Service Layer**: API clients (TMDB, AniList, Sports, Vidking, Vidhide, Vidlink, Vidplay, Vidstream, Consumet) with caching
- **Data Layer**: Type definitions and data transformation mappers

**Data Flow:**

1. Server components fetch initial data via service layer
2. Service layer uses singleton clients (TmdbClient, AnilistClient, SportsClient) with in-memory cache
3. Clients fetch from APIs and cache responses
4. Mapper functions transform DTOs to domain types
5. Client components use hooks for interactive features
6. Watch progress persisted to localStorage
7. Analytics tracked via analytics service

**Key Patterns:**

- Singleton pattern for service clients (shared cache across app)
- Service facade pattern (TmdbService, AnilistService, SportsService, ConsumetService)
- Dependency injection for cache in service constructors
- Mapper pattern for DTO-to-domain transformation
- Hook pattern for reusable stateful logic
- Barrel exports for clean imports (index.ts files)

## Core Entities / Models

**Media Types** (from `@/types/media.ts`):

- `BaseMedia`: Common fields for all media (id, title, overview, posterPath, voteAverage, etc.)
- `Movie`: Extends BaseMedia with movie-specific fields (releaseDate, runtime, budget, revenue)
- `TVShow`: Extends BaseMedia with TV-specific fields (firstAirDate, numberOfSeasons, seasons array)
- `Anime`: Extends BaseMedia with anime-specific fields

**Sub-entities:**

- `Season`: Season data with episodes array
- `Episode`: Episode data with runtime, stillPath, etc.
- `Credits`: Cast and crew arrays
- `Genre`: Genre id and name
- `Video`: Trailer/clip data

**Sports Types** (from `@/types/sports.ts`):

- `SportCategory`: Union of 15+ categories (basketball, football, baseball, hockey, american-football, fight, tennis, golf, cricket, rugby, motorsport, motor-sports, afl, darts, billiards, other)
- `SportEventStatus`: "live" | "upcoming" | "finished"
- `Team`: Team name and badge
- `SportEvent`: Sports event with id, title, category, date, poster, popular flag, teams, status, tournament, country, viewerCount, channels
- `SportChannel`: Channel with name, code, url, image, and viewers

**Player Types** (from `@/types/player.ts`):

- `VidkingPlayerConfig`: Configuration for Vidking iframe embed
- `PlayerEvent`: postMessage events from player (timeupdate, play, pause, ended)
- `WatchProgress`: Persisted watch progress record
- `PlayerServer`: Union type of all supported servers

## Database Schema

N/A - No database used. Data sourced from TMDB API, AniList API, Sports API, and persisted to localStorage for watch history.

## API Routes / Endpoints

**External APIs:**

- TMDB API: `https://api.themoviedb.org/3` (requires TMDB_API_KEY)
- TMDB Images: `https://image.tmdb.org/t/p`
- AniList API: GraphQL endpoint for anime metadata
- Sports API: cdnlivetv for live sports events
- Vidking: `https://www.vidking.net`
- Vidhide: `https://vidhide.com`
- Vidlink, Vidplay, Vidstream, Consumet: Additional player servers

**Internal API Routes:**

- `/api/*` - CORS headers configured but no routes currently implemented (watch-progress route removed, now client-side only)

**Service Layer Methods** (examples from MovieService):

- `getTrending(timeWindow?, page?)` - Get trending movies
- `getPopular(page?)` - Get popular movies
- `getDetails(id)` - Get movie details with credits, similar, videos
- `getByGenre(genreId, page?)` - Get movies by genre

## Coding Conventions

### Naming

- **Files**: kebab-case (`media-card.tsx`, `use-tmdb.ts`, `tmdb-image.ts`)
- **Components**: PascalCase (`MediaCard`, `Button`, `TmdbClient`)
- **Functions/Methods**: camelCase (`getTrending`, `mapMovieResult`, `cn`)
- **Constants**: UPPER_SNAKE_CASE (`TMDB_BASE_URL`, `DEFAULT_PLAYER_COLOR`)
- **Interfaces**: PascalCase with 'I' prefix for service interfaces (`IMovieService`, `ICache`)
- **Types**: PascalCase (`Movie`, `TVShow`, `APIResponse`)
- **Private members**: camelCase with `private` keyword

### File Organization

- One component per file in `components/` directory
- Related components grouped in subdirectories (`media/`, `player/`, `ui/`)
- Services grouped by domain with `index.ts` barrel exports
- Types centralized in `types/` directory with `index.ts` re-exports
- Utility functions in `lib/` directory
- Hooks in `hooks/` directory
- Configuration in `config/` directory
- DTO types kept in `services/*/types.ts` (not exported)
- Domain types in `types/` (exported)

### Error Handling

```typescript
// Service layer returns APIResponse wrapper
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Example from MovieService
async getDetails(id: number): Promise<Movie> {
  const res = await this.client.get<TMDBMovieDetail>(`/movie/${id}`, {
    api_key: this.apiKey,
    append_to_response: "credits,similar,videos",
  });
  if (!res.success || !res.data) {
    throw new Error(res.error ?? "Failed to fetch movie details");
  }
  return mapMovieDetail(res.data);
}

// Graceful degradation in page components
const [movieData, tvData] = await Promise.allSettled([
  tmdb.movies.getTrending("day"),
  tmdb.tv.getTrending("week"),
]);
if (movieData.status === "fulfilled") {
  trendingMovies = movieData.value.results;
} else {
  errors.push(`Movies: ${movieData.reason}`);
}
```

### Validation

- Zod imported but usage pattern not yet observed in analyzed files
- Type safety through TypeScript strict mode
- Runtime validation likely in form inputs

### Documentation Standards

- JSDoc comments on complex functions and classes
- Section separator comments with format: `// ----------- Mori ― [description] -----------`
- Minimal inline comments for obvious code
- Brief descriptions for component props interfaces
- Example from TmdbClient:

```typescript
/**
 * Low-level HTTP client for api.themoviedb.org.
 *
 * **Single responsibility**: transport. It knows how to append the API key,
 * parse JSON, and wrap errors into `APIResponse<T>`.
 */
export class TmdbClient {
  // ...
}
```

## State Management

**Local State:**

- React hooks (`useState`, `useEffect`, `useCallback`, `useRef`)
- Component-level state for UI interactions

**Persistence:**

- localStorage via `useLocalStorage` hook for watch progress
- In-memory cache via `MemoryCache` class for API responses (5-minute TTL)

**No Global State:**

- No Redux, Zustand, or other state management library
- Context API not extensively used
- Props drilling avoided through custom hooks

## Security

**Authentication:**

- No authentication system currently implemented
- Public access to all content

**API Keys:**

- TMDB API key via environment variables (`TMDB_API_KEY` or `NEXT_PUBLIC_TMDB_API_KEY`)
- Keys checked server-side first, then client-side fallback

**Input Sanitization:**

- TypeScript provides compile-time type safety
- URL parameters validated by TMDB API
- No user-generated content storage

**CORS:**

- CORS headers configured for `/api/*` routes in next.config.ts
- Preconnect links to player origins for performance

**Rate Limiting:**

- Relies on TMDB API rate limits
- In-memory caching reduces API calls

## Testing

**Framework:**

- Vitest 2.1.0 configured with Node environment
- Test files in `src/__tests__/` directory
- Provider tests: vidhide, vidlink, vidplay, vidstream
- Service tests: anilist (constants, search, general), anime-params, anime-watch, category-services, consumet, video-player-servers
- Path aliases configured: `@/*` → `./src/*`

**Running Tests:**

```bash
npm run test        # Run tests once
npm run test:watch  # Run tests in watch mode
```

**Test Organization:**

- Tests co-located with source in `__tests__/` directory
- Grouped by domain (providers/, services/)
- Test naming: `[feature].test.ts`

## Development Workflow

**Installation:**

```bash
npm install
```

**Development:**

```bash
npm run dev
# Runs on http://localhost:3000
```

**Build:**

```bash
npm run build
# Produces standalone output for deployment
```

**Production:**

```bash
npm start
# Starts production server
```

**Linting:**

```bash
npm run lint
```

**Testing:**

```bash
npm run test        # Run tests once
npm run test:watch  # Run tests in watch mode
```

**Environment Variables:**
Create `.env.local`:

```
TMDB_API_KEY=your_tmdb_api_key_here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**TypeScript Path Aliases:**

- `@/*` → `./src/*`
- `@services/*` → `./src/services/*`
- `@components/*` → `./src/components/*`
- `@hooks/*` → `./src/hooks/*`
- `@lib/*` → `./src/lib/*`
- `@types/*` → `./src/types/*`
- `@config/*` → `./src/config/*`

## Key Design Decisions

**Service Layer with Singleton Pattern:**

- **Decision**: Use singleton TMDB client with shared in-memory cache
- **Rationale**: Reduces redundant API calls, improves performance, simplifies cache management
- **Consequences**: All TMDB requests share cache, memory usage bounded by TTL

**DTO vs Domain Type Separation:**

- **Decision**: Keep TMDB DTO types in services/, domain types in types/
- **Rationale**: Decouples from external API changes, provides clean domain model
- **Consequences**: Requires mapper functions, adds slight boilerplate

**Standalone Output Mode:**

- **Decision**: Configure Next.js with `output: "standalone"`
- **Rationale**: Optimized for containerized deployment (Netlify, Docker)
- **Consequences**: Build output includes all dependencies, larger bundle

**Multiple Player Support:**

- **Decision**: Support 12+ video player servers with fallback
- **Rationale**: Redundancy if one service fails, geographic availability
- **Consequences**: Complex player component architecture, iframe communication

**localStorage for Watch Progress:**

- **Decision**: Persist watch progress to localStorage
- **Rationale**: Simple, no backend required, works offline
- **Consequences**: Limited to single device, no sync across devices

**Sports Streaming Integration:**

- **Decision**: Add live sports streaming with 15+ categories via cdnlivetv API
- **Rationale**: Expand content offering, capture sports audience
- **Consequences**: New service layer (SportsService), new components, sports-specific types

**AniList Integration:**

- **Decision**: Integrate AniList API for anime metadata
- **Rationale**: Better anime data source than TMDB for anime-specific content
- **Consequences**: New service layer (AnilistService), GraphQL queries, dedicated anime watch page

**Testing Framework Addition:**

- **Decision**: Add Vitest for unit testing
- **Rationale**: Improve code quality, catch regressions, document expected behavior
- **Consequences**: Additional dependency, test maintenance overhead, faster development cycle

**Monetization with Ads:**

- **Decision**: Integrate Adsterra ads via planetsrecipe.com with 4 zones (native banner, social bar, popunder, smartlink)
- **Rationale**: Generate revenue from free streaming service
- **Consequences**: Ad configuration complexity, smartlink utility for URL wrapping

## Common Patterns

### 1. Service Pattern with Mapper Functions

```typescript
// Interface definition
export interface IMovieService {
  getDetails(id: number): Promise<Movie>;
  getPopular(page?: number): Promise<TMDBMovieResponse>;
}

// Implementation class
export class MovieService implements IMovieService {
  constructor(private readonly client: TmdbClient) {}

  async getDetails(id: number): Promise<Movie> {
    const res = await this.client.get<TMDBMovieDetail>(`/movie/${id}`, {
      api_key: this.apiKey,
      append_to_response: "credits,similar,videos",
    });
    if (!res.success || !res.data) {
      throw new Error(res.error ?? "Failed to fetch movie details");
    }
    return mapMovieDetail(res.data);
  }
}

// Mapper function
function mapMovieDetail(d: TMDBMovieDetail): Movie {
  return {
    id: d.id,
    mediaType: "movie",
    title: d.title,
    // ... transform fields
    credits: mapCredits(d.credits),
    similar: mapSimilarMovies(d.similar),
    videos: mapVideos(d.videos),
  };
}
```

### 2. Generic Data Fetching Hook with Caching

```typescript
export function useTmdbQuery<T>(
  fetcher: () => Promise<T>,
  deps: React.DependencyList = [],
  cacheKey?: string,
): UseTmdbQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const cacheRef = useRef<Map<string, { data: T; timestamp: number }>>(
    new Map(),
  );

  const fetchData = useCallback(async () => {
    // Check cache first
    if (cacheKey && cacheRef.current.has(cacheKey)) {
      const cached = cacheRef.current.get(cacheKey)!;
      const cacheAge = Date.now() - cached.timestamp;
      const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
      if (cacheAge < CACHE_TTL) {
        setData(cached.data);
        setIsLoading(false);
        return;
      }
    }
    // ... fetch and cache
  }, deps);

  return { data, isLoading, error, refetch };
}
```

### 3. Component Pattern with Props Interface

```typescript
"use client";

interface MediaCardProps {
  media: BaseMedia;
  mediaType: MediaType;
  priority?: boolean;
  className?: string;
}

export function MediaCard({
  media,
  mediaType,
  priority = false,
  className,
}: MediaCardProps) {
  const posterUrl = getPosterUrl(media.posterPath, "w500");
  return (
    <Link href={`${detailPath[mediaType]}/${media.id}`} className={cn("group block", className)}>
      {/* Component JSX */}
    </Link>
  );
}
```

### 4. Class Merging Utility

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Usage in components
className={cn(
  "inline-flex items-center justify-center",
  "transition-all duration-200",
  variantClass,
  sizeClass,
  className
)}
```

### 5. Singleton Pattern for Service Client

```typescript
export class TmdbClient {
  private static instance: TmdbClient;

  private constructor(apiKey?: string, cache?: ICache) {
    this.baseUrl = TMDB_BASE_URL;
    this.apiKey = apiKey ?? envApiKey();
    this.cache = cache ?? new MemoryCache();
  }

  static getInstance(apiKey?: string, cache?: ICache): TmdbClient {
    if (!TmdbClient.instance) {
      TmdbClient.instance = new TmdbClient(apiKey, cache);
    }
    return TmdbClient.instance;
  }
}

// Usage
const tmdb = TmdbService.getInstance();
```

### 6. localStorage Persistence Hook

```typescript
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        setStoredValue((prev) => {
          const valueToStore = value instanceof Function ? value(prev) : value;
          if (typeof window !== "undefined") {
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
          }
          return valueToStore;
        });
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key],
  );

  return [storedValue, setValue];
}
```

### 7. Barrel Exports for Clean Imports

```typescript
// types/index.ts
export * from "./media";
export * from "./player";
export * from "./api";

// services/cache/index.ts
export { MemoryCache } from "./memory-cache";
export type { ICache, CacheEntry, CacheOptions } from "./types";

// services/tmdb/index.ts
export { TmdbClient } from "./client";
export { TmdbService } from "./service-facade";
export * from "./movies";
export * from "./tv";
export * from "./anime";
```

### 8. Variant-Based Styling Pattern

```typescript
const variantStyles = {
  primary:
    "bg-primary text-primary-foreground border-[1.5px] border-primary hover:brightness-110",
  secondary:
    "bg-muted text-foreground border-[1.5px] border-transparent hover:bg-card-hover",
  ghost: "text-foreground hover:bg-muted border-[1.5px] border-transparent",
} as const;

const sizeStyles = {
  sm: "h-7 px-3 text-[11px]",
  default: "h-9 px-4 text-[11px]",
  lg: "h-11 px-6 text-xs",
} as const;

// Usage
const variantClass = variantStyles[variant];
const sizeClass = sizeStyles[size];
```

### 9. Parallel Fetching with Error Isolation

```typescript
const [movieData, tvData, animeData, pinoyData] = await Promise.allSettled([
  tmdb.movies.getTrending("day"),
  tmdb.tv.getTrending("week"),
  tmdb.anime.getTrending(),
  tmdb.regional.getFilipinoMovies(),
]);

if (movieData.status === "fulfilled") {
  trendingMovies = movieData.value.results;
} else {
  errors.push(`Movies: ${movieData.reason}`);
}
```

### 10. Image URL Builder Utility

```typescript
export function getPosterUrl(
  path: string | null,
  size:
    | "w92"
    | "w154"
    | "w185"
    | "w342"
    | "w500"
    | "w780"
    | "original" = "w500",
): string {
  if (!path) return "/placeholder-poster.svg";
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
```

### 11. Service Facade with Dependency Injection

```typescript
export class SportsService {
  readonly events: ISportEventsService;
  private static instance: SportsService;

  constructor(cache?: ICache) {
    const client = SportsClient.getInstance(cache);
    this.events = new SportEventsService(client);
  }

  static getInstance(cache?: ICache): SportsService {
    if (!SportsService.instance) {
      SportsService.instance = new SportsService(cache);
    }
    return SportsService.instance;
  }
}
```

### 12. Ads Configuration Pattern

```typescript
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
```

### 13. Smartlink Utility for Monetization

```typescript
export function wrapWithSmartlink(destinationUrl: string): string {
  return `${AD_CONFIG.smartlink.url}&url=${encodeURIComponent(destinationUrl)}`;
}

export function openSmartlink() {
  window.open(AD_CONFIG.smartlink.url, "_blank", "noopener,noreferrer");
}
```

## Anti-Patterns

**Prop Drilling:**

- **Avoided**: Using custom hooks and service layer instead of passing data through multiple component layers
- **Example**: `useTmdbQuery` hook encapsulates data fetching logic

**Direct API Calls in Components:**

- **Avoided**: Components never call fetch() directly
- **Pattern**: Use service layer (TmdbService) for all API calls

**Mixed Concerns:**

- **Avoided**: DTO types (TMDB) kept separate from domain types
- **Pattern**: Mapper functions transform between layers

**Hardcoded Values:**

- **Avoided**: No magic strings or numbers scattered in code
- **Pattern**: Constants centralized in `lib/constants.ts`

**Global State without Structure:**

- **Avoided**: No ad-hoc global variables
- **Pattern**: localStorage via `useLocalStorage` hook, in-memory cache via `MemoryCache` class

## Known Limitations

- **No User Authentication**: All content is publicly accessible
- **No Backend API**: Relies entirely on TMDB, AniList, Sports API, and third-party players
- **Single Device Persistence**: Watch progress stored in localStorage (no cross-device sync)
- **No Offline Support**: Requires internet connection for all APIs
- **Player Dependency**: Video playback depends on third-party player availability
- **No User Accounts**: No personalization, favorites, or user-specific features
- **Limited Search**: Search functionality depends on TMDB/AniList API limitations
- **Sports Data Reliability**: Live sports data depends on cdnlivetv API availability and accuracy
- **Ad Dependency**: Revenue depends on Adsterra ad network performance and policies

---

_Last Updated: 2026-05-07_
_Version: 2.0.0_
_Last Full Scan: 2026-05-07_
_Last Incremental Scan: N/A_
_Changed Since Last Scan: Sports streaming, AniList integration, testing framework, ads, new player services_

## Changelog

### 2026-05-07 — v2.0.0

**Added:**

- Sports streaming functionality with 15+ categories (basketball, football, baseball, hockey, etc.)
- AniList API integration for anime metadata
- Vitest 2.1.0 testing framework with 12 test files
- Ad configuration (planetsrecipe.com/Adsterra) with 4 zones
- Smartlink utility for monetization
- Analytics service for watch progress tracking
- Additional video player services (Vidlink, Vidplay, Vidstream, Consumet)
- Sports types (SportEvent, SportChannel, Team, SportCategory, SportEventStatus)
- Sports components (sport-card, sport-grid, sport-hero, live-badge, sport-filter)
- Sports pages (sports listing, sports watch)
- Anime watch page with dedicated player
- DMCA and privacy pages
- SEO components (movie-jsonld)
- Common components directory (back-button, genre-filter, pagination, etc.)

**Updated:**

- Project overview to include sports streaming and testing
- Tech stack to include Vitest, AniList, Sports API, additional players
- Project structure with new directories and files
- Architecture to include new service facades (AnilistService, SportsService, ConsumetService)
- Service layer methods and patterns
- Testing section from "no testing" to Vitest configuration
- Development workflow with test commands
- Key design decisions with sports, AniList, testing, and ads decisions
- Common patterns with service facade, ads config, and smartlink patterns
- Known limitations to remove testing limitation and add sports/ad limitations

**Removed:**

- Watch-progress API route (moved to client-side only)
- "No testing framework" limitation

**Scan Type:** Full scan (context file >30 days old + significant feature additions)
**Files Analyzed:** package.json, vitest.config.ts, all src/ directories, config files
**Validation Status:** All claims verified against actual codebase

### 2025-01-07 — v1.0.0

- **Added**: Initial AI context file creation
- **Added**: Project overview and tech stack documentation
- **Added**: Complete project structure mapping
- **Added**: Architecture and data flow documentation
- **Added**: Core entities and type definitions
- **Added**: API endpoints and service layer documentation
- **Added**: Coding conventions (naming, file organization, error handling)
- **Added**: State management and security practices
- **Added**: Development workflow and environment setup
- **Added**: Key design decisions with rationale
- **Added**: 10 common patterns with code examples
- **Added**: Anti-patterns documentation
- **Added**: Known limitations
- **Scan Type**: Full scan (no previous context file)
- **Files Analyzed**: package.json, tsconfig.json, next.config.ts, tailwind.config.ts, all src/ directories
- **Validation Status**: All claims verified against actual codebase
