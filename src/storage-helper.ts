import { ChallengeEntry } from "./ChallengeEntry";

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
        // if(challenge.order >= this._challenges.length) {
        //     console.log("Reorder challenge to fit in array");
        //     challenge.order = this._challenges.length;
        //     // Since length is +1 anyway and order is 0-indexed
        // }
        this._challenges.push(challenge);
    }

    /** 
     * Update challenge after being edited. 
     * Match `order` variables to determine equality.
     * 
     * Saves all challenges after addition.
    */
    public static setOrderChallenge(challenge: ChallengeEntry) {
        // this.loadSetOrderChallenge(challenge);
        // See if we have the challenge loaded
        let findChallengeIndex: number = StorageHelper.getChallengeByOrder(challenge.order);
        if (findChallengeIndex == -1) {
            // Not loaded, so it's a new one. Append it.
            this.addChallenge(challenge);
        }
        else {
            // Found it, so replace it
            this._challenges[findChallengeIndex] = challenge;
        }

        this.saveToStorage();
    }

    /** 
     * Get the index of the given challenge object by `order`. 
     * @returns If not found, return -1;
     */
    public static getChallengeByOrder(order: number): number {
        console.log(order, this.challenges);

        for(let i = 0; i < this.challenges.length; ++i) {
            if (this.challenges[i].order == order)
                return i;
        }

        // Not found
        return -1;
    }

    /** Remove `challenge` from storage and save. 
     * @returns true if the challenge was in storage and was deleted, false if not in storage.
    */
    public static deleteChallenge(challenge: ChallengeEntry): boolean {
        const foundChallenge = this.getChallengeByOrder(challenge.order);
        if (foundChallenge != -1) {
            const rem = this._challenges.splice(foundChallenge, 1);
            console.debug("Deleted", rem);
            this.saveToStorage();
            return true;
        }
        // Challenge doesn't exist in storage, it probably was created and not
        // saved before being deleted.
        return false;
    }

    /**
     * Called from {@link loadFromStorage} and {@link setOrderChallenge}.
     * 
     * Set the value of a challenge in an array spot. For use in updating values. 
     * 
     * Either updates an element if it exists at `order`, or pushes it.
     * 
     * What if we just decoupled `order` from `index`, because that's kind of dumb.
     * @deprecated
     */
    private static loadSetOrderChallenge(challenge: ChallengeEntry) {
        let index: number = challenge.order;

        if(this.challenges.length > index) {
            this._challenges[index] = challenge;
        }
        else {
            this.addChallenge(challenge);
        }
    }

    /** Explicitly save the current data to storage */
    public static saveToStorage() {
        const jString = JSON.stringify(this.challenges);
        console.debug("Saving to storage:", this.challenges);
        this.setValue("allChallenges", jString);
    }

    /** Load all the data out of storage */
    public static loadFromStorage() {
        let stor: string = this.getValue("allChallenges");
        if (stor != null) {
            let arr: Array<any> = JSON.parse(stor);
            console.debug("Load", arr);
            // We don't need any room because we push everything initially
            // since we decoupled order from index.
            this._challenges = new Array(0);
            arr.forEach(c => {
                let newObj = ChallengeEntry.loadFromJson(c);
                // Saving the data while loading it is really bad, so let's not
                this._challenges.push(newObj);
            })
        }
    }

    /** Delete everything we have in storage. */
    public static clearAllData() {
        this._storage.clear();
    }
}