// ============================================================
// Course data
// ============================================================

const courses = {
    whitinsville: {
        id: "whitinsville",
        name: "Whitinsville Golf Club",
        defaultCourse: true,
        h2hTeeData: {
            9: {
                rating: 35.2,
                slope: 137,
                par: 35
            },
            18: {
                rating: 71.2,
                slope: 139,
                par: 70
            }
        },

whiteTees: [
    { hole: 1, par: 5, yards: 501, tee: "White/Blue", handicap: 8 },
    { hole: 2, par: 3, yards: 140, tee: "White/Blue", handicap: 16 },
    { hole: 3, par: 4, yards: 342, tee: "White/Blue", handicap: 10 },
    { hole: 4, par: 4, yards: 350, tee: "White/Blue", handicap: 14 },
    { hole: 5, par: 4, yards: 404, tee: "White/Blue", handicap: 6 },
    { hole: 6, par: 4, yards: 380, tee: "White/Blue", handicap: 4 },
    { hole: 7, par: 3, yards: 159, tee: "White/Blue", handicap: 18 },
    { hole: 8, par: 4, yards: 318, tee: "White/Blue", handicap: 12 },
    { hole: 9, par: 4, yards: 418, tee: "White/Blue", handicap: 2 }
],

blueTees: [
    { hole: 10, par: 5, yards: 550, tee: "White/Blue", handicap: 7 },
    { hole: 11, par: 3, yards: 147, tee: "White/Blue", handicap: 15 },
    { hole: 12, par: 4, yards: 359, tee: "White/Blue", handicap: 9 },
    { hole: 13, par: 4, yards: 367, tee: "White/Blue", handicap: 13 },
    { hole: 14, par: 4, yards: 425, tee: "White/Blue", handicap: 5 },
    { hole: 15, par: 4, yards: 393, tee: "White/Blue", handicap: 3 },
    { hole: 16, par: 3, yards: 175, tee: "White/Blue", handicap: 17 },
    { hole: 17, par: 4, yards: 330, tee: "White/Blue", handicap: 11 },
    { hole: 18, par: 4, yards: 434, tee: "White/Blue", handicap: 1 }
]
    }
};

// ============================================================
// Shot-tracking round and hole flow
// ============================================================

function updateHoleDisplay(shouldPersist) {
    document.getElementById("currentHole").textContent = currentHole;
    document.getElementById("summaryHole").textContent = currentHole;

    if (shouldPersist !== false && currentRound) {
        persistShotTrackingActiveSession(true);
    }
}

function saveHole() {

    const par =
        document.getElementById("parInput").value;

    const score =
        document.getElementById("scoreInput").value;

    if (!par || !score) {
        alert("Enter par and score.");
        return;
    }

    holes = holes.filter(function(hole) {
        return !(
            hole.roundId === currentRound.id &&
            hole.hole === currentHole
        );
    });

    const holeRecord = {
        roundId: currentRound.id,
        hole: currentHole,
        par: Number(par),
        score: Number(score)
    };

    holes.push(holeRecord);
    persistShotTrackingActiveSession(true);

renderScorecard();

alert(
    "Hole " +
    currentHole +
    " score saved."
);
}

function renderScorecard() {

    const scorecardList =
        document.getElementById("scorecardList");

    scorecardList.innerHTML = "";

    let totalPar = 0;
    let totalScore = 0;

    if (!currentRound) {
        return;
    }

    const currentRoundHoles =
        holes.filter(function(hole) {
            return hole.roundId === currentRound.id;
        });

    currentRoundHoles
        .sort(function(a, b) {
            return a.hole - b.hole;
        })
        .forEach(function(hole) {

            totalPar += hole.par;
            totalScore += hole.score;

            const difference =
                hole.score - hole.par;

            let status = "E";

            if (difference > 0) {
                status = "+" + difference;
            }

            if (difference < 0) {
                status = difference;
            }

            const item =
                document.createElement("div");

            item.className = "scorecard-item";

            item.textContent =
                "Hole " +
                hole.hole +
                " | Par " +
                hole.par +
                " | Score " +
                hole.score +
                " | " +
                status;

            scorecardList.appendChild(item);

        });

    const roundDifference =
        totalScore - totalPar;

    let roundStatus = "E";

    if (roundDifference > 0) {
        roundStatus = "+" + roundDifference;
    }

    if (roundDifference < 0) {
        roundStatus = roundDifference;
    }

    document.getElementById("totalPar").textContent =
        totalPar;

    document.getElementById("totalScore").textContent =
        totalScore;

    document.getElementById("roundStatus").textContent =
        roundStatus;
}

function saveRound() {
    return guardNewActiveSession(
        "Shot Tracking",
        beginShotTrackingRound
    );
}

function beginShotTrackingRound() {

    const course =
        document.getElementById("courseInput").value;

    const date =
        document.getElementById("dateInput").value;

    if (!course || !date) {
        alert("Enter course and date.");
        return;
    }


    currentRound = {
        id: Date.now(),
        course: course,
        date: date,
        courseId: selectedCourseId,
        tee: null,
        holeCount: 18
    };

    currentHole = 1;

    document.getElementById("roundTitle").textContent =
        course + " - " + date;

    persistShotTrackingActiveSession(true);
    updateHoleDisplay(false);
    updateSummary();
    showShotTrackingRoundScreen();
}

function deleteRound(roundId) {
    const confirmed = confirm("Delete this round? This cannot be undone.");

    if (!confirmed) {
        return;
    }

    let savedRounds = getSavedRounds();

    savedRounds = savedRounds.filter(round => round.id !== roundId);

    saveSavedRounds(savedRounds);

    showRecentRounds();
}

function saveShot() {

    if (!currentRound) {
        alert("Start a round first.");
        return;
    }

    const club =
        document.getElementById("clubInput").value;

    const clubSelect =
        document.getElementById("clubInput");

    const loft =
        clubSelect.options[
            clubSelect.selectedIndex
        ].dataset.loft;

    const distance =
        document.getElementById("distanceInput").value;
        
    const result =
        document.getElementById("resultInput").value;
        
    const lie =
        document.getElementById("lieInput").value;

const holeShots =
    shots.filter(
        s => s.hole === currentHole &&
        s.roundId === currentRound.id
    );

const shotNumber =
    holeShots.length + 1;

    if (!club || !distance) {
        alert("Enter club and distance.");
        return;
    }

const shot = {
    roundId: currentRound.id,
    course: currentRound.course,
    roundDate: currentRound.date,
    hole: currentHole,
    club: club,
    loft: loft,
    distance: Number(distance),
    result: result,
    lie: lie,
    shotNumber: shotNumber,
    timestamp: new Date().toISOString()
};

    console.log(shot);

    shots.push(shot);
    persistShotTrackingActiveSession(true);

    document.getElementById("clubInput").value = "";
    document.getElementById("distanceInput").value = "";

    renderShots();
    updateSummary();
}

function updateSummary() {

    document.getElementById("summaryHole").textContent =
        currentHole;

    document.getElementById("summaryShots").textContent =
        shots.length;

    if (currentRound) {
        document.getElementById("summaryCourse").textContent =
            currentRound.course;

        document.getElementById("summaryDate").textContent =
            currentRound.date;
    }
}

function nextHole() {
    if (currentHole < 18) {
        currentHole++;
        updateHoleDisplay();
    } else {
        alert("You are already on Hole 18.");
    }
}

function previousHole() {
    if (currentHole > 1) {
        currentHole--;
        updateHoleDisplay();
    } else {
        alert("You are already on Hole 1.");
    }
}

function renderShots() {

    const shotList =
        document.getElementById("shotList");

    shotList.innerHTML = "";

    if (!currentRound) {
        shotList.textContent = "No round started.";
        return;
    }

    const currentRoundShots =
        shots.filter(function(shot) {
            return shot.roundId === currentRound.id;
        });

    if (currentRoundShots.length === 0) {
        shotList.textContent = "No shots recorded yet.";
        return;
    }

    const groupedShots = {};

    currentRoundShots.forEach(function(shot) {

        if (!groupedShots[shot.hole]) {
            groupedShots[shot.hole] = [];
        }

        groupedShots[shot.hole].push(shot);

    });

    Object.keys(groupedShots)
        .sort(function(a, b) {
            return Number(a) - Number(b);
        })
        .forEach(function(holeNumber) {

            const holeHeader =
                document.createElement("h3");

            holeHeader.textContent =
                "Hole " + holeNumber;

            shotList.appendChild(holeHeader);

            groupedShots[holeNumber]
                .sort(function(a, b) {
                    return a.shotNumber - b.shotNumber;
                })
                .forEach(function(shot) {

                    const item =
                        document.createElement("div");

                    item.className = "shot-item";

                    item.textContent =
                        "Shot " +
                        shot.shotNumber +
                        " | " +
                        shot.club +
                        " | " +
                        shot.distance +
                        " yds | " +
                        shot.result +
                        " | " +
                        shot.lie;

                    shotList.appendChild(item);

                });

        });
}

function goHome() {
    hideAllScreens();

    setElementDisplay("homeCard", "block");
    updateContinueRoundDisplay();
}

// ============================================================
// Verified active-session persistence and recovery
// ============================================================

function getActiveSessionModeLabel(mode) {
    const labels = {
        scorecard: "Regular Scorecard",
        h2h: "Head-to-Head",
        shotTracking: "Shot Tracking"
    };

    return labels[mode] || "Golf Round";
}

function getActiveSessionTeeLabel(mode, holeCount) {
    if (mode === "shotTracking") {
        return null;
    }

    return Number(holeCount) === 9
        ? "White"
        : "Front 9 White / Back 9 Blue";
}

function setSaveStatus(status, message) {
    const statusElement = document.getElementById("saveStatus");

    if (!statusElement) {
        return;
    }

    const messages = {
        hidden: "",
        saving: "Saving…",
        saved: "Saved",
        failed: "Save Failed — latest change is not safely stored",
        restored: "Restored from Backup"
    };

    statusElement.className = `save-status save-status-${status}`;
    statusElement.textContent = message || messages[status] || status;
    statusElement.classList.toggle("hidden", status === "hidden");
}

function updateContinueRoundDisplay() {
    const summary = document.getElementById("continueRoundSummary");
    const lastSaved = document.getElementById("continueRoundLastSaved");
    const notice = document.getElementById("activeSessionNotice");

    if (!summary || !lastSaved || !notice) {
        return;
    }

    if (!activeSession) {
        summary.textContent = "No active round";
        lastSaved.textContent = "";
        notice.textContent = activeSessionRecoveryNotice;
        notice.classList.toggle(
            "hidden",
            activeSessionRecoveryNotice.length === 0
        );
        setSaveStatus("hidden");
        return;
    }

    summary.textContent =
        `${getActiveSessionModeLabel(activeSession.mode)} • ` +
        `${activeSession.course.name} • ${activeSession.holeCount} holes • ` +
        `Hole ${activeSession.currentHole}`;
    lastSaved.textContent =
        `Last saved ${new Date(activeSession.updatedAt).toLocaleTimeString()}`;
    notice.textContent = activeSessionRecoveryNotice;
    notice.classList.toggle(
        "hidden",
        activeSessionRecoveryNotice.length === 0
    );
}

function createActiveSessionBase(
    mode,
    holeCount,
    currentActiveHole,
    course,
    player,
    shouldTouch
) {
    const existing = activeSession && activeSession.mode === mode
        ? activeSession
        : null;
    const now = new Date().toISOString();

    return {
        schemaVersion: 2,
        id: existing?.id || generateActiveSessionId(),
        mode,
        status: "active",
        createdAt: existing?.createdAt || now,
        updatedAt: shouldTouch === false && existing?.updatedAt
            ? existing.updatedAt
            : now,
        course: {
            id: course.id || "whitinsville",
            name: course.name || "Whitinsville Golf Club",
            tee: course.tee === undefined ? null : course.tee
        },
        holeCount,
        currentHole: Math.min(
            Math.max(Number(currentActiveHole) || 1, 1),
            holeCount
        ),
        player: {
            name: player.name || "G-Well",
            hci: Number.isFinite(player.hci) ? player.hci : null
        },
        state: {}
    };
}

function buildScorecardActiveSession(shouldTouch) {
    if (!activeScorecardRound || simpleScorecard.length === 0) {
        return null;
    }

    const courseId = activeScorecardRound.courseId || selectedCourseId;
    const course = courses[courseId] || courses.whitinsville;
    const holeCount = simpleScorecard.length;
    const session = createActiveSessionBase(
        "scorecard",
        holeCount,
        activeScorecardRound.currentHole,
        {
            id: course.id,
            name: course.name,
            tee: getActiveSessionTeeLabel("scorecard", holeCount)
        },
        {
            name: playerProfile.name,
            hci: activeScorecardRound.hciUsed
        },
        shouldTouch
    );

    session.state = {
        screen: "scorecardScreen",
        hciUsed: activeScorecardRound.hciUsed,
        holes: cloneJsonValue(simpleScorecard)
    };

    return session;
}

