#!/usr/bin/env node

"use strict";

const fs = require("fs");
const http = require("http");
const path = require("path");
const vm = require("vm");
const { spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const INDEX_PATH = path.join(ROOT, "index.html");
const EXPECTED_SCRIPT_ORDER = [
    "js/storage.js",
    "js/state.js",
    "js/navigation.js",
    "js/utils.js",
    "app.js"
];

let passedChecks = 0;

function relativePath(filePath) {
    return path.relative(ROOT, filePath).split(path.sep).join("/");
}

function pass(message) {
    passedChecks++;
    console.log(`PASS ${message}`);
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }

    pass(message);
}

function readText(relativeFilePath) {
    return fs.readFileSync(path.join(ROOT, relativeFilePath), "utf8");
}

function walkJavaScriptFiles(directoryPath) {
    const files = [];

    fs.readdirSync(directoryPath, { withFileTypes: true }).forEach(function(entry) {
        if (entry.name === ".git" || entry.name === "node_modules") {
            return;
        }

        const entryPath = path.join(directoryPath, entry.name);

        if (entry.isDirectory()) {
            files.push(...walkJavaScriptFiles(entryPath));
            return;
        }

        if (entry.isFile() && entry.name.endsWith(".js")) {
            files.push(entryPath);
        }
    });

    return files.sort();
}

function verifyJavaScriptSyntax() {
    const javascriptFiles = walkJavaScriptFiles(ROOT);

    assert(javascriptFiles.length > 0, "JavaScript files were discovered");

    javascriptFiles.forEach(function(filePath) {
        const result = spawnSync(process.execPath, ["--check", filePath], {
            encoding: "utf8"
        });

        if (result.status !== 0) {
            const output = `${result.stdout || ""}${result.stderr || ""}`.trim();
            throw new Error(`JavaScript syntax failed for ${relativePath(filePath)}\n${output}`);
        }

        pass(`JavaScript syntax: ${relativePath(filePath)}`);
    });
}

