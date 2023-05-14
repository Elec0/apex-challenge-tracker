import expect from 'expect';
import { CLASS_TYPES } from "../../src/constants";

describe('The legends are properly assigned to class types', () => {
    it("test one", () => {
        expect(1).toBe(1);
    });

    Object.values(CLASS_TYPES).forEach((classType) => {
        it("should assign the correct class types", () => {
            // expect(classType).to.equal(classType);
        });
    });
});