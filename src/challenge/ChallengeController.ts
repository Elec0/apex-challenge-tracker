import $, { Cash } from "cash-dom";
import { ChallengeEntry } from "src/challenge/ChallengeEntry";
import { StorageHelper } from "src/storage-helper";
import { escapeHtml } from "src/utils";
import { ChallengeRenderer } from "src/challenge/ChallengeRenderer";
import { Navigation } from "src/Navigation";
import challengeHtml from "content/challenge.html";
import { MODES, NUMBER_REGEX } from "src/constants";
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
        let titleText       = cloneElem.find("span[for-data='title']").text();
        let progressText    = cloneElem.find("span[for-data='progress']").text();
        let maxText         = cloneElem.find("span[for-data='max']").text();
        let valueText       = cloneElem.find("span[for-data='value']").text();

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

        maxElem.text(m[0]);
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

        let btnAdd = $("<div>").addClass("tab-entry tab-angle tab-blur tab-button")
            .attr("id", "add-challenge").attr("tabindex", "0")
            .append($("<span>").text("New Challenge"));
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
        $("#btn-filter-clear").on("click", e => { spanFilter.text(""); this.handleClickFilter(e) });
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
            spanFilter.text(this.currentFilter);
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
        ChallengeRenderer.handleClickEditButton(newChallenge);
    }
    
    /** Clicking the search magnifying icon. Make it expand with the class. */
    public static handleClickSearch(event: Event) {
        if ($(this).hasClass("selected")) {
            $("span[for-data='filter']").removeAttr("contenteditable");
        }
        else {
            $("span[for-data='filter']").attr("contenteditable", "true");
        }

        $(this).toggleClass("selected");
        $("#challenge-filter-area").toggleClass("selected");
    }

    /** Handling when the filter button is clicked. Reload challenges with filter applied */
    public static handleClickFilter(event: Event) {
        let val: string = escapeHtml($("span[for-data='filter']").text());
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
    // public static getIntervalValue(challenge: ChallengeEntry): number {
    public static getIntervalValue(max: number): number {
        // Get the order of magnitude of the challenge
        const oom: number = Math.trunc(Math.log10(max));

        // Basic level is one order of magnitude lower than the max value is
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