import $, { Cash } from "cash-dom";
import { StorageHelper } from "./storage-helper";

/** Called after the html is added to the page, set up our listeners and logic */
export function initSettings() {
    $("#delete-data").on("click", (e) => {
        if(confirm("Are you sure? This is not reversible!")) {
            StorageHelper.clearAllData();
            location.reload();
        }
    });
}