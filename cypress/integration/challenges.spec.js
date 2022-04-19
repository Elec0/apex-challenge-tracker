/// <reference types="Cypress" />
import { enterChallenge } from "../plugins/util-functions";

describe("Create a challenge", () => {
    before(() => {
        cy.reload(true);
    });
    beforeEach(() => {
        cy.visit("/");
    })
    it("Creates, verifies, then deletes a new challenge", () => {
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
        enterChallenge("Kill people with sniper rifles as Ash.", "1", "10", "7", true);

        for(let i = 1; i < 13; ++i) {
            cy.get(`[data-cy='lb-week-${i}']`).click();
            enterChallenge("Kill people with sniper rifles as Ash.", "1", "10", "7", true);
            cy.contains(`Week ${i} (0/1)`);
        }
    });

    it.only("Verifies the auto-population and entering of challenges", () => {
        cy.contains("New Challenge").click();
        cy.get(".challenge-editor").should("be.visible");
        cy.contains("Title:");
        cy.contains("Progress:");
    
   
        cy.get("[for-data='title']").type("Find 1500 eggs");
        cy.get("[for-data='max']").should("have.value", 1500);

        cy.get("[for-data='progress']").should("have.value", 0);
        cy.get("[for-data='value']").should("have.value", 0);
        
        // cy.get("[data-cy='edit-checkmark']").click();
    });
});