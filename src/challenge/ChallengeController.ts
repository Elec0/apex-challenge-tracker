import $, { Cash } from "cash-dom";
import { ChallengeEntry } from "./ChallengeEntry";
import { StorageHelper } from "../storage-helper";
import { escapeHtml } from "../utils";
import { ChallengeRenderer } from "./ChallengeRenderer";
import { Navigation } from "../Navigation";
import challengeHtml from "./../../content/challenge.html";
import { TAB_CHALLENGES } from "../constants";

export class ChallengeController extends Navigation {
    navigateTo(): void {
        if (!this.isShowing) {
            super.navigateTo();
            this.setHash("");
            $("#root-container").append(challengeHtml);
            $("#left-bar").removeAttr("style");
            ChallengeController.loadChallenges();
            ChallengeController.createWeekButtons();
        }
    }
    navigateAway(): void {
        super.navigateAway();
        $("#left-bar").attr("style", "display:none");
        $("#left-bar").empty();
        $("#challenge-content-area").remove();
        $("#challenge-editor").remove();
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
        challenge.mode = escapeHtml(modeSelector as string);
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
        StorageHelper.getDataToRender().forEach(challenge => {
            
            ChallengeRenderer.render(challenge);
        });

        let btnAdd = $("<div>").addClass("tab-entry tab-angle tab-blur tab-button").attr("id", "add-challenge")
            .append($("<span>").text("New Challenge"));
        btnAdd.on("click", e => this.handleAddChallenge(e));
        $("#challenge-content-area").append(btnAdd);
    }

    public static createWeekButtons() {
        // Create the week buttons
        const leftBar = $("#left-bar");
        for (let i = 0; i < StorageHelper.weekData.length + 1; ++i) {
            let newBtn = $("<div>")
                .addClass("nav-bar nav-blur")
                // .attr("week", i.toString())
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

    /** Calls {@link ChallengeRenderer.render} with `renderMode`=`2` */
    public static reloadChallenge(challenge: ChallengeEntry) {
        ChallengeRenderer.render(challenge, 2);
    }
}