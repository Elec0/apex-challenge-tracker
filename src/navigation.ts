import $ from "cash-dom";

// Other background images
/* background-image: url("https://cdnb.artstation.com/p/assets/images/images/040/012/643/large/derek-bentley-derekbentley-season10-lobby-03.jpg?1627586423"); */
/* background-image: url("https://images6.alphacoders.com/992/992280.jpg"); */

export abstract class Navigation implements INavigation{
    public static currentPage: Navigation;

    public isShowing: boolean = false;

    public tabId: string = "";
    
    constructor(tabId: string) {
        this.tabId = tabId;
    }

    /** 
     * Called from NavigationController, to be overriden by pages. 
     * Should be called from overriden methods
    */
    navigateTo(): void {
        console.debug("Nagivation.navigateTo", this.tabId);
        if (Navigation.currentPage != undefined)
            Navigation.currentPage.navigateAway();

        this.isShowing = true;
        Navigation.currentPage = this;
        // Clear out all tab selected classes
        $(".tab-selected").removeClass("tab-selected");
        // Set our current selection
        $(`#${this.tabId}`).addClass("tab-selected");
        // Make sure we're always at the top of the page when moving
        window.scrollTo(0, 0);
    }

    /** 
     * Called from NavigationController, to be overriden by pages. 
     * Should be called from overriden methods
    */
    navigateAway(): void {
        console.debug("Nagivation.navigateAway", this.tabId);
        this.isShowing = false;
    }

    /** 
     * Set the URL hash with history.pushState to prevent the hashchanged event 
     * from triggering when we change this ourselves.
     */
    protected setHash(newHash: string) {
        history.pushState(null, "", document.location.pathname + '#' + newHash);
    }
}
