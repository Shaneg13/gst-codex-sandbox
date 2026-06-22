// Golf Shot Tracker general-purpose helpers.
// Keep feature calculations in app.js until regression tests protect them.

function formatDateForDisplay(dateValue) {
    if (!dateValue) {
        return "";
    }

    const parts = dateValue.split("-");

    if (parts.length !== 3) {
        return dateValue;
    }

    const year = parts[0];
    const month = Number(parts[1]);
    const day = Number(parts[2]);

    return month + "/" + day + "/" + year;
}
