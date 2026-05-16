"use client";

import * as React from "react";
import Hls from "hls.js";
import { cn } from "@/lib/utils";
import { ConsumetService } from "@/services/consumet";
import { Loader2, AlertTriangle, Server } from "lucide-react";
import type { VidkingPlayerConfig, ConsumetStreamingData } from "@/types";

interface ConsumetPlayerProps {
  config: VidkingPlayerConfig;
  onLoad?: () => void;
  onError?: (message: string) => void;
  className?: string;
  title?: string;
}

type Provider = "reanime" | "1anime";

const PROVIDERS: { id: Provider; label: string }[] = [
  { id: "reanime", label: "Server 1" },
  { id: "1anime", label: "Server 2" },
];

function mapLang(lang: string): { bcp47: string; label: string } {
  const m: Record<string, [string, string]> = {
    eng: ["en", "English"],
    en: ["en", "English"],
    ger: ["de", "German"],
    de: ["de", "German"],
    fre: ["fr", "French"],
    fr: ["fr", "French"],
    ita: ["it", "Italian"],
    it: ["it", "Italian"],
    spa: ["es", "Spanish"],
    es: ["es", "Spanish"],
    por: ["pt", "Portuguese"],
    pt: ["pt", "Portuguese"],
    rus: ["ru", "Russian"],
    ru: ["ru", "Russian"],
    ara: ["ar", "Arabic"],
    ar: ["ar", "Arabic"],
    chi: ["zh", "Chinese"],
    zh: ["zh", "Chinese"],
    ind: ["id", "Indonesian"],
    id: ["id", "Indonesian"],
    tha: ["th", "Thai"],
    th: ["th", "Thai"],
    may: ["ms", "Malay"],
    ms: ["ms", "Malay"],
    vie: ["vi", "Vietnamese"],
    vi: ["vi", "Vietnamese"],
    jpn: ["ja", "Japanese"],
    ja: ["ja", "Japanese"],
    kor: ["ko", "Korean"],
    ko: ["ko", "Korean"],
  };
  const e = m[lang];
  return e ? { bcp47: e[0], label: e[1] } : { bcp47: lang, label: lang };
}

function addSubtitles(hls: any, sources: ConsumetStreamingData) {
  if (!sources.subtitles?.length) return;
  for (const s of sources.subtitles) {
    const { bcp47, label } = mapLang(s.lang);
    (hls as any).subtitleTrackController?.addTextTrack(
      "subtitles",
      label,
      bcp47,
      s.url,
    );
  }
  if (hls.subtitleTracks?.length > 0) hls.subtitleTrack = 0;
}

// ---- Re:ANIME / FlixCloud -------------------------------------------------
// Uses the flixcloud.cc embed iframe — no auth, maps directly from AniList IDs.

interface ReanimeServer {
  $id: string;
  serverName: string;
  dataLink: string;
}

