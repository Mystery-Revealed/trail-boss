// trailBoss.js — Unit 6 game adapter: "Trail Boss" (SOLO, three trail VARIANTS).
// The student picks a historic cattle trail — Chisholm, Goodnight-Loving, or
// Western — and drives 2,500 longhorns to the railhead. Six legs × 2 graded
// actions = 12 graded actions per trail. The three trails are the "sides," so the
// Teacher Command Center reports accuracy grouped by trail (spec §1, §6, §9).
//
// Tone (spec §11): the cowboy craft is Spanish/vaquero in origin — say it in Leg
// 1 and mean it. Real crews were about one rider in three Black or Mexican/Tejano;
// the game's crews are too. Indian Territory tolls are fair payment for crossing
// sovereign land, paid politely by smart bosses — never "hostile territory."
// Texas-fever quarantines were legitimate; the farmers aren't villains. Oliver
// Loving's death (Goodnight-Loving, Leg 6) is one gentle line: a promise kept.
//
// THE ANSWER KEY LIVES HERE, ON THE SERVER (verdicts/effects/feedback). The
// factory ships labels only; the client submits { kind, choiceIndex }.
// Student-facing text is written at a 5th grade reading level.
//
// Step kinds: 'map' = a hands-on TRAIL ACTION (a crossing, a camp, handling the
// herd); when its choices name real places they carry a `position` (a waypoint id)
// so the trail map is tappable. 'decision' = a judgment call (hiring, tolls,
// the sale). ✅ right (+1) · ⚠️ partial (+0.5) · ❌ wrong (0).

import { createStepGame } from './_stepGame.js';

// ---------------------------------------------------------------------------
// Shared board metadata (shipped to clients at match:begin — display info only)
// ---------------------------------------------------------------------------

export const METERS = {
  herd:     { name: 'Herd',     icon: 'herd',     blurb: 'The cattle’s numbers and condition — weight is money.' },
  crew:     { name: 'Crew',     icon: 'crew',     blurb: 'Your riders’ health, trust, and morale.' },
  supplies: { name: 'Supplies', icon: 'supplies', blurb: 'Food, gear, and the state of the chuck wagon.' },
};

// Marker glyphs the trail map can draw where the boss commits to a place.
export const MARKERS = {
  herd:  { name: 'The herd' },
  ford:  { name: 'River crossing' },
  camp:  { name: 'Camp / stop' },
  route: { name: 'Route taken' },
};

const START_METERS = { herd: 50, crew: 50, supplies: 50 };

// Drive Score = herd + crew + supplies (max 300).
export function driveScore(meters) {
  return (meters.herd || 0) + (meters.crew || 0) + (meters.supplies || 0);
}

// Ending tier from the final Drive Score (spec §3.4).
export const ENDINGS = {
  top:     { key: 'top',     title: 'Top Boss',
             text: 'You read the rivers and the sky like a book. The herd came in heavy, the crew came in whole and trusting, and the chuck wagon still had coffee. This is the drive the old hands tell stories about.' },
  through: { key: 'through', title: 'Brought ’Em Through',
             text: 'It was never easy, but you brought the herd and the crew through to the railhead. You made the same hard trade thousands of real trail bosses made — and mostly made it well.' },
  hard:    { key: 'hard',    title: 'Hard Lessons on the Trail',
             text: 'The trail took more than it gave. Cattle were lost, the crew was worn thin, and the miles were unforgiving. The bosses who lasted read the country, kept their word, and cared for their outfit — the trail forgave nothing less.' },
};

export function endingFor(score) {
  if (score >= 210) return ENDINGS.top;
  if (score >= 150) return ENDINGS.through;
  return ENDINGS.hard;
}

// The universal debrief: the sale at the railhead, fair pay, and the era's end.
// Each trail's own destination lesson lands in its Leg-6 feedback.
export const DEBRIEF =
  'This is why the drives happened. After the Civil War, Texas was cattle-rich and cash-poor: a longhorn worth about $4 in Texas was worth about $40 at a Kansas railhead. Walking the herd north turned $4 into $40 — and that arithmetic built the Texas cattle kingdom. The whole way of life — the roping, the branding, the gear, even the words lasso, lariat, and ranch — came from Mexican vaqueros, and about one cowboy in three was Black or Mexican. A good boss paid every hand fair and square. Then the story ended fast: railroads reached deep into Texas, and barbed wire fenced the open range. By the mid-1880s the great trail drives were over — but the map they drew across Texas never faded.';

// ===========================================================================
// TRAIL 1 — CHISHOLM (complete; spec §4). San Antonio → Red River Station →
// Indian Territory → the Kansas line → Abilene. Player-facing text at a 5th
// grade level.
// ===========================================================================

const CHISHOLM_WAYPOINTS = [
  { id: 'sanAntonio',  name: 'San Antonio',       sub: 'make the outfit',  x: 138, y: 508, leg: 1 },
  { id: 'redRiver',    name: 'Red River Station', sub: 'the low-water ford', x: 196, y: 404, leg: 2, hazard: true },
  { id: 'wideShallows',name: 'The Wide Shallows', sub: 'slow but safe',    x: 258, y: 432, option: true },
  { id: 'shortcutBend',name: 'Shortcut Bend',     sub: 'quicksand banks',  x: 120, y: 436, option: true, hazard: true },
  { id: 'territory',   name: 'Indian Territory',  sub: 'lightning night',  x: 246, y: 300, leg: 3, hazard: true },
  { id: 'nations',     name: 'The Nations’ Land', sub: 'the toll',         x: 290, y: 210, leg: 4 },
  { id: 'tradingPost', name: 'The Licensed Post', sub: 'honest trade',     x: 356, y: 210, option: true },
  { id: 'settlerFarm', name: 'A Settler’s Field', sub: 'not yours to take',x: 224, y: 176, option: true, hazard: true },
  { id: 'kansasLine',  name: 'The Kansas Line',   sub: 'the quarantine',   x: 318, y: 128, leg: 5, hazard: true },
  { id: 'abilene',     name: 'Abilene',           sub: 'the railhead',     x: 348, y: 48,  leg: 6 },
];

