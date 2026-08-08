// ---------------------------------------------------------------------------
// Embed provider health check — run before deployment
//
// Usage:  node test-providers.mjs
//         npm run test:providers
// ---------------------------------------------------------------------------

const MOVIE_ID = 687163; // Project Hail Mary (2026)
const TV_ID = 2288;      // Desperate Housewives
const TV_SEASON = 1;
const TV_EPISODE = 1;

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const TIMEOUT_MS = 10_000;

// ---------------------------------------------------------------------------
// Provider definitions — matches video-player.tsx SERVERS
// ---------------------------------------------------------------------------

/** @typedef {{ id: string, label: string, movieUrl: string, tvUrl: string }} Provider */

/** @type {Provider[]} */
const PROVIDERS = [
  {
    id: "vidsrc",
    label: "Nova",
    movieUrl: `https://vidsrc.mov/embed/movie/${MOVIE_ID}`,
    tvUrl: `https://vidsrc.mov/embed/tv/${TV_ID}/${TV_SEASON}/${TV_EPISODE}`,
  },
  {
    id: "vidlink",
    label: "Luna",
    movieUrl: `https://vidlink.pro/movie/${MOVIE_ID}`,
    tvUrl: `https://vidlink.pro/tv/${TV_ID}/${TV_SEASON}/${TV_EPISODE}`,
  },
  {
    id: "yapgrid",
    label: "Thea",
    movieUrl: `https://yapgrid.com/embed/movie/${MOVIE_ID}`,
    tvUrl: `https://yapgrid.com/embed/tv/${TV_ID}/${TV_SEASON}/${TV_EPISODE}`,
  },
  {
    id: "rin",
    label: "Rin",
    movieUrl: `https://vidsrc.to/embed/movie/${MOVIE_ID}`,
    tvUrl: `https://vidsrc.to/embed/tv/${TV_ID}/${TV_SEASON}/${TV_EPISODE}`,
  },
  {
    id: "embedapi",
    label: "Zara",
    movieUrl: `https://player.embed-api.stream/?id=${MOVIE_ID}`,
    tvUrl: `https://player.embed-api.stream/?id=${TV_ID}&s=${TV_SEASON}&e=${TV_EPISODE}`,
  },
  {
    id: "twoembed",
    label: "Maya",
    movieUrl: `https://www.2embed.cc/embed/${MOVIE_ID}`,
    tvUrl: `https://www.2embed.cc/embedtv/${TV_ID}&s=${TV_SEASON}&e=${TV_EPISODE}`,
  },
  {
    id: "111movies",
    label: "Cleo",
    movieUrl: `https://111movies.com/movie/${MOVIE_ID}`,
    tvUrl: `https://111movies.com/tv/${TV_ID}/${TV_SEASON}/${TV_EPISODE}`,
  },
  {
    id: "videasy",
    label: "Rosa",
    movieUrl: `https://player.videasy.net/movie/${MOVIE_ID}`,
    tvUrl: `https://player.videasy.net/tv/${TV_ID}/${TV_SEASON}/${TV_EPISODE}`,
  },
  {
    id: "vidking",
    label: "Faye",
    movieUrl: `https://www.vidking.net/embed/movie/${MOVIE_ID}?color=C5FF4A`,
    tvUrl: `https://www.vidking.net/embed/tv/${TV_ID}/${TV_SEASON}/${TV_EPISODE}?color=C5FF4A`,
  },
  {
    id: "streamvault",
    label: "Iris",
    movieUrl: `https://streamvaultsrc.click/embed/movie/${MOVIE_ID}`,
    tvUrl: `https://streamvaultsrc.click/embed/tv/${TV_ID}/${TV_SEASON}/${TV_EPISODE}`,
  },
  {
    id: "superembed",
    label: "Eden",
    movieUrl: `https://multiembed.mov/?video_id=${MOVIE_ID}&tmdb=1`,
    tvUrl: `https://multiembed.mov/?video_id=${TV_ID}&tmdb=1&s=${TV_SEASON}&e=${TV_EPISODE}`,
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const RESET = "\x1b[0m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const GRAY = "\x1b[90m";
const BOLD = "\x1b[1m";

function fmtOk(s) {
  return `${GREEN}${s}${RESET}`;
}
function fmtFail(s) {
  return `${RED}${s}${RESET}`;
}
function fmtWarn(s) {
  return `${YELLOW}${s}${RESET}`;
}
function fmtGray(s) {
  return `${GRAY}${s}${RESET}`;
}

/** Fetch with manual redirect handling — never follows redirects to slow embed pages. */
async function probe(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const t0 = Date.now();
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { "User-Agent": UA },
      redirect: "manual",
      signal: controller.signal,
    });
    const ms = Date.now() - t0;
    clearTimeout(timer);

    const xfo = (res.headers.get("x-frame-options") || "").toLowerCase();
    const csp = (res.headers.get("content-security-policy") || "").toLowerCase();

    return {
      status: res.status,
      ms,
      xfo,
      csp,
      ok: true,
    };
  } catch (err) {
    clearTimeout(timer);
    const ms = Date.now() - t0;
    if (err.name === "AbortError") {
      return { status: 0, ms, xfo: "", csp: "", ok: false, reason: "timeout" };
    }
    return { status: 0, ms, xfo: "", csp: "", ok: false, reason: err.message };
  }
}

