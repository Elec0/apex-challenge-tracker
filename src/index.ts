import {storageAvailable} from "./StorageCheck";
import $ from "cash-dom";
import { ChallengeEntry, ChallengeRenderer } from "./Challenge";

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
    if(StorageHelper.isFirstLoad()) {
        console.log("First load, run setup");
        // Time to run first time setup
        // setupFirstTime();
        let testChallenge = new ChallengeEntry("Play 12 matches as Bloodhound, Seer, or Crypto", ["Bloodhound, Seer, Crypto"], 5, 12, 5, "BR");
        ChallengeRenderer.render(testChallenge);
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