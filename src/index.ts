import {storageAvailable, escapeHtml} from "./utils";
import $, { Cash } from "cash-dom";
import { ChallengeEntry, ChallengeRenderer } from "./challenge";
import { handleTabClick, navToChallenges, navToHash } from "./navigation";

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

class StorageHelper {
    private static _storage = window.localStorage;
    static getValue(key: string) {
        return this._storage.getItem(key);
    }

    static setValue(key: string, val: any) {
        this._storage.setItem(key, val);
    }

    /**
     * Check if this is the user's first load into our page
     */
    static isFirstLoad(): boolean {
        return this._storage.getItem("started") == null;
    }
}