import {storageAvailable, escapeHtml} from "./utils";
import $, { Cash } from "cash-dom";
import { ChallengeEntry, ChallengeRenderer } from "./challenge";
import { handleTabClick, navToChallenges, navToHash } from "./navigation";
import { StorageHelper } from "./storage-helper";

$(function () {
    if(!storageAvailable("localStorage")) {
        $("#main-content").html("<span style='color:white'>WebStorage not detected! Please enable it or install a modern browser.</span>");
        return;
    }
    initStuff();
  });

/**
 * Idk start running things
 */
function initStuff() {
    setupListeners();

    if(StorageHelper.isFirstLoad()) {
        console.log("First load, run setup");
        // Time to run first time setup
        // setupFirstTime();
        // Init keywords
    }
    else {
        console.log("Not first load, retrieve saved info");
    }

    // Go to hash tab if it exists, otherwise go to default challenges
    if(!navToHash()) {
        navToChallenges();
    }
}

/**
 * Do first time shit:
 * 
 */
function setupFirstTime() {
    StorageHelper.setValue("started", "true");
}

/**
 * Initialize our event listeners
 */
function setupListeners() {
    // Setup our nav button listener
    $(".tab-entry").on("click", (e) => {
        handleTabClick(e.target.id);
    });
    window.addEventListener('hashchange', function() {
        // Move to the new hash when it's changed
        navToHash();
    });
}
