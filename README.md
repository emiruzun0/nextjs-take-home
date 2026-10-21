# Activity Weather

[![CI](https://github.com/emiruzun0/nextjs-take-home/actions/workflows/ci.yml/badge.svg)](https://github.com/emiruzun0/nextjs-take-home/actions/workflows/ci.yml)

Search a city and see, hour by hour for the rest of today and tomorrow, how good the weather is for running, cycling, walking, a picnic, basketball and soccer. Each hour gets a score from 0 to 100 (100 is perfect) and a short reason, and each activity shows its best hour.

The same weather is good for one activity and bad for another: light rain ruins a picnic and makes a basketball court slippery, but a soccer game goes on. Comparing activities side by side is the point of the app.

Built with Next.js 16 (App Router, Server Components), TypeScript, Tailwind CSS and the [Open-Meteo](https://open-meteo.com/) API.

## Running it locally

Requires Node.js 22.

```sh
npm install
npm run dev
```

Then open <http://localhost:3000/?city=Austin>.

**Environment variables:** none. Open-Meteo is free and doesn't need an API key, so there is no `.env.example`. If the app ever switches to a provider that needs a key, it would only be read in `src/server/`, which can't be bundled for the browser.

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | ESLint |
| `npm run typecheck` | Generates Next.js route types, then runs `tsc` |
| `npm test` | Unit and component tests (Vitest, React Testing Library) |
| `npm run test:e2e` | Browser test against the production build (Playwright, Chromium). Run `npx playwright install chromium` once first. |

## Continuous integration

Every pull request and every push to `main` runs [`.github/workflows/ci.yml`](.github/workflows/ci.yml) on GitHub Actions, in two parallel jobs:

- **Lint, typecheck and unit tests:** `npm run lint`, `npm run typecheck`, `npm test`
- **Playwright (Chromium):** builds the app and runs the browser test. If it fails, the HTML report is attached to the run for 7 days.

A pre-commit hook also runs lint locally before every commit (installed automatically by `npm install`).

## How it works

```
/?city=Austin&activities=running,soccer&view=table
        │
        ▼
src/app/page.tsx (Server Component) ── reads the URL
        │
        ▼
src/frontend/forecast-page.tsx ── decides what to show for each result
        │
        ├─► src/server/get-city-forecast.ts ── city → location → hourly forecast,
        │       validated with Zod, cached, always returns { ok, data | error }
        │
        └─► src/scoring/ ── scores every hour for each activity (plain functions)
                │
                ▼
        src/components/ ── cards or table, display only
```

| Folder | Responsibility |
|---|---|
| `src/app/` | Routes only: the page, the loading skeleton and the error page |
| `src/frontend/` | Page-level code: reads the URL, picks the state to show, maps codes to wording |
| `src/components/` | Reusable UI that only displays what it's given |
| `src/server/` | Open-Meteo clients, marked `server-only` |
| `src/scoring/` | The activity rules and the scoring function |
| `src/shared/` | Types used by both the server and the frontend |
| `e2e/` | The Playwright test |

## Key decisions and trade-offs

Every decision, the options I considered and why I chose what I did is in [DECISIONS.md](DECISIONS.md). The short version:

- **Server Components, no API route.** The server fetches the forecast and the page renders it. The backend only reports what happened (`{ ok: true, data }` or `{ ok: false, error: { code } }`), and the frontend decides how each case looks. I first chose a Route Handler with client-side fetching, then switched because it was more code for the same result.
- **Everything is in the URL.** City, activities and layout, so any view can be shared and the back button works. The switches are plain links and the search is a GET form, so the page works without JavaScript.
- **Scores are numbers, not colors or labels.** With color bands, 69 and 71 would look completely different even though they're almost the same.
- **A 100 should be rare.** Darkness costs every activity something, sleep hours (11 PM–6 AM) cost extra, and wind gets more expensive the further over the limit it goes. The full rules are in decision 8.
- **US units and feels-like temperature.** The rules use the temperature people actually feel, and the UI shows it next to each score so people can judge for themselves.
- **Zod checks every Open-Meteo response.** If the API changes shape, it fails where the data comes in and shows "service down", instead of crashing in the scoring code.
- **Caching:** the forecast is cached for an hour and city lookups for days. Failures are thrown inside the cached functions, so an outage is never cached.
- **Tests where the decisions are:** unit tests for the scoring rules, component tests for what users see, and one Playwright test for the whole flow. The Playwright test uses the real API because that was the fastest option.

## What I'd do with more time

- **Choose between cities with the same name.** Search takes the top match, so "Paris" is always Paris, France.
- **A fake Open-Meteo server for the Playwright test,** so it can't fail because the real API is down.
- **Safety checks separate from comfort:** wind gusts and heat index, which Open-Meteo provides. Today only thunderstorms are treated as unsafe.
- **Show more than one reason per hour.** Today the reason is only the factor that cost the most points.
- **Tune the weights per activity with real feedback,** for example heat hurting running more than walking.
- **"Use my location"** with browser geolocation.
- **Tests for the server code with a mocked `fetch`.** Today it's covered by the Playwright test and a manual check against the live API.

## AI usage

I built this with Claude Code. I made the product and architecture decisions and recorded them in DECISIONS.md as I went; the AI proposed options, wrote most of the code, and I reviewed every change before committing. I also used Gemini, Perplexity and GitHub Copilot for ideas and test fixtures, and asked ChatGPT to review the scoring rules: I took its suggestion to stop counting rain twice and its idea for boundary tests, and left out the rest (score labels, per-activity penalty rates, multiple reasons) for the reasons in DECISIONS.md.
