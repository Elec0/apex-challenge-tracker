
/** All characters */
export const CHARACTERS: string[] = ["Seer", "Bloodhound"];
/** All weaponm types */
export const WEAPON_TYPES: string[] = ["Light Machine Gun", "Assault Rifle"];
/** All full mode names */
export const MODES_NAMES: string[] = ["Battle Royale", "Arenas", "Control"];
/** Mode abbreviations, same array order as {@link MODES_NAMES} */
export const MODES: string[] = ["BR", "A", "C"];
/** Full list of keywords, built from concatenating the subtypes below */
export const KEYWORDS: string[] = CHARACTERS.concat(WEAPON_TYPES);