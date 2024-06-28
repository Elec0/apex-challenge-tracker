import { ChallengeEntry } from "src/challenge/ChallengeEntry";
import { KEY_WEEK_DATA, KEY_CHALLENGES, KEY_CHALLENGES_LZ, KEY_WEEK_DATA_LZ, MODES, WEEKS_NUM, LEGENDS, LEGEND_CLASSES } from "src/constants";
import { compressToUTF16, decompressFromUTF16 } from "lz-string";

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
    private static _weekData: Array<Array<string>> = new Array<Array<string>>(WEEKS_NUM);
    /** 
     * Current week to display, index of {@link _weekData}. 
     * @see ChallengeController.setupWeekIndexDaily
    */
    public static currentWeek: number = 0;

    private static _storage = window.localStorage;

    /** Track if we have checked for compression migration this load. Want to do it as little as possible */
    private static checkedMigration: boolean = false;

    /** Set up our 2D week array */
    public static init() {
        for (let i = 0; i < this._weekData.length; ++i) {
            this._weekData[i] = (new Array<string>(0));
        }
    }

    public static getValue(key: string) {
        return this._storage.getItem(key);
    }

    public static setValue(key: string, val: string) {
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
     * Check if the user has specified to hide the daily challenges tab. 
     * Default: True
     */
    public static get isDailyChallengeEnabled(): boolean {
        let enabled = this.getValue("dailyEnabled")
        console.debug(enabled, this._storage);
        return enabled == null || enabled === "true";
    }

    /** Set if the user wants to see the daily challenges tab.  */
    public static set isDailyChallengeEnabled(isEnabled: boolean) {
        this.setValue("dailyEnabled", String(isEnabled));
        console.debug(`Set dailies ${ isEnabled }, ${ String(isEnabled) }`)
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
            // Remove it from week data
            let ind = this.weekData[challenge.week].indexOf(challenge.id);
            console.log("week delete", ind, this.weekData, challenge.week, challenge.id);

            if (ind != -1)
                this.weekData[challenge.week].splice(ind, 1);
            else
                console.warn("No challenge week entry found for deletion!");

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
        this.setValue(KEY_CHALLENGES_LZ, this.compressChallenges());
        this.setValue(KEY_WEEK_DATA_LZ, this.compressWeekData());
    }

    /** Return the JSON representation of the current challenge data */
    public static stringifyChallenges(): string {
        return JSON.stringify(Array.from(this.challenges));
    }

    /** Compress the {@link stringifyChallenges} result with lz-string */
    public static compressChallenges(): string {
        return compressToUTF16(this.stringifyChallenges());
    }

    /** Return the JSON representation of the current week data */
    public static stringifyWeekData(): string {
        return JSON.stringify(this.weekData);
    }

    /** Compress the {@link stringifyWeekData} result with lz-string */
    public static compressWeekData(): string {
        return compressToUTF16(this.stringifyWeekData());
    }

    /** 
     * For use in settings, output our data in a format we can later also import 
     * Export as utf-16 byte array because I imagine trying to copy a whole ass block of unicode
     * might be problematic for some people, or Notepad.
     */
    public static exportData(): string {
        return `{"${ KEY_CHALLENGES_LZ }": [${ this.stringToUTF16Bytes(this.compressChallenges()) }],` +
            `"${ KEY_WEEK_DATA_LZ }": [${ this.stringToUTF16Bytes(this.compressWeekData()) }]}`;
    }

    /**
     * Bringing data back in from the user
     * We effectively just duplicate the loading method from storage, but run verification
     * on the incoming data before we trust it
     */
    public static importData(data: string): boolean {
        // This being empty will stop anything happening for challenges in verifyData
        let challengeIds: Array<string> = [];
        let challenges: Map<string, ChallengeEntry> = this.challenges;
        let weekData: string[][] = this.weekData;

        let incoming = JSON.parse(data);
        if (incoming[KEY_CHALLENGES_LZ] != null) {
            console.info("Importing: Found challenge data");
            // We expect this to be an array of numbers. If it isn't we're (probably) going to crash
            let newChallengeData: number[] = incoming[KEY_CHALLENGES_LZ];
            let newDataString = decompressFromUTF16(this.utf16BytesToString(newChallengeData));
            if (newDataString == null) throw (new TypeError("Decompressed value was null!"));

            // We've got the data in the plaintext format we expect from storage, now parse it
            let challengeArray = this.loadChallengesFromString(newDataString);
            // Construct our temporary objects
            challengeArray.forEach((value: [string, ChallengeEntry]) => {
                challenges.set(value[1].id, value[1]);
                challengeIds.push(value[0]);
            });
        }

        if (incoming[KEY_WEEK_DATA_LZ] != null) {
            console.info("Importing: Found week data");
            let newWeekData: number[] = incoming[KEY_WEEK_DATA_LZ];
            let newDataString = decompressFromUTF16(this.utf16BytesToString(newWeekData));
            if (newDataString == null) throw (new TypeError("Decompressed value was null!"));

            weekData = JSON.parse(newDataString);
        }

        if (!this.verifyData(challengeIds, challenges, weekData)) {
            console.info("Importing: Data has been verified, saving")
            // Replace our current objects and save everything
            this._challenges = challenges;
            this._weekData = weekData;
            this.saveToStorage();
            return true;
        }
        return false;
    }

    /** Load all the data out of storage */
    public static loadFromStorage() {
        if (!this.checkedMigration) {
            this.checkCompressionMigration(); // We will now load compressed data properly
        }

        let storChallenges: string | null = this.getValue(KEY_CHALLENGES_LZ);
        let storWeeks: string | null = this.getValue(KEY_WEEK_DATA_LZ);

        // console.debug("Load: raw string:", storChallenges);
        // console.debug("Load: raw string:", storWeeks);

        // Keep track of all the challenges as we load them so we can check for orphans
        let challengeIds: Array<string> = [];

        if (storChallenges != null) {
            storChallenges = decompressFromUTF16(storChallenges);
            if (storChallenges == null) throw (new TypeError("Decompressed value was null!"));

            let challengeArray = this.loadChallengesFromString(storChallenges);
            challengeArray.forEach((value: [string, ChallengeEntry]) => {
                this.setChallenge(value[1], false);
                challengeIds.push(value[0]);
            });
            console.debug("Loaded challenge map:", this.challenges);
        }

        if (storWeeks != null) {
            storWeeks = decompressFromUTF16(storWeeks);
            if (storWeeks == null) throw (new TypeError("Decompressed value was null!"));

            let arr: Array<Array<string>> = JSON.parse(storWeeks);
            this._weekData = arr;
        }
        // Verify the data, and save it if anything changed.
        if (this.verifyData(challengeIds, this.challenges, this.weekData)) {
            this.saveToStorage();
        }
    }

    private static loadChallengesFromString(challenges: string): Array<[string, ChallengeEntry]> {
        let result: Array<[string, ChallengeEntry]> = [];
        let jMap: Map<string, any> = new Map(JSON.parse(challenges));
        console.debug("Loaded map:", jMap);

        jMap.forEach((value, key) => {
            let newObj: ChallengeEntry = ChallengeEntry.loadFromJson(value);
            result.push([key, newObj]);
        });
        return result;
    }

    /**
     * Ensure the loaded challenges all have a week they're assigned to, and that week has
     * the challenge in it.
     * 
     * Don't want to accidentally blow up the storage usage with excess orphans.
     * @returns boolean, true if any invalid data was found
     */
    private static verifyData(challengeIds: Array<string>, challenges: Map<string, ChallengeEntry>,
        weekData: string[][]): boolean {
        let found: boolean = false;
        for (let i = 0; i < challengeIds.length; ++i) {
            // We just constructed the challengeIds array from the loaded list
            // of challenges, so each of them *will* exist right now.
            let cWeek = challenges.get(challengeIds[i])!.week
            // Check the week assigned to the challenge to see if the challenge
            // is present in the week
            if (weekData[cWeek].indexOf(challengeIds[i]) == -1) {
                // Problem: the challenge exists but isn't in the week it expects to be
                // Solution: delete the challenge and do a pass through week data at the end
                console.error("Found orphan challenge! Deleting! This should not happen.", `Expected to be in week ${ cWeek }.`,
                    challenges.get(challengeIds[i]));
                challenges.delete(challengeIds[i]);
                found = true;
            }
        }

        // Check our saved length
        if (weekData.length < WEEKS_NUM) {
            console.warn(`Week array is too short, expanding from ${ weekData.length } to ${ WEEKS_NUM }.`);
            console.debug(weekData);

            for (let i = 0; i <= WEEKS_NUM - weekData.length; ++i) {
                weekData.push(new Array<string>());
            }
            found = true;
            console.debug(weekData);
        }
        // Now ensure each entry in the weeks arrays exists
        for (let i = 0; i < weekData.length; ++i) {
            let toRemove: Array<number> = []; // Keep track of what indexes to remove, if any

            for (let j = 0; j < weekData[i].length; ++j) {
                let curId = weekData[i][j];
                if (!challenges.has(curId)) {
                    console.error("Week expects challenge that does not exist!", `Week ${ i }[${ j }] expects ${ curId }`);
                    toRemove.push(j);
                    found = true;
                }
            }
            for (let j = 0; j < toRemove.length; ++j) {
                // Remove the invalid indexes
                weekData[i].splice(toRemove[j], 1);
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
            // ts apparently doesn't consider this enough checking for undefined,
            // hence the '!'
            if (this.challenges.has(d))
                result.push(this.challenges.get(d)!);
        });
        return result;
    }

    /** 
     * Collect all challenges that contain `filterText` in the text.
     * 
     * If `filterText` is blank, call {@link getDataToRender}.
     * 
     * If there's a comma, after that will be the mode.
     * 
     * Filtering by Legend name will also include challenges for that Legend's class type.
     * 
     * "Ash" => Challenges with Ash
     * "Ash, BR" => Ash & BR mode
     * ",BR" => All BR challenges
     * "," => All challenges
     */
    public static getDataToRenderFilter(filterText: string, showCompleted = false): Array<ChallengeEntry> {
        if (filterText == "")
            return this.getDataToRender();

        let result: Array<ChallengeEntry> = new Array(0);
        let filterLower = filterText.toLowerCase();
        let filterMode = "";
        if (filterText.includes(",")) {
            let spl: string[] = filterText.split(",");
            filterLower = spl[0].trim().toLowerCase();
            filterMode = spl[1].trim();
        }

        const legend = this.getLegendFromText(filterLower);

        this.challenges.forEach((val, key) => {
            if (!showCompleted && val.isCompleted())
                return;
            // Check if the challenge text includes our filter text
            let include: boolean = val.text.toLowerCase().includes(filterLower);

            // There must be a legend name in the filter text, and that legend must have a class type
            if (legend != "" && Object.hasOwnProperty.call(LEGEND_CLASSES, legend)) {
                // Include challenges for the legend's class type
                include = include || val.text.includes(LEGEND_CLASSES[legend].toString());
            }

            // See if we need to check the mode
            if (filterMode != "") // If the entered mode text includes the string key value of the challenge mode
                // The regex handles the A/All case: need to not match 'A' when ',All' is the filter
                include = include && (new RegExp(MODES[val.mode].toLocaleUpperCase() + "(\\*|$)").test(filterMode.toLocaleUpperCase())
                    || (filterMode.includes("*") && val.mode == MODES.All));

            if (include)
                result.push(val);
        });

        return result;
    }

    /**
     * Determine if the provided text contains a legend name.
     * 
     * @returns The legend name if found, else an empty string. The first legend found will be returned.
     */
    private static getLegendFromText(text: string): string {
        let lower = text.toLowerCase();
        for (let i = 0; i < LEGENDS.length; ++i) {
            if (lower.includes(LEGENDS[i].toLowerCase())) {
                return LEGENDS[i];
            }
        }
        return "";
    }

    /** Return how many challenges have been completed within the provided week */
    public static getWeekCompleted(week: number): number {
        if (this.weekData.length <= week) {
            console.warn("Tried to get an invalid week index!", week);
            return -1;
        }

        let res: number = 0;
        this.weekData[week].forEach(e => res += this.challenges.get(e)!.isCompleted() ? 1 : 0);
        return res;
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
            chr = toHash.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return hash.toString();
    };

    /** Convert string to utf 16 byte array.  */
    public static stringToUTF16Bytes(str: string): number[] {
        let bytes: number[] = [];
        for (let i = 0; i < str.length; ++i) {
            bytes.push(str.charCodeAt(i));
        }
        return bytes;
    }

    /** Convert utf 16 byte array to string */
    public static utf16BytesToString(bytes: number[]): string {
        let res: string = "";
        bytes.forEach(e => {
            res = res.concat(String.fromCharCode(e));
        });
        return res;
    }

    /** Generate a random hash */
    public static generateHash(): string {
        return StorageHelper.hashCode(Math.random().toString());
    }

    /** 
     * Determine if the data in localStorage is old and uncompressed. If so, compress it 
     * If it was compressed, return true, else return false
     */
    private static checkCompressionMigration(): boolean {
        let dirty: boolean = false;
        let data: string | null = this.getValue(KEY_CHALLENGES);
        if (data != null) {
            this.migrateData(KEY_CHALLENGES, data);
            dirty = true;
        }

        data = this.getValue(KEY_WEEK_DATA);
        if (data != null) {
            this.migrateData(KEY_WEEK_DATA, data);
            dirty = true;
        }

        this.checkedMigration = true;
        return dirty;
    }
    /** Take the old data from storage, compress it, save it */
    private static migrateData(key: string, data: string) {
        console.warn(`Found old data at ${ key }! Migrating to new compression methods`);
        let newKey: string;
        if (key == KEY_CHALLENGES)
            newKey = KEY_CHALLENGES_LZ;
        else if (key == KEY_WEEK_DATA)
            newKey = KEY_WEEK_DATA_LZ;
        else
            throw (new Error(`Invalid key '${ key }'!`));

        this.setValue(newKey, compressToUTF16(data));
        this._storage.removeItem(key);
    }
}

StorageHelper.init();