function buildH2HActiveSession(shouldTouch) {
    if (!h2hMatch) {
        return null;
    }

    const courseId = h2hMatch.courseId || selectedCourseId;
    const course = courses[courseId] || courses.whitinsville;
    const player = h2hMatch.players[0];
    const session = createActiveSessionBase(
        "h2h",
        h2hMatch.holeCount,
        h2hMatch.currentHole,
        {
            id: course.id,
            name: h2hMatch.courseName || course.name,
            tee: getActiveSessionTeeLabel("h2h", h2hMatch.holeCount)
        },
        player,
        shouldTouch
    );

    session.state = {
        screen: "h2hMatchScreen",
        match: cloneJsonValue(h2hMatch),
        matchScore: getH2HMatchScore(),
        matchStatus: getH2HMatchPlayStatus(
            h2hMatch.holeCount - 1
        )
    };

    return session;
}

function buildShotTrackingActiveSession(shouldTouch) {
    if (!currentRound) {
        return null;
    }

    const course = courses[selectedCourseId] || courses.whitinsville;
    const roundShots = shots.filter(function(shot) {
        return shot.roundId === currentRound.id;
    });
    const roundHoles = holes.filter(function(hole) {
        return hole.roundId === currentRound.id;
    });
    const session = createActiveSessionBase(
        "shotTracking",
        Number(currentRound.holeCount) === 9 ? 9 : 18,
        currentHole,
        {
            id: currentRound.courseId || course.id,
            name: currentRound.course || course.name,
            tee: currentRound.tee || null
        },
        playerProfile,
        shouldTouch
    );

    session.state = {
        screen: "shotTrackerCard",
        round: cloneJsonValue(currentRound),
        shots: cloneJsonValue(roundShots),
        holes: cloneJsonValue(roundHoles)
    };

    return session;
}

function persistActiveSessionCandidate(candidate, restoredFromBackup) {
    if (!candidate) {
        return false;
    }

    activeSession = candidate;
    setSaveStatus("saving");

    const result = saveVerifiedActiveSession(candidate);

    if (!result.ok) {
        setSaveStatus("failed");
        updateContinueRoundDisplay();

        if (!saveFailureAlertShown) {
            alert(
                "Save Failed. GST kept the round open, but the latest " +
                "change is not safely stored. Keep GST open and retry."
            );
            saveFailureAlertShown = true;
        }

        return false;
    }

    activeSession = result.value;
    saveFailureAlertShown = false;
    setSaveStatus(restoredFromBackup ? "restored" : "saved");
    updateContinueRoundDisplay();
    return true;
}

function writeLegacyJson(key, value, validator) {
    if (!preserveInvalidJsonBeforeWrite(key, validator)) {
        console.warn(
            `Legacy key "${key}" was not overwritten because its invalid raw value could not be archived.`
        );
        return false;
    }

    try {
        localStorage.setItem(key, JSON.stringify(value));

        const verification = readStoredJsonResult(key);

        return verification.valid && validator(verification.value);
    } catch (error) {
        console.warn(`Could not mirror active data to "${key}":`, error);
        return false;
    }
}

function mirrorScorecardLegacyState() {
    if (!activeSession || activeSession.mode !== "scorecard") {
        return;
    }

    activeScorecardRound.version = 1;
    activeScorecardRound.sessionId = activeSession.id;
    activeScorecardRound.createdAt = activeSession.createdAt;
    activeScorecardRound.updatedAt = activeSession.updatedAt;

    writeLegacyJson(
        ACTIVE_SCORECARD_KEY,
        activeScorecardRound,
        isValidActiveScorecardRound
    );
    writeLegacyJson(
        "simpleScorecard",
        simpleScorecard,
        Array.isArray
    );

    try {
        localStorage.setItem(
            "scorecardHoleCount",
            activeScorecardRound.holeCount
        );
        localStorage.setItem("roundMode", "scorecard");
    } catch (error) {
        console.warn("Could not mirror legacy scorecard metadata:", error);
    }
}

function mirrorH2HLegacyState() {
    if (!activeSession || activeSession.mode !== "h2h" || !h2hMatch) {
        return;
    }

    h2hMatch.schemaVersion = 1;
    h2hMatch.sessionId = activeSession.id;
    h2hMatch.createdAt = activeSession.createdAt;
    h2hMatch.updatedAt = activeSession.updatedAt;

    writeLegacyJson(
        "gstH2HMatch",
        h2hMatch,
        function(value) {
            return isValidActiveH2HMatch(
                value,
                Number(value?.holeCount)
            );
        }
    );
}

function mirrorShotTrackingLegacyState() {
    if (
        !activeSession ||
        activeSession.mode !== "shotTracking" ||
        !currentRound
    ) {
        return;
    }

    currentRound.schemaVersion = 1;
    currentRound.sessionId = activeSession.id;
    currentRound.createdAt = activeSession.createdAt;
    currentRound.updatedAt = activeSession.updatedAt;
    currentRound.holeCount = activeSession.holeCount;
    currentRound.courseId = activeSession.course.id;
    currentRound.tee = activeSession.course.tee;

    writeLegacyJson(
        "currentRound",
        currentRound,
        isPlainObject
    );
    writeLegacyJson("shots", shots, Array.isArray);
    writeLegacyJson("holes", holes, Array.isArray);

    try {
        localStorage.setItem("currentHole", currentHole);
        localStorage.setItem("roundMode", "shotTracking");
    } catch (error) {
        console.warn("Could not mirror legacy Shot Tracking metadata:", error);
    }
}

function persistScorecardActiveSession(shouldTouch) {
    const saved = persistActiveSessionCandidate(
        buildScorecardActiveSession(shouldTouch),
        false
    );

    if (saved) {
        mirrorScorecardLegacyState();
    }

    return saved;
}

function persistH2HActiveSession(shouldTouch) {
    const saved = persistActiveSessionCandidate(
        buildH2HActiveSession(shouldTouch),
        false
    );

    if (saved) {
        mirrorH2HLegacyState();
    }

    return saved;
}

function persistShotTrackingActiveSession(shouldTouch) {
    const saved = persistActiveSessionCandidate(
        buildShotTrackingActiveSession(shouldTouch),
        false
    );

    if (saved) {
        mirrorShotTrackingLegacyState();
    }

    return saved;
}

function getLegacySessionTimestamp(value) {
    if (isValidIsoTimestamp(value?.updatedAt)) {
        return value.updatedAt;
    }

    if (
        Number.isFinite(value?.id) &&
        value.id > 1000000000000 &&
        value.id < 9999999999999
    ) {
        return new Date(value.id).toISOString();
    }

    return new Date(0).toISOString();
}

function migrateLegacyScorecardSession(legacyRound) {
    const courseId = courses[legacyRound.courseId]
        ? legacyRound.courseId
        : "whitinsville";
    const course = courses[courseId];
    const timestamp = getLegacySessionTimestamp(legacyRound);

    return {
        schemaVersion: 2,
        id: typeof legacyRound.sessionId === "string"
            ? legacyRound.sessionId
            : generateActiveSessionId(),
        mode: "scorecard",
        status: "active",
        createdAt: isValidIsoTimestamp(legacyRound.createdAt)
            ? legacyRound.createdAt
            : timestamp,
        updatedAt: timestamp,
        course: {
            id: courseId,
            name: course.name,
            tee: getActiveSessionTeeLabel(
                "scorecard",
                legacyRound.holeCount
            )
        },
        holeCount: legacyRound.holeCount,
        currentHole: legacyRound.currentHole,
        player: {
            name: playerProfile.name || "G-Well",
            hci: legacyRound.hciUsed
        },
        state: {
            screen: "scorecardScreen",
            hciUsed: legacyRound.hciUsed,
            holes: cloneJsonValue(legacyRound.holes)
        }
    };
}

function migrateLegacyH2HSession(legacyMatch) {
    const courseId = courses[legacyMatch.courseId]
        ? legacyMatch.courseId
        : "whitinsville";
    const course = courses[courseId];
    const timestamp = getLegacySessionTimestamp(legacyMatch);

    return {
        schemaVersion: 2,
        id: typeof legacyMatch.sessionId === "string"
            ? legacyMatch.sessionId
            : generateActiveSessionId(),
        mode: "h2h",
        status: "active",
        createdAt: isValidIsoTimestamp(legacyMatch.createdAt)
            ? legacyMatch.createdAt
            : timestamp,
        updatedAt: timestamp,
        course: {
            id: courseId,
            name: legacyMatch.courseName || course.name,
            tee: getActiveSessionTeeLabel(
                "h2h",
                legacyMatch.holeCount
            )
        },
        holeCount: legacyMatch.holeCount,
        currentHole: legacyMatch.currentHole,
        player: {
            name: legacyMatch.players[0].name,
            hci: legacyMatch.players[0].hci
        },
        state: {
            screen: "h2hMatchScreen",
            match: cloneJsonValue(legacyMatch),
            matchScore: 0,
            matchStatus: "All Square"
        }
    };
}

function migrateLegacyShotTrackingSession(
    legacyRound,
    legacyShots,
    legacyHoles
) {
    const course = courses[legacyRound.courseId] ||
        courses[selectedCourseId] ||
        courses.whitinsville;
    const roundShots = legacyShots.filter(function(shot) {
        return shot.roundId === legacyRound.id;
    });
    const roundHoles = legacyHoles.filter(function(hole) {
        return hole.roundId === legacyRound.id;
    });
    const timestamp = getLegacySessionTimestamp(legacyRound);

    return {
        schemaVersion: 2,
        id: typeof legacyRound.sessionId === "string"
            ? legacyRound.sessionId
            : generateActiveSessionId(),
        mode: "shotTracking",
        status: "active",
        createdAt: isValidIsoTimestamp(legacyRound.createdAt)
            ? legacyRound.createdAt
            : timestamp,
        updatedAt: timestamp,
        course: {
            id: legacyRound.courseId || course.id,
            name: legacyRound.course || course.name,
            tee: legacyRound.tee || null
        },
        holeCount: Number(legacyRound.holeCount) === 9 ? 9 : 18,
        currentHole: Math.min(
            Math.max(Number(localStorage.getItem("currentHole")) || 1, 1),
            Number(legacyRound.holeCount) === 9 ? 9 : 18
        ),
        player: {
            name: playerProfile.name || "G-Well",
            hci: Number.isFinite(playerProfile.hci)
                ? playerProfile.hci
                : null
        },
        state: {
            screen: "shotTrackerCard",
            round: cloneJsonValue(legacyRound),
            shots: cloneJsonValue(roundShots),
            holes: cloneJsonValue(roundHoles)
        }
    };
}

function addDistinctActiveSessionCandidate(
    candidates,
    session,
    sourceKey
) {
    if (!isValidActiveSessionSnapshot(session)) {
        return;
    }

    const existingIndex = candidates.findIndex(function(candidate) {
        return candidate.session.id === session.id;
    });
    const wrappedCandidate = { session, sourceKey };

    if (existingIndex === -1) {
        candidates.push(wrappedCandidate);
        return;
    }

    if (
        Date.parse(session.updatedAt) >
        Date.parse(candidates[existingIndex].session.updatedAt)
    ) {
        candidates[existingIndex] = wrappedCandidate;
    }
}

function collectRecoverableActiveSessions() {
    const candidates = [];
    const activeResult = readStoredJsonResult(ACTIVE_SESSION_KEY);
    const previousResult =
        readStoredJsonResult(ACTIVE_SESSION_PREVIOUS_KEY);
    const activeCanonicalIsValid = activeResult.exists &&
        activeResult.valid &&
        isValidActiveSessionSnapshot(activeResult.value);
    const previousCanonicalIsValid = previousResult.exists &&
        previousResult.valid &&
        isValidActiveSessionSnapshot(previousResult.value);

    if (activeCanonicalIsValid) {
        addDistinctActiveSessionCandidate(
            candidates,
            activeResult.value,
            ACTIVE_SESSION_KEY
        );
    }

    if (previousCanonicalIsValid) {
        addDistinctActiveSessionCandidate(
            candidates,
            previousResult.value,
            ACTIVE_SESSION_PREVIOUS_KEY
        );
    }

    const canonicalModes = new Set(
        candidates.map(function(candidate) {
            return candidate.session.mode;
        })
    );

    if (!canonicalModes.has("scorecard")) {
        const scorecardResult =
            readStoredJsonResult(ACTIVE_SCORECARD_KEY);

        if (
            scorecardResult.exists &&
            scorecardResult.valid &&
            isValidActiveScorecardRound(scorecardResult.value)
        ) {
            addDistinctActiveSessionCandidate(
                candidates,
                migrateLegacyScorecardSession(scorecardResult.value),
                ACTIVE_SCORECARD_KEY
            );
        } else {
            const legacyScorecardResult =
                readStoredJsonResult("simpleScorecard");
            const legacyHoleCount =
                Number(localStorage.getItem("scorecardHoleCount")) ||
                (
                    Array.isArray(legacyScorecardResult.value)
                        ? legacyScorecardResult.value.length
                        : 0
                );
            const legacyRound = {
                version: 1,
                courseId: courses[selectedCourseId]
                    ? selectedCourseId
                    : "whitinsville",
                holeCount: legacyHoleCount,
                currentHole: Math.min(
                    Math.max(currentHole, 1),
                    legacyHoleCount
                ),
                hciUsed: playerProfile.hci,
                holes: legacyScorecardResult.value
            };

            if (
                legacyScorecardResult.exists &&
                legacyScorecardResult.valid &&
                isValidActiveScorecardRound(legacyRound)
            ) {
                addDistinctActiveSessionCandidate(
                    candidates,
                    migrateLegacyScorecardSession(legacyRound),
                    "simpleScorecard"
                );
            }
        }
    }

    if (!canonicalModes.has("h2h")) {
        const h2hResult = readStoredJsonResult("gstH2HMatch");

        if (
            h2hResult.exists &&
            h2hResult.valid &&
            isValidActiveH2HMatch(
                h2hResult.value,
                Number(h2hResult.value?.holeCount)
            )
        ) {
            addDistinctActiveSessionCandidate(
                candidates,
                migrateLegacyH2HSession(h2hResult.value),
                "gstH2HMatch"
            );
        }
    }

    if (!canonicalModes.has("shotTracking")) {
        const roundResult = readStoredJsonResult("currentRound");
        const shotsResult = readStoredJsonResult("shots");
        const holesResult = readStoredJsonResult("holes");

        if (
            roundResult.exists &&
            roundResult.valid &&
            isPlainObject(roundResult.value) &&
            shotsResult.valid &&
            Array.isArray(shotsResult.value || []) &&
            holesResult.valid &&
            Array.isArray(holesResult.value || [])
        ) {
            addDistinctActiveSessionCandidate(
                candidates,
                migrateLegacyShotTrackingSession(
                    roundResult.value,
                    shotsResult.value || [],
                    holesResult.value || []
                ),
                "currentRound"
            );
        }
    }

    candidates.sort(function(a, b) {
        return Date.parse(b.session.updatedAt) -
            Date.parse(a.session.updatedAt);
    });

    return {
        candidates,
        activeCanonicalIsInvalid:
            activeResult.exists && !activeCanonicalIsValid,
        previousCanonicalIsValid
    };
}

