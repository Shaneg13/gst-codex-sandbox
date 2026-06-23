# Golf Shot Tracker Refactor Recommendations

## Table of Contents

1. [Purpose and Constraints](#purpose-and-constraints)
2. [Executive Summary](#executive-summary)
3. [Current Architecture](#current-architecture)
4. [Review Findings](#review-findings)
5. [Safe Refactors for This Pass](#safe-refactors-for-this-pass)
6. [Deferred Recommendations](#deferred-recommendations)
7. [Verification Strategy](#verification-strategy)
8. [Important Logic and Data Contracts](#important-logic-and-data-contracts)
9. [Lessons for Future Development](#lessons-for-future-development)

## Purpose and Constraints

This report documents the maintainability review completed before refactoring the current static Golf Shot Tracker application. The application must continue to run directly on GitHub Pages with no build step.

This refactor must preserve:

- All current features, user flows, copy, scoring behavior, and Head-to-Head behavior.
- The dark GST visual theme and the `Beta Testing` home-screen easter egg.
- Existing LocalStorage keys and stored data structures.
- Direct browser execution through `index.html`, `style.css`, and `app.js`.

## Executive Summary

The application is functional but concentrated in one global JavaScript file. Feature code, persistence, rendering, navigation, initialization, and course data share the same scope. This is workable for a small static app, but it increases the chance that a change in one feature will affect another.

The safest immediate improvements are documentation, defensive LocalStorage parsing, small shared persistence helpers, centralized screen visibility helpers, an explicit initialization entry point, and clear feature section boundaries. Larger changes—modules, state containers, data migrations, or generalized scorecard engines—should wait until automated behavior tests exist.

## Current Architecture

- `index.html` contains every screen, modal, input, and inline event handler.
- `style.css` contains the complete dark GST theme and responsive rules.
- `js/storage.js` contains defensive LocalStorage and saved-round persistence helpers.
- `js/state.js` contains shared classic-script state bindings.
- `js/navigation.js` contains shared screen visibility mechanics.
- `js/utils.js` contains general-purpose utilities.
- `app.js` retains course data, feature rendering, feature navigation, scorecard entry, past-round entry, recent rounds, course information, player profile, Head-to-Head, exports, statistics, global HTML handlers, and startup behavior.
- Browser LocalStorage is the only persistence layer.
- Functions are exposed globally because HTML invokes them through inline handlers.

## Review Findings

### 1. Code Organization

Related functions are not consistently grouped. Startup statements appear in multiple locations, and shared utilities are mixed with feature logic. Section comments and an explicit initialization function will make feature boundaries easier to find without changing the static architecture.

### 2. Duplicate or Repeated Logic

The live scorecard and past-round scorecard repeat hole creation, score adjustment, rendering, totals, and save preparation. Screen show/hide code and saved-round reads are also repeated. Only small, behavior-obvious repetitions should be consolidated in this pass.

### 3. Large Functions

`renderRecentRounds`, `renderRoundDetail`, `calculateHeadToHead`, `renderH2HHole`, and `renderHoleAverageStats` combine data preparation with DOM rendering. They are candidates for later separation into calculation and rendering helpers, but changing them now would carry unnecessary regression risk without automated tests.

### 4. LocalStorage Safety

Several values are parsed directly with `JSON.parse`. A malformed or manually edited value can stop application startup or break a feature screen. A shared parser should return the existing fallback value on invalid JSON while leaving every key and valid stored structure unchanged.

Current keys that form compatibility contracts include:

- `currentHole`
- `currentRound`
- `shots`
- `holes`
- `selectedCourseId`
- `savedScorecardRounds`
- `roundMode`
- `simpleScorecard`
- `scorecardHoleCount`
- `gstPlayerProfile`
- `gstH2HMatch`
- `gstActiveScorecardRound`

### 5. State Management

Mutable globals such as `currentRound`, `shots`, `holes`, `simpleScorecard`, `pastRoundScorecard`, `playerProfile`, and `h2hMatch` are shared across features. This makes dependencies implicit. A future state object could clarify ownership, but introducing one now would touch most functions and is not a low-risk change.

### 6. Navigation and Screen Handling

`hideAllScreens` centralizes part of navigation, while `showRoundSetup` and `continueRound` manually set several display values. Head-to-Head panels use another visibility pattern. Small helpers can standardize direct display and hidden-class operations while preserving the exact current values.

### 7. Scorecard and Head-to-Head Separation

Scorecard, past-round entry, and Head-to-Head logic are identifiable feature areas but remain interleaved in one file and depend on shared course/profile globals. Clear section boundaries are appropriate now. File/module separation should wait for browser-based regression coverage.

### 8. Course Data Structure

Course data is embedded in JavaScript and uses separate `whiteTees` and `blueTees` arrays. Existing logic assumes Whitinsville front-nine white tees and back-nine blue tees. The data is sufficient for the current app but not ready for arbitrary courses, tee sets, or multiple routing combinations. Changing it now would affect scoring and saved-round behavior.

### 9. Stats Readiness

Statistics are computed directly from `savedScorecardRounds` during rendering. The calculation currently supports hole averages and trends but lacks a versioned data boundary, validation, and reusable selectors. Future stats work should first extract pure calculation functions and add fixture-based tests.

### 10. Future Development Readiness

The project now has an npm-free verification script covering syntax, script order, static assets, global handlers, LocalStorage startup, representative DOM flows, and localhost HTTP delivery. It still lacks real-browser automation, exhaustive scoring fixtures, lint configuration, formatting configuration, CI, and versioned data-schema documentation. The app should remain build-free for GitHub Pages while this coverage is expanded.

### 11. Fragile Areas

- Direct JSON parsing can block startup.
- Inline HTML handlers require existing global function names to remain stable.
- Rendering uses template-string `innerHTML`, so future user-entered content needs careful escaping.
- Navigation mixes inline `display` changes with the `hidden` class.
- Course and handicap calculations rely on embedded assumptions that are not documented in code.
- Multiple scorecard workflows can drift if future fixes are applied to only one path.

## Safe Refactors for This Pass

The current pass should be limited to:

1. Add section comments for utilities, data/state, each feature area, navigation, and initialization.
2. Add a defensive LocalStorage JSON reader that preserves existing fallbacks.
3. Add saved-round read/write helpers while retaining `savedScorecardRounds` exactly.
4. Add small DOM visibility helpers and reuse them where the existing behavior is explicit.
5. Wrap existing startup statements in a named initialization function without changing their order.
6. Normalize formatting only where code is already being touched.

The first structural extraction is now complete. Storage helpers, shared state bindings, screen visibility helpers, and date formatting were moved into ordered classic scripts. All feature engines and inline-handler functions remain in `app.js`. The scripts intentionally share the browser global scope so GitHub Pages continues to run the source directly without modules or bundling.

## Deferred Recommendations

1. Expand pure regression fixtures for scoring, handicap strokes, Head-to-Head results, and saved-round rendering before extracting those engines. Malformed LocalStorage startup now has baseline automated coverage.
2. Extract pure calculation helpers from rendering functions.
3. Define and document versioned schemas for saved rounds, shots, holes, player profiles, and Head-to-Head matches.
4. Consolidate live and past scorecard construction behind tested shared helpers.
5. Replace inline handlers with registered event listeners only after browser tests protect the current flow.
6. Split feature code into build-free classic scripts or ES modules only after GitHub Pages compatibility is tested across target browsers.
7. Add safe text-rendering helpers before expanding user-editable names or course data.
8. Run `node scripts/verify-app.js` before every commit and add it to CI when repository automation is introduced.
9. Extract the scorecard engine only after scoring and saved-round fixtures exist.
10. Extract Head-to-Head only after handicap allocation and match-result fixtures exist.
11. Extract stats calculations only after historical-round fixtures exist.
12. Extract course management only with a defined multi-course and tee-routing schema.

## Verification Strategy

For this behavior-preserving pass:

1. Run `node scripts/verify-app.js` before every commit.
2. Check the Git diff for accidental copy, theme, scoring, handicap, Head-to-Head, key, or data-structure changes.
3. Use `TEST_PLAN.md` for manual browser, GitHub Pages, phone, and Add to Home Screen verification.
4. Confirm the final commit contains only the intended implementation and documentation.

### Testing Next Steps

1. Add table-driven pure-function fixtures before extracting scoring or handicap calculations.
2. Add saved-round fixtures covering 9-hole, 18-hole, incomplete, historical, and legacy browser data.
3. Add Head-to-Head fixtures for ties, both winners, 9/18 holes, and multiple handicap ranges.
4. Consider real-browser automation only when an external dependency is justified and static GitHub Pages behavior remains the deployment target.
5. Add CI to run the npm-free verifier on proposed changes.

### Field-Test Hardening Follow-ups

1. Treat `gstActiveScorecardRound.version` as a migration boundary if the active-round schema changes.
2. Add real-device lifecycle tests for backgrounding, force-closing, reopening, and Add to Home Screen storage behavior.
3. Define an explicit one-active-round policy before allowing scorecard and shot-tracking rounds to coexist or switch without completion.
4. Add a visible current-hole affordance only as a separately reviewed UI change; the current hardening pass preserves the existing layout.

### Head-to-Head Match Play Follow-ups

1. Expand Playing Handicap match-play fixtures beyond the current Whitinsville 9-hole 11-stroke case to cover multiple tee ratings/slopes, plus handicaps, and additional 18-hole matches.
2. Version both `gstH2HMatch` and the new `gstH2HMatches` records before changing their schemas or adding automatic match resume.
3. Preserve the current separation: G-Well's linked scorecard belongs in `savedScorecardRounds`, while opponent and match-result data belongs only in `gstH2HMatches`.
4. Extract shared score-control rendering only after both Scorecard Mode and H2H visual behavior have real-browser regression coverage.
5. Move tee rating, slope, par, and routing into a validated course/tee schema before adding more courses.
6. Define whether deleting either linked record should offer an optional paired delete; current deletion intentionally treats them as independent histories.

## Important Logic and Data Contracts

- LocalStorage key names are public compatibility contracts for existing browser data.
- Saved-round objects and their nested `holes` arrays must remain structurally unchanged unless a future migration is introduced.
- `gstH2HMatches` is a separate match-history contract and must not be included in regular scorecard-stat calculations.
- H2H-generated scorecards use `source: "h2h-match"` and `linkedH2HMatchId` but retain the existing hole shape required by Recent Rounds, Round Detail, and Stats.
- Course hole numbers, par, yardage, tee, and handicap values feed scorecard, details, statistics, and Head-to-Head calculations.
- Global function names referenced by `onclick` attributes are part of the current UI contract.
- `hidden` class behavior and explicit `display` values jointly control navigation and must not be casually unified.

## Lessons for Future Development

- Protect behavior with tests before reorganizing feature boundaries.
- Treat persisted browser data as an API: keep keys and shapes stable or migrate them explicitly.
- Keep calculations independent from rendering when adding new statistics.
- Prefer small helpers that make existing behavior explicit over broad rewrites.
- Verify static hosting continuously; build-free deployment is a project requirement, not an implementation detail.
