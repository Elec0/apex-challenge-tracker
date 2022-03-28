import $, { Cash } from "cash-dom";
import { ChallengeEntry } from "./ChallengeEntry";
import { KEYWORDS } from "../constants";
import { StorageHelper } from "../storage-helper";
import { escapeHtml } from "../utils";
import { MODES, ModeStrings } from "../constants";
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

    TODO: Add easy increase/decrease of challenges
    TODO: Handle shorter windows, currently in editing it jumps to next line
    
    TODO: Customize interval?
*/
export class ChallengeRenderer {
    /**
     * 
     * @param challenge 
     * @param renderMode - 0: Rendering from storage in order. Append each element
        1: New element, append
        2: Editing element, place `before` element with same id
    */
    public static render(challenge: ChallengeEntry, renderMode: number = 0) {
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
            .append($("<div>").addClass("challenge-bar-progress-text")
                .append($("<span>").text(`${challenge.progress}/${challenge.max}`)))
            .append($("<div>").addClass("challenge-bar-progress-stepper")
                .append($("<div>").addClass("dot-half")
                    .append($("<div>").addClass("dot minus").html("<img src='res/images/minus.png'/>")))
                .append($("<div>").addClass("dot-half")
                    .append($("<div>").addClass("dot plus").html("<img src='res/images/plus.png'/>"))))
            .appendTo(barData);

        newBar.append(this.starify(challenge));
        newBar.append(this.setupEditButton(challenge));
        this.setupIncrementButtons(newBar, challenge);

        if (renderMode == 2) {
            let oldElem = $(`#${challenge.id}`);
            oldElem.before(newBar)
            oldElem.remove();
        }
        else {
            let addBtn = $("#add-challenge");
            if (addBtn.length)
                addBtn.before(newBar);
            else // Just drop it at the end if the button doesnt exist for some reason
                $("#challenge-content-area").append(newBar);
        }
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
    public static modeify(mode: MODES): Cash {
        const modeString: string = MODES[mode].toLocaleString().toLocaleLowerCase();
        if (mode != MODES.All) { // 0th is All, so don't show that
            return $("<span>").addClass("cb-type type-" + modeString).text(modeString.toLocaleUpperCase());
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
            res.append($("<img>").attr("src", "res/images/star-five.svg").addClass("star-five"));
        }
        else {
            res.append($("<img>").attr("src", "res/images/ticket.png").addClass("star-five"));
        }
        return res;
    }

    /** Create the edit div & setup the click listener for {@link handleEditButtonClick} */
    private static setupEditButton(challenge: ChallengeEntry): Cash {
        let res = $("<div>").addClass("edit-icon").attr("id", "")
            .append($("<img>").attr("src", "res/images/edit-icon-32x32.png"));

        // The image has pointer events disabled, so we will always get the div out of the click
        res.on("click", (event) => this.handleEditButtonClick(challenge));
        return res;
    }

    private static setupIncrementButtons(bar: Cash, challenge: ChallengeEntry) {
        // .append($("<div>").addClass("dot-half")
        // .append($("<div>").addClass("dot minus")
        let halves: Cash = bar.find(".dot-half");
        let minus: Cash = halves.has(".dot.minus");
        let plus: Cash = halves.has(".dot.plus");
        minus.on("click", e => ChallengeController.handleClickMinus(challenge));
        plus.on("click", e => ChallengeController.handleClickPlus(challenge));
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
        cloneElem.find("select.edit-mode").attr("data-chosen", `${MODES[challenge.mode]}`).val(MODES[challenge.mode]);

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
