import "server-only";
import { cacheLife } from "next/cache";
import { z } from "zod";
import type { Location } from "@/shared/weather";
import { fetchJson } from "./fetch-json";

const GeocodingSchema = z.object({
  // Open-Meteo leaves out `results` entirely when nothing matches.
  results: z
    .array(
      z.object({
        name: z.string(),
        admin1: z.string().optional(),
        country: z.string(),
        latitude: z.number(),
        longitude: z.number(),
      }),
    )
    .optional(),
});

// Returns the best match for a city name, or null if there is none.
export async function findCity(name: string): Promise<Location | null> {
  "use cache";
  cacheLife("days");

  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", name);
  url.searchParams.set("count", "1");
  url.searchParams.set("language", "en");

  const { results } = await fetchJson(url.toString(), GeocodingSchema);
  const match = results?.[0];
  if (!match) return null;

  return {
    name: match.name,
    region: match.admin1 ?? null,
    country: match.country,
    latitude: match.latitude,
    longitude: match.longitude,
  };
}
