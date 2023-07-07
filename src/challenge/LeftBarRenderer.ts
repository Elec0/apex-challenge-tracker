import $, { Cash } from "cash-dom";
import { StorageHelper } from "src/storage-helper";
import { ChallengeController } from "src/challenge/ChallengeController";
import helpHtml from "content/help.html";
import { LEGENDS, MODES, WEAPON_TYPES, WEAPON_NAMES, NUMBER_REGEX, WEEKS_NUM, CLASS_TYPES, CLASS_LEGENDS } from "src/constants";
import { VERSION } from "../globals";

export class LeftBarRenderer {
    /** Create the Help button + contents */
    private static createHelpElement(): Cash {
        let helpElements = $("<div>");

        let helpBtn = $("<div>")
            .addClass("nav-bar nav-blur").attr("data-cy", "lb-help")
            .html("<span id='help-caret'>&gt;</span> Help")
        helpBtn.on("click", ChallengeController.handleClickHelp);
        helpElements.append(helpBtn);
        helpElements.append(helpHtml);

        let keywordTemplate = (name: string, arr: string[]) => 
        `<h4>${ name }</h4><span>${ arr.join("<span class='comma'>,</span> ") }</span>`;

        helpElements.find("#help-keywords")
            .append($("<div class='keyword'>").html(keywordTemplate("Legends", LEGENDS)))
            .append($("<div class='keyword'>").html(keywordTemplate("Class Types", Object.values(CLASS_TYPES))))
            .append($("<div class='keyword'>").html(keywordTemplate("Weapon Types", WEAPON_TYPES)))
            .append($("<div class='keyword'>").html(keywordTemplate("Weapons", WEAPON_NAMES)))
            .append($("<div class='keyword' style='color:lightgrey;'>").html(`Version ${ VERSION }`));

        return helpElements;
    }

    /** Create the requested week button. If it already exists it's replaced */
    public static renderWeekButton(weekNumP?: number, leftBar?: Cash) {
        let weekNum: number = -1;

        if (weekNumP === undefined)
            weekNum = StorageHelper.currentWeek;
        else
            weekNum = weekNumP!;
        if (leftBar === undefined)
            leftBar = $("#left-bar");


        // Don't get data that doesn't exist
        let prog: string = "";
        if (StorageHelper.weekData[weekNum] != null) {
            let total: number = StorageHelper.weekData[weekNum].length;
            if (total != 0) {
                let completed: number = StorageHelper.getWeekCompleted(weekNum);
                prog = `(${ completed }/${ total })`;
            }
        }

        let newBtn = $("<div>")
            .addClass("nav-bar nav-blur")
            .attr("id", `weekbtn${ weekNum }`)
            .attr("data-cy", `lb-week-${ weekNum }`)
            .text(`Week ${ weekNum } ${ prog }`);
        if (weekNum == 0) {
            newBtn.text("Daily").attr("data-cy", `lb-week-daily`);
        }
        if (StorageHelper.currentWeek == weekNum) {
            newBtn.addClass("nav-bar-selected");
        }
        newBtn.on("click", e => LeftBarRenderer.handleChangeWeek(e, weekNum));

        // Now that we have the element constructed, figure out if we need to replace one or just render
        let curBtn = leftBar.find(`#weekbtn${ weekNum }`);

        if (curBtn.length) {
            // Replacing!
            curBtn.before(newBtn)
            curBtn.remove();
        }
        else { // Normal create
            leftBar.append(newBtn);
        }
    }
    public static createWeekButtons() {
        // Create the week buttons
        const leftBar = $("#left-bar");

        leftBar.append(this.createHelpElement());

        for (let i = 0; i < StorageHelper.weekData.length; ++i) {
            this.renderWeekButton(i, leftBar);
        }
    }

    /** Change what week is being displayed by updating StorageHelper */
    private static handleChangeWeek(event: Event, week: number) {
        if (week < 0 || week > WEEKS_NUM) {
            console.error(`Requested week is outside of 0-${ WEEKS_NUM } range.`);
            return;
        }
        StorageHelper.currentWeek = week;
        // Clear our challenges
        $("#challenge-content-area").empty();

        // Unset selected class from week button, and set selected for new one
        $(".nav-bar-selected").removeClass("nav-bar-selected");
        if (event.target != null) {
            $(<Element>event.target).addClass("nav-bar-selected");
        }
        // Reload challenges with entry method, it will handle the set week
        ChallengeController.loadChallenges();
    }
}