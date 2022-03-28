import { KEYWORDS, LEGENDS, MODES, TAB_CHALLENGES, TAB_OPTIMAL_PATH, WEAPON_NAMES, WEAPON_TYPES } from "../constants";
import { Navigation } from "../Navigation";
import $, { Cash } from "cash-dom";
import { StorageHelper } from "../storage-helper";
import { ChallengeEntry } from "../challenge/ChallengeEntry";
import pathHtml from "../../content/path.html";
import { NavigationController } from "../NavigationController";
import { ChallengeController } from "../challenge/ChallengeController";


type Count = Array<[string, number]>;

/**
 * 
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
        // Get the actual results
        let [legendResults, weaponTypeResults, 
            weaponResults, modeResults] = this.getCountedResults();

        // Create the outline for our legends, since it's slightly different than the others
        $("#path-content").append(this.makeTitleElem("Legends"));
        let curSection = $("<div>").addClass("entries");
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

        $("#path-content").append(this.makeTitleElem("Modes"));        
        $("#path-content").append(this.parseSpecificResults(modeResults, true));

        $("#path-content").append(this.makeTitleElem("Weapon Types"));        
        $("#path-content").append(this.parseSpecificResults(weaponTypeResults));

        $("#path-content").append(this.makeTitleElem("Weapon"));
        $("#path-content").append(this.parseSpecificResults(weaponResults));
    }

    /** Pull out duplicate code for creating these two tables. */
    private parseSpecificResults(arr: Array<[string, number]>, mode: boolean = false): Cash {
        let curSection = $("<div>").addClass("entries");
        arr.forEach(e => {
            if (e[1] > -1) {
                let newElem = $("<div>").attr("class", "path-entry").attr(`${mode ? "mode-" :""}name`, e[0]);
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

    private getCountedResults(): Count[] {
        let legendCount: Count = new Array();
        let weaponCount: Count = new Array();
        let weaponTypeCount: Count = new Array();
        let modeCount: Count = new Array();
        for (let i of [0, 1, 2, 3])
            modeCount.push([MODES[i], this.keywordCount.get(`Mode${i}`)!]);
        
        // We have the complete list of keywords and counts
        // turn that into 3 separate lists that we can sort and return.
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
        let sorter = (n1: [string, number], n2: [string, number]): number => n2[1] - n1[1];
        
        let legendCountSorted       = legendCount.sort(sorter);
        let weaponTypeCountSorted   = weaponTypeCount.sort(sorter);
        let weaponCountSorted       = weaponCount.sort(sorter);
        let modeCountSorted         = modeCount.sort(sorter);
        return [legendCountSorted, weaponTypeCountSorted, weaponCountSorted, modeCountSorted];
    }

    /**
     * Start calculation of optimal path
     * This is currently k*n, should probably refactor
     */
    private beginCalculation(): void {
        this.parseKeywords();
        // If this is our first loop through the challenges, we're going to count the
        // mode points, but only the first one
        let firstLoop: boolean = true;
        // These match up to the modes enum
        this.keywordCount.set("Mode0", 0);
        this.keywordCount.set("Mode1", 0);
        this.keywordCount.set("Mode2", 0);
        this.keywordCount.set("Mode3", 0);
        
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

                if (firstLoop) {
                    if (!Number.isInteger(value.mode)) {
                        console.warn("Got a mode that wasn't an integer!", value);
                        continue;
                    }
                    // This value for sure exists, we just set it
                    this.keywordCount.set(`Mode${value.mode}`, this.keywordCount.get(`Mode${value.mode}`)! + value.value);
                }
            }
            firstLoop = false; // No double counting
        });
    }

    private parseKeywords(): void {
    }

    /** When a path element is clicked, redirect to the main page w/ the filter applied. */
    public handleEntryClick(event: Event) {
        if (event.target == null) {
            console.error("handleEntryClick event.target is null!");
            return;
        }
        let filterName: string = $(<Element>event.currentTarget).attr("name") ?? 
                                 "," + ($(<Element>event.currentTarget).attr("mode-name") ?? "");
        if (filterName == "" || filterName == ",") {
            console.error("Something went wrong with the click, filter name was not found.");
            return;
        }
        ChallengeController.currentFilter = filterName;
        NavigationController.handleTabClick(TAB_CHALLENGES);
    }
}