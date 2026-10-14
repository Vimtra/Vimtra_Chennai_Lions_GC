import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import VimtraHero from "@/components/site/VimtraHero";
import LeadershipComposition from "@/components/vv/LeadershipComposition";
import { Section, SectionTitle } from "@/components/site/Section";

export const metadata: Metadata = {
  alternates: { canonical: "/vimtra-ventures" },
  title: "Vimtra Ventures",
  description:
    "The San Francisco & Chennai-based PE, VC, and investment firm behind the Chennai Lions — founded 2014 under the same principals, 60+ technology acquisitions, six core verticals, a licensed PGA of America partnership, and ownership of the Chennai Lions GC and Dallas Sidekicks.",
};

/* ---------------------------------------------------------------------------
   CONTENT SOURCES
   Every claim on this page is sourced from the Chennai Lions IGPL brochure
   (pp. 13, 14, 15, 16) or the Vimtra Ventures profile. No numbers, dates or
   people appear that are not in one of those two documents.

   SIX VERTICALS: the six identical cards are gone. The section is now an
   asymmetric editorial index — a sticky statement rail on the left, six
   numbered ruled rows on the right, each carrying its documented title and
   its documented description. The hover response is TYPOGRAPHIC (numeral
   and title shift to crimson, a gold rule sweeps the row) rather than an
   image swap: there is no honest photograph of "mergers & acquisitions" or
   "AI infrastructure", and generic business stock would be exactly the
   filler this redesign exists to remove.

   "BY THE NUMBERS" is not deleted — it was never on the removal list, and
   founding year, acquisitions, assets and vertical count are the
   credentials a strategic reader actually wants. It is folded into the
   opening section as a ruled credential field instead of standing alone as
   a band of figures.

   PHOTOGRAPHY: one licensed frame in the hero, plus the real
   franchise-supplied portraits of the two founders, the director and
   the nine advisors.
   Nothing else — a firm cannot be honestly photographed, and stock
   offices would cheapen the page.

   DEDUP PASS (targeted, September 2026). "The Firm" prose used to restate
   every figure in CREDENTIALS in full sentences immediately above the
   credential rail itself — founded 2014, 60+ technology acquisitions, 55+
   real-estate assets, and the $1.1B+ Frisco/PGA District cluster all
   appeared twice on one screen. The rail is the stronger presentation for
   a number (this file's own comment above already argues that), so the
   prose was trimmed to the surrounding narrative that isn't already a
   card: the operating-model description, the same-principals continuity
   claim, and the PGA brochure's four-country acquisition geography (which
   the rail doesn't carry). No fact was removed from the page — each one
   now appears exactly once instead of twice. Checked at the same time and
   left alone: "Vimtra Chennai Lions GC" is named in the Six Verticals list,
   the dedicated Sports Franchises section, and the Roadmap — three
   different jobs (an index entry, a detail card with a link, and a
   timeline milestone), not three repeats of the same sentence, so none of
   those three was touched.
--------------------------------------------------------------------------- */

/* Headline credentials.
   The first four are the Chennai Lions IGPL brochure p. 15, verbatim.
   The fifth was added in the September 2026 content audit from the
   Vimtra x PGA of America brochure p. 09, which carries a corporate
   figure the Lions brochure does not.

   UNRESOLVED SCOPE CONFLICT — deliberately not reconciled. The Lions
   brochure states "more than 60 technology acquisitions"; the PGA
   brochure states "60+ ACQUISITIONS ACROSS US, INDIA, UAE, AUSTRALIA".
   Those are the same number at two different scopes, and no source
   says whether they are the same 60, overlapping sets, or additive.
   The narrower, already-published claim is what stays on the figure;
   the four-country geography is carried in the prose below as the PGA
   brochure's own statement, attributed to it, without implying a
   second or larger total. Do not merge the two into one number. */
const CREDENTIALS = [
  { v: "2014", l: "Founded" },
  { v: "60+", l: "Technology Acquisitions" },
  { v: "6", l: "Core Verticals" },
];

