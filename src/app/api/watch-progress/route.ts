import { NextRequest, NextResponse } from "next/server";

interface WatchProgressPayload {
  tmdbId: number;
  mediaType: string;
  season?: number;
  episode?: number;
  progress: number;
  duration: number;
  updatedAt: string;
}

// In-memory store (replace with database in production)
const progressStore = new Map<string, WatchProgressPayload>();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tmdbId = searchParams.get("tmdbId");
  const mediaType = searchParams.get("mediaType");
  const season = searchParams.get("season");
  const episode = searchParams.get("episode");

  if (!tmdbId || !mediaType) {
    return NextResponse.json(
      { error: "Missing required parameters: tmdbId, mediaType" },
      { status: 400 },
    );
  }

  const key = season
    ? `${mediaType}_${tmdbId}_s${season}_e${episode || 0}`
    : `${mediaType}_${tmdbId}`;

  const progress = progressStore.get(key);

  if (!progress) {
    return NextResponse.json({ progress: 0, duration: 0 }, { status: 200 });
  }

  return NextResponse.json(progress, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    const body: WatchProgressPayload = await request.json();

    if (!body.tmdbId || !body.mediaType) {
      return NextResponse.json(
        { error: "Missing required fields: tmdbId, mediaType" },
        { status: 400 },
      );
    }

    const key =
      body.season !== undefined
        ? `${body.mediaType}_${body.tmdbId}_s${body.season}_e${body.episode || 0}`
        : `${body.mediaType}_${body.tmdbId}`;

    progressStore.set(key, {
      ...body,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Watch progress error:", error);
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}
