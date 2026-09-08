# Photography credits — sourced photography

Every file in this directory is a real photograph downloaded from **Pexels** and
self-hosted here. They replace the AI-generated placeholder stock in
`public/assets/` (`car-*.png`, `fac-*.png`) on the Club module.

## Why these are self-hosted rather than hot-linked

`images.pexels.com` URLs are not contractual — Pexels can rotate or retire a
derivative at any time, and a broken hero on a live franchise site is not an
acceptable failure mode. Self-hosting also lets `next/image` produce AVIF/WebP
derivatives and removes the need to widen `images.remotePatterns` in
`next.config.mjs`. Total weight of this directory is ~1.7 MB.

## Licence

All files are used under the [Pexels Licence](https://www.pexels.com/license/):
free for commercial use, no attribution required, no permission needed. Credit
is recorded here anyway as good practice and so any file can be traced back to
its source.

## Selection rule — no identifiable people

Golf stock is full of identifiable players. This site publishes a **named
four-player roster**, so any recognisable golfer in editorial photography would
read to a visitor as a Lions player. Every image below is therefore either a
landscape/venue with no people, or a figure shot from behind, from distance, or
cropped below the head. **No file in this directory shows an identifiable
face.** Keep that rule if these are ever swapped out.

## Files

| File | Source | Depicts | Used on |
|---|---|---|---|
| `club-hero-fairway-dusk.jpg` | [pexels 919335](https://www.pexels.com/photo/photo-of-golf-course-919335/) | Fairway and treeline at dusk | `/the-club` hero; `/invest` full-bleed statement |
| `club-01-marquee-swing.jpg` | [pexels 114972](https://www.pexels.com/photo/person-grass-sport-outdoors-114972/) | Golfer mid-swing, cropped below the head | `/the-club` ch. 01 Marquee |
| `club-02-core-aerial-green.jpg` | [pexels 9736758](https://www.pexels.com/photo/aerial-view-of-people-playing-golf-on-a-golf-course-9736758/) | Aerial of a green, distant figures | `/the-club` ch. 02 Domestic Core |
| `club-03-longgame-coastal.jpg` | [pexels 33689451](https://www.pexels.com/photo/scenic-hong-kong-coastal-golf-course-overlook-33689451/) | Coastal golf course from above | `/the-club` ch. 03 Long Game |
| `club-04-chennai-coast.jpg` | [pexels 8572308](https://www.pexels.com/photo/cloudy-sky-above-buildings-near-marina-beach-8572308/) | Coastal city and shoreline | `/the-club` ch. 04 Home City |
| `nav-club-green-flag.jpg` | [pexels 579311](https://www.pexels.com/photo/checkered-flag-golf-golf-course-579311/) | Green with a checkered pin flag | Header mega panel — The Club |
| `nav-season-bunker-ocean.jpg` | [pexels 6573665](https://www.pexels.com/photo/photo-of-golf-course-under-blue-sky-6573665/) | Bunker with an ocean horizon | Header mega panel — The Season |
| `nav-media-ball-green.jpg` | [pexels 4475609](https://www.pexels.com/photo/white-golf-ball-on-green-grass-field-4475609/) | Ball on a green, shallow focus | Header mega panel — Media |
| `pride-hero-dawn-coast.jpg` | [pexels 2017391](https://www.pexels.com/photo/body-of-water-2017391/) | Crimson dawn over the open sea | `/the-pride` hero |
| `pride-sea-green-pin.jpg` | [pexels 35918456](https://www.pexels.com/photo/scenic-golf-course-overlooking-the-ocean-35918456/) | Putting green and pin flag above the sea | `/the-pride` full-bleed statement |
| `home-hero-sunset-green.jpg` | [pexels 19334920](https://www.pexels.com/photo/golf-course-under-a-dramatic-sky-at-sunset-19334920/) | Green and pin under a dramatic sunset sky | `/` hero |
| `home-01-links-twilight.jpg` | [pexels 6256754](https://www.pexels.com/photo/golf-course-at-dawn-6256754/) | Links fairway at twilight, a lone distant figure | `/` 01 statement band |
| `home-club-aerial-golden.jpg` | [pexels 35723500](https://www.pexels.com/photo/aerial-view-of-golf-course-in-faro-portugal-35723500/) | Course from the air at golden hour, sea on the horizon | `/` 02 The Club; `/invest` hero |
| `home-dev-range-silhouette.jpg` | [pexels 36937400](https://www.pexels.com/photo/golfer-taking-a-swing-at-driving-range-36937400/) | Backlit silhouette practising at a range | `/` 04 Golf Development |
| `ss-scores-hero-twilight-course.jpg` | [pexels 13359834](https://www.pexels.com/photo/trees-on-golf-course-at-dawn-13359834/) | Green and pin among tall trees at twilight, no people | `/scores` masthead |
| `ss-standings-hero-green-marsh.jpg` | [pexels 8454463](https://www.pexels.com/photo/grass-golf-field-beside-river-8454463/) | Championship green, bunker and marsh in low light, no people | `/leaderboards` masthead |
| `pt-hero-pavilion-golden.jpg` | [pexels 6216840](https://www.pexels.com/photo/gazebo-overlooking-golf-course-at-sunset-6216840/) | Hospitality pavilion looking over a course at golden hour, no people | `/partners` masthead |
| `gd-hero-clubhouse-lake.jpg` | [pexels 6048946](https://www.pexels.com/photo/photo-of-a-golf-course-during-daytime-6048946/) | Clubhouse across a lake from the fairway | `/golf-development` hero |
| `gd-framework-facility.jpg` | [pexels 29276528](https://www.pexels.com/photo/aerial-view-of-golf-course-in-setubal-portugal-29276528/) | Clubhouse, practice range and course from the air | **Currently unused** — see "The 2026-09 section redesigns" below |
| `gd-thesis-villas-aerial.jpg` | [pexels 34823930](https://www.pexels.com/photo/aerial-view-of-sheikh-zayed-luxury-villas-and-golf-course-34823930/) | Villas woven through a golf course, straight down | `/golf-development` Signature Thesis |
| `vv-hero-cliffside-community.jpg` | [pexels 37727309](https://www.pexels.com/photo/coastal-golf-course-with-luxurious-cliffside-homes-37727309/) | Cliffside homes above a coastal green | `/vimtra-ventures` hero (now actually wired — see below) |
| `gd-perf-putt-hole.jpg` | [pexels 6573259](https://www.pexels.com/photo/a-golf-putter-and-ball-near-the-green-hole-6573259/) | Putter and ball beside the hole | `/golf-development` 03 High Performance |

### Added 2026-09 — the section redesigns

Three frames were sourced under the same rules as everything above (Pexels
Licence, self-hosted, no identifiable face, no readable third-party mark),
plus one derivative of the franchise's own artwork.

| File | Source | Depicts | Used on |
|---|---|---|---|
| `gd-framework-dawn-green.jpg` | [pexels 31508581](https://www.pexels.com/photo/misty-golf-course-with-lush-greenery-31508581/) | A cut green and pin flag on rising ground in dawn mist, no people | `/golf-development` 01 The Framework |
| `pride-city-lighthouse.jpg` | [pexels 31653799](https://www.pexels.com/photo/chennai-lighthouse-on-scenic-beachfront-31653799/) | A red and white lighthouse tower against a clear sky | `/the-pride` 01 The City |
| `pt-tiers-golden-fairway.jpg` | [pexels 26050563](https://www.pexels.com/photo/green-golf-course-at-sunset-26050563/) | Sun breaking through a tree over a fairway and green at sunset, no people | `/partners` 03 Commercial tiers |
| `../logo-crest-mono.png` | Franchise artwork — a crop of `public/assets/Monotone-01.png` | The Lions crest, monotone crimson, transparent | `/the-club` 01 Identity |

Notes on each:

- **`gd-framework-dawn-green.jpg`** replaces `gd-framework-facility.jpg` on
  The Framework. The old frame was rendered on **two** pages —
  `/golf-development` 01 and `/invest` 02 — beside the same `gd-index`
  layout, so a reader moving between them met the same picture twice.
  `/invest` no longer carries a photograph in that section at all (it is a
  containment diagram now), and The Framework took a new frame. Portrait
  format was the point: the section is drawn as a vertical spine, and this
  is the only portrait-format landscape frame in the directory.
- **`pride-city-lighthouse.jpg`** is cropped to the tower. The original
  frame's lower third is a cluttered beach with litter, stalls and distant
  people; the published crop keeps only the tower against sky. It is used
  because The Pride's "The City" needed an *architectural*, vertical,
  crimson-and-white subject — the page's other two frames are both the sea.
  Per the location rule at the foot of this file its alt text describes the
  scene and does **not** assert that it is Chennai, even though the
  photographer labels it so.
- **`pt-tiers-golden-fairway.jpg`** is atmosphere for the commercial
  proposition, never a venue or event claim. See the two new rejections
  below for why nothing closer to the subject could be used.
- **`logo-crest-mono.png`** is not photography. It is a trimmed crop of the
  franchise's own monotone lockup, produced so The Club's Identity section
  could be carried by the mark itself rather than by a fifth stock
  photograph on that page.

The removal of `/the-club`'s "Leadership · Vimtra Ventures" section also
removed the second appearance of both founder portraits
(`subash-yammada-web.jpg`, `thimmaji-rao-yammada-web.jpg`). They now render
on `/vimtra-ventures` only.

## Rejected candidates — and why

Kept here so the same mistakes are not re-made on the next swap.

- **[pexels 10286719](https://www.pexels.com/photo/aerial-view-of-san-jose-topgolf-venue-united-states-10286719/)** — an excellent aerial of a practice venue, but the frame carries **legible third-party branding** (a TopGolf venue and a Hyatt Place hotel). A franchise site must not appear to associate itself with, or trade on, another company's marks. Never ship a frame with a readable competitor or partner logo in it.
- **[pexels 38890584](https://www.pexels.com/photo/golfer-teeing-off-at-scenic-golf-course-38890584/)** and **[pexels 15376279](https://www.pexels.com/photo/player-holding-golf-ball-15376279/)** — strong competition frames, but both carry **legible apparel branding** ("NOCTA GOLF", "UA GOLF"). This franchise has its own kit sponsors; showing a golfer in another brand's marks undercuts them.
- **[pexels 30752230](https://www.pexels.com/photo/golf-caddy-assisting-player-at-nairobi-course-30752230/)** — a caddie's hi-vis vest carries a legible advertisement with a phone number.
- **Every golf-coaching result on Pexels** — the search returns almost exclusively photographs of children being taught. Identifiable minors do not go on a commercial franchise page. The academy and grassroots initiatives are therefore set typographically, with no stand-in photography.
- **Chennai beach scenes with people in the foreground** — good for "community", but they put private individuals' faces on a commercial page for no editorial gain. Passed over in favour of frames without them.
- **[pexels 35454862](https://www.pexels.com/photo/large-crowd-gathers-on-multi-level-viewing-structure-at-a-golf-event-35454862/)** — the best frame found for `/partners` on subject (tournament grandstand, hospitality decks, golden hour) and rejected outright: the structure and the boards around the green carry FedEx and other sponsors' marks. On the one page about who sponsors the Chennai Lions, a visitor could read those as Lions partners.
- **[pexels 35428479](https://www.pexels.com/photo/colorful-outdoor-golf-target-practice-range-35428479/)** — on subject and clean (a structured target range, no people, no marks), and rejected on PALETTE. Its targets are pink, cyan and magenta; dropped into a crimson/gold/ivory system it would have been the one image on the site fighting the brand.
- **[pexels 27309420](https://www.pexels.com/photo/a-man-is-mowing-the-grass-on-a-golf-course-27309420/)** — the best frame found for "course-operating standards" (a greenkeeper cutting a green at dawn, face not readable). Downloaded, inspected at 2x, and discarded: the mower deck carries a legible **TORO** wordmark. Same rule as the TopGolf and NOCTA frames above.
- **[pexels 35454864](https://www.pexels.com/photo/scenic-golf-course-with-empty-bleachers-35454864/)** and **[pexels 35048316](https://www.pexels.com/photo/scenic-golf-course-under-clear-blue-sky-35048316/)** — both sought for `/partners` "Commercial tiers", both from the same event as the already-rejected 35454862, and both rejected for the same reason at higher resolution: the greenside scoreboard carries **Rolex, Mitsubishi, Mastercard and Reef Capital Partners**. On the page about who sponsors the Chennai Lions those read as Lions partners. The tournament-hospitality category on Pexels is systematically branded; the section took an unbranded golden-hour course frame instead.
- **[pexels 32988401](https://www.pexels.com/photo/scenic-golf-course-with-mountain-view-32988401/)** — a strong mountain-course frame, but the pin flag carries a legible golf-estate name and logo. Downloaded, inspected at 2x, and discarded for the same reason as the TopGolf and NOCTA frames above.

## Season module — why these two exist

`/scores` and `/leaderboards` had no photography at all until the season
module was redesigned. Every one of the nineteen files above was already
in use on another page, and repeating one would have put the same frame on
two heroes, so two new photographs were sourced under the same rules.

Both sit behind the **page's own title** — "SCORES", "LEADERBOARDS" — and
never beside an event name. That distinction matters here: the tournament
card on `/scores` names Al Hamra, Anahita, Royal Johannesburg and
Lubumbashi, and a photograph adjacent to any of those headings would read
as a picture of that venue. Venue identity on these pages is text from the
Fixture row, never imagery. Both files carry `alt=""`.

## Location claims — read before writing a caption

These are **generic stock locations, not Lions venues**. None of them is TNGF
Cosmo, and none was shot in Chennai for this franchise.

`club-04-chennai-coast.jpg` and `pride-hero-dawn-coast.jpg` are labelled by
their photographers on Pexels as Chennai / Marina Beach. That label is the
photographer's, not verified by us, so their alt text describes the scene
rather than asserting the location. **Do not caption any file here with a
named venue** unless the franchise supplies its own photography.

This is why `/the-pride`'s "TNGF Cosmo, Chennai" section carries **no
photograph**. TNGF Cosmo is a real, documented venue (brochure p. 04 — it is
also the footer address), and any image placed beside that heading would read
as a picture of it. The section is set typographically instead. Replace it
with a photograph only when the franchise supplies one actually taken there.
