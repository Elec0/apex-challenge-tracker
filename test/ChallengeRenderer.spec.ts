import expect from 'expect';
import { ChallengeRenderer } from '../src/challenge/ChallengeRenderer';
import { MODES } from '../src/constants';

test('adds 1 + 2 to equal 3', () => {
    expect(1+ 2).toBe(3);
});

test("Generate proper mode span", () => {
    let result = ChallengeRenderer.modeify(MODES.BR);
    expect(result.attr("class")).toContain("cb-type");
    expect(result.attr("class")).toContain("type-br")
    expect(result.text()).toContain("BR")
});
test("Properly Keywordify", () => {
    let toTest = ChallengeRenderer.keywordify("Time to kill xxx with Seer and a light machine guns");
    expect(toTest.html()).toContain("<span class=\"keyword\">Seer</span>");
    expect(toTest.html()).toContain("<span class=\"keyword\">light machine guns</span>");
});
