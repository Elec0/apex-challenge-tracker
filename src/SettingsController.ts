import $, { Cash } from "cash-dom";
import { Navigation } from "./Navigation";
import { StorageHelper } from "./storage-helper";
import settingsHtml from "./../content/settings.html";
import { TAB_SETTINGS } from "./constants";

export class SettingsController extends Navigation {

    /** Called after the html is added to the page, set up our listeners and logic */
    public initSettings() {
        $("#delete-data").on("click", (e) => {
            if(confirm("Are you sure? This is not reversible!")) {
                StorageHelper.clearAllData();
                location.reload();
            }
        });
    }

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

}