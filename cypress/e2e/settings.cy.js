/// <reference types="Cypress" />
import { enterChallenge } from "../plugins/util-functions";

describe("Clear localStorage", () => {
    beforeEach(() => {
        cy.visit("/");
    });
    it("Creates a new challenge", () => {        
        enterChallenge("Challenge to be deleted", "5", "20", "2");
    });
    it("Clears the storage with the settings button", () => {
        cy.get("[data-cy='tab-settings']").click();
        cy.get("[data-cy='delete-data']").click();

        cy.get("[data-cy='tab-challenges']").click();
        cy.get(".challenge-bar").should("not.exist");
    });
});

describe("Import challenge data", () => {
    beforeEach(() => {
        cy.visit("/");
    });

    it("Loads challenge data properly", () => {
        cy.get("[data-cy='tab-settings']").click();
        cy.fixture("settings-data").then(settingsData => {
            cy.get("[data-cy='import-export-text-data']").invoke("text", JSON.stringify(settingsData));
        });

        cy.get("[data-cy='import-data']").click();
        cy.get("[data-cy='tab-challenges']").click();

        cy.contains("Do 5000 damage as Bloodhound");
        cy.contains("4500/5000");

        cy.get("[data-cy='star-container']").should("have.length", 2);

        cy.contains("Week 12 (2/3)").click();
        cy.get("[data-cy='mode']").should("have.length", 3).should("contain.text", "C");
    });
});

describe("Export challenge data", () => {
    beforeEach(() => {
        cy.visit("/");
    });
    it("Will properly export data", () => {
        enterChallenge("Challenge to be exported", "5", "20", "2");
        cy.get("[data-cy='tab-settings']").click();
        cy.get("[data-cy='export-data']").click();
    });

});