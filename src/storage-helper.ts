import { ChallengeEntry } from "./challenge";

export class StorageHelper {
    private static _challenges: ChallengeEntry[] = new Array(0);
    private static _storage = window.localStorage;
    
    public static getValue(key: string): any {
        return this._storage.getItem(key);
    }

    public static setValue(key: string, val: any) {
        this._storage.setItem(key, val);
    }

    /**
     * Check if this is the user's first load into our page
     */
    public static isFirstLoad(): boolean {
        return this._storage.getItem("started") == null;
    }

    /** 
     * Just straight return all the challenges. I guess with TS being itself the objects
     * in the array will be references.
     */
    public static get challenges() {
        return this._challenges;
    }

    /** Writing this instead of a set challenge to hopefully keep things cleaner. */
    public static addChallenge(challenge: ChallengeEntry) {
        this._challenges.push(challenge);
    }

    /** Set the value of a challenge in an array spot. For use in updating values. */
    public static setOrderChallenge(challenge: ChallengeEntry) {
        let index: number = challenge.order;
        if(this.challenges.length > index) {
            this._challenges[index] = challenge;
        }
        else {
            this.addChallenge(challenge);
        }
        this.saveToStorage();
    }

    /** Explicitly save the current data to storage */
    public static saveToStorage() {
        this.setValue("allChallenges", JSON.stringify(this.challenges));
    }

    /** Load all the data out of storage */
    public static loadFromStorage() {
        let stor: string = this.getValue("allChallenges");
        if (stor != null) {
            let arr: Array<ChallengeEntry> = JSON.parse(stor);
            // Recreate our array with enough room
            this._challenges = new Array(arr.length);
            
            arr.forEach(c => {
                let newObj = ChallengeEntry.loadFromJson(c);
                this.setOrderChallenge(newObj);
            })
        }


    }
}