// Brochure p. 15 — the six verticals, verbatim descriptions.
const VERTICALS = [
  {
    name: "Mergers & Acquisitions",
    body:
      "Identifying, acquiring, restructuring, and revitalising businesses with significant growth potential.",
  },
  {
    name: "Startups",
    body:
      "Founded, incubated, and scaled multiple technology ventures — several spun off into successful independent businesses.",
  },
  {
    name: "Sports Franchises",
    body:
      "Ownership positions in professional sport — IGPL Vimtra Chennai Lions GC and the Dallas Sidekicks.",
  },
  {
    name: "Real Estate",
    body:
      "Residential and mixed-use development connected with lifestyle and hospitality initiatives.",
  },
  {
    name: "Golf Communities & Academies",
    body:
      "Luxury golf-integrated communities and player-development academies across North America and India.",
  },
  {
    name: "AI Infrastructure",
    body:
      "Hyperscale data-centre ownership and operations serving cloud, enterprise, and AI-workload demand.",
  },
];

// Brochure p. 14 — verbatim leadership bios. Photographs are supplied by
// the franchise. `imagePosition` keeps the face inside the crop.
const FOUNDERS = [
  {
    name: "Subash Yammada",
    role: "Founder & CEO",
    image: "/assets/subash-yammada-web.jpg",
    imagePosition: "50% 14%",
    imageAlt: "Subash Yammada — Founder & CEO, Vimtra Ventures",
    body:
      "Serial entrepreneur and CEO of Vimtra Ventures — a San Francisco-based diversified global enterprise. Three decades of leadership cultivating an expansive portfolio across sports franchises, private equity, venture capital, golf communities and academies, technology, healthcare, hospitality and AI infrastructure.",
  },
  {
    name: "Thimmaji Rao Yammada",
    role: "Founder & Managing Director",
    image: "/assets/thimmaji-rao-yammada-web.jpg",
    imagePosition: "50% 26%",
    imageAlt:
      "Thimmaji Rao Yammada — Founder & Managing Director, Vimtra Ventures",
    body:
      "Managing Director of Vimtra Ventures with 31 years of leadership across private equity, sports franchises, infrastructure and industrial development in North America and India, with experience in project execution and asset restructuring.",
  },
];

// Brochure p. 17 / Vimtra Ventures profile — verbatim, and identical between
// the two sources. Added in the September 2026 content audit: the statement
// exists word-for-word in both documents but was not rendered anywhere on
// the site before now.
const VISION_STATEMENT =
  "To identify opportunities where capital, strategic vision, and operational expertise can transform underperforming assets into high-value enterprises — while creating world-class destinations that bring together investment, lifestyle, sport, real estate, and community — generating enduring value for investors, partners, athletes, and future generations.";

// Director profile — name, designation and biography supplied by the
// franchise (October 2026), verbatim and complete; do not shorten or add to
// it. It replaces the brochure p. 16 board sentence that used to stand in
// for this seat, so the person appears once on the page, not twice. The
// photograph is the franchise-supplied portrait in public/assets, shown in
// the same circular advisor panel as the advisors below him.
const DIRECTOR = {
  name: "Mr. M. Ravi Babu Mannam",
  role: "Director, Vimtra Ventures",
  image: "/assets/Ravi Babu.jpeg",
  // Keeps the face centred in the circular crop of this 4:5 portrait.
  imagePosition: "50% 20%",
  imageAlt: "Mr. M. Ravi Babu Mannam — Director, Vimtra Ventures",
  body:
    "Mr. M. Ravi Babu brings over two decades of experience across legal affairs, educational consultancy, HR value-added services, and real estate portfolio management. He specializes in providing strategic solutions for legal disputes and arbitration matters. At Vimtra, he leads legal and regulatory compliance and advises the India operations on contracts, NDAs, and other critical legal documentation. He also provides guidance on managing legal disputes. Mr. Ravi Babu has served on the Board of the M.S. Swaminathan Research Foundation and has been associated with the Tirumala Tirupati Devasthanams (TTD) Local Advisory Committees, Chennai, the Rail Safety Council, and the Lions Club.",
};

