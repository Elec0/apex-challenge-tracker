import { ChallengeRenderer } from "./ChallengeRenderer";
import { MODES } from "./constants";

/**
 * Data class for each challenge entry.
 */

export class ChallengeEntry {
    /** Actual full text of the challenge */
    text: string;
    /** What {@link MODES} the challenge applies to. Can be null, which means applies everywhere. */
    mode: string;
    /** How much progression has been completed */
    _progress: number;
    /** The max needed progression */
    _max: number;
    /** How many stars the challenge is worth */
    _value: number;
    /** What week the challenge is associated with */
    _week: number;
    /** If the challenge is part of an event */
    event: boolean;
    /**
     * The order of the challenge in the list, 0 being top.
     * Also serves as the ID for a challenge, since the order and array index
     * of the entry in the storage array are the same.
     */
    order: number;

    /**
     * Stores the total number of challenges we have loaded.
     * 
     * Also used for ordering/indexing of the challenges.
     * 
     * If a challenge is passed in with an explicit order that is larger than this, we set it 
     * equal to the new number to ensure new challenges will always be added at the end.
     */
    private static totalOrder: number = 0;

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
    constructor(text: string, progress: number, max: number = 1, value: number, mode: string = MODES[1], event: boolean = false, order: number = -1) {
        this.text = text;
        this.progress = progress;
        this.max = max;
        this.value = value;
        this.mode = mode;
        this.event = event;

        if (order !== -1)
            this.order = order;
        else {
            this.order = ChallengeEntry.totalOrder;
        }
        ChallengeEntry.totalOrder++;
        
        if (this.order > ChallengeEntry.totalOrder) {
            ChallengeEntry.totalOrder = this.order;
        }
    }

    /**
     * Create dom element with {@link ChallengeRenderer.render}.
     */
    public render() {
        ChallengeRenderer.render(this);
    }

    public static loadFromJson(jsonValue: any): ChallengeEntry {
        return new ChallengeEntry(jsonValue["text"], jsonValue["_progress"], jsonValue["_max"],
            jsonValue["_value"], jsonValue["mode"], jsonValue["event"], jsonValue["order"]);
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

    public get progress() { return this._progress; }
    public get max() { return this._max; }
    public get value() { return this._value; }
    public get week() { return this._week; }

    public toString(): string {
        return `${this.text}, ${this.progress}/${this.max}, ${this.value}, ${this.mode}, ${this.week}, ${this.order}`;
    }
}
