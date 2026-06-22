// ============================================================
// Course data
// ============================================================

const courses = {
    whitinsville: {
        id: "whitinsville",
        name: "Whitinsville Golf Club",
        defaultCourse: true,

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

function updateHoleDisplay() {
    document.getElementById("currentHole").textContent = currentHole;
    document.getElementById("summaryHole").textContent = currentHole;

    localStorage.setItem("currentHole", currentHole);
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

localStorage.setItem(
    "holes",
    JSON.stringify(holes)
);

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
        date: date
    };

localStorage.setItem(
    "currentRound",
    JSON.stringify(currentRound)
);

currentHole = 1;
localStorage.setItem("currentHole", currentHole);

document.getElementById("roundTitle").textContent =
    course + " - " + date;

updateHoleDisplay();
updateSummary();
continueRound();
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

    localStorage.setItem(
        "shots",
        JSON.stringify(shots)
    );

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
    closeRoundModePopup();

    localStorage.setItem("roundMode", "scorecard");

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
        return;
    }

    activeScorecardRound.courseId = selectedCourseId;
    activeScorecardRound.holeCount = simpleScorecard.length;
    activeScorecardRound.holes = simpleScorecard;

    saveActiveScorecardRound(activeScorecardRound);

    // Continue writing the legacy progress keys for backward compatibility.
    localStorage.setItem("simpleScorecard", JSON.stringify(simpleScorecard));
    localStorage.setItem("scorecardHoleCount", activeScorecardRound.holeCount);
}

function clearActiveScorecardProgress() {
    activeScorecardRound = null;
    simpleScorecard = [];

    clearActiveScorecardRound();
    localStorage.removeItem("simpleScorecard");
    localStorage.removeItem("scorecardHoleCount");

    if (localStorage.getItem("roundMode") === "scorecard") {
        localStorage.removeItem("roundMode");
    }
}

function applyActiveScorecardRound(activeRound) {
    activeScorecardRound = activeRound;
    simpleScorecard = activeRound.holes;
    selectedCourseId = activeRound.courseId;

    localStorage.setItem("roundMode", "scorecard");
    persistActiveScorecardProgress();
}

function restoreActiveScorecardProgress() {
    const storedActiveValue =
        localStorage.getItem(ACTIVE_SCORECARD_KEY);

    if (storedActiveValue !== null) {
        const storedActiveRound = getActiveScorecardRound();

        if (!isValidActiveScorecardRound(storedActiveRound)) {
            console.warn("Active scorecard data was invalid and has been cleared.");
            clearActiveScorecardProgress();
            return false;
        }

        applyActiveScorecardRound(storedActiveRound);
        return true;
    }

    const legacyScorecardValue =
        localStorage.getItem("simpleScorecard");

    if (legacyScorecardValue === null) {
        return false;
    }

    const legacyScorecard =
        readStoredJson("simpleScorecard", null);
    const legacyHoleCount =
        Number(localStorage.getItem("scorecardHoleCount")) ||
        (Array.isArray(legacyScorecard) ? legacyScorecard.length : 0);
    const legacyCourseId =
        courses[selectedCourseId] ? selectedCourseId : "whitinsville";
    const legacyCurrentHole = Math.min(
        Math.max(currentHole, 1),
        legacyHoleCount
    );
    const migratedActiveRound = {
        version: 1,
        courseId: legacyCourseId,
        holeCount: legacyHoleCount,
        currentHole: legacyCurrentHole,
        hciUsed: playerProfile.hci,
        holes: legacyScorecard
    };

    if (!isValidActiveScorecardRound(migratedActiveRound)) {
        console.warn("Legacy scorecard progress was invalid and has been cleared.");
        clearActiveScorecardProgress();
        return false;
    }

    applyActiveScorecardRound(migratedActiveRound);
    return true;
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

    localStorage.setItem("simpleScorecard", JSON.stringify(simpleScorecard));
}

