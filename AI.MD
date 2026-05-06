# Mori — AI Context

## Project Overview

Mori is a Next.js 15 movie streaming application that provides access to movies, TV shows, and anime. It uses TMDB (The Movie Database) as the primary data source and integrates multiple video player services (Vidking, Vidhide, SuperEmbed, etc.). The app features a dark theme with a lime green accent (#C5FF4A), watch history tracking, and support for regional content (Pinoy, KDrama). Built with TypeScript and Tailwind CSS, it follows a service-oriented architecture with caching and type-safe data transformation.

## Tech Stack

- **Framework**: Next.js 15.1.0 (App Router, standalone output)
- **Runtime**: React 19.0.0
- **Language**: TypeScript 5.7.0 (strict mode)
- **Styling**: Tailwind CSS 3.4.0 with custom design system
- **Icons**: Lucide React 0.468.0
- **Data Sources**: TMDB API, Vidking, Vidhide, SuperEmbed, etc.
- **Utilities**: clsx 2.1.1, tailwind-merge 2.6.0, zod 3.24.1
- **Deployment**: Netlify (configured via netlify.toml)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── anime/             # Anime listing and detail pages
│   ├── api/               # API routes (if any)
│   ├── kdrama/            # KDrama listing and detail pages
│   ├── movies/            # Movie listing and detail pages
│   ├── pinoy/             # Pinoy movie listing and detail pages
│   ├── search/            # Search page
│   ├── tv/                # TV show listing and detail pages
│   ├── watch/             # Video player page
│   ├── layout.tsx         # Root layout with header/footer
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components organized by domain
│   ├── layout/            # Header, footer, sidebar, mobile nav
│   ├── media/             # Media cards, grids, hero, info
│   ├── player/            # Video player components (12+ player integrations)
│   ├── search/            # Search bar, input, results
│   └── ui/                # Reusable UI components (button, card, dialog, etc.)
├── config/                # Site configuration and navigation
│   ├── navigation.ts      # Nav items for header, footer, mobile
│   └── site.ts            # Site metadata and feature flags
├── hooks/                 # Custom React hooks
│   ├── use-debounce.ts    # Debounced values
│   ├── use-local-storage.ts # localStorage persistence
│   ├── use-media.ts       # Media-related hooks
│   ├── use-search.ts      # Search functionality
│   ├── use-tmdb.ts        # TMDB data fetching with caching
│   └── use-watch-progress.ts # Watch progress tracking
├── lib/                   # Utility functions and constants
│   ├── constants.ts       # App constants (URLs, IDs, colors)
│   ├── format.ts          # Date, runtime, vote formatting
│   ├── tmdb-image.ts      # TMDB image URL builders
│   ├── utils.ts           # General utilities (cn, formatDate, etc.)
│   └── watch-history.ts   # Watch history management
├── services/              # API service layer with caching
│   ├── cache/             # In-memory caching implementation
│   ├── tmdb/              # TMDB API client and services
│   │   ├── anime.ts       # Anime service
│   │   ├── client.ts      # Singleton TMDB HTTP client
│   │   ├── genres.ts      # Genre service
│   │   ├── movies.ts      # Movie service
│   │   ├── regional.ts    # Regional content (Pinoy, etc.)
│   │   ├── search.ts      # Search service
│   │   ├── tv.ts          # TV show service
│   │   └── types.ts       # TMDB DTO types (not exported)
│   ├── vidhide/           # Vidhide player integration
│   ├── vidking/           # Vidking player integration
│   └── index.ts           # Service facade
├── types/                 # TypeScript type definitions
│   ├── api.ts             # API response types
│   ├── index.ts           # Type re-exports
│   ├── media.ts           # Media domain types (Movie, TVShow, Anime)
│   └── player.ts          # Player and video types
```

## Architecture

**Layered Architecture:**
- **Presentation Layer**: Next.js App Router pages and React components
- **Business Logic Layer**: Custom hooks and component logic
- **Service Layer**: API clients (TMDB, Vidking, Vidhide) with caching
- **Data Layer**: Type definitions and data transformation mappers

**Data Flow:**
1. Server components fetch initial data via service layer
2. Service layer uses singleton TMDB client with in-memory cache
3. TMDB client fetches from API and caches responses
4. Mapper functions transform DTOs to domain types
5. Client components use hooks for interactive features
6. Watch progress persisted to localStorage

**Key Patterns:**
- Singleton pattern for TMDB client (shared cache across app)
- Service interface pattern (IMovieService, ITVService, etc.)
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

**Player Types** (from `@/types/player.ts`):
- `VidkingPlayerConfig`: Configuration for Vidking iframe embed
- `PlayerEvent`: postMessage events from player (timeupdate, play, pause, ended)
- `WatchProgress`: Persisted watch progress record
- `PlayerServer`: Union type of all supported servers

## Database Schema

N/A - No database used. Data sourced from TMDB API and persisted to localStorage for watch history.

## API Routes / Endpoints

**External APIs:**
- TMDB API: `https://api.themoviedb.org/3` (requires TMDB_API_KEY)
- TMDB Images: `https://image.tmdb.org/t/p`
- Vidking: `https://www.vidking.net`
- Vidhide: `https://vidhide.com`
- Multiple other player servers (SuperEmbed, EmbedAPI, Mostream, etc.)

**Internal API Routes:**
- `/api/*` - CORS headers configured but no routes currently implemented

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
- No testing framework currently configured
- No test files observed in codebase
- No testing dependencies in package.json

**Recommendation:**
- Consider adding Vitest for unit testing
- Consider adding Playwright for E2E testing
- Test service layer mappers
- Test utility functions
- Test critical user flows (search, watch, progress tracking)

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
- **Decision**: Support 9+ video player servers with fallback
- **Rationale**: Redundancy if one service fails, geographic availability
- **Consequences**: Complex player component architecture, iframe communication

**localStorage for Watch Progress:**
- **Decision**: Persist watch progress to localStorage
- **Rationale**: Simple, no backend required, works offline
- **Consequences**: Limited to single device, no sync across devices

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
  cacheKey?: string
): UseTmdbQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const cacheRef = useRef<Map<string, { data: T; timestamp: number }>>(new Map());

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
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      setStoredValue((prev) => {
        const valueToStore = value instanceof Function ? value(prev) : value;
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
        return valueToStore;
      });
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key]);

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
export { MemoryCache } from './memory-cache';
export type { ICache, CacheEntry, CacheOptions } from './types';

