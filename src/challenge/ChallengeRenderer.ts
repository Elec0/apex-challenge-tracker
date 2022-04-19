import $, { Cash } from "cash-dom";
import { ChallengeEntry } from "src/challenge/ChallengeEntry";
import { KEYWORDS, NUMBER_REGEX } from "src/constants";
import { MODES } from "src/constants";
import { ChallengeController } from "src/challenge/ChallengeController";



/**
 * Private class to handle putting everything in the DOM.
 * Generate the following structure
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
        if (challenge.isCompleted())
            newBar.addClass("challenge-bar-completed");

        let barData = $("<div>").addClass("challenge-bar-data").appendTo(newBar);
        // Create our title element
        $("<div>").addClass("challenge-bar-title")
            .append(this.modeify(challenge.mode))
            .append(this.keywordify(challenge.text))
            .appendTo(barData);

        barData.append(this.progressBar(challenge));
        newBar.append(this.starify(challenge));
        newBar.append(this.setupEditButton(challenge));

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

        let m: RegExpMatchArray | null = challengeText.match(NUMBER_REGEX);
        if (m != null && m.index != null) {
            let num: string = m[0];
            challengeText = `${challengeText.substring(0, m.index)}<span class='keyword'>${num}</span>${challengeText.substring(m.index + num.length)}`;
        }
            
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
            return $("<span>").addClass("cb-type type-" + modeString).text(modeString.toLocaleUpperCase())
                .attr("data-cy", "mode");
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
        let res = $("<div>").addClass("star-container").attr("data-cy", "star-container")
            .append($("<span>").text(`+${challenge.value}`))
            .append($("<div>").addClass("star-five icon").attr("data-cy", "star-five"));
        if (!challenge.event) {
            res.find("div.star-five").append($("<img>").attr("src", "res/images/star-five.svg"));
            res.find("img").on("click", e => ChallengeController.handleClickStar(challenge));
        }
        else {
            res.find("div.star-five").append($("<img>").attr("src", "res/images/ticket.png"));
        }
        return res;
    }

    /** 
     * Create challenge progress bar, which includes +/- buttons
     * @param {ChallengeEntry} challenge - Challenge to get data from
     * @returns {Cash} `div` element
     */
    private static progressBar(challenge: ChallengeEntry): Cash {
        // Create our progress bar
        let barText: string;
        if (challenge.isCompleted())
            barText = "Completed";
        else
            barText = `${challenge.progress}/${challenge.max}`;
            
        let bar = $("<div>").addClass("challenge-bar-interior bar-angle")
            .append($("<div>").addClass("challenge-bar-progress bar-angle").attr("style", `width:${Math.floor((challenge.progress / challenge.max) * 100)}%`))
            .append($("<div>").addClass("challenge-bar-progress-text")
                .append($("<span>").text(barText))
            )
            .append($("<div>").addClass("challenge-bar-progress-stepper no-select")
                .append($("<div>").addClass("dot-half")
                    .append($("<div>").addClass("dot minus").html("<img src='res/images/minus.svg'/>").attr("data-cy", "dot-minus"))
                )
                .append($("<div>").addClass("stepper-divide tab-angle"))
                .append($("<div>").addClass("dot-half")
                    .append($("<div>").addClass("dot plus").html("<img src='res/images/plus.svg'/>").attr("data-cy", "dot-plus"))
                )
            )
        this.setupIncrementButtons(bar, challenge);
        return bar;
    }

    /** Create the edit div & setup the click listener for {@link handleClickEditButton} */
    private static setupEditButton(challenge: ChallengeEntry): Cash {
        let res = $("<div>").addClass("edit-icon icon").attr("id", "").attr("data-cy", "edit-button")
            .append($("<img>").attr("src", "res/images/edit-icon-32x32.png"));

        // The image has pointer events disabled, so we will always get the div out of the click
        res.on("click", (event) => ChallengeController.handleClickEditButton(challenge));
        return res;
    }

    private static setupIncrementButtons(bar: Cash, challenge: ChallengeEntry) {
        let halves: Cash = bar.find(".dot-half");
        let minus: Cash = halves.has(".dot.minus");
        let plus: Cash = halves.has(".dot.plus");
        minus.on("click", e => ChallengeController.handleClickMinus(challenge));
        plus.on("click", e => ChallengeController.handleClickPlus(challenge));
    }
}
