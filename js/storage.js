// Golf Shot Tracker storage helpers.
// Load this classic script before state.js and app.js.

const SAVED_ROUNDS_KEY = "savedScorecardRounds";
const ACTIVE_SCORECARD_KEY = "gstActiveScorecardRound";
const SAVED_H2H_MATCHES_KEY = "gstH2HMatches";
const SAVED_SHOT_TRACKING_ROUNDS_KEY = "gstShotTrackingRounds";
const ACTIVE_SESSION_KEY = "gstActiveSession";
const ACTIVE_SESSION_PREVIOUS_KEY = "gstActiveSessionPrevious";
const INVALID_ACTIVE_RECORDS_KEY = "gstInvalidActiveSessionRecords";

function isPlainObject(value) {
    return Boolean(
        value &&
        typeof value === "object" &&
        !Array.isArray(value)
    );
}

function cloneJsonValue(value) {
    return JSON.parse(JSON.stringify(value));
}

function readStoredJsonResult(key) {
    const rawValue = localStorage.getItem(key);

    if (rawValue === null) {
        return {
            exists: false,
            valid: true,
            value: null,
            rawValue: null,
            error: null
        };
    }

    try {
        return {
            exists: true,
            valid: true,
            value: JSON.parse(rawValue),
            rawValue,
            error: null
        };
    } catch (error) {
        console.warn(`Could not read LocalStorage key "${key}":`, error);

        return {
            exists: true,
            valid: false,
            value: null,
            rawValue,
            error
        };
    }
}

/**
 * Read JSON from LocalStorage without allowing malformed browser data to
 * prevent the app from loading. Valid stored values and existing key names
 * remain unchanged.
 */
function readStoredJson(key, fallbackValue) {
    const result = readStoredJsonResult(key);

    return result.exists && result.valid && result.value
        ? result.value
        : fallbackValue;
}

function isValidIsoTimestamp(value) {
    return typeof value === "string" &&
        value.length > 0 &&
        Number.isFinite(Date.parse(value));
}

function isValidActiveSessionHole(hole) {
    return Boolean(
        isPlainObject(hole) &&
        Number.isInteger(hole.hole) &&
        Number.isFinite(hole.par) &&
        (hole.score === null || Number.isFinite(hole.score))
    );
}

function isValidActiveH2HMatch(match, holeCount) {
    return Boolean(
        isPlainObject(match) &&
        match.mode === "holeByHole" &&
        Array.isArray(match.players) &&
        match.players.length === 2 &&
        match.players.every(function(player) {
            return isPlainObject(player) &&
                typeof player.name === "string" &&
                Number.isFinite(player.hci);
        }) &&
        Array.isArray(match.holes) &&
        match.holes.length === holeCount &&
        match.holes.every(function(hole) {
            return isPlainObject(hole) &&
                Number.isInteger(hole.holeNumber) &&
                Number.isFinite(hole.par) &&
                Number.isFinite(hole.hcp);
        }) &&
        Array.isArray(match.scores) &&
        match.scores.length === holeCount &&
        match.scores.every(function(scores) {
            return isPlainObject(scores) &&
                (scores.player1 === null || Number.isFinite(scores.player1)) &&
                (scores.player2 === null || Number.isFinite(scores.player2));
        })
    );
}