async function fetchReanimeServers(
  anilistId: number,
  episode: number,
): Promise<ReanimeServer[]> {
  try {
    // Proxied through Netlify to avoid CORS
    const res = await fetch(`/api/reanime/flix/${anilistId}/${episode}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.success ? (data.servers ?? []) : [];
  } catch {
    return [];
  }
}

export function ConsumetPlayer({
  config,
  onLoad,
  onError,
  className,
  title,
}: ConsumetPlayerProps) {
  const anilistId = config.tmdbId;
  const epNum = config.episode ?? 1;
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [provider, setProvider] = React.useState<Provider>("reanime");
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const hlsRef = React.useRef<Hls | null>(null);

  // Re:ANIME state
  const [reanimeServers, setReanimeServers] = React.useState<ReanimeServer[]>(
    [],
  );
  const [reanimeServerIdx, setReanimeServerIdx] = React.useState(0);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  // ---- 1Anime ------------------------------------------------------------

  const init1Anime = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const sources = await new ConsumetService().getStream(anilistId, epNum);
      if (!sources?.sources?.length) throw new Error("No sources");
      const best =
        sources.sources.find((s: any) => s.isM3U8) ?? sources.sources[0];
      const video = videoRef.current;
      if (!video) return;
      if ((best.url.endsWith(".m3u8") || best.isM3U8) && Hls.isSupported()) {
        const hls = new Hls();
        hlsRef.current = hls;
        hls.loadSource(best.url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          addSubtitles(hls, sources!);
          video.play().catch(() => {});
          setLoading(false);
          onLoad?.();
        });
        hls.on(Hls.Events.ERROR, () => {
          setError("Playback error");
          setLoading(false);
        });
      } else {
        video.src = best.url;
        setLoading(false);
        onLoad?.();
      }
    } catch (err: any) {
      setError(err?.message ?? "Failed");
      setLoading(false);
      onError?.(err?.message ?? "Failed");
    }
  }, [anilistId, epNum, onLoad, onError]);

  // ---- Re:ANIME ----------------------------------------------------------

  const initReanime = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const servers = await fetchReanimeServers(anilistId, epNum);
      if (!servers.length) throw new Error("No servers available");
      setReanimeServers(servers);
      setReanimeServerIdx(0);
      setLoading(false);
      onLoad?.();
    } catch (err: any) {
      setError(err?.message ?? "Failed");
      setLoading(false);
      onError?.(err?.message ?? "Failed");
    }
  }, [anilistId, epNum, onLoad, onError]);

  // ---- Init --------------------------------------------------------------

  const initPlayer = React.useCallback(
    async (prov: Provider) => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
      if (videoRef.current) videoRef.current.src = "";
      setReanimeServers([]);

      if (prov === "1anime") return init1Anime();
      if (prov === "reanime") return initReanime();
    },
    [init1Anime, initReanime],
  );

  React.useEffect(() => {
    initPlayer("reanime");
    return () => {
      hlsRef.current?.destroy();
    };
  }, [initPlayer]);

  const switchProvider = (prov: Provider) => {
    setProvider(prov);
    initPlayer(prov);
  };

  // ---- UI ----------------------------------------------------------------

  const providerBtns = (
    <div className="flex items-center gap-1.5">
      {PROVIDERS.map((p) => (
        <button
          key={p.id}
          onClick={() => switchProvider(p.id)}
          className={cn(
            "px-2.5 py-1 text-[10px] rounded border transition-colors font-mono",
            provider === p.id
              ? "bg-primary/20 text-primary border-primary/40"
              : "border-white/10 text-white/40 hover:text-white/70 hover:border-white/20",
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  );

  // Shared control bar rendered below the player
  const controlBar = (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-2 px-1">
      <div className="flex items-center gap-2 flex-shrink-0">
        <Server className="w-3 h-3 text-white/30 shrink-0" />
        {providerBtns}
      </div>
      {/* Re:ANIME sub-server selector (HD-1 / HD-2) */}
      {provider === "reanime" && reanimeServers.length > 1 && (
        <div className="flex items-center gap-1 flex-wrap overflow-x-auto max-w-full">
          {reanimeServers.map((s, i) => (
            <button
              key={s.$id}
              onClick={() => setReanimeServerIdx(i)}
              className={cn(
                "px-2 py-0.5 text-[10px] rounded border transition-colors font-mono",
                i === reanimeServerIdx
                  ? "bg-green-500/20 text-green-400 border-green-500/40"
                  : "border-white/10 text-white/40 hover:text-white/70",
              )}
            >
              {s.serverName}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className={cn("flex flex-col", className)}>
        <div className="w-full aspect-video bg-black flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground font-mono">
            Connecting to {PROVIDERS.find((p) => p.id === provider)?.label}...
          </p>
        </div>
        {controlBar}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn("flex flex-col", className)}>
        <div className="w-full aspect-video bg-black flex flex-col items-center justify-center gap-4">
          <AlertTriangle className="h-10 w-10 text-destructive" />
          <p className="text-sm text-muted-foreground text-center px-4">
            {error}
          </p>
        </div>
        {controlBar}
      </div>
    );
  }

  // Re:ANIME iframe render
  if (provider === "reanime" && reanimeServers.length > 0) {
    const currentServer = reanimeServers[reanimeServerIdx];
    return (
      <div className={cn("flex flex-col", className)}>
        <iframe
          ref={iframeRef}
          src={currentServer.dataLink}
          className="w-full aspect-video"
          allow="autoplay; fullscreen"
          allowFullScreen
          title={title}
        />
        {controlBar}
      </div>
    );
  }

  // 1Anime video element render
  return (
    <div className={cn("flex flex-col", className)}>
      <video
        ref={videoRef}
        className="w-full aspect-video"
        controls
        autoPlay
        playsInline
        crossOrigin="anonymous"
      />
      {controlBar}
    </div>
  );
}
