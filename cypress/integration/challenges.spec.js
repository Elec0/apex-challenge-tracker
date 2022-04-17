/// <reference types="Cypress" />
import { enterChallenge } from "../plugins/util-functions";

describe("Create a challenge", () => {
    it("Creates a new challenge: BR, has a name, isn't completed, and has stars", () => {
        cy.visit("/");
        cy.get("[data-cy='tab-challenges']").click();

        cy.get(".challenge-editor").should("not.exist");
        enterChallenge("Deal damage as Bangalore.", "1", "10", "15");
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
    it("Deletes the challenge", () => {
        cy.get("[data-cy='edit-button']").click();
        cy.get("[data-cy='edit-delete']").click();
        cy.get(".challenge-bar").should("not.exist");
    });
});