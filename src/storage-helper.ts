import { ChallengeController } from "./ChallengeController";
import { ChallengeEntry } from "./ChallengeEntry";
import { KEY_WEEK_DATA, KEY_CHALLENGES } from "./constants";

export class StorageHelper {
    /**
     * Internal storage for challenges.
     * Is a map with key of 'id'
     */
    private static _challenges: Map<string, ChallengeEntry> = new Map<string, ChallengeEntry>();
    /** 
     * 2D array for storing challenges in order.
     * Daily is index 0, weeks are indexed by their week number
     * 
     * @example
     * [
     *  ["0", "2", "5"],
     *  ["3", "7"]
     * ]
     * // Daily challenges are 0, 2, 5
     * // Week 1 has challenges 3, 7
     */
    private static _weekData: Array<Array<string>> = new Array<Array<string>>(12);
    /** Current week to display, index of {@link _weekData}. */
    private static _currentWeek: number = 0;
    private static _storage = window.localStorage;

    /** Set up our 2D week array */
    public static init() {
        for(let i = 0; i < this._weekData.length; ++i) {
            this._weekData[i] = (new Array<string>(0));
        }
    }
    
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

    public static get weekData(): Array<Array<string>> {
        return this._weekData;
    }

    /** 
     * Just straight return all the challenges. I guess with TS being itself the objects
     * in the array will be references.
     */
    public static get challenges() {
        return this._challenges;
    }

    /** 
     * Set the challenge entry in the map with key `challenge.id`. 
     * 
     * Saves if `save` is true.
    */
    public static setChallenge(challenge: ChallengeEntry, save: boolean = true) {
        this._challenges.set(challenge.id, challenge);
        // Option to not save when setting, for use in loading all challenges
        if (save)
            this.saveToStorage();
    }

    /** 
     * Called when the save button is clicked.
     * This means the challenge might be new, or it might be being edited.
     */
    public static saveChallenge(challenge: ChallengeEntry) {
        // Branch based on if it is new or not
        if (this.challenges.has(challenge.id)) {
            // Don't need to update the week array
            this.setChallenge(challenge);
        }
        else {
            // Doesn't exist, need to add it to week array
            this.addChallengeToWeek(challenge, this._currentWeek);
        }
    }

    /** Add challenge to week array */
    public static addChallengeToWeek(challenge: ChallengeEntry, week: number) {
        if (!this.weekData[week].includes(challenge.id)) {
            console.debug("week push", challenge, this.weekData);
            this.weekData[week].push(challenge.id);
        }
        // Make sure to update/save the challenge as well
        this.setChallenge(challenge);
    }

    /** Remove `challenge` from storage and save. 
     * @returns true if the challenge was in storage and was deleted, false if not in storage.
    */
    public static deleteChallenge(challenge: ChallengeEntry): boolean {
        if (this.challenges.has(challenge.id)) {
            this._challenges.delete(challenge.id);
            this.saveToStorage();
            return true;
        }
        // Challenge doesn't exist in storage, was probably created then deleted
        // before being saved.
        return false;
    }

    /** Explicitly save the current data to storage */
    public static saveToStorage() {
        console.debug("Saving to storage:", this.challenges);
        console.debug(JSON.stringify(Array.from(this.challenges)));
        this.setValue(KEY_CHALLENGES, JSON.stringify(Array.from(this.challenges)));
        this.setValue(KEY_WEEK_DATA, JSON.stringify(this.weekData));
    }

    /** Load all the data out of storage */
    public static loadFromStorage() {
        let storChallenges: string = this.getValue(KEY_CHALLENGES);
        let storWeeks: string = this.getValue(KEY_WEEK_DATA);
        console.debug("Load: raw string:", storChallenges);
        console.debug("Load: raw string:", storWeeks);

        if (storChallenges != null) {
            let jMap: Map<string, any> = new Map(JSON.parse(storChallenges));
            console.debug("Loaded map:", jMap);

            jMap.forEach((value, key) => {
                let newObj: ChallengeEntry = ChallengeEntry.loadFromJson(value);
                // Saving the data while loading it is really bad, so let's not
                console.debug("Load object: ", newObj);
                this.setChallenge(newObj, false);
            })
        }

        if (storWeeks != null) {
            let arr: Array<Array<string>> = JSON.parse(storWeeks);
            this._weekData = arr;
        }
    }

    /** Abstract the data retrieval method for data retrieval. */
    public static getDataToRender(): Array<ChallengeEntry> {
        let curWeekData: Array<string> = this.weekData[this._currentWeek];
        let result: Array<ChallengeEntry> = new Array(0);

        console.debug(this.weekData, curWeekData);
        curWeekData.forEach(d => {
            // ts apparently doesn't consider this enough checking for undefined
            // hence the '!'
            if (this.challenges.has(d))
                result.push(this.challenges.get(d)!);
        });
        console.debug("result", result);
        return result;
    }

    /** Delete everything we have in storage. */
    public static clearAllData() {
        this._storage.clear();
    }

    /** Generate hash from string. 
     * From: https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript */
    public static hashCode(toHash: string): string {
        let hash: number = 0, i: number, chr: number;
        if (toHash.length === 0) return hash.toString();
        for (i = 0; i < toHash.length; i++) {
            chr   = toHash.charCodeAt(i);
            hash  = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return hash.toString();
    };

    /** Generate a random hash */
    public static generateHash(): string {
        return StorageHelper.hashCode(Math.random().toString());
    }
}

StorageHelper.init();