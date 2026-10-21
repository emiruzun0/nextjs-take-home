import { ActivityCard } from "@/components/activity-card";
import { RetryButton } from "@/components/retry-button";
import { ScoreTable } from "@/components/score-table";
import { SearchForm } from "@/components/search-form";
import { StatusMessage } from "@/components/status-message";
import { ToggleLinks } from "@/components/toggle-links";
import { ACTIVITY_IDS } from "@/scoring/activities";
import { getCityForecast } from "@/server/get-city-forecast";
import { buildRows } from "./build-rows";
import { type Query, toggleActivity, toHref } from "./query";
import { ACTIVITY_LABELS } from "./text";

// Decides what to show for every state: no city yet, city not found,
// service down, no activities picked, or the forecast itself.
export async function ForecastPage({ query }: { query: Query }) {
  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-4 p-4 sm:p-6">
      <header>
        <h1 className="text-2xl font-semibold">Activity Weather</h1>
        <p className="text-neutral-600">
          The best hours for outdoor activities today and tomorrow. Scores go from 0 to 100, and 100 is
          the best.
        </p>
      </header>

      <SearchForm city={query.city} keep={keepParams(query)} />

      {query.city ? (
        <Forecast query={query} />
      ) : (
        <StatusMessage title="Search for a city to see today's and tomorrow's scores." />
      )}
    </main>
  );
}

async function Forecast({ query }: { query: Query }) {
  const result = await getCityForecast(query.city);

  if (!result.ok) {
    switch (result.error.code) {
      case "CITY_NOT_FOUND":
        return (
          <StatusMessage title={`We couldn't find "${query.city}".`}>
            Check the spelling, or try a nearby larger city.
          </StatusMessage>
        );
      case "UPSTREAM_FAILED":
        return (
          <StatusMessage title="The weather service isn't responding right now.">
            <p>This is usually temporary.</p>
            <RetryButton />
          </StatusMessage>
        );
    }
  }

  const { location, hours } = result.data;
  const { columns, rows } = buildRows(hours, query.activities);
  // Skip the region when it repeats the city name ("Istanbul, Istanbul").
  const region = location.region === location.name ? null : location.region;
  const place = [location.name, region, location.country].filter(Boolean).join(", ");

  return (
    <>
      <h2 className="text-xl font-semibold">{place}</h2>

      <ToggleLinks
        label="Activities"
        options={ACTIVITY_IDS.map((id) => ({
          label: ACTIVITY_LABELS[id],
          href: toHref(toggleActivity(query, id)),
          selected: query.activities.includes(id),
        }))}
      />
      <ToggleLinks
        label="Layout"
        options={[
          { label: "Cards", href: toHref({ ...query, view: "cards" }), selected: query.view === "cards" },
          { label: "Table", href: toHref({ ...query, view: "table" }), selected: query.view === "table" },
        ]}
      />

      {rows.length === 0 ? (
        <StatusMessage title="Pick at least one activity to see its scores." />
      ) : query.view === "table" ? (
        <ScoreTable rows={rows} hours={columns} />
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((row) => (
            <ActivityCard key={row.id} row={row} hours={columns} />
          ))}
        </div>
      )}
    </>
  );
}

// The search form only changes the city, so it carries the other settings along.
function keepParams(query: Query): Record<string, string> {
  const params = new URLSearchParams(toHref({ ...query, city: "" }).slice(2));
  return Object.fromEntries(params);
}