function isValidActiveSessionSnapshot(session) {
    if (
        !isPlainObject(session) ||
        session.schemaVersion !== 2 ||
        typeof session.id !== "string" ||
        session.id.length < 8 ||
        !["scorecard", "h2h", "shotTracking"].includes(session.mode) ||
        session.status !== "active" ||
        !isValidIsoTimestamp(session.createdAt) ||
        !isValidIsoTimestamp(session.updatedAt) ||
        !isPlainObject(session.course) ||
        typeof session.course.id !== "string" ||
        typeof session.course.name !== "string" ||
        !("tee" in session.course) ||
        (session.course.tee !== null &&
            typeof session.course.tee !== "string") ||
        (session.holeCount !== 9 && session.holeCount !== 18) ||
        !Number.isInteger(session.currentHole) ||
        session.currentHole < 1 ||
        session.currentHole > session.holeCount ||
        !isPlainObject(session.player) ||
        typeof session.player.name !== "string" ||
        (session.player.hci !== null &&
            !Number.isFinite(session.player.hci)) ||
        !isPlainObject(session.state)
    ) {
        return false;
    }

    if (session.mode === "scorecard") {
        return Boolean(
            Array.isArray(session.state.holes) &&
            session.state.holes.length === session.holeCount &&
            session.state.holes.every(isValidActiveSessionHole) &&
            (session.state.hciUsed === null ||
                Number.isFinite(session.state.hciUsed))
        );
    }

    if (session.mode === "h2h") {
        return Boolean(
            isValidActiveH2HMatch(session.state.match, session.holeCount) &&
            Number.isFinite(session.state.matchScore) &&
            typeof session.state.matchStatus === "string"
        );
    }

    return Boolean(
        isPlainObject(session.state.round) &&
        (typeof session.state.round.id === "string" ||
            Number.isFinite(session.state.round.id)) &&
        typeof session.state.round.course === "string" &&
        typeof session.state.round.date === "string" &&
        Array.isArray(session.state.shots) &&
        session.state.shots.every(function(shot) {
            return isPlainObject(shot) &&
                shot.roundId === session.state.round.id &&
                Number.isInteger(shot.hole) &&
                shot.hole >= 1 &&
                shot.hole <= session.holeCount;
        }) &&
        Array.isArray(session.state.holes) &&
        session.state.holes.every(function(hole) {
            return isPlainObject(hole) &&
                hole.roundId === session.state.round.id &&
                Number.isInteger(hole.hole) &&
                hole.hole >= 1 &&
                hole.hole <= session.holeCount &&
                Number.isFinite(hole.par) &&
                Number.isFinite(hole.score);
        })
    );
}

function generateActiveSessionId() {
    if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
    ) {
        return crypto.randomUUID();
    }

    return [
        "gst",
        Date.now().toString(36),
        Math.random().toString(36).slice(2, 12),
        Math.random().toString(36).slice(2, 12)
    ].join("-");
}

function archiveInvalidStoredValue(sourceKey, rawValue) {
    if (rawValue === null || rawValue === undefined) {
        return true;
    }

    const archiveResult =
        readStoredJsonResult(INVALID_ACTIVE_RECORDS_KEY);

    if (
        archiveResult.exists &&
        (!archiveResult.valid || !Array.isArray(archiveResult.value))
    ) {
        console.warn(
            "Could not archive invalid active data because the recovery archive is invalid."
        );
        return false;
    }

    const archivedRecords = archiveResult.exists
        ? archiveResult.value.slice()
        : [];
    const alreadyArchived = archivedRecords.some(function(record) {
        return record.sourceKey === sourceKey &&
            record.rawValue === rawValue;
    });

    if (!alreadyArchived) {
        archivedRecords.push({
            schemaVersion: 1,
            id: generateActiveSessionId(),
            sourceKey,
            detectedAt: new Date().toISOString(),
            rawValue
        });
    }

    try {
        const serialized = JSON.stringify(archivedRecords);
        localStorage.setItem(INVALID_ACTIVE_RECORDS_KEY, serialized);

        const verification =
            readStoredJsonResult(INVALID_ACTIVE_RECORDS_KEY);

        return verification.valid &&
            Array.isArray(verification.value) &&
            JSON.stringify(verification.value) === serialized;
    } catch (error) {
        console.error("Could not archive invalid active data:", error);
        return false;
    }
}

function preserveInvalidJsonBeforeWrite(key, validator) {
    const result = readStoredJsonResult(key);

    if (!result.exists) {
        return true;
    }

    if (result.valid && validator(result.value)) {
        return true;
    }

    return archiveInvalidStoredValue(key, result.rawValue);
}

