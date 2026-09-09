import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import StoryHero from "@/components/site/StoryHero";
import FullBleedStatement from "@/components/site/FullBleedStatement";
import { Section, IndexLabel, SectionTitle } from "@/components/site/Section";

export const metadata: Metadata = {
  alternates: { canonical: "/golf-development" },
  title: "Golf Development",
  description:
    "Vimtra's Indian golf platform, built on a licensed partnership with the PGA of America — coaching curriculum, instructor accreditation, event and course standards, alongside Golf on Wheels and a Chennai course + academy under development.",
};

/* ---------------------------------------------------------------------------
   CONTENT SOURCES
   Every claim on this page is sourced from the Chennai Lions IGPL brochure
   (pp. 02–03, 15, 16) or the Vimtra Ventures profile. Current vs planned
   initiatives are marked explicitly so nothing "under development" reads as
   if it has shipped. Nothing here is written to fill a composition.

   The three `NumberedList` card stacks are gone. Each section now has one
   dominant idea: The Framework is a statement beside a figure with a ruled
   index beneath; the Signature Thesis is a full-bleed typographic moment
   with minimal support; High Performance is a filling figure beside a ruled
   field. No cards anywhere.

   ADDED SECTION — THE PGA PARTNERSHIP (02): sourced entirely from the
   "VIMTRA VENTURES LLC x PGA OF AMERICA - Building India's Golf Future"
   brochure (Company Profile 2026, p. 01). Before the September 2026 content
   audit the partnership appeared NOWHERE on this site, even though "The
   Framework" above already claimed coaching curriculum, coach certification,
   event standards and course-operating standards as the platform's remit —
   the section that explains where those standards come from was simply
   missing. It sits second for that reason. No PGA logo or mark is used; the
   repository holds no PGA artwork and none was sourced.

   ADDED SECTION — INITIATIVES (05): "Golf on Wheels" and the Chennai
   "Course & Academy" are promised by this page's own <meta description> and
   are approved copy already live on the home page, but the page itself never
   rendered them. That gap is now closed with the existing wording and its
   existing status tags. This is the one section that is an addition rather
   than a redesign — it is trivially removable if it is not wanted.

   NO ACADEMY PHOTOGRAPHY: golf-coaching stock is almost entirely
   photographs of children being taught. Identifiable minors do not belong
   on a commercial franchise page, so the academy and grassroots initiatives
   are set typographically rather than given stand-in imagery.
--------------------------------------------------------------------------- */

// Brochure p. 03 — the operating framework.
const FRAMEWORK = [
  {
    tag: "Operating Framework",
    name: "Vimtra Golf Ventures",
    body:
      "The dedicated Indian golf operating entity — coaching curriculum, coach certification, event standards, and course-operating standards under a single institutional authority.",
  },
  {
    tag: "Franchise",
    name: "Chennai Lions GC · IGPL Season 2026",
    body:
      "Vimtra's Indian golf platform expressed as a competitive team — anchored by a proven marquee, built around a rising domestic core.",
  },
];

// PGA brochure p. 01 — the two offices named on the partnership page.
const PGA_OFFICES = [
  { k: "Registered office", v: "Fremont, CA", d: "Vimtra Ventures LLC" },
  { k: "Primary office", v: "Frisco, TX", d: "PGA of America" },
  { k: "PGA of America heritage", v: "Since 1916", d: "Championship courses · Academies · Communities" },
];

/* ---------------------------------------------------------------------------
   THE FIVE MOVES — verbatim from the Vimtra x PGA of America brochure
   (Company Profile 2026, p. 03, "STRATEGIC VISION — Five moves to grow the
   game"). Order and wording are the source's own.

   Move 05 names Khelo India and the Ahmedabad 2036 Olympics bid. The source
   sentence is "Align with initiatives like Khelo India and the upcoming
   Ahmedabad 2036 Olympics bid" — an intention to align, not a relationship,
   an endorsement or a selection. It is reproduced as written and nothing is
   added to it.
--------------------------------------------------------------------------- */
const MOVES = [
  {
    n: "01",
    t: "Grassroots development",
    d: "Introduce golf at the school and academy level, building awareness of the game among younger generations.",
  },
  {
    n: "02",
    t: "Championship facilities in metros",
    d: "Build 18-hole championship courses that host international tournaments, attract tourism, and elevate India's presence in global golf.",
  },
  {
    n: "03",
    t: "Par-3 courses in Tier 2/3 cities",
    d: "Democratize access and nurture grassroots talent — smaller, more accessible courses are perfect for beginners and urban areas with limited space.",
  },
  {
    n: "04",
    t: "Golf-led communities",
    d: "Partner with real estate developers to create golf-led residential communities, leveraging exclusivity premiums.",
  },
  {
    n: "05",
    t: "Government alignment",
    d: "Align with initiatives like Khelo India and the upcoming Ahmedabad 2036 Olympics bid.",
  },
];