const CHISHOLM_PHASES = [
  // ---- Leg 1 — San Antonio: "Making an Outfit" ----
  {
    title: 'Making an Outfit', date: 'Spring · San Antonio', image: 'event_outfit.jpg',
    event: 'Spring grass is up. You have 2,500 longhorns under contract for Abilene, Kansas — a thousand miles north. Everything you know about this work — roping, branding, riding — came from Mexican vaqueros. First: build your outfit.',
    steps: [
      {
        kind: 'decision',
        prompt: 'Hire your crew.',
        choices: [
          { label: 'All top-dollar veterans, no matter the wages.',
            verdict: 'partial', effects: { crew: 5, supplies: -10 },
            feedback: 'A fine crew — at wages that eat your profit before you start.' },
          { label: 'A seasoned mixed crew — Tejano vaqueros, Black cowboys, steady veterans, a few strong kids — and above all a good cook.',
            verdict: 'right', effects: { crew: 15 },
            feedback: 'Real outfits looked exactly like this — about one rider in three was Black or Mexican. And every boss knew the cook mattered most: bad beans break a drive faster than bad weather.' },
          { label: 'The cheapest greenhorns in the plaza.',
            verdict: 'wrong', effects: { crew: -10 },
            feedback: 'A thousand miles is a hard school. Green riders cost cattle, and sometimes worse.' },
        ],
      },
      {
        kind: 'map',
        prompt: 'Outfit the chuck wagon.',
        hint: 'The chuck wagon is kitchen, toolbox, and hospital on wheels.',
        choices: [
          { label: 'Add crates of canned oysters and fancy goods to please the boys.',
            verdict: 'partial', effects: { supplies: 5, crew: 5 },
            feedback: 'The boys will cheer — until the flour runs short in Indian Territory.' },
          { label: 'Travel light and hunt along the way.',
            verdict: 'wrong', effects: { supplies: -15 },
            feedback: 'A drive is work from dark to dark. Nobody has time to hunt supper for twelve.' },
          { label: 'Stock it right: flour, bacon, beans, coffee — plus tools, medicine, and spare gear.',
            verdict: 'right', effects: { supplies: 15 }, marker: 'camp',
            feedback: 'The chuck wagon — Charles Goodnight’s own invention — was kitchen, toolbox, and hospital on wheels. Stock it like your life depends on it, because it does.' },
        ],
      },
    ],
  },

  // ---- Leg 2 — The Rivers: "Red River Station" ----
  {
    title: 'Red River Station', date: 'Weeks north', image: 'event_river.jpg',
    event: 'Weeks north, the herd strings out two miles long. Ahead waits the drive’s first great test: the Red River, swollen with spring rain.',
    steps: [
      {
        kind: 'map',
        prompt: 'Choose your crossing.',
        hint: 'Cross where a thousand herds have crossed before — proven bottom, proven banks.',
        choices: [
          { label: 'The known low-water ford at Red River Station.',
            verdict: 'right', effects: { herd: 15 }, position: 'redRiver', marker: 'ford',
            feedback: 'Bosses crossed where a thousand herds had crossed — proven bottom, proven banks. The Station was the Chisholm’s front door.' },
          { label: 'Ride to the wide shallows and cross slow and careful.',
            verdict: 'partial', effects: { herd: 5, supplies: -10 }, position: 'wideShallows', marker: 'ford',
            feedback: 'Safe enough — but the long way around burns miles, grass, and days you don’t have.' },
          { label: 'A shortcut crossing at a deep bend.',
            verdict: 'wrong', effects: { herd: -15, crew: -5 }, position: 'shortcutBend', marker: 'ford',
            feedback: 'Quicksand banks and swimming water. Herds drowned taking shortcuts.' },
        ],
      },
      {
        kind: 'decision',
        prompt: 'Mid-river, the cattle begin to mill in a circle in the current.',
        choices: [
          { label: 'Push more cattle in behind to force the jam loose.',
            verdict: 'partial', effects: { herd: -5 },
            feedback: 'Pressure from behind drowns the ones in front.' },
          { label: 'Fire shots in the air to scare them across.',
            verdict: 'wrong', effects: { herd: -10, crew: -5 },
            feedback: 'Panic in deep water is how you lose cattle and riders both.' },
          { label: 'Send your strongest swimmers on the best horses to break the mill and point the leaders to the bank.',
            verdict: 'right', effects: { herd: 10, crew: 5 },
            feedback: 'Exactly the vaquero-taught craft. Break the circle, show the leaders the way out, and the herd follows.' },
        ],
      },
    ],
  },

  // ---- Leg 3 — The Storm: "Lightning Night" ----
  {
    title: 'Lightning Night', date: 'Indian Territory', image: 'event_storm.jpg',
    event: 'Indian Territory. The air goes green and still, and thunder starts walking toward the bedground. Every rider knows what a lightning night can do.',
    steps: [
      {
        kind: 'decision',
        prompt: 'Before the storm hits, you set the night guard.',
        choices: [
          { label: 'Double the guard and have them ride slow circles, singing low.',
            verdict: 'right', effects: { herd: 10, crew: 5 },
            feedback: 'Cowboys truly sang to the herd — low, steady sound so no sudden noise would set them off. It was a tool of the trade.' },
          { label: 'Bed the herd tight in a creek bottom for shelter.',
            verdict: 'partial', effects: { herd: 5, crew: -5 },
            feedback: 'Shelter, yes — but flash floods and blind banks make bottoms risky.' },
          { label: 'Let the men shelter and trust the herd to weather it.',
            verdict: 'wrong', effects: { herd: -15 },
            feedback: 'An unguarded herd on a lightning night is a stampede waiting for the first thunderclap.' },
        ],
      },
      {
        kind: 'map',
        prompt: 'The thunder breaks anyway, and 2,500 head are running. Where do you turn them?',
        hint: 'You can’t stop a stampede — you can only steer it.',
        choices: [
          { label: 'Point them toward open prairie and ride alongside till they tire.',
            verdict: 'partial', effects: { herd: 5 },
            feedback: 'It works — miles from camp, with cattle scattered from here to breakfast.' },
          { label: 'Race to the leaders and bend them into a circle — mill them on open ground.',
            verdict: 'right', effects: { herd: 15, crew: -5 }, marker: 'herd',
            feedback: 'The classic move: you can’t stop a stampede, so you steer it into a spiral until it winds itself out.' },
          { label: 'Get in front and try to stop them head-on.',
            verdict: 'wrong', effects: { herd: -10, crew: -15 },
            feedback: 'No wall of riders stops running longhorns. Men died trying.' },
        ],
      },
    ],
  },

  // ---- Leg 4 — Indian Territory: "The Toll" ----
  {
    title: 'The Toll', date: 'Indian Territory', image: 'event_nations.jpg',
    event: 'Riders from the Nations meet the herd — this is their land the trail crosses, and the toll is cattle. Your drovers watch to see what kind of boss you are.',
    steps: [
      {
        kind: 'decision',
        prompt: 'The toll is asked: a few beeves to cross.',
        choices: [
          { label: 'Pay it with good grace — their land, fair price.',
            verdict: 'right', effects: { crew: 10, herd: -5 },
            feedback: 'Paying the “wohaw” toll was the trail’s standard bargain, and the wise boss paid it politely. Fair passage, fairly bought.' },
          { label: 'Bargain hard, then pay.',
            verdict: 'partial', effects: { crew: 5 },
            feedback: 'You saved a steer and spent an afternoon. Passable.' },
          { label: 'Refuse and push through.',
            verdict: 'wrong', effects: { herd: -10, crew: -10 },
            feedback: 'Bosses who bulled through found stampedes started mysteriously in the night. Disrespect was expensive.' },
        ],
      },
      {
        kind: 'map',
        prompt: 'Supplies run low. Where do you restock?',
        hint: 'A boss’s good name travels ahead of him up the trail.',
        choices: [
          { label: 'Ration hard and push on for Kansas.',
            verdict: 'partial', effects: { supplies: 5, crew: -5 },
            feedback: 'Thin beans make thin tempers.' },
          { label: 'Trade honestly at the licensed post on the trail.',
            verdict: 'right', effects: { supplies: 15 }, position: 'tradingPost', marker: 'camp',
            feedback: 'The trail had its stores and stations — real prices for real goods, and a boss’s good name traveled ahead of him.' },
          { label: 'Help yourselves to a settler’s corn.',
            verdict: 'wrong', effects: { crew: -10, supplies: 5 }, position: 'settlerFarm', marker: 'camp',
            feedback: 'Word of a thieving outfit reaches Abilene before the herd does.' },
        ],
      },
    ],
  },

  // ---- Leg 5 — The Kansas Line: "The Quarantine" ----
  {
    title: 'The Quarantine', date: 'The Kansas line', image: 'event_quarantine.jpg',
    event: 'Kansas farmers block the trail with shotguns and a drawn line: Texas cattle carry fever ticks that kill their livestock. The legal lane swings west.',
    steps: [
      {
        kind: 'decision',
        prompt: 'The farmers stand on their line.',
        choices: [
          { label: 'Camp on the line and argue it out.',
            verdict: 'partial', effects: { supplies: -10 },
            feedback: 'You’ll lose the argument and the grass both.' },
          { label: 'Cut the fences and cross by night.',
            verdict: 'wrong', effects: { crew: -10, herd: -10 },
            feedback: 'That’s how trail wars started — and how Kansas closed itself to Texas cattle.' },
          { label: 'Respect the quarantine — swing the herd into the marked lane west.',
            verdict: 'right', effects: { crew: 10, herd: 5 },
            feedback: 'Texas fever was real — longhorns resisted it, farm cattle died of it. The lines kept moving west, and so did the trails. This is why Dodge City ever mattered.' },
        ],
      },
      {
        kind: 'map',
        prompt: 'Last water before Abilene. How do you bring the herd in?',
        hint: 'Cattle sell by the pound.',
        choices: [
          { label: 'Sell early to a passing buyer at a discount.',
            verdict: 'partial', effects: { herd: 5, supplies: 5 },
            feedback: 'Cash now, but the Abilene price was the whole point of the walk.' },
          { label: 'Race the last stretch to beat the other herds in.',
            verdict: 'wrong', effects: { herd: -10 },
            feedback: 'First and skinny loses to fat and third.' },
          { label: 'Slow down — graze and water them full, arrive heavy.',
            verdict: 'right', effects: { herd: 15 }, marker: 'herd',
            feedback: 'Cattle sell by the pound. The last week’s grass was worth more than the first month’s miles.' },
        ],
      },
    ],
  },

  // ---- Leg 6 — Abilene: "The Railhead" ----
  {
    title: 'The Railhead', date: 'Abilene, Kansas', image: 'ending.jpg',
    event: 'Abilene at last — stockyards, buyers, and the rail line running east. The herd you walked a thousand miles is suddenly worth ten times what it was in Texas.',
    steps: [
      {
        kind: 'decision',
        prompt: 'The buyer squints and offers a low price for “trail-worn stock.”',
        choices: [
          { label: 'Negotiate with your tally book and your grass-fat cattle as proof.',
            verdict: 'right', effects: { herd: 10, supplies: 5 },
            feedback: 'A boss who knew his numbers — head count, weights, losses — got the real price. That $4 Texas steer sold near $40 here. That arithmetic built the cattle kingdom.' },
          { label: 'Take the first offer and be done.',
            verdict: 'partial', effects: { supplies: 5 },
            feedback: 'Done is not the same as done well.' },
          { label: 'Bluster and threaten to drive on to another railhead.',
            verdict: 'wrong', effects: { crew: -5, herd: -5 },
            feedback: 'Buyers talked to each other. Bluster cost more than it won.' },
        ],
      },
      {
        kind: 'decision',
        prompt: 'Payday. The drive is over.',
        choices: [
          { label: 'Hold their pay till morning so it survives the saloons.',
            verdict: 'partial', effects: { crew: 5 },
            feedback: 'Some bosses did — kindly meant, but grown men bristle at being minded.' },
          { label: 'Pay every hand fair and square, thank them by name, bank the owner’s share.',
            verdict: 'right', effects: { crew: 15 },
            feedback: 'Fair pay and a fair word — the bosses men signed with again. Cowboys earned about a month’s wage for the hardest work in the West; the least a boss owed was every dollar of it.' },
          { label: 'Shave the tally and pocket the difference.',
            verdict: 'wrong', effects: { crew: -15 },
            feedback: 'Word travels down every trail in Texas. No crew rides twice for a crooked boss.' },
        ],
      },
    ],
  },
];

