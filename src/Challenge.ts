import $, { Cash } from "cash-dom";

/**
 * Data class for each challenge entry.
 */
class ChallengeEntry {
    public static keywords: string[];
    
    text: string;
    mode: string;
    progress: number;
    max: number;
    value: number;

    constructor(text: string, progress: number, max: number, value: number, mode?: string) {
        this.text = text;
        this.progress = progress;
        this.max = max;
        this.value = value;
        if(mode !== null)
            this.mode = mode;
        
    }
    /**
     * Create dom element with {@link ChallengeRenderer.render}.
     */
    render() {
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
    private static _modes: string[] = ["BR", "A", "C"];

    static render(challenge: ChallengeEntry) {

        let newBar = $("<div>").addClass("challenge-bar")
        let barData = $("<div>").addClass("challenge-bar-data").appendTo(newBar);
        // Create our title element
        $("<div>").addClass("challenge-bar-title")
                .append(this.modeify(challenge.mode))
                .append(this.keywordify(challenge.text))
            .appendTo(barData);

        // Create our progress bar
        $("<div>").addClass("challenge-bar-interior bar-angle")
                .append($("<div>").addClass("challenge-bar-progress bar-angle")
                    .text(`${challenge.progress}/${challenge.max}`)
                )
            .appendTo(barData);
        
        newBar.append(this.starify(challenge.value));

        $("#main-content").append(newBar);
    }

    /**
     * Given the challenge text and the list of known keywords, replace the raw keyword texts
     * with spanned elements.
     * @param {string} challengeText - value to format as a keyword
     * @returns {Cash} `span` element
     */
    private static keywordify(challengeText: string): Cash {
        ChallengeEntry.keywords.forEach((elem) => {
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
     * @param {string} mode - A valid entry in {@link ChallengeRenderer._modes}
     * @returns {Cash} `span` element
     */
    private static modeify(mode: string): Cash {
        return $("<span>").addClass("cb-type type-" + mode).text(mode);
    }

    /**
     * @param {number} value - Number of stars this challenge is worth 
     * @returns {Cash} `div` element
     */
    private static starify(value: number): Cash {
        return $("<div>").addClass("star-container")
            .append($("<span>").text(`+${value}`))
            .append($("<img>").attr("src", "/res/images/star-five.svg").addClass("star-five"));
    }
}

export { ChallengeEntry, ChallengeRenderer };