function applyActiveSessionToRuntime(session, showScreen) {
    if (!session) {
        return false;
    }

    selectedCourseId = courses[session.course.id]
        ? session.course.id
        : "whitinsville";

    if (session.mode === "scorecard") {
        activeScorecardRound = {
            version: 1,
            sessionId: session.id,
            createdAt: session.createdAt,
            updatedAt: session.updatedAt,
            courseId: selectedCourseId,
            holeCount: session.holeCount,
            currentHole: session.currentHole,
            hciUsed: session.state.hciUsed,
            holes: cloneJsonValue(session.state.holes)
        };
        simpleScorecard = activeScorecardRound.holes;

        if (showScreen) {
            showScorecardScreen();
            renderSimpleScorecard();
        }

        return true;
    }

    if (session.mode === "h2h") {
        h2hMatch = cloneJsonValue(session.state.match);
        h2hMatch.currentHole = session.currentHole;

        if (showScreen) {
            showH2HMatchScreen();
        }

        return true;
    }

    currentRound = cloneJsonValue(session.state.round);
    currentHole = session.currentHole;
    shots = shots.filter(function(shot) {
        return shot.roundId !== currentRound.id;
    }).concat(cloneJsonValue(session.state.shots));
    holes = holes.filter(function(hole) {
        return hole.roundId !== currentRound.id;
    }).concat(cloneJsonValue(session.state.holes));

    if (showScreen) {
        showShotTrackingRoundScreen();
    }

    return true;
}

function recoverActiveSessionState() {
    const recovery = collectRecoverableActiveSessions();

    activeSessionCandidates = recovery.candidates.map(function(candidate) {
        return candidate.session;
    });
    activeSessionRecoveryNotice = "";

    if (activeSessionCandidates.length === 0) {
        activeSession = null;

        if (recovery.activeCanonicalIsInvalid) {
            activeSessionRecoveryNotice =
                "Invalid active data was preserved for recovery; GST did not delete it.";
        }

        updateContinueRoundDisplay();
        return false;
    }

    const selectedCandidate = recovery.candidates[0];
    activeSession = cloneJsonValue(selectedCandidate.session);

    if (activeSessionCandidates.length > 1) {
        activeSessionRecoveryNotice =
            `${activeSessionCandidates.length} recoverable active sessions were found. ` +
            "GST selected the newest valid save and preserved the others.";
    }

    const restoredFromBackup =
        recovery.activeCanonicalIsInvalid &&
        selectedCandidate.sourceKey === ACTIVE_SESSION_PREVIOUS_KEY;
    const migratedLegacy =
        selectedCandidate.sourceKey !== ACTIVE_SESSION_KEY &&
        selectedCandidate.sourceKey !== ACTIVE_SESSION_PREVIOUS_KEY;

    if (migratedLegacy) {
        const now = new Date().toISOString();
        activeSession.createdAt =
            activeSession.createdAt === new Date(0).toISOString()
                ? now
                : activeSession.createdAt;
        activeSession.updatedAt = now;
    }

    if (restoredFromBackup || migratedLegacy) {
        const saved = persistActiveSessionCandidate(
            activeSession,
            restoredFromBackup
        );

        if (!saved) {
            activeSession = selectedCandidate.session;
        }

        if (restoredFromBackup) {
            activeSessionRecoveryNotice =
                "The newest save was invalid. GST restored the previous known-good snapshot.";
        }
    } else {
        setSaveStatus("saved");
    }

    applyActiveSessionToRuntime(activeSession, false);

    if (activeSession.mode === "scorecard") {
        mirrorScorecardLegacyState();
    }

    if (activeSession.mode === "h2h") {
        if (migratedLegacy) {
            persistH2HActiveSession(false);
        } else {
            mirrorH2HLegacyState();
        }
    }

    if (activeSession.mode === "shotTracking") {
        mirrorShotTrackingLegacyState();
    }

    updateContinueRoundDisplay();
    return true;
}

function showShotTrackingRoundScreen() {
    setElementDisplay("homeCard", "none");
    setElementDisplay("roundSetupCard", "none");
    setElementDisplay("shotTrackerCard", "block");
    setElementDisplay("summaryCard", "block");
    setElementDisplay("recentShotsCard", "block");
    setElementDisplay("scorecardCard", "block");

    updateHoleDisplay(false);
    renderShots();
    renderScorecard();
    updateSummary();
}

function continueActiveSession() {
    if (!activeSession && !recoverActiveSessionState()) {
        alert("No active round was found.");
        return false;
    }

    applyActiveSessionToRuntime(activeSession, true);
    return true;
}

function guardNewActiveSession(startLabel, startAction) {
    if (!activeSession) {
        startAction();
        return true;
    }

    pendingActiveSessionStart = startAction;

    const message = document.getElementById(
        "activeSessionConflictMessage"
    );

    if (message) {
        message.textContent =
            `${getActiveSessionModeLabel(activeSession.mode)} is still active. ` +
            `${startLabel} will not start unless the existing round is abandoned.`;
    }

    document.getElementById("activeSessionConflictPopup")
        .classList.remove("hidden");
    return false;
}

function closeActiveSessionConflictPopup() {
    const popup = document.getElementById("activeSessionConflictPopup");

    if (popup) {
        popup.classList.add("hidden");
    }
}

function continueExistingSessionFromConflict() {
    pendingActiveSessionStart = null;
    closeActiveSessionConflictPopup();
    continueActiveSession();
}

function cancelActiveSessionConflict() {
    pendingActiveSessionStart = null;
    closeActiveSessionConflictPopup();
}

function removeValidLegacyKey(key, validator, predicate) {
    const result = readStoredJsonResult(key);

    if (
        result.exists &&
        result.valid &&
        validator(result.value) &&
        (!predicate || predicate(result.value))
    ) {
        localStorage.removeItem(key);
    }
}

function clearModeSpecificActiveData(session, abandoned) {
    if (session.mode === "scorecard") {
        removeValidLegacyKey(
            ACTIVE_SCORECARD_KEY,
            isValidActiveScorecardRound,
            function(value) {
                return !value.sessionId || value.sessionId === session.id;
            }
        );
        removeValidLegacyKey(
            "simpleScorecard",
            Array.isArray
        );
        localStorage.removeItem("scorecardHoleCount");

        if (localStorage.getItem("roundMode") === "scorecard") {
            localStorage.removeItem("roundMode");
        }

        activeScorecardRound = null;
        simpleScorecard = [];
        return;
    }

    if (session.mode === "h2h") {
        removeValidLegacyKey(
            "gstH2HMatch",
            function(value) {
                return isValidActiveH2HMatch(
                    value,
                    Number(value?.holeCount)
                );
            },
            function(value) {
                return !value.sessionId || value.sessionId === session.id;
            }
        );
        h2hMatch = null;
        return;
    }

    const roundId = session.state.round.id;

    removeValidLegacyKey(
        "currentRound",
        isPlainObject,
        function(value) {
            return value.id === roundId;
        }
    );

    if (abandoned) {
        shots = shots.filter(function(shot) {
            return shot.roundId !== roundId;
        });
        holes = holes.filter(function(hole) {
            return hole.roundId !== roundId;
        });
        writeLegacyJson("shots", shots, Array.isArray);
        writeLegacyJson("holes", holes, Array.isArray);
    }

    if (localStorage.getItem("roundMode") === "shotTracking") {
        localStorage.removeItem("roundMode");
    }

    localStorage.removeItem("currentHole");
    currentRound = null;
    currentHole = 1;
}

function clearCurrentActiveSession(session, abandoned) {
    clearVerifiedActiveSession(session.id);
    clearModeSpecificActiveData(session, abandoned);
    activeSession = null;
    activeSessionCandidates = [];
    setSaveStatus("hidden");
    recoverActiveSessionState();
}

function abandonActiveSession(options) {
    if (!activeSession) {
        return false;
    }

    const confirmed = confirm(
        `Abandon the active ${getActiveSessionModeLabel(activeSession.mode)}? ` +
        "Its unsaved round progress will be removed."
    );

    if (!confirmed) {
        return false;
    }

    const sessionToAbandon = activeSession;
    clearCurrentActiveSession(sessionToAbandon, true);

    if (!options?.stayOnCurrentScreen) {
        goHome();
    }

    return true;
}

function abandonExistingSessionFromConflict() {
    const startAction = pendingActiveSessionStart;
    closeActiveSessionConflictPopup();

    if (!abandonActiveSession({ stayOnCurrentScreen: true })) {
        return;
    }

    pendingActiveSessionStart = null;

    if (startAction) {
        guardNewActiveSession("A new round", startAction);
    }
}

function flushActiveSession() {
    if (!activeSession) {
        return;
    }

    if (activeSession.mode === "scorecard") {
        persistScorecardActiveSession(false);
        return;
    }

    if (activeSession.mode === "h2h") {
        persistH2HActiveSession(false);
        return;
    }

    persistShotTrackingActiveSession(false);
}

function reconcileInterruptedActiveCompletion() {
    if (!activeSession) {
        return false;
    }

    const sessionToReconcile = activeSession;

    if (sessionToReconcile.mode === "scorecard") {
        const completedRecords = getSavedRounds().filter(function(round) {
            return round.id === sessionToReconcile.id;
        });

        if (completedRecords.length === 1) {
            clearCurrentActiveSession(sessionToReconcile, false);
            activeSessionRecoveryNotice =
                "GST verified a previously completed round and prevented a duplicate save.";
            updateContinueRoundDisplay();
            return true;
        }

        return false;
    }

    if (sessionToReconcile.mode === "h2h") {
        const linkedRounds = getSavedRounds().filter(function(round) {
            return round.id === sessionToReconcile.id &&
                round.source === "h2h-match";
        });
        const linkedMatches =
            getSavedH2HMatches().filter(function(match) {
                return match.id === sessionToReconcile.id;
            });

        if (
            linkedRounds.length === 1 &&
            linkedMatches.length === 1
        ) {
            clearCurrentActiveSession(sessionToReconcile, false);
            activeSessionRecoveryNotice =
                "GST verified a completed H2H pair and prevented duplicate records.";
            updateContinueRoundDisplay();
            return true;
        }

        if (
            linkedRounds.length <= 1 &&
            linkedMatches.length <= 1 &&
            (linkedRounds.length === 1 || linkedMatches.length === 1) &&
            isH2HMatchComplete()
        ) {
            const reconciled = completeH2HActiveSession(true);

            if (reconciled) {
                activeSessionRecoveryNotice =
                    "GST reconciled an interrupted H2H save and prevented duplicate records.";
                updateContinueRoundDisplay();
            }

            return reconciled;
        }

        return false;
    }

    const completedShotRounds =
        getSavedShotTrackingRounds().filter(function(round) {
            return round.id === sessionToReconcile.id;
        });

    if (completedShotRounds.length === 1) {
        clearCurrentActiveSession(sessionToReconcile, false);
        activeSessionRecoveryNotice =
            "GST verified a previously completed Shot Tracking round and prevented a duplicate save.";
        updateContinueRoundDisplay();
        return true;
    }

    return false;
}

if (currentRound) {

    document.getElementById("roundTitle").textContent =
        currentRound.course +
        " - " +
        currentRound.date;

}

// ============================================================
// Simple scorecard flow
// ============================================================

function startScorecardMode() {
    return guardNewActiveSession(
        "Regular Scorecard",
        beginScorecardMode
    );
}

function beginScorecardMode() {
    closeRoundModePopup();
    showHoleCountPopup();
}

function isValidScorecardHole(hole) {
    return Boolean(
        hole &&
        Number.isInteger(hole.hole) &&
        Number.isFinite(hole.par) &&
        (hole.score === null || Number.isFinite(hole.score))
    );
}