// ===========================================================================
// TRAIL 2 — GOODNIGHT-LOVING (the western epic; spec §5). Final content from the
// beat matrix, written in the trail's own voice: spare, big-empty-country, water
// and trust. Fort Belknap → south around Comanche country → the 96-mile dry
// drive → Horsehead Crossing on the Pecos → Fort Sumner → Colorado.
// ===========================================================================

const GOODNIGHT_WAYPOINTS = [
  { id: 'fortBelknap', name: 'Fort Belknap',    sub: 'make the outfit',   x: 356, y: 470, leg: 1 },
  { id: 'southSwing',  name: 'The South Swing',  sub: 'around Comanche country', x: 250, y: 430, leg: 2 },
  { id: 'straightWest',name: 'Straight West',    sub: 'through Comanche country', x: 300, y: 372, option: true, hazard: true },
  { id: 'farSouth',    name: 'The Far Detour',   sub: 'long and safe',     x: 180, y: 468, option: true },
  { id: 'dryDrive',    name: 'The 96-Mile Dry Drive', sub: 'no water at all', x: 168, y: 350, leg: 3, hazard: true },
  { id: 'horsehead',   name: 'Horsehead Crossing', sub: 'the Pecos',       x: 120, y: 262, leg: 4, hazard: true },
  { id: 'alkaliPool',  name: 'The Alkali Pools', sub: 'poison water',      x: 62,  y: 300, option: true, hazard: true },
  { id: 'restCamp',    name: 'The Rest Camp',    sub: 'water in shifts',   x: 170, y: 232, option: true },
  { id: 'fortSumner',  name: 'Fort Sumner',      sub: 'army & reservation', x: 168, y: 160, leg: 5 },
  { id: 'colorado',    name: 'Colorado',         sub: 'markets beyond Kansas', x: 236, y: 56, leg: 6 },
];

