/// <reference types="Cypress" />

describe("Create a challenge", () => {
    it("Creates a new challenge: BR, has a name, isn't completed, and has stars", () => {
        cy.visit("/");
        cy.contains("Challenge").click();

        cy.get(".challenge-editor").should("not.exist");
        cy.contains("New Challenge").click();
        cy.get(".challenge-editor").should("be.visible");

        cy.contains("Title:").next("span").type("Deal damage as Bangalore.");
        cy.contains("Progress:")
            .next("span").clear().type("1") // Progress
            .next("span").clear().type("10"); // Max

        cy.get("div.star-container > div > span").clear().type("15");

        cy.get("[data-cy='edit-checkmark']").click();
    });
    it("Verifies the challenge entered has correct formatting and information", () => {
        // Getting multiple things is kind of a pain 
        cy.contains("Deal damage as Bangalore.").as("challengeText")
            .find("span").invoke("css", "color")
            .then(function(keywordColor) {
                cy.get(this.challengeText).invoke("css", "color").should("not.equal", keywordColor);
            });
        
        cy.contains("span", "BR");
        cy.contains("1/10");

        cy.contains("+15");
    });
});