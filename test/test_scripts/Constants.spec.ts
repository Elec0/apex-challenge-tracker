import expect from 'expect';
import { CLASS_LEGENDS, CLASS_TYPES, LEGENDS, LEGEND_CLASSES } from "../../src/constants";

describe('The legends are properly assigned to class types', () => {

    Object.values(LEGENDS).forEach((legend) => { 
        let classType = CLASS_TYPES[LEGEND_CLASSES[legend]];
        
        test(`'${legend}' should be in a class type`, () => {
            expect(classType).toBeDefined();
        });
        test(`legends in class '${classType}' should contain '${legend}'`, () => {
            expect(CLASS_LEGENDS[classType]).toContain(legend);
        });
    });
});