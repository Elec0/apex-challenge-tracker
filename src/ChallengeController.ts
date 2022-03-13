import $, { Cash } from "cash-dom";
import { ChallengeEntry } from "./ChallengeEntry";
import { StorageHelper } from "./storage-helper";
import { escapeHtml } from "./utils";
import { ChallengeRenderer } from "./ChallengeRenderer";

export class ChallengeController {

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

    /** Entry function from navigation */
    public static loadChallenges() {
        StorageHelper.getDataToRender().forEach(challenge => {
            
            ChallengeRenderer.render(challenge);
        });

        let btnAdd = $("<div>").addClass("tab-entry tab-angle tab-blur").attr("id", "add-challenge")
            .append($("<span>").text("New Challenge"));
        btnAdd.on("click", e => this.handleAddChallenge(e));
        $("#challenge-content-area").append(btnAdd);
    }

    /** Add a new, blank, challenge entry and set it to edit mode. */
    public static handleAddChallenge(event: any) {
        let newChallenge: ChallengeEntry = new ChallengeEntry("", 0, 1, 0);
        ChallengeRenderer.render(newChallenge);
        ChallengeRenderer.handleEditButtonClick(newChallenge);
    }

    /** Removes challenge bar with id `challenge.id` and calls {@link ChallengeRenderer.render}. */
    public static reloadChallenge(challenge: ChallengeEntry) {
        $(`#${challenge.id}`).remove();
        ChallengeRenderer.render(challenge);
    }
}