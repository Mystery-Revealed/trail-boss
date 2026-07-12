# "Trail Boss" — Build Specification
### Unit 6 Game · 7th Grade Texas History · Cotton, Cattle, and Railroads

**Purpose:** A build-ready spec to paste into Claude (Fable, Opus, Sonnet) to create the game, deploy on Render via GitHub, and embed in Wix. Same shared Socket.IO engine, Teacher Command Center, and workflow as your other games — this spec covers what's unique.

> **Reading-level rule:** 7th grade content at a **5th grade reading level** for everything the student sees. Does not apply to this spec.

> **Data method:** the **shared Socket.IO engine, solo mode**. New adapter: `trailBoss.js`. **Variants = the three trails** — the student picks one at the start, and the dashboard groups accuracy by trail, exactly like tribes in Survive the Season.

---

## 1. Game at a Glance

| Field | Value |
|---|---|
| **Title** | Trail Boss |
| **Unit** | 6 — Cotton, Cattle, and Railroads (1876 era; drives ran ~1867–1885) |
| **TEKS** | 7.6B (development of the cattle industry from its Spanish beginnings; the cowboy way of life), 7.6A (frontier expansion), 7.6C (railroads' effects — the drive's destination *is* a railhead). Skills: 7.8A/B, 7.21A/B (geography and maps), 7.20B |
| **Pick** | **A historic trail** — Chisholm, Goodnight-Loving, or Western — the group the dashboard tracks |
| **Type** | Solo strategy — **hybrid: a clickable trail map + decisions** — 6 legs × 2 actions = **12 graded actions** |
| **Playtime** | 8–10 minutes per trail; replay to ride the others |
| **Platform / tracking** | Shared engine solo mode; Command Center with **per-trail accuracy**; session-only data |
| **Art style** | Semi-realistic / cinematic |

**One-sentence pitch:** You're the trail boss of 2,500 longhorns and a dozen riders — pick a historic trail, read the rivers and the sky, keep your herd and your crew together, and bring them through to the railhead where the cattle turn to gold.

**The core teaching idea:** After the Civil War, Texas was cattle-rich and cash-poor; a longhorn worth $4 in Texas brought $40 at a Kansas railhead. The drives connected Texas to the nation's markets **by geography** — each trail solved a different map problem — and the whole way of life ran on skills learned from Spanish **vaqueros**. Students learn the trails by riding them (TEKS 7.6B, 7.21).

**Winning vs. accuracy:** the meters show how the drive went; **accuracy** shows how well the student made the choices a good trail boss really made. The debrief connects to what ends the era: railroads reaching Texas and **barbed wire** closing the open range by the mid-1880s — the bridge to the rest of your Unit 6.

---

## 2. Historical Content Bank

