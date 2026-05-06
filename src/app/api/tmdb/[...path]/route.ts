import { NextRequest, NextResponse } from "next/server";

// Simple in-memory rate limiter (resets on cold start, fine for serverless)
const rateLimit = new Map<string, { count: number; reset: number }>();
const RATE_LIMIT = 60; // requests per window
const RATE_WINDOW = 60_000; // 1 minute in ms

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.reset) {
    rateLimit.set(ip, { count: 1, reset: now + RATE_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const apiPath = path.join("/");
  const searchParams = request.nextUrl.searchParams;

  const tmdbUrl = new URL(`https://api.themoviedb.org/3/${apiPath}`);
  tmdbUrl.searchParams.set("api_key", process.env.TMDB_API_KEY!);
  searchParams.forEach((value, key) => {
    tmdbUrl.searchParams.set(key, value);
  });

  // Rate limiting
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait." },
      {
        status: 429,
        headers: { "Retry-After": "60" },
      },
    );
  }

  try {
    const response = await fetch(tmdbUrl.toString(), {
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 3600 },
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
      headers: {
        "Cache-Control":
          "public, s-maxage=3600, stale-while-revalidate=86400, max-age=3600",
        "CDN-Cache-Control":
          "public, max-age=3600, stale-while-revalidate=86400",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("TMDB proxy error:", error);
    return NextResponse.json(
      { error: "Failed to fetch from TMDB" },
      { status: 500 },
    );
  }
}
