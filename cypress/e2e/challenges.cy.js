/// <reference types="Cypress" />
import { enterChallenge, setDailyChallenges } from "../plugins/util-functions";

const keywordYellowColor = "rgb(255, 208, 0)";

function swapTabs() {
    cy.get("[data-cy='tab-settings']").click();
    cy.get("[data-cy='tab-challenges']").click();
}

/** Set the daily challenge status and navigate back to challenges tab */
function _setDailyChallenges(isEnabled) {
    setDailyChallenges(isEnabled);
    cy.contains("Challenges").click();
}

describe("Enable and disable daily challenges", () => {
    before(() => {
        cy.reload(true);
    });
    beforeEach(() => {
        cy.visit("/");
    });
    it("Enables daily challenges", () => {
        _setDailyChallenges(false);

        cy.get("#left-bar").contains("Daily")
            .should("not.exist");

        _setDailyChallenges(true);

        cy.get("#left-bar").contains("Daily")
            .should("exist");
    });

    it("Disables daily challenges", () => {
        // We don't need to set this to true because it's null (true) by default at start
        cy.get("#left-bar").contains("Daily")
            .should("exist");

        _setDailyChallenges(false);
        cy.reload();

        cy.get("#left-bar").contains("Daily")
            .should("not.exist");
    });
});

describe("Daily challenges render correctly", () => {
    beforeEach(() => {
        cy.visit("/");
    });

    it("Renders daily challenges when setting is enabled", () => {
        cy.get("#left-bar").contains("Daily")
            .should("exist");

        cy.get("[data-cy='tab-settings']").click();

        cy.fixture("single-daily-challenge").then(fixData => {
            cy.get("[data-cy='import-export-text-data']").invoke("text", JSON.stringify(fixData));
        });
        cy.get("[data-cy='import-data']").click();

        cy.get("[data-cy='tab-challenges']").click();

        // Verify there is a challenge visible
        cy.get("#challenge-content-area")
            .get(".challenge-bar").should("exist");
    });

    it("Does not render daily challenges when setting is disabled", () => {
        _setDailyChallenges(false);
        swapTabs();

        cy.get("#left-bar").contains("Daily")
            .should("not.exist");

        cy.get("[data-cy='tab-settings']").click();

        cy.fixture("single-daily-challenge").then(fixData => {
            cy.get("[data-cy='import-export-text-data']").invoke("text", JSON.stringify(fixData));
        });
        cy.get("[data-cy='import-data']").click();

        cy.get("[data-cy='tab-challenges']").click();

        // Verify there are no challenges visible
        cy.get("#challenge-content-area")
            .get(".challenge-bar").should("not.exist");
    });
});

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

        // Find the whole text, get the color from the keyword, then check that all the text is not the keyword color
        cy.contains("Deal damage as Bangalore.").as("challengeText")
            .find("span").invoke("css", "color")
            .then(function (keywordColor) {
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

        for (let i = 1; i < 13; ++i) {
            cy.get(`[data-cy='lb-week-${i}']`).click();
            enterChallenge("Kill people with sniper rifles as Ash.", "1", "10", "7", true);
            cy.contains(`Week ${i} (0/1)`);
        }
    });

    it("Verifies the auto-population and entering of challenges", () => {
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

    it("Verifies the legend class types properly keywordify", () => {
        cy.get("[data-cy='tab-challenges']").click();

        cy.get(".challenge-editor").should("not.exist");
        enterChallenge("Kill enemies as a Controller class", "1", "10", "15");

        cy.contains("Kill enemies as a Controller class").as("challengeText")
            .find("span")
            .invoke("css", "color")
            .then(function (keywordColor) {
                expect(keywordColor).to.equal(keywordYellowColor);
            });
    });

});