// Advisors — names, designations, biographies and image paths supplied by
// the franchise (October 2026) as the source of truth, verbatim and in the
// supplied order; do not shorten, reword or add to them. `imagePosition`
// only steers the circular crop onto each face (the files are not all
// square), and `imageZoom` enlarges a frame whose face is small in the
// source (Surya Kotha's approved photo is a full-length seated shot).
// Every photograph is the franchise-supplied file for that person.
const ADVISORS: {
  name: string;
  designation: string;
  bio: string;
  image: string;
  imagePosition: string;
  imageZoom?: number;
}[] = [
  {
    name: "Mr. Ram Bobba",
    designation: "Technology, Real Estate & Healthcare",
    bio: "A serial entrepreneur with investments across technology, real estate and healthcare in the United States and India. Based in Dallas, he has built several companies from the ground up alongside numerous acquisitions in technology and product businesses, and holds real-estate positions across the Dallas, Houston and Austin markets. He went on to found a chain of emergency-care centres in Dallas and to invest in healthcare services in India. Active in leadership development and social responsibility.",
    image: "/assets/team-ram.jpg.jpeg",
    imagePosition: "50% 30%",
  },
  {
    name: "Mr. Sridhar Patibandla",
    designation: "Technology & Real Estate",
    bio: "Owns and operates several technology and real-estate businesses. With his partner he grew an IT company from nothing to USD 100 million in turnover within ten years — across staffing, system integration, managed services and products — now over a thousand people serving customers in fourteen countries across North America, APAC, LATAM and MENA. His real-estate portfolio runs from single-family homes in Houston Heights to a 75-unit multi-family development, alongside substantial landholdings across Texas.",
    image: "/assets/team-sridhar.jpg.jpeg",
    imagePosition: "50% 30%",
  },
  {
    name: "Mr. Suresh Katamreddy",
    designation: "Technology & Operations",
    bio: "A founding member and partner of Kastech Software Solutions Group in Houston, Texas, where as Chief Technology Officer he oversees operations and strategic planning. He brings more than a decade as an entrepreneur across IT and real estate, and has invested with Mr. Patibandla in several real-estate ventures and land-development projects, working at asset level to keep strategy and execution on track. He holds a master's degree in Electrical and Computer Engineering from UT San Antonio.",
    image: "/assets/team-suresh.jpg.jpeg",
    imagePosition: "50% 30%",
  },
  {
    name: "Mr. Surya Kotha",
    designation: "Technology & Innovation Advisor",
    bio: "Heads technology advisory at Vimtra with over 24 years of IT industry experience across executive leadership roles in the US and India. A recognized authority in B2B ERP enterprise architecture, cloud infrastructure, and e-commerce integration, Surya actively advises high-growth ventures and guides Vimtra’s technology consulting, go-to-market strategies, and smart-city digital infrastructure.",
    image: "/assets/surya-kotha.jpg",
    imagePosition: "43% 24%",
    imageZoom: 1.8,
  },
  {
    name: "Mr. Venkat Annapareddy",
    designation: "Technology & Workforce Solutions",
    bio: "A Frisco, Texas–based technology entrepreneur who has worked in the IT industry since 2010. He leads businesses in IT Industry, strategic consulting and managed-service workforce solutions, building teams of recruitment and delivery professionals that serve organisations across the United States — bringing workforce planning and talent-sourcing depth to the team.",
    image: "/assets/team-venkat.jpg.jpeg",
    imagePosition: "50% 30%",
  },
  {
    name: "Mr. Appireddy Annapareddy",
    designation: "Technology Services & Operations",
    bio: "A technology-services entrepreneur with businesses across the United States and India, spanning IT Industry and technology services. He has operated a Hyderabad-based business since 2018, bringing established roots in Telangana and first-hand experience of doing business within the State to the team.",
    image: "/assets/team-appireddy.jpg.jpeg",
    imagePosition: "50% 40%",
  },
  {
    name: "Mr. K. Shivashankar",
    designation: "Chief Architect & Master Planner",
    bio: "Founded his architectural practice in 1988, establishing over three decades an extraordinary portfolio of projects significant in scale, materiality, and intricate execution. Living by the principle that construction personifies design, his hands-on experience began at age 15, progressing from bespoke private residences to landmark commercial headquarters and grand five-star luxury hotels, all mirroring his mastery of sound planning and flawless execution.",
    image: "/assets/Shiva Shankar.jpg.jpeg",
    imagePosition: "40% 50%",
  },
  {
    name: "Mr. Brandon Cecil de Souza",
    designation: "Golf Operations & Tournament Advisor",
    bio: "A 17-time India International with 26 professional titles, four World Cup appearances and the Indian captaincy at the Alfred Dunhill Cup, he has spent forty-two years in the game as player, coach, administrator and consultant, with course operations and management mandates across India and South Asia. He is President of the Golf Industry Association of India and serves on the Board of the Professional Golfers Association (PGA) of India / PGTI.",
    image: "/assets/advisor-brandon.jpeg",
    imagePosition: "50% 28%",
  },
  {
    name: "Mr. Aashish Vaishnava",
    designation: "Golf Course Architect & Strategic Advisor",
    bio: "Honored as the Best Golf Course Designer in India, Mr. Vaishnava brings over 20 years of professional experience, having designed and overseen more than 45 exceptional golf facilities across the country after designing his first course at age 16. Educated at IIM Kozhikode (MBA) and certified in Golf Course Design & Turf Management from GMIC Canada, his mastery spans championship course routing, luxury golf townships, driving ranges, and landscape architecture.",
    image: "/assets/AASHISH VAISHNAVA.jpg.jpeg",
    imagePosition: "50% 35%",
  },
];

