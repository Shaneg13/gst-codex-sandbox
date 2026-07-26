# GST Active Session Persistence

## Table of Contents

1. [Purpose](#purpose)
2. [Storage Keys](#storage-keys)
3. [Canonical Schema](#canonical-schema)
4. [Mode-Specific State](#mode-specific-state)
5. [Verified Save Algorithm](#verified-save-algorithm)
6. [Startup Recovery](#startup-recovery)
7. [Legacy Compatibility](#legacy-compatibility)
8. [One-Active-Session Rule](#one-active-session-rule)
9. [Completion and Reconciliation](#completion-and-reconciliation)
10. [Abandonment](#abandonment)
11. [Save Status](#save-status)
12. [Verification](#verification)
13. [Lessons](#lessons)

## Purpose

GST keeps one canonical active golf session that can represent Regular
Scorecard, Head-to-Head, or Shot Tracking. Every meaningful change is written
immediately. Page lifecycle events perform an additional best-effort flush but
are not the primary persistence mechanism.

The active-session layer remains LocalStorage-based and build-free. It does not
introduce IndexedDB, dependencies, frameworks, or a complete backup/import
system.

## Storage Keys

| Key | Responsibility |
|---|---|
| `gstActiveSession` | Current verified schema-version-2 active session |
| `gstActiveSessionPrevious` | Previous verified snapshot for last-known-good recovery |
| `gstInvalidActiveSessionRecords` | Archived raw values that were invalid and had to be preserved before a compatible key could be reused |
| `gstActiveScorecardRound` | Version-1 Regular Scorecard compatibility mirror |
| `simpleScorecard` | Legacy Regular Scorecard hole-array mirror |
| `scorecardHoleCount` | Legacy Regular Scorecard hole-count mirror |
| `gstH2HMatch` | Legacy/current H2H compatibility mirror |
| `currentRound` | Legacy Shot Tracking round mirror |
| `currentHole` | Legacy Shot Tracking hole mirror |
| `shots` | Existing cumulative Shot Tracking shot history and active mirror |
| `holes` | Existing cumulative Shot Tracking hole-score history and active mirror |
| `roundMode` | Existing mode compatibility value |
| `gstShotTrackingRounds` | Completed Shot Tracking records |

No existing key is renamed. Invalid raw active values are not automatically
deleted.

## Canonical Schema

Every `gstActiveSession` record has this base shape:

```json
{
  "schemaVersion": 2,
  "id": "collision-resistant string",
  "mode": "scorecard | h2h | shotTracking",
  "status": "active",
  "createdAt": "ISO-8601 timestamp",
  "updatedAt": "ISO-8601 timestamp",
  "course": {
    "id": "course identifier",
    "name": "course name",
    "tee": "tee or routing description, or null"
  },
  "holeCount": 9,
  "currentHole": 1,
  "player": {
    "name": "G-Well",
    "hci": 26.4
  },
  "state": {}
}
```

IDs use `crypto.randomUUID()` when available. The build-free fallback combines
the current time with two independent random components.

## Mode-Specific State

### Regular Scorecard

`state` contains:

- `screen: "scorecardScreen"`
- The starting `hciUsed`
- The complete 9-hole or 18-hole array
- Par, yardage, tee, handicap, and current score for every hole

The top-level `currentHole` is the last scorecard hole changed.

### Head-to-Head

`state` contains:

- `screen: "h2hMatchScreen"`
- The complete active H2H match object
- Both player snapshots
- Opponent name and HCI
- Course holes and both score arrays
- Current numeric match score
- Current match-status text

Playing Handicaps and match results continue using the existing tested
calculation functions.

### Shot Tracking

`state` contains:

- `screen: "shotTrackerCard"`
- The active legacy-compatible round object
- Shots belonging to the active round ID
- Hole scores belonging to the active round ID
- The current hole

Existing cumulative `shots` and `holes` keys remain intact for compatibility.

## Verified Save Algorithm

Every active mutation follows the same process:

1. Build a complete in-memory candidate.
2. Validate the full base and mode-specific structure.
3. Read the current canonical snapshot.
4. If the current snapshot is valid, write and verify it as
   `gstActiveSessionPrevious`.
5. If the current raw value is invalid, archive it before reusing the key.
6. Write the new `gstActiveSession` value.
7. Read the value back.
8. Parse, structurally validate, and compare the read-back value.
9. Report `Saved` only after verification succeeds.
10. Mirror the verified state to the existing mode-specific keys.

If writing or verification fails, GST retains the in-memory round and the last
confirmed snapshot. The UI reports `Save Failed` and the user can retry without
closing the app.

## Startup Recovery

Startup inspects:

- Current and previous canonical active snapshots
- Version-1 `gstActiveScorecardRound`
- Legacy `simpleScorecard`
- `gstH2HMatch`
- `currentRound`, `currentHole`, `shots`, and `holes`

Candidates must pass structural validation. Canonical candidates are ordered by
`updatedAt`. A valid previous snapshot is used when the current canonical value
is invalid.

If more than one legacy mode is recoverable, GST:

- Preserves every source record
- Selects the newest valid candidate it can identify
- Displays a clear multiple-session notice
- Exposes the next preserved candidate if the selected session is explicitly
  abandoned

Continue Round restores the correct mode, course, hole count, current hole,
player data, and complete mode-specific state.

## Legacy Compatibility

Version-1 and legacy scorecards are migrated into schema version 2 without
changing completed history. H2H and Shot Tracking legacy records are similarly
wrapped in a canonical active session.

After a canonical save verifies successfully, GST continues writing the
existing compatibility keys. Valid old browser data is not replaced with an
empty fallback.

## One-Active-Session Rule

Regular Scorecard, H2H, and Shot Tracking all use the same start guard.

When a recoverable session exists, a new start request displays:

- Continue Existing Round
- Abandon Existing Round
- Cancel

No start path silently overwrites the current session. Abandonment requires a
confirmation.

## Completion and Reconciliation

Completed records use the active session ID.

Regular Scorecard completion:

1. Validates every hole.
2. Writes or finds exactly one completed scorecard record.
3. Reads history back and verifies exactly one matching ID.
4. Clears active data only after verification.

H2H completion independently verifies:

- One linked G-Well scorecard
- One H2H match-history record

Both use the same relationship ID. If the application stops between the two
writes, startup completes the missing side without duplicating the existing
record.

Shot Tracking completion writes one record to `gstShotTrackingRounds`, verifies
it, then clears only the active round pointers. Existing cumulative shot and
hole history remains intact.

Startup also detects completed history whose matching active cleanup was
interrupted. It clears the stale active session without writing a duplicate.

## Abandonment

Abandonment:

- Requires explicit confirmation
- Removes the selected canonical current/previous snapshots
- Removes only that mode's valid compatibility record
- Preserves invalid raw values
- Never deletes completed Scorecard or H2H history
- Never clears the player profile
- Preserves unrelated Shot Tracking shots and hole scores

Abandoning Shot Tracking filters only entries belonging to that active legacy
round ID.

## Save Status

The application header provides:

- `Saving…`
- `Saved`
- `Save Failed — latest change is not safely stored`
- `Restored from Backup`

The Home Continue tile displays the round type, course, hole count, current
hole, and last verified save time.

## Verification

Run:

```powershell
node scripts/verify-app.js
```

The automated harness covers:

- 9-hole and 18-hole fresh-runtime Scorecard recovery
- Repeated reload cycles
- H2H player, score, handicap, and match-status recovery
- Shot Tracking shot and hole-score recovery
- One-active-session overwrite prevention
- Last-known-good fallback
- Invalid raw-data preservation
- Simulated storage failure and retry
- Interrupted completion reconciliation
- Completion deduplication
- Abandonment isolation
- Multiple legacy active-session preservation
- Malformed completed-history protection

Real browser, installed-app, phone lifecycle, and offline behavior remain manual
release checks in `TEST_PLAN.md`.

## Lessons

- Mobile persistence must be complete before each interaction returns.
- Lifecycle events are helpful final flushes, not a reliable primary save path.
- A parsed value is not necessarily structurally valid.
- Active-to-completed transitions need stable IDs and restart reconciliation.
- Compatibility mirrors should follow a verified canonical save.
- Invalid user data should be preserved for diagnosis, not silently deleted.
