import { localStorageAvailable } from "src/utils";
import $ from "cash-dom";
import { NavigationController } from "src/NavigationController";
import { StorageHelper } from "src/storage-helper";
import { VERSION } from "./globals";
import { setupBackground } from "./BackgroundRenderer";

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
    console.log(`Loading tracker v${VERSION}`);
    setupBackground();
    setupListeners();
    
    StorageHelper.loadFromStorage();
    NavigationController.init();
}

/**
 * Initialize our event listeners
 */
function setupListeners() {
    // Setup our nav button listener
    NavigationController.setupTabClickListeners();
    
    window.addEventListener('hashchange', () => {
        // Move to the new hash when it's changed
        NavigationController.navToHash();
    });
}
