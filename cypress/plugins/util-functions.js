export function enterChallenge(title, prog, progMax, starVal, fast = false) {
    cy.contains("New Challenge").click();
    cy.get(".challenge-editor").should("be.visible");
    cy.contains("Title:");
    cy.contains("Progress:");

    if (fast) {
        cy.get("[for-data='title']").invoke("text", title);
        cy.get("[for-data='progress']").invoke("text", prog) // Progress
        cy.get("[for-data='max']").invoke("text", progMax); // Max
        cy.get("[data-cy='edit-star']").invoke("text", starVal);
    }
    else {
        cy.get("[for-data='title']").type(title);
        cy.get("[for-data='progress']").clear().type(prog) // Progress
        cy.get("[for-data='max']").clear().type(progMax); // Max
        cy.get("[data-cy='edit-star']").clear().type(starVal);
    }
    cy.get("[data-cy='edit-checkmark']").click();
}    