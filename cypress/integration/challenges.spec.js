/// <reference types="Cypress" />
import { enterChallenge } from "../plugins/util-functions";

describe("Create a challenge", () => {
    it("Creates, verifies, then deletes a new challenge", () => {
        cy.visit("/");
        cy.get("[data-cy='tab-challenges']").click();

        cy.get(".challenge-editor").should("not.exist");
        enterChallenge("Deal damage as Bangalore.", "1", "10", "15");

        // Getting multiple things is kind of a pain
        cy.contains("Deal damage as Bangalore.").as("challengeText")
            .find("span").invoke("css", "color")
            .then(function(keywordColor) {
                cy.get(this.challengeText).invoke("css", "color").should("not.equal", keywordColor);
            });
        
        cy.contains("span", "BR");
        cy.contains("1/10");
        cy.contains("+15");

        cy.get("[data-cy='edit-button']").click();
        cy.get("[data-cy='edit-delete']").click();
        cy.get(".challenge-bar").should("not.exist");
    });

    it("Verifiy the interval buttons work properly with a newly created challenge", () => {
        cy.visit("/");

        cy.get(".challenge-editor").should("not.exist");
        enterChallenge("Kill peopl with sniper rifles as Ash.", "1", "10", "7");

        cy.contains("1/10");
        cy.get("[data-cy='dot-plus']").click();
        cy.contains("2/10");
        cy.get("[data-cy='dot-plus']").dblclick();
        cy.contains("4/10");
        cy.get("[data-cy='dot-minus']").click();
        cy.contains("3/10");
        cy.get("[data-cy='star-five']").click();
        cy.contains("Completed");
    });

    it("Verifies the left bar properly counts challenges", () => {
        cy.visit("/");

        enterChallenge("Kill people with sniper rifles as Ash.", "1", "10", "7", true);

        for(let i = 1; i < 13; ++i) {
            cy.get(`[data-cy='lb-week-${i}']`).click();
            enterChallenge("Kill people with sniper rifles as Ash.", "1", "10", "7", true);
            cy.contains(`Week ${i} (0/1)`);
        }
    });
});