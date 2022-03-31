/** All characters */
export const LEGENDS: string[] = ["Ash", "Bangalore", "Bloodhound", "Caustic", "Crypto", 
                                     "Fuse", "Gibraltar", "Horizon", "Lifeline", "Loba", "Mad Maggie", 
                                     "Mirage", "Octane", "Pathfinder", "Rampart", "Revenant", "Seer", 
                                     "Valkyrie", "Wattson", "Wraith"];
/** All weapon names */
export const WEAPON_NAMES: string[] = ["HAVOC", "VK-47 Flatline", "Hemlock", "R-301", "Alternator", "Prowler",
                                       "R-99", "Volt", "C.A.R.", "Devotion", "L-STAR", "M600 Spitfire", "Rampage",
                                       "G7 Scout", "Triple Take", "30-30", "Boeck Compound Bow", "Charge Rifle",
                                       "Longbow", "Kraber", "Sentinel", "EVA-8", "Mastiff", "Mozambique", "Peacekeeper",
                                       "RE-45", "P2020", "Wingman"];

/** All weapon types */
export const WEAPON_TYPES: string[] = ["Assault rifle", "Sub machine gun", "LMG", "Marksman", "Sniper rifle", "Shotgun", "Pistol"]

/** Regex to apply to keywordify numbers */
export const NUMBER_REGEX: RegExp = /\d+/;
/** Mode abbreviations and names. */
export enum MODES {
    All,
    BR,
    A,
    C
}
export type ModeStrings = keyof typeof MODES;

/** Full list of keywords, built from concatenating the subtypes below */
export const KEYWORDS: string[] = LEGENDS.concat(WEAPON_NAMES, WEAPON_TYPES);

/** ID correspondig to the tab for Challenges */
export const TAB_CHALLENGES: string = "Challenges";
/** ID correspondig to the tab for Optimal Path */
export const TAB_OPTIMAL_PATH: string = "Optimal-Path";
/** ID correspondig to the tab for Settings */
export const TAB_SETTINGS: string = "Settings";

// --- JSON Keys ---
export const KEY_CHALLENGES: string = "allChallenges";
export const KEY_WEEK_DATA: string = "weekData";
