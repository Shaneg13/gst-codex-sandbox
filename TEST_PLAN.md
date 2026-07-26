# Golf Shot Tracker Test Plan

## Table of Contents

1. [Purpose](#purpose)
2. [Test Levels](#test-levels)
3. [Automated Verification](#automated-verification)
4. [Local Manual Smoke Test](#local-manual-smoke-test)
5. [Crash-Safe Active Session Device Recovery](#crash-safe-active-session-device-recovery)
6. [GitHub Pages and Phone Test](#github-pages-and-phone-test)
7. [Persistence Test Data](#persistence-test-data)
8. [Pass and Failure Criteria](#pass-and-failure-criteria)
9. [Known Limitations](#known-limitations)
10. [Test Report Template](#test-report-template)

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

### Head-to-Head Match Play Checklist

1. Open Head-to-Head from the Home screen.
2. Confirm the New Match Setup appears immediately.
3. Confirm Compare Gross and Net Scores remains available from setup and the Head-to-Head mode picker.
4. Confirm Your Name defaults to the saved profile name or `G-Well`.
5. Confirm Your HCI defaults to the current HCI tile value.
6. Enter an Opponent Name and confirm the value is accepted.
7. Enter an Opponent HCI and confirm the value is accepted.
8. Start a 9-hole match.
9. Confirm a dedicated Head-to-Head Match screen opens inside the app.
10. Confirm each hole uses the same visual card structure as Scorecard Mode.
11. Confirm each hole shows hole number, par, yards, HCP, and tee.
12. Confirm each hole has My Score and Opponent Score `+`/`−` controls.
13. Enter both scores on a hole.
14. Confirm the label reads exactly `Current Hole Result:`.
15. Confirm both players' gross score, strokes received, and net score are displayed.
16. Use G-Well HCI `25.6`, opponent HCI `7.4`, and a 9-hole match.
17. Confirm the displayed Playing Handicaps are G-Well `16` and opponent `5`.
18. Confirm the lower Playing Handicap player receives zero relative match strokes.
19. Confirm G-Well receives 11 relative match strokes: one on every hole and a second stroke on holes 6 and 9.
20. On a one-stroke hole, enter G-Well gross `6` and opponent gross `5`.
21. Confirm both net scores are `5` and the result displays `Hole halved`.
22. Confirm a net hole winner and the top match status update immediately when either gross score changes.
23. Before completing the match, confirm Save Match is hidden. If invoked through developer tools, confirm saving is blocked with a clear message and no records are added.
24. Enter both players' gross scores on every hole and confirm Save Match appears.
25. Note G-Well's gross total, the opponent's gross total, and the final match status.
26. Select Save Match and confirm the message says G-Well's round and the Versus-opponent match were saved.
27. Confirm Recent Rounds contains a normal scorecard card for G-Well and a separate card labeled `H2H Match`.
28. Confirm the H2H card shows `Versus [Opponent]`, date, Win/Loss/Tie, final match status, and both gross totals.
29. Open the normal scorecard detail and confirm it contains only G-Well's gross scores and correct totals.
30. Open Stats and confirm G-Well's H2H scorecard contributes once to Hole Averages.
31. Confirm H2H Record shows the correct Wins, Losses, and Ties and the separate match record is not counted as another normal round.
32. Refresh the app and confirm both Recent Rounds records and H2H record Stats remain available.
33. Repeat with an 18-hole match and the same HCIs. Confirm all 18 holes appear, the Playing Handicaps are `33` and `10`, and the 23-stroke difference gives one stroke per hole plus a second stroke on HCP 1–5.
34. Return to Head-to-Head and open Compare Gross and Net Scores.
35. Enter both gross scores and the opponent HCI, then confirm the existing comparison result still works.
36. Open regular Scorecard Mode and confirm its layout, score controls, and save behavior remain unchanged.

Match-play inputs remain gross scores. Hole results and the running match are decided by calculated net scores. H2H strokes must come from the difference between the rounded Playing Handicaps, never directly from the raw HCI difference. Completed matches write `gstH2HMatches`; G-Well's linked scorecard remains in `savedScorecardRounds` and contains no opponent scores.

### Field-Test Hardening Checklist

Use a test browser profile so the steps do not mix with real golf data.

#### Resume and Autosave

1. Start a new 9-hole scorecard round.
2. Enter scores on at least three different holes with the `+` and `−` controls.
3. Remember the last hole changed and its displayed score. In desktop developer tools, note `currentHole` inside the `gstActiveScorecardRound` LocalStorage value.
4. Refresh the page while the round is incomplete.
5. Confirm the Home screen loads normally.
6. Select Continue.
7. Confirm the 9-hole scorecard reopens.
8. Confirm every entered score is restored.
9. Confirm the last changed hole is retained in `gstActiveScorecardRound.currentHole` after refresh.
10. Confirm the original course, tee data, hole count, and starting HCI are retained.

#### Incomplete Save Protection

1. Leave at least one hole without a score.
2. Select Save Round.
3. Confirm a clear incomplete-round message appears.
4. Confirm no partial completed round is added to Recent Rounds.
5. Return Home, select Continue, and confirm the incomplete round remains active.

#### Abandon Active Round

1. Ensure at least one completed round already exists in Recent Rounds.
2. Start another scorecard round and enter at least one score.
3. Select Abandon Current Round.
4. Cancel the confirmation once and confirm the active scorecard remains open.
5. Select Abandon Current Round again and confirm abandonment.
6. Confirm the app returns Home.
7. Select Continue and confirm the abandoned scorecard is no longer available.
8. Open Recent Rounds and confirm the previously completed round still exists.
9. Confirm Stats still uses the previously completed round.

#### Corrupted Progress Recovery

This is covered automatically by `node scripts/verify-app.js`. Do not corrupt LocalStorage manually in a real user profile. The verifier confirms the invalid raw value is preserved and the previous known-good snapshot is restored.

## Crash-Safe Active Session Device Recovery

Use a dedicated test browser profile or installed-app test environment. Do not
run destructive storage steps in a profile containing real rounds.

Record the phone model, operating-system version, browser version, installed-app
status, deployed GST URL, and whether the device was online for each run.

### Regular Scorecard — Required 18-Hole Lifecycle

1. Start an 18-hole Regular Scorecard round.
2. Confirm the header displays `Saved`.
3. Enter scores on several front-nine and back-nine holes.
4. Confirm every score change returns from `Saving…` to `Saved`.
5. Remember the last hole changed and every entered score.
6. Return Home and confirm Continue Round displays:
   - Regular Scorecard
   - Course
   - 18 holes
   - Correct current hole
   - Last saved time
7. Refresh the page.
8. Select Continue Round and confirm the exact scores, HCI, course, tee routing,
   and current hole.
9. Close the browser tab completely.
10. Reopen GST and repeat the Continue verification.
11. Swipe the installed app or browser completely closed.
12. Reopen GST and repeat the Continue verification.
13. Switch to another app for at least 15 minutes.
14. Return to GST and repeat the Continue verification.
15. Lock the phone for at least five minutes.
16. Unlock it and repeat the Continue verification.
17. Enable airplane mode or otherwise remove network access.
18. Reopen GST while offline and repeat the Continue verification.
19. Enter additional scores while offline.
20. Close and reopen GST again while still offline.
21. Confirm every additional score is restored.
22. Restore network access.
23. Enter the remaining scores and save the completed round.
24. Confirm the round appears exactly once in Recent Rounds.
25. Confirm its Round Detail is correct.
26. Confirm Continue Round reports no active round.

Repeat the full sequence with a 9-hole scorecard before release if scorecard,
course, or persistence code changed after the 18-hole test.

### Head-to-Head Lifecycle

1. Start a 9-hole Hole-by-Hole Match.
2. Record both players' names and HCIs.
3. Enter both scores on at least three holes.
4. Confirm `Saved` after every score change.
5. Refresh, select Continue Round, and verify:
   - Head-to-Head opens
   - Both players and HCIs
   - Opponent information
   - Both score arrays
   - Current hole
   - Playing Handicaps
   - Current hole result
   - Current match status
6. Repeat browser-close, installed-app-close, app-switch, lock/unlock, and
   offline reopen steps from the Regular Scorecard checklist.
7. Complete and save the restored match.
8. Confirm Recent Rounds contains exactly one linked G-Well Scorecard and one
   H2H Match card.
9. Refresh again and confirm neither record is duplicated.
10. Confirm Continue Round no longer displays the completed H2H session.
11. Repeat an appropriate recovery sample with an 18-hole H2H match.

### Shot Tracking Lifecycle

1. Start a Shot Tracking round.
2. Record multiple shots on multiple holes.
3. Save at least two hole scores.
4. Navigate to a later hole.
5. Confirm `Saved` after every shot, hole score, and hole change.
6. Refresh and select Continue Round.
7. Confirm the exact course, round date, current hole, shots, shot order,
   shot details, and hole scores.
8. Repeat browser-close, installed-app-close, app-switch, lock/unlock, and
   offline reopen steps from the Regular Scorecard checklist.
9. From the recovered round, attempt to start another mode.
10. Confirm the Active Round Found dialog offers Continue Existing Round,
    Abandon Existing Round, and Cancel.
11. Select Cancel and confirm the original Shot Tracking round is unchanged.
12. Complete the Shot Tracking round.
13. Confirm exactly one Shot Tracking card appears in Recent Rounds.
14. Refresh and confirm the completed record remains and Continue Round has no
    active session.

### Abandonment and Save Status

1. Create one completed Scorecard round and one completed H2H match.
2. Start a new active session and enter data.
3. Select Abandon and cancel the confirmation once.
4. Confirm the active session remains.
5. Confirm abandonment on the second attempt.
6. Confirm only the selected active session is removed.
7. Confirm completed rounds, H2H history, profile HCI, Stats, and unrelated
   Shot Tracking data remain.
8. If a test environment can simulate blocked/quota-exceeded LocalStorage,
   confirm the header displays the full `Save Failed` warning and GST keeps the
   latest in-memory state available for retry.
9. Never intentionally fill or corrupt storage in a real-data profile.

## GitHub Pages and Phone Test

Run this checklist after pushing the intended release commit and confirming GitHub Pages deployment completed.

- [ ] The GitHub Pages URL loads successfully on a phone over Wi-Fi or cellular data.
- [ ] Splash, banner, icon, CSS, and all JavaScript files load without 404 errors.
- [ ] The dark GST layout fits the phone screen without unintended horizontal scrolling.
- [ ] Home tiles and score controls respond correctly to touch.
- [ ] The complete local manual smoke checklist passes on the phone where practical.
- [ ] Saving data and refreshing the deployed page preserves LocalStorage data.
- [ ] Incomplete active-round scores survive refresh and Continue on the phone.
- [ ] Current-hole restoration and Abandon Current Round work through the deployed page.
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