function saveScorecardRound() {
    const incompleteHoles = simpleScorecard.filter(function(hole) {
        return hole.score === null || hole.score === undefined;
    });

    if (simpleScorecard.length === 0 || incompleteHoles.length > 0) {
        alert("Enter a score for every hole before saving the round.");
        return;
    }

    const savedRounds = getSavedRounds();
    const scorecardCourseId = activeScorecardRound
        ? activeScorecardRound.courseId
        : selectedCourseId;
    const scorecardHciUsed = activeScorecardRound
        ? activeScorecardRound.hciUsed
        : playerProfile.hci;

const round = {
    id: Date.now(),
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

    savedRounds.push(round);

    saveSavedRounds(savedRounds);
    clearActiveScorecardProgress();

    alert("Scorecard round saved.");

    goHome();
}

function abandonCurrentScorecardRound() {
    if (!activeScorecardRound) {
        goHome();
        return;
    }

    const confirmed = confirm(
        "Abandon current round? Unsaved scorecard progress will be lost."
    );

    if (!confirmed) {
        return;
    }

    clearActiveScorecardProgress();
    goHome();
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

    if (savedRounds.length === 0) {
        recentRoundsList.innerHTML =
            "<p class='empty-message'>No saved rounds yet.</p>";
        return;
    }

    savedRounds
        .sort(function(a, b) {
            return b.id - a.id;
        })
        .forEach(function(round) {

            const completedHoles =
                round.holes.filter(function(hole) {
                    return hole.score !== null;
                });

            const totalScore =
                completedHoles.reduce(function(sum, hole) {
                    return sum + hole.score;
                }, 0);

            const totalPar =
                completedHoles.reduce(function(sum, hole) {
                    return sum + hole.par;
                }, 0);

            const toPar =
                totalScore - totalPar;

            let toParText = "E";

            if (toPar > 0) {
                toParText = "+" + toPar;
            }

            if (toPar < 0) {
                toParText = toPar;
            }


const swipeWrapper =
    document.createElement("div");

swipeWrapper.className = "round-swipe-wrapper";

const deleteButton =
    document.createElement("button");

deleteButton.className = "round-delete-action";
deleteButton.textContent = "Delete";

deleteButton.onclick = function(event) {
    event.stopPropagation();
    deleteRound(round.id);
};

const roundDiv =
    document.createElement("div");

roundDiv.className = "recent-round-card swipe-front-card";

roundDiv.onclick = function() {
    if (roundDiv.classList.contains("show-delete")) {
        roundDiv.classList.remove("show-delete");
        return;
    }

    showRoundDetail(round.id);
};

roundDiv.innerHTML = `
    <div>
        <strong>${round.courseName || "Whitinsville Golf Club"}</strong>
        <span>${round.date} • ${round.holesPlayed || completedHoles.length} holes</span>
    </div>

    <div class="recent-round-score">
        <strong>${totalScore}</strong>
        <span>${toParText}</span>
    </div>
`;

swipeWrapper.appendChild(deleteButton);
swipeWrapper.appendChild(roundDiv);

recentRoundsList.appendChild(swipeWrapper);

        });
        
enableSwipeRevealDelete();
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
    closeHoleCountPopup();

    localStorage.setItem("scorecardHoleCount", numberOfHoles);

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

    localStorage.setItem("gstH2HMatch", JSON.stringify(h2hMatch));

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

// H2H match-play net scoring helpers.
function getH2HMatchPlayStrokesFromDifference(holeHandicap, hciDifference) {
    const normalizedDifference = Math.max(0, Number(hciDifference) || 0);
    const fullRoundsOfStrokes = Math.floor(normalizedDifference / 18);
    const remainingStrokes = normalizedDifference - (fullRoundsOfStrokes * 18);

    return fullRoundsOfStrokes +
        (remainingStrokes >= holeHandicap ? 1 : 0);
}

function getH2HMatchPlayStrokesForHole(hole) {
    if (!h2hMatch) {
        return { player1: 0, player2: 0 };
    }

    const player1Hci = Number(h2hMatch.players[0].hci) || 0;
    const player2Hci = Number(h2hMatch.players[1].hci) || 0;
    const hciDifference = Math.abs(player1Hci - player2Hci);
    const strokesReceived = getH2HMatchPlayStrokesFromDifference(
        hole.hcp,
        hciDifference
    );

    if (player1Hci > player2Hci) {
        return { player1: strokesReceived, player2: 0 };
    }

    if (player2Hci > player1Hci) {
        return { player1: 0, player2: strokesReceived };
    }

    return { player1: 0, player2: 0 };
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

    const scores = getH2HMatchPlayHoleScores(holeIndex);
    const player1 = h2hMatch.players[0];
    const player2 = h2hMatch.players[1];

    if (scores.net.player1 === null || scores.net.player2 === null) {
        return "Enter both scores";
    }

    if (scores.net.player1 < scores.net.player2) {
        return `${player1.name} wins hole`;
    }

    if (scores.net.player2 < scores.net.player1) {
        return `${player2.name} wins hole`;
    }

    return "Hole halved";
}

function getH2HMatchPlayStatus(lastHoleIndex) {
    if (!h2hMatch) return "All Square";

    let player1Wins = 0;
    let player2Wins = 0;

    h2hMatch.scores.forEach(function(unusedScores, holeIndex) {
        if (holeIndex > lastHoleIndex) {
            return;
        }

        const scores = getH2HMatchPlayHoleScores(holeIndex);

        if (scores.net.player1 === null || scores.net.player2 === null) {
            return;
        }

        if (scores.net.player1 < scores.net.player2) player1Wins++;
        if (scores.net.player2 < scores.net.player1) player2Wins++;
    });

    const player1 = h2hMatch.players[0];
    const player2 = h2hMatch.players[1];
    const difference = player1Wins - player2Wins;

    if (difference === 0) {
        return "All Square";
    }

    if (difference > 0) {
        return `${player1.name} ${difference} Up`;
    }

    return `${player2.name} ${Math.abs(difference)} Up`;
}

function renderH2HMatchScorecard() {
    if (!h2hMatch) return;

    const player1 = h2hMatch.players[0];
    const player2 = h2hMatch.players[1];
    const playersDisplay = document.getElementById("h2hMatchPlayers");
    const statusDisplay = document.getElementById("h2hMatchStatus");
    const grid = document.getElementById("h2hMatchGrid");

    playersDisplay.textContent = `${player1.name} vs ${player2.name}`;
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
            saveH2HMatch();
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

    saveH2HMatch();
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

    saveH2HMatch();
    renderH2HHole();
}

function nextH2HHole() {
    if (!h2hMatch) return;

    if (h2hMatch.currentHole < h2hMatch.holeCount) {
        h2hMatch.currentHole++;
        saveH2HMatch();
        renderH2HHole();
    }
}

function previousH2HHole() {
    if (!h2hMatch) return;

    if (h2hMatch.currentHole > 1) {
        h2hMatch.currentHole--;
        saveH2HMatch();
        renderH2HHole();
    }
}

function saveH2HMatch() {
    localStorage.setItem("gstH2HMatch", JSON.stringify(h2hMatch));
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

// ============================================================
// Shot data maintenance and export
// ============================================================

function clearShots() {

    if (!confirm("Delete all shots?")) {
        return;
    }

    shots = [];

    localStorage.setItem(
        "shots",
        JSON.stringify(shots)
    );

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
    if (resumeActiveScorecardRound()) {
        return;
    }

    if (!currentRound) {
        alert("No existing round found. Start a new round first.");
        return;
    }

    setElementDisplay("homeCard", "none");
    setElementDisplay("roundSetupCard", "none");
    setElementDisplay("shotTrackerCard", "block");
    setElementDisplay("summaryCard", "block");
    setElementDisplay("recentShotsCard", "block");
    setElementDisplay("scorecardCard", "block");

    updateHoleDisplay();
    renderShots();
    renderScorecard();
    updateSummary();
}

function showStats() {
    hideAllScreens();

    setElementHidden("statsScreen", false);

    renderHoleAverageStats();
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
    closeRoundModePopup();

    // Save selected mode
    localStorage.setItem("roundMode", "shotTracking");

    // Existing full tracker flow
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
    restoreActiveScorecardProgress();
    renderShots();
    updateSummary();

    setElementDisplay("roundSetupCard", "none");
    setElementDisplay("shotTrackerCard", "none");
    setElementDisplay("summaryCard", "none");
    setElementDisplay("recentShotsCard", "none");
    setElementDisplay("scorecardCard", "none");
}

initializeApp();

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
