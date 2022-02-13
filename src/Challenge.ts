import $ from "cash-dom";

/**
 * Data class for each challenge entry.
 */
class ChallengeEntry {
    text: string;
    keywords: string[];
    progress: number;
    max: number;

    /**
     * Create dom element with {@link ChallengeRenderer.render}.
     */
    render() {
        ChallengeRenderer.render(this);
    }
}

/**
 * Private class to handle putting everything in the DOM.
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
    static render(challenge: ChallengeEntry) {

    }
}

export { ChallengeEntry, ChallengeRenderer };