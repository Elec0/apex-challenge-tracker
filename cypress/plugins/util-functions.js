export function enterChallenge(title, prog, progMax, starVal, fast = false) {
    cy.contains("New Challenge").click();
    cy.get(".challenge-editor").should("be.visible");
    cy.contains("Title:");
    cy.contains("Progress:");

    if (fast) {
        cy.get("[for-data='title']").invoke("val", title);
        cy.get("[for-data='progress']").invoke("val", prog) // Progress
        cy.get("[for-data='max']").invoke("val", progMax); // Max
        cy.get("[for-data='value']").invoke("val", starVal);
    }
    else {
        cy.get("[for-data='title']").type(title);
        cy.get("[for-data='progress']").clear().type(prog) // Progress
        cy.get("[for-data='max']").clear().type(progMax); // Max
        cy.get("[for-data='value']").clear().type(starVal);
    }
    cy.get("[data-cy='edit-checkmark']").click();
}

/** Goes to settings page and toggles daily challenges if needed. */
export function setDailyChallenges(isEnabled) {
    cy.contains("Settings").click();

    cy.get("[data-cy='toggle-daily-data']")
        .invoke("text")
        .then((curText) => {
            if (curText.includes("Enabled")) {
                if (!isEnabled) {
                    // Switch status
                    cy.get("[data-cy='toggle-daily-data']").click();
                }
            }
            else { // Currently disabled
                if (isEnabled) {
                    // Switch status
                    cy.get("[data-cy='toggle-daily-data']").click();
                }
            }
        });
}