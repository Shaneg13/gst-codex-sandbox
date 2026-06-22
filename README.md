# Golf Shot Tracker

A build-free, browser-based golf round, scorecard, shot, statistics, course, and Head-to-Head tracker. The app is designed to run as a static GitHub Pages site.

## Table of Contents

1. [Run Locally](#run-locally)
2. [Project Structure](#project-structure)
3. [Application Logic](#application-logic)
4. [Persistence](#persistence)
5. [Verification](#verification)
6. [Deployment](#deployment)
7. [Development Rules](#development-rules)
8. [Lessons and Recommendations](#lessons-and-recommendations)

## Run Locally

The app has no package installation or build step. Serve the repository with any static HTTP server so browser behavior matches GitHub Pages.

Python example:

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

Then open `http://127.0.0.1:8765/index.html`.

## Project Structure

- `index.html` — all screens, controls, modals, and static app copy.
- `style.css` — dark GST theme, responsive layout, and component styling.
- `app.js` — course data, state, persistence, feature logic, rendering, navigation, and startup.
- `golfshottracker.png` — splash-screen artwork.
- `golfshottrackericon.png` — browser and home-screen icon.
- `gstbanner.png` — application header banner.
- `REFACTOR_RECOMMENDATIONS.md` — maintainability review, risks, and staged future recommendations.

## Application Logic

The current app uses classic browser JavaScript and globally available functions because `index.html` invokes feature actions through inline event handlers. Major feature areas are:

- Shot-by-shot round tracking and hole scoring.
- Simple 9-hole and 18-hole scorecards.
- Past-round scorecard entry.
- Recent-round history and round details.
- Whitinsville course information.
- Player Handicap Index storage and display.
- Head-to-Head comparison and hole-by-hole match play.
- Hole scoring statistics.
- JSON shot-data export.

Course, handicap, scoring, and Head-to-Head calculations are coupled to existing data contracts. They should not be changed without focused tests.

## Persistence

All data is stored in browser LocalStorage. Existing key names and saved object structures are compatibility contracts because returning users may already have data stored under them.

The app defensively falls back to existing defaults when a JSON value is malformed. It does not rename, migrate, or rewrite valid stored data during startup.

## Verification

Run JavaScript syntax verification:

```powershell
node --check app.js
```

For a release check:

1. Serve the repository through local HTTP.
2. Confirm `index.html`, `app.js`, `style.css`, and all PNG assets return HTTP 200.
3. Confirm the home screen loads and retains the `Beta Testing` label.
4. Exercise scorecard, shot tracking, recent rounds, stats, course information, Handicap Index, and Head-to-Head flows.
5. Confirm the Git working tree is clean after committing.

## Deployment

The repository is deployable directly through GitHub Pages. Publish the repository root from the desired branch. Do not introduce generated asset paths, package-dependent imports, or build-only syntax unless the deployment process is intentionally changed and documented.

## Development Rules

- Preserve LocalStorage keys and saved data shapes or provide explicit migration logic.
- Preserve globally referenced function names until inline handlers are migrated safely.
- Keep scoring and Head-to-Head changes separate from structural refactors.
- Maintain the dark GST theme and current navigation flow.
- Add regression tests before splitting feature logic into modules.
- Keep documentation current when behavior, data contracts, setup, or deployment changes.

## Lessons and Recommendations

- Browser persistence should be treated like a public API.
- Small behavior-preserving helpers are safer than broad rewrites without test coverage.
- Calculation logic should eventually be separated from DOM rendering to support reliable stats and scoring tests.
- Static GitHub Pages compatibility must be verified after every structural change.

See `REFACTOR_RECOMMENDATIONS.md` for the full review and recommended sequence of future improvements.
