import { TAB_CHALLENGES, TAB_OPTIMAL_PATH, TAB_SETTINGS } from "src/constants";
import { SettingsController } from "src/SettingsController";
import { ChallengeController } from "src/challenge/ChallengeController";
import { OptimalPathController } from "src/optimal-path/OptimalPathController";


export class NavigationController {
    public static challengeController: ChallengeController = new ChallengeController(TAB_CHALLENGES);
    public static optimalPathController: OptimalPathController = new OptimalPathController(TAB_OPTIMAL_PATH);
    public static settingsController: SettingsController = new SettingsController(TAB_SETTINGS);

    /** Called on page load */
    public static init() {
        // Go to hash tab if it exists, otherwise go to default challenges
        if (!this.navToHash()) {
            // navToHash calls handleTabClick, but on first load challenges tab is 'selected'
            // so we need to manually load the content for the first time
            NavigationController.challengeController.navigateTo();
        }
    }

    /** Handle changing selected tab and navigation */
    public static handleTabClick(id: string) {
        console.debug("Click tab", id);
        // let selectedTab: Cash = $(`#${id}`);

        // Determine where we're navigating
        switch (id) {
            case TAB_CHALLENGES:
                NavigationController.challengeController.navigateTo();
                break;
            case TAB_OPTIMAL_PATH:
                NavigationController.optimalPathController.navigateTo();
                break;
            case TAB_SETTINGS:
                NavigationController.settingsController.navigateTo();
                break;
            default:
                console.error("Got an unexpected id: %s", id);
        }
    }

    /**
     * Check the URL hash and navigate to the tab it says, if it exists.
     *
     * If it doesn't, navigate to `Challenges` with no hash.
     */
    public static navToHash(): boolean {
        console.debug("navToHash", window.location.hash);
        if (window.location.hash != "") {
            this.handleTabClick(window.location.hash.substring(1));
            return true;
        }
        this.handleTabClick(TAB_CHALLENGES);
        return false;
    }
}
