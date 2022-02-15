import $, { Cash } from "cash-dom";
import { ChallengeEntry, ChallengeRenderer } from "./challenge";
import { TAB_CHALLENGES, TAB_OPTIMAL_PATH, TAB_SETTINGS } from "./constants";
import { escapeHtml } from "./utils";
import settingsHtml from "./../content/settings.html";

/** Handle changing selected tab and navigation */
export function handleTabClick(id: string) {
    let selectedTab: Cash = $(`#${id}`);
    // No need to do anything if the current tab is being clicked on
    if(!selectedTab.hasClass("tab-selected"))
    {
        handleTabSelection(id);

        // Determine where we're navigating
        switch(id) {
            case TAB_CHALLENGES:
                navToChallenges();
            break;
            case TAB_OPTIMAL_PATH:
                navToOptimalPath();
            break;
            case TAB_SETTINGS:
                navToSettings();
            break;
        }
    }
}

function loadChallenges() {
    let txt = escapeHtml("Play 12 matches as Bloodhound, Seer, or Crypto");
    for(let i = 0; i < 10; ++i)
    {
        let testChallenge = new ChallengeEntry(txt, Math.floor(Math.random()*13), 12, 5, "BR");
        ChallengeRenderer.render(testChallenge);
    }
}

/**
 * Unset all tab-selected classes, and add it to the tab clicked.
 * @param id DOM id for the tab to set to selected
 */
function handleTabSelection(id: string) {
    $(".tab-entry").removeClass("tab-selected");
    $(`#${id}`).addClass("tab-selected");
}

/** Navigate to Challenges */
export function navToChallenges() {
    console.log("Navigate to Challenges");
    // Restore the left bar to visibility
    $("#left-bar").removeAttr("style");
    clearMainContent();
    loadChallenges();
}

/** Navigate to Optimal Path */
function navToOptimalPath() {
    console.log("Navigate to Optimal Path");
    navFromChallenges();
}

/** Navigate to Settings */
function navToSettings() {
    console.log("Navigate to Settings");
    navFromChallenges();
    $("#main-content").html(settingsHtml);
}

/** Ensure Challenges info is not present */
function navFromChallenges() {
    // Hide the left bar
    $("#left-bar").attr("style", "display:none");
    clearMainContent();
}
function clearMainContent() {
    $("#main-content").empty();
}