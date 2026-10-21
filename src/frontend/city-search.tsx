"use client";

import Form from "next/form";
import { useRouter } from "next/navigation";
import { type KeyboardEvent, useEffect, useState } from "react";
import type { Result } from "@/shared/result";
import type { Location } from "@/shared/weather";
import { type Query, toHref } from "./query";
import { placeLabel } from "./text";

// Wait until the user stops typing before asking the server.
const DEBOUNCE_MS = 250;
const MIN_LENGTH = 2;
const LIST_ID = "city-suggestions";

// The search box. Without JavaScript it's a plain GET form that searches by
// name. With JavaScript it also suggests places while you type; picking one
// puts that exact place in the URL.
export function CitySearch({ query }: { query: Query }) {
  const router = useRouter();
  const [value, setValue] = useState(query.city);
  // Only what the user typed triggers a search, not the value filled in from the URL.
  const [typed, setTyped] = useState("");
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const isOpen = suggestions.length > 0;

  useEffect(() => {
    const q = typed.trim();
    if (q.length < MIN_LENGTH) return;

    // Cancel the request if the user types again before it finishes, so an
    // older, slower answer can't replace a newer one.
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/cities?q=${encodeURIComponent(q)}`, { signal: controller.signal });
        const result = (await response.json()) as Result<Location[]>;
        // If suggestions fail, the form still works: Enter searches by name.
        setSuggestions(result.ok ? result.data : []);
        setActiveIndex(-1);
      } catch {
        // Aborted or offline: keep whatever is shown.
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [typed]);

  function close() {
    setSuggestions([]);
    setActiveIndex(-1);
  }

  // Once the user has searched or picked, a late answer must not reopen the
  // list. Clearing `typed` cancels any request that's still waiting.
  function finish() {
    setTyped("");
    close();
  }

  function pick(location: Location) {
    // Show the plain name, as after a reload. The full label ("Paris, Texas, …")
    // isn't something Open-Meteo can search for if the form is submitted again.
    setValue(location.name);
    finish();
    router.push(toHref({ ...query, city: location.name, placeId: location.id }));
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!isOpen) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (event.key === "Escape") {
      close();
    } else if (event.key === "Enter" && activeIndex >= 0) {
      // Pick the highlighted place instead of submitting the typed name.
      const location = suggestions[activeIndex];
      if (location) {
        event.preventDefault();
        pick(location);
      }
    }
  }

  return (
    <Form action="/" onSubmit={finish} className="relative flex gap-2">
      <label htmlFor="city" className="sr-only">
        City
      </label>
      <input
        id="city"
        name="city"
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          setTyped(event.target.value);
          if (event.target.value.trim().length < MIN_LENGTH) close();
        }}
        onKeyDown={onKeyDown}
        onBlur={close}
        placeholder="Search a city, e.g. Austin"
        required
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-controls={LIST_ID}
        aria-activedescendant={activeIndex >= 0 ? `${LIST_ID}-${activeIndex}` : undefined}
        className="flex-1 rounded border border-neutral-300 px-3 py-2"
      />
      {/* Searching by name keeps the activities and layout, but not a previously picked place. */}
      {Object.entries(keepParams(query)).map(([name, v]) => (
        <input key={name} type="hidden" name={name} value={v} />
      ))}
      <button type="submit" className="rounded bg-neutral-900 px-4 py-2 text-white">
        Search
      </button>

      <ul
        id={LIST_ID}
        role="listbox"
        aria-label="Suggested cities"
        hidden={!isOpen}
        className="absolute top-full left-0 z-10 mt-1 w-full rounded border border-neutral-300 bg-white shadow"
      >
        {suggestions.map((location, i) => (
          <li
            key={location.id}
            id={`${LIST_ID}-${i}`}
            role="option"
            aria-selected={i === activeIndex}
            // mousedown fires before the input's blur, so the list is still there to click.
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => pick(location)}
            className={`cursor-pointer px-3 py-2 ${i === activeIndex ? "bg-neutral-100" : ""}`}
          >
            {placeLabel(location)}
          </li>
        ))}
      </ul>
    </Form>
  );
}

function keepParams(query: Query): Record<string, string> {
  const params = new URLSearchParams(toHref({ ...query, city: "", placeId: null }).slice(2));
  return Object.fromEntries(params);
}
