export function enterChallenge(title, prog, progMax, starVal) {
    cy.contains("New Challenge").click();
    cy.get(".challenge-editor").should("be.visible");

    cy.contains("Title:").next("span").type(title);
    cy.contains("Progress:")
        .next("span").clear().type(prog) // Progress
        .next("span").clear().type(progMax); // Max

    cy.get("[data-cy='edit-star']").clear().type(starVal);

    cy.get("[data-cy='edit-checkmark']").click();
}