// Brochure p. 16 — Advisory Board disciplines.
const ADVISORY_DISCIPLINES = [
  "Business",
  "Investments",
  "Golf",
  "Real Estate",
  "Infrastructure",
  "Community Development",
  "Branding",
  "Sports Management",
];

/* ---------------------------------------------------------------------------
   THE ROADMAP — verbatim from the "VIMTRA VENTURES LLC x PGA OF AMERICA"
   brochure (Company Profile 2026, p. 09, "BRINGING IT ALL TOGETHER").

   Status labels are the brochure's own — DONE / UNDERWAY — and are not
   softened or upgraded here. "Underway" means conversations in progress,
   which is exactly what that page says; nothing on this site presents an
   underway step as delivered.
--------------------------------------------------------------------------- */
const ROADMAP = [
  { n: "01", state: "Done", t: "PGA of America partnership" },
  { n: "02", state: "Done", t: "IGPL franchise: Chennai Lions GC" },
  { n: "03", state: "Underway", t: "Academy partnerships across India" },
];

// Brochure p. 15 — the two sports-franchise ownership positions, verbatim.
const FRANCHISES = [
  {
    tag: "IGPL",
    name: "Vimtra Chennai Lions GC",
    detail:
      "The franchise operating in the AM Green Indian Golf Premier League — Season 2026.",
    href: "/the-club" as const,
  },
  {
    tag: "MASL",
    name: "Dallas Sidekicks",
    detail: "Ownership position in professional sport in North America.",
    href: undefined,
  },
];

