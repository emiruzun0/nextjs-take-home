import type { NextRequest } from "next/server";
import { suggestCities } from "@/server/suggest-cities";

// Open-Meteo needs at least 2 characters to search.
const MIN_LENGTH = 2;

// GET /api/cities?q=par → { ok: true, data: Location[] } or { ok: false, error }.
// The body tells our frontend what happened; the status code tells everything else.
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < MIN_LENGTH) return Response.json({ ok: true, data: [] });

  const result = await suggestCities(q);
  return Response.json(result, { status: result.ok ? 200 : 502 });
}