/**
 * Check a single URL. Returns one of: "ok", "warn", "fail"
 */
function check(status, xfo, csp, reason) {
  // Errors that aren't timeouts (DNS, connection refused, etc.)
  if (status === 0 && reason && reason !== "timeout") return "warn";
  // Timeout
  if (status === 0) return "warn";
  // Transient: these often come and go
  if (status === 403) return "warn";
  if (status === 522) return "warn";
  if (status === 503) return "warn";
  if (status >= 500 && status !== 522 && status !== 503) return "fail";

  // Healthy responses
  if (status === 200) return "ok";
  if (status === 301 || status === 302) return "ok";

  // 404 — the provider doesn't have this title
  if (status === 404) return "fail";

  // Frame-blocking headers (only relevant for 200/301/302)
  if (status === 200 || status === 301 || status === 302) {
    if (xfo === "deny" || xfo === "sameorigin") return "fail";
    if (
      csp.includes("frame-ancestors 'none'") ||
      csp.includes("frame-ancestors 'self'")
    )
      return "fail";
  }

  return "fail"; // anything unexpected
}

/** Human-readable reason for a result. */
function explain(status, xfo, csp, reason) {
  if (status === 0 && reason && reason !== "timeout")
    return `error: ${reason}`;
  if (status === 0) return "timeout";
  if (status === 404) return "404 not found";
  if (status === 403) return "403 forbidden (transient)";
  if (status === 522) return "522 origin timeout (transient)";
  if (status === 503) return "503 unavailable (transient)";
  if (status >= 500) return `${status} server error`;
  if (xfo === "deny" || xfo === "sameorigin")
    return `X-Frame-Options: ${xfo}`;
  if (csp.includes("frame-ancestors 'none'"))
    return "CSP frame-ancestors 'none'";
  if (csp.includes("frame-ancestors 'self'"))
    return "CSP frame-ancestors 'self'";
  return `${status}`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

let hardFailures = 0;

console.log(`${BOLD}Embed Provider Health Check${RESET}`);
console.log(`Movie: Project Hail Mary (${MOVIE_ID})  |  TV: Desperate Housewives (${TV_ID}) S${TV_SEASON}E${TV_EPISODE}\n`);

for (const p of PROVIDERS) {
  const label = `${p.label.padEnd(6)}`;

  // --- movie ---
  const mr = await probe(p.movieUrl);
  const mResult = check(mr.status, mr.xfo, mr.csp, mr.reason);
  const mMs = fmtGray(`${mr.ms}ms`.padStart(6));

  let mIcon, mDetail;
  if (mResult === "ok") {
    mIcon = fmtOk("✓");
    mDetail = fmtGray(`${mr.status}`);
  } else if (mResult === "warn") {
    mIcon = fmtWarn("⚠");
    mDetail = fmtWarn(`${explain(mr.status, mr.xfo, mr.csp, mr.reason)}`);
  } else {
    mIcon = fmtFail("✗");
    mDetail = fmtFail(`${explain(mr.status, mr.xfo, mr.csp, mr.reason)}`);
    hardFailures++;
  }

  // --- tv ---
  const tr = await probe(p.tvUrl);
  const tResult = check(tr.status, tr.xfo, tr.csp, tr.reason);
  const tMs = fmtGray(`${tr.ms}ms`.padStart(6));

  let tIcon, tDetail;
  if (tResult === "ok") {
    tIcon = fmtOk("✓");
    tDetail = fmtGray(`${tr.status}`);
  } else if (tResult === "warn") {
    tIcon = fmtWarn("⚠");
    tDetail = fmtWarn(`${explain(tr.status, tr.xfo, tr.csp, tr.reason)}`);
  } else {
    tIcon = fmtFail("✗");
    tDetail = fmtFail(`${explain(tr.status, tr.xfo, tr.csp, tr.reason)}`);
    hardFailures++;
  }

  console.log(
    `  ${CYAN}${label}${RESET} ` +
      `Movie ${mIcon} ${mMs} ${mDetail}  |  ` +
      `TV   ${tIcon} ${tMs} ${tDetail}`,
  );
}

console.log("");
if (hardFailures > 0) {
  console.log(fmtFail(`✗ ${hardFailures} hard failure(s) — deploy with caution`));
  process.exit(1);
} else {
  console.log(fmtOk("✓ All providers healthy"));
  process.exit(0);
}
