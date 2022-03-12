import { ChallengeEntry } from "./ChallengeEntry";

export class StorageHelper {
    private static _challenges: Map<string, ChallengeEntry> = new Map<string, ChallengeEntry>();
    private static _weekData: Array<Array<string>> = new Array(new Array());
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

    /** Writing this instead of a set challenge to hopefully keep things cleaner. 
     * @deprecated Use {@link setChallenge}.
    */
    public static addChallenge(challenge: ChallengeEntry) {
        this.setChallenge(challenge);
    }

    /** Set the challenge entry in the map with key `challenge.order`. */
    public static setChallenge(challenge: ChallengeEntry) {
        this._challenges.set(challenge.order.toString(), challenge);
        this.saveToStorage();
    }

    /** Remove `challenge` from storage and save. 
     * @returns true if the challenge was in storage and was deleted, false if not in storage.
    */
    public static deleteChallenge(challenge: ChallengeEntry): boolean {
        if (this.challenges.has(challenge.order.toString())) {
            this._challenges.delete(challenge.order.toString());
            this.saveToStorage();
            return true;
        }
        // Challenge doesn't exist in storage, was probably created then deleted
        // before being saved.
        return false;
    }

    public static get weekData(): Array<Array<string>> {
        return this._weekData;
    }


    /** Explicitly save the current data to storage */
    public static saveToStorage() {
        console.debug("Saving to storage:", this.challenges);
        console.debug(JSON.stringify(Array.from(this.challenges.entries())));
        this.setValue("allChallenges", JSON.stringify(Array.from(this.challenges.entries())));
        this.setValue("weekData", JSON.stringify(this._weekData));
    }

    /** Load all the data out of storage */
    public static loadFromStorage() {
        let storChallenges: string = this.getValue("allChallenges");
        let storWeeks: string = this.getValue("weekData");
        console.debug(storChallenges);
        console.debug(storWeeks);

        if (storChallenges != null) {
            let jMap: Map<string, any> = new Map(JSON.parse(storChallenges));
            console.debug("Load", jMap);

            jMap.forEach((value, key) => {
                let newObj: ChallengeEntry = ChallengeEntry.loadFromJson(value);
                // Saving the data while loading it is really bad, so let's not
                console.debug("Load: ", newObj);
                this.setChallenge(newObj);
            })
        }

        if (storWeeks != null) {
            let arr: Array<Array<string>> = JSON.parse(storWeeks);
            this._weekData = arr;
        }
    }

    /** Add challenge to week array */
    public static addChallengeToWeek(challenge: ChallengeEntry, week: number) {
        if (!this.weekData[week].includes(challenge.order.toString())) {
            this.weekData[week].push(challenge.order.toString());
            this.saveToStorage();
        }
    }

    /** Delete everything we have in storage. */
    public static clearAllData() {
        this._storage.clear();
    }
}