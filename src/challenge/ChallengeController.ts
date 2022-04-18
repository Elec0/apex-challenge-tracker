import $, { Cash } from "cash-dom";
import { ChallengeEntry } from "src/challenge/ChallengeEntry";
import { StorageHelper } from "src/storage-helper";
import { escapeHtml } from "src/utils";
import { ChallengeRenderer } from "src/challenge/ChallengeRenderer";
import { Navigation } from "src/Navigation";
import challengeHtml from "content/challenge.html";
import challengeEditorHtml from "content/challenge-editor.html";
import { CHAR_APOSTROPHE, MODES, NUMBER_REGEX } from "src/constants";
import { LeftBarRenderer } from "src/challenge/LeftBarRenderer";

export class ChallengeController extends Navigation {
    public static currentFilter: string = "";
    public static currentFilterShowCompleted: boolean = false;

    navigateTo(): void {
        if (!this.isShowing) {
            super.navigateTo();
            this.setHash("");
            $("#root-container").append(challengeHtml);
            $("#left-bar").removeAttr("style");
            ChallengeController.loadChallenges();
            LeftBarRenderer.createWeekButtons();
            ChallengeController.setupFilterButtons();
            ChallengeController.setupHotkeys();
        }
    }
    navigateAway(): void {
        super.navigateAway();
        $("#left-bar").attr("style", "display:none");
        $("#left-bar").empty();
        $("#challenge-outer-area").remove();
        $("#challenge-editor").remove();
        ChallengeController.teardownHotkeys();
        // Clear the filter when we leave, since if it's set we automatically display it
        ChallengeController.currentFilter = "";
    }

    /** Retrieve the input values and save them */
    public static handleEditSave(event: any, challenge: ChallengeEntry) {
        let cloneElem = $(`#${challenge.id}`);
        let modeSelector    = cloneElem.find("select.edit-mode").val();
        let titleText       = cloneElem.find("[for-data='title']").val();
        let progressText    = cloneElem.find("[for-data='progress']").val();
        let maxText         = cloneElem.find("[for-data='max']").val();
        let valueText       = cloneElem.find("[for-data='value']").val();

        challenge.text = escapeHtml(titleText as string);
        // Turning a string variable into an enum string key is strange
        challenge.mode = MODES[escapeHtml(modeSelector as string) as keyof typeof MODES];
        challenge.progress = Number.parseInt(escapeHtml(progressText as string));
        challenge.max = Number.parseInt(escapeHtml(maxText as string));
        challenge.value = Number.parseInt(escapeHtml(valueText as string));

        console.debug("Save challenge", challenge);
        StorageHelper.saveChallenge(challenge);
        ChallengeController.reloadChallenge(challenge);
    }

    /** Delete this challenge from the DOM and storage. */
    public static handleEditDelete(event: any, challenge: ChallengeEntry) {
        let elem = $(`#${challenge.id}`);
        let deleted = StorageHelper.deleteChallenge(challenge);
        console.debug("Deleted challenge successfully?", deleted);
        if (deleted) // No need to refresh if it was never saved
            LeftBarRenderer.renderWeekButton(challenge.week);

        elem.remove();
    }

    /**
     * Start edit mode.
     * Swap all the fields with text boxes, add a save button & listen for tab & enter keys.
     * Add the IDs of the challenge to each input.
     *
     * On submit, save the data to storage, clear and reload the entire challenge list.
     */
     public static handleClickEditButton(challenge: ChallengeEntry) {
        let clickedElem = $(`#${challenge.id}`);
        let cloneElem = $(challengeEditorHtml).clone().removeAttr("style").attr("id", `edit-${challenge.id}`);

        cloneElem.find("div.edit-checkmark").on("click", e => ChallengeController.handleEditSave(e, challenge));
        cloneElem.find("div.edit-delete").on("click", e => ChallengeController.handleEditDelete(e, challenge));
        // Setup the ability to press enter and save the challenge
        cloneElem.on("keydown", e => ChallengeController.handleKeyboardEvent(e, challenge));

        // Make the selector have the correct formatting
        cloneElem.find("select.edit-mode").attr("data-chosen", `${MODES[challenge.mode]}`).val(MODES[challenge.mode]);

        // Set the inputs to have the existing data, if it exists
        let title = cloneElem.find("[for-data='title']");
        console.debug(title);
        let titleText = challenge.text;
        // Switch the escaped character out for the real one
        if (titleText.includes(CHAR_APOSTROPHE))
            titleText = titleText.replace(CHAR_APOSTROPHE, "'");
            
        title.val(titleText);
        title.on("input", e => ChallengeController.handleTypeChallenge(e, challenge));

        cloneElem.find("[for-data='progress']").val(challenge.progress.toString());
        cloneElem.find("[for-data='max']").val(challenge.max.toString())
            .attr("data-entered", String(challenge.max != 1)) // Keep track if the user enters data here
            .on("input", e => { $(e.target).attr("data-entered", "true"); });
        cloneElem.find("[for-data='value']").val(challenge.value.toString());

        // Drop the display html and replace it with our new edit layout
        clickedElem.empty();
        clickedElem.append(cloneElem);

        if (title[0] != undefined)
            title[0].focus();
    }

