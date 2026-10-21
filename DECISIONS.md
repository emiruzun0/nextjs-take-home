# Decisions

A log of the choices made while building this project, and why.

## 1. App idea and API

**Choice:** An app that compares how good the weather is for different outdoor activities: running, cycling, walking, picnic, basketball and soccer. Data comes from [Open-Meteo](https://open-meteo.com/) (free, no API key).

**Why:** I didn't want another single-purpose "should I go for a run?" app. The same weather is good for one activity and bad for another: light rain ruins a picnic but doesn't stop a soccer game, even though the same rain makes a basketball court too slippery. Comparing activities side by side makes that difference the point of the app.

**Considered:** TMDB "what to watch tonight" (very common, looks like a tutorial) and a GitHub repo health checker.

## 2. Time box and scope

**Time box:** 5 hours or less.

**Forecast window:** hourly, for the rest of today and all of tomorrow. That's always at least 6 hours ahead.

**Why:** People should be able to plan ahead. For example, on a lunch break at noon you can check whether 6 pm is a good time for basketball. Showing tomorrow too means that late in the evening you can still plan tomorrow morning's run. The API returns both days in one request, so this costs nothing extra.

**Must-haves:**
- Search for a city (Open-Meteo geocoding API)
- Hourly forecast for the window above
- A score from 0 to 100 for each activity and hour, where 100 is the best, with a short reason (e.g. "Light rain, still fine for soccer")
- The best hour for each activity
- Choosing which activities to show
- Scoring rules I define per activity

**Nice-to-haves (left out on purpose):**
- "Use my location" (browser geolocation)
- Deployment

**Scores are plain numbers, not colors or labels:** A number lets you compare hours and activities directly, and the UI explains that 100 is best. I left out colors because color bands create boundaries that aren't real: 69 and 71 are almost the same score, but if the color changes at 70 they look completely different.

## 3. Workflow

- Each task gets its own branch and a pull request.
- PR titles follow `type(scope): summary`, for example `feat(backend): fetch hourly forecast` or `fix(frontend): handle empty search`.
- Commit messages are one short sentence.

## 4. Rendering and where the API is called

**Choice:** Server Components. The page runs on the server, reads the city from the URL (`/?city=Istanbul`), calls Open-Meteo through `src/server/`, and passes the result to the frontend. There is no separate `/api` route.

**Why:** The backend's job is only to get the data and report what happened, without deciding how it looks. It always returns the same shape, `{ ok: true, data }` or `{ ok: false, error }`. The frontend then decides how to show each case to the user: the forecast, "city not found", or "weather service is down" with a Try again button. This keeps the backend simple and puts all presentation decisions in one place.

**Considered:** A Route Handler (`/api/forecast`) fetched from the browser. It makes the backend a visible API, but it adds an extra network hop and more code for the same result. I chose it at first, then switched once I saw that Server Components still keep the API call on the server.

**Error handling on the frontend:**
- `loading.tsx` is shown while the server fetches
- `{ ok: false }` cases each get their own message and a Try again button
- `error.tsx` catches anything unexpected, so the user never sees a blank page
- The forecast is cached on the server for 1 hour

**Folder structure:**

```
src/app/          routes only: page.tsx, loading.tsx, error.tsx, kept thin
src/frontend/     page-level code: decides what to show for each result
src/components/   reusable UI pieces used by pages (search box, score table, activity picker)
src/server/       Open-Meteo clients (server-only, never bundled for the browser)
src/scoring/      activity rules as plain functions, no fetching
src/shared/       the result types used by both server and frontend
```

Components are kept separate from page-level code: a component only knows how to display what it's given, and the page code decides what to show and where it goes.

## 5. Styling

**Choice:** Tailwind CSS.

**Why:** Styles sit right next to the markup, so I can read a component and see exactly how it looks without switching files. It's also more robust: there are no class names to collide, no styles leaking between components, and no unused CSS left behind when a component is deleted.

**Trade-off:** Class lists can get long. When that happens, I'll turn the markup into a small component instead of adding more abstraction.

**Considered:** CSS Modules (no extra package, but styles live in a separate file) and a single global CSS file (styles leak between components).

## 6. Validating API responses

**Choice:** Zod schemas in `src/server/` check every Open-Meteo response when it arrives. The TypeScript types are generated from the schemas.

**Why:** Open-Meteo is outside my control, and TypeScript types don't check anything at runtime. If the response changes shape, I want it caught right where it comes in and turned into a clean `{ ok: false, error }`, not a confusing crash somewhere in the scoring code. Generating the types from the schemas means the check and the type can never disagree.

**Trade-off:** One more package, but it's used only on the server, so it doesn't add anything to what the browser downloads.

**Considered:** Hand-written types with `as` (no runtime check at all) and hand-written checks (a lot of repetitive code for hourly arrays).

## 7. Testing

**Choice:**
- **Unit tests (Vitest)** for the scoring rules and the best-hour choice
- **Component tests (Vitest + React Testing Library)** for the display components, checking what the user sees
- **One end-to-end test (Playwright, Chromium only)** that opens a city and checks that scores appear

**Why:** The scoring rules are the core of the app, so they get direct tests that also document them ("light rain still scores well for soccer"). Component tests check that results, errors and empty states show up correctly. The Playwright test proves the whole flow works in a real browser. Chromium only, because one browser is enough to prove the flow and it keeps the setup fast.

**Trade-off:** The end-to-end test uses the real Open-Meteo API because that was the fastest option. If Open-Meteo is down, the test fails even though our code is fine. A fake API server would fix that, and it's on the "more time" list. Server Components (`page.tsx`) can't be component-tested, so they're covered only by the Playwright test.

## 8. Scoring rules

**Units:** US units everywhere: °F, mph and inches. Open-Meteo returns these directly, so there's no conversion code, and the numbers in the rules match what the user sees.

**How a score is calculated:** Every hour starts at 100. Each weather factor outside an activity's ideal range takes points off, and the score never goes below 0. The reason shown to the user is the factor that cost the most points, for example "Too windy for cycling".

**Temperature:** The rules use the "feels like" temperature, because it includes wind and humidity and is closer to what people actually feel. The UI shows the feels-like temperature next to each score, so people can make their own judgment instead of just trusting the number.

| Activity | Ideal feels-like temp | Wind under | Rain | At night |
|---|---|---|---|---|
| Running | 40–70°F | 15 mph | Light rain OK | OK |
| Cycling | 55–75°F | 10 mph | None | Low score |
| Walking | 40–80°F | 20 mph | Light rain OK | OK |
| Picnic | 60–85°F | 10 mph | None at all | Low score |
| Basketball | 55–80°F | 15 mph | None (a wet court is slippery) | OK |
| Soccer | 45–75°F | 20 mph | Light to moderate rain OK | OK |

**Thunderstorms** set every activity to 0, for safety.

**How many points each factor costs:**

| Factor | Points lost |
|---|---|
| Too cold or too hot | 3 per °F outside the range |
| Too windy | 4 per mph over the limit |
| Rain, by what the activity tolerates | none: light −50, moderate −80, heavy −100 · light: moderate −40, heavy −80 · moderate: heavy −50 |
| Chance of rain (only for activities that can't take any rain) | half the percentage, e.g. 60% → −30 |
| Dark (picnic and cycling) | −50 |

Rain levels use the US National Weather Service thresholds: light is under 0.1 in/h, moderate is 0.1–0.3 in/h, heavy is over 0.3 in/h.

**Why these weights:** A 10°F miss (−30) should hurt about as much as being 7–8 mph too windy, since both make the activity noticeably worse but still possible. Rain penalties are bigger because rain can stop an activity outright. The chance of rain only counts for picnics, cycling and basketball, because those are the activities you'd plan around it; soccer goes on either way.

Like the backend's error codes, the reason for a score is a code (`TOO_WINDY`, `RAIN`, `DARK`…), and the frontend picks the words.

**Why these numbers:** They're rounded on purpose. People think in round numbers like "40 to 70 degrees", and rounded values read like rules a person chose rather than numbers a formula produced.

**Why night only hurts picnics and cycling:** Running, walking, basketball and soccer are commonly done under street or court lights. A picnic needs daylight, and cycling in the dark is a safety risk.
