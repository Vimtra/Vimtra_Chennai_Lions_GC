import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import PageMasthead from "@/components/site/PageMasthead";

export const metadata: Metadata = {
  title: "Partners · Vimtra Chennai Lions GC",
  description:
    "Partner with the Vimtra Chennai Lions GC — the partners on record, what a partnership carries, and the four commercial tiers.",
};

/* ---------------------------------------------------------------------------
   Every claim on this page is sourced, and this page owns the partnership
   material outright.

   DE-DUPLICATION. /partners and /invest previously carried the same three
   market figures AND the same four commercial tiers, so a reader moving
   between them met the same page twice. Ownership is now split by subject:

     /invest   — the market case, who the firm welcomes, the first-mover
                 window. Capital.
     /partners — who is already on the record, what a partnership actually
                 carries, and the tiers. Commercial.

   The market figures have been removed from this page and are linked to
   rather than repeated.

   SOURCES. Confirmed partners: brochure p. 13, verbatim. The partnership
   dimensions and the four tiers: brochure p. 19, verbatim — "each structured
   around visibility on player kit, event branding, digital reach, and
   hospitality access at Chennai home rounds and international events."

   PARTNER LOGOS. The repository holds no am green or FIRSTCUT artwork —
   the only marks in public/assets are the Lions' own. Rather than source
   third-party brand marks from the web, each partner renders as a
   typographic lockup. `logo` below is the slot: set it to a path and the
   mark replaces the wordmark, at its own aspect ratio, with no other change.
--------------------------------------------------------------------------- */

interface Partner {
  tag: string;
  name: string;
  scope: string;
  detail: string;
  /** Official artwork, when the franchise supplies it. See the note above. */
  logo?: { src: string; width: number; height: number; alt: string };
}

const CONFIRMED_PARTNERS: Partner[] = [
  {
    tag: "League title partner · Kit sponsor",
    name: "am green",
    scope: "AM Green Indian Golf Premier League",
    // Brochure p. 13 verbatim.
    detail:
      "League-wide title partner of the AM Green IGPL and kit sponsor across the Vimtra Chennai Lions Season 2026 match kit.",
  },
  {
    tag: "Kit manufacturer",
    name: "FIRSTCUT",
    scope: "Season 2026 match kit",
    // Brochure p. 13 verbatim.
    detail: "Kit production partner for the Chennai Lions Season 2026.",
  },
];

// Brochure p. 19 — the four dimensions every tier is structured around.
// Unique to this page: /invest describes capital, this describes reach.
const DIMENSIONS = [
  {
    k: "Kit",
    t: "Visibility on player kit",
    d: "Positioning on the match kit the squad wears through the season.",
  },
  {
    k: "Event",
    t: "Event branding",
    d: "Presence in the event lockup and across tournament backdrops.",
  },
  {
    k: "Digital",
    t: "Digital reach",
    d: "The franchise's own channels and its content output through the season.",
  },
  {
    k: "Access",
    t: "Hospitality access",
    d: "At Chennai home rounds and at international events on the card.",
  },
];

// Brochure p. 19 — four commercial tiers, verbatim structure. No tier,
// benefit or inclusion here is invented.
interface Tier {
  code: string;
  name: string;
  headline: string;
  bullets: string[];
}

const TIERS: Tier[] = [
  {
    code: "01",
    name: "Principal Partner",
    headline: "Front-of-jersey positioning with the team mark.",
    bullets: [
      "Front-of-jersey positioning",
      "Event lockup with the team mark",
      "Hospitality across all Chennai home rounds",
      "Co-branded press moments",
    ],
  },
  {
    code: "02",
    name: "Associate Partner",
    headline: "Secondary kit branding, digital-first storytelling.",
    bullets: [
      "Secondary kit branding",
      "Event backdrops",
      "Digital-first team storytelling package",
      "Curated home-round hospitality",
    ],
  },
  {
    code: "03",
    name: "Season Partner",
    headline: "Season-long content and curated tournament hospitality.",
    bullets: [
      "Season-long visibility across a defined content and event stack",
      "Curated hospitality at selected tournaments",
    ],
  },
  {
    code: "04",
    name: "Community Partner",
    headline: "Grassroots and junior-development co-programmes.",
    bullets: [
      "Grassroots and junior-development co-programmes with the franchise",
      "Anchored around Chennai’s home fixtures",
    ],
  },
];

