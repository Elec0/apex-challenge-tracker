export function goToChallenges() {
    _getTab("challenges").click();
}
export function goToPath() {
    _getTab("path").click();
}
export function goToSettings() {
    _getTab("settings").click();
}

/** Get the main tabs */
function _getTab(text) {
    return cy.get(`[data-cy='tab-${text}']`);
}