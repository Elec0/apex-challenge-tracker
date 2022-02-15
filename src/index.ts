import {storageAvailable, escapeHtml} from "./utils";
import $, { Cash } from "cash-dom";
import { ChallengeEntry, ChallengeRenderer } from "./challenge";
import { handleTabClick, navToChallenges } from "./navigation";

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
    // Setup our nav button handler
    $(".tab-entry").on("click", (e) => {
        handleTabClick(e.target.id);
    });

    if(StorageHelper.isFirstLoad()) {
        console.log("First load, run setup");
        // Time to run first time setup
        // setupFirstTime();
        // Init keywords

        navToChallenges();
    }
    else {
        console.log("Not first load, retrieve saved info");
    }
}

/**
 * Do first time shit:
 * 
 */
function setupFirstTime() {
    StorageHelper.setValue("started", "true");
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