    /** Check if the keyboard event is an enter press, and save the changes if so */
    public static handleKeyboardEvent(event: KeyboardEvent, challenge: ChallengeEntry) {
        if (event.key == "Enter") {
            ChallengeController.handleEditSave(event, challenge);
        }
    }
    
    /** When text is entered into the challenge title during edit mode */
    public static handleTypeChallenge(event: Event, challenge: ChallengeEntry) {
        if (event.target == undefined)
            return;
        let maxElem = $(`#${challenge.id}`).find("span[for-data='max']");

        // If the user has entered something, don't try and overwrite it
        if (maxElem.attr("data-entered") == "true")
            return;

        let curElem: HTMLElement = (<HTMLElement>event.target);
        if (curElem.textContent == null || curElem.textContent.match(NUMBER_REGEX) == null) 
            return;
        let m: RegExpMatchArray = curElem.textContent.match(NUMBER_REGEX)!;

        maxElem.val(m[0]);
    }

    public static loadChallenges() {
        let sort: boolean = true;
        let dataToRender = StorageHelper.getDataToRenderFilter(this.currentFilter, this.currentFilterShowCompleted);

        // See if we want to order the challenges by value
        if (sort)
            dataToRender = dataToRender.sort((e1, e2) => e2.value - e1.value);

        dataToRender.forEach(challenge => {
            ChallengeRenderer.render(challenge);
        });

        let btnAdd = $("<button>").addClass("tab-entry tab-angle tab-blur tab-button")
            .attr("id", "add-challenge").attr("tabindex", "0").text("New Challenge");
        btnAdd.on("click", e => this.handleClickAddChallenge(e));
        $("#challenge-content-area").append(btnAdd);
    }

    public static setupFilterButtons() {
        // Set up the click handler for search icon, and text type handler
        $("#search-icon").on("click", this.handleClickSearch);
        $("#btn-filter").on("click", this.handleClickFilter);

        let spanFilter = $("[for-data='filter']");
        spanFilter.on("keydown", e => this.handleKeyboardFilter(e));
        // Clear the filter and re-call the filter method
        $("#btn-filter-clear").on("click", e => { spanFilter.val(""); this.handleClickFilter(e) });
        let btnCompleted = $("#btn-filter-completed");
        btnCompleted.on("click", e => { 
            btnCompleted.toggleClass("tab-selected"); 
            this.currentFilterShowCompleted = btnCompleted.hasClass("tab-selected");
            this.handleClickFilter(e); 
        });

        // Since this method is only called when we navigate to the tab, 
        // if the filter is already set, that means we're coming in from optimal path
        // so expand the search bar and populate it with the current filter.
        if (this.currentFilter != "") {
            spanFilter.val(this.currentFilter);
            $("#search-icon").trigger("click");
        }
    }

    /** 
     * Create the shortcut keys
     * 
     * Create new challenge: n
     */
    public static setupHotkeys() {
        $("body").on("keyup", (e: KeyboardEvent) => {
            if (e.target == undefined)
                return;
            if ((<HTMLElement>e.target).nodeName == "BODY") {
                if (e.key === "n") {
                    console.debug("Add new challenge with shortcut");
                    ChallengeController.handleClickAddChallenge(null);
                }
            }
        });
    }