function stripQueryAndHash(reference) {
    return reference.split(/[?#]/, 1)[0].replace(/^\.\//, "");
}

function getScriptSources(indexHtml) {
    return Array.from(
        indexHtml.matchAll(/<script\s+[^>]*src=["']([^"']+)["'][^>]*>/gi),
        function(match) {
            return stripQueryAndHash(match[1]);
        }
    );
}

function getLocalAssetReferences(indexHtml) {
    const references = Array.from(
        indexHtml.matchAll(/\b(?:src|href)=["']([^"']+)["']/gi),
        function(match) {
            return match[1];
        }
    );

    return Array.from(new Set(references
        .filter(function(reference) {
            return !/^(?:[a-z]+:|\/\/|#)/i.test(reference);
        })
        .map(stripQueryAndHash)
        .filter(Boolean)));
}

function verifyIndexStructure(indexHtml) {
    const scriptSources = getScriptSources(indexHtml);

    assert(
        JSON.stringify(scriptSources) === JSON.stringify(EXPECTED_SCRIPT_ORDER),
        `Classic script load order: ${scriptSources.join(" -> ")}`
    );

    const assetReferences = getLocalAssetReferences(indexHtml);

    assert(assetReferences.length > 0, "Local HTML asset references were discovered");

    assetReferences.forEach(function(reference) {
        const resolvedPath = path.resolve(ROOT, reference);
        const staysInsideRoot =
            resolvedPath === ROOT || resolvedPath.startsWith(`${ROOT}${path.sep}`);

        assert(staysInsideRoot, `Asset reference stays inside repository: ${reference}`);
        assert(fs.existsSync(resolvedPath), `Asset reference exists: ${reference}`);
        assert(fs.statSync(resolvedPath).isFile(), `Asset reference is a file: ${reference}`);
    });

    assert(
        /<p class=["']beta-testing-label["']>Beta Testing<\/p>/.test(indexHtml),
        "Beta Testing easter egg is present"
    );

    return {
        assetReferences,
        scriptSources
    };
}

function createClassList(initialClassNames) {
    const classNames = new Set(initialClassNames);

    return {
        add: function(...names) {
            names.forEach(name => classNames.add(name));
        },
        remove: function(...names) {
            names.forEach(name => classNames.delete(name));
        },
        toggle: function(name, force) {
            const shouldAdd = force === undefined ? !classNames.has(name) : force;

            if (shouldAdd) {
                classNames.add(name);
            } else {
                classNames.delete(name);
            }

            return shouldAdd;
        },
        contains: function(name) {
            return classNames.has(name);
        }
    };
}

function getInitialElementClasses(indexHtml) {
    const classMap = new Map();

    Array.from(indexHtml.matchAll(/<[^>]+\bid=["']([^"']+)["'][^>]*>/gi))
        .forEach(function(match) {
            const classMatch = match[0].match(/\bclass=["']([^"']+)["']/i);
            const classes = classMatch ? classMatch[1].split(/\s+/).filter(Boolean) : [];

            classMap.set(match[1], classes);
        });

    return classMap;
}

function createElement(elementId, initialClasses) {
    let innerHtml = "";
    const element = {
        id: elementId,
        style: {},
        textContent: "",
        value: "",
        selectedIndex: 0,
        options: [{ dataset: { loft: "" } }],
        children: [],
        classList: createClassList(initialClasses),
        appendChild: function(child) {
            this.children.push(child);
            return child;
        },
        addEventListener: function() {},
        click: function() {}
    };

    Object.defineProperty(element, "innerHTML", {
        get: function() {
            return innerHtml;
        },
        set: function(value) {
            innerHtml = value;

            if (value === "") {
                element.children = [];
            }
        }
    });

    return element;
}

function createStorage(initialValues) {
    return new Map(Object.entries(initialValues || {}).map(function(entry) {
        return [entry[0], String(entry[1])];
    }));
}

function createAppHarness(indexHtml, scriptSources, storage) {
    const initialClassMap = getInitialElementClasses(indexHtml);
    const elements = new Map();
    const loadHandlers = [];
    const alerts = [];
    const consoleErrors = [];
    const consoleWarnings = [];

    const document = {
        getElementById: function(elementId) {
            if (!elements.has(elementId)) {
                elements.set(
                    elementId,
                    createElement(elementId, initialClassMap.get(elementId) || [])
                );
            }

            return elements.get(elementId);
        },
        createElement: function() {
            return createElement("", []);
        },
        querySelectorAll: function() {
            return [];
        }
    };

    const context = {
        localStorage: {
            getItem: function(key) {
                return storage.has(key) ? storage.get(key) : null;
            },
            setItem: function(key, value) {
                storage.set(key, String(value));
            },
            removeItem: function(key) {
                storage.delete(key);
            }
        },
        document,
        window: {
            addEventListener: function(eventName, handler) {
                if (eventName === "load") {
                    loadHandlers.push(handler);
                }
            }
        },
        console: {
            log: function() {},
            warn: function(...args) {
                consoleWarnings.push(args);
            },
            error: function(...args) {
                consoleErrors.push(args);
            }
        },
        alert: function(message) {
            alerts.push(message);
        },
        confirm: function() {
            return true;
        },
        prompt: function() {
            return "18.2";
        },
        Blob: class BlobStub {},
        URL: {
            createObjectURL: function() {
                return "blob:test";
            },
            revokeObjectURL: function() {}
        },
        setTimeout: function(handler) {
            handler();
            return 1;
        },
        Date,
        JSON,
        Math,
        Number,
        String,
        Object,
        Array,
        parseFloat,
        isNaN
    };

    vm.createContext(context);

    scriptSources.forEach(function(scriptSource) {
        vm.runInContext(readText(scriptSource), context, {
            filename: scriptSource
        });
    });

    loadHandlers.forEach(handler => handler());

    return {
        alerts,
        consoleErrors,
        consoleWarnings,
        context,
        document,
        elements,
        evaluate: function(source) {
            return vm.runInContext(source, context);
        },
        storage
    };
}

function getGlobalHandlerNames(indexHtml) {
    return Array.from(new Set(Array.from(
        indexHtml.matchAll(/on(?:click|change|submit)=["']([A-Za-z_$][\w$]*)\s*\(/gi),
        match => match[1]
    ))).sort();
}

function verifyValidStorageStartup(indexHtml, scriptSources) {
    const storage = createStorage({
        currentHole: "3",
        currentRound: JSON.stringify({
            id: 123,
            course: "Verification Course",
            date: "2026-01-01"
        }),
        shots: "[]",
        holes: "[]",
        savedScorecardRounds: "[]",
        gstH2HMatches: JSON.stringify([{
            id: 456,
            type: "h2h-match",
            result: "win"
        }]),
        gstPlayerProfile: JSON.stringify({
            name: "G-Well",
            hci: 26.4
        }),
        selectedCourseId: "whitinsville"
    });

    const harness = createAppHarness(indexHtml, scriptSources, storage);

    assert(
        harness.evaluate(
            "currentHole === 3 && currentRound.id === 123 && " +
            "Array.isArray(shots) && Array.isArray(holes) && playerProfile.hci === 26.4 && " +
            "getSavedH2HMatches().length === 1"
        ),
        "App initializes with valid LocalStorage"
    );
    assert(harness.consoleErrors.length === 0, "Valid startup has no console errors");
}

function verifyMalformedStorageStartup(indexHtml, scriptSources) {
    const storage = createStorage({
        currentRound: "{invalid json",
        shots: "{invalid json",
        holes: "{invalid json",
        savedScorecardRounds: "{invalid json",
        gstH2HMatches: "{invalid json",
        gstPlayerProfile: "{invalid json",
        gstActiveScorecardRound: "{invalid json"
    });

    const harness = createAppHarness(indexHtml, scriptSources, storage);

    assert(
        harness.evaluate(
            "currentRound === null && Array.isArray(shots) && shots.length === 0 && " +
            "Array.isArray(holes) && holes.length === 0 && getSavedRounds().length === 0 && " +
            "playerProfile.name === 'G-Well' && playerProfile.hci === 26.4 && " +
            "activeScorecardRound === null && getSavedH2HMatches().length === 0"
        ),
        "App initializes safely with malformed LocalStorage"
    );
    assert(
        !storage.has("gstActiveScorecardRound"),
        "Malformed active scorecard data is cleared safely"
    );
    assert(harness.consoleErrors.length === 0, "Malformed startup has no console errors");
    assert(harness.consoleWarnings.length >= 7, "Malformed values use defensive fallbacks");
}

function verifyLegacyScorecardMigration(indexHtml, scriptSources) {
    const legacyHoles = Array.from({ length: 9 }, function(_, index) {
        return {
            hole: index + 1,
            par: 4,
            yards: 300,
            tee: "White",
            handicap: index + 1,
            score: index === 0 ? 5 : null
        };
    });
    const storage = createStorage({
        currentHole: "3",
        scorecardHoleCount: "9",
        selectedCourseId: "whitinsville",
        simpleScorecard: JSON.stringify(legacyHoles)
    });
    const harness = createAppHarness(indexHtml, scriptSources, storage);

    assert(
        harness.evaluate(
            "activeScorecardRound !== null && " +
            "activeScorecardRound.holeCount === 9 && " +
            "activeScorecardRound.currentHole === 3 && " +
            "activeScorecardRound.holes[0].score === 5"
        ),
        "Legacy simpleScorecard progress migrates to active-round state"
    );
    assert(
        storage.has("gstActiveScorecardRound"),
        "Legacy migration writes the versioned active-round key"
    );
}

function verifyGlobalHandlers(indexHtml, scriptSources) {
    const harness = createAppHarness(indexHtml, scriptSources, createStorage());
    const handlerNames = getGlobalHandlerNames(indexHtml);
    const unavailableHandlers = handlerNames.filter(function(handlerName) {
        return !harness.evaluate(`typeof ${handlerName} === "function"`);
    });

    assert(handlerNames.length > 0, "Global HTML handlers were discovered");
    assert(
        unavailableHandlers.length === 0,
        unavailableHandlers.length === 0
            ? `All ${handlerNames.length} global HTML handlers are available`
            : `Unavailable global HTML handlers: ${unavailableHandlers.join(", ")}`
    );
}

function verifyCoreDomSmoke(indexHtml, scriptSources) {
    const storage = createStorage();
    let harness = createAppHarness(indexHtml, scriptSources, storage);
    const evaluate = source => harness.evaluate(source);

    let homeCard = harness.document.getElementById("homeCard");
    let splashScreen = harness.document.getElementById("splashScreen");

    assert(
        !homeCard.classList.contains("hidden") &&
        homeCard.style.display !== "none" &&
        splashScreen.style.display === "none",
        "Smoke: home screen loads"
    );
    assert(indexHtml.includes("Beta Testing"), "Smoke: Beta Testing appears");

    evaluate("showRoundModePopup()");
    assert(
        !harness.document.getElementById("roundModePopup").classList.contains("hidden"),
        "Smoke: Start Round opens"
    );

    evaluate("startScorecardRound(9)");
    assert(
        evaluate("simpleScorecard.length === 9") &&
        !harness.document.getElementById("scorecardScreen").classList.contains("hidden"),
        "Smoke: 9-hole scorecard starts"
    );

    const openingPar = evaluate("simpleScorecard[0].par");
    evaluate("increaseScore(0)");
    assert(
        evaluate("simpleScorecard[0].score") === openingPar,
        "Smoke: score plus control works"
    );
    evaluate("decreaseScore(0)");
    assert(
        evaluate("simpleScorecard[0].score") === openingPar - 1,
        "Smoke: score minus control works"
    );
    evaluate("increaseScore(1)");
    assert(
        evaluate("simpleScorecard[1].score === simpleScorecard[1].par"),
        "Field test: scores can be entered on multiple holes"
    );
    assert(
        JSON.parse(storage.get("gstActiveScorecardRound")).currentHole === 2 &&
        JSON.parse(storage.get("gstActiveScorecardRound")).holes[0].score === openingPar - 1,
        "Field test: every score change autosaves active progress"
    );

    harness = createAppHarness(indexHtml, scriptSources, storage);
    evaluate("continueRound()");
    assert(
        evaluate(
            "simpleScorecard.length === 9 && " +
            "simpleScorecard[0].score === simpleScorecard[0].par - 1 && " +
            "simpleScorecard[1].score === simpleScorecard[1].par"
        ),
        "Field test: refresh and Continue restore entered scores"
    );
    assert(
        evaluate(
            "activeScorecardRound.currentHole === 2 && " +
            "activeScorecardRound.holeCount === 9 && " +
            "activeScorecardRound.courseId === 'whitinsville' && " +
            "activeScorecardRound.hciUsed === 26.4 && " +
            "simpleScorecard[0].tee === 'White/Blue'"
        ),
        "Field test: Continue restores hole, course, tee, hole count, and HCI"
    );
    assert(
        !harness.document.getElementById("scorecardScreen").classList.contains("hidden"),
        "Field test: Continue returns to the active scorecard"
    );

    const alertCountBeforeIncompleteSave = harness.alerts.length;
    evaluate("saveScorecardRound()");
    assert(
        evaluate("getSavedRounds().length === 0") &&
        harness.alerts.length === alertCountBeforeIncompleteSave + 1 &&
        harness.alerts[harness.alerts.length - 1].includes("every hole"),
        "Field test: incomplete completed-round save is blocked"
    );
    assert(
        storage.has("gstActiveScorecardRound"),
        "Field test: blocked save leaves the round active"
    );

    evaluate("abandonCurrentScorecardRound()");
    homeCard = harness.document.getElementById("homeCard");
    assert(
        !storage.has("gstActiveScorecardRound") &&
        !storage.has("simpleScorecard") &&
        homeCard.style.display === "block",
        "Field test: Abandon clears active progress and returns Home"
    );

    evaluate("startScorecardRound(18)");
    assert(evaluate("simpleScorecard.length === 18"), "Smoke: 18-hole scorecard starts");

    evaluate("simpleScorecard.forEach(hole => { hole.score = hole.par; }); saveScorecardRound()");
    assert(
        JSON.parse(storage.get("savedScorecardRounds")).length === 1,
        "Smoke: scorecard round saves"
    );
    assert(
        JSON.stringify(Object.keys(
            JSON.parse(storage.get("savedScorecardRounds"))[0]
        ).sort()) === JSON.stringify([
            "courseId",
            "courseName",
            "date",
            "hciUsed",
            "holes",
            "holesPlayed",
            "id",
            "mode",
            "totalScore"
        ]),
        "Regression: completed saved-round structure is unchanged"
    );

    evaluate("startScorecardRound(9); increaseScore(0); abandonCurrentScorecardRound()");
    assert(
        JSON.parse(storage.get("savedScorecardRounds")).length === 1 &&
        !storage.has("gstActiveScorecardRound"),
        "Field test: Abandon preserves completed saved rounds"
    );

    evaluate("showRecentRounds()");
    assert(
        !harness.document.getElementById("recentRoundsScreen").classList.contains("hidden"),
        "Smoke: Recent Rounds opens"
    );

    evaluate("showRoundDetail(getSavedRounds()[0].id)");
    assert(
        !harness.document.getElementById("roundDetailScreen").classList.contains("hidden"),
        "Smoke: Round Detail opens"
    );

    evaluate("showStats()");
    assert(
        !harness.document.getElementById("statsScreen").classList.contains("hidden"),
        "Smoke: Stats opens"
    );

    evaluate("showCourseInfo()");
    assert(
        !harness.document.getElementById("courseInfoScreen").classList.contains("hidden"),
        "Smoke: Course Info opens"
    );

    evaluate("showHeadToHead()");
    assert(
        !harness.document.getElementById("headToHeadScreen").classList.contains("hidden"),
        "Smoke: Head-to-Head opens"
    );

    assert(
        harness.document.getElementById("h2hHoleByHolePanel").style.display === "block",
        "H2H: new match setup appears immediately"
    );
    assert(
        harness.document.getElementById("h2hPlayerName").value === "G-Well" &&
        harness.document.getElementById("h2hPlayerHci").value === 26.4,
        "H2H: player name and HCI default from the profile"
    );

    harness.document.getElementById("h2hPlayerHci").value = "25.6";
    harness.document.getElementById("h2hOpponentName").value = "Mike";
    harness.document.getElementById("h2hOpponentHci").value = "7.4";
    evaluate("startH2HHoleByHole(9)");
    assert(
        !harness.document.getElementById("h2hMatchScreen").classList.contains("hidden") &&
        evaluate(
            "h2hMatch.holes.length === 9 && " +
            "h2hMatch.players[0].hci === 25.6 && " +
            "h2hMatch.players[1].name === 'Mike' && " +
            "h2hMatch.players[1].hci === 7.4"
        ),
        "H2H: 9-hole match scorecard starts from setup inputs"
    );
    assert(
        harness.document.getElementById("saveH2HMatchButton").classList.contains("hidden"),
        "H2H save: Save Match stays hidden while scores are incomplete"
    );
    const alertCountBeforeIncompleteH2HSave = harness.alerts.length;
    evaluate("saveH2HMatch()");
    assert(
        evaluate("getSavedRounds().length === 1 && getSavedH2HMatches().length === 0"),
        "H2H save: incomplete attempt creates no scorecard or match records"
    );
    assert(
        harness.alerts.length === alertCountBeforeIncompleteH2HSave + 1 &&
        harness.alerts[harness.alerts.length - 1].includes("every hole"),
        "H2H save: incomplete attempts show a clear message"
    );
    evaluate(
        "saveSavedH2HMatches([{ " +
            "id: 100, type: 'h2h-match', date: '6/1/2026', " +
            "playerName: 'G-Well', opponentName: 'Alex', result: 'loss', " +
            "finalMatchStatus: 'Alex 1 Up', playerTotalGross: 41, opponentTotalGross: 40, holes: [] " +
        "}])"
    );
    assert(
        evaluate(
            "getH2HPlayingHandicap(25.6, 9) === 16 && " +
            "getH2HPlayingHandicap(7.4, 9) === 5 && " +
            "getH2HMatchPlayingHandicaps().difference === 11 && " +
            "getH2HMatchPlayingHandicaps().receivingPlayer === 'player1'"
        ),
        "H2H WHS: 9-hole Playing Handicaps are 16 and 5 with an 11-stroke difference"
    );
    assert(
        evaluate(
            "h2hMatch.holes.every(function(hole) { " +
                "return getH2HMatchPlayStrokesForHole(hole).player1 >= 1 && " +
                    "getH2HMatchPlayStrokesForHole(hole).player2 === 0; " +
            "}) && " +
            "getH2HMatchPlayStrokesForHole(h2hMatch.holes.find(function(hole) { return hole.holeNumber === 6; })).player1 === 2 && " +
            "getH2HMatchPlayStrokesForHole(h2hMatch.holes.find(function(hole) { return hole.holeNumber === 9; })).player1 === 2 && " +
            "h2hMatch.holes.filter(function(hole) { return hole.holeNumber !== 6 && hole.holeNumber !== 9; }).every(function(hole) { " +
                "return getH2HMatchPlayStrokesForHole(hole).player1 === 1; " +
            "})"
        ),
        "H2H WHS: 11 strokes give one per hole plus extras on holes 6 and 9"
    );
    assert(
        harness.document.getElementById("h2hMatchPlayers").textContent ===
            "G-Well PH 16 vs Mike PH 5",
        "H2H WHS: both Playing Handicaps are visible on the match scorecard"
    );

    let h2hFirstHole = harness.document.getElementById("h2hMatchGrid").children[0];
    assert(
        h2hFirstHole.className.includes("scorecard-hole") &&
        h2hFirstHole.innerHTML.includes("Par 5") &&
        h2hFirstHole.innerHTML.includes("yds") &&
        h2hFirstHole.innerHTML.includes("HCP") &&
        h2hFirstHole.innerHTML.includes("White"),
        "H2H: match holes reuse the Scorecard Mode layout and course details"
    );
    assert(
        h2hFirstHole.innerHTML.includes("G-Well Score") &&
        h2hFirstHole.innerHTML.includes("Mike Score") &&
        h2hFirstHole.innerHTML.includes("Current Hole Result:"),
        "H2H: both score controls and exact result label are rendered"
    );

    evaluate(
        "adjustH2HScore('player1', 1, 0); " +
        "adjustH2HScore('player1', -1, 0); " +
        "adjustH2HScore('player1', 1, 0); " +
        "adjustH2HScore('player1', 1, 0); " +
        "adjustH2HScore('player2', 1, 0)"
    );
    h2hFirstHole = harness.document.getElementById("h2hMatchGrid").children[0];
    assert(
        evaluate(
            "h2hMatch.scores[0].player1 === 6 && " +
            "h2hMatch.scores[0].player2 === 5"
        ),
        "H2H: scorecard-style plus/minus controls update both players"
    );
    assert(
        evaluate(
            "getH2HMatchPlayStrokesForHole(h2hMatch.holes[0]).player1 === 1 && " +
            "getH2HMatchPlayStrokesForHole(h2hMatch.holes[0]).player2 === 0 && " +
            "getH2HNetScore(6, 1) === 5"
        ),
        "H2H net: higher Playing Handicap receives strokes and lower Playing Handicap is scratch"
    );
    assert(
        h2hFirstHole.innerHTML.includes("Hole halved") &&
        h2hFirstHole.innerHTML.includes("Gross 6 • Strokes 1 • Net 5") &&
        h2hFirstHole.innerHTML.includes("Gross 5 • Strokes 0 • Net 5") &&
        harness.document.getElementById("h2hMatchStatus").textContent === "All Square",
        "H2H net: equal net scores halve the hole and keep the match All Square"
    );

    evaluate("adjustH2HScore('player2', 1, 0)");
    h2hFirstHole = harness.document.getElementById("h2hMatchGrid").children[0];
    assert(
        h2hFirstHole.innerHTML.includes("G-Well wins hole") &&
        harness.document.getElementById("h2hMatchStatus").textContent === "G-Well 1 Up" &&
        evaluate("getH2HMatchScore(0) === 1"),
        "H2H net: numeric match score updates the displayed running status"
    );
    assert(
        storage.has("gstH2HMatch"),
        "H2H: existing active-match LocalStorage key remains compatible"
    );

    evaluate(
        "h2hMatch.holes.forEach(function(hole, index) { " +
            "h2hMatch.scores[index].player1 = hole.par + 1; " +
            "h2hMatch.scores[index].player2 = hole.par; " +
        "}); renderH2HMatchScorecard();"
    );
    assert(
        !harness.document.getElementById("saveH2HMatchButton").classList.contains("hidden") &&
        evaluate(
            "isH2HMatchComplete() && getH2HMatchScore() === 2 && " +
            "getH2HMatchResult() === 'win' && " +
            "getH2HMatchPlayStatus(8) === 'G-Well 2 Up'"
        ),
        "H2H save: completed match exposes Save Match and uses numeric final result logic"
    );

    const alertCountBeforeCompletedH2HSave = harness.alerts.length;
    evaluate("saveH2HMatch()");
    assert(
        evaluate(
            "getSavedRounds().length === 2 && getSavedH2HMatches().length === 2 && " +
            "getSavedH2HMatches().some(function(match) { return match.opponentName === 'Alex'; })"
        ) &&
        !storage.has("gstH2HMatch"),
        "H2H save: both new records append without overwriting existing history"
    );
    assert(
        evaluate(
            "(function() { " +
                "var round = getSavedRounds().find(function(item) { return item.source === 'h2h-match'; }); " +
                "var match = getSavedH2HMatches().find(function(item) { return item.opponentName === 'Mike'; }); " +
                "return round.type === 'scorecard' && " +
                    "round.linkedH2HMatchId === match.id && " +
                    "round.holesPlayed === 9 && round.hciUsed === 25.6 && " +
                    "round.totalScore === 44 && round.totalPar === 35 && round.toPar === 9 && " +
                    "round.holes.every(function(hole) { " +
                        "return hole.score !== null && !('opponentGross' in hole) && !('opponentScore' in hole); " +
                    "}) && JSON.stringify(round).indexOf('Mike') === -1; " +
            "})()"
        ),
        "H2H save: G-Well scorecard record uses the normal round shape without opponent data"
    );
    assert(
        evaluate(
            "(function() { " +
                "var match = getSavedH2HMatches().find(function(item) { return item.opponentName === 'Mike'; }); " +
                "var hole6 = match.holes.find(function(hole) { return hole.holeNumber === 6; }); " +
                "var hole9 = match.holes.find(function(hole) { return hole.holeNumber === 9; }); " +
                "return match.type === 'h2h-match' && match.playerName === 'G-Well' && " +
                    "match.playerHci === 25.6 && match.playerPlayingHandicap === 16 && " +
                    "match.opponentName === 'Mike' && match.opponentHci === 7.4 && " +
                    "match.opponentPlayingHandicap === 5 && match.matchStrokeDifference === 11 && " +
                    "match.strokeReceiver === 'player' && match.playerTotalGross === 44 && " +
                    "match.opponentTotalGross === 35 && match.matchScore === 2 && " +
                    "match.finalMatchStatus === 'G-Well 2 Up' && match.result === 'win' && " +
                    "match.holes.length === 9 && hole6.playerStrokes === 2 && " +
                    "hole9.playerStrokes === 2 && hole6.holeResult === 'win' && " +
                    "hole9.matchStatusAfterHole === 'G-Well 2 Up'; " +
            "})()"
        ),
        "H2H save: separate match record contains handicaps, totals, result, and hole history"
    );
    assert(
        harness.alerts.length === alertCountBeforeCompletedH2HSave + 1 &&
        harness.alerts[harness.alerts.length - 1] ===
            "Match saved. Your round was added to Recent Rounds, and the H2H match was saved as Versus Mike.",
        "H2H save: confirmation identifies both saved records and the opponent"
    );

    const recentRoundCards = harness.document.getElementById("recentRoundsList").children;
    const recentRoundCardHtml = recentRoundCards.map(function(wrapper) {
        return wrapper.children[1].innerHTML;
    }).join(" ");
    assert(
        recentRoundCards.length === 4 &&
        recentRoundCardHtml.includes("H2H Match") &&
        recentRoundCardHtml.includes("Versus Mike") &&
        recentRoundCardHtml.includes("Result: Win — G-Well 2 Up") &&
        recentRoundCardHtml.includes("Score: G-Well 44 | Mike 35"),
        "Recent Rounds: normal rounds and the separate H2H match card are both rendered"
    );

    evaluate("showStats()");
    assert(
        harness.document.getElementById("h2hStatsWins").textContent === 1 &&
        harness.document.getElementById("h2hStatsLosses").textContent === 1 &&
        harness.document.getElementById("h2hStatsTies").textContent === 0,
        "H2H stats: record is calculated only from saved H2H match results"
    );
    assert(
        harness.document.getElementById("holeAverageStatsList").children[0]
            .innerHTML.includes("2 rounds"),
        "Stats: H2H scorecard feeds regular stats once without counting the match record"
    );

    evaluate("showH2HModePicker(); openH2HHoleByHole()");
    harness.document.getElementById("h2hPlayerHci").value = "25.6";
    harness.document.getElementById("h2hOpponentHci").value = "7.4";
    evaluate("startH2HHoleByHole(18)");
    assert(
        evaluate("h2hMatch.holes.length === 18") &&
        harness.document.getElementById("h2hMatchGrid").children.length === 18,
        "H2H: 18-hole match scorecard starts"
    );
    assert(
        evaluate(
            "getH2HPlayingHandicap(25.6, 18) === 33 && " +
            "getH2HPlayingHandicap(7.4, 18) === 10 && " +
            "getH2HMatchPlayingHandicaps().difference === 23 && " +
            "h2hMatch.holes.every(function(hole) { " +
                "var strokes = getH2HMatchPlayStrokesForHole(hole); " +
                "return strokes.player2 === 0 && " +
                    "strokes.player1 === (hole.hcp <= 5 ? 2 : 1); " +
            "})"
        ),
        "H2H WHS: 18-hole Playing Handicaps and 23-stroke allocation use White/Blue tee data"
    );

    evaluate("showH2HModePicker(); openH2HCompare()");
    assert(
        harness.document.getElementById("h2hComparePanel").style.display === "block",
        "Smoke: Compare Gross and Net Scores opens"
    );

    harness.document.getElementById("playerTwoNameInput").value = "Opponent";
    harness.document.getElementById("playerTwoHciInput").value = "10";
    harness.document.getElementById("playerOneGrossInput").value = "90";
    harness.document.getElementById("playerTwoGrossInput").value = "85";
    harness.document.getElementById("headToHeadHoleCount").value = "18";
    evaluate("calculateHeadToHead()");
    assert(
        !harness.document.getElementById("headToHeadResult").classList.contains("hidden"),
        "Smoke: gross/net comparison calculates"
    );

    evaluate("updateHci()");
    assert(
        JSON.parse(storage.get("gstPlayerProfile")).hci === 18.2 &&
        harness.document.getElementById("hciDisplay").textContent === "18.2",
        "Smoke: HCI tile works"
    );

    assert(evaluate("getStrokesForHole(1, 37) === 3"), "Regression: handicap stroke allocation");

    const refreshedHarness = createAppHarness(indexHtml, scriptSources, storage);
    assert(
        refreshedHarness.evaluate(
            "getSavedRounds().length === 2 && getSavedH2HMatches().length === 2 && " +
            "playerProfile.hci === 18.2"
        ),
        "Smoke: refresh preserves saved data"
    );
}

function getContentType(filePath) {
    const extension = path.extname(filePath).toLowerCase();
    const types = {
        ".css": "text/css",
        ".html": "text/html",
        ".js": "text/javascript",
        ".png": "image/png"
    };

    return types[extension] || "application/octet-stream";
}

function createStaticServer() {
    return http.createServer(function(request, response) {
        let requestPath;

        try {
            requestPath = decodeURIComponent(new URL(request.url, "http://127.0.0.1").pathname);
        } catch (error) {
            response.writeHead(400);
            response.end("Bad request");
            return;
        }

        const relativeRequestPath = requestPath === "/"
            ? "index.html"
            : requestPath.replace(/^\/+/, "");
        const filePath = path.resolve(ROOT, relativeRequestPath);
        const staysInsideRoot = filePath.startsWith(`${ROOT}${path.sep}`);

        if (!staysInsideRoot || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
            response.writeHead(404);
            response.end("Not found");
            return;
        }

        response.writeHead(200, {
            "Content-Type": getContentType(filePath)
        });
        fs.createReadStream(filePath).pipe(response);
    });
}

function requestStatus(port, relativeFilePath) {
    return new Promise(function(resolve, reject) {
        const request = http.get({
            host: "127.0.0.1",
            path: `/${relativeFilePath.split(path.sep).join("/")}`,
            port
        }, function(response) {
            response.resume();
            response.on("end", function() {
                resolve(response.statusCode);
            });
        });

        request.on("error", reject);
    });
}

async function verifyHttpAssets(assetReferences) {
    const server = createStaticServer();

    await new Promise(function(resolve, reject) {
        server.once("error", reject);
        server.listen(0, "127.0.0.1", resolve);
    });

    try {
        const address = server.address();
        const servedPaths = Array.from(new Set(["index.html", ...assetReferences]));

        for (const servedPath of servedPaths) {
            const status = await requestStatus(address.port, servedPath);

            assert(status === 200, `HTTP 200: ${servedPath}`);
        }
    } finally {
        await new Promise(resolve => server.close(resolve));
    }
}

async function main() {
    console.log("Golf Shot Tracker verification\n");

    const indexHtml = fs.readFileSync(INDEX_PATH, "utf8");

    verifyJavaScriptSyntax();

    const indexVerification = verifyIndexStructure(indexHtml);

    verifyGlobalHandlers(indexHtml, indexVerification.scriptSources);
    verifyValidStorageStartup(indexHtml, indexVerification.scriptSources);
    verifyMalformedStorageStartup(indexHtml, indexVerification.scriptSources);
    verifyLegacyScorecardMigration(indexHtml, indexVerification.scriptSources);
    verifyCoreDomSmoke(indexHtml, indexVerification.scriptSources);
    await verifyHttpAssets(indexVerification.assetReferences);

    console.log(`\nVerification complete: ${passedChecks} checks passed.`);
}

main().catch(function(error) {
    console.error(`\nFAIL ${error.message}`);
    process.exitCode = 1;
});
