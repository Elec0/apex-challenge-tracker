
describe("Create a challenge", () => {
    it("Creates a new challenge: BR, has a name, isn't completed, and has stars", () => {
        cy.visit("/");
        cy.contains("Challenge").click();

        cy.get(".challenge-editor").should("not.exist");
        cy.contains("New Challenge").click();
        cy.get(".challenge-editor").should("be.visible");

        cy.contains("Title:").next("span").type("Test title");
        cy.contains("Progress:")
            .next("span").clear().type("1") // Progress
            .next("span").clear().type("10"); // Max

        cy.get("div.star-container > div > span").clear().type("15");

        cy.get(".star-container > div.edit-checkmark").click();
    });
});