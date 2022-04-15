import { localStorageAvailable } from "src/utils";
import $ from "cash-dom";
import { NavigationController } from "src/NavigationController";
import { StorageHelper } from "src/storage-helper";

$(function () {
    if(!localStorageAvailable()) {
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
        StorageHelper.loadFromStorage();
    }
    StorageHelper.loadFromStorage();
    NavigationController.init();
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
       NavigationController.handleTabClick(e.target.id);
    });
    window.addEventListener('hashchange', () => {
        // Move to the new hash when it's changed
        NavigationController.navToHash();
    });
}
