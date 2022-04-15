import { KEYWORDS, LEGENDS, MODES, NumModes, TAB_CHALLENGES, TAB_OPTIMAL_PATH, WEAPON_NAMES, WEAPON_TYPES } from "../constants";
import { Navigation } from "src/Navigation";
import $, { Cash } from "cash-dom";
import { StorageHelper } from "src/storage-helper";
import pathHtml from "content/path.html";
import { NavigationController } from "src/NavigationController";
import { ChallengeController } from "src/challenge/ChallengeController";
import { OptimalPathRenderer } from "./OptimalPathRenderer";


export type Count = Array<[string, number]>;

/**
 * 
 */
export class OptimalPathController extends Navigation {
   
    /** Index of modeKeywordCount that we are currently displaying (what mode is selected) */
    public currentKeywordMode: number = 0;
    /** 
     * A summed value of each keyword, separated by mode
     * 0 = All challenges, no filter
     * 1 = MODES.All
     * 2 = MODES.BR
     * 3 = MODES.A
     * 4 = MODES.C
     * 
     * Ex:
     * 
     * modeKeywordCount[2]["Ash"] is value of challenges that need ash in mode 2 (BR)
     * 
     * Special case: index 0 contains the aggregated stars of each mode, stored as 'Mode0-4'
     */
    private modeKeywordCount: Array<Map<string, number>> = new Array(NumModes + 1);

    private pathRenderer: OptimalPathRenderer = new OptimalPathRenderer(this);
    
    navigateTo(): void {
        if (!this.isShowing) {
            super.navigateTo();
            this.setHash(TAB_OPTIMAL_PATH);
            $("#root-container").append(pathHtml);
            
            this.loadPathContent();
        }
    }
    navigateAway(): void {
        super.navigateAway();
        $("#path-content-area").remove();
    }

    /** We want the results split up into category, then sorted by max value possible */
    private loadPathContent() {
        // Ensure we start with empty slate
        $("#path-content").empty();
        this.modeKeywordCount = new Array(NumModes + 1);

        this.beginCalculation();
        this.parseResults();
        // Make `this` in the method be the object
        $(".path-entry").on("click", this.handleClickEntry.bind(this));
    }

    private parseResults(): void {
        // Get the actual results
        this.pathRenderer.createPathElements(this.getCountedResults());
        
    }

