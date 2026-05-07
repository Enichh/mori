// ---------------------------------------------------------------------------
// Mori ― Anime stream service tests (1Anime CDN)
// ---------------------------------------------------------------------------
import { describe, it, expect } from "vitest";
import { ConsumetService } from "@/services/consumet";

describe("Anime Stream Service", () => {
  it("should create with default URL", () => {
    const service = new ConsumetService();
    expect(service).toBeDefined();
  });

  it("should create with custom URL", () => {
    const service = new ConsumetService("https://custom.stream.org");
    expect(service).toBeDefined();
  });

  it("should have all expected methods", () => {
    const service = new ConsumetService();
    expect(typeof service.search).toBe("function");
    expect(typeof service.getInfo).toBe("function");
    expect(typeof service.getSources).toBe("function");
    expect(typeof service.getStream).toBe("function");
    expect(typeof service.getEmbedUrl).toBe("function");
  });

  it("getEmbedUrl should return URL as-is", () => {
    const service = new ConsumetService();
    const url = "https://example.com/stream.m3u8";
    expect(service.getEmbedUrl(url)).toBe(url);
  });

  it("search should handle errors gracefully", async () => {
    const service = new ConsumetService();
    const results = await service.search("nonexistent-anime-xyz-12345");
    expect(Array.isArray(results)).toBe(true);
  });
});
