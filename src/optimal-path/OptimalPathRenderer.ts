import $, { Cash } from "cash-dom";
import { MODES } from "../constants";
import { Count, OptimalPathController } from "./OptimalPathController";

export class OptimalPathRenderer {
    private pathController: OptimalPathController;

    /** Use dependency injection to hang on to the parent reference */
    constructor(pathController: OptimalPathController) {
        this.pathController = pathController;
    }

    public makeTitleElem(text: string): Cash {
        return $("<div>").addClass("title-break")
            .append($("<h2>").addClass("title-break").text(text));
    }

    /** 
     * Pull out duplicate code for creating these two tables.
     * 
     */
    public parseSpecificResults(arr: Array<[string, number]>, mode: boolean = false): Cash {
        let curSection = $("<div>").addClass("entries");
        arr.forEach(e => {
            if (e[1] > 0) {
                let newElem = $("<div>").attr("class", "path-entry").attr(`${mode ? "mode-" : ""}name`, e[0]);
                if (this.pathController.currentKeywordMode != 0 && 
                        e[0] == MODES[this.pathController.currentKeywordMode - 1])
                    newElem.addClass("selected");

                newElem.append($("<span>").text(`${e[0]}`).addClass("legend-name"));
                newElem.append($("<span>").text(`${e[1]}`));
                curSection.append(newElem);
            }
        });
        return curSection;
    }
    
    /**
     * Given input lists, generate the lists for legends, weapon types, weapons, and modes.
     * @param Result of {@link OptimalPathController.getCountedResults()} 
     */
    public createPathElements([legendResults, weaponTypeResults, weaponResults, modeResults]: Array<Count>) {
        let curSection = $("<div>").addClass("entries");

        $("#path-content").append(this.parseSpecificResults(modeResults, true));

        // Create the outline for our legends, since it's slightly different than the others
        $("#path-content").append(this.makeTitleElem("Legends"));
        curSection = $("<div>").addClass("entries");
        legendResults.forEach(e => {
            if (e[1] > 0) {
                let newElem = $("<div>").attr("class", "path-entry").attr("name", e[0]);
                newElem.append($("<img>").attr("style", "width: 10em").attr("src", `res/images/legends/${e[0].replace(" ", "-").toLowerCase()}.png`));
                newElem.append($("<div>").addClass("path-entry-text")
                    .append($("<span>").text(`${e[0]}`).addClass("legend-name"))
                    .append($("<span>").text(`${e[1]}`)));
                curSection.append(newElem);
            }
        });
        $("#path-content").append(curSection);

        $("#path-content").append(this.makeTitleElem("Weapon Types"));        
        $("#path-content").append(this.parseSpecificResults(weaponTypeResults));

        $("#path-content").append(this.makeTitleElem("Weapons"));
        $("#path-content").append(this.parseSpecificResults(weaponResults));
    }
}