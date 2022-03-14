import { TAB_OPTIMAL_PATH } from "./constants";
import { Navigation } from "./Navigation";
import $, { Cash } from "cash-dom";


export class OptimalPathController extends Navigation{
    navigateTo(): void {
        if (!this.isShowing) {
            super.navigateTo();
            this.setHash(TAB_OPTIMAL_PATH);
        }
    }
    navigateAway(): void {
        super.navigateAway();
        $("#path-content-area").remove();
    }

}