function isValidActiveScorecardRound(activeRound) {
    if (!activeRound || activeRound.version !== 1) {
        return false;
    }

    if (!courses[activeRound.courseId]) {
        return false;
    }

    if (activeRound.holeCount !== 9 && activeRound.holeCount !== 18) {
        return false;
    }

    if (
        !Number.isInteger(activeRound.currentHole) ||
        activeRound.currentHole < 1 ||
        activeRound.currentHole > activeRound.holeCount
    ) {
        return false;
    }

    if (
        activeRound.hciUsed !== null &&
        !Number.isFinite(activeRound.hciUsed)
    ) {
        return false;
    }

    return Boolean(
        Array.isArray(activeRound.holes) &&
        activeRound.holes.length === activeRound.holeCount &&
        activeRound.holes.every(isValidScorecardHole)
    );
}

function persistActiveScorecardProgress() {
    if (!activeScorecardRound || simpleScorecard.length === 0) {
        return false;
    }

    activeScorecardRound.courseId = selectedCourseId;
    activeScorecardRound.holeCount = simpleScorecard.length;
    activeScorecardRound.holes = simpleScorecard;

    return persistScorecardActiveSession(true);
}

function clearActiveScorecardProgress() {
    if (activeSession?.mode === "scorecard") {
        clearCurrentActiveSession(activeSession, false);
        return;
    }

    activeScorecardRound = null;
    simpleScorecard = [];
}

function applyActiveScorecardRound(activeRound) {
    activeScorecardRound = activeRound;
    simpleScorecard = activeRound.holes;
    selectedCourseId = activeRound.courseId;

    persistActiveScorecardProgress();
}

function restoreActiveScorecardProgress() {
    if (!activeSession) {
        recoverActiveSessionState();
    }

    if (activeSession?.mode !== "scorecard") {
        return false;
    }

    return applyActiveSessionToRuntime(activeSession, false);
}

function resumeActiveScorecardRound() {
    if (!activeScorecardRound && !restoreActiveScorecardProgress()) {
        return false;
    }

    showScorecardScreen();
    renderSimpleScorecard();
    return true;
}

function initializeScorecard(numberOfHoles) {
    const course =
        courses[selectedCourseId];

    simpleScorecard = [];

    if (numberOfHoles === 9) {
        simpleScorecard =
            course.whiteTees.map(function(hole) {
return {
    hole: hole.hole,
    par: hole.par,
    yards: hole.yards,
    tee: hole.tee,
    handicap: hole.handicap,
    score: null
};
            });
    }

    if (numberOfHoles === 18) {
        const frontNine =
            course.whiteTees.map(function(hole) {
return {
    hole: hole.hole,
    par: hole.par,
    yards: hole.yards,
    tee: hole.tee,
    handicap: hole.handicap,
    score: null
};
            });

const backNine =
    course.blueTees.map(function(hole) {
        return {
            hole: hole.hole,
            par: hole.par,
            yards: hole.yards,
            tee: hole.tee,
            handicap: hole.handicap,
            score: null
        };
    });

        simpleScorecard =
            frontNine.concat(backNine);
    }

    activeScorecardRound = {
        version: 1,
        courseId: selectedCourseId,
        holeCount: numberOfHoles,
        currentHole: 1,
        hciUsed: playerProfile.hci,
        holes: simpleScorecard
    };

    persistActiveScorecardProgress();
    renderSimpleScorecard();
}

function getDefaultPar(holeNumber) {
    // Temporary default setup
    // You can customize this later by course
    const defaultPars = [4, 4, 3, 5, 4, 4, 3, 5, 4, 4, 4, 3, 5, 4, 4, 3, 5, 4];

    return defaultPars[holeNumber - 1];
}

function showScorecardScreen() {
    hideAllScreens();

    setElementHidden("scorecardScreen", false);
}

function renderSimpleScorecard() {
    const grid = document.getElementById("scorecardGrid");
    grid.innerHTML = "";

    simpleScorecard.forEach((hole, index) => {
        const scoreDisplay = hole.score === null ? "-" : hole.score;

        const holeDiv = document.createElement("div");
        holeDiv.className = "scorecard-hole";

        if (activeScorecardRound?.currentHole === index + 1) {
            holeDiv.classList.add("active-hole");
        }

        const hciUsed = activeScorecardRound
            ? activeScorecardRound.hciUsed
            : playerProfile.hci;
        const strokeDots =
            getStrokeDots(hole.handicap, hciUsed);

        holeDiv.innerHTML = `
            <div class="hole-number">${hole.hole}</div>

            <div class="hole-details">
                <strong>Hole ${hole.hole}</strong>
<span>Par ${hole.par} • ${hole.yards || "-"} yds • HCP ${hole.handicap} ${strokeDots} | ${hole.tee || ""}</span>
            </div>

            <div class="score-controls">
                <button onclick="decreaseScore(${index})">−</button>
                <div class="score-value">${scoreDisplay}</div>
                <button onclick="increaseScore(${index})">+</button>
            </div>
        `;

        grid.appendChild(holeDiv);
    });

    updateScorecardSummary();
}

function increaseScore(index) {
    if (simpleScorecard[index].score === null) {
        simpleScorecard[index].score = simpleScorecard[index].par;
    } else {
        simpleScorecard[index].score++;
    }

    if (activeScorecardRound) {
        activeScorecardRound.currentHole = index + 1;
    }
    saveSimpleScorecardProgress();
    renderSimpleScorecard();
}

function decreaseScore(index) {
    if (activeScorecardRound) {
        activeScorecardRound.currentHole = index + 1;
    }

    if (simpleScorecard[index].score === null) {
        saveSimpleScorecardProgress();
        return;
    }

    simpleScorecard[index].score--;

    if (simpleScorecard[index].score < 1) {
        simpleScorecard[index].score = null;
    }

    saveSimpleScorecardProgress();
    renderSimpleScorecard();
}

function updateScorecardSummary() {
    const completedHoles = simpleScorecard.filter(hole => hole.score !== null);

    const totalScore = completedHoles.reduce((sum, hole) => sum + hole.score, 0);
    const totalPar = completedHoles.reduce((sum, hole) => sum + hole.par, 0);

    const toPar = totalScore - totalPar;

    document.getElementById("scorecardTotalScore").textContent = totalScore;

    let toParText = "E";

    if (completedHoles.length === 0) {
        toParText = "-";
    } else if (toPar > 0) {
        toParText = `+${toPar}`;
    } else if (toPar < 0) {
        toParText = `${toPar}`;
    }

    document.getElementById("scorecardToPar").textContent = toParText;
}

function saveSimpleScorecardProgress() {
    if (activeScorecardRound) {
        persistActiveScorecardProgress();
        return;
    }

    writeLegacyJson("simpleScorecard", simpleScorecard, Array.isArray);
}

function saveScorecardRound() {
    const incompleteHoles = simpleScorecard.filter(function(hole) {
        return hole.score === null || hole.score === undefined;
    });

    if (simpleScorecard.length === 0 || incompleteHoles.length > 0) {
        alert("Enter a score for every hole before saving the round.");
        return;
    }

    if (!activeSession || activeSession.mode !== "scorecard") {
        persistActiveScorecardProgress();
    }

    if (!activeSession || activeSession.mode !== "scorecard") {
        alert("The active scorecard could not be prepared for saving.");
        return;
    }

    const sessionToComplete = activeSession;
    const savedRounds = getSavedRounds();
    const scorecardCourseId = activeScorecardRound
        ? activeScorecardRound.courseId
        : selectedCourseId;
    const scorecardHciUsed = activeScorecardRound
        ? activeScorecardRound.hciUsed
        : playerProfile.hci;

    const round = {
        schemaVersion: 1,
        id: sessionToComplete.id,
        createdAt: sessionToComplete.createdAt,
        updatedAt: new Date().toISOString(),
        date: new Date().toLocaleDateString(),
        mode: "scorecard",
        courseId: scorecardCourseId,
        courseName: courses[scorecardCourseId].name,
        holesPlayed: simpleScorecard.length,
        hciUsed: scorecardHciUsed,
        holes: simpleScorecard,
        totalScore: simpleScorecard
            .filter(hole => hole.score !== null)
            .reduce((sum, hole) => sum + hole.score, 0)
    };

    const existingRecords = savedRounds.filter(function(savedRound) {
        return savedRound.id === sessionToComplete.id;
    });

    if (existingRecords.length > 1) {
        setSaveStatus("failed");
        alert(
            "Round completion stopped because duplicate historical records " +
            "already exist. The active round was preserved."
        );
        return;
    }

    try {
        if (existingRecords.length === 0) {
            saveSavedRounds(savedRounds.concat(round));
        }

        const verifiedRecords = getSavedRounds().filter(function(savedRound) {
            return savedRound.id === sessionToComplete.id;
        });

        if (verifiedRecords.length !== 1) {
            throw new Error(
                "Completed scorecard verification did not find exactly one record."
            );
        }
    } catch (error) {
        console.error("Could not complete the scorecard round:", error);
        setSaveStatus("failed");
        alert(
            "Save Failed. The completed round could not be verified, so the " +
            "active round was preserved."
        );
        return;
    }

    clearCurrentActiveSession(sessionToComplete, false);

    alert("Scorecard round saved.");

    goHome();
}

function abandonCurrentScorecardRound() {
    if (!activeScorecardRound || activeSession?.mode !== "scorecard") {
        goHome();
        return;
    }

    abandonActiveSession();
}

// ============================================================
// Past-round entry and saved-round history
// ============================================================

function showRecentRounds() {
    hideAllScreens();

    setElementHidden("recentRoundsScreen", false);

    renderRecentRounds();
}

function showPastRoundEntry() {
    hideAllScreens();

    setElementHidden("pastRoundScreen", false);

    document.getElementById("pastRoundDateInput").value = "";

    document.getElementById("pastRoundHciInput").value =
        playerProfile.hci !== null ? playerProfile.hci.toFixed(1) : "";

    pastRoundScorecard = [];

    document.getElementById("pastRoundGrid").innerHTML = "";
}

function setupPastRound(numberOfHoles) {
    const course =
        courses[selectedCourseId];

    pastRoundScorecard = [];

    if (numberOfHoles === 9) {
        pastRoundScorecard =
            course.whiteTees.map(function(hole) {
                return {
                    hole: hole.hole,
                    par: hole.par,
                    yards: hole.yards,
                    tee: hole.tee,
                    handicap: hole.handicap,
                    score: null
                };
            });
    }

    if (numberOfHoles === 18) {
        const frontNine =
            course.whiteTees.map(function(hole) {
                return {
                    hole: hole.hole,
                    par: hole.par,
                    yards: hole.yards,
                    tee: hole.tee,
                    handicap: hole.handicap,
                    score: null
                };
            });

        const backNine =
            course.blueTees.map(function(hole) {
                return {
                    hole: hole.hole,
                    par: hole.par,
                    yards: hole.yards,
                    tee: hole.tee,
                    handicap: hole.handicap,
                    score: null
                };
            });

        pastRoundScorecard =
            frontNine.concat(backNine);
    }

    renderPastRoundEntry();
}

function renderPastRoundEntry() {
    const grid =
        document.getElementById("pastRoundGrid");

    grid.innerHTML = "";

    pastRoundScorecard.forEach(function(hole, index) {
        const scoreDisplay =
            hole.score === null ? "-" : hole.score;

        const holeDiv =
            document.createElement("div");

        holeDiv.className = "scorecard-hole past-round-hole";

        holeDiv.innerHTML = `
            <div class="hole-number">${hole.hole}</div>

            <div class="hole-details">
                <strong>Hole ${hole.hole}</strong>
                <span>Par ${hole.par} • ${hole.yards || "-"} yds • HCP ${hole.handicap} | ${hole.tee || ""}</span>
            </div>

            <div class="score-controls">
                <button onclick="decreasePastRoundScore(${index})">−</button>
                <div class="score-value">${scoreDisplay}</div>
                <button onclick="increasePastRoundScore(${index})">+</button>
            </div>
        `;

        grid.appendChild(holeDiv);
    });
}

function increasePastRoundScore(index) {
    if (pastRoundScorecard[index].score === null) {
        pastRoundScorecard[index].score =
            pastRoundScorecard[index].par;
    } else {
        pastRoundScorecard[index].score++;
    }

    renderPastRoundEntry();
}

function decreasePastRoundScore(index) {
    if (pastRoundScorecard[index].score === null) {
        return;
    }

    pastRoundScorecard[index].score--;

    if (pastRoundScorecard[index].score < 1) {
        pastRoundScorecard[index].score = null;
    }

    renderPastRoundEntry();
}

function savePastRound() {
    const roundDate =
        document.getElementById("pastRoundDateInput").value;

    const hciUsed =
        parseFloat(document.getElementById("pastRoundHciInput").value);

    if (!roundDate) {
        alert("Enter the round date.");
        return;
    }

    if (pastRoundScorecard.length === 0) {
        alert("Choose 9 or 18 holes first.");
        return;
    }

    if (isNaN(hciUsed)) {
        alert("Enter a valid HCI.");
        return;
    }

    const incompleteHoles =
        pastRoundScorecard.filter(function(hole) {
            return hole.score === null;
        });

    if (incompleteHoles.length > 0) {
        alert("Enter a score for every hole.");
        return;
    }

    const savedRounds = getSavedRounds();

    const totalScore =
        pastRoundScorecard.reduce(function(sum, hole) {
            return sum + hole.score;
        }, 0);

    const round = {
        id: Date.now(),
        date: formatDateForDisplay(roundDate),
        mode: "manual-entry",
        courseId: selectedCourseId,
        courseName: courses[selectedCourseId].name,
        holesPlayed: pastRoundScorecard.length,
        hciUsed: hciUsed,
        holes: pastRoundScorecard,
        totalScore: totalScore,
        entryType: "past-round"
    };

    savedRounds.push(round);

    saveSavedRounds(savedRounds);

    alert("Past round saved.");

    showRecentRounds();
}

