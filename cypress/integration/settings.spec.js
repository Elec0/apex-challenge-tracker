/// <reference types="Cypress" />
import { enterChallenge } from "../plugins/util-functions";

describe("Clear localStorage", () => {
    beforeEach(() => {
        cy.visit("/");
    });
    it("Creates a new challenge", () => {        
        enterChallenge("Challenge to be deleted", "5", "20", "2");
    });
    it("Clears the storage with the settings button", () => {
        cy.get("[data-cy='tab-settings']").click();
        cy.get("[data-cy='delete-data']").click();

        cy.get("[data-cy='tab-challenges']").click();
        cy.get(".challenge-bar").should("not.exist");
    });
});

const importChallengeData = `{
    "allChallengesCompressed": [7032,4389,20547,248,2797,850,24726,184,27936,13350,31392,32032,3617,7207,22574,12864,10656,26507,8229,24609,18910,396,568,272,15019,15395,15312,464,1428,20617,2016,7666,21152,13743,7968,19232,4902,2129,28849,20609,12322,29897,26589,8522,9292,20684,9335,18416,8585,12274,16445,22813,83,12554,18977,15905,15032,12392,9248,932,4137,24877,17090,20512,11384,23650,10533,1710,17639,24838,29682,24889,14748,16753,11716,6591,847,4278,10699,26977,16769,18696,23653,16616,28352,308,21288,40,14809,20149,15143,3250,18933,4723,26656,11610,7268,14730,1875,17539,20578,9875,20689,11405,2752,18231,7111,18555,28680,2213,8787,9025,25072,3060,670,6332,17771,8372,18897,14405,15640,721,1193,12076,20687,8412,30837,7534,701,26475,23300,27192,28272,32,21043,22560,10183,10533,8390,30270,16422,7084,13422,23981,8852,65,4260,18131,17988,2233,24946,12477,57,11074,4489,80,18596,17456,31282,737,23288,9533,21984,25613,1824,19493,833,24971,16672,17148,18727,21824,25316,15660,19981,19205,16207,18637,4840,255,17469,10666,4880,21797,5986,11658,21954,9108,27358,16526,24877,30946,9398,9416,5322,11630,23417,6925,18912,5272,24191,1139,11073,3156,14893,773,26172,3852,19036,27007,21326,31749,17039,20533,22453,27036,3956,3239,10320,25178,14050,29874,5545,8300,19079,3241,27505,17906,31886,11894,57,54,8231,2080,1480,27171,23970,24765,12857,1288,50,4657,1216,220,11040,3232,1600,8674,87,3465,12954,5519,14216,6170,18289,8965,2326,2150,300,16619,30516,18945,19968,2548,29708,20242,27040,16105,19828,6810,20368,15679,31288,15712,10203,19437,19231,26124,19952,7072,28845,420,22562,29264,25574,7146,29682,31010,3425,17180,32673,10868,20596,1728,28754,1078,29989,9176,5417,14610,21984,1166,928,6972,28705,608,25662,124,24762,1514,13310,6346,22577,10304,22689,30760,7145,1534,1590,449,32106,17649,11170,10854,20537,21218,22102,977,26979,27166,6052,17946,12875,14472,30284,4800,5180,4177,21486,6986,11425,1937,29669,2032,26656,9929,22717,9865,7258,21360,30240,17913,30267,18638,32743,27169,25944,1844,1001,260,18494,4454,22887,9489,22443,5073,14520,27364,4011,17972,8399,29578,1593,441,10295,4458,7908,6681,29011,31604,20674,5797,10078,9304,22356,18218,2647,26374,25635,17572,10843,9958,6366,1350,26824,26085,31268,4677,21210,949,1074,21929,2391,2008,27183,1073,30511,5530,17736,11185,12348,4670,18471,23348,30705,4286,6862,1226,833,22337,9948,4537,18905,877,2129,17374,3276,27296,23382,26644,25048,17973,9560,22186,26660,4960,22714,932,17954,26485,22617,18441,31429,6605,29944,21061,7118,29789,10180,4985,20512,14192,16071,31025,5981,14973,29140,700,12364,4861,10335,25677,22479,9798,27617,21794,25432,4537,30867,1603,28920,3998,8654,9982,13815,27053,5458,29152,18394,17801,5254,1470,8302,22147,20439,17954,18635,6387,22574,20394,24729,25432,13258,3699,8258,18368,19542,4197,29381,30547,29834,31077,30356,20821,13425,5227,4266,12224,29895,22388,24963,29357,12684,197,15814,4832,8337,20049,23896,5838,17803,27365,28619,19806,25485,137,29568,30434,24961,30779,30552,29115,3002,9912,22582,11643,3065,13469,15256,26203,29999,28580,259,10019,1650,16688,24961,9341,10883,26276,30289,29789,14810,6779,11700,7556,18641,2032,18648,26641,18420,2804,11537,16647,1297,19092,7084,20413,26781,7704,8224,32],
    "weekDataCompressed": [7032,4389,20547,504,2537,22569,16518,13152,3400,12323,4776,3519,14042,16439,11960,18752,493,13962,722,5216,2854,2358,25826,31796,9829,1128,31789,31152,7012,9406,24826,16675,10852,1570,24771,26704,28269,19642,1380,11369,23084,2513,30630,8618,4266,23988,3460,5841,23056,3516,16539,9422,3601,10797,23692,29301,9259,186,748,18112,23050,24725,4154,18572,11952,8767,3439,16769,15232,22984,31420,17274,14985,17750,2144,25233,17122,27845,2292,5744,30875,4073,7403,4933,4384,32]}`;

describe("Import/Export challenge data", () => {
    beforeEach(() => {
        cy.visit("/");
    });
    it("Loads challenge data properly", () => {
        cy.get("[data-cy='tab-settings']").click();
        cy.get("[data-cy='import-export-text-data']").invoke("text", importChallengeData);
        cy.get("[data-cy='import-data']").click();
        cy.get("[data-cy='tab-challenges']").click();

        cy.contains("Do 5000 damage as Bloodhound");
        cy.contains("4500/5000");

        cy.get("[data-cy='star-container']").should("have.length", 2);

        cy.contains("Week 12 (2/3)").click();
        cy.get("[data-cy='mode']").should("have.length", 3).should("contain.text", "C");
    });
});