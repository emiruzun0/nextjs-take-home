import "server-only";
import { cacheLife } from "next/cache";
import { z } from "zod";
import type { HourlyWeather } from "@/shared/weather";
import { fetchJson } from "./fetch-json";

const ForecastSchema = z.object({
  utc_offset_seconds: z.number(),
  hourly: z.object({
    time: z.array(z.string()),
    apparent_temperature: z.array(z.number()),
    wind_speed_10m: z.array(z.number()),
    precipitation: z.array(z.number()),
    precipitation_probability: z.array(z.number()),
    weather_code: z.array(z.number()),
    is_day: z.array(z.number()),
  }),
});

export type HourlyForecast = {
  utcOffsetSeconds: number;
  hours: HourlyWeather[];
};

// Hourly forecast for today and tomorrow, in US units and the city's local time.
export async function fetchHourlyForecast(
  latitude: number,
  longitude: number,
): Promise<HourlyForecast> {
  "use cache";
  cacheLife("hours");

  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set(
    "hourly",
    "apparent_temperature,wind_speed_10m,precipitation,precipitation_probability,weather_code,is_day",
  );
  url.searchParams.set("temperature_unit", "fahrenheit");
  url.searchParams.set("wind_speed_unit", "mph");
  url.searchParams.set("precipitation_unit", "inch");
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", "2");

  const data = await fetchJson(url.toString(), ForecastSchema);
  const h = data.hourly;

  const hours = h.time.map((time, i) => ({
    time,
    feelsLikeF: at(h.apparent_temperature, i),
    windMph: at(h.wind_speed_10m, i),
    precipitationIn: at(h.precipitation, i),
    precipitationChance: at(h.precipitation_probability, i),
    weatherCode: at(h.weather_code, i),
    isDay: at(h.is_day, i) === 1,
  }));

  return { utcOffsetSeconds: data.utc_offset_seconds, hours };
}

// Open-Meteo sends each variable as its own array. If one is shorter than
// `time`, the response is broken and we'd rather fail than guess.
function at(values: number[], i: number): number {
  const value = values[i];
  if (value === undefined) throw new Error(`Missing hourly value at index ${i}`);
  return value;
}