function renderRecentRounds() {
    const recentRoundsList =
        document.getElementById("recentRoundsList");

    recentRoundsList.innerHTML = "";

    const savedRounds = getSavedRounds();
    const savedH2HMatches = getSavedH2HMatches();
    const savedShotTrackingRounds = getSavedShotTrackingRounds();

    if (
        savedRounds.length === 0 &&
        savedH2HMatches.length === 0 &&
        savedShotTrackingRounds.length === 0
    ) {
        recentRoundsList.innerHTML =
            "<p class='empty-message'>No saved rounds yet.</p>";
        return;
    }

    const recentItems = savedRounds.map(function(round) {
        return { type: "scorecard", id: round.id, record: round };
    }).concat(savedH2HMatches.map(function(match) {
        return { type: "h2h-match", id: match.id, record: match };
    })).concat(savedShotTrackingRounds.map(function(round) {
        return { type: "shot-tracking", id: round.id, record: round };
    }));

    recentItems.sort(function(a, b) {
        return getHistoricalRecordSortValue(b.record) -
            getHistoricalRecordSortValue(a.record);
    });

    recentItems.forEach(function(item) {
        if (item.type === "h2h-match") {
            appendRecentH2HMatchCard(recentRoundsList, item.record);
            return;
        }

        if (item.type === "shot-tracking") {
            appendRecentShotTrackingCard(recentRoundsList, item.record);
            return;
        }

        appendRecentScorecardCard(recentRoundsList, item.record);
    });

    enableSwipeRevealDelete();
}

function getHistoricalRecordSortValue(record) {
    if (isValidIsoTimestamp(record.updatedAt)) {
        return Date.parse(record.updatedAt);
    }

    if (Number.isFinite(record.id)) {
        return record.id;
    }

    const parsedDate = Date.parse(record.date);

    return Number.isFinite(parsedDate) ? parsedDate : 0;
}

function createRecentSwipeCard(recordId, deleteHandler) {
    const swipeWrapper = document.createElement("div");
    const deleteButton = document.createElement("button");
    const card = document.createElement("div");

    swipeWrapper.className = "round-swipe-wrapper";
    deleteButton.className = "round-delete-action";
    deleteButton.textContent = "Delete";
    deleteButton.onclick = function(event) {
        event.stopPropagation();
        deleteHandler(recordId);
    };
    card.className = "recent-round-card swipe-front-card";

    swipeWrapper.appendChild(deleteButton);
    swipeWrapper.appendChild(card);

    return { swipeWrapper, card };
}

function appendRecentScorecardCard(recentRoundsList, round) {
    const completedHoles = Array.isArray(round.holes)
        ? round.holes.filter(function(hole) {
            return hole.score !== null && hole.score !== undefined;
        })
        : [];
    const totalScore = completedHoles.reduce(function(sum, hole) {
        return sum + hole.score;
    }, 0);
    const totalPar = completedHoles.reduce(function(sum, hole) {
        return sum + hole.par;
    }, 0);
    const toPar = totalScore - totalPar;
    let toParText = "E";

    if (toPar > 0) toParText = "+" + toPar;
    if (toPar < 0) toParText = toPar;

    const recentCard = createRecentSwipeCard(round.id, deleteRound);

    recentCard.card.onclick = function() {
        if (recentCard.card.classList.contains("show-delete")) {
            recentCard.card.classList.remove("show-delete");
            return;
        }

        showRoundDetail(round.id);
    };

    recentCard.card.innerHTML = `
        <div>
            <strong>${round.courseName || "Whitinsville Golf Club"}</strong>
            <span>${round.date} • ${round.holesPlayed || completedHoles.length} holes</span>
        </div>

        <div class="recent-round-score">
            <strong>${totalScore}</strong>
            <span>${toParText}</span>
        </div>
    `;

    recentRoundsList.appendChild(recentCard.swipeWrapper);
}

function appendRecentH2HMatchCard(recentRoundsList, match) {
    const recentCard = createRecentSwipeCard(match.id, deleteH2HMatch);
    const resultLabels = {
        win: "Win",
        loss: "Loss",
        tie: "Tie"
    };
    const playerName = match.playerName || "G-Well";
    const opponentName = match.opponentName || "Opponent";
    const resultLabel = resultLabels[match.result] || "Unknown";

    recentCard.card.classList.add("h2h-recent-match-card");
    recentCard.card.onclick = function() {
        recentCard.card.classList.remove("show-delete");
    };
    recentCard.card.innerHTML = `
        <div class="h2h-recent-match-main">
            <strong>H2H Match</strong>
            <span>Versus ${opponentName}</span>
            <span>${match.date || "Saved match"}</span>
        </div>

        <div class="h2h-recent-match-result">
            <strong>Result: ${resultLabel} — ${match.finalMatchStatus || "All Square"}</strong>
            <span>Score: ${playerName} ${match.playerTotalGross} | ${opponentName} ${match.opponentTotalGross}</span>
        </div>
    `;

    recentRoundsList.appendChild(recentCard.swipeWrapper);
}

function appendRecentShotTrackingCard(recentRoundsList, round) {
    const recentCard = createRecentSwipeCard(
        round.id,
        deleteShotTrackingRound
    );
    const shotCount = Array.isArray(round.shots)
        ? round.shots.length
        : 0;
    const holeScoreCount = Array.isArray(round.holes)
        ? round.holes.length
        : 0;

    recentCard.card.classList.add("shot-tracking-recent-card");
    recentCard.card.onclick = function() {
        recentCard.card.classList.remove("show-delete");
    };
    recentCard.card.innerHTML = `
        <div>
            <strong>Shot Tracking</strong>
            <span>${round.courseName || round.course || "Golf Course"}</span>
            <span>${round.date || "Saved round"}</span>
        </div>

        <div class="recent-round-score">
            <strong>${shotCount}</strong>
            <span>${shotCount === 1 ? "shot" : "shots"} • ${holeScoreCount} hole scores</span>
        </div>
    `;

    recentRoundsList.appendChild(recentCard.swipeWrapper);
}

function showRoundDetail(roundId) {
    hideAllScreens();

    setElementHidden("roundDetailScreen", false);

    renderRoundDetail(roundId);
}

function showCourseInfo() {
    hideAllScreens();

    setElementHidden("courseInfoScreen", false);

    renderCourseInfo();
}

function renderCourseInfo() {
    const course =
        courses[selectedCourseId];

    if (!course) {
        alert("Course not found.");
        showHome();
        return;
    }

    const frontPar =
        course.whiteTees.reduce(function(sum, hole) {
            return sum + hole.par;
        }, 0);

    const backPar =
        course.blueTees.reduce(function(sum, hole) {
            return sum + hole.par;
        }, 0);

    const totalPar =
        frontPar + backPar;

    document.getElementById("courseInfoName").textContent =
        course.name;

    document.getElementById("courseInfoDefault").textContent =
        course.defaultCourse ? "Yes" : "No";

document.getElementById("courseInfoFrontNine").textContent =
    "White - Par " + frontPar;

document.getElementById("courseInfoBackNine").textContent =
    "Blue - Par " + backPar;

document.getElementById("courseInfoTotalPar").textContent =
    totalPar;
}

function renderRoundDetail(roundId) {
    const savedRounds = getSavedRounds();

    const round =
        savedRounds.find(function(savedRound) {
            return savedRound.id === roundId;
        });

    if (!round) {
        alert("Round not found.");
        showRecentRounds();
        return;
    }

const hciText =
    round.hciUsed !== undefined ? " • HCI " + round.hciUsed.toFixed(1) : "";

document.getElementById("roundDetailDate").textContent =
    (round.courseName || "Whitinsville Golf Club") + " • " + round.date + hciText;

    const roundDetailList =
        document.getElementById("roundDetailList");

    roundDetailList.innerHTML = "";

    const completedHoles =
        round.holes.filter(function(hole) {
            return hole.score !== null;
        });

    let totalScore = 0;
    let totalPar = 0;

round.holes.forEach(function(hole) {
    const scoreDisplay =
        hole.score === null ? "-" : hole.score;

const hciForRound =
    round.hciUsed !== undefined ? round.hciUsed : playerProfile.hci;

const strokeDots =
    getStrokeDots(hole.handicap, hciForRound);

    const difference =
        hole.score === null ? null : hole.score - hole.par;

        let status = "-";

        if (difference === 0) {
            status = "E";
        }

        if (difference > 0) {
            status = "+" + difference;
        }

        if (difference < 0) {
            status = difference;
        }

        if (hole.score !== null) {
            totalScore += hole.score;
            totalPar += hole.par;
        }

        const holeDiv =
            document.createElement("div");

        holeDiv.className = "round-detail-hole";

        holeDiv.innerHTML = `
            <div class="hole-number">${hole.hole}</div>

            <div class="hole-details">
                <strong>Hole ${hole.hole}</strong>
<span>Par ${hole.par} • ${hole.yards || "-"} yds • HCP ${hole.handicap} ${strokeDots} | ${hole.tee || ""}</span>
            </div>

            <div class="round-detail-score">
                <strong>${scoreDisplay}</strong>
                <span>${status}</span>
            </div>
        `;

        roundDetailList.appendChild(holeDiv);
    });

    const toPar =
        totalScore - totalPar;

    let toParText = "E";

    if (completedHoles.length === 0) {
        toParText = "-";
    } else if (toPar > 0) {
        toParText = "+" + toPar;
    } else if (toPar < 0) {
        toParText = toPar;
    }

    const hciForNet =
        round.hciUsed !== undefined ? round.hciUsed : playerProfile.hci;

    const netStrokes =
        completedHoles.reduce(function(sum, hole) {
            return sum + getStrokesForHole(hole.handicap, hciForNet);
        }, 0);

    const netScore =
        completedHoles.length === 0 ? "-" : totalScore - netStrokes;

    document.getElementById("roundDetailTotalScore").textContent =
        totalScore;

    document.getElementById("roundDetailToPar").textContent =
        toParText;

    const netScoreElement =
        document.getElementById("roundDetailNetScore");

    if (netScoreElement) {
        netScoreElement.textContent = netScore;
    }

    const deleteRoundButton =
        document.createElement("button");

    deleteRoundButton.className = "round-detail-delete-btn";
    deleteRoundButton.textContent = "Delete This Round";

    deleteRoundButton.onclick = function() {
        deleteRound(round.id);
    };

    roundDetailList.appendChild(deleteRoundButton);
}

function showHoleCountPopup() {
    document.getElementById("holeCountPopup").classList.remove("hidden");
}

function closeHoleCountPopup() {
    document.getElementById("holeCountPopup").classList.add("hidden");
}

function startScorecardRound(numberOfHoles) {
    return guardNewActiveSession(
        "Regular Scorecard",
        function() {
            beginScorecardRound(numberOfHoles);
        }
    );
}

function beginScorecardRound(numberOfHoles) {
    closeHoleCountPopup();

    initializeScorecard(numberOfHoles);
    showScorecardScreen();
}

function getStrokeDots(holeHandicap, handicapIndex) {
    const strokes =
        getStrokesForHole(holeHandicap, handicapIndex);

    if (strokes === 1) {
        return "•";
    }

    if (strokes === 2) {
        return "••";
    }

    if (strokes === 3) {
        return "•••";
    }

    return "";
}

function getStrokesForHole(holeHandicap, handicapIndex) {
    if (!holeHandicap || !handicapIndex) {
        return 0;
    }

    let strokes = 0;

    if (handicapIndex >= holeHandicap) {
        strokes = 1;
    }

    if (handicapIndex > 18 && (handicapIndex - 18) >= holeHandicap) {
        strokes = 2;
    }

    if (handicapIndex > 36 && (handicapIndex - 36) >= holeHandicap) {
        strokes = 3;
    }

    return strokes;
}

function loadPlayerProfile() {
    playerProfile = readStoredJson("gstPlayerProfile", {
        hci: 26.4
    });

    if (!playerProfile.name) {
        playerProfile.name = "G-Well";
    }

    updateHciDisplay();
}

function savePlayerProfile() {
    localStorage.setItem("gstPlayerProfile", JSON.stringify(playerProfile));
}

function updateHciDisplay() {
    const hciDisplay = document.getElementById("hciDisplay");

    if (!hciDisplay) return;

    hciDisplay.textContent = playerProfile.hci !== null
        ? playerProfile.hci.toFixed(1)
        : "--";
}

function updateHci() {
    const currentValue = playerProfile.hci !== null ? playerProfile.hci : "";

    const input = prompt("Enter your current Handicap Index:", currentValue);

    if (input === null) return;

    const newHci = parseFloat(input);

    if (isNaN(newHci)) {
        alert("Please enter a valid Handicap Index.");
        return;
    }

    playerProfile.hci = newHci;

    savePlayerProfile();
    updateHciDisplay();

if (simpleScorecard.length > 0) {
    renderSimpleScorecard();
}
}

// ============================================================
// Recent-round swipe interactions
// ============================================================

