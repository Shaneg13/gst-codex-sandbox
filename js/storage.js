// Golf Shot Tracker storage helpers.
// Load this classic script before state.js and app.js.

const SAVED_ROUNDS_KEY = "savedScorecardRounds";
const ACTIVE_SCORECARD_KEY = "gstActiveScorecardRound";

/**
 * Read JSON from LocalStorage without allowing malformed browser data to
 * prevent the app from loading. Valid stored values and existing key names
 * remain unchanged.
 */
function readStoredJson(key, fallbackValue) {
    const storedValue = localStorage.getItem(key);

    if (storedValue === null) {
        return fallbackValue;
    }

    try {
        return JSON.parse(storedValue) || fallbackValue;
    } catch (error) {
        console.warn(`Could not read LocalStorage key "${key}":`, error);
        return fallbackValue;
    }
}

function getSavedRounds() {
    return readStoredJson(SAVED_ROUNDS_KEY, []);
}

function saveSavedRounds(savedRounds) {
    localStorage.setItem(SAVED_ROUNDS_KEY, JSON.stringify(savedRounds));
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
