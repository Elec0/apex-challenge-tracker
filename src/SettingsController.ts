import $, { Cash } from "cash-dom";
import { Navigation } from "src/Navigation";
import { StorageHelper } from "src/storage-helper";
import settingsHtml from "content/settings.html";
import { TAB_SETTINGS } from "src/constants";

export class SettingsController extends Navigation {

    navigateTo(): void {
        if (!this.isShowing) {
            super.navigateTo();
            this.setHash(TAB_SETTINGS);
            $("#root-container").append(settingsHtml);
            $(`#${TAB_SETTINGS}`).addClass("tab-selected");

            this.initSettings();
        }
    }

    navigateAway(): void {
        super.navigateAway();
        $("#settings-content-area").remove();
    }

    /** Called after the html is added to the page, set up our listeners and logic */
    private initSettings() {
        this.btnDeleteData();
        this.setupImportExport();
        this.btnToggleDailyChallenges();
    }

    private btnToggleDailyChallenges() {
        let textFun = (x: Boolean) => `Daily Challenges: ${x ? "Enabled" : "Disabled"}`;

        let elem = $("#toggle-daily-challenges");
        elem.on("click", (e) => {
            let newVal = !StorageHelper.isDailyChallengeEnabled;
            console.debug(StorageHelper.isDailyChallengeEnabled, newVal);
            StorageHelper.isDailyChallengeEnabled = newVal;
            
            elem.text(textFun(newVal));
        });
        elem.text(textFun(StorageHelper.isDailyChallengeEnabled));
    
    }

    private btnDeleteData() {
        $("#delete-data").on("click", (e) => {
            if(confirm("Are you sure? This is not reversible!")) {
                StorageHelper.clearAllData();
                location.reload();
            }
        });
    }

    private setupImportExport() {
        $("#import-data").on("click", e => {
            this.importData();
        });
        $("#export-data").on("click", e => {
            this.exportData();
        });
    }
    
    /** 
     * Take the internal data, stringify it, and slap it in the output textarea
     * Don't care about confirmation on this one because it can't delete anything
     */
    private exportData() {
        $("#import-export-text").text(StorageHelper.exportData());
    }

    private importData() {
        let importing = $("#import-export-text").text();
        console.debug("Import", importing);
        if (confirm("Are you sure? This is not reversible!")) {
            if (StorageHelper.importData(importing)) {
                alert("Data imported successfully! Reloading page");
                location.reload();
            }
            else
                alert("Importing failed! Something went wrong, check the console");
        }
    }

}