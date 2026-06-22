# Golf Shot Tracker

A build-free, browser-based golf round, scorecard, shot, statistics, course, and Head-to-Head tracker. The app is designed to run as a static GitHub Pages site.

## Table of Contents

1. [Run Locally](#run-locally)
2. [Project Structure](#project-structure)
3. [Application Logic](#application-logic)
4. [Persistence](#persistence)
5. [Active Scorecard Persistence](#active-scorecard-persistence)
6. [Head-to-Head Match Play](#head-to-head-match-play)
7. [Verification](#verification)
8. [Deployment](#deployment)
9. [Development Rules](#development-rules)
10. [Lessons and Recommendations](#lessons-and-recommendations)

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
- `js/storage.js` — LocalStorage parsing and saved-round persistence helpers.
- `js/state.js` — shared global runtime state used by existing features.
- `js/navigation.js` — shared screen visibility mechanics.
- `js/utils.js` — general-purpose, behavior-independent utilities.
- `app.js` — course data, feature logic, rendering, feature navigation, global HTML handlers, and startup.
- `scripts/verify-app.js` — npm-free syntax, structure, startup, DOM smoke, persistence, and HTTP verifier.
- `TEST_PLAN.md` — local browser, GitHub Pages, phone, and Add to Home Screen test procedures.
- `golfshottracker.png` — splash-screen artwork.
- `golfshottrackericon.png` — browser and home-screen icon.
- `gstbanner.png` — application header banner.
- `REFACTOR_RECOMMENDATIONS.md` — maintainability review, risks, and staged future recommendations.

## Application Logic

The app uses ordered classic browser scripts and globally available functions because `index.html` invokes feature actions through inline event handlers. No modules, package installation, or build tools are required.

Required script order:

1. `js/storage.js`
2. `js/state.js`
3. `js/navigation.js`
4. `js/utils.js`
5. `app.js`

`storage.js` must load before `state.js` because initial state uses the defensive JSON reader. `app.js` loads last so every shared binding and helper is available before startup runs.

Major feature areas retained in `app.js` are:

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

## Active Scorecard Persistence

In-progress scorecard rounds are stored under the versioned LocalStorage key `gstActiveScorecardRound`. The active record contains:

- Schema version
- Course ID
- Hole count
- Current hole
- Handicap Index used when the round started
- Existing scorecard hole objects and entered scores

Every score `+` or `−` action immediately updates the active record. The Home-screen Continue tile restores the course, tee data, hole count, current hole, scores, and starting HCI after refresh or reopening the app.

For backward compatibility, the app continues writing `simpleScorecard` and `scorecardHoleCount`. Valid legacy `simpleScorecard` progress is migrated automatically to `gstActiveScorecardRound`. Malformed active or legacy progress is cleared safely without changing `savedScorecardRounds`.

A scorecard cannot be added to completed Recent Rounds while any required score is missing. The active progress remains available to continue later. `Abandon Current Round` requires confirmation and clears only active scorecard progress; completed rounds, profile data, Stats history, Course Info, and Head-to-Head data remain unchanged.

## Head-to-Head Match Play

Head-to-Head provides two independent flows:

1. **Hole-by-Hole Match** — enter player and opponent details, choose 9 or 18 holes, and track both gross scores on a dedicated in-app scorecard screen.
2. **Compare Gross and Net Scores** — the existing completed-score comparison with handicap strokes remains available and unchanged.

Opening Head-to-Head goes directly to New Match Setup. Compare Gross and Net Scores remains available from setup and the Head-to-Head mode picker.

The match-play scorecard reuses the regular Scorecard Mode layout classes for hole number, par, yards, HCP, tee, and `+`/`−` score controls. Each hole displays `Current Hole Result:` and the gross match status. The summary at the top displays both player names and the current lead or `All Square`.

This first match-play pass uses **gross hole scores** to decide each hole and the match lead. Opponent HCI is collected for future net match-play support but does not change the gross match result. Net match-play scoring is intentionally deferred; the existing gross/net comparison continues to provide net-score comparison behavior.

The existing `gstH2HMatch` LocalStorage key is still updated for compatibility, but H2H matches are not added to Recent Rounds and no match-history feature has been added. No new H2H LocalStorage key was introduced.

## Verification

Before every commit, run the complete npm-free verification command from the repository root:

```powershell
node scripts/verify-app.js
```

The verifier checks every JavaScript file with `node --check`, validates script order and asset references, executes the app with valid and malformed LocalStorage, confirms global HTML handlers, runs representative DOM smoke flows, and serves every app asset through a temporary local HTTP server to require HTTP 200 responses.

Field-test verification also covers active-round autosave, refresh and Continue restoration, current-hole restoration, incomplete-save blocking, abandon isolation, corrupted active data, and migration from legacy scorecard progress.

Head-to-Head verification covers setup defaults, opponent inputs, 9-hole match creation, reused Scorecard Mode layout, both players' controls, gross hole results, match summary updates, and the existing gross/net comparison.

No npm install or build step is required. A failed check exits with a nonzero status and prints the failing condition.

For a release check, also follow [TEST_PLAN.md](TEST_PLAN.md):

1. Complete the local manual browser smoke checklist.
2. Confirm no unexpected browser-console errors.
3. Complete the GitHub Pages phone and Add to Home Screen checklist.
4. Confirm the Git working tree is clean after committing.

## Deployment

The repository is deployable directly through GitHub Pages. Publish the repository root from the desired branch. Do not introduce generated asset paths, package-dependent imports, or build-only syntax unless the deployment process is intentionally changed and documented.

## Development Rules

- Preserve LocalStorage keys and saved data shapes or provide explicit migration logic.
- Preserve globally referenced function names until inline handlers are migrated safely.
- Keep scoring and Head-to-Head changes separate from structural refactors.
- Maintain the dark GST theme and current navigation flow.
- Add regression tests before extracting the remaining feature engines.
- Run `node scripts/verify-app.js` before every commit.
- Keep documentation current when behavior, data contracts, setup, or deployment changes.

## Lessons and Recommendations

- Browser persistence should be treated like a public API.
- Small behavior-preserving helpers are safer than broad rewrites without test coverage.
- Calculation logic should eventually be separated from DOM rendering to support reliable stats and scoring tests.
- Static GitHub Pages compatibility must be verified after every structural change.

See `REFACTOR_RECOMMENDATIONS.md` for the full review and recommended sequence of future improvements.
