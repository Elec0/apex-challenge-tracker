
describe("Create a challenge", () => {
    it("Opens challenges", () => {
        cy.visit("/");
        cy.contains("Challenge").click();
    });

    it("", () => {

    });
    it("Creates new challenge", () => {
        cy.get(".challenge-editor").should("not.be.visible");
        cy.contains("New Challenge").click();
        cy.get(".challenge-editor").should("be.visible");
    });
    it("Types challenge information", () => {
        cy.contains("Title:").next("span").type("Test title");
        cy.contains("Progress:")
            .next("span").clear().type("1") // Progress
            .next("span").clear().type("10"); // Max
    });
    it("Types star value", () => {
        cy.get("div.star-container:visible").find("div").find("span").clear().type("15");
    });
});