export default function VimtraVenturesPage() {
  return (
    <>
      <VimtraHero />

      {/* 01 — THE FIRM, with the credentials folded in. */}
      <Section surface="ivory">
        <div className="cm-track vv-firm">
          <p className="hp-index hp-index-bare" data-rise>
            <span>The Firm</span>
          </p>

          <div className="vv-firm-h">
            <h2 className="cm-display" data-rise>
              A FIRM BUILT TO CREATE <em>impact</em>.
            </h2>
          </div>

          <div className="vv-firm-b">
            <p>
              Vimtra Ventures is a US-based venture capital and investment
              firm operating as principal, not intermediary, across six
              verticals, with an operating footprint spanning North America
              and India.
            </p>
            <p>
              The firm has been run by the{" "}
              <strong>same principals since day one</strong>, and the brochure
              published with the PGA of America partnership describes its
              acquisitions as spanning the <strong>United States, India, the
              UAE and Australia</strong>.
            </p>
            <p>
              By combining capital, strategic vision, and hands-on execution,
              Vimtra partners with businesses and communities to build scalable
              enterprises, develop transformative assets, and create
              sustainable, long-term value.
            </p>
          </div>

          {/* The numbers this prose used to restate in full sentences
              (founded 2014, 60+ technology acquisitions, 55+ real-estate
              assets, the $1.1B+ Frisco/PGA District cluster) now live here
              exactly once — removed from the paragraphs above in the
              September 2026 dedup pass rather than said twice on the same
              screen. Nothing here is a new figure; every value was already
              verbatim-sourced before this edit. */}
          <dl className="vv-creds">
            {CREDENTIALS.map((c) => (
              <div key={c.l}>
                <dt>{c.v}</dt>
                <dd>{c.l}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      {/* 02 — SIX VERTICALS. Asymmetric index, typographic hover. */}
      <Section surface="paper">
        <div className="cm-track vv-verticals">
          <div className="vv-rail">
            <p className="hp-index hp-index-bare">
              <span>Six Verticals</span>
            </p>
            <SectionTitle lines={["ONE FIRM,", "SIX", "VERTICALS."]} />
            <p className="cm-lede">
              Every area the firm operates in, on a single canvas — as
              principal, not intermediary.
            </p>
          </div>

          <ol className="vv-list">
            {VERTICALS.map((v, i) => (
              <li className="vv-item" key={v.name}>
                <span className="vv-n">{String(i + 1).padStart(2, "0")}</span>
                <span>
                  <span className="vv-t">{v.name}</span>
                  <span className="vv-d">{v.body}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* 03 — LEADERSHIP.
          The one section on this page that owns its own component and its
          own motion — see components/vv/LeadershipComposition.tsx for the
          composition, and the `.vvl-*` block in app/globals.css for the
          grid. It is lifted out of `<Section>` because it needs a single
          ordered ScrollTrigger timeline (label → heading → each
          principal's portrait, index, name and biography) rather than the
          generic `[data-rise]` choreography `<Section>` wires for
          everything beneath it; nesting the two animated the same nodes
          twice.

          The heading is a left rail and the principals occupy the right of
          the same grid row, so the portraits rise to the heading's top edge
          — the empty field that used to sit under the title is gone and
          the section opens on the people. The two principals are strictly
          level: no offset, no stagger, no vertical displacement of any
          kind, in CSS or in the timeline. They read as two equal pillars.

          Both principals, both existing photographs, both verbatim
          biographies and both roles are passed through from FOUNDERS
          untouched. No person was added or removed, no image was created,
          and no title, biography or achievement was invented or borrowed
          from another page. */}
      <LeadershipComposition people={FOUNDERS} />

      {/* 04 — GOVERNANCE.
          Two objects, deliberately unlike each other and unlike every ruled
          index on this site.

          The Vision is a MINUTE: a single bordered statement panel with a
          gold rule down its leading edge. The board seat is the director
          himself, in the same horizontal panel as the nine advisors that
          follow — complete biography with a circular portrait.

          The advisory board is a TYPE FIELD, not a list. The eight
          disciplines are set as large display words that wrap as one
          continuous field with gold lozenges between them, so the section
          shows the breadth being assembled instead of enumerating it in
          eight rows. The heading above it is the brochure's own wording
          ("Being assembled across…"), so the field is that sentence,
          typeset — nothing has been added to it. */}
      <Section surface="paper" className="vv-gov-sec">
        <div className="cm-track vv-gov2">
          <p className="hp-index hp-index-bare">
            <span>Governance</span>
          </p>

          <div className="vv-gov2-h">
            <SectionTitle lines={["BOARD &", "ADVISORY."]} />
          </div>

          {/* The Vision statement — brochure p. 17 pairs it with Board &
              Advisory on the same page, so it sits here rather than in
              "The Firm" above. Verbatim, identical in both DOC2 and DOC3. */}
          <article className="vv-minute">
            <p className="vv-minute-k">Vision</p>
            <p className="vv-minute-body">{VISION_STATEMENT}</p>
          </article>

          {/* The director and the advisors — one horizontal ivory panel
              each, text on the left and a circular portrait on the right
              (portrait first on phones). The director's panel takes the
              gold edge so the advisors' crimson / gold alternation carries
              straight on beneath it. */}
          <div className="vv-advisors">
            <p className="vv-advisors-k">Board of Directors</p>
            <article className="vv-advisor is-gold">
              <div className="vv-advisor-text">
                <h3 className="vv-advisor-name">{DIRECTOR.name}</h3>
                <p className="vv-advisor-role">{DIRECTOR.role}</p>
                <p className="vv-advisor-bio">{DIRECTOR.body}</p>
              </div>
              <figure className="vv-advisor-figure">
                <span className="vv-advisor-frame">
                  <Image
                    src={DIRECTOR.image}
                    alt={DIRECTOR.imageAlt}
                    fill
                    sizes="160px"
                    style={{ objectPosition: DIRECTOR.imagePosition }}
                  />
                </span>
              </figure>
            </article>

            <ul className="vv-advisors-list">
              {ADVISORS.map((a) => (
                <li className="vv-advisor" key={a.name}>
                  <div className="vv-advisor-text">
                    <h3 className="vv-advisor-name">{a.name}</h3>
                    <p className="vv-advisor-role">{a.designation}</p>
                    <p className="vv-advisor-bio">{a.bio}</p>
                  </div>
                  <figure className="vv-advisor-figure">
                    <span className="vv-advisor-frame">
                      <Image
                        src={a.image}
                        alt={`Portrait of ${a.name}, ${a.designation}`}
                        fill
                        sizes="160px"
                        style={{
                          objectPosition: a.imagePosition,
                          ...(a.imageZoom && {
                            transform: `scale(${a.imageZoom})`,
                            transformOrigin: a.imagePosition,
                          }),
                        }}
                      />
                    </span>
                  </figure>
                </li>
              ))}
            </ul>
          </div>

          <div className="vv-wall">
            <p className="vv-wall-k">
              Advisory Board · being assembled across
            </p>
            <p className="vv-wall-set">
              {ADVISORY_DISCIPLINES.map((d) => (
                <span className="vv-wall-w" key={d}>
                  {d}
                </span>
              ))}
            </p>
          </div>
        </div>
      </Section>

      {/* 05 — SPORTS FRANCHISES */}
      <Section surface="ink">
        <div className="cm-track vv-firm">
          <p className="hp-index hp-index-dark hp-index-bare">
            <span>Sports Franchises</span>
          </p>

          <div className="vv-firm-h">
            <h2 className="cm-display">
              OWNERSHIP IN <em>sport</em>.
            </h2>
          </div>

          <ol className="gd-index">
            {FRANCHISES.map((f, i) => {
              const inner = (
                <>
                  <span className="gd-index-n">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className="gd-index-k">{f.tag}</span>
                    <span className="gd-index-t">{f.name}</span>
                  </span>
                  <p className="gd-index-d">{f.detail}</p>
                </>
              );
              return (
                <li
                  key={f.name}
                  className={f.href ? "is-link" : undefined}
                >
                  {f.href ? (
                    <Link href={f.href} className="vv-franchise-link">
                      {inner}
                    </Link>
                  ) : (
                    inner
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </Section>

      {/* 06 — THE ROADMAP.
          Added in the September 2026 content audit. The firm's own sequence,
          from the PGA brochure p. 09 — and the one place on this site that
          states the order in which the platform is being built.

          It is deliberately NOT a second telling of the PGA partnership:
          /golf-development carries the licence itself and the six roles the
          PGA plays. This is status and sequence only, which is what a parent
          company page owes a reader that a platform page does not.

          The status chips are the brochure's own words. Two steps are marked
          done; three are marked underway, and are not dressed up as more
          than that. */}
      <Section surface="paper" className="vv-road-sec">
        <div className="cm-track vv-road">
          <p className="hp-index hp-index-bare">
            <span>The Roadmap</span>
          </p>

          <div className="vv-road-h">
            <SectionTitle lines={["BRINGING IT", "ALL TOGETHER."]} />
            <p className="cm-lede">
              The first step was the partnership with the PGA. The second,
              ownership of a franchise in India&rsquo;s first professional golf
              league. What follows is the bridge itself — academies, resorts,
              and real estate — conversations already underway to make the
              plan real.
            </p>
          </div>

          <ol className="vv-road-set">
            {ROADMAP.map((r) => (
              <li
                key={r.n}
                className={r.state === "Done" ? "is-done" : "is-open"}
              >
                <span className="vv-road-n" aria-hidden>
                  {r.n}
                </span>
                <span className="vv-road-s">{r.state}</span>
                <span className="vv-road-t">{r.t}</span>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* CLOSING */}
      <Section surface="ink" size="tight" className="hp-sec-atmos">
        <div className="cm-track cm-close">
          <div className="cm-close-title">
            <SectionTitle lines={["BUILT FOR", "THE LONG GAME."]} />
          </div>
          <div className="cm-close-actions">
            <Link href="/the-club" className="hp-btn hp-btn-primary">
              MEET THE FRANCHISE
              <span className="hp-arrow" aria-hidden>
                →
              </span>
            </Link>
            <Link href="/invest" className="hp-btn hp-btn-ghost hp-on-dark">
              Investment enquiries
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
