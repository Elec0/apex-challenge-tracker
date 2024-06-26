/// <reference types="Cypress" />
import { CLASS_TYPES, CLASS_LEGENDS } from "src/constants";
import { enterChallenge } from "../plugins/util-functions";
import { goToChallenges, goToPath, goToSettings } from "../plugins/nav-helper";

/** Verify an entry's point total */
const valueEq = (valName, totVal) => cy.get(`[name='${valName}']`).contains(totVal);

function importData(dataName = "path-data") {
    goToSettings();
    cy.fixture(dataName).then(fixData => {
        cy.get("[data-cy='import-export-text-data']").invoke("text", JSON.stringify(fixData));
    });
    cy.get("[data-cy='import-data']").click();
}

describe("Verify optimal path calculations are correct", () => {
    before(() => {
        cy.reload(true);
    });
    beforeEach(() => {
        cy.visit("/#Optimal-Path");
    });

    it("Properly calculates the new class type values", () => {
        importData();

        goToChallenges();
        // There are 5 class types
        Object.values(CLASS_TYPES).forEach(element => {
            enterChallenge(`Damage with ${element} legends`, 0, 10, 1, true);
        });

        // Go back to path tab
        goToPath();
        // Verify that the extra 5 points have been added to BR
        cy.get("[mode-name='BR']").contains("43"); // 38 + 5 = 43

        Object.values(CLASS_TYPES).forEach(element => {
            valueEq(element, "1");
        });

    });

    it("Includes class types in character totals", () => {
        // Import data with a new challenge, a 1 pointer for the 'Assault' class
        importData("path-class-data");
        goToPath();

        // Check that the Assault class has been added to the character totals
        // Ash and Ballistic should have 2 points each, the rest should have 1
        Object.values(CLASS_LEGENDS[CLASS_TYPES.Assault]).forEach(element => {
            const expectedValue = element === "Ash" || element === "Ballistic" ? "2" : "1";
            valueEq(element, expectedValue);
        });
    });

    it("Includes class type challenges in character search", () => {
        // Import data with a new challenge, a 1 pointer for the 'Assault' class
        importData("path-class-data");
        goToPath();

        // Check that the Assault challenge shows up in Ash's search
        // Click <div class="path-entry" name="Ash">
        cy.get("[name='Ash']").click();

        // Check that the challenge with Assault in its text shows up
        // i.e. <span class="keyword">Assault</span> exists
        cy.get("span.keyword").contains("Assault");
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
        importData();
        goToPath();

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
        valueEq("Ash", "11");
        valueEq("Caustic", "18");
        valueEq("Seer", "18");
        valueEq("Bloodhound", "11");
        valueEq("Horizon", "11");
        valueEq("Lifeline", "1");
        valueEq("Loba", "1");

        /* - A -
        Caustic: 18
        Seer: 18
        Lifeline: 1
        Loba: 1
        */
        cy.get("[mode-name='A']").click();
        valueEq("Caustic", "18");
        valueEq("Seer", "18");
        valueEq("Lifeline", "1");
        valueEq("Loba", "1");


        /* - C -
        Lifeline: 11
        Loba: 11
        Caustic: 8
        Seer: 8
        */
        cy.get("[mode-name='C']").click();
        valueEq("Caustic", "8");
        valueEq("Seer", "8");
        valueEq("Lifeline", "11");
        valueEq("Loba", "11");

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
        valueEq("Ash", "1");
        valueEq("Caustic", "8");
        valueEq("Seer", "8");
        valueEq("Bloodhound", "1");
        valueEq("Horizon", "1");
        valueEq("Lifeline", "1");
        valueEq("Loba", "1");

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
        valueEq("Ash", "11");
        valueEq("Caustic", "28");
        valueEq("Seer", "28");
        valueEq("Bloodhound", "11");
        valueEq("Horizon", "11");
        valueEq("Lifeline", "11");
        valueEq("Loba", "11");
    });
});