// Brochure p. 15 — signature thesis and three anchors, verbatim.
const ANCHORS = [
  {
    tag: "Anchor · 01",
    name: "Premium Golf",
    body: "World-class facilities to international championship standards.",
  },
  {
    tag: "Anchor · 02",
    name: "Luxury Residential",
    body: "HNI communities integrated with the course itself.",
  },
  {
    tag: "Anchor · 03",
    name: "Lifestyle & Investment",
    body: "Amenities, hospitality and long-cycle asset value.",
  },
];

// Vimtra Ventures profile — the profile's own framing of the Chennai
// Lions build.
const HIGH_PERFORMANCE = [
  { label: "Talent", body: "Identifying and nurturing elite golfing talent." },
  {
    label: "Pathways",
    body: "Strengthening professional pathways for Indian golfers.",
  },
  {
    label: "Ecosystem",
    body: "Building a strong leadership and advisory ecosystem.",
  },
  {
    label: "Platform",
    body:
      "Creating a globally competitive platform for Indian professional golf.",
  },
];

/* Initiatives. The first two are the wording and status tags already
   published on the home page (Vimtra Ventures profile, "Golf & Sports
   Development"). The second two were added in the content audit from the
   Vimtra x PGA brochure p. 04, which carries the grassroots roadmap the site
   did not have; their tags are that page's own labels — "TALKS UNDERWAY" and
   "ON THE ROADMAP" — and are not upgraded to anything firmer.

   That page also names Delhi Golf Club, the Karnataka Golf Association,
   Bombay Presidency and the Tamil Nadu Golf Federation. Those are named
   there as where India's certified academies already CONCENTRATE, not as
   Vimtra partners — the partnership sentence says only "select existing
   academies" and names none. They are therefore deliberately NOT reproduced
   here: printing four real institutions on a commercial franchise page
   beside a partnership claim would imply a relationship the source does not
   state. */
const INITIATIVES = [
  {
    tag: "Grassroots · with IGPL",
    name: "Golf on Wheels",
    body:
      "A schools-and-colleges outreach initiative bringing golf directly to campuses through mobile simulators.",
  },
  {
    tag: "Coming soon · Chennai",
    name: "Course & Academy",
    body:
      "A world-class course and academy under development in Chennai — professional training, youth development and community engagement.",
  },
  {
    tag: "Talks underway",
    name: "Partnering with established academies",
    body:
      "Active conversations with select existing academies to become PGA-affiliated partners under the Vimtra platform — extending their reach, curriculum, and instructor standards.",
  },
  {
    tag: "On the roadmap",
    name: "New academies & Par-3 access in Tier 2/3",
    body:
      "Identifying high-potential Tier 2 and Tier 3 cities to open new PGA-certified academies and compact Par-3 courses that lower the barrier to entry — city by city.",
  },
];