function enableSwipeRevealDelete() {
    const swipeCards =
        document.querySelectorAll(".swipe-front-card");

    swipeCards.forEach(function(card) {
        let startX = 0;
        let startY = 0;
        let isDragging = false;

        card.addEventListener("pointerdown", function(event) {
            startX = event.clientX;
            startY = event.clientY;
            isDragging = true;

            if (card.setPointerCapture) {
                card.setPointerCapture(event.pointerId);
            }
        });

        card.addEventListener("pointermove", function(event) {
            if (!isDragging) {
                return;
            }

            const diffX = event.clientX - startX;
            const diffY = event.clientY - startY;

            // Ignore normal vertical scrolling
            if (Math.abs(diffY) > Math.abs(diffX)) {
                return;
            }

            // Swipe left
            if (diffX < -40) {
                closeAllSwipeCards(card);
                card.classList.add("show-delete");
                isDragging = false;
            }

            // Swipe right
            if (diffX > 40) {
                card.classList.remove("show-delete");
                isDragging = false;
            }
        });

        card.addEventListener("pointerup", function() {
            isDragging = false;
        });

        card.addEventListener("pointercancel", function() {
            isDragging = false;
        });
    });
}

function closeAllSwipeCards(exceptCard) {
    const openCards =
        document.querySelectorAll(".swipe-front-card.show-delete");

    openCards.forEach(function(card) {
        if (card !== exceptCard) {
            card.classList.remove("show-delete");
        }
    });
}

// ============================================================
// Head-to-Head feature
// ============================================================

function showHeadToHead() {
    hideAllScreens();
    setElementHidden("headToHeadScreen", false);
    openH2HHoleByHole();
}

function showH2HModePicker() {
    hideAllScreens();
    setElementHidden("headToHeadScreen", false);

    const modePicker = document.getElementById("h2hModePicker");
    const holePanel = document.getElementById("h2hHoleByHolePanel");
    const comparePanel = document.getElementById("h2hComparePanel");

    if (modePicker) modePicker.style.display = "flex";
    if (holePanel) holePanel.style.display = "none";
    if (comparePanel) comparePanel.style.display = "none";
}

function openH2HHoleByHole() {
    const modePicker = document.getElementById("h2hModePicker");
    const holePanel = document.getElementById("h2hHoleByHolePanel");
    const comparePanel = document.getElementById("h2hComparePanel");

    if (modePicker) modePicker.style.display = "none";
    if (holePanel) holePanel.style.display = "block";
    if (comparePanel) comparePanel.style.display = "none";

    loadH2HPlayerDefaults();
}

function openH2HCompare() {
    const modePicker = document.getElementById("h2hModePicker");
    const holePanel = document.getElementById("h2hHoleByHolePanel");
    const comparePanel = document.getElementById("h2hComparePanel");

    if (modePicker) modePicker.style.display = "none";
    if (holePanel) holePanel.style.display = "none";
    if (comparePanel) comparePanel.style.display = "block";

    const playerOneNameDisplay =
        document.getElementById("playerOneNameDisplay");

    const playerOneHciDisplay =
        document.getElementById("headToHeadPlayerOneHci");

    const resultDiv =
        document.getElementById("headToHeadResult");

    if (playerOneNameDisplay) {
        playerOneNameDisplay.textContent =
            playerProfile.name || "G-Well";
    }

    if (playerOneHciDisplay) {
        playerOneHciDisplay.textContent =
            playerProfile.hci !== null && playerProfile.hci !== undefined
                ? playerProfile.hci.toFixed(1)
                : "--";
    }

    if (resultDiv) {
        resultDiv.classList.add("hidden");
        resultDiv.innerHTML = "";
    }
}

function loadH2HPlayerDefaults() {
    const playerNameInput = document.getElementById("h2hPlayerName");
    const playerHciInput = document.getElementById("h2hPlayerHci");

    if (playerNameInput) {
        playerNameInput.value = playerProfile?.name || "G-Well";
    }

    if (playerHciInput) {
        playerHciInput.value = playerProfile?.hci ?? "";
    }
}

function startH2HHoleByHole(holeCount) {
    return guardNewActiveSession(
        "Head-to-Head",
        function() {
            beginH2HHoleByHole(holeCount);
        }
    );
}

function beginH2HHoleByHole(holeCount) {
    const playerName = document.getElementById("h2hPlayerName").value || "G-Well";
    const playerHci = Number(document.getElementById("h2hPlayerHci").value) || 0;

    const opponentName = document.getElementById("h2hOpponentName").value || "Opponent";
    const opponentHci = Number(document.getElementById("h2hOpponentHci").value) || 0;

    const holes = getH2HHoles(holeCount);

    if (holes.length === 0) {
    return;
}

    h2hMatch = {
        mode: "holeByHole",
        courseId: selectedCourseId,
        courseName: courses[selectedCourseId].name,
        holeCount: holeCount,
        currentHole: 1,
        players: [
            {
                name: playerName,
                hci: playerHci
            },
            {
                name: opponentName,
                hci: opponentHci
            }
        ],
        holes: holes,
        scores: holes.map(hole => ({
            player1: null,
            player2: null
        }))
    };

    persistH2HActiveSession(true);

    showH2HMatchScreen();
}

function showH2HMatchScreen() {
    hideAllScreens();
    setElementHidden("h2hMatchScreen", false);
    renderH2HMatchScorecard();
}

function getH2HHoles(holeCount) {
    const course = courses[selectedCourseId];

    if (!course) {
        alert("Course data not found.");
        return [];
    }

    if (holeCount === 9) {
        return course.whiteTees.map(function(hole) {
            return {
                holeNumber: hole.hole,
                par: hole.par,
                yards: hole.yards,
                hcp: hole.handicap,
                tee: "White"
            };
        });
    }

    return course.whiteTees.concat(course.blueTees).map(function(hole) {
        const teeName = hole.hole <= 9 ? "White" : "Blue";

        return {
            holeNumber: hole.hole,
            par: hole.par,
            yards: hole.yards,
            hcp: hole.handicap,
            tee: teeName
        };
    });
}

function getMatchStrokes(handicapIndex, holeCount) {
    const course =
        courses[selectedCourseId];

    let matchHoles = [];

    if (Number(holeCount) === 9) {
        matchHoles = course.whiteTees;
    }

    if (Number(holeCount) === 18) {
        matchHoles = course.whiteTees.concat(course.blueTees);
    }

    return matchHoles.reduce(function(sum, hole) {
        return sum + getStrokesForHole(hole.handicap, handicapIndex);
    }, 0);
}

function calculateHeadToHead() {
    const playerOneName =
        playerProfile.name || "G-Well";

    const playerOneHci =
        playerProfile.hci;

    const playerTwoName =
        document.getElementById("playerTwoNameInput").value || "Player 2";

    const playerTwoHci =
        parseFloat(document.getElementById("playerTwoHciInput").value);

    const playerOneGross =
        Number(document.getElementById("playerOneGrossInput").value);

    const playerTwoGross =
        Number(document.getElementById("playerTwoGrossInput").value);

    const holeCount =
        Number(document.getElementById("headToHeadHoleCount").value);

    if (!playerOneGross || !playerTwoGross) {
        alert("Enter gross scores for both players.");
        return;
    }

    if (isNaN(playerTwoHci)) {
        alert("Enter Player 2 HCI.");
        return;
    }

    const playerOneStrokes =
        getMatchStrokes(playerOneHci, holeCount);

    const playerTwoStrokes =
        getMatchStrokes(playerTwoHci, holeCount);

    const playerOneNet =
        playerOneGross - playerOneStrokes;

    const playerTwoNet =
        playerTwoGross - playerTwoStrokes;

    let winnerText = "Match tied.";

    if (playerOneNet < playerTwoNet) {
        winnerText = playerOneName + " wins!";
    }

    if (playerTwoNet < playerOneNet) {
        winnerText = playerTwoName + " wins!";
    }

    const resultDiv =
        document.getElementById("headToHeadResult");

    resultDiv.classList.remove("hidden");

    resultDiv.innerHTML = `
        <h3>${winnerText}</h3>

        <div class="match-result-row">
            <span>${playerOneName}</span>
            <strong>Gross ${playerOneGross} • Net ${playerOneNet}</strong>
        </div>

        <div class="match-result-row">
            <span>Strokes Given</span>
            <strong>${playerOneStrokes}</strong>
        </div>

        <div class="match-result-row">
            <span>${playerTwoName}</span>
            <strong>Gross ${playerTwoGross} • Net ${playerTwoNet}</strong>
        </div>

        <div class="match-result-row">
            <span>Strokes Given</span>
            <strong>${playerTwoStrokes}</strong>
        </div>
    `;
}

function renderH2HHole() {
    renderH2HMatchScorecard();
}

// H2H match-play Playing Handicap and net-scoring helpers.
function getH2HTeeData(holeCount) {
    const courseId = h2hMatch?.courseId || selectedCourseId;
    const course = courses[courseId];

    return course?.h2hTeeData?.[Number(holeCount)] || null;
}

function getH2HPlayingHandicap(handicapIndex, holeCount) {
    const teeData = getH2HTeeData(holeCount);

    if (!teeData) {
        return 0;
    }

    const fullHandicapIndex = Number(handicapIndex) || 0;
    const adjustedHandicapIndex = Number(holeCount) === 9
        ? Math.round((fullHandicapIndex / 2) * 10) / 10
        : fullHandicapIndex;
    const unroundedCourseHandicap =
        adjustedHandicapIndex * (teeData.slope / 113) +
        (teeData.rating - teeData.par);

    // Individual match play uses a 100% allowance, so Course Handicap and
    // Playing Handicap are the same before the final whole-number rounding.
    return Math.round(unroundedCourseHandicap);
}

function getH2HMatchPlayingHandicaps() {
    if (!h2hMatch) {
        return {
            player1: 0,
            player2: 0,
            difference: 0,
            receivingPlayer: null
        };
    }

    const player1PlayingHandicap = getH2HPlayingHandicap(
        h2hMatch.players[0].hci,
        h2hMatch.holeCount
    );
    const player2PlayingHandicap = getH2HPlayingHandicap(
        h2hMatch.players[1].hci,
        h2hMatch.holeCount
    );
    const difference = Math.abs(
        player1PlayingHandicap - player2PlayingHandicap
    );
    let receivingPlayer = null;

    if (player1PlayingHandicap > player2PlayingHandicap) {
        receivingPlayer = "player1";
    }

    if (player2PlayingHandicap > player1PlayingHandicap) {
        receivingPlayer = "player2";
    }

    return {
        player1: player1PlayingHandicap,
        player2: player2PlayingHandicap,
        difference,
        receivingPlayer
    };
}

function getH2HHoleDifficultyRank(hole) {
    if (!h2hMatch) return 0;

    const holesByDifficulty = h2hMatch.holes.slice().sort(function(a, b) {
        return a.hcp - b.hcp || a.holeNumber - b.holeNumber;
    });

    return holesByDifficulty.findIndex(function(matchHole) {
        return matchHole.holeNumber === hole.holeNumber;
    }) + 1;
}

function getH2HMatchPlayStrokesFromDifference(hole, matchStrokeDifference) {
    if (!h2hMatch || h2hMatch.holeCount < 1) return 0;

    const normalizedDifference = Math.max(
        0,
        Math.round(Number(matchStrokeDifference) || 0)
    );
    const baseStrokes = Math.floor(
        normalizedDifference / h2hMatch.holeCount
    );
    const extraStrokes = normalizedDifference % h2hMatch.holeCount;
    const difficultyRank = getH2HHoleDifficultyRank(hole);

    return baseStrokes +
        (difficultyRank > 0 && difficultyRank <= extraStrokes ? 1 : 0);
}

function getH2HMatchPlayStrokesForHole(hole) {
    const playingHandicaps = getH2HMatchPlayingHandicaps();

    if (!playingHandicaps.receivingPlayer) {
        return { player1: 0, player2: 0 };
    }

    const strokesReceived = getH2HMatchPlayStrokesFromDifference(
        hole,
        playingHandicaps.difference
    );

    return playingHandicaps.receivingPlayer === "player1"
        ? { player1: strokesReceived, player2: 0 }
        : { player1: 0, player2: strokesReceived };
}

function getH2HNetScore(grossScore, strokesReceived) {
    if (grossScore === null || grossScore === undefined) {
        return null;
    }

    return grossScore - strokesReceived;
}

function getH2HMatchPlayHoleScores(holeIndex) {
    if (!h2hMatch) return null;

    const hole = h2hMatch.holes[holeIndex];
    const grossScores = h2hMatch.scores[holeIndex];
    const strokes = getH2HMatchPlayStrokesForHole(hole);

    return {
        gross: {
            player1: grossScores.player1,
            player2: grossScores.player2
        },
        strokes,
        net: {
            player1: getH2HNetScore(grossScores.player1, strokes.player1),
            player2: getH2HNetScore(grossScores.player2, strokes.player2)
        }
    };
}

function getH2HMatchPlayHoleResult(holeIndex) {
    if (!h2hMatch) return "";

    const player1 = h2hMatch.players[0];
    const player2 = h2hMatch.players[1];
    const outcome = getH2HMatchPlayHoleOutcome(holeIndex);

    if (outcome === null) {
        return "Enter both scores";
    }

    if (outcome === "win") {
        return `${player1.name} wins hole`;
    }

    if (outcome === "loss") {
        return `${player2.name} wins hole`;
    }

    return "Hole halved";
}

