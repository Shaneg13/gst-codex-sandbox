// Golf Shot Tracker shared runtime state.
// These bindings intentionally remain in the global classic-script scope so
// existing app.js functions can use them without modules or a build step.

let currentHole = Number(localStorage.getItem("currentHole")) || 1;
let currentRoundValue = readStoredJson("currentRound", null);
let currentRound = isPlainObject(currentRoundValue)
    ? currentRoundValue
    : null;
let storedShots = readStoredJson("shots", []);
let shots = Array.isArray(storedShots) ? storedShots : [];
let storedHoles = readStoredJson("holes", []);
let holes = Array.isArray(storedHoles) ? storedHoles : [];

let playerProfile = {
    name: "G-Well",
    hci: 26.4
};

let pastRoundScorecard = [];
let simpleScorecard = [];
let activeScorecardRound = null;
let h2hMatch = null;
let activeSession = null;
let activeSessionCandidates = [];
let activeSessionRecoveryNotice = "";
let pendingActiveSessionStart = null;
let saveFailureAlertShown = false;

let selectedCourseId =
    localStorage.getItem("selectedCourseId") || "whitinsville";
