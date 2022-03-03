import $, { Cash } from "cash-dom";
import { KEYWORDS } from "./constants";
import { StorageHelper } from "./storage-helper";
import { escapeHtml } from "./utils";

/**
 * Data class for each challenge entry.
 */
export class ChallengeEntry {
    /** Actual full text of the challenge */
    text: string;
    /** What {@link MODES} the challenge applies to. Can be null, which means applies everywhere. */
    mode: string;
    /** How much progression has been completed */
    _progress: number;
    /** The max needed progression */
    _max: number;
    /** How many stars the challenge is worth */
    _value: number;
    /** What week the challenge is associated with */
    _week: number;
    /** If the challenge is part of an event */
    event: boolean;
    /** 
     * The order of the challenge in the list, 0 being top.
     * Also serves as the ID for a challenge, since the order and array index
     * of the entry in the storage array are the same.
     */
    order: number;

    private static totalOrder: number = 0;

    constructor(text: string, progress: number, max: number, value: number, mode?: string, event?: boolean, order?: number) {
        this.text = text;
        this.progress = progress;
        this.max = max;
        this.value = value;
        this.order = 0;
        if(mode !== undefined)
            this.mode = mode;
        if(event !== undefined)
            this.event = event;
        if(order !== undefined)
            this.order = order;
        else {
            this.order = ChallengeEntry.totalOrder++;
        }
    }
    /**
     * Create dom element with {@link ChallengeRenderer.render}.
     */
    public render() {
        ChallengeRenderer.render(this);
    }

    /** Ensure progress is a number. */
    public set progress(value: number) {
        if(!isNaN(value))
            this._progress = value;
        else
            this._progress = 0;
    }
    /** Ensure max is a number. */
    public set max(value: number) {
        if(!isNaN(value))
            this._max = value;
        else
            this._max = 0;
    }
    /** Ensure value is a number. */
    public set value(value: number) {
        if(!isNaN(value))
            this._value = value;
        else
            this._value = 0;
    }
    /** Ensure week is a number. */
    public set week(value: number) {
        if(!isNaN(value))
            this._week = value;
        else
            this._week = 0;
    }

    public get progress() { return this._progress; }
    public get max() { return this._max; }
    public get value() { return this._value; }
    public get week() { return this._week; }

    public toString(): string {
        return `${this.text}, ${this.progress}/${this.max}, ${this.value}, ${this.mode}, ${this.week}, ${this.order}`
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
 export class ChallengeRenderer {
    public static render(challenge: ChallengeEntry, prepend?: boolean) {

        let newBar = $("<div>").addClass("challenge-bar challenge-bar-blur").attr("id", challenge.order.toString());
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
        newBar.append(this.setupEditButton(challenge));

        if(challenge.order != 0) {
            // Find the element that this one should be placed before
            let elemAfter = $(`#${challenge.order + 1}`);
            // If its not found then we put it at the end of the main area
            if (elemAfter.length) {
                elemAfter.before(newBar);
            }
            else {
                $("#challenge-content-area").append(newBar);
            }
        }
        else {
            $("#challenge-content-area").prepend(newBar);
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
    private static handleEditButtonClick(challenge: ChallengeEntry) {
        let clickedElem = $(`#${challenge.order}`);
        let cloneElem = $("#challenge-editor").clone().removeAttr("style").attr("id", `edit-${challenge.order}`);

        cloneElem.find("div.edit-checkmark").on("click", e => this.handleEditSave(e, challenge));
        // Setup the ability to press enter and save the challenge
        cloneElem.on("keydown", e => this.handleKeyboardEvent(e, challenge));

        // Make the selector have the correct formatting
        cloneElem.find("select.edit-mode").attr("data-chosen", `${challenge.mode}`);
        
        // Set the span inputs to have the existing data, if it exists
        cloneElem.find("span[for-data='title']").text(challenge.text);
        cloneElem.find("span[for-data='progress']").text(challenge.progress.toString());
        cloneElem.find("span[for-data='max']").text(challenge.max.toString());
        cloneElem.find("span[for-data='value']").text(challenge.value.toString());

        // Drop the display html and replace it with our new edit layout
        clickedElem.empty();
        clickedElem.append(cloneElem);
    }

    /** Retrieve the input values and save them */
    private static handleEditSave(event: any, challenge: ChallengeEntry) {
        console.log(event);

        let cloneElem = $(`#${challenge.order}`);
        let modeSelector = cloneElem.find("select.edit-mode").val();
        let titleText = cloneElem.find("span[for-data='title']").text();
        let progressText = cloneElem.find("span[for-data='progress']").text();
        let maxText = cloneElem.find("span[for-data='max']").text();
        let valueText = cloneElem.find("span[for-data='value']").text();

        challenge.text = escapeHtml(titleText as string);
        challenge.mode = escapeHtml(modeSelector as string);
        challenge.progress = Number.parseInt(escapeHtml(progressText as string));
        challenge.max = Number.parseInt(escapeHtml(maxText as string));
        challenge.value = Number.parseInt(escapeHtml(valueText as string));

        console.log("Save challenge", challenge);
        StorageHelper.setOrderChallenge(challenge);
        reloadChallenge(challenge);
    }

    /** Check if the keyboard event is an enter press, and save the changes if so */
    private static handleKeyboardEvent(event: KeyboardEvent, challenge: ChallengeEntry) {
        if (event.key == "Enter")
            this.handleEditSave(event, challenge);
    }
}

/** Entry function from navigation */
export function loadChallenges() {
    let txt = escapeHtml("Play 12 matches as Bloodhound, Seer, or Crypto");
    let testChallenge = new ChallengeEntry("Something event", Math.floor(Math.random()*13), 1000, 200, "BR", true, 0);
    ChallengeRenderer.render(testChallenge);
    for(let i = 0; i < 10; ++i)
    {
        testChallenge = new ChallengeEntry(txt, Math.floor(Math.random()*13), 12, 5, "BR", false, i+1);
        ChallengeRenderer.render(testChallenge);
    }
}

/** Remove and re-add all challenges */
function reloadAllChallenges() {
    $("#challenge-content-area").empty();
    loadChallenges();
}

function reloadChallenge(challenge: ChallengeEntry) {
    $(`#${challenge.order}`).remove();
    ChallengeRenderer.render(challenge, true);
}

/** Create the elements for adding new challenges */
function initChallengeAdder() {

}

/** Get the data from local storage and populate stuff */
export function loadChallengesFromStorage() {
    
}