function getH2HMatchPlayHoleOutcome(holeIndex) {
    if (!h2hMatch) return null;

    const scores = getH2HMatchPlayHoleScores(holeIndex);

    if (scores.net.player1 === null || scores.net.player2 === null) {
        return null;
    }

    if (scores.net.player1 < scores.net.player2) return "win";
    if (scores.net.player2 < scores.net.player1) return "loss";

    return "tie";
}

function getH2HMatchScore(lastHoleIndex) {
    if (!h2hMatch) return 0;

    let matchScore = 0;
    const finalHoleIndex = Number.isInteger(lastHoleIndex)
        ? lastHoleIndex
        : h2hMatch.holeCount - 1;

    h2hMatch.scores.forEach(function(unusedScores, holeIndex) {
        if (holeIndex > finalHoleIndex) return;

        const outcome = getH2HMatchPlayHoleOutcome(holeIndex);

        if (outcome === "win") matchScore++;
        if (outcome === "loss") matchScore--;
    });

    return matchScore;
}

function getH2HMatchResult() {
    const matchScore = getH2HMatchScore();

    if (matchScore > 0) return "win";
    if (matchScore < 0) return "loss";

    return "tie";
}

function getH2HMatchPlayStatus(lastHoleIndex) {
    if (!h2hMatch) return "All Square";

    const player1 = h2hMatch.players[0];
    const player2 = h2hMatch.players[1];
    const matchScore = getH2HMatchScore(lastHoleIndex);

    if (matchScore === 0) {
        return "All Square";
    }

    if (matchScore > 0) {
        return `${player1.name} ${matchScore} Up`;
    }

    return `${player2.name} ${Math.abs(matchScore)} Up`;
}

function isH2HMatchComplete() {
    return Boolean(
        h2hMatch &&
        h2hMatch.scores.length === h2hMatch.holeCount &&
        h2hMatch.scores.every(function(scores) {
            return scores.player1 !== null &&
                scores.player1 !== undefined &&
                scores.player2 !== null &&
                scores.player2 !== undefined;
        })
    );
}

function getH2HStrokeReceiver(playingHandicaps) {
    if (playingHandicaps.receivingPlayer === "player1") return "player";
    if (playingHandicaps.receivingPlayer === "player2") return "opponent";

    return "none";
}

function buildH2HScorecardRound(matchId, matchDate, completedAt) {
    const player = h2hMatch.players[0];
    const scorecardHoles = h2hMatch.holes.map(function(hole, holeIndex) {
        return {
            hole: hole.holeNumber,
            par: hole.par,
            yards: hole.yards,
            tee: hole.tee,
            handicap: hole.hcp,
            score: h2hMatch.scores[holeIndex].player1
        };
    });
    const totalScore = scorecardHoles.reduce(function(sum, hole) {
        return sum + hole.score;
    }, 0);
    const totalPar = scorecardHoles.reduce(function(sum, hole) {
        return sum + hole.par;
    }, 0);

    return {
        schemaVersion: 1,
        id: matchId,
        relationshipId: matchId,
        createdAt: activeSession?.createdAt || completedAt,
        updatedAt: completedAt,
        type: "scorecard",
        source: "h2h-match",
        linkedH2HMatchId: matchId,
        date: matchDate,
        mode: "scorecard",
        courseId: h2hMatch.courseId || selectedCourseId,
        courseName: h2hMatch.courseName || courses[selectedCourseId].name,
        holesPlayed: h2hMatch.holeCount,
        hciUsed: player.hci,
        holes: scorecardHoles,
        totalScore,
        totalPar,
        toPar: totalScore - totalPar
    };
}

function buildSavedH2HMatch(matchId, matchDate, completedAt) {
    const player = h2hMatch.players[0];
    const opponent = h2hMatch.players[1];
    const playingHandicaps = getH2HMatchPlayingHandicaps();
    const matchScore = getH2HMatchScore();
    const savedHoles = h2hMatch.holes.map(function(hole, holeIndex) {
        const scores = getH2HMatchPlayHoleScores(holeIndex);

        return {
            holeNumber: hole.holeNumber,
            par: hole.par,
            yards: hole.yards,
            handicap: hole.hcp,
            playerGross: scores.gross.player1,
            opponentGross: scores.gross.player2,
            playerStrokes: scores.strokes.player1,
            opponentStrokes: scores.strokes.player2,
            playerNet: scores.net.player1,
            opponentNet: scores.net.player2,
            holeResult: getH2HMatchPlayHoleOutcome(holeIndex),
            matchScoreAfterHole: getH2HMatchScore(holeIndex),
            matchStatusAfterHole: getH2HMatchPlayStatus(holeIndex)
        };
    });

    return {
        schemaVersion: 1,
        id: matchId,
        relationshipId: matchId,
        createdAt: activeSession?.createdAt || completedAt,
        updatedAt: completedAt,
        type: "h2h-match",
        date: matchDate,
        courseId: h2hMatch.courseId || selectedCourseId,
        courseName: h2hMatch.courseName || courses[selectedCourseId].name,
        holesPlayed: h2hMatch.holeCount,
        playerName: player.name,
        playerHci: player.hci,
        playerPlayingHandicap: playingHandicaps.player1,
        opponentName: opponent.name,
        opponentHci: opponent.hci,
        opponentPlayingHandicap: playingHandicaps.player2,
        matchStrokeDifference: playingHandicaps.difference,
        strokeReceiver: getH2HStrokeReceiver(playingHandicaps),
        playerTotalGross: savedHoles.reduce(function(sum, hole) {
            return sum + hole.playerGross;
        }, 0),
        opponentTotalGross: savedHoles.reduce(function(sum, hole) {
            return sum + hole.opponentGross;
        }, 0),
        matchScore,
        finalMatchStatus: getH2HMatchPlayStatus(h2hMatch.holeCount - 1),
        result: getH2HMatchResult(),
        holes: savedHoles
    };
}

function saveH2HMatch() {
    return completeH2HActiveSession(false);
}

function completeH2HActiveSession(silent) {
    if (!h2hMatch || !isH2HMatchComplete()) {
        if (!silent) {
            alert("Enter both players' scores for every hole before saving the match.");
        }
        return false;
    }

    if (!activeSession || activeSession.mode !== "h2h") {
        persistH2HActiveSession(true);
    }

    if (!activeSession || activeSession.mode !== "h2h") {
        if (!silent) {
            alert("The active H2H match could not be prepared for saving.");
        }
        return false;
    }

    const savedRounds = getSavedRounds();
    const savedH2HMatches = getSavedH2HMatches();
    const sessionToComplete = activeSession;
    const matchId = sessionToComplete.id;
    const matchDate = new Date().toLocaleDateString();
    const completedAt = new Date().toISOString();
    const scorecardRound = buildH2HScorecardRound(
        matchId,
        matchDate,
        completedAt
    );
    const savedH2HMatch = buildSavedH2HMatch(
        matchId,
        matchDate,
        completedAt
    );
    const existingRounds = savedRounds.filter(function(round) {
        return round.id === matchId;
    });
    const existingMatches = savedH2HMatches.filter(function(match) {
        return match.id === matchId;
    });

    if (
        existingRounds.length > 1 ||
        existingMatches.length > 1 ||
        (
            existingRounds.length === 1 &&
            existingRounds[0].source !== "h2h-match"
        ) ||
        (
            existingMatches.length === 1 &&
            existingMatches[0].type !== "h2h-match"
        )
    ) {
        setSaveStatus("failed");

        if (!silent) {
            alert(
                "Match completion stopped because conflicting historical " +
                "records already exist. The active match was preserved."
            );
        }
        return false;
    }

    try {
        if (existingRounds.length === 0) {
            saveSavedRounds(savedRounds.concat(scorecardRound));
        }

        if (existingMatches.length === 0) {
            saveSavedH2HMatches(savedH2HMatches.concat(savedH2HMatch));
        }

        const verifiedRounds = getSavedRounds().filter(function(round) {
            return round.id === matchId &&
                round.source === "h2h-match";
        });
        const verifiedMatches =
            getSavedH2HMatches().filter(function(match) {
                return match.id === matchId &&
                    match.type === "h2h-match";
            });

        if (
            verifiedRounds.length !== 1 ||
            verifiedMatches.length !== 1
        ) {
            throw new Error(
                "The linked H2H completion records could not be verified."
            );
        }
    } catch (error) {
        console.error("Could not save H2H match:", error);
        setSaveStatus("failed");

        if (!silent) {
            alert(
                "Match could not be fully verified. The active match and any " +
                "successfully written linked record were preserved for recovery."
            );
        }
        return false;
    }

    clearCurrentActiveSession(sessionToComplete, false);

    if (!silent) {
        alert(
            "Match saved. Your round was added to Recent Rounds, and the H2H " +
            `match was saved as Versus ${savedH2HMatch.opponentName}.`
        );

        showRecentRounds();
    }

    return true;
}

function deleteH2HMatch(matchId) {
    const confirmed = confirm("Delete this H2H match? This cannot be undone.");

    if (!confirmed) {
        return;
    }

    const savedMatches = getSavedH2HMatches().filter(function(match) {
        return match.id !== matchId;
    });

    saveSavedH2HMatches(savedMatches);
    showRecentRounds();
}

function deleteShotTrackingRound(roundId) {
    const confirmed = confirm(
        "Delete this Shot Tracking round? This cannot be undone."
    );

    if (!confirmed) {
        return;
    }

    const savedRounds = getSavedShotTrackingRounds().filter(function(round) {
        return round.id !== roundId;
    });

    saveSavedShotTrackingRounds(savedRounds);
    showRecentRounds();
}

function renderH2HMatchScorecard() {
    if (!h2hMatch) return;

    const player1 = h2hMatch.players[0];
    const player2 = h2hMatch.players[1];
    const playingHandicaps = getH2HMatchPlayingHandicaps();
    const playersDisplay = document.getElementById("h2hMatchPlayers");
    const statusDisplay = document.getElementById("h2hMatchStatus");
    const grid = document.getElementById("h2hMatchGrid");

    playersDisplay.textContent =
        `${player1.name} PH ${playingHandicaps.player1} vs ` +
        `${player2.name} PH ${playingHandicaps.player2}`;
    statusDisplay.textContent = getH2HMatchPlayStatus(h2hMatch.holeCount - 1);
    grid.innerHTML = "";

    h2hMatch.holes.forEach(function(hole, holeIndex) {
        const scores = h2hMatch.scores[holeIndex];
        const matchScores = getH2HMatchPlayHoleScores(holeIndex);
        const player1Score = scores.player1 === null ? "-" : scores.player1;
        const player2Score = scores.player2 === null ? "-" : scores.player2;
        const player1Net = matchScores.net.player1 === null
            ? "-"
            : matchScores.net.player1;
        const player2Net = matchScores.net.player2 === null
            ? "-"
            : matchScores.net.player2;
        const holeDiv = document.createElement("div");

        holeDiv.className = "scorecard-hole h2h-match-hole";

        if (h2hMatch.currentHole === holeIndex + 1) {
            holeDiv.classList.add("active-hole");
        }
        holeDiv.innerHTML = `
            <div class="hole-number">${hole.holeNumber}</div>

            <div class="hole-details">
                <strong>Hole ${hole.holeNumber}</strong>
                <span>Par ${hole.par} • ${hole.yards} yds • HCP ${hole.hcp} | ${hole.tee}</span>

                <div class="h2h-match-score-row">
                    <span>${player1.name} Score</span>
                    <div class="score-controls">
                        <button onclick="adjustH2HScore('player1', -1, ${holeIndex})">−</button>
                        <div class="score-value">${player1Score}</div>
                        <button onclick="adjustH2HScore('player1', 1, ${holeIndex})">+</button>
                    </div>
                </div>

                <div class="h2h-match-score-row">
                    <span>${player2.name} Score</span>
                    <div class="score-controls">
                        <button onclick="adjustH2HScore('player2', -1, ${holeIndex})">−</button>
                        <div class="score-value">${player2Score}</div>
                        <button onclick="adjustH2HScore('player2', 1, ${holeIndex})">+</button>
                    </div>
                </div>

                <div class="h2h-current-hole-result">
                    <strong>Current Hole Result:</strong>
                    <span>${getH2HMatchPlayHoleResult(holeIndex)}</span>
                    <div class="h2h-net-breakdown">
                        <span>${player1.name}: Gross ${player1Score} • Strokes ${matchScores.strokes.player1} • Net ${player1Net}</span>
                        <span>${player2.name}: Gross ${player2Score} • Strokes ${matchScores.strokes.player2} • Net ${player2Net}</span>
                    </div>
                    <span>Match: ${getH2HMatchPlayStatus(holeIndex)}</span>
                </div>
            </div>
        `;

        grid.appendChild(holeDiv);
    });

    const saveMatchButton = document.getElementById("saveH2HMatchButton");

    if (saveMatchButton) {
        saveMatchButton.classList.toggle("hidden", !isH2HMatchComplete());
    }
}

