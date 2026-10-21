import { ACTIVITY_IDS, type ActivityId } from "@/scoring/activities";

export type View = "cards" | "table";

// Everything the page shows is described by the URL, so any view can be shared.
export type Query = {
  city: string;
  activities: ActivityId[];
  view: View;
};

type SearchParams = Record<string, string | string[] | undefined>;

export function parseQuery(params: SearchParams): Query {
  const city = first(params.city)?.trim() ?? "";
  const view = first(params.view) === "table" ? "table" : "cards";

  // No `activities` param means "show all". An empty one means the user turned all of them off.
  const raw = first(params.activities);
  const activities =
    raw === undefined
      ? ACTIVITY_IDS
      : ACTIVITY_IDS.filter((id) => raw.split(",").includes(id));

  return { city, activities, view };
}

export function toHref(query: Query): string {
  const params = new URLSearchParams();
  if (query.city) params.set("city", query.city);
  if (query.activities.length !== ACTIVITY_IDS.length) {
    params.set("activities", query.activities.join(","));
  }
  if (query.view !== "cards") params.set("view", query.view);
  // Keep commas readable in shared links: "running,soccer" instead of "running%2Csoccer".
  const search = params.toString().replaceAll("%2C", ",");
  return search ? `/?${search}` : "/";
}

// Returns the query with one activity switched on or off, keeping the usual order.
export function toggleActivity(query: Query, id: ActivityId): Query {
  const isOn = query.activities.includes(id);
  const activities = ACTIVITY_IDS.filter((a) => (a === id ? !isOn : query.activities.includes(a)));
  return { ...query, activities };
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
