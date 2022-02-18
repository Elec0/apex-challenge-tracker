import $, { Cash } from "cash-dom";
import { KEYWORDS } from "./constants";
import { escapeHtml } from "./utils";

/**
 * Data class for each challenge entry.
 */
class ChallengeEntry {
    /** Actual full text of the challenge */
    text: string;
    /** What {@link MODES} the challenge applies to. Can be null, which means applies everywhere. */
    mode: string;
    /** How much progression has been completed */
    progress: number;
    /** The max needed progression */
    max: number;
    /** How many stars the challenge is worth */
    value: number;
    /** What week the challenge is associated with */
    week: number;
    /** If the challenge is part of an event */
    event: boolean;

    constructor(text: string, progress: number, max: number, value: number, mode?: string, event?: boolean) {
        this.text = text;
        this.progress = progress;
        this.max = max;
        this.value = value;
        if(mode !== null)
            this.mode = mode;
        if(event !== null)
            this.event = event;
        
    }
    /**
     * Create dom element with {@link ChallengeRenderer.render}.
     */
    public render() {
        ChallengeRenderer.render(this);
    }
}

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
 */
 class ChallengeRenderer {
    public static render(challenge: ChallengeEntry) {

        let newBar = $("<div>").addClass("challenge-bar challenge-bar-blur")
        let barData = $("<div>").addClass("challenge-bar-data").appendTo(newBar);
        // Create our title element
        $("<div>").addClass("challenge-bar-title")
                .append(this.modeify(challenge.mode))
                .append(this.keywordify(challenge.text))
            .appendTo(barData);

        // Create our progress bar
        $("<div>").addClass("challenge-bar-interior bar-angle")
                .append($("<div>").addClass("challenge-bar-progress bar-angle").attr("style", `width:${Math.floor((challenge.progress/challenge.max) * 100)}%`))
                .append($("<span>").text(`${challenge.progress}/${challenge.max}`))
            .appendTo(barData);
        
        newBar.append(this.starify(challenge));

        $("#challenge-content-area").append(newBar);
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
            if(index != -1) {
                // It exists, replace it
                challengeText = `${challengeText.substring(0, index)}<span class='keyword'>${elem}</span>${challengeText.substring(index+elem.length)}`;
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
        return $("<span>").addClass("cb-type type-" + mode.toLocaleLowerCase()).text(mode.toLocaleUpperCase());
    }

    /**
     * @param {number} challenge - Number of stars this challenge is worth 
     * @returns {Cash} `div` element
     */
    private static starify(challenge: ChallengeEntry): Cash {
        let res = $("<div>").addClass("star-container")
            .append($("<span>").text(`+${challenge.value}`));
            if(!challenge.event) {
                res.append($("<img>").attr("src", "/res/images/star-five.svg").addClass("star-five"));
            }
            else {
                res.append($("<img>").attr("src", "/res/images/ticket.png").addClass("star-five"));
            }
            return res;

    }
}

export function loadChallenges() {
    let txt = escapeHtml("Play 12 matches as Bloodhound, Seer, or Crypto");
    let testChallenge = new ChallengeEntry("Something event", Math.floor(Math.random()*13), 1000, 200, "BR", true);
    ChallengeRenderer.render(testChallenge);
    for(let i = 0; i < 10; ++i)
    {
        testChallenge = new ChallengeEntry(txt, Math.floor(Math.random()*13), 12, 5, "BR");
        ChallengeRenderer.render(testChallenge);
    }
}

export { ChallengeEntry, ChallengeRenderer };