function adjustH2HScore(playerKey, change, requestedHoleIndex) {
    if (!h2hMatch) return;

    const holeIndex = Number.isInteger(requestedHoleIndex)
        ? requestedHoleIndex
        : h2hMatch.currentHole - 1;
    const hole = h2hMatch.holes[holeIndex];
    const currentScore = h2hMatch.scores[holeIndex][playerKey];

    h2hMatch.currentHole = holeIndex + 1;

    if (currentScore === null) {
        if (change < 0) {
            persistH2HMatch();
            renderH2HMatchScorecard();
            return;
        }

        h2hMatch.scores[holeIndex][playerKey] = hole.par;
    } else {
        h2hMatch.scores[holeIndex][playerKey] += change;
    }

    if (h2hMatch.scores[holeIndex][playerKey] < 1) {
        h2hMatch.scores[holeIndex][playerKey] = null;
    }

    persistH2HMatch();
    renderH2HMatchScorecard();
}

function saveH2HHole() {
    if (!h2hMatch) return;

    const holeIndex = h2hMatch.currentHole - 1;
    const hole = h2hMatch.holes[holeIndex];

    if (h2hMatch.scores[holeIndex].player1 === null) {
        h2hMatch.scores[holeIndex].player1 = hole.par;
    }

    if (h2hMatch.scores[holeIndex].player2 === null) {
        h2hMatch.scores[holeIndex].player2 = hole.par;
    }

    persistH2HMatch();
    renderH2HHole();
}

function nextH2HHole() {
    if (!h2hMatch) return;

    if (h2hMatch.currentHole < h2hMatch.holeCount) {
        h2hMatch.currentHole++;
        persistH2HMatch();
        renderH2HHole();
    }
}

function previousH2HHole() {
    if (!h2hMatch) return;

    if (h2hMatch.currentHole > 1) {
        h2hMatch.currentHole--;
        persistH2HMatch();
        renderH2HHole();
    }
}

function persistH2HMatch() {
    return persistH2HActiveSession(true);
}

function getH2HStrokesForHole(playerHci, hole) {
    if (!h2hMatch) return 0;

    const strokes = getH2HMatchPlayStrokesForHole(hole);
    const player1Hci = Number(h2hMatch.players[0].hci) || 0;

    return (Number(playerHci) || 0) === player1Hci
        ? strokes.player1
        : strokes.player2;
}

function getH2HHoleResultText(holeIndex) {
    if (!h2hMatch) return "";

    const hole = h2hMatch.holes[holeIndex];
    const scores = h2hMatch.scores[holeIndex];

    if (scores.player1 === null || scores.player2 === null) {
        return `<p>Hole result will show after both scores are saved.</p>`;
    }

    const player1 = h2hMatch.players[0];
    const player2 = h2hMatch.players[1];

    const p1Gross = scores.player1;
    const p2Gross = scores.player2;

    const p1Strokes = getH2HStrokesForHole(player1.hci, hole, holeIndex);
    const p2Strokes = getH2HStrokesForHole(player2.hci, hole, holeIndex);

    const p1Net = p1Gross - p1Strokes;
    const p2Net = p2Gross - p2Strokes;

    let grossResult = "Gross: Push";
    let netResult = "Net: Push";

    if (p1Gross < p2Gross) grossResult = `Gross: ${player1.name} wins`;
    if (p2Gross < p1Gross) grossResult = `Gross: ${player2.name} wins`;

    if (p1Net < p2Net) netResult = `Net: ${player1.name} wins`;
    if (p2Net < p1Net) netResult = `Net: ${player2.name} wins`;

    return `
        <hr>
        <p>${grossResult}</p>
        <p>${netResult}</p>
        <p>
            Net scores: ${player1.name} ${p1Net} 
            vs ${player2.name} ${p2Net}
        </p>
    `;
}

function getH2HMatchSummaryText() {
    if (!h2hMatch) return "";

    const player1 = h2hMatch.players[0];
    const player2 = h2hMatch.players[1];

    let grossP1 = 0;
    let grossP2 = 0;
    let netP1 = 0;
    let netP2 = 0;

    h2hMatch.holes.forEach((hole, index) => {
        const scores = h2hMatch.scores[index];

        if (scores.player1 === null || scores.player2 === null) {
            return;
        }

        const p1Gross = scores.player1;
        const p2Gross = scores.player2;

        const p1Strokes = getH2HStrokesForHole(player1.hci, hole, index);
        const p2Strokes = getH2HStrokesForHole(player2.hci, hole, index);

        const p1Net = p1Gross - p1Strokes;
        const p2Net = p2Gross - p2Strokes;

        if (p1Gross < p2Gross) grossP1++;
        if (p2Gross < p1Gross) grossP2++;

        if (p1Net < p2Net) netP1++;
        if (p2Net < p1Net) netP2++;
    });

    return `
        <p><strong>Gross Match:</strong> ${formatH2HLead(player1.name, player2.name, grossP1, grossP2)}</p>
        <p><strong>Net Match:</strong> ${formatH2HLead(player1.name, player2.name, netP1, netP2)}</p>
    `;
}

function formatH2HLead(player1Name, player2Name, player1Wins, player2Wins) {
    const diff = player1Wins - player2Wins;

    if (diff === 0) {
        return "All Square";
    }

    if (diff > 0) {
        return `${player1Name} +${diff}`;
    }

    return `${player2Name} +${Math.abs(diff)}`;
}

function abandonCurrentH2HMatch() {
    if (activeSession?.mode !== "h2h") {
        showHome();
        return;
    }

    abandonActiveSession();
}

// ============================================================
// Shot data maintenance and export
// ============================================================

function clearShots() {

    if (!confirm("Delete all shots?")) {
        return;
    }

    shots = [];

    if (activeSession?.mode === "shotTracking") {
        persistShotTrackingActiveSession(true);
    } else {
        writeLegacyJson("shots", shots, Array.isArray);
    }

    renderShots();
    updateSummary();
}

function exportShots() {

    const data =
        JSON.stringify(shots, null, 2);

    const blob =
        new Blob([data], {
            type: "application/json"
        });

    const url =
        URL.createObjectURL(blob);

    const a =
        document.createElement("a");

    a.href = url;
    a.download = "golf-shots.json";

    a.click();

    URL.revokeObjectURL(url);
}

function completeShotTrackingRound() {
    if (!currentRound) {
        alert("No active Shot Tracking round was found.");
        return false;
    }

    if (!activeSession || activeSession.mode !== "shotTracking") {
        persistShotTrackingActiveSession(true);
    }

    if (!activeSession || activeSession.mode !== "shotTracking") {
        alert("The active Shot Tracking round could not be prepared.");
        return false;
    }

    const sessionToComplete = activeSession;
    const savedRounds = getSavedShotTrackingRounds();
    const existingRecords = savedRounds.filter(function(round) {
        return round.id === sessionToComplete.id;
    });

    if (existingRecords.length > 1) {
        setSaveStatus("failed");
        alert(
            "Shot Tracking completion stopped because duplicate historical " +
            "records already exist. The active round was preserved."
        );
        return false;
    }

    const completedRound = {
        schemaVersion: 1,
        id: sessionToComplete.id,
        createdAt: sessionToComplete.createdAt,
        updatedAt: new Date().toISOString(),
        type: "shot-tracking",
        mode: "shotTracking",
        date: currentRound.date,
        courseId: sessionToComplete.course.id,
        courseName: sessionToComplete.course.name,
        tee: sessionToComplete.course.tee,
        holesPlayed: sessionToComplete.holeCount,
        hciUsed: sessionToComplete.player.hci,
        shots: cloneJsonValue(sessionToComplete.state.shots),
        holes: cloneJsonValue(sessionToComplete.state.holes)
    };

    try {
        if (existingRecords.length === 0) {
            saveSavedShotTrackingRounds(
                savedRounds.concat(completedRound)
            );
        }

        const verifiedRecords =
            getSavedShotTrackingRounds().filter(function(round) {
                return round.id === sessionToComplete.id;
            });

        if (verifiedRecords.length !== 1) {
            throw new Error(
                "Completed Shot Tracking verification did not find exactly one record."
            );
        }
    } catch (error) {
        console.error("Could not complete the Shot Tracking round:", error);
        setSaveStatus("failed");
        alert(
            "Save Failed. The completed Shot Tracking round could not be " +
            "verified, so the active round was preserved."
        );
        return false;
    }

    clearCurrentActiveSession(sessionToComplete, false);
    alert("Shot Tracking round saved.");
    showRecentRounds();
    return true;
}

function abandonCurrentShotTrackingRound() {
    if (activeSession?.mode !== "shotTracking") {
        showHome();
        return;
    }

    abandonActiveSession();
}

// ============================================================
// Navigation and statistics
// ============================================================

function showRoundSetup() {
    setElementDisplay("roundSetupCard", "block");
    setElementDisplay("shotTrackerCard", "none");
    setElementDisplay("summaryCard", "none");
    setElementDisplay("recentShotsCard", "none");
    setElementDisplay("scorecardCard", "none");
    setElementDisplay("homeCard", "none");
}

function continueRound() {
    return continueActiveSession();
}

function showStats() {
    hideAllScreens();

    setElementHidden("statsScreen", false);

    renderH2HRecordStats();
    renderHoleAverageStats();
}

function renderH2HRecordStats() {
    const record = getSavedH2HMatches().reduce(function(totals, match) {
        if (match.result === "win") totals.wins++;
        if (match.result === "loss") totals.losses++;
        if (match.result === "tie") totals.ties++;

        return totals;
    }, { wins: 0, losses: 0, ties: 0 });

    document.getElementById("h2hStatsWins").textContent = record.wins;
    document.getElementById("h2hStatsLosses").textContent = record.losses;
    document.getElementById("h2hStatsTies").textContent = record.ties;
}

function renderHoleAverageStats() {
    const statsList =
        document.getElementById("holeAverageStatsList");

    statsList.innerHTML = "";

    const savedRounds = getSavedRounds();

    if (savedRounds.length === 0) {
        statsList.innerHTML =
            "<p class='empty-message'>No saved rounds yet.</p>";
        return;
    }

    const holeStats = {};

    savedRounds.forEach(function(round) {
        if (!round.holes) {
            return;
        }

        round.holes.forEach(function(hole) {
            if (hole.score === null || hole.score === undefined) {
                return;
            }

            if (!holeStats[hole.hole]) {
                holeStats[hole.hole] = {
                    hole: hole.hole,
                    par: hole.par,
                    totalScore: 0,
                    totalToPar: 0,
                    count: 0
                };
            }

            holeStats[hole.hole].totalScore += hole.score;
            holeStats[hole.hole].totalToPar += hole.score - hole.par;
            holeStats[hole.hole].count++;
        });
    });

    const sortedHoleStats =
        Object.values(holeStats).sort(function(a, b) {
            return a.hole - b.hole;
        });

    if (sortedHoleStats.length === 0) {
        statsList.innerHTML =
            "<p class='empty-message'>No completed hole scores yet.</p>";
        return;
    }

    sortedHoleStats.forEach(function(stat) {
        const averageScore =
            stat.totalScore / stat.count;

        const averageToPar =
            stat.totalToPar / stat.count;

        let averageToParText = "E";

        if (averageToPar > 0) {
            averageToParText = "+" + averageToPar.toFixed(1);
        }

        if (averageToPar < 0) {
            averageToParText = averageToPar.toFixed(1);
        }

        let trendLabel = "Solid";

        if (averageToPar >= 1) {
            trendLabel = "Losing strokes";
        }

        if (averageToPar <= 0) {
            trendLabel = "Gaining/holding";
        }

        const statDiv =
            document.createElement("div");

        statDiv.className = "hole-average-card";

        statDiv.innerHTML = `
            <div class="hole-number">${stat.hole}</div>

            <div class="hole-average-main">
                <strong>Hole ${stat.hole}</strong>
                <span>Par ${stat.par} • ${stat.count} rounds</span>
            </div>

            <div class="hole-average-score">
                <strong>${averageScore.toFixed(1)}</strong>
                <span>${averageToParText}</span>
            </div>

            <div class="hole-average-trend">
                ${trendLabel}
            </div>
        `;

        statsList.appendChild(statDiv);
    });
}

function showRoundModePopup() {
    document.getElementById("roundModePopup").classList.remove("hidden");
}

function closeRoundModePopup() {
    document.getElementById("roundModePopup").classList.add("hidden");
}

function startShotTrackingMode() {
    return guardNewActiveSession(
        "Shot Tracking",
        beginShotTrackingMode
    );
}

function beginShotTrackingMode() {
    closeRoundModePopup();
    showRoundSetup();
}

function showHome() {
    goHome();
}

// ============================================================
// Application initialization
// ============================================================

function initializeApp() {
    loadPlayerProfile();
    recoverActiveSessionState();
    reconcileInterruptedActiveCompletion();
    renderShots();
    updateSummary();
    updateContinueRoundDisplay();

    setElementDisplay("roundSetupCard", "none");
    setElementDisplay("shotTrackerCard", "none");
    setElementDisplay("summaryCard", "none");
    setElementDisplay("recentShotsCard", "none");
    setElementDisplay("scorecardCard", "none");
}

initializeApp();

if (typeof document.addEventListener === "function") {
    document.addEventListener("visibilitychange", function() {
        if (document.visibilityState === "hidden") {
            flushActiveSession();
        }
    });
}

window.addEventListener("pagehide", function() {
    flushActiveSession();
});

window.addEventListener("load", function() {

    setTimeout(function() {

        const splash =
            document.getElementById("splashScreen");

        splash.style.opacity =
            "0";

        setTimeout(function() {
            splash.style.display =
                "none";
        }, 500);

    }, 4000);

});