### 2.1 The three trails (the variants)
| | **Chisholm Trail** | **Goodnight-Loving Trail** | **Western Trail** |
|---|---|---|---|
| **Route** | San Antonio → Fort Worth → Red River Station → Indian Territory → **Abilene, Kansas** | Fort Belknap → **Horsehead Crossing** on the Pecos → up the Pecos → Fort Sumner, NM → Colorado | San Antonio/Bandera → **Doan's Crossing** on the Red → **Dodge City, Kansas** |
| **Era** | 1867 onward — the classic | 1866 onward — the pioneers' western route | mid-1870s onward — after quarantine lines pushed drives west |
| **Signature challenge** | The **Red River** crossing; passage tolls through Indian Territory; Kansas farmers' quarantine line | The **96-mile dry stretch** to the Pecos — no water at all; alkali water dangers; long lonely country | Later era: quarantine lines, fenced land creeping in, the wilder cow town of Dodge |
| **Famous figures** | Jesse Chisholm (the trader the trail is named for); Joseph McCoy (built Abilene's stockyards) | **Charles Goodnight** & **Oliver Loving**; **Bose Ikard**, the Black cowboy Goodnight trusted with the outfit's money | Doan's store keepers; the Dodge City buyers |
| **Destination lesson** | Railhead economics — $4 steer becomes $40 | Selling to army posts & reservations, then Colorado — markets beyond Kansas | The last great trail — and why the trails kept shifting west |

### 2.2 The cowboy way of life (7.6B — weave throughout)
- **Spanish beginnings:** the whole craft — roping, branding, riding gear, the words *lasso, lariat, rodeo, ranch, chaps* — comes from Mexican **vaqueros**. Say so early and plainly.
- **A diverse crew:** roughly **one cowboy in three was Black or Mexican/Tejano**. Real drives were mixed crews; the game's crew is too.
- **The work:** point, swing, flank, and drag riders; the **remuda** (spare horses); night guard sung low to calm the herd (cowboys really sang); the **chuck wagon** — invented by Charles Goodnight — was the drive's kitchen and toolbox.
- **The dangers:** river crossings, lightning-night **stampedes**, dry drives, rustlers, and the **quarantine lines** Kansas farmers drew against Texas fever (a tick-borne disease longhorns carried but resisted).
- **The pay-off and the end:** a few dollars a month and a wild day in the cow town — then railroads reached Texas and **barbed wire** fenced the range, and by the mid-1880s the great drives were over.

### 2.3 Vocabulary (define on first use)
- **Trail boss** — the leader of a cattle drive.
- **Longhorn** — the tough Texas cattle breed that could walk a thousand miles.
- **Remuda** — the herd of spare horses.
- **Chuck wagon** — the rolling kitchen of the drive.
- **Stampede** — the whole herd running in panic.
- **Quarantine line** — a boundary farmers drew to keep Texas cattle (and their fever ticks) away.
- **Railhead** — the town where the railroad ends and cattle are shipped east.

---

## 3. Core Mechanics

### 3.1 The trail map (interactive layer)
Each trail has its own stylized map with **6 legs** as clickable waypoints (start → rivers/dry country → territory line → market). Map actions ask the boss to choose crossings, camps, or lanes; the map shows the herd 🐄, the chuck wagon, water ⛲, and hazard zones. The player watches their herd move north leg by leg — the geography *is* the scoreboard. Colorblind-safe icons and patterns.

### 3.2 Meters (each 0–100, start 50)
- **Herd** 🐄 — the cattle's numbers and condition (weight = money).
- **Crew** ❤️ — the riders' health, trust, and morale.
- **Supplies** 🍖 — food, gear, and the state of the chuck wagon.

### 3.3 Structure — 6 legs, 2 actions each
Leg = event card → **one map action + one decision** → feedback. **12 graded actions**; right = 1, partial = 0.5, wrong = 0; accuracy server-side, grouped by trail.

### 3.4 Endings
**Drive Score** = Herd + Crew + Supplies → tiers ("Top Boss" / "Brought 'Em Through" / "Hard Lessons on the Trail") → debrief: the sale at the railhead (the $4 → $40 arithmetic), fair pay for the crew, and the era's end — rails reach Texas, barbed wire closes the range, and the great trails fade by the mid-1880s. Replay nudge: "Ride a different trail — different country, different problems."

---

## 4. Reference Content — CHISHOLM TRAIL (complete; the other trails follow in Section 5)

Player-facing text at a 5th grade level. ✅ right · ⚠️ partial · ❌ wrong.

### Leg 1 — San Antonio: "Making an Outfit"
*Event:* Spring grass is up. You have 2,500 longhorns under contract for Abilene, Kansas — a thousand miles north. First: build your outfit.

**Decision — Hire your crew.**
- ✅ **A seasoned mixed crew — Tejano vaqueros, Black cowboys, steady veterans, a few strong kids — and above all a good cook.** Crew +15. *"Real outfits looked exactly like this — about one rider in three was Black or Mexican. And every boss knew the cook mattered most: bad beans break a drive faster than bad weather."*
- ⚠️ **All top-dollar veterans.** Crew +5, Supplies −10. *"A fine crew — at wages that eat your profit before you start."*
- ❌ **The cheapest greenhorns in the plaza.** Crew −10. *"A thousand miles is a hard school. Green riders cost cattle, and sometimes worse."*

**Map action — Outfit the chuck wagon.**
- ✅ **Stock it right: flour, bacon, beans, coffee — plus tools, medicine, and spare gear.** Supplies +15. *"The chuck wagon — Charles Goodnight's own invention — was kitchen, toolbox, and hospital on wheels. Stock it like your life depends on it, because it does."*
- ⚠️ **Add crates of canned oysters and fancy goods.** Supplies +5, Crew +5. *"The boys will cheer — until the flour runs short in Indian Territory."*
- ❌ **Travel light and hunt along the way.** Supplies −15. *"A drive is work from dark to dark. Nobody has time to hunt supper for twelve."*

### Leg 2 — The Rivers: "Red River Station"
*Event:* Weeks north, the herd strings out two miles long. Ahead waits the drive's first great test: the Red River, swollen with spring rain.

**Map action — Choose your crossing.**
- ✅ **The known low-water ford at Red River Station.** Herd +15. *"Bosses crossed where a thousand herds had crossed — proven bottom, proven banks. The Station was the Chisholm's front door."*
- ⚠️ **Wait three days for the water to drop.** Herd +5, Supplies −10. *"Safe — but grass eaten bare and supplies burned while you sit."*
- ❌ **A shortcut crossing at a deep bend.** Herd −15, Crew −5. *"Quicksand banks and swimming water. Herds drowned taking shortcuts."*

**Decision — Mid-river, the cattle begin to mill in the current.**
- ✅ **Send your strongest swimmers on the best horses to break the mill and point the leaders to the bank.** Herd +10, Crew +5. *"Exactly the vaquero-taught craft. Break the circle, show the leaders the way out, and the herd follows."*
- ⚠️ **Push more cattle in behind to force the jam loose.** Herd −5. *"Pressure from behind drowns the ones in front."*
- ❌ **Fire shots to scare them across.** Herd −10, Crew −5. *"Panic in deep water is how you lose cattle and riders both."*

### Leg 3 — The Storm: "Lightning Night"
*Event:* Indian Territory. The air goes green and still, and thunder starts walking toward the bedground. Every rider knows what a lightning night can do.

**Decision — Before the storm hits, you set the night guard.**
- ✅ **Double the guard and have them ride slow circles, singing low.** Herd +10, Crew +5. *"Cowboys truly sang to the herd — low, steady sound so no sudden noise would set them off. It was a tool of the trade."*
- ⚠️ **Bed the herd tight in a creek bottom.** Herd +5, Crew −5. *"Shelter, yes — but flash floods and blind banks make bottoms risky."*
- ❌ **Let the men shelter and trust the herd to weather it.** Herd −15. *"An unguarded herd on a lightning night is a stampede waiting for the first thunderclap."*

**Map action — The thunder breaks anyway, and 2,500 head are running. Where do you turn them?**
- ✅ **Race to the leaders and bend them into a circle — mill them on open ground.** Herd +15, Crew −5. *"The classic move: you can't stop a stampede, so you steer it into a spiral until it winds itself out."*
- ⚠️ **Point them toward open prairie and ride alongside till they tire.** Herd +5. *"It works — miles from camp, with cattle scattered from here to breakfast."*
- ❌ **Get in front and try to stop them head-on.** Herd −10, Crew −15. *"No wall of riders stops running longhorns. Men died trying."*

### Leg 4 — Indian Territory: "The Toll"
*Event:* Riders from the Nations meet the herd — this is their land the trail crosses, and the toll is cattle. Your drovers watch to see what kind of boss you are.

**Decision — The toll is asked: a few beeves to cross.**
- ✅ **Pay it with good grace — their land, fair price.** Crew +10, Herd −5. *"Paying the 'wohaw' toll was the trail's standard bargain, and the wise boss paid it politely. Fair passage, fairly bought."*
- ⚠️ **Bargain hard, then pay.** Crew +5. *"You saved a steer and spent an afternoon. Passable."*
- ❌ **Refuse and push through.** Herd −10, Crew −10. *"Bosses who bulled through found stampedes started mysteriously in the night. Disrespect was expensive."*

**Map action — Supplies run low. Where do you restock?**
- ✅ **Trade honestly at the licensed post on the trail.** Supplies +15. *"The trail had its stores and stations — real prices for real goods, and a boss's good name traveled ahead of him."*
- ⚠️ **Ration hard and push for Kansas.** Supplies +5, Crew −5. *"Thin beans make thin tempers."*
- ❌ **Help yourselves to a settler's corn.** Crew −10, Supplies +5. *"Word of a thieving outfit reaches Abilene before the herd does."*

### Leg 5 — The Kansas Line: "The Quarantine"
*Event:* Kansas farmers block the trail with shotguns and a drawn line: Texas cattle carry fever ticks that kill their livestock. The legal lane swings west.

**Decision — The farmers stand on their line.**
- ✅ **Respect the quarantine — swing the herd into the marked lane west.** Crew +10, Herd +5. *"Texas fever was real — longhorns resisted it, farm cattle died of it. The lines kept moving west, and so did the trails. This is why Dodge City ever mattered."*
- ⚠️ **Camp on the line and argue it out.** Supplies −10. *"You'll lose the argument and the grass both."*
- ❌ **Cut the fences and cross by night.** Crew −10, Herd −10. *"That's how trail wars started — and how Kansas closed itself to Texas cattle."*

**Map action — Last water before Abilene. How do you bring the herd in?**
- ✅ **Slow down — graze and water them full, arrive heavy.** Herd +15. *"Cattle sell by the pound. The last week's grass was worth more than the first month's miles."*
- ⚠️ **Sell early to a passing buyer at a discount.** Herd +5, Supplies +5. *"Cash now, but the Abilene price was the whole point of the walk."*
- ❌ **Race the last stretch to beat the other herds in.** Herd −10. *"First and skinny loses to fat and third."*

### Leg 6 — Abilene: "The Railhead"
*Event:* Abilene at last — stockyards, buyers, and the rail line running east. The herd you walked a thousand miles is suddenly worth ten times what it was in Texas.

**Decision — The buyer squints and offers a low price, "trail-worn stock."**
- ✅ **Negotiate with your tally book and your grass-fat cattle as proof.** Herd +10, Supplies +5. *"A boss who knew his numbers — head count, weights, losses — got the real price. That $4 Texas steer sold near $40 here. That arithmetic built the cattle kingdom."*
- ⚠️ **Take the first offer and be done.** Supplies +5. *"Done is not the same as done well."*
- ❌ **Bluster and threaten to drive on to another railhead.** Crew −5, Herd −5. *"Buyers talked to each other. Bluster cost more than it won."*

**Decision — Payday. The drive is over.**
- ✅ **Pay every hand fair and square, thank them by name, bank the owner's share.** Crew +15. *"Fair pay and a fair word — the bosses men signed with again. Cowboys earned about a month's wage for the hardest work in the West; the least a boss owed was every dollar of it."*
- ⚠️ **Hold their pay till morning so it survives the saloons.** Crew +5. *"Some bosses did — kindly meant, but grown men bristle at being minded."*
- ❌ **Shave the tally and pocket the difference.** Crew −15. *"Word travels down every trail in Texas. No crew rides twice for a crooked boss."*

*(Ending: Drive Score → tier → debrief: the sale, the crew's pay, and the era's closing — rails and barbed wire end the drives within a decade.)*

---

## 5. Content Matrix — the Other Two Trails

Same 6-leg structure and grading pattern; Fable writes them from these beats.

### Goodnight-Loving Trail (the western epic)
| Leg | Signature beat | Right choice teaches |
|---|---|---|
| 1 | Outfit at Fort Belknap; Goodnight's own chuck-wagon standard; hire **Bose Ikard**-caliber hands | Diverse, trusted crews (Ikard carried the outfit's money — Goodnight trusted him with everything) |
| 2 | The plan itself: swing **south around** Comanche country rather than straight west | Geography as strategy — the trail's whole shape is one big decision |
| 3 | **The 96-mile dry drive** to the Pecos: water discipline, drive by night, rest by day | The trail's famous ordeal; slow-is-smooth logistics |
| 4 | **Horsehead Crossing**: thirsty cattle smell the Pecos and rush; alkali pools poison the careless | Control the approach; water a thirsty herd in shifts |
| 5 | Up the Pecos to **Fort Sumner**: sell to army posts and reservations | Markets beyond Kansas — different buyers, different math |
| 6 | On to Colorado; the partnership's legacy (Loving's death from a wound en route — handled gently: "Goodnight carried his partner home to Texas, a promise kept") | Loyalty and the trail's human cost, told with dignity |

