# Decisions

A log of the choices made while building this project, and why.

## 1. App idea and API

**Choice:** An app that compares how good the weather is for different outdoor activities: running, cycling, walking, outdoor pool, picnic, basketball and soccer. Data comes from [Open-Meteo](https://open-meteo.com/) (free, no API key).

**Why:** I didn't want another single-purpose "should I go for a run?" app. The same weather is good for one activity and bad for another: light rain ruins a picnic but doesn't stop a soccer game, and a cool, cloudy day is fine for a run but not for the pool. Comparing activities side by side makes that difference the point of the app.

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

**Scores are plain numbers, not colors or labels:** A number lets you compare hours and activities directly, and the UI explains that 100 is best. I left out colors because they add a second signal the user has to learn.

## 3. Workflow

- Each task gets its own branch and a pull request.
- PR titles follow `type(scope): summary`, for example `feat(backend): fetch hourly forecast` or `fix(frontend): handle empty search`.
- Commit messages are one short sentence.