    /** Remove all shortcut keys */
    public static teardownHotkeys() {
        $("body").off("keyup");
    }

    /** Add a new, blank, challenge entry and set it to edit mode. */
    public static handleClickAddChallenge(event: any) {
        let newChallenge: ChallengeEntry = new ChallengeEntry("", 0, 1, 0);
        ChallengeRenderer.render(newChallenge);
        this.handleClickEditButton(newChallenge);
    }
    
    /** Clicking the search magnifying icon. Make it expand with the class. */
    public static handleClickSearch(event: Event) {
        if ($(this).hasClass("selected")) {
            $("[for-data='filter']").attr("disabled");
        }
        else {
            $("[for-data='filter']").removeAttr("disabled");
        }

        $(this).toggleClass("selected");
        $("#challenge-filter-area").toggleClass("selected");
    }

    /** Handling when the filter button is clicked. Reload challenges with filter applied */
    public static handleClickFilter(event: Event) {
        let val: string = escapeHtml($("[for-data='filter']").val() as string);
        console.log("Filter by '%s'", val);
        ChallengeController.currentFilter = val;
        $("#challenge-content-area").empty();
        ChallengeController.loadChallenges();
    }

    /** If they hit enter in the filter textbox, apply it. */
    public static handleKeyboardFilter(event: KeyboardEvent) {
        if (event.key == "Enter") {
            ChallengeController.handleClickFilter(event);
            // Intercept the command, don't put a newline
            return false;
        }
    }

    public static handleClickMinus(challenge: ChallengeEntry) {
        if (challenge.progress == 0)
            return;

        challenge.progress = challenge.progress - ChallengeController.getIntervalValue(challenge.max);
        // No underflowing
        if (challenge.progress < 0)
            challenge.progress = 0;
        StorageHelper.saveChallenge(challenge);
        ChallengeController.reloadChallenge(challenge);
    }
    public static handleClickPlus(challenge: ChallengeEntry) {
        if (challenge.progress == challenge.max)
            return;

        challenge.progress = challenge.progress + ChallengeController.getIntervalValue(challenge.max);
        // No overflowing
        if (challenge.progress > challenge.max)
            challenge.progress = challenge.max;
        StorageHelper.saveChallenge(challenge);
        ChallengeController.reloadChallenge(challenge);
    }

    /** Handle when the star is clicked: complete the challenge */
    public static handleClickStar(challenge: ChallengeEntry) {
        if (challenge.progress == challenge.max)
            return;

        challenge.progress = challenge.max;
        StorageHelper.saveChallenge(challenge);
        ChallengeController.reloadChallenge(challenge);
    }

    /**
     * Not all challenges should have the same interval. +1 on a 5000 damage 
     * one makes no sense and is useless.
     * 
     * max 5: interval      = 1
     * max 100: interval    = 10
     * max 1000: interval   = 100
     * max 5000: interval   = 500
     * -- Most challenges will fall into the previous zones --
     * max 10000: interval  = 1000
     */
    public static getIntervalValue(max: number): number {
        // Get the order of magnitude of the challenge
        const oom: number = Math.trunc(Math.log10(max));

        // Basic level is one order of magnitude lower than the max value is
        // this a lot of math for essentially dividing by 10
        let ret = Math.pow(10, Math.max(oom, 1) - 1);
        
        if (oom == 2 && max > 500)
            ret = 100;
        else if (oom == 3 && max >= 5000)
            ret = 500;
        
        return ret;
    }

    public static handleClickHelp(event: Event) {
        if ($(this).hasClass("nav-bar-selected")) {
            // Deselect

        }
        else {
        }
        $(this).toggleClass("nav-bar-selected");
        $("#help-caret").toggleClass("selected");
        $("#help-content").toggleClass("selected");
        console.log(this);
    }

    /** 
     * Calls {@link ChallengeRenderer.render} with `renderMode`=`2` 
     * Also reloads the current week button
    */
    public static reloadChallenge(challenge: ChallengeEntry) {
        ChallengeRenderer.render(challenge, 2);
        // Good chance the week button should be updated, so go ahead and do it
        LeftBarRenderer.renderWeekButton(challenge.week);
    }
}