export default function GolfDevelopmentPage() {
  return (
    <>
      <StoryHero
        eyebrow="The Platform"
        title={["GOLF", "DEVELOPMENT"]}
        line="Coaching, academies, event standards and course operations — to international championship level."
        image="/assets/photo/gd-hero-clubhouse-lake.jpg"
        imageAlt="A clubhouse seen across a lake from the fairway"
        imagePosition="50% 44%"
      />

      {/* 01 — THE FRAMEWORK.
          A governing spine, not a statement beside a figure.

          The two rows of FRAMEWORK are not a list of equals — the first is
          the institutional authority and the second is what that authority
          produces. The section is drawn that way: a single vertical rule
          runs down the column with a node on it for each stratum, and each
          stratum steps further in than the one above, so the structure of
          the framework is the composition rather than something the copy
          has to assert. It adapts to however many rows FRAMEWORK holds.

          The photograph is a tall column pinned to the left of the section
          and is the page's only portrait-format frame — chosen so it reads
          as a core sample through the platform rather than as an
          illustration beside a paragraph. See the note in
          public/assets/photo/CREDITS.md on why this frame replaced the
          aerial that /invest was also using. */}
      <Section surface="ivory" className="gdf-sec">
        <div className="cm-track gdf">
          <IndexLabel n="01">The Framework</IndexLabel>

          <figure className="gdf-col">
            <Image
              src="/assets/photo/gd-framework-dawn-green.jpg"
              alt="A cut green and pin flag on rising ground in dawn mist"
              fill
              sizes="(max-width: 1023px) 100vw, 30vw"
              style={{ objectPosition: "56% 50%" }}
            />
          </figure>

          <div className="gdf-body">
            <h2 className="cm-display gdf-h" data-rise>
              A PLATFORM, NOT A <em>portfolio bet</em>.
            </h2>

            <ol className="gdf-strata">
              {FRAMEWORK.map((f, i) => (
                <li
                  key={f.name}
                  className="gdf-stratum"
                  style={{ ["--depth" as string]: i }}
                  data-rise
                >
                  <span className="gdf-node" aria-hidden />
                  <span className="gdf-stratum-n" aria-hidden>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="gdf-stratum-k">{f.tag}</span>
                  <h3 className="gdf-stratum-t">{f.name}</h3>
                  <p className="gdf-stratum-d">{f.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Section>

      {/* 02 — THE PGA PARTNERSHIP.
          The institutional authority the section above refers to. "The
          Framework" names coaching curriculum, coach certification, event
          standards and course-operating standards as the platform's remit;
          this section is where those standards actually come from, so it
          sits immediately after it rather than being bolted on at the end.

          Composition is deliberately unlike anything else on this page — no
          `gd-index`, no full-bleed statement. A licence plate carrying the
          two named offices and the PGA's founding year.

          Every word is the PGA brochure's own (p. 01). Nothing about the
          partnership's scope, value or exclusivity is characterised beyond
          what that page states.

          REMOVED — the "PGA's role in the plan" six-item sub-block (the
          PGA_ROLE data, and the `.gdp-roles`/`.gdp-role-*` rail-and-register
          CSS it alone used) was deleted whole at the requester's direction.
          Nothing replaces it; the section now ends at the licence plate
          above. */}
      <Section surface="paper" className="gdp-sec">
        <div className="cm-track gdp">
          <IndexLabel n="02">The Partnership · PGA of America</IndexLabel>

          <div className="gdp-head">
            <h2 className="cm-display gdp-h" data-rise>
              AN AMERICAN LICENSE. AN INDIAN <em>ambition</em>.
            </h2>
          </div>

          <div className="gdp-body" data-rise>
            <p>
              Vimtra Ventures LLC, with its registered office in{" "}
              <strong>Fremont, California</strong>, has signed a license
              agreement with the Professional Golfers&rsquo; Association of
              America (PGA of America), headquartered in{" "}
              <strong>Frisco, Texas</strong>.
            </p>
            <p>
              The partnership brings the PGA&rsquo;s century of golf expertise
              to a market entering its defining decade — combining
              championship facilities, grassroots academies, and integrated
              real estate under one platform.
            </p>
          </div>

          <dl className="gdp-plate" data-rise>
            {PGA_OFFICES.map((o) => (
              <div key={o.k}>
                <dt>{o.k}</dt>
                <dd>
                  <span className="gdp-plate-v">{o.v}</span>
                  <span className="gdp-plate-d">{o.d}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      {/* 03 — THE PLAN.
          The five moves the platform is built on (PGA brochure p. 03). It
          follows the partnership because the partnership is what makes the
          moves credible; it precedes the thesis because the thesis is one of
          the five, not the whole plan. Set on ink so the page alternates
          rather than running three light sections together.

          REDESIGNED — this sub-section only; wording of all five moves is
          untouched. The previous version was a hanging-numeral list at
          every width: legible, but the exact same vertical-list shape at
          1600px as at 375px, and a plain list next to section 02's
          connected register one chapter up. Below 1024px it is still a
          vertical roadmap (a left-hand spine — `.gdm-set::before` — not a
          bordered-cell list). At 1024px+ it becomes a genuinely different
          device: one horizontal track the width of the section, with the
          five moves as nodes on it, odd moves (01/03/05) stated above the
          line and even moves (02/04) below — five parts of one strategy,
          not five columns. This does not reuse section 02's rail +
          vertical-spine pattern: no rail, and the device changes shape by
          width instead of staying fixed.

          No figure is attached to any move: the source attaches none. */}
      <Section surface="ink" className="gdm-sec hp-sec-atmos">
        <div className="cm-track gdm">
          <IndexLabel n="03" tone="dark">
            The Plan
          </IndexLabel>

          <div className="gdm-head">
            <h2 className="cm-display gdm-h" data-rise>
              FIVE MOVES TO GROW THE <em>game</em>.
            </h2>
          </div>

          {/* Odd moves (01, 03, 05) sit above the shared track line at
              1024px+; even moves (02, 04) sit below it — the alternation
              the redesign asks for. `.gdm-zone-top`/`-bottom` collapse to
              nothing below 1024px (see globals.css), so on a phone or
              tablet this is just numeral-then-title-then-description in
              document order, same as before. */}
          <ol className="gdm-set">
            {MOVES.map((m, i) => {
              const above = i % 2 === 0;
              const body = (
                <div className="gdm-b">
                  <h3 className="gdm-t">{m.t}</h3>
                  <p className="gdm-d">{m.d}</p>
                </div>
              );
              return (
                <li key={m.n} data-rise>
                  <span className="gdm-zone gdm-zone-top">
                    {above ? body : null}
                  </span>
                  <span className="gdm-node" aria-hidden>
                    <span className="gdm-n">{m.n}</span>
                  </span>
                  <span className="gdm-zone gdm-zone-bottom">
                    {above ? null : body}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </Section>

      {/* 02 — SIGNATURE THESIS.
          The major typographic moment: one approved statement, edge to
          edge, over the one photograph that actually depicts it. */}
      <FullBleedStatement
        eyebrow="04 · Signature Thesis"
        line={["GOLF-LED", "HNI", "COMMUNITIES."]}
        image="/assets/photo/gd-thesis-villas-aerial.jpg"
        imageAlt="Villas laid out through a golf course, photographed straight down"
        imagePosition="50% 50%"
      />

      {/* The thesis, stated. Minimal supporting text, then the three
          brochure anchors as a ruled index — not three cards. */}
      <Section surface="ink">
        <div className="cm-track gd-thesis">
          <div className="gd-thesis-lede" data-rise>
            <p>
              Premium golf facilities integrated with luxury residential
              communities, lifestyle amenities, and investment opportunities —
              an ecosystem connecting sport, real estate, and long-term value.
            </p>
          </div>

          <ol className="gd-index">
            {ANCHORS.map((a, i) => (
              <li key={a.name} data-rise>
                <span className="gd-index-n">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>
                  <span className="gd-index-k">{a.tag}</span>
                  <span className="gd-index-t">{a.name}</span>
                </span>
                <p className="gd-index-d">{a.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* 03 — HIGH PERFORMANCE */}
      <Section surface="paper">
        <div className="cm-track gd-perf">
          <div className="gd-perf-f" data-rise>
            <div className="gd-fig">
              <Image
                src="/assets/photo/gd-perf-putt-hole.jpg"
                alt="A putter and ball beside the hole on a cut green"
                fill
                sizes="(max-width: 1023px) 100vw, 40vw"
                style={{ objectPosition: "56% 50%" }}
              />
            </div>
          </div>

          <div className="gd-perf-t">
            <IndexLabel n="05">High Performance</IndexLabel>
            <SectionTitle lines={["TALENT,", "PATHWAYS,", "ECOSYSTEM."]} />
            <ul className="gd-pillars">
              {HIGH_PERFORMANCE.map((h) => (
                <li key={h.label} data-rise>
                  <span className="gd-pillar-t">{h.label}</span>
                  <span className="gd-pillar-d">{h.body}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* 04 — INITIATIVES. See the note at the top of this file. */}
      <Section surface="ivory">
        <div className="cm-track gd-framework">
          <IndexLabel n="06">Initiatives</IndexLabel>

          <div className="gd-framework-h">
            <h2 className="cm-display" data-rise>
              CURRENT, AND <em>under way</em>.
            </h2>
            {/* The awareness gap, stated as the source states it — Vimtra x PGA
                brochure p. 04. It is the reason the roadmap below exists, and
                without it the roadmap reads as ambition rather than response.
                The four named metro academies on that page are deliberately
                not reproduced: the source names them as where certified
                academies concentrate, not as Vimtra partners. */}
            <p className="gd-lede" data-rise>
              Golf remains a niche pursuit in India, and certified academies
              concentrate in the metros — beyond them, awareness in Tier 2 and
              Tier 3 cities is low. The platform is built for that reality, not
              around it.
            </p>
          </div>

          <ol className="gd-index">
            {INITIATIVES.map((n, i) => (
              <li key={n.name} data-rise>
                <span className="gd-index-n">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>
                  <span className="gd-index-k">{n.tag}</span>
                  <span className="gd-index-t">{n.name}</span>
                </span>
                <p className="gd-index-d">{n.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* CLOSING */}
      <Section surface="ink" size="tight" className="hp-sec-atmos">
        <div className="cm-track cm-close">
          <div className="cm-close-title">
            <SectionTitle lines={["BUILD IT", "WITH US."]} />
          </div>
          <div className="cm-close-actions" data-rise>
            <Link href="/invest" className="hp-btn hp-btn-primary">
              PARTNER WITH THE LIONS
              <span className="hp-arrow" aria-hidden>
                →
              </span>
            </Link>
            <Link
              href="/vimtra-ventures"
              className="hp-btn hp-btn-ghost hp-on-dark"
            >
              About Vimtra Ventures
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
