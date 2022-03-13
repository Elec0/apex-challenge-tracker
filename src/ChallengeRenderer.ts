import $, { Cash } from "cash-dom";
import { ChallengeEntry } from "./ChallengeEntry";
import { KEYWORDS } from "./constants";
import { StorageHelper } from "./storage-helper";
import { escapeHtml } from "./utils";
import { MODES } from "./constants";
import { ChallengeController } from "./ChallengeController";


/**
 * Private class to handle putting everything in the DOM.
 * Generate the following structure
 * @example
 *  <div class="challenge-bar">
        <div class="challenge-bar-data">
            <div class="challenge-bar-title"><span class="cb-type type-br">BR</span><span>Play 2 matches as <span class="keyword">Pathfinder</span></span></div>
            <div class="challenge-bar-interior bar-angle">
                <div class="challenge-bar-progress bar-angle">1/2</div>
            </div>
        </div>
        <div class="star-container">
            <span>+1</span>
            <img src="res/images/star-five.png" class="star-five"></img>
        </div>
    </div>

    TODO: Instead of ordering, add a sort button
 */

export class ChallengeRenderer {
    public static render(challenge: ChallengeEntry) {
        console.debug("Render", challenge);

        let newBar = $("<div>").addClass("challenge-bar challenge-bar-blur").attr("id", challenge.id);
        let barData = $("<div>").addClass("challenge-bar-data").appendTo(newBar);
        // Create our title element
        $("<div>").addClass("challenge-bar-title")
            .append(this.modeify(challenge.mode))
            .append(this.keywordify(challenge.text))
            .appendTo(barData);

        // Create our progress bar
        $("<div>").addClass("challenge-bar-interior bar-angle")
            .append($("<div>").addClass("challenge-bar-progress bar-angle").attr("style", `width:${Math.floor((challenge.progress / challenge.max) * 100)}%`))
            .append($("<span>").text(`${challenge.progress}/${challenge.max}`))
            .appendTo(barData);

        newBar.append(this.starify(challenge));
        newBar.append(this.setupEditButton(challenge));

        ChallengeRenderer.insertInOrder(challenge, newBar);
    }

    /** 
     * Take the bar and challenge entry and insert the challenge element properly in order
     * based on it's `order` parameter.
     * 
     * This should allow bars to be inserted in any order but end up ordered according to `order` parameter
     * 
     * If the bar is being edited, it will have been removed from the DOM before this point
     */
    private static insertInOrder(challenge: ChallengeEntry, newBar: Cash) {
        if (challenge.order != 0) {
            // If this is -1 then the element belongs at the beginning of the page
            let idBefore = ChallengeRenderer.findNumBetween(challenge.order, ChallengeRenderer.getChallengeIDs());

            // Find the element that this one should be placed before
            let elemBefore = $(`#${idBefore}`);
            if( idBefore != -1 && !elemBefore.length) {
                // Something went very wrong because this element should exist
                // This happens when someone creates multiple challenges at once but saves one that
                // is not the first new one. 
                // We will fill in the gaps, and the user can re-order anyway so whatever.
                console.error(`Element with id ${idBefore} does not exist when it should! Appending.`);
                // Set idBefore to -1 to append the element
                idBefore = -1;
            }
            if (idBefore == -1) {
                // We want to keep the button at the end, so if that exists 
                // place this bar before it
                let addBtn = $("#add-challenge");
                if (addBtn.length)
                    addBtn.before(newBar);
                else // Just drop it at the end
                    $("#challenge-content-area").append(newBar);
                return;
            }
            // Our element exists, so place our bar after it
            elemBefore.after(newBar);
        }
        else {
            $("#challenge-content-area").prepend(newBar);
        }
    }

    /**
     * Find number to insert after.
     *
     * Number before first number that is larger than `num`
     * @param num - Number to search with
     * @param arr - Array of numbers
     * @returns - -1 if unable to find any number larger than `num`
     */
    private static findNumBetween(num: number, arr: Array<number>): number {
        let found: number = -1;

        for(let i = 0; i < arr.length; ++i) {
            if (num > arr[i]) {
                found = arr[i];
            }
            else {
                // If it equals then we're editing
                // The bar has been removed by this point, so return
                // our prior number
                return found;
            }
        }
        // Ran out of numbers, means we're at the end
        return found;
    }

