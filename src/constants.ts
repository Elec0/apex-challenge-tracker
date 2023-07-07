/** All legends */
export const LEGENDS: string[] = ["Ash", "Ballistic", "Bangalore", "Bloodhound", "Catalyst", "Caustic", "Crypto",
    "Fuse", "Gibraltar", "Horizon", "Lifeline", "Loba", "Mad Maggie",
    "Mirage", "Newcastle", "Octane", "Pathfinder", "Rampart", "Revenant", "Seer",
    "Valkyrie", "Vantage", "Wattson", "Wraith"];

// type CLASS_TYPES = string;
/** All legend classes. Assault, etc. */
export enum CLASS_TYPES {
    Assault = "Assault",
    Skirmisher = "Skirmisher",
    Recon = "Recon",
    Support = "Support",
    Controller = "Controller",
}

/** Class -> legend mapping. Assault: [Bangalore, ...] */
export const CLASS_LEGENDS: { [className in CLASS_TYPES]: string[] } = {
    [CLASS_TYPES.Assault]: ["Bangalore", "Revenant", "Fuse", "Ash", "Mad Maggie", "Ballistic"],
    [CLASS_TYPES.Skirmisher]: ["Pathfinder", "Wraith", "Mirage", "Octane", "Horizon", "Valkyrie"],
    [CLASS_TYPES.Recon]: ["Bloodhound", "Crypto", "Seer", "Vantage"],
    [CLASS_TYPES.Support]: ["Gibraltar", "Lifeline", "Loba", "Newcastle"],
    [CLASS_TYPES.Controller]: ["Caustic", "Wattson", "Rampart", "Catalyst"],
};

/** The reverse of {@link CLASS_LEGENDS}, so each legend is linked to their class. */
export const LEGEND_CLASSES: { [key: string]: CLASS_TYPES } = {};

for (const key in CLASS_LEGENDS) {
  if (CLASS_LEGENDS.hasOwnProperty(key)) {
    const values: string[] = CLASS_LEGENDS[key as keyof typeof CLASS_LEGENDS];
    for (const value of values) {
      LEGEND_CLASSES[value] = key as CLASS_TYPES;
    }
  }
}
/** All weapon names */
export const WEAPON_NAMES: string[] = ["HAVOC", "VK-47 Flatline", "Hemlock", "R-301", "Nemesis", "Alternator", "Prowler",
    "R-99", "Volt", "C.A.R.", "Devotion", "L-STAR", "M600 Spitfire", "Rampage",
    "G7 Scout", "Triple Take", "30-30", "Boeck Compound Bow", "Charge Rifle",
    "Longbow", "Kraber", "Sentinel", "EVA-8", "Mastiff", "Mozambique", "Peacekeeper",
    "RE-45", "P2020", "Wingman"];

/** All weapon types */
export const WEAPON_TYPES: string[] = ["assault rifles", "sub machine guns", "light machine guns",
    "marksman weapons", "sniper rifles", "shotguns", "pistols"];

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
export const NumModes: number = Object.keys(MODES).length / 2;

/** Full list of keywords, built from concatenating the subtypes below */
export const KEYWORDS: string[] = LEGENDS.concat(WEAPON_NAMES, WEAPON_TYPES, Object.keys(CLASS_TYPES));

/** ID correspondig to the tab for Challenges */
export const TAB_CHALLENGES: string = "Challenges";
/** ID correspondig to the tab for Optimal Path */
export const TAB_OPTIMAL_PATH: string = "Optimal-Path";
/** ID correspondig to the tab for Settings */
export const TAB_SETTINGS: string = "Settings";

/** Total number of week data to store. There's 12 weeks + a daily, so 13 */
export const WEEKS_NUM: number = 13;
// --- JSON Keys ---
/** @deprecated */
export const KEY_CHALLENGES: string = "allChallenges";
/** @deprecated */
export const KEY_WEEK_DATA: string = "weekData";
/** Challenge data compressed via utf16 lz-string */
export const KEY_CHALLENGES_LZ: string = "allChallengesCompressed";
/** Week data compressed via utf16 lz-string */
export const KEY_WEEK_DATA_LZ: string = "weekDataCompressed";
// ---

export const CHAR_APOSTROPHE: string = "&#39;";