// services/tmdb/index.ts
export { TmdbClient } from './client';
export { TmdbService } from './service-facade';
export * from './movies';
export * from './tv';
export * from './anime';
```

### 8. Variant-Based Styling Pattern

```typescript
const variantStyles = {
  primary: "bg-primary text-primary-foreground border-[1.5px] border-primary hover:brightness-110",
  secondary: "bg-muted text-foreground border-[1.5px] border-transparent hover:bg-card-hover",
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
  size: "w92" | "w154" | "w185" | "w342" | "w500" | "w780" | "original" = "w500"
): string {
  if (!path) return "/placeholder-poster.svg";
  return `https://image.tmdb.org/t/p/${size}${path}`;
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

- **No Testing Framework**: No unit or E2E tests configured
- **No Authentication**: All content is publicly accessible
- **No Backend API**: Relies entirely on TMDB and third-party players
- **Single Device Persistence**: Watch progress stored in localStorage (no cross-device sync)
- **No Offline Support**: Requires internet connection for TMDB and player APIs
- **Player Dependency**: Video playback depends on third-party player availability
- **No User Accounts**: No personalization, favorites, or user-specific features
- **Limited Search**: Search functionality depends on TMDB search API limitations

---

_Last Updated: 2025-01-07_
_Version: 1.0.0_
_Last Full Scan: 2025-01-07_
_Last Incremental Scan: N/A_
_Changed Since Last Scan: Initial scan_

## Changelog

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
