import "server-only";
import type { z } from "zod";

// Fetches JSON and checks it against a schema. Throws on a bad status or an
// unexpected shape, so callers only ever see data that matches the schema.
export async function fetchJson<T extends z.ZodType>(
  url: string,
  schema: T,
): Promise<z.infer<T>> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${url} responded with ${response.status}`);
  }
  return schema.parse(await response.json());
}
