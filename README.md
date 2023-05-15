# Apex Challenge Tracker
Challenge tracker and optimizer for Apex Legends.

Enter your challenges, and the site will show you which legends to use, modes to play, and weapons to use to maximize your battle pass point gain.

See the help on the site for basic usage, or the more detailed help here.

Published website: http://apex.elec0.com

# How To Use
The website is divided up into two main sections: Challenges and Optimal Path.

## Basic Usage
Copy challenges from Apex, include star value for each.  
Hotkey N will add a new challenge, pressing Enter while editing will save the challenge.

When adding a new challenge, the first number entered will be placed in the max value box, if no other number has been entered already.

The search icon opens a filter panel, which will search all entered challenges.  
Text after a comma will be filtered as Modes. 
> Ex: "Bloodhound, BR" shows all challenges with Bloodhound and the BR mode.
> 
Adding an asterisk will also include the challenges with the 'All' mode. 
> Ex: "Ash, A*"
> 
To display all challenges:
> ","
> 

## Challenges 
This is the data entry & filter section. 

Enter challenges here according to week on the left. 

Pressing `N` while focused on the main area of the site will create a new, blank, challenge. 
Pressing `Enter` will save the challenge.
Challenges support tab-navigation, so you can enter an entire week's challenges without touching the mouse,
if you so choose.

While entering challenge text, the first number will be copied into the Max progress box, but only if
no other number has been entered there yet (it won't overwrite anything you manually put in.)

After saving, the challenge will be parsed for keywords, and they will be highlighted in yellow. The list of keywords
can be found on the site, under the Help menu on the left. They are case sensitive.  
Clicking on the `(+)/(-)` icons on the progress bar will change the
value without having to manually edit it.  
Clicking the star will auto-complete the challenge.

## Optimal Path
The primary feature, processing all entered challenges and showing what modes, characters, and weapon types are best to use to earn the maximum points.

After entering your challenges, navigate to the Optimal Path. You will see a list of modes, as follows:
| All | BR | A | C |
| --- | --- | --- | --- |
| xx | xx | xx | xx |

Where the 'xx' are the totals of the challenges assigned to the appropriate modes.

Clicking on any of the modes will change all of the entries to show points available for that mode only.  
**Note**: When no modes are selected, *all* challenges are aggregated. Not just the ones labeled 'All'. When 'All' is selected, *only* challenges labeled with 'All' mode are aggregated.

### **Example**
Challenges:
1. [BR] Deal 5000 damage as Rampart (+10)
2. [All] Play 12 games as Bloodhound, Crypto, or Gibraltar (+5)
3. [A] Deal 10000 damage with assault rifles (+10)
4. [BR] Scan 10 enemies as Bloodhound (+2)

Given just these challenges entered and no mode selected, the Optimal Path will show:
| All | BR | A  | C  |
| --- | -- | -- | -- |
| 27  | 17 | 15 | 5  |

> Rampart: 10 | Bloodhound: 7 | Crypto: 5 | Gibraltar: 5  
Assault rifles: 10

The first possibly confusing point is mode C has 5 points assigned. This is because the [All] challenge applies to all available modes.  

Now if [A] mode is selected, the mode points don't change, but the legend category does:

> Bloodhound: 5 | Crypto: 5 | Gibraltar: 5  
Assault rifles: 10

Rampart has been removed, because all of her points were part of BR. Bloodhound's available points have decreased to 5, since only challenge #2 applies to them, Crypto, and Gibraltar. The assault rifles stays because it applies to arena.

# Building
Written in typescript because it is marginally acceptable over javascript.

Developed & tested on Node v18 & 19

To compile and start a local webserver, run
```
npm install
npm run dev
```

My website can't run Node, so I wrote it such that it runs without that. It's a purely frontend site that uses the `localStorage` part of the [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)

I tried to write it in some kind of not-stupid way, but I haven't done much with web recently, so most of this is new to me.

# Credits
* Apex Background: [xGhostx](https://wall.alphacoders.com/big.php?i=992033)  
* Legend icons: [EA's website](https://www.ea.com/games/apex-legends/about/characters)
* Misc icons: idk some random websites + I made some
* Github logo: https://github.com/logos
