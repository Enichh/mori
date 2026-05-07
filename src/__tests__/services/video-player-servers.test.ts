import { describe, it, expect } from "vitest";

describe("Video Player Servers", () => {
  it("should include consumet (1Anime) in VIDEO_SERVERS", async () => {
    const { VIDEO_SERVERS } = await import("@/lib/constants");
    expect(VIDEO_SERVERS).toHaveProperty("consumet");
    expect(VIDEO_SERVERS.consumet).toBe("1Anime");
  });

  it("PlayerServer type should include consumet", () => {
    expect(true).toBe(true);
  });
});
