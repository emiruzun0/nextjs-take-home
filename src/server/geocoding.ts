import "server-only";
import { cacheLife } from "next/cache";
import { z } from "zod";
import type { Location } from "@/shared/weather";
import { fetchJson } from "./fetch-json";

const PlaceSchema = z.object({
  id: z.number(),
  name: z.string(),
  admin1: z.string().optional(),
  country: z.string(),
  latitude: z.number(),
  longitude: z.number(),
});

const SearchSchema = z.object({
  // Open-Meteo leaves out `results` entirely when nothing matches.
  results: z.array(PlaceSchema).optional(),
});

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1";

// The best matches for a name, most relevant first. Empty if nothing matches.
export async function searchCities(name: string, count: number): Promise<Location[]> {
  "use cache";
  cacheLife("days");

  const url = new URL(`${GEOCODING_URL}/search`);
  url.searchParams.set("name", name);
  url.searchParams.set("count", String(count));
  url.searchParams.set("language", "en");

  const { results } = await fetchJson(url.toString(), SearchSchema);
  return (results ?? []).map(toLocation);
}

// The top match for a typed name, or null if there is none.
export async function findCity(name: string): Promise<Location | null> {
  const [match] = await searchCities(name, 1);
  return match ?? null;
}

// One specific place, picked from the suggestions. Null if the ID doesn't exist.
export async function findCityById(id: number): Promise<Location | null> {
  "use cache";
  cacheLife("days");

  const url = new URL(`${GEOCODING_URL}/get`);
  url.searchParams.set("id", String(id));

  const response = await fetch(url);
  // Open-Meteo answers an unknown ID with 400 "Location ID not found".
  if (response.status === 400) return null;
  if (!response.ok) throw new Error(`${url} responded with ${response.status}`);
  return toLocation(PlaceSchema.parse(await response.json()));
}

function toLocation(place: z.infer<typeof PlaceSchema>): Location {
  return {
    id: place.id,
    name: place.name,
    region: place.admin1 ?? null,
    country: place.country,
    latitude: place.latitude,
    longitude: place.longitude,
  };
}