### Western Trail (the last great trail)
| Leg | Signature beat | Right choice teaches |
|---|---|---|
| 1 | Outfit at Bandera in the later era: fences already creeping, quarantine maps posted | The world is changing around the drive |
| 2 | North past Fort Griffin; choosing lanes between fenced claims | Barbed wire's creep — the open range shrinking in real time |
| 3 | **Doan's Crossing** on the Red — the store, the ledger, the last mail south | Trail infrastructure; the famous crossing store |
| 4 | Indian Territory tolls and grass management on a later, busier trail | Same courtesy, tighter grass |
| 5 | The quarantine geography that *created* this trail — Chisholm lanes closed, Dodge open | Why trails moved west (Texas fever lines) — the unit's cause-and-effect gem |
| 6 | **Dodge City**: wilder market, sharper buyers; pay the crew, note the rail creeping toward Texas itself | The era's end: when rails reach Texas, why walk to Kansas? |

---

## 6. Engine Integration

- **New adapter:** `server/src/games/trailBoss.js` — solo-only, **variants = `chisholm` | `goodnight` | `western`**, `totalActions: 12`, meters `{ herd, crew, supplies }` start 50. Map-action choices carry a `position` (waypoint id). `mapInit()` per trail: an ordered waypoint list the client draws the herd along.
- Register in `games/index.js`; sessions use `{ gameId: 'trail-boss', mode: 'solo' }`. Everything else is stock engine; the dashboard's per-variant grouping gives per-trail accuracy automatically.
- **Client:** trail-map component (waypoints, herd marker advancing leg by leg, hazard zones) + decision cards. Three map images, one per trail.

