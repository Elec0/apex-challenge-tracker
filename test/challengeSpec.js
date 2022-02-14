const { ChallengeRenderer } = require("../src/Challenge");

describe('ChallengeRenderer', function() {

    it('Should generate proper mode span', function() {
        let result = ChallengeRenderer.modeify("BR");
        expect(result.attr("class")).toContain("cb-type")
        expect(result.attr("class")).toContain("type-br")
        expect(result.text()).toContain("BR")
    });

  });