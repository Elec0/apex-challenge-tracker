import $ from "cash-dom"
import { StorageHelper } from "./storage-helper";

export class SettingsRenderer {
    /**
     * Update the toggle button for daily challenges being visible.
     * @param isEnabled Value of {@link StorageHelper.isDailyChallengeEnabled}
     */
    public static updateToggleDaily(isEnabled: boolean) {
        let selClass = "tab-selected";
        let e = $("#toggle-daily-challenges")
            .text(`Daily Challenges: ${ isEnabled ? "Enabled" : "Disabled" }`);
        if (isEnabled) {
            if (!e.hasClass(selClass)) {
                e.addClass(selClass);
            }
        }
        // Not enabled & needs class removed
        else if (e.hasClass(selClass)) {
            e.removeClass(selClass);
        }
    }
}