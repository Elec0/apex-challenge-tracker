/// <reference types="Cypress" />
import { enterChallenge } from "../plugins/util-functions";

/** Verify a legend's point total */
const legEq = (legName, totVal) => cy.get(`[name='${legName}']`).contains(totVal);

describe("Verify optimal path calculations are correct", () => {
    before(() => {
        cy.reload(true);
    });
    beforeEach(() => {
        cy.visit("/#Optimal-Path");
    });

    /**
        Challenge values:
        Ash: BR: 10
        Bloodhound + Horizon: BR: 10
        Caustic + Seer: BR: 10

        Caustic: A: 10
        Seer: A: 10

        Lifeline + Loba: C: 10

        Everyone: All: 1
        Caustic + Seer: All: 7
        ----
        Total: 68
     */
    it("Tests pre-determined calculations via importing data", () => {
        cy.get("[data-cy='tab-settings']").click();
        cy.fixture("path-data").then(fixData => {
            cy.get("[data-cy='import-export-text-data']").invoke("text", JSON.stringify(fixData));
        });
        cy.get("[data-cy='import-data']").click();
        cy.get("[data-cy='tab-path']").click();

        /*
        BR: 38
        A: 28
        C: 18
        All: 8
        */
        cy.get("[mode-name='BR']").contains("38");
        cy.get("[mode-name='A']").contains("28");
        cy.get("[mode-name='C']").contains("18");
        cy.get("[mode-name='All']").contains("8");
        
        /* - BR -
        Ash: 11
        Caustic: 18
        Seer: 18
        Bloodhound: 11
        Horizon: 11
        Lifeline: 1
        Loba: 1
        */
        // Don't check deselected all first, check it at the end to make sure deselecting works too
        cy.get("[mode-name='BR']").click();
        legEq("Ash", "11");
        legEq("Caustic", "18");
        legEq("Seer", "18");
        legEq("Bloodhound", "11");
        legEq("Horizon", "11");
        legEq("Lifeline", "1");
        legEq("Loba", "1");

        /* - A -
        Caustic: 18
        Seer: 18
        Lifeline: 1
        Loba: 1
        */
        cy.get("[mode-name='A']").click();
        legEq("Caustic", "18");
        legEq("Seer", "18");
        legEq("Lifeline", "1");
        legEq("Loba", "1");


        /* - C -
        Lifeline: 11
        Loba: 11
        Caustic: 8
        Seer: 8
        */
        cy.get("[mode-name='C']").click();
        legEq("Caustic", "8");
        legEq("Seer", "8");
        legEq("Lifeline", "11");
        legEq("Loba", "11");
        
        /* - All -
        Caustic: 8
        Seer: 8
        Lifeline: 1
        Loba: 1
        Ash: 1
        Bloodhound: 1
        Horizon: 1
        */
        cy.get("[mode-name='All']").click();
        legEq("Ash", "1");
        legEq("Caustic", "8");
        legEq("Seer", "8");
        legEq("Bloodhound", "1");
        legEq("Horizon", "1");
        legEq("Lifeline", "1");
        legEq("Loba", "1");

        /* - Deselected [All] -
        Caustic: 28
        Seer: 28
        Ash: 11
        Bloodhound: 11
        Horizon: 11
        Lifeline: 11
        Loba: 11
        */
        // Deselect
        cy.get("[mode-name='All']").click();
        legEq("Ash", "11");
        legEq("Caustic", "28");
        legEq("Seer", "28");
        legEq("Bloodhound", "11");
        legEq("Horizon", "11");
        legEq("Lifeline", "11");
        legEq("Loba", "11");
    });
});