const GOODNIGHT_PHASES = [
  {
    title: 'Fort Belknap', date: '1866 · Fort Belknap', image: 'event_outfit.jpg',
    event: '1866. The war is over, Texas is full of cattle, and the crowded trails north pay less every year. Charles Goodnight and Oliver Loving have a bolder idea: drive west, through empty country, to hungry army posts nobody else can reach. Every skill this work needs was taught by Mexican vaqueros. First, you need hands you can trust with your life.',
    steps: [
      {
        kind: 'decision',
        prompt: 'Hire your crew.',
        choices: [
          { label: 'Hire only old friends you already know.',
            verdict: 'partial', effects: { crew: 5, supplies: -5 },
            feedback: 'Loyal men — but too few of them. Out west, a short crew wears down to nothing.' },
          { label: 'Hire trusted hands like Bose Ikard — a Black cowboy Goodnight trusted with the outfit’s money and his life.',
            verdict: 'right', effects: { crew: 15 },
            feedback: 'Bose Ikard was real. When the outfit carried gold through robber country, it rode in Ikard’s saddlebags — Goodnight trusted him over any bank. Real crews were like this: about one rider in three was Black or Mexican.' },
          { label: 'Hire whoever is cheapest and move on.',
            verdict: 'wrong', effects: { crew: -10 },
            feedback: 'The country ahead is dry, empty, and unforgiving. It finds out a careless hand fast — and the whole outfit pays for it.' },
        ],
      },
      {
        kind: 'map',
        prompt: 'Outfit the wagon — Goodnight’s own design.',
        hint: 'Goodnight invented the chuck wagon for exactly this country.',
        choices: [
          { label: 'Build the chuck wagon right: food, tools, medicine, water barrels.',
            verdict: 'right', effects: { supplies: 15 }, marker: 'camp',
            feedback: 'Goodnight built the first chuck wagon for this very drive — a rolling kitchen, toolbox, and hospital. Out where there are no towns, the wagon is the whole world.' },
          { label: 'Pack fast and light to save money.',
            verdict: 'partial', effects: { supplies: 5, crew: -5 },
            feedback: 'Light looks smart at Fort Belknap. It looks different ninety miles from water.' },
          { label: 'Skip the extra water barrels — there’s always a river.',
            verdict: 'wrong', effects: { supplies: -15 },
            feedback: 'Not out west, there isn’t. Ahead lies a stretch with no water at all — 96 miles of it.' },
        ],
      },
    ],
  },
  {
    title: 'The Plan', date: 'Choosing the route', image: 'title_hero.jpg',
    event: 'You spread the map on the wagon gate. Straight west runs the shortest line to the Pecos — straight through Comanche country. Loving studies it a long time and says nothing. The shape you give this trail is the biggest decision you will make on it.',
    steps: [
      {
        kind: 'map',
        prompt: 'Choose the shape of your trail.',
        hint: 'On this trail, geography is strategy — the whole route is one big choice.',
        choices: [
          { label: 'Take a wide far-south detour to be extra safe.',
            verdict: 'partial', effects: { herd: 5, supplies: -10 }, position: 'farSouth', marker: 'route',
            feedback: 'Safe — and slow. Every extra mile out here costs grass, water, and days you may want back.' },
          { label: 'Drive straight west through Comanche country to save time.',
            verdict: 'wrong', effects: { herd: -10, crew: -10 }, position: 'straightWest', marker: 'route',
            feedback: 'The shortest line on the map was the most dangerous line on the ground. Smart bosses respected that, and went around.' },
          { label: 'Swing south and west, around Comanche country.',
            verdict: 'right', effects: { herd: 10, crew: 5 }, position: 'southSwing', marker: 'route',
            feedback: 'Goodnight’s plan exactly. The long way around was the safe way through. On this trail, the map itself is the strategy.' },
        ],
      },
      {
        kind: 'decision',
        prompt: 'How do you set the pace for the country ahead?',
        choices: [
          { label: 'Push a little harder to bank extra miles now.',
            verdict: 'partial', effects: { herd: 5, crew: -5 },
            feedback: 'Miles in the bank, strength out of it. A risky trade with the dry drive still to come.' },
          { label: 'Steady and calm — keep the herd rested and strong for the dry drive.',
            verdict: 'right', effects: { herd: 10 },
            feedback: 'Slow is smooth, and smooth is fast. The dry country ahead will take everything the herd has saved up — so let it save.' },
          { label: 'Race ahead to reach water sooner.',
            verdict: 'wrong', effects: { herd: -10, crew: -5 },
            feedback: 'There is no water sooner. There are only tired cattle arriving at the hardest part of the trail.' },
        ],
      },
    ],
  },
  {
    title: 'The Dry Drive', date: 'The 96 miles', image: 'event_drydrive.jpg',
    event: 'Here it is — the stretch this trail is famous for. Ninety-six miles to the Pecos River, and not one drink of water anywhere along it. Whatever the herd carries in its body at the start is all it gets. Bosses talked about this crossing for the rest of their lives.',
    steps: [
      {
        kind: 'decision',
        prompt: 'How do you cross 96 waterless miles?',
        choices: [
          { label: 'Drive by night, rest by day, and keep the herd moving steady.',
            verdict: 'right', effects: { herd: 15, crew: 5 },
            feedback: 'This is how it was really done — the herd walking under the stars, resting through the worst of the heat. Water discipline and patience brought them through.' },
          { label: 'Push straight through, day and night, to get it over with.',
            verdict: 'partial', effects: { herd: 5, crew: -10 },
            feedback: 'The herd might make it. The crew comes out the other side too worn to work.' },
          { label: 'Drive hard in the daytime heat to make good time.',
            verdict: 'wrong', effects: { herd: -15, crew: -5 },
            feedback: 'Heat plus thirst kills cattle. This is exactly how dry drives turned into disasters.' },
        ],
      },
      {
        kind: 'map',
        prompt: 'The herd smells the Pecos and starts to string out. What do you do?',
        hint: 'Thirsty cattle rushing water can drown or trample each other.',
        choices: [
          { label: 'Let the strongest run ahead to water first.',
            verdict: 'partial', effects: { herd: 5 },
            feedback: 'The strong drink first; the weak stumble in behind. It works, roughly — and it costs, roughly.' },
          { label: 'Let the whole herd rush the river at once.',
            verdict: 'wrong', effects: { herd: -15, crew: -5 },
            feedback: 'A wall of desperate cattle hitting the water together — that’s not a watering, that’s a wreck.' },
          { label: 'Hold the drags back and keep the herd together toward the crossing.',
            verdict: 'right', effects: { herd: 15 }, marker: 'herd',
            feedback: 'Thirsty cattle rushing a river pile into the banks and drown. Holding them steady on the last miles saved whole herds — Goodnight’s riders did exactly this.' },
        ],
      },
    ],
  },
  {
    title: 'Horsehead Crossing', date: 'On the Pecos', image: 'event_pecos.jpg',
    event: 'The Pecos at last — Horsehead Crossing, named for the bones along its banks. But this river is a trickster: some of its pools are bitter with alkali, poison to a thirsty cow. Getting here was the hard part. Watering here is the careful part.',
    steps: [
      {
        kind: 'map',
        prompt: 'Where do you water the herd?',
        hint: 'Not all water is good water on the Pecos.',
        choices: [
          { label: 'Water them in shifts at the good crossing, away from the alkali.',
            verdict: 'right', effects: { herd: 15 }, position: 'restCamp', marker: 'camp',
            feedback: 'Patience, one more time. Watering in shifts at good water kept the herd alive; the boss who rushed the Pecos paid for it in bones.' },
          { label: 'Let them drink fast so you can move on quickly.',
            verdict: 'partial', effects: { herd: 5, crew: -5 }, position: 'horsehead', marker: 'ford',
            feedback: 'Fast water is risky water — a cow founders, a bank caves. You get away with it until the day you don’t.' },
          { label: 'Let them drink from the nearest pools, alkali or not.',
            verdict: 'wrong', effects: { herd: -15 }, position: 'alkaliPool', marker: 'ford',
            feedback: 'Alkali water poisons cattle. Outfits lost whole herds at the very river they had crossed a desert to reach.' },
        ],
      },
      {
        kind: 'decision',
        prompt: 'A few cattle are failing after the dry drive. What now?',
        choices: [
          { label: 'Cull the weakest and press on.',
            verdict: 'partial', effects: { herd: -5, supplies: 5 },
            feedback: 'A hard call, and a common one — time saved, money left lying on the riverbank.' },
          { label: 'Push everyone on right away — no time to rest.',
            verdict: 'wrong', effects: { herd: -10, crew: -5 },
            feedback: 'Worn-out cattle pushed too soon fall out one by one. The day you refused to rest costs you a week of losses.' },
          { label: 'Rest the whole outfit a day and let the weak ones recover.',
            verdict: 'right', effects: { herd: 10, crew: 5 },
            feedback: 'A day of grass and good water brought a worn herd back to life. Out here, knowing when to stop is part of knowing how to go.' },
        ],
      },
    ],
  },
  {
    title: 'Fort Sumner', date: 'Up the Pecos', image: 'event_sumner.jpg',
    event: 'Up the Pecos stands Fort Sumner, where the army must feed thousands of Navajo people held at the Bosque Redondo reservation. The quartermaster needs beef badly, and he pays in gold. This is a market no Kansas railhead can match — and no other trail reaches it.',
    steps: [
      {
        kind: 'decision',
        prompt: 'The army quartermaster offers to buy your steers. How do you sell?',
        choices: [
          { label: 'Sell the entire herd fast, whatever the price.',
            verdict: 'partial', effects: { supplies: 5 },
            feedback: 'Gold in hand — and the Colorado market, with its own high prices, left sitting on the table.' },
          { label: 'Sell the steers here at a strong price, and plan to drive the rest north.',
            verdict: 'right', effects: { herd: 10, supplies: 10 },
            feedback: 'This is where Goodnight and Loving struck it rich — eight cents a pound, paid in gold. Markets beyond Kansas were the whole idea of this trail.' },
          { label: 'Refuse to sell here and hold out for Kansas.',
            verdict: 'wrong', effects: { herd: -5, supplies: -5 },
            feedback: 'Kansas is hundreds of hard miles in the wrong direction. You just walked past the best buyers on the trail.' },
        ],
      },
      {
        kind: 'map',
        prompt: 'Where do you point the rest of the herd?',
        hint: 'The partners built a new market out of open country.',
        choices: [
          { label: 'Hold at Fort Sumner and wait for a better offer.',
            verdict: 'partial', effects: { supplies: 5, crew: -5 },
            feedback: 'Waiting eats grass and wages. Sometimes a better buyer comes along. Mostly, he doesn’t.' },
          { label: 'Turn back for Texas with the leftovers.',
            verdict: 'wrong', effects: { herd: -10 },
            feedback: 'Back across the dry drive, for nothing? The money was north, not behind you.' },
          { label: 'North up the Pecos toward the Colorado ranges and mining towns.',
            verdict: 'right', effects: { herd: 10, crew: 5 }, marker: 'route',
            feedback: 'Denver’s mines and brand-new towns were hungry for beef. The partners kept doing what they did best — opening country nobody else would try.' },
        ],
      },
    ],
  },
  {
    title: 'On to Colorado', date: 'The partnership’s legacy', image: 'event_colorado.jpg',
    event: 'The herd climbs toward Colorado, and the trail behind you carries two names now. It will carry them for a long time — this partnership becomes one of the most famous in the West, and its best-known story is about a promise.',
    steps: [
      {
        kind: 'decision',
        prompt: 'Oliver Loving falls ill and dies on the trail. What does Goodnight do?',
        choices: [
          { label: 'Bury him along the trail and press on.',
            verdict: 'partial', effects: { crew: 5 },
            feedback: 'Many good men were buried where they fell. But that was not the promise these two had made each other.' },
          { label: 'Keep his promise: carry his partner home to Texas to be buried.',
            verdict: 'right', effects: { crew: 15 },
            feedback: 'This is a true story. Loving asked not to be left in faraway country, and Goodnight carried his partner six hundred miles home to Texas — a promise kept. Texans still tell it.' },
          { label: 'Say little and keep driving.',
            verdict: 'wrong', effects: { crew: -10 },
            feedback: 'A crew watches how a boss honors his own. Loyalty was the true coin of this trail — and you just spent yours.' },
        ],
      },
      {
        kind: 'decision',
        prompt: 'The drive is done and it’s payday.',
        choices: [
          { label: 'Pay every hand — Bose Ikard included — fair and square, and thank them by name.',
            verdict: 'right', effects: { crew: 15 },
            feedback: 'Years later, Goodnight set up a granite marker in Ikard’s honor. That is what fair dealing looked like — respect that outlasted the trail itself.' },
          { label: 'Hold their pay until you reach a town.',
            verdict: 'partial', effects: { crew: 5 },
            feedback: 'Kindly meant, maybe. But these hands just crossed a desert for you — they’ve earned the right to hold their own wages.' },
          { label: 'Shave the tally and keep the difference.',
            verdict: 'wrong', effects: { crew: -15 },
            feedback: 'Word travels down every trail in Texas. No crew rides twice for a crooked boss.' },
        ],
      },
    ],
  },
];

