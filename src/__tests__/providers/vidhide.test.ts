import { describe, it, expect } from "vitest";
import {
  buildVidhideIframeFromUrl,
  pickBestSource,
} from "@/services/vidhide/embed";
import type { VidhideSource } from "@/types/player";

// ---------------------------------------------------------------------------
// buildVidhideIframeFromUrl
// ---------------------------------------------------------------------------

describe("buildVidhideIframeFromUrl", () => {
  it("wraps a vidhidepro URL in an iframe with /v/ path", () => {
    const url = "https://vidhidepro.com/d/abc123";

    const html = buildVidhideIframeFromUrl(url);

    expect(html).toContain('<iframe');
    expect(html).toContain('src="https://vidhidepro.com/v/abc123"');
    expect(html).toContain('width="100%"');
    expect(html).toContain('height="100%"');
    expect(html).toContain('allow="autoplay; fullscreen"');
    expect(html).toContain('allowfullscreen');
    expect(html).toContain('referrerpolicy="no-referrer"');
    expect(html).toContain('></iframe>');
  });

  it("keeps the /v/ path unchanged if already present", () => {
    const url = "https://vidhidepro.com/v/abc123";

    const html = buildVidhideIframeFromUrl(url);

    expect(html).toContain('src="https://vidhidepro.com/v/abc123"');
  });

  it("converts /embed/ path to /v/ path", () => {
    const url = "https://vidhidepro.com/embed/abc123";

    const html = buildVidhideIframeFromUrl(url);

    expect(html).toContain('src="https://vidhidepro.com/v/abc123"');
  });

  it("accepts custom width and height", () => {
    const url = "https://vidhidepro.com/d/movie1";

    const html = buildVidhideIframeFromUrl(url, "640", "360");

    expect(html).toContain('width="640"');
    expect(html).toContain('height="360"');
  });
});

// ---------------------------------------------------------------------------
// pickBestSource
// ---------------------------------------------------------------------------

describe("pickBestSource", () => {
  it("returns the highest quality source based on ranking", () => {
    const sources: VidhideSource[] = [
      { url: "https://example.com/360p.mp4", quality: "360p", size: "100MB", type: "mp4" },
      { url: "https://example.com/1080p.mp4", quality: "1080p", size: "500MB", type: "mp4" },
      { url: "https://example.com/720p.mp4", quality: "720p", size: "300MB", type: "mp4" },
    ];

    const best = pickBestSource(sources);

    expect(best).not.toBeNull();
    expect(best!.quality).toBe("1080p");
    expect(best!.url).toBe("https://example.com/1080p.mp4");
  });

  it("prefers 2160p over 1080p", () => {
    const sources: VidhideSource[] = [
      { url: "https://example.com/1080p.mp4", quality: "1080p", size: "500MB", type: "mp4" },
      { url: "https://example.com/4k.mp4", quality: "2160p", size: "2GB", type: "mp4" },
      { url: "https://example.com/720p.mp4", quality: "720p", size: "300MB", type: "mp4" },
    ];

    const best = pickBestSource(sources);

    expect(best).not.toBeNull();
    expect(best!.quality).toBe("2160p");
  });

  it("returns null for an empty array", () => {
    const sources: VidhideSource[] = [];

    const best = pickBestSource(sources);

    expect(best).toBeNull();
  });

  it("returns the first source when qualities are unrecognized", () => {
    const sources: VidhideSource[] = [
      { url: "https://example.com/a.mp4", quality: "unknown-a", size: "100MB", type: "mp4" },
      { url: "https://example.com/b.mp4", quality: "unknown-b", size: "200MB", type: "mp4" },
    ];

    const best = pickBestSource(sources);

    expect(best).not.toBeNull();
    expect(best!.url).toBe("https://example.com/a.mp4");
  });

  it("handles case-insensitive quality matching", () => {
    const sources: VidhideSource[] = [
      { url: "https://example.com/a.mp4", quality: "720P", size: "300MB", type: "mp4" },
      { url: "https://example.com/b.mp4", quality: "1080p", size: "500MB", type: "mp4" },
    ];

    const best = pickBestSource(sources);

    expect(best).not.toBeNull();
    expect(best!.quality).toBe("1080p");
  });
});
