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
    public static currentWeek: number = 0;
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
    public static get challenges(): Map<string, ChallengeEntry> {
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
            this.addChallengeToWeek(challenge, this.currentWeek);
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
        console.debug("Saving to storage:", this.challenges, this.weekData);
        this.setValue(KEY_CHALLENGES, JSON.stringify(Array.from(this.challenges)));
        this.setValue(KEY_WEEK_DATA, JSON.stringify(this.weekData));
    }

    /** Load all the data out of storage */
    public static loadFromStorage() {
        let storChallenges: string = this.getValue(KEY_CHALLENGES);
        let storWeeks: string = this.getValue(KEY_WEEK_DATA);
        console.debug("Load: raw string:", storChallenges);
        console.debug("Load: raw string:", storWeeks);

        // Keep track of all the challenges as we load them so we can check for orphans
        let challengeIds: Array<string> = [];

        if (storChallenges != null) {
            let jMap: Map<string, any> = new Map(JSON.parse(storChallenges));
            console.debug("Loaded map:", jMap);

            jMap.forEach((value, key) => {
                let newObj: ChallengeEntry = ChallengeEntry.loadFromJson(value);
                // Saving the data while loading it is really bad, so let's not
                this.setChallenge(newObj, false);
                challengeIds.push(key);
            })
            console.debug("Loaded challenge map:", this.challenges);
        }

        if (storWeeks != null) {
            let arr: Array<Array<string>> = JSON.parse(storWeeks);
            this._weekData = arr;
        }
        // Verify the data, and save it if anything changed.
        if(this.verifyData(challengeIds)) {
            this.saveToStorage();
        }
    }

    /**
     * Ensure the loaded challenges all have a week they're assigned to, and that week has
     * the challenge in it.
     * 
     * Don't want to accidentally blow up the storage usage with excess orphans.
     * @returns boolean, true if any invalid data was found
     */
    private static verifyData(challengeIds: Array<string>): boolean {
        let found: boolean = false;
        for(let i = 0; i < challengeIds.length; ++i) {
            // We just constructed the challengeIds array from the loaded list
            // of challenges, so each of them *will* exist right now.
            let cWeek = this.challenges.get(challengeIds[i])!.week
            // Check the week assigned to the challenge to see if the challenge
            // is present in the week
            if (this.weekData[cWeek].indexOf(challengeIds[i]) == -1) {
                // Problem: the challenge exists but isnt in the week it expects to be
                // Solution: delete the challenge and do a pass through week data at the end
                console.error("Found orphan challenge! Deleting! This should not happen.", `Expected to be in week ${cWeek}.`, 
                              this.challenges.get(challengeIds[i]));
                this.challenges.delete(challengeIds[i]);
                found = true;
            }
        }

        // Now ensure each entry in the weeks arrays exists
        for(let i = 0; i < this.weekData.length; ++i) {
            let toRemove: Array<number> = []; // Keep track of what indexes to remove, if any

            for(let j = 0; j < this.weekData[i].length; ++j) {
                let curId = this.weekData[i][j];
                if (!this.challenges.has(curId)) {
                    console.error("Week expects challenge that does not exist!", `Week ${i}[${j}] expects ${curId}`);
                    toRemove.push(j);
                    found = true;
                }
            }
            for(let j = 0; j < toRemove.length; ++j) {
                // Remove the invalid indexes
                this.weekData.splice(toRemove[j], 1);
            }
        }

        // And now we're good, each data point is valid.
        return found;
    }

    /** Abstract the data retrieval method for data retrieval. */
    public static getDataToRender(): Array<ChallengeEntry> {
        let curWeekData: Array<string> = this.weekData[this.currentWeek];
        let result: Array<ChallengeEntry> = new Array(0);

        curWeekData.forEach(d => {
            // ts apparently doesn't consider this enough checking for undefined
            // hence the '!'
            if (this.challenges.has(d))
                result.push(this.challenges.get(d)!);
        });
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