    /**
     * Filter and sort challenge counts
     * 
     * Which to display is selected via index by {@link currentKeywordMode}.
     * 
     * modeCountSorted is always the same, as it reads from index 0.
     * @returns 4 arrays of {@link Count}: legendCountSorted, weaponTypeCountSorted, weaponCountSorted, modeCountSorted
     */
    private getCountedResults(): Count[] {
        let legendCount: Count = new Array();
        let weaponCount: Count = new Array();
        let weaponTypeCount: Count = new Array();
        let modeCount: Count = new Array();
        for (let i of [0, 1, 2, 3])
            modeCount.push([MODES[i], this.modeKeywordCount[0].get(`Mode${i}`)!]);
        
        // We have the complete list of keywords and counts
        // turn that into 3 separate lists that we can sort and return.
        for (let [key, value] of this.modeKeywordCount[this.currentKeywordMode]) {
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
     * Note: this only needs to be called once, the all the other calculations we might
     * need to display are stored at different indexes
     * 
     * Start calculation of optimal path
     * 
     * Sum the following:
     * 1. Stars in all common modes
     * 2. Stars for each KEYWORD
     * 3. Stars for each KEYWORD, separated by mode
     */
    private beginCalculation(): void {
        // If this is our first loop through the challenges, we're going to count the
        // mode points, but only the first one
        let firstLoop: boolean = true;

        // Init the array<map> outside of the main loop
        for (let i = 0; i < this.modeKeywordCount.length; ++i) {
            if (this.modeKeywordCount[i] == undefined)
                this.modeKeywordCount[i] = new Map();
        }
        // Start by going through each challenge's keywords, incrementing a counter when finding one
        KEYWORDS.forEach(element => {
            // Init the map
            // i in = index
            for (let i in this.modeKeywordCount) {
                this.modeKeywordCount[i].set(element, 0);
            }

            for (let [key, value] of StorageHelper.challenges) {
                // Shouldn't process anything if the challenge is done
                if (value.isCompleted())
                    continue;
                
                if (value.text.includes(element)) {
                    // Add challenge's star value to tally
                    // Add it twice: once to the 0th, which has all totals of everything
                    this.modeKeywordCount[0].set(element, (this.modeKeywordCount[0].get(element) ?? 0) + value.value);
                    // Then again to the one with the matching mode
                    let offsetMode: number = value.mode + 1;
                    this.modeKeywordCount[offsetMode].set(element, (this.modeKeywordCount[offsetMode].get(element) ?? 0) + value.value);
                    
                    // We want each challenge with 'All' mode to be included in every applicable keyword sum, since a challenge
                    // with All applies to all the modes, in addition to being able to be filtered by All only.
                    if (value.mode == MODES["All"]) {
                        // j is the whole array index, which is offset by 1 since 0th is all totals
                        for (let j = 2; j < this.modeKeywordCount.length; ++j) {
                            this.modeKeywordCount[j].set(element, (this.modeKeywordCount[j].get(element) ?? 0) + value.value);
                        }
                    }
                }

                // If this is the first time through challenges, sum up the values into their respective modes
                if (firstLoop) {
                    if (!Number.isInteger(value.mode)) {
                        console.warn("Got a mode that wasn't an integer!", value);
                        continue;
                    }
                    // This mode+x value might not exist
                    this.modeKeywordCount[0].set(`Mode${value.mode}`, 
                                                (this.modeKeywordCount[0].get(`Mode${value.mode}`) ?? 0) + value.value);
                    // Add the count for this challenge to all other modes if it's 'All'
                    if (value.mode == MODES["All"]) {
                        // j is the whole array index, which is offset by 1 since 0th is all totals
                        for (let j = 2; j < this.modeKeywordCount.length; ++j) {
                            this.modeKeywordCount[0].set(`Mode${j - 1}`, 
                                (this.modeKeywordCount[0].get(`Mode${j - 1}`) ?? 0) + value.value);
                        }
                    }
                }
            }
            firstLoop = false; // No double counting
        });
    }

    /** When a path element is clicked, redirect to the main page w/ the filter applied. */
    public handleClickEntry(event: Event) {
        if (event.target == null) {
            console.error("handleEntryClick event.target is null!");
            return;
        }
        // Determine if they clicked a mode
        let cTarget: Cash = $(<Element>event.currentTarget);
        if (cTarget.attr("mode-name") != undefined) {
            this.handleClickModeEntry(cTarget);
            return;
        }

        // Append the mode filter if we have a non-0 mode selected
        // Include All challenges, since they are included in the displayed calculations
        // Not technically needed for 'All', but whatever
        let filterName: string = (cTarget.attr("name") ?? "") + 
                                 (this.currentKeywordMode != 0 ? `,${MODES[this.currentKeywordMode - 1]}*` : "");

        if (filterName == "" || filterName == ",") {
            console.error("Something went wrong with the click, filter name was not found.");
            return;
        }
        console.debug("Click", cTarget.attr("name"));

        ChallengeController.currentFilter = filterName;
        NavigationController.handleTabClick(TAB_CHALLENGES);
    }

    /** Called when an element that is `.path-entry[mode-name]` is clicked */
    public handleClickModeEntry(elem: Cash) {
        let oldSelected: Cash = $(".path-entry[mode-name].selected");
        
        if (oldSelected.length) {
            this.handleDeselectMode(oldSelected);
        }
        console.debug("Click mode", elem.attr("mode-name"));
        // If we're just deselecting, reload the content, we've already called handleDeselectMode
        if (oldSelected.attr("mode-name") == elem.attr("mode-name")) {
            this.loadPathContent();
            return;
        }

        // We are selecting something
        this.handleSelectMode(elem);
    }

    /** 
     * Remove the border, and unfilter everything. Don't reload path content here, as if we're selecting something
     * else we'd do the whole load twice.
     */
    private handleDeselectMode(elem: Cash) {
        if (elem.length > 1) {
            console.warn(`Something weird happened! Expected selector of 1, got ${elem.length} instead`);
        }
        elem.removeClass("selected");
        this.currentKeywordMode = 0;
    }

    /** Add class, which is border, and set currentKeywordMode. Then re-filter everything. */
    private handleSelectMode(elem: Cash) {
        elem.addClass("selected");
        const modeName: string = elem.attr("mode-name")!;
        // Enums are, in fact, still dumb
        const indexOfName: number = parseInt(Object.keys(MODES)[Object.values(MODES).indexOf(modeName as unknown as MODES)]) + 1;

        this.currentKeywordMode = indexOfName;
        console.debug(`Selected mode index ${indexOfName-1}: '${MODES[indexOfName-1]}'`);
        this.loadPathContent();
    }
}