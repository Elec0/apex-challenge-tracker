const { ChallengeRenderer, ChallengeEntry } = require("../src/Challenge");
const { KEYWORDS } = require("../src/constants");

describe('ChallengeRenderer', function() {

    it('Should generate proper mode span', function() {
        let result = ChallengeRenderer.modeify("BR");
        expect(result.attr("class")).toContain("cb-type")
        expect(result.attr("class")).toContain("type-br")
        expect(result.text()).toContain("BR")
    });

    it("Should make correct words keywords", function () {
        let toTest = ChallengeRenderer.keywordify("Time to kill xxx with Seer and a Light Machine Gun");
        expect(toTest.html()).toContain("<span class=\"keyword\">Seer</span>");
        expect(toTest.html()).toContain("<span class=\"keyword\">Light Machine Gun</span>");
    });

  });