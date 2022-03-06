import $, { Cash } from "cash-dom";
import { ChallengeEntry } from "./ChallengeEntry";
import { StorageHelper } from "./storage-helper";
import { escapeHtml } from "./utils";
import { reloadChallenge } from "./challenge";

export class ChallengeController {

    /** Retrieve the input values and save them */
    public static handleEditSave(event: any, challenge: ChallengeEntry) {
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

        console.debug("Save challenge", challenge);
        StorageHelper.setOrderChallenge(challenge);
        reloadChallenge(challenge);
    }

    /** Delete this challenge from the DOM and storage. */
    public static handleEditDelete(event: any, challenge: ChallengeEntry) {
        let elem = $(`#${challenge.order}`);
        console.debug("Deleted challenge successfully?", StorageHelper.deleteChallenge(challenge));
        elem.remove();
        // TODO: What do we do about the existing order? Does it need to be re-ordered?
    }

    /** Check if the keyboard event is an enter press, and save the changes if so */
    public static handleKeyboardEvent(event: KeyboardEvent, challenge: ChallengeEntry) {
        if (event.key == "Enter")
            this.handleEditSave(event, challenge);
    }
}