function saveVerifiedActiveSession(candidate) {
    if (!isValidActiveSessionSnapshot(candidate)) {
        return {
            ok: false,
            error: new Error("Active session validation failed.")
        };
    }

    const serializedCandidate = JSON.stringify(candidate);
    const currentResult = readStoredJsonResult(ACTIVE_SESSION_KEY);
    const currentIsValid = currentResult.exists &&
        currentResult.valid &&
        isValidActiveSessionSnapshot(currentResult.value);

    if (
        currentResult.exists &&
        !currentIsValid &&
        !archiveInvalidStoredValue(
            ACTIVE_SESSION_KEY,
            currentResult.rawValue
        )
    ) {
        return {
            ok: false,
            error: new Error(
                "The invalid active save could not be preserved."
            )
        };
    }

    const previousSerialized = currentIsValid
        ? JSON.stringify(currentResult.value)
        : null;

    try {
        if (previousSerialized !== null) {
            localStorage.setItem(
                ACTIVE_SESSION_PREVIOUS_KEY,
                previousSerialized
            );

            const previousVerification =
                readStoredJsonResult(ACTIVE_SESSION_PREVIOUS_KEY);

            if (
                !previousVerification.valid ||
                !isValidActiveSessionSnapshot(
                    previousVerification.value
                ) ||
                JSON.stringify(previousVerification.value) !==
                    previousSerialized
            ) {
                throw new Error(
                    "The previous active snapshot could not be verified."
                );
            }
        }

        localStorage.setItem(ACTIVE_SESSION_KEY, serializedCandidate);

        const verification =
            readStoredJsonResult(ACTIVE_SESSION_KEY);

        if (
            !verification.valid ||
            !isValidActiveSessionSnapshot(verification.value) ||
            JSON.stringify(verification.value) !== serializedCandidate
        ) {
            throw new Error(
                "The new active snapshot could not be verified."
            );
        }

        return {
            ok: true,
            value: verification.value
        };
    } catch (error) {
        console.error("Could not save the active GST session:", error);

        try {
            if (previousSerialized !== null) {
                localStorage.setItem(
                    ACTIVE_SESSION_KEY,
                    previousSerialized
                );
            } else if (!currentResult.exists) {
                localStorage.removeItem(ACTIVE_SESSION_KEY);
            }
        } catch (restoreError) {
            console.error(
                "Could not restore the last confirmed active snapshot:",
                restoreError
            );
        }

        return { ok: false, error };
    }
}

function clearVerifiedActiveSession(sessionId) {
    [ACTIVE_SESSION_KEY, ACTIVE_SESSION_PREVIOUS_KEY]
        .forEach(function(key) {
            const result = readStoredJsonResult(key);

            if (
                result.exists &&
                result.valid &&
                isValidActiveSessionSnapshot(result.value) &&
                result.value.id === sessionId
            ) {
                localStorage.removeItem(key);
            }
        });
}

function saveVerifiedArray(key, values) {
    if (!Array.isArray(values)) {
        throw new Error(`LocalStorage key "${key}" requires an array.`);
    }

    const existingResult = readStoredJsonResult(key);

    if (
        existingResult.exists &&
        (!existingResult.valid || !Array.isArray(existingResult.value))
    ) {
        throw new Error(
            `Existing LocalStorage key "${key}" is invalid and was preserved.`
        );
    }

    const serialized = JSON.stringify(values);
    localStorage.setItem(key, serialized);

    const verification = readStoredJsonResult(key);

    if (
        !verification.valid ||
        !Array.isArray(verification.value) ||
        JSON.stringify(verification.value) !== serialized
    ) {
        throw new Error(
            `LocalStorage key "${key}" could not be verified after writing.`
        );
    }
}

function getSavedRounds() {
    const savedRounds = readStoredJson(SAVED_ROUNDS_KEY, []);

    return Array.isArray(savedRounds) ? savedRounds : [];
}

function saveSavedRounds(savedRounds) {
    saveVerifiedArray(SAVED_ROUNDS_KEY, savedRounds);
}

function getActiveScorecardRound() {
    return readStoredJson(ACTIVE_SCORECARD_KEY, null);
}

function saveActiveScorecardRound(activeRound) {
    localStorage.setItem(ACTIVE_SCORECARD_KEY, JSON.stringify(activeRound));
}

function clearActiveScorecardRound() {
    localStorage.removeItem(ACTIVE_SCORECARD_KEY);
}

function getSavedH2HMatches() {
    const savedMatches = readStoredJson(SAVED_H2H_MATCHES_KEY, []);

    return Array.isArray(savedMatches) ? savedMatches : [];
}

function saveSavedH2HMatches(savedMatches) {
    saveVerifiedArray(SAVED_H2H_MATCHES_KEY, savedMatches);
}

function getSavedShotTrackingRounds() {
    const savedRounds =
        readStoredJson(SAVED_SHOT_TRACKING_ROUNDS_KEY, []);

    return Array.isArray(savedRounds) ? savedRounds : [];
}

function saveSavedShotTrackingRounds(savedRounds) {
    saveVerifiedArray(SAVED_SHOT_TRACKING_ROUNDS_KEY, savedRounds);
}
