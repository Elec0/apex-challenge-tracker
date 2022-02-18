import $, { Cash } from "cash-dom";

/** Called after the html is added to the page, set up our listeners and logic */
export function initSettings() {
    $("#delete-data").on("click", (e) => {
        console.log("Delete data!");
    });
}