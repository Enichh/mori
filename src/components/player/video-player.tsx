"use client";

import * as React from "react";
import ReactDOM from "react-dom";
import {
  Play,
  AlertTriangle,
  Loader2,
  ShieldAlert,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { VidkingPlayer } from "@/components/player/vidking-player";
import { SuperEmbedPlayer } from "@/components/player/superembed-player";
import { EmbedAPIPlayer } from "@/components/player/embedapi-player";
import { VideasyPlayer } from "@/components/player/videasy-player";
import { OneElevenMoviesPlayer } from "@/components/player/111movies-player";
import { TwoEmbedPlayer } from "@/components/player/twoembed-player";
import { StreamVaultPlayer } from "@/components/player/streamvault-player";
import { VidSrcPlayer } from "@/components/player/vidsrc-player";
import { VidLinkPlayer } from "@/components/player/vidlink-player";
import { YapGridPlayer } from "@/components/player/yapgrid-player";
import { RinPlayer } from "@/components/player/rin-player";
import { ConsumetPlayer } from "@/components/player/consumet-player";
import { EpisodeNavigator } from "@/components/player/episode-navigator";
import type { VidkingPlayerConfig, EpisodeNavData } from "@/types";

type PlayerServer =
  | "vidking"
  | "superembed"
  | "embedapi"
  | "videasy"
  | "111movies"
  | "twoembed"
  | "streamvault"
  | "vidsrc"
  | "vidlink"
  | "yapgrid"
  | "rin"
  | "consumet";

const SERVERS: { id: PlayerServer; label: string; tags?: string[] }[] = [
  { id: "vidsrc", label: "Nova" },
  { id: "vidlink", label: "Luna" },
  { id: "embedapi", label: "Zara" },
  { id: "twoembed", label: "Maya" },
  { id: "111movies", label: "Cleo" },
  { id: "videasy", label: "Rosa" },
  { id: "vidking", label: "Faye" },
  { id: "streamvault", label: "Iris" },
  { id: "superembed", label: "Eden" },
  { id: "yapgrid", label: "Thea" },
  { id: "rin", label: "Rin" },
  { id: "consumet", label: "1Anime", tags: ["Anime"] },
];

const AUTO_FAILOVER_ORDER: PlayerServer[] = [
  "vidsrc",
  "vidlink",
  "yapgrid",
  "rin",
  "embedapi",
  "twoembed",
  "111movies",
  "videasy",
  "vidking",
  "streamvault",
  "superembed",
  "consumet",
];

interface VideoPlayerProps {
  config: VidkingPlayerConfig;
  posterUrl?: string;
  title?: string;
  className?: string;
  episodeNav?: EpisodeNavData;
}

export function VideoPlayer({
  config,
  posterUrl,
  title,
  className,
  episodeNav,
}: VideoPlayerProps) {
  const [server, setServer] = React.useState<PlayerServer>(() => {
    const saved = typeof window !== "undefined" ? sessionStorage.getItem("mori:last-server") : null;
    return (saved as PlayerServer) || "vidsrc";
  });
  const [activated, setActivated] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [warmed, setWarmed] = React.useState(false);

  const [autoFailover, setAutoFailover] = React.useState(true);
  const [failedServers, setFailedServers] = React.useState<Set<string>>(
    new Set(),
  );
  const [tryingServer, setTryingServer] = React.useState<string | null>(null);
  const [serverDropdownOpen, setServerDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const failoverTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const autoFailoverRef = React.useRef(autoFailover);
  autoFailoverRef.current = autoFailover;
  const serverRef = React.useRef(server);
  serverRef.current = server;
  const failedServersRef = React.useRef(failedServers);
  failedServersRef.current = failedServers;

  // Close dropdown on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setServerDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  React.useEffect(() => {
    const origins = [
      "https://www.vidking.net",
      "https://multiembed.mov",
      "https://player.embed-api.stream",
      "https://www.2embed.cc",
      "https://111movies.com",
      "https://111movies.net",
      "https://player.videasy.net",
      "https://streamvaultsrc.click",
      "https://embedmaster.com",
      "https://vidlink.pro",
      "https://vidsrc.mov",
      "https://yapgrid.com",
      "https://vidsrc.to",
      "https://cdn-eu.1ani.me",
    ];
    for (const origin of origins) {
      ReactDOM.preconnect(origin, { crossOrigin: "anonymous" });
    }
  }, []);

  React.useEffect(() => {
    const warmUrl =
      server === "vidking"
        ? `https://www.vidking.net/embed/movie/${config.tmdbId}?color=C5FF4A`
        : `https://multiembed.mov/?video_id=${config.tmdbId}&tmdb=1`;

    const warmFrame = document.createElement("iframe");
    warmFrame.src = warmUrl;
    warmFrame.style.cssText =
      "position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;";
    warmFrame.title = "preload";
    warmFrame.setAttribute("sandbox", "allow-scripts allow-same-origin");
    document.body.appendChild(warmFrame);

    const timer = setTimeout(() => {
      setWarmed(true);
      document.body.removeChild(warmFrame);
    }, 8000);

    return () => {
      clearTimeout(timer);
      if (warmFrame.parentNode) document.body.removeChild(warmFrame);
    };
  }, [config.tmdbId, server]);

  const handleActivate = () => {
    setActivated(true);
    if (!warmed) setLoading(true);
  };

  const handleLoad = () => {
    if (failoverTimerRef.current) clearTimeout(failoverTimerRef.current);
    setLoading(false);
    setTryingServer(null);
  };

  const handleError = (message: string) => {
    setLoading(false);
    const updatedFailed = new Set(failedServersRef.current).add(
      serverRef.current,
    );
    setFailedServers(updatedFailed);

    if (autoFailoverRef.current) {
      const nextServer = AUTO_FAILOVER_ORDER.find((s) => !updatedFailed.has(s));
      if (nextServer) {
        setTryingServer(nextServer);
        switchServer(nextServer);
      } else {
        setAutoFailover(false);
        setTryingServer(null);
        setError(
          "No servers have this title available. Try again later or pick a server manually.",
        );
      }
    } else {
      setError(message);
    }
  };

  const handleErrorRef = React.useRef(handleError);
  handleErrorRef.current = handleError;

  const switchServer = (s: PlayerServer) => {
    setServer(s);
    try { sessionStorage.setItem("mori:last-server", s); } catch {}
    setWarmed(false);
    setLoading(true);
    setError(null);
    if (failoverTimerRef.current) clearTimeout(failoverTimerRef.current);
  };

  const handleServerClick = (s: PlayerServer) => {
    setTryingServer(null);
    setFailedServers(new Set());
    setServerDropdownOpen(false);
    switchServer(s);
  };

  React.useEffect(() => {
    if (!activated || !loading) return;
    failoverTimerRef.current = setTimeout(() => {
      handleErrorRef.current(`Timeout waiting for ${serverRef.current}`);
    }, 12000);
    return () => {
      if (failoverTimerRef.current) clearTimeout(failoverTimerRef.current);
    };
  }, [server, activated, loading]);

  const currentServer = SERVERS.find((s) => s.id === server);

  return (
    <div className={cn("w-full", className)}>
      <div className="relative w-full aspect-video bg-black border border-border overflow-hidden">
        {!activated && (
          <button
            onClick={handleActivate}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center group cursor-pointer"
            aria-label="Play video"
          >
            {posterUrl ? (
              <img
                src={posterUrl}
                alt={title || "Play"}
                className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity duration-300"
                loading="eager"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-card via-background to-card" />
            )}
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300" />
            <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.015)_0px,rgba(255,255,255,0.015)_1px,transparent_1px,transparent_3px)]" />
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-primary flex items-center justify-center bg-primary/10 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300 shadow-lg shadow-primary/20">
                <Play
                  className="w-10 h-10 md:w-12 md:h-12 text-primary ml-1"
                  fill="currentColor"
                />
              </div>
              <span className="text-sm md:text-base text-white/80 font-body tracking-wider uppercase group-hover:text-white transition-colors">
                {warmed
                  ? "Ready — Watch Now"
                  : title
                    ? `Watch ${title}`
                    : "Watch Now"}
              </span>
            </div>
            <p className="absolute bottom-6 text-[10px] text-white/30 font-mono tracking-wider">
              {warmed
                ? "Pre-loaded · Click to play instantly"
                : `Click to load · ${SERVERS.length} servers available`}
            </p>
            <p className="absolute bottom-2 text-[9px] text-white/15 font-mono tracking-wider flex items-center gap-1">
              <ShieldAlert className="w-2.5 h-2.5" />
              Ads may appear — we recommend uBlock Origin (ublockorigin.com)
            </p>
          </button>
        )}

        {activated && loading && !warmed && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black z-10">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground font-mono">
              Connecting to{" "}
              {SERVERS.find((s) => s.id === serverRef.current)?.label}...
            </p>
          </div>
        )}

        {activated && error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black z-10">
            <AlertTriangle className="h-10 w-10 text-destructive" />
            <p className="text-sm text-muted-foreground font-body text-center px-4">
              {error}
            </p>
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                setFailedServers(new Set());
                setTryingServer(null);
                setAutoFailover(true);
              }}
              className="px-4 py-2 text-sm font-body text-primary border border-primary hover:bg-primary/10 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {activated && server === "vidking" && (
          <VidkingPlayer
            config={config}
            onLoad={handleLoad}
            onError={handleError}
          />
        )}
        {activated && server === "superembed" && (
          <SuperEmbedPlayer
            config={config}
            onLoad={handleLoad}
            onError={handleError}
          />
        )}
        {activated && server === "embedapi" && (
          <EmbedAPIPlayer
            config={config}
            onLoad={handleLoad}
            onError={handleError}
          />
        )}
        {activated && server === "111movies" && (
          <OneElevenMoviesPlayer
            config={config}
            onLoad={handleLoad}
            onError={handleError}
          />
        )}
        {activated && server === "videasy" && (
          <VideasyPlayer
            config={config}
            onLoad={handleLoad}
            onError={handleError}
          />
        )}
        {activated && server === "twoembed" && (
          <TwoEmbedPlayer
            config={config}
            onLoad={handleLoad}
            onError={handleError}
          />
        )}
        {activated && server === "streamvault" && (
          <StreamVaultPlayer
            config={config}
            onLoad={handleLoad}
            onError={handleError}
          />
        )}
        {activated && server === "vidsrc" && (
          <VidSrcPlayer
            config={config}
            onLoad={handleLoad}
            onError={handleError}
          />
        )}
        {activated && server === "vidlink" && (
          <VidLinkPlayer
            config={config}
            onLoad={handleLoad}
            onError={handleError}
          />
        )}
        {activated && server === "yapgrid" && (
          <YapGridPlayer
            config={config}
            onLoad={handleLoad}
            onError={handleError}
          />
        )}
        {activated && server === "rin" && (
          <RinPlayer
            config={config}
            onLoad={handleLoad}
            onError={handleError}
          />
        )}
        {activated && server === "consumet" && (
          <ConsumetPlayer
            config={config}
            onLoad={handleLoad}
            onError={handleError}
          />
        )}
      </div>

      {activated && episodeNav && (
        <div className="mt-3">
          <EpisodeNavigator
            currentSeason={episodeNav.currentSeason}
            currentEpisode={episodeNav.currentEpisode}
            totalSeasons={episodeNav.totalSeasons}
            episodesPerSeason={episodeNav.episodesPerSeason}
            onNavigate={(s, e) => {
              episodeNav.onNavigate?.(s, e);
            }}
          />
        </div>
      )}

      {activated && (
        <>
          <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
            {/* Server dropdown */}
            <div ref={dropdownRef} className="relative inline-block">
              <button
                onClick={() => setServerDropdownOpen(!serverDropdownOpen)}
                className={cn(
                  "inline-flex items-center gap-2 px-3 py-1.5 text-xs font-body font-medium transition-all duration-200",
                  "bg-muted border border-border text-muted-foreground hover:text-foreground hover:border-primary/50",
                  serverDropdownOpen && "border-primary text-foreground",
                )}
              >
                Server: {currentServer?.label || "Unknown"}
                {currentServer?.tags?.map((tag) => (
                  <span key={tag} className="text-[9px] opacity-60 font-mono">
                    {tag}
                  </span>
                ))}
                <ChevronDown
                  className={cn(
                    "h-3 w-3 transition-transform duration-200",
                    serverDropdownOpen && "rotate-180",
                  )}
                />
              </button>

              {serverDropdownOpen && (
                <div className="absolute top-full mt-1 left-0 z-50 w-48 max-h-64 overflow-y-auto bg-card border border-border shadow-lg animate-fade-in">
                  {SERVERS.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleServerClick(s.id)}
                      className={cn(
                        "w-full text-left px-3 py-2 text-xs font-body hover:bg-muted transition-colors flex items-center gap-2",
                        server === s.id
                          ? "text-primary bg-primary/5"
                          : "text-muted-foreground",
                      )}
                    >
                      {s.label}
                      {s.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="text-[9px] opacity-60 font-mono"
                        >
                          {tag}
                        </span>
                      ))}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <label className="flex items-center gap-1 text-[10px] text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={autoFailover}
                onChange={(e) => setAutoFailover(e.target.checked)}
                className="accent-primary"
              />
              Auto-detect
            </label>
          </div>

          {autoFailover && tryingServer && (
            <div className="flex items-center justify-center gap-2 mt-2 text-[10px] text-muted-foreground font-mono">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>
                Auto-searching: tried {failedServers.size} of{" "}
                {AUTO_FAILOVER_ORDER.length} servers, now trying {tryingServer}
                ...
              </span>
              <button
                onClick={() => setAutoFailover(false)}
                className="text-primary hover:underline ml-2"
              >
                Cancel
              </button>
            </div>
          )}

          <div className="flex items-center justify-center gap-1.5 mt-2 text-[10px] text-muted-foreground/50 font-mono">
            <ShieldAlert className="w-3 h-3" />
            <span>
              Ads may appear — we recommend uBlock Origin (ublockorigin.com).
              Mori does not host any content.
            </span>
          </div>
        </>
      )}
    </div>
  );
}
