// Golf Shot Tracker shared runtime state.
// These bindings intentionally remain in the global classic-script scope so
// existing app.js functions can use them without modules or a build step.

let currentHole = Number(localStorage.getItem("currentHole")) || 1;
let currentRound = readStoredJson("currentRound", null);
let shots = readStoredJson("shots", []);
let holes = readStoredJson("holes", []);

let playerProfile = {
    name: "G-Well",
    hci: 26.4
};

let pastRoundScorecard = [];
let simpleScorecard = [];
let h2hMatch = null;

let selectedCourseId =
    localStorage.getItem("selectedCourseId") || "whitinsville";
