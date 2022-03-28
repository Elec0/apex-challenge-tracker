import $, { Cash } from "cash-dom";
import { ChallengeEntry } from "./ChallengeEntry";
import { StorageHelper } from "../storage-helper";
import { escapeHtml } from "../utils";
import { ChallengeRenderer } from "./ChallengeRenderer";
import { Navigation } from "../Navigation";
import challengeHtml from "./../../content/challenge.html";
import { MODES } from "../constants";

export class ChallengeController extends Navigation {
    public static currentFilter: string = "";

    navigateTo(): void {
        if (!this.isShowing) {
            super.navigateTo();
            this.setHash("");
            $("#root-container").append(challengeHtml);
            $("#left-bar").removeAttr("style");
            ChallengeController.loadChallenges();
            ChallengeController.createWeekButtons();
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
        let modeSelector = cloneElem.find("select.edit-mode").val();
        let titleText = cloneElem.find("span[for-data='title']").text();
        let progressText = cloneElem.find("span[for-data='progress']").text();
        let maxText = cloneElem.find("span[for-data='max']").text();
        let valueText = cloneElem.find("span[for-data='value']").text();

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
        console.debug("Deleted challenge successfully?", StorageHelper.deleteChallenge(challenge));
        elem.remove();
    }

    /** Check if the keyboard event is an enter press, and save the changes if so */
    public static handleKeyboardEvent(event: KeyboardEvent, challenge: ChallengeEntry) {
        if (event.key == "Enter") {
            ChallengeController.handleEditSave(event, challenge);
        }
    }

    public static loadChallenges() {
        let sort: boolean = true;
        let dataToRender = StorageHelper.getDataToRenderFilter(this.currentFilter);

        // See if we want to order the challenges by value
        if (sort)
            dataToRender = dataToRender.sort((e1, e2) => e2.value - e1.value);

        dataToRender.forEach(challenge => {
            ChallengeRenderer.render(challenge);
        });

        let btnAdd = $("<div>").addClass("tab-entry tab-angle tab-blur tab-button")
            .attr("id", "add-challenge").attr("tabindex", "0")
            .append($("<span>").text("New Challenge"));
        btnAdd.on("click", e => this.handleAddChallenge(e));
        $("#challenge-content-area").append(btnAdd);
    }

    public static setupFilterButtons() {
        // Set up the click handler for search icon, and text type handler
        $("#search-icon").on("click", this.handleClickSearch);
        $("#btn-filter").on("click", this.handleClickFilter);
        let spanFilter = $("span[for-data='filter']");
        spanFilter.on("keydown", e => this.handleKeyboardFilter(e));
        // Clear the filter and re-call the filter method
        $("#btn-filter-clear").on("click", e => { spanFilter.text(""); this.handleClickFilter(e) });

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
                    ChallengeController.handleAddChallenge(null);
                }
            }
        });
    }

    /** Remove all shortcut keys */
    public static teardownHotkeys() {
        $("body").off("keyup");
    }

    public static createWeekButtons() {
        // Create the week buttons
        const leftBar = $("#left-bar");
        for (let i = 0; i < StorageHelper.weekData.length + 1; ++i) {
            let newBtn = $("<div>")
                .addClass("nav-bar nav-blur")
                .text(`Week ${i}`);
            if (i == 0) {
                newBtn.text("Daily");
                newBtn.addClass("nav-bar-selected");
            }
            newBtn.on("click", e => ChallengeController.handleChangeWeek(e, i));
            leftBar.append(newBtn);
        }
    }

    /** Add a new, blank, challenge entry and set it to edit mode. */
    public static handleAddChallenge(event: any) {
        let newChallenge: ChallengeEntry = new ChallengeEntry("", 0, 1, 0);
        ChallengeRenderer.render(newChallenge);
        ChallengeRenderer.handleEditButtonClick(newChallenge);
    }

    /** Change what week is being displayed by updating StorageHelper */
    private static handleChangeWeek(event: Event, week: number) {
        if (week < 0 || week > 12) {
            console.error("Requested week is outside of 0-12 range.");
            return;
        }
        StorageHelper.currentWeek = week;
        // Clear our challenges
        $("#challenge-content-area").empty();

        // Unset selected class from week button, and set selected for new one
        $(".nav-bar-selected").removeClass("nav-bar-selected");
        if (event.target != null) {
            $(<Element>event.target).addClass("nav-bar-selected");
        }
        // Reload challenges with entry method, it will handle the set week
        ChallengeController.loadChallenges();   
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

    /** Calls {@link ChallengeRenderer.render} with `renderMode`=`2` */
    public static reloadChallenge(challenge: ChallengeEntry) {
        ChallengeRenderer.render(challenge, 2);
    }
}