    /** Retrieve every DOM element with class="challenge-bar", get their IDs, 
     * put it into a sorted array and return it.
     * @returns {Array<number>} - Sorted array of challenge IDs
     */
    private static getChallengeIDs(): Array<number> {
        let curArr = new Array(0);
        let elems: Cash = $(".challenge-bar");
        $.each(elems, e => curArr.push(e));

        curArr.sort();
        return curArr;
    }

    /**
     * Given the challenge text and the list of known keywords, replace the raw keyword texts
     * with spanned elements.
     * @param {string} challengeText - value to format as a keyword
     * @returns {Cash} `span` element
     */
    public static keywordify(challengeText: string): Cash {
        KEYWORDS.forEach((elem) => {
            let index = challengeText.indexOf(elem);
            if (index != -1) {
                // It exists, replace it
                challengeText = `${challengeText.substring(0, index)}<span class='keyword'>${elem}</span>${challengeText.substring(index + elem.length)}`;
            }
        });
        return $("<span>").html(challengeText);
    }

    /**
     * Create a `span` for the given {@link mode}
     *
     * @param {string} mode - A valid entry in {@link MODES}
     * @returns {Cash} `span` element
     */
    public static modeify(mode: string): Cash {
        if (mode != MODES[0]) { // 0th is All, so don't show that
            return $("<span>").addClass("cb-type type-" + mode.toLocaleLowerCase()).text(mode.toLocaleUpperCase());
        }
        else {
            return $("<span>");
        }
    }

    /**
     * @param {number} challenge - Number of stars this challenge is worth
     * @returns {Cash} `div` element
     */
    private static starify(challenge: ChallengeEntry): Cash {
        let res = $("<div>").addClass("star-container")
            .append($("<span>").text(`+${challenge.value}`));
        if (!challenge.event) {
            res.append($("<img>").attr("src", "/res/images/star-five.svg").addClass("star-five"));
        }
        else {
            res.append($("<img>").attr("src", "/res/images/ticket.png").addClass("star-five"));
        }
        return res;
    }

    /** Create the edit div & setup the click listener for {@link handleEditButtonClick} */
    private static setupEditButton(challenge: ChallengeEntry): Cash {
        let res = $("<div>").addClass("edit-icon").attr("id", "")
            .append($("<img>").attr("src", "/res/images/edit-icon-32x32.png"));

        // The image has pointer events disabled, so we will always get the div out of the click
        res.on("click", (event) => this.handleEditButtonClick(challenge));
        return res;
    }

        /**
     * Start edit mode.
     * Swap all the fields with text boxes, add a save button & listen for tab & enter keys.
     * Add the IDs of the challenge to each input.
     *
     * On submit, save the data to storage, clear and reload the entire challenge list.
     */
         public static handleEditButtonClick(challenge: ChallengeEntry) {
            let clickedElem = $(`#${challenge.id}`);
            let cloneElem = $("#challenge-editor").clone().removeAttr("style").attr("id", `edit-${challenge.order}`);
    
            cloneElem.find("div.edit-checkmark").on("click", e => ChallengeController.handleEditSave(e, challenge));
            cloneElem.find("div.edit-delete").on("click", e => ChallengeController.handleEditDelete(e, challenge));
            // Setup the ability to press enter and save the challenge
            cloneElem.on("keydown", e => ChallengeController.handleKeyboardEvent(e, challenge));
    
            // Make the selector have the correct formatting
            cloneElem.find("select.edit-mode").attr("data-chosen", `${challenge.mode}`).val(challenge.mode);
    
            // Set the span inputs to have the existing data, if it exists
            cloneElem.find("span[for-data='title']").text(challenge.text);
            cloneElem.find("span[for-data='progress']").text(challenge.progress.toString());
            cloneElem.find("span[for-data='max']").text(challenge.max.toString());
            cloneElem.find("span[for-data='value']").text(challenge.value.toString());
    
            // Drop the display html and replace it with our new edit layout
            clickedElem.empty();
            clickedElem.append(cloneElem);
        }
}
