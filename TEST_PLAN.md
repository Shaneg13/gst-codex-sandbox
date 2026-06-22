# Golf Shot Tracker Test Plan

## Table of Contents

1. [Purpose](#purpose)
2. [Test Levels](#test-levels)
3. [Automated Verification](#automated-verification)
4. [Local Manual Smoke Test](#local-manual-smoke-test)
5. [GitHub Pages and Phone Test](#github-pages-and-phone-test)
6. [Persistence Test Data](#persistence-test-data)
7. [Pass and Failure Criteria](#pass-and-failure-criteria)
8. [Known Limitations](#known-limitations)
9. [Test Report Template](#test-report-template)

## Purpose

This plan protects the existing Golf Shot Tracker behavior during refactors and future feature extraction. It does not redefine expected scoring, handicap, Head-to-Head, persistence, navigation, copy, or visual behavior.

Run the automated verifier before every commit. Run the manual smoke tests before publishing a release or after changing HTML, CSS, navigation, scoring, persistence, or device behavior.

## Test Levels

1. **Automated structural checks** verify syntax, file references, script order, global handlers, startup, LocalStorage fallbacks, core DOM flows, and HTTP delivery.
2. **Local manual smoke tests** verify actual browser rendering and interaction.
3. **GitHub Pages phone tests** verify deployment paths, touch behavior, persistence, responsive layout, and Add to Home Screen behavior.

## Automated Verification

### Prerequisite

Install a current Node.js release. No npm packages or project installation are required.

### Command

From the repository root, run:

```powershell
node scripts/verify-app.js
```

The command exits with code `0` when every check passes and a nonzero code when a check fails. Read the first `FAIL` message, correct the issue, and rerun the complete command.

The verifier checks:

- JavaScript syntax for every `.js` file in the repository.
- Required classic-script load order in `index.html`.
- Local CSS, JavaScript, and image references exist and remain inside the repository.
- Every inline HTML handler resolves to a global function.
- Startup with valid LocalStorage data.
- Defensive startup with malformed LocalStorage JSON.
- Core home, scorecard, saved-round, navigation, Head-to-Head, HCI, and refresh flows in a lightweight DOM harness.
- HTTP 200 responses for `index.html`, CSS, JavaScript, and image assets through a temporary localhost server.
- Presence of the `Beta Testing` easter egg.

## Local Manual Smoke Test

### Setup

1. Preserve any browser data you care about by exporting it or use a private/test browser profile.
2. Start a static server from the repository root:

   ```powershell
   python -m http.server 8765 --bind 127.0.0.1
   ```

3. Open `http://127.0.0.1:8765/index.html`.
4. Open the browser console and confirm no blocking errors appear.

### Checklist

- [ ] Home screen loads after the splash screen.
- [ ] `Beta Testing` appears subtly below the home tiles.
- [ ] Start Round opens the mode picker.
- [ ] Scorecard mode can start a 9-hole scorecard.
- [ ] Scorecard mode can start an 18-hole scorecard.
- [ ] Score `+` increases a hole score correctly.
- [ ] Score `−` decreases a hole score correctly and does not go below the existing minimum behavior.
- [ ] Saving a completed scorecard round succeeds.
- [ ] Recent Rounds opens and shows the saved round.
- [ ] Selecting the saved round opens Round Detail with the expected totals.
- [ ] Stats opens and displays data from the saved round.
- [ ] Course Info opens and displays the existing Whitinsville course information.
- [ ] Head-to-Head opens.
- [ ] Compare Gross and Net Scores opens and produces a result using test values.
- [ ] Hole-by-Hole Match opens for 9 and 18 holes.
- [ ] The HCI tile accepts a valid Handicap Index and updates its display.
- [ ] Refreshing the page preserves the saved round and HCI.
- [ ] Existing shot-tracking round setup, shot entry, hole score, navigation, export, and clear actions still work.
- [ ] No unexpected console errors appear during the checklist.

## GitHub Pages and Phone Test

Run this checklist after pushing the intended release commit and confirming GitHub Pages deployment completed.

- [ ] The GitHub Pages URL loads successfully on a phone over Wi-Fi or cellular data.
- [ ] Splash, banner, icon, CSS, and all JavaScript files load without 404 errors.
- [ ] The dark GST layout fits the phone screen without unintended horizontal scrolling.
- [ ] Home tiles and score controls respond correctly to touch.
- [ ] The complete local manual smoke checklist passes on the phone where practical.
- [ ] Saving data and refreshing the deployed page preserves LocalStorage data.
- [ ] Add to Home Screen still offers the GST icon and launches the deployed app successfully.
- [ ] Data saved in the normal browser and home-screen shortcut behaves consistently for the platform being tested.

Record the phone model, operating-system version, browser, and GitHub Pages URL in the test report.

## Persistence Test Data

Use clearly identifiable test values so verification data is not confused with real rounds:

- Course or player label: `TEST`
- HCI: `18.2`
- Gross comparison: Player 1 `90`, Player 2 `85`
- Opponent HCI: `10`
- Scorecard: enter par for each hole unless testing over/under-par display

Test both conditions:

1. A clean profile with no Golf Shot Tracker LocalStorage values.
2. A profile containing existing saved rounds and HCI data.

Do not manually alter LocalStorage structures in a real user profile. The automated verifier covers malformed JSON using an isolated in-memory store.

## Pass and Failure Criteria

A change is ready to commit when:

- `node scripts/verify-app.js` completes with all checks passing.
- Required manual checks for the change scope pass.
- No unexpected browser-console errors appear.
- The Git diff contains no unintended copy, theme, scoring, handicap, Head-to-Head, key, or data-structure changes.

A release is ready to publish when the automated verifier, local manual checklist, and GitHub Pages phone checklist all pass.

Stop and investigate if saved data disappears, a LocalStorage key changes, totals differ from the pre-change app, an inline handler is unavailable, an asset returns 404, or a screen cannot be reached through the existing flow.

## Known Limitations

- The automated DOM harness is not a full browser and does not calculate visual layout, CSS rendering, touch gestures, downloads, prompts, accessibility, or platform-specific Add to Home Screen behavior.
- The automated smoke checks protect current wiring and representative flows; they are not exhaustive unit tests for every score or handicap combination.
- GitHub Pages deployment and mobile behavior remain manual because they depend on external hosting and real devices.

## Test Report Template

```text
Commit:
Tester:
Date:
Environment:

Automated verification: PASS / FAIL
Local manual smoke test: PASS / FAIL / NOT RUN
GitHub Pages phone test: PASS / FAIL / NOT RUN
Console errors: NONE / DETAILS

Failed checklist items:
Notes and follow-up:
```