## 7. Visual & Audio Assets (Higgsfield MCP)

**Art direction:** *Semi-realistic cinematic historical illustration, the Texas–Kansas trail country, 1867–1885. Big skies, dust and golden light, dignified working cowboys — including Black and Mexican/Tejano riders in every crew scene. No violence. No text or logos. 16:9.*

| # | Asset | Prompt sketch |
|---|---|---|
| 1 | Title / hero | "A two-mile line of longhorns moving north through open grass at dawn, riders at point and flank, dust hanging gold in the light." |
| 2–4 | Trail maps ×3 | "Stylized illustrated map, warm parchment tones" — one each: Chisholm (San Antonio→Abilene, Red River Station), Goodnight-Loving (Fort Belknap→Pecos→Fort Sumner→Colorado, the dry stretch marked), Western (Bandera→Doan's Crossing→Dodge City, quarantine lines marked). |
| 5 | Leg 1 — the outfit | "A trail crew gathering at dawn by a loaded chuck wagon — a mixed crew of Black, Tejano, and Anglo cowboys checking gear, horses saddled." |
| 6 | Leg 2 — the river | "Longhorns swimming the wide Red River, riders guiding the leaders from strong horses, spray and morning light — tense but safe." |
| 7 | Leg 3 — lightning night | "A herd bedded under a towering black storm front at dusk, two night riders circling calm and low, first lightning far off." |
| 8 | Leg 4 — the territory | "A respectful meeting on horseback between the trail boss and riders of the Nations on open prairie, cattle grazing behind." |
| 9 | Leg 5 — the line | "Kansas farm families standing at a plowed boundary line as a herd swings west into a marked lane — firm, not violent." |
| 10 | Leg 6 — the railhead | "Abilene stockyards boiling with longhorns, a steam locomotive taking on cattle cars, buyers and cowboys on the fences — payday energy." |
| 11 | Icons | Flat vector: longhorn, chuck wagon, water drop, hazard, rail spike. |
| 12 | *(Optional)* loop/ambience | Wind in grass, distant lowing, a soft night-guard song hummed. Muted by default. |

## 8. Model Workflow

| Model | Use for |
|---|---|
| **Fable** | The Chisholm script polish + full Goodnight-Loving and Western scripts from the Section 5 matrices — three distinct trail voices, one steady 5th grade level. Handle Loving's death gently (one line, a promise kept). |
| **Opus** | The adapter (three variant step-lists), trail-map state, herd-marker progression, Command Center check. |
| **Sonnet** | Map UI ×3, art wiring, responsiveness, tests. |
| **Higgsfield** | Images per Section 7. |

Order: Fable content → Opus adapter + maps → Higgsfield art → Sonnet polish → GitHub → Render → Wix (standard steps).

## 9. Teacher Command Center

Standard shared-engine Command Center with **per-trail accuracy**: *"Chisholm — 9 riders — 82% · Goodnight-Loving — 8 — 77% · Western — 7 — 80%."* PDF: Students (Name · Trail · Status · Accuracy %) + class accuracy by trail. Footer: "7th Grade Texas History · Trail Boss · TEKS 7.6A, 7.6B." Session-only data; delete-on-end box; idle sweep.

## 10. Build Checklist & Test Plan (delta from the standard)

- [ ] All three trails' 12-action scripts filled; per-trail maps and waypoints
- [ ] Trail pick sets the engine variant; dashboard groups by trail
- [ ] All-right = 100% on each trail; herd marker advances correctly leg by leg
- [ ] Vaquero origins stated early (7.6B); diverse crew in text and art; Bose Ikard named on Goodnight-Loving
- [ ] Quarantine-line beats explain why trails shifted west; debrief lands rails + barbed wire = the end of the drives
- [ ] Standard items: reading level, alt text, responsive, no browser storage, session-only data, PDF, end-session box

## 11. Teacher / Sensitivity Notes

- **The vaquero debt is the headline, not a footnote.** The entire craft is Spanish-Mexican in origin (your outline says it; TEKS 7.6B requires it). Say it in Leg 1, show it in the art.
- **Diverse crews are historical fact** — about one in three cowboys was Black or Mexican/Tejano. Bose Ikard's story (trusted with all the outfit's money) is the single best carrier of this truth on the Goodnight-Loving trail.
- **Indian Territory tolls** are presented as what they were: fair payment for crossing sovereign land, paid politely by smart bosses. No "hostile territory" framing.
- **Texas fever quarantines** were legitimate — farmers' cattle really died. The farmers aren't villains; they're the reason geography kept shifting, which is the lesson.
- **Oliver Loving's death** (Goodnight-Loving, Leg 6) is told in one gentle line about a promise kept — no wound detail.
- **Cow-town wildness** stays age-appropriate: payday energy, not saloons and vice.

---
*Companion to Survive the Season, Claim the Land, Hold the Line, President of the Republic, and Run the Blockade. Shared engine (solo mode), same Command Center, same GitHub → Render → Wix workflow.*
