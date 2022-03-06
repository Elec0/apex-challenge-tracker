import $ from "cash-dom";
import { ChallengeEntry } from "./ChallengeEntry";
import { ChallengeRenderer } from "./ChallengeRenderer";
import { StorageHelper } from "./storage-helper";

/** Entry function from navigation */
export function loadChallenges() {
    StorageHelper.challenges.forEach(challenge => {
        ChallengeRenderer.render(challenge);
    });

    let btnAdd = $("<div>").addClass("tab-entry tab-angle tab-blur").attr("id", "add-challenge")
        .append($("<span>").text("New Challenge"));
    btnAdd.on("click", e => handleAddChallenge(e));
    $("#challenge-content-area").append(btnAdd);

    // if (!useOrder) {
    //     // Not using order, which means append (keep addChallenge at the end)
    //     console.log("append");
    //     $("#addChallenge").before(newBar);
    // }
}

/** Add a new, blank, challenge entry and set it to edit mode. */
function handleAddChallenge(event: any) {
    let newChallenge: ChallengeEntry = new ChallengeEntry("", 0, 1, 0);
    ChallengeRenderer.render(newChallenge);
    ChallengeRenderer.handleEditButtonClick(newChallenge);
}

/** Remove and re-add all challenges */
function reloadAllChallenges() {
    $("#challenge-content-area").empty();
    loadChallenges();
}

/** Removes challenge bar with order `challenge.order` and calls {@link ChallengeRenderer.render}. */
export function reloadChallenge(challenge: ChallengeEntry) {
    $(`#${challenge.order}`).remove();
    ChallengeRenderer.render(challenge);
}

/** Create the elements for adding new challenges */
function initChallengeAdder() {

}

