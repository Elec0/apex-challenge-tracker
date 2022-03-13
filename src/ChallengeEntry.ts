import { ChallengeRenderer } from "./ChallengeRenderer";
import { MODES } from "./constants";
import { StorageHelper } from "./storage-helper";

/**
 * Data class for each challenge entry.
 */

export class ChallengeEntry {
    /** Actual full text of the challenge */
    text: string;
    /** What {@link MODES} the challenge applies to. Can be null, which means applies everywhere. */
    mode: string;
    /** How much progression has been completed */
    private _progress: number = 0;
    /** The max needed progression */
    private _max: number = 0;
    /** How many stars the challenge is worth */
    private _value: number = 0;
    /** What week the challenge is associated with */
    private _week: number = 0;
    /** UUID for the challenge, to be stored in arrays and accessed via dictionary */
    private _id: string = "";
    /** If the challenge is part of an event */
    event: boolean;
    
    /**
     * Creation of new challenges.
     * @param {string} text - Text of the challenge
     * @param {number} progress - Current progress on the challenge
     * @param {numebr} max - `progress` must be <= `max`
     * @param {number} value - How many stars this challenge is worth
     * @param {string=} [mode] - Mode the challenge applies to, default is `BR`
     * @param {boolean=} [event] - Whether the challenge is part of an event or not. Changes star to ticket
     * @param {number=} [order] - Display & index order of the challenges, must be unique
     */
    constructor(text: string, progress: number, max: number = 1, value: number, mode: string = MODES[1], event: boolean = false) {
        this.text = text;
        this.progress = progress;
        this.max = max;
        this.value = value;
        this.mode = mode;
        this.event = event;

        this._id = StorageHelper.generateHash();
    }

    /**
     * Create dom element with {@link ChallengeRenderer.render}.
     */
    public render() {
        ChallengeRenderer.render(this);
    }

    public static loadFromJson(jsonValue: any): ChallengeEntry {
        let nC = new ChallengeEntry(jsonValue["text"], jsonValue["_progress"], jsonValue["_max"],
            jsonValue["_value"], jsonValue["mode"], jsonValue["event"]);
        // We can't pass in an id, but we can set it from inside this class since it's private.
        nC._id = jsonValue["_id"];
        return nC;
    }

    /** Ensure progress is a number. */
    public set progress(value: number) {
        if (!isNaN(value))
            this._progress = value;

        else
            this._progress = 0;
    }
    /** Ensure max is a number. */
    public set max(value: number) {
        if (!isNaN(value))
            this._max = value;

        else
            this._max = 0;
    }
    /** Ensure value is a number. */
    public set value(value: number) {
        if (!isNaN(value))
            this._value = value;

        else
            this._value = 0;
    }
    /** Ensure week is a number. */
    public set week(value: number) {
        if (!isNaN(value))
            this._week = value;

        else
            this._week = 0;
    }

    /** UUID accessor */
    public get id(): string {
        return this._id;
    }

    /** @deprecated Switch to {@link id}. */
    public get order(): number {
        return Number.parseInt(this.id);
    }

    public get progress() { return this._progress; }
    public get max() { return this._max; }
    public get value() { return this._value; }
    public get week() { return this._week; }

    public toString(): string {
        return `${this.text}, ${this.progress}/${this.max}, ${this.value}, ${this.mode}, ${this.week}, ${this.id}`;
    }
}