// ===========================================================================
// TRAIL 3 — WESTERN (the last great trail; spec §5). Final content from the beat
// matrix, written in the trail's own voice: elegiac, the world closing in — wire,
// ledgers, and fever lines. Bandera → Fort Griffin → Doan’s Crossing → Indian
// Territory → the quarantine geography → Dodge City.
// ===========================================================================

const WESTERN_WAYPOINTS = [
  { id: 'bandera',     name: 'Bandera',          sub: 'make the outfit',  x: 138, y: 508, leg: 1 },
  { id: 'fortGriffin', name: 'Fort Griffin',     sub: 'lanes between fences', x: 200, y: 406, leg: 2 },
  { id: 'openLane',    name: 'The Open Lane',    sub: 'between the claims', x: 264, y: 430, option: true },
  { id: 'fencedShortcut', name: 'A Fenced Shortcut', sub: 'someone’s land', x: 132, y: 434, option: true, hazard: true },
  { id: 'cheapFord',   name: 'A Cheap Crossing',  sub: 'untried and risky', x: 300, y: 332, option: true, hazard: true },
  { id: 'doans',       name: 'Doan’s Crossing',  sub: 'the store & the Red', x: 246, y: 300, leg: 3, hazard: true },
  { id: 'territoryW',  name: 'Indian Territory', sub: 'tolls & tight grass', x: 290, y: 210, leg: 4 },
  { id: 'dodgeLane',   name: 'The Dodge Lane',   sub: 'open to the west',  x: 356, y: 168, option: true },
  { id: 'closedLane',  name: 'The Closed Chisholm Lane', sub: 'quarantined', x: 232, y: 150, option: true, hazard: true },
  { id: 'quarantineW', name: 'The Quarantine Line', sub: 'why this trail exists', x: 318, y: 128, leg: 5, hazard: true },
  { id: 'dodgeCity',   name: 'Dodge City',       sub: 'the railhead',     x: 348, y: 48,  leg: 6 },
];

