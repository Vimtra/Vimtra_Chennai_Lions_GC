import Link from "next/link";
import Image from "next/image";
import { Instagram, ArrowUpRight, Mail, Phone, MapPin } from "lucide-react";

/**
 * Global footer — the final chapter, not a link dump.
 *
 * Deep ink, one large brand statement, then the navigation as quiet
 * editorial columns. Aligned to the same `.hp-wrap` grid as the header and
 * every page section, so the brand mark shares a left edge with the nav
 * logo above it. Every link clears the 44px touch minimum.
 *
 * Links and contact details are verified channels only
 * (Instagram is the single social account the brochure names).
 */

const CLUB = [
  { href: "/the-club", label: "The Club" },
  { href: "/the-pride", label: "The Pride" },
  { href: "/players", label: "Players" },
  { href: "/golf-development", label: "Golf Development" },
  { href: "/vimtra-ventures", label: "Vimtra Ventures" },
];
const SEASON = [
  { href: "/fixtures", label: "Fixtures" },
  { href: "/scores", label: "Scores" },
  { href: "/leaderboards", label: "Standings" },
  { href: "/news", label: "News" },
  { href: "/gallery", label: "Gallery" },
];
const BUSINESS = [
  { href: "/shop", label: "Shop" },
  { href: "/partners", label: "Partners" },
  { href: "/invest", label: "Invest" },
  { href: "/contact", label: "Contact" },
];

export default function Footer() {
  return (
    <footer className="ft" role="contentinfo">
      <div className="ft-atmos" aria-hidden />

      <div className="hp-wrap ft-top">
        <div className="ft-intro">
          <p className="ft-kicker">AM Green IGPL · Season 2026</p>
          <Link href="/" className="ft-brand">
            <Image
              src="/assets/logo-lion.png"
              alt=""
              width={56}
              height={56}
              className="ft-mark"
            />
            <span className="ft-word">
              <span className="ft-word-1">VIMTRA CHENNAI LIONS GC</span>
              <span className="ft-word-2">A franchise by Vimtra Ventures</span>
            </span>
          </Link>
        </div>
        <div className="ft-intro-copy">
          <p className="ft-statement">
            Chennai&rsquo;s franchise in the AM Green Indian Golf Premier
            League. A team built for the long game.
          </p>
          <Link href="/contact" className="ft-talk">
            Work with the Lions <ArrowUpRight aria-hidden />
          </Link>
        </div>
      </div>

      <div className="hp-wrap ft-grid">
        <nav className="ft-col" aria-label="The Club">
          <h2 className="ft-h">The Club</h2>
          <ul>
            {CLUB.map((l) => (
              <li key={l.href}>
                <Link href={l.href}><span>{l.label}</span><ArrowUpRight aria-hidden /></Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="ft-col" aria-label="The Season">
          <h2 className="ft-h">The Season</h2>
          <ul>
            {SEASON.map((l) => (
              <li key={l.href}>
                <Link href={l.href}><span>{l.label}</span><ArrowUpRight aria-hidden /></Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="ft-col" aria-label="Business">
          <h2 className="ft-h">Business</h2>
          <ul>
            {BUSINESS.map((l) => (
              <li key={l.href}>
                <Link href={l.href}><span>{l.label}</span><ArrowUpRight aria-hidden /></Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ft-col ft-contact">
          <h2 className="ft-h">Stay connected</h2>
          <ul>
            <li>
              <a href="mailto:golfventures@vimtra.com">
                <Mail aria-hidden />
                <span>golfventures@vimtra.com</span>
              </a>
            </li>
            <li>
              <a href="tel:+919840334456">
                <Phone aria-hidden />
                <span>+91 98403 34456</span>
              </a>
            </li>
          </ul>
          <div className="ft-contact-meta">
            <p className="ft-place">
              <MapPin aria-hidden />
              <span>TNGF Cosmo · Chennai, India</span>
            </p>
            <a
              href="https://www.instagram.com/chennailionsgc/"
              target="_blank"
              rel="noreferrer"
              className="ft-social"
              aria-label="Instagram · @chennailionsgc — opens in a new tab"
            >
              <Instagram className="ft-social-icon" aria-hidden />
              <span>@chennailionsgc</span>
              <ArrowUpRight className="ft-social-a" aria-hidden />
            </a>
          </div>
        </div>
      </div>

      <div className="hp-wrap ft-bottom">
        <span>© 2026 Vimtra Chennai Lions GC · A franchise by Vimtra Ventures</span>
        <div className="ft-legal">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
