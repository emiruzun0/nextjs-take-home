import "server-only";
import { unstable_rethrow } from "next/navigation";
import type { Result } from "@/shared/result";
import type { Location } from "@/shared/weather";
import { searchCities } from "./geocoding";

// Up to 5 places matching what the user has typed so far, for the search box.
export async function suggestCities(name: string): Promise<Result<Location[]>> {
  try {
    return { ok: true, data: await searchCities(name, 5) };
  } catch (error) {
    // Next.js uses thrown errors for its own control flow; let those through.
    unstable_rethrow(error);
    console.error("City search failed", error);
    return { ok: false, error: { code: "UPSTREAM_FAILED" } };
  }
}
