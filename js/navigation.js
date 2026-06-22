// Golf Shot Tracker screen visibility helpers.
// Feature-specific navigation remains in app.js; only shared DOM mechanics
// live here.

function setElementDisplay(elementId, displayValue) {
    const element = document.getElementById(elementId);

    if (element) {
        element.style.display = displayValue;
    }
}

function setElementHidden(elementId, shouldHide) {
    const element = document.getElementById(elementId);

    if (!element) {
        return;
    }

    element.classList.toggle("hidden", shouldHide);
}

function hideAllScreens() {
    const cardScreenIds = [
        "homeCard",
        "roundSetupCard",
        "shotTrackerCard",
        "summaryCard",
        "scorecardCard",
        "recentShotsCard"
    ];

    const hiddenClassScreenIds = [
        "scorecardScreen",
        "recentRoundsScreen",
        "roundDetailScreen",
        "courseInfoScreen",
        "pastRoundScreen",
        "statsScreen",
        "headToHeadScreen"
    ];

    cardScreenIds.forEach(function(elementId) {
        setElementDisplay(elementId, "none");
    });

    hiddenClassScreenIds.forEach(function(elementId) {
        setElementHidden(elementId, true);
    });
}
