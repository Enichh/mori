// ---------------------------------------------------------------------------
// Mori ― Category Services interface compliance tests
// ---------------------------------------------------------------------------
// These smoke tests verify that each category service exposes the expected
// methods on its prototype.  We avoid instantiation because the constructors
// require a TmdbClient (which needs an API key).  Prototype checks give us
// confidence that the public API contract is fulfilled.
// ---------------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import { TVService } from "@/services/tmdb/tv";
import { RegionalService } from "@/services/tmdb/regional";
import { AnimeService } from "@/services/tmdb/anime";

// ---------------------------------------------------------------------------
// TVService (KDrama)
// ---------------------------------------------------------------------------

describe("TVService ― KDrama discover", () => {
  it("should expose discoverKDrama on the prototype", () => {
    expect(typeof TVService.prototype.discoverKDrama).toBe("function");
  });

  it("should expose discover (generic TV) on the prototype", () => {
    expect(typeof TVService.prototype.discover).toBe("function");
  });

  it("should expose legacy getKDrama convenience method", () => {
    expect(typeof TVService.prototype.getKDrama).toBe("function");
  });
});

// ---------------------------------------------------------------------------
// RegionalService (Filipino)
// ---------------------------------------------------------------------------

describe("RegionalService ― Filipino discover", () => {
  it("should expose discoverFilipinoMovies on the prototype", () => {
    // NOTE: If this fails, the method has not been implemented on the class
    // yet, even though IRegionalService declares it.  Implement it to match
    // the interface contract.
    expect(typeof RegionalService.prototype.discoverFilipinoMovies).toBe(
      "function",
    );
  });

  it("should expose discoverFilipinoTV on the prototype", () => {
    expect(typeof RegionalService.prototype.discoverFilipinoTV).toBe(
      "function",
    );
  });

  it("should expose getFilipinoMovies (legacy) on the prototype", () => {
    expect(typeof RegionalService.prototype.getFilipinoMovies).toBe("function");
  });

  it("should expose getFilipinoTV (legacy) on the prototype", () => {
    expect(typeof RegionalService.prototype.getFilipinoTV).toBe("function");
  });

  it("should expose getByCountry on the prototype", () => {
    expect(typeof RegionalService.prototype.getByCountry).toBe("function");
  });
});

// ---------------------------------------------------------------------------
// AnimeService
// ---------------------------------------------------------------------------

describe("AnimeService", () => {
  it("should expose discover on the prototype", () => {
    expect(typeof AnimeService.prototype.discover).toBe("function");
  });

  it("should expose getTrending on the prototype", () => {
    expect(typeof AnimeService.prototype.getTrending).toBe("function");
  });

  it("should expose getPopular on the prototype", () => {
    expect(typeof AnimeService.prototype.getPopular).toBe("function");
  });

  it("should expose getTopRated on the prototype", () => {
    expect(typeof AnimeService.prototype.getTopRated).toBe("function");
  });

  it("should expose getByGenre on the prototype", () => {
    expect(typeof AnimeService.prototype.getByGenre).toBe("function");
  });

  it("should expose getDetails on the prototype", () => {
    expect(typeof AnimeService.prototype.getDetails).toBe("function");
  });
});
