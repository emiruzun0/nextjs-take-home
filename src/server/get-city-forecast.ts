import "server-only";
import { unstable_rethrow } from "next/navigation";
import { connection } from "next/server";
import type { Result } from "@/shared/result";
import type { CityForecast, HourlyWeather, Location } from "@/shared/weather";
import { fetchHourlyForecast } from "./forecast";
import { findCity, findCityById, searchCities } from "./geocoding";

// A place is either picked from the suggestions (by ID) or typed by name.
export type PlaceQuery = { id: number } | { name: string };

// The one entry point the page calls. Every outcome comes back as a Result.
// Failures are thrown inside the cached functions instead of returned, so a
// temporary outage isn't cached for an hour.
export async function getCityForecast(place: PlaceQuery): Promise<Result<CityForecast>> {
  // Which hours are "upcoming" depends on the current time, so this can't be
  // prerendered at build time. Wait for a real request first.
  await connection();
  const now = new Date();

  try {
    const location = "id" in place ? await findCityById(place.id) : await findCity(place.name);
    if (!location) return { ok: false, error: { code: "CITY_NOT_FOUND" } };

    const forecast = await fetchHourlyForecast(location.latitude, location.longitude);
    const hours = upcomingHours(forecast.hours, forecast.utcOffsetSeconds, now);
    return { ok: true, data: { location, hours } };
  } catch (error) {
    // Next.js uses thrown errors for its own control flow; let those through.
    unstable_rethrow(error);
    console.error("Forecast request failed", error);
    return { ok: false, error: { code: "UPSTREAM_FAILED" } };
  }
}

// Up to 5 places matching what the user has typed so far, for the search box.
export async function suggestCities(name: string): Promise<Result<Location[]>> {
  try {
    return { ok: true, data: await searchCities(name, 5) };
  } catch (error) {
    unstable_rethrow(error);
    console.error("City search failed", error);
    return { ok: false, error: { code: "UPSTREAM_FAILED" } };
  }
}

// Drops hours that have already passed in the city's own time zone, keeping
// the current hour. What's left is the rest of today plus all of tomorrow.
export function upcomingHours(
  hours: HourlyWeather[],
  utcOffsetSeconds: number,
  now: Date,
): HourlyWeather[] {
  // Shift "now" into the city's local time, then compare "YYYY-MM-DDTHH" strings.
  const localNow = new Date(now.getTime() + utcOffsetSeconds * 1000);
  const currentHour = localNow.toISOString().slice(0, 13);
  return hours.filter((hour) => hour.time.slice(0, 13) >= currentHour);
}