const WESTERN_PHASES = [
  {
    title: 'A Changing World', date: 'mid-1870s · Bandera', image: 'event_outfit.jpg',
    event: 'Bandera, in the last years of the great drives. You’re making up an outfit the old way — the vaquero way, the way this whole craft began — but the town feels different now. A quarantine map is nailed up at the store, and the talk on every porch is fences. The trail north is still open. For now.',
    steps: [
      {
        kind: 'decision',
        prompt: 'Hire your crew for a later, tighter trail.',
        choices: [
          { label: 'A seasoned mixed crew of vaqueros, Black cowboys, and veterans who know the new country.',
            verdict: 'right', effects: { crew: 15 },
            feedback: 'The last trails ran on the same crews as the first — about one rider in three Black or Mexican, all working a craft the vaqueros invented. What changed was the country, not the cowboys.' },
          { label: 'Old hands only, who’ve done it the old way.',
            verdict: 'partial', effects: { crew: 5, supplies: -5 },
            feedback: 'Experience is gold. But the old way was made for open range — and the range is closing.' },
          { label: 'The cheapest riders you can find.',
            verdict: 'wrong', effects: { crew: -10 },
            feedback: 'Fences, fever lines, crowded trails — this drive is harder than the old ones, not easier. Green hands will cost you.' },
        ],
      },
      {
        kind: 'map',
        prompt: 'Stock the chuck wagon.',
        hint: 'Same rolling kitchen and toolbox, same hard rule: stock it right.',
        choices: [
          { label: 'Add fancy goods to keep the crew happy.',
            verdict: 'partial', effects: { supplies: 5, crew: 5 },
            feedback: 'Good for a cheer at supper. Thin comfort when the flour sack goes light.' },
          { label: 'Load flour, bacon, beans, coffee, tools, and medicine.',
            verdict: 'right', effects: { supplies: 15 }, marker: 'camp',
            feedback: 'Some things never changed. The chuck wagon was still the beating heart of the outfit — kitchen, toolbox, and hospital on wheels.' },
          { label: 'Travel light and buy along the way at Doan’s.',
            verdict: 'wrong', effects: { supplies: -15 },
            feedback: 'One store on the whole Red River is not a supply plan. Stock the wagon as if the store might be closed.' },
        ],
      },
    ],
  },
  {
    title: 'Between the Fences', date: 'North past Fort Griffin', image: 'event_wire.jpg',
    event: 'North past Fort Griffin — and there it is. Barbed wire, glinting across land that was open range just last season. Farms and fenced pastures sit square across the old ways north. For the first time in your life, a trail boss has to thread a needle with 2,500 head of cattle.',
    steps: [
      {
        kind: 'map',
        prompt: 'How do you move the herd through the fenced country?',
        hint: 'Barbed wire is closing the open range in real time.',
        choices: [
          { label: 'Take a wide detour around all the fenced land.',
            verdict: 'partial', effects: { herd: 5, supplies: -10 }, position: 'fortGriffin', marker: 'route',
            feedback: 'No trouble, no wire — and not much grass to spare by the time you swing back on line.' },
          { label: 'Cut a fence and drive straight across a claim.',
            verdict: 'wrong', effects: { herd: -10, crew: -10 }, position: 'fencedShortcut', marker: 'route',
            feedback: 'Cut wire started real range wars in Texas. However a cowboy felt about fences, the days of driving anywhere were over.' },
          { label: 'Follow the open lane the ranchers leave between their claims.',
            verdict: 'right', effects: { herd: 10, crew: 5 }, position: 'openLane', marker: 'route',
            feedback: 'This is how the last trails survived — threading marked lanes between the wire. Year by year the lanes grew narrower, until one year they closed for good.' },
        ],
      },
      {
        kind: 'decision',
        prompt: 'A rancher rides out, angry, thinking you mean to cross his land.',
        choices: [
          { label: 'Talk plainly, show him your lane, and keep the herd off his grass.',
            verdict: 'right', effects: { crew: 10, herd: 5 },
            feedback: 'A fair word kept the peace — and kept the lanes open a little longer, for you and for every outfit coming up behind.' },
          { label: 'Offer him a steer to smooth it over.',
            verdict: 'partial', effects: { herd: -5, crew: 5 },
            feedback: 'It works once. But you can’t buy your way past every fence between here and Kansas.' },
          { label: 'Tell him the open range belongs to everyone and push on.',
            verdict: 'wrong', effects: { crew: -10, herd: -5 },
            feedback: 'That argument was already lost. The range was being fenced whether cowboys liked it or not — that is the story of this whole decade.' },
        ],
      },
    ],
  },
  {
    title: 'Doan’s Crossing', date: 'On the Red River', image: 'event_doans.jpg',
    event: 'Doan’s Crossing on the Red River — a lonely adobe store, a ledger with thousands of names in it, and the last mailbag headed south. Nearly every herd that ever walked the Western Trail passed this one door. Yours is next in the book.',
    steps: [
      {
        kind: 'map',
        prompt: 'How do you handle the crossing and the store?',
        hint: 'Doan’s was the trail’s famous last stop before the Territory.',
        choices: [
          { label: 'Cross fast and skip the store to save time.',
            verdict: 'partial', effects: { herd: 5, supplies: -5 },
            feedback: 'An hour saved at the last store before Kansas. You’ll think about that hour when the beans run short.' },
          { label: 'Cross at the proven ford, restock at the store, and send word home.',
            verdict: 'right', effects: { herd: 10, supplies: 10 }, position: 'doans', marker: 'ford',
            feedback: 'Doan’s ledger counted the herds by the hundred thousand. Smart bosses used all of it: the safe ford, the full shelves, and the last letter home before the Territory.' },
          { label: 'Try a cheaper crossing downstream, away from the store.',
            verdict: 'wrong', effects: { herd: -15, crew: -5 }, position: 'cheapFord', marker: 'ford',
            feedback: 'The proven ford was proven for a reason. The Red drowned herds that guessed at untried ones.' },
        ],
      },
      {
        kind: 'decision',
        prompt: 'The store keeper warns that grass ahead is short — too many herds this year.',
        choices: [
          { label: 'Push ahead of the other herds to reach fresh grass first.',
            verdict: 'partial', effects: { herd: 5, crew: -5 },
            feedback: 'You win the race — and spend the herd’s strength to do it.' },
          { label: 'Graze hard and fast, then move on.',
            verdict: 'wrong', effects: { herd: -10 },
            feedback: 'Ground grazed down to dust feeds nobody — not your herd, and not the next one. The trail remembered outfits like that.' },
          { label: 'Spread the herd wide and graze steady, don’t overgraze any one spot.',
            verdict: 'right', effects: { herd: 10 },
            feedback: 'A crowded trail is a shared trail. Reading the grass kept your herd fed where careless outfits starved theirs.' },
        ],
      },
    ],
  },
  {
    title: 'The Territory', date: 'Indian Territory', image: 'event_nations.jpg',
    event: 'The trail crosses the Nations’ land again — busier now than in the old days, herd after herd, and the grass stretched thin between them. Riders come out to meet you, the same as they always have: this is their land the trail crosses, and the toll is a fair one.',
    steps: [
      {
        kind: 'decision',
        prompt: 'Riders from the Nations ask the toll to cross.',
        choices: [
          { label: 'Bargain a little, then pay.',
            verdict: 'partial', effects: { crew: 5 },
            feedback: 'You saved a steer and spent an afternoon. Passable.' },
          { label: 'Refuse and push the herd through.',
            verdict: 'wrong', effects: { herd: -10, crew: -10 },
            feedback: 'Bosses who bulled through paid for it in the night — and made the trail harder for every outfit behind them.' },
          { label: 'Pay it politely — their land, fair price.',
            verdict: 'right', effects: { crew: 10, herd: -5 },
            feedback: 'The toll was the trail’s oldest bargain, and it still held: fair passage, fairly bought. Wise bosses paid it with a good word.' },
        ],
      },
      {
        kind: 'map',
        prompt: 'The grass is thin with so many herds ahead. Where do you take yours?',
        hint: 'A later, busier trail means sharing tight country.',
        choices: [
          { label: 'Swing to fresh side grass and let the crowded main trail clear.',
            verdict: 'right', effects: { herd: 10 }, position: 'territoryW', marker: 'camp',
            feedback: 'Reading the country and giving the crowd room — that’s the late-trail skill. Your herd eats while the impatient ones go hungry.' },
          { label: 'Stay on the main trail and take what grass is left.',
            verdict: 'partial', effects: { herd: 5, crew: -5 },
            feedback: 'You keep your place in the line — eating dust and leftovers the whole way north.' },
          { label: 'Crowd ahead of the other herds for the best grass.',
            verdict: 'wrong', effects: { herd: -5, crew: -10 },
            feedback: 'Crowding another outfit started fights — and worse, stampedes. The trail ran on courtesy, right to its last season.' },
        ],
      },
    ],
  },
  {
    title: 'Why the Trail Moved West', date: 'The quarantine line', image: 'event_quarantine.jpg',
    event: 'Here is the reason your trail exists at all. Year after year, Kansas farmers pushed their quarantine line west, because Texas cattle carried fever ticks that killed farm herds. The old Chisholm lanes into Abilene? Closed behind that line. The door still standing open has a name: Dodge City.',
    steps: [
      {
        kind: 'map',
        prompt: 'The old Chisholm lanes east are quarantined shut. Which way to market?',
        hint: 'This is the unit’s cause-and-effect gem — why the trails kept shifting west.',
        choices: [
          { label: 'Camp and wait to see if the line moves.',
            verdict: 'partial', effects: { supplies: -10 }, position: 'quarantineW', marker: 'camp',
            feedback: 'The line moves, all right — west, away from you. Waiting only burns grass and days.' },
          { label: 'Follow the legal lane west to Dodge City.',
            verdict: 'right', effects: { herd: 10, crew: 5 }, position: 'dodgeLane', marker: 'route',
            feedback: 'Now you know why the trails kept moving west: the fever lines pushed, and the drives slid ahead of them. That is the whole reason Dodge City became the queen of the cow towns.' },
          { label: 'Slip east into the closed Chisholm lanes by night.',
            verdict: 'wrong', effects: { crew: -10, herd: -10 }, position: 'closedLane', marker: 'route',
            feedback: 'Breaking quarantine is how trail wars started — and how Kansas learned to shut its doors to Texas cattle for good.' },
        ],
      },
      {
        kind: 'decision',
        prompt: 'Why did the farmers draw this line? Your youngest rider asks.',
        choices: [
          { label: 'Longhorns carried fever ticks that killed farm cattle — the quarantine was real and fair.',
            verdict: 'right', effects: { crew: 10 },
            feedback: 'Exactly right. Longhorns shrugged the fever off but carried its ticks; farm cattle caught it and died. The farmers weren’t villains — they were the reason the map kept changing.' },
          { label: 'The farmers just didn’t like Texans.',
            verdict: 'partial', effects: { crew: 0 },
            feedback: 'There was bad blood, sure. But the real reason was a real disease — and it killed their herds.' },
          { label: 'There’s no good reason; they’re only being difficult.',
            verdict: 'wrong', effects: { crew: -5 },
            feedback: 'Not so. Texas fever was real, and understanding it is the whole lesson of the Western Trail.' },
        ],
      },
    ],
  },
  {
    title: 'Dodge City', date: 'The railhead', image: 'ending.jpg',
    event: 'Dodge City — the loudest, sharpest, most famous cow town of them all, and the end of your trail. Stockyards, buyers, the rail line running east. And a rumor in every doorway: the railroad is building down into Texas itself.',
    steps: [
      {
        kind: 'decision',
        prompt: 'A Dodge buyer offers a low price for “trail-worn” stock.',
        choices: [
          { label: 'Take the first offer and be done.',
            verdict: 'partial', effects: { supplies: 5 },
            feedback: 'Done is not the same as done well.' },
          { label: 'Negotiate with your tally book and your grass-fat herd as proof.',
            verdict: 'right', effects: { herd: 10, supplies: 5 },
            feedback: 'A boss who knew his numbers got the real price, even from Dodge buyers who had seen everything. The $4 steer selling near $40 — that arithmetic built the cattle kingdom, right to the end.' },
          { label: 'Bluster and threaten to hold the herd.',
            verdict: 'wrong', effects: { crew: -5, herd: -5 },
            feedback: 'Dodge buyers had heard every bluff ever invented. It cost more than it won.' },
        ],
      },
      {
        kind: 'decision',
        prompt: 'Payday in Dodge — and a question about the future.',
        choices: [
          { label: 'Hold their pay until morning.',
            verdict: 'partial', effects: { crew: 5 },
            feedback: 'Kindly meant, maybe — but grown men bristle at being minded.' },
          { label: 'Shave the tally and pocket the difference.',
            verdict: 'wrong', effects: { crew: -15 },
            feedback: 'Word travels down every trail in Texas. No crew rides twice for a crooked boss.' },
          { label: 'Pay every hand fair and square, and note the rail line reaching toward Texas.',
            verdict: 'right', effects: { crew: 15 },
            feedback: 'Fair pay, fairly given — the mark of a boss worth riding for. And that rail line building south? When it reaches Texas, nobody will need to walk cattle a thousand miles again. You just rode one of the last great drives.' },
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Assemble the three trails into one variant game.
// ---------------------------------------------------------------------------

export const VARIANTS = {
  chisholm:  { name: 'Chisholm Trail',        sub: 'San Antonio → Abilene',              phases: CHISHOLM_PHASES,  waypoints: CHISHOLM_WAYPOINTS },
  goodnight: { name: 'Goodnight-Loving Trail', sub: 'Fort Belknap → the Pecos → Colorado', phases: GOODNIGHT_PHASES, waypoints: GOODNIGHT_WAYPOINTS },
  western:   { name: 'Western Trail',          sub: 'Bandera → Doan’s → Dodge City',      phases: WESTERN_PHASES,   waypoints: WESTERN_WAYPOINTS },
};

export const PHASES = { chisholm: CHISHOLM_PHASES, goodnight: GOODNIGHT_PHASES, western: WESTERN_PHASES };
export const WAYPOINTS = { chisholm: CHISHOLM_WAYPOINTS, goodnight: GOODNIGHT_WAYPOINTS, western: WESTERN_WAYPOINTS };

export default createStepGame({
  id: 'trail-boss',
  title: 'Trail Boss',
  meters: METERS,
  markers: MARKERS,
  startMeters: () => ({ ...START_METERS }),
  scoreMeters: driveScore,
  endingFor,
  debrief: DEBRIEF,
  variants: VARIANTS,
});