export default function PartnersPage() {
  return (
    <>
      <PageMasthead
        className="pt-hero"
        eyebrow="Partner with the Lions · Season 2026"
        title={["PARTNERS"]}
        line="Kit, event, digital and hospitality — across a full international season."
        image="/assets/photo/pt-hero-pavilion-golden.jpg"
        stats={[
          { k: "On record", v: String(CONFIRMED_PARTNERS.length) },
          { k: "Tiers", v: String(TIERS.length) },
          { k: "Season", v: "2026" },
        ]}
      />

      {/* ---- 01 · The partners on record ---- */}
      <section
        className="hp-sec hp-sec-ivory pt-sec pt-sec-open"
        aria-labelledby="pt-a"
      >
        <div className="hp-wrap">
          <div className="nw-head">
            <div>
              <p className="hp-index">
                01 <span>On the record</span>
              </p>
              <h2 id="pt-a" className="nw-h">
                Who&rsquo;s already in.
              </h2>
            </div>
            <p className="nw-note">
              Two partners are named because two are confirmed. No slot on
              this page is filled with a placeholder brand.
            </p>
          </div>

          <ol className="pt-partners">
            {CONFIRMED_PARTNERS.map((p) => (
              <li key={p.name}>
                <div className="pt-partner-mark">
                  {p.logo ? (
                    <Image
                      src={p.logo.src}
                      alt={p.logo.alt}
                      width={p.logo.width}
                      height={p.logo.height}
                      className="pt-partner-logo"
                    />
                  ) : (
                    <span className="pt-partner-name">{p.name}</span>
                  )}
                  <p className="pt-partner-tag">{p.tag}</p>
                </div>
                <div className="pt-partner-b">
                  <p className="pt-partner-scope">{p.scope}</p>
                  <p className="pt-partner-detail">{p.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---- 02 · What a partnership carries ---- */}
      <section
        className="hp-sec hp-sec-ink hp-sec-atmos pt-sec"
        aria-labelledby="pt-b"
      >
        <div className="hp-wrap">
          <div className="nw-head">
            <div>
              <p className="hp-index hp-index-dark">
                02 <span>What it carries</span>
              </p>
              <h2 id="pt-b" className="nw-h">
                Four surfaces.
              </h2>
            </div>
            <p className="nw-note">
              Every tier below is structured around these four. What changes
              between tiers is depth, not kind.
            </p>
          </div>

          <ol className="pt-dims">
            {DIMENSIONS.map((d) => (
              <li key={d.k}>
                <span className="pt-dim-k">{d.k}</span>
                <h3 className="pt-dim-t">{d.t}</h3>
                <p className="pt-dim-d">{d.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---- 03 · The tiers ---- */}
      <section className="hp-sec hp-sec-paper pt-sec" aria-labelledby="pt-c">
        <div className="hp-wrap">
          <div className="nw-head">
            <div>
              <p className="hp-index">
                03 <span>Commercial tiers</span>
              </p>
              <h2 id="pt-c" className="nw-h">
                Four ways to partner.
              </h2>
            </div>
          </div>

          {/* A ladder, not four cards. The tiers are ordered, so the numeral
              carries the hierarchy and the inclusions run as a ruled list. */}
          <ol className="pt-tiers">
            {TIERS.map((t) => (
              <li key={t.code}>
                <div className="pt-tier-b">
                  <span className="pt-tier-n" aria-hidden>
                    {t.code}
                  </span>
                  <h3 className="pt-tier-name">{t.name}</h3>
                  <p className="pt-tier-head">{t.headline}</p>
                </div>
                <ul className="pt-tier-list">
                  {t.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---- Close. The market case lives on /invest and is linked, not
              repeated. ---- */}
      <section className="hp-sec hp-sec-ivory pt-sec pt-sec-close">
        <div className="hp-wrap pt-close">
          <h2 className="pt-close-t">
            Partner with
            <br />
            the Lions.
          </h2>
          <div className="pt-close-a">
            <Link href="/contact" className="hp-btn hp-btn-primary">
              START A CONVERSATION
              <span className="hp-arrow" aria-hidden>
                →
              </span>
            </Link>
            <Link href="/invest" className="hp-btn hp-btn-ghost">
              The market case
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
