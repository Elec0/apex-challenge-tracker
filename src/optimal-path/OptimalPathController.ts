import { KEYWORDS, LEGENDS, TAB_CHALLENGES, TAB_OPTIMAL_PATH, WEAPON_NAMES, WEAPON_TYPES } from "../constants";
import { Navigation } from "../Navigation";
import $, { Cash } from "cash-dom";
import { StorageHelper } from "../storage-helper";
import { ChallengeEntry } from "../challenge/ChallengeEntry";
import pathHtml from "../../content/path.html";
import { NavigationController } from "../NavigationController";
import { ChallengeController } from "../challenge/ChallengeController";


/**
 * TODO: Weigh challenges closer to completion higher?
 */
export class OptimalPathController extends Navigation {
    private keywordCount: Map<string, number> = new Map();
    /** List of keywords present in a given challenge */
    private challengeKeywordMap: Map<ChallengeEntry, Array<string>> = new Map();

    navigateTo(): void {
        if (!this.isShowing) {
            super.navigateTo();
            this.setHash(TAB_OPTIMAL_PATH);
            $("#root-container").append(pathHtml);
            this.challengeKeywordMap = new Map();
            this.keywordCount = new Map();

            this.beginCalculation();
            // We want the results split up into category, then sorted by max value possible
            this.parseResults();
            $(".path-entry").on("click", this.handleEntryClick);

        }
    }
    navigateAway(): void {
        super.navigateAway();
        $("#path-content-area").remove();
    }

    private parseResults(): void {
        let [legendResults, weaponTypeResults, weaponResults] = this.getCountedResults();
        console.debug(legendResults, weaponTypeResults, weaponResults);

        $("#path-content").append(this.makeTitleElem("Legends"));
        let curSection = $("<div>").addClass("entries");
        legendResults.forEach(e => {
            if (e[1] > 0) {
                let newElem = $("<div>").attr("class", "path-entry").attr("name", e[0]);
                newElem.append($("<img>").attr("style", "width: 10em").attr("src", `res/images/legends/${e[0].replace(" ", "-")}.png`));
                newElem.append($("<div>").addClass("path-entry-text")
                    .append($("<span>").text(`${e[0]}`).addClass("legend-name"))
                    .append($("<span>").text(`${e[1]}`)));
                curSection.append(newElem);
            }
        });
        $("#path-content").append(curSection);

        $("#path-content").append(this.makeTitleElem("Weapon Types"));        
        $("#path-content").append(this.parseSpecificResults(weaponTypeResults));

        $("#path-content").append(this.makeTitleElem("Weapon"));
        $("#path-content").append(this.parseSpecificResults(weaponResults));
    }

    private parseSpecificResults(arr: Array<[string, number]>): Cash {
        let curSection = $("<div>").addClass("entries");
        arr.forEach(e => {
            if (e[1] > -1) {
                let newElem = $("<div>").attr("class", "path-entry").attr("name", e[0]);
                newElem.append($("<span>").text(`${e[0]}`).addClass("legend-name"));
                newElem.append($("<span>").text(`${e[1]}`));
                curSection.append(newElem);
            }
        });
        return curSection;
    }

    private makeTitleElem(text: string): Cash {
        return $("<div>").addClass("title-break")
            .append($("<h2>").addClass("title-break").text(text));
    }

    private getCountedResults(): [ Array<[string, number]>, 
                                    Array<[string, number]>, 
                                    Array<[string, number]> ] {
        let legendCount: Array<[string, number]> = new Array();
        let weaponCount: Array<[string, number]> = new Array();
        let weaponTypeCount: Array<[string, number]> = new Array();

        for (let [key, value] of this.keywordCount) {
            if (LEGENDS.includes(key)) {
                legendCount.push([key, value]);
            }
            else if (WEAPON_TYPES.includes(key)) {
                weaponTypeCount.push([key, value]);
            }
            else if (WEAPON_NAMES.includes(key)) {
                weaponCount.push([key, value]);
            }
        }

        // Now sort it, descending order
        let legendCountSorted = legendCount.sort((n1, n2) => n2[1] - n1[1]);
        let weaponTypeCountSorted = weaponTypeCount.sort((n1, n2) => n2[1] - n1[1]);
        let weaponCountSorted = weaponCount.sort((n1, n2) => n2[1] - n1[1]);
        return [legendCountSorted, weaponTypeCountSorted, weaponCountSorted];
    }

    /**
     * Start calculation of optimal path
     * This is currently k*n, should probably refactor
     */
    private beginCalculation(): void {
        // this.keywordCount = OptimalPathController.buildConstKeywordLists();
        this.parseKeywords();
        // Start by going through each challenge's keywords, incrementing a counter when finding one
        KEYWORDS.forEach(element => {
            // Init the map
            this.keywordCount.set(element, 0);

            for (let [key, value] of StorageHelper.challenges) {
                // Shouldn't process anything if the challenge is done
                if (value.isCompleted())
                    continue;

                if (value.text.indexOf(element) != -1) {
                    let cA: Array<string> = this.challengeKeywordMap.get(value) ?? new Array();
                    cA.push(element);

                    this.challengeKeywordMap.set(value, cA);
                    // Add challenge's star value to tally
                    this.keywordCount.set(element, (this.keywordCount.get(element) ?? 0) + value.value);
                }
            }
        });
    }

    private parseKeywords(): void {
    }

    public static buildConstKeywordLists(): Map<string, number> {
        let result: Map<string, number> = new Map();
        // Init the empty map with counts
        KEYWORDS.forEach(element => {
            result.set(element, 0);
        });
        return result;
    }

    public handleEntryClick(event: Event) {
        if (event.target == null) {
            console.error("handleEntryClick event.target is null!");
            return;
        }
        let filterName: string = $(<Element>event.currentTarget).attr("name") ?? "";
        if (filterName == "") {
            console.error("Something went wrong with the click, filter name was not found.");
            return;
        }
        ChallengeController.currentFilter = filterName;
        NavigationController.handleTabClick(TAB_CHALLENGES);
    }
}