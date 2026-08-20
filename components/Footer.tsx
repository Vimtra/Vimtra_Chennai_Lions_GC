import Link from "next/link";
import Image from "next/image";
import {
  Instagram,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Send,
} from "lucide-react";

// Verified channels only (brochure p. 19 / p. 20 and Vimtra Ventures profile).
// The generic X / YouTube / LinkedIn / Facebook icons that previously linked
// to "#" were removed because the brochure names Instagram only.

const CLUB_LINKS = [
  { href: "/the-club", label: "The Club" },
  { href: "/the-pride", label: "The Pride" },
  { href: "/players", label: "Players" },
  { href: "/golf-development", label: "Golf Development" },
  { href: "/vimtra-ventures", label: "Vimtra Ventures" },
];

const GAME_LINKS = [
  { href: "/fixtures", label: "Fixtures" },
  { href: "/scores", label: "Live Scores" },
  { href: "/leaderboards", label: "Leaderboards" },
  { href: "/news", label: "News" },
  { href: "/gallery", label: "Gallery" },
];

const BUSINESS_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/partners", label: "Partners" },
  { href: "/invest", label: "Invest" },
  { href: "/contact", label: "Contact" },
];

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
];

export default function Footer() {
  return (
    <footer className="lions-footer">
      <div className="ft-grid">
        <div className="ft-col">
          <Link href="/" className="flex items-center gap-3 no-underline">
            <Image
              src="/assets/logo-lion.png"
              alt=""
              width={48}
              height={48}
              className="h-12 w-12 object-contain bg-white rounded-[11px] p-1.5 tilt"
            />
            <span className="flex flex-col leading-tight">
              <span className="font-sora font-extrabold text-[16px] tracking-[0.12em] text-white">
                VIMTRA CHENNAI LIONS
              </span>
              <span className="font-manrope font-semibold text-[10px] tracking-[0.4em] text-[#E9CB8E]">
                A&nbsp;FRANCHISE&nbsp;BY&nbsp;VIMTRA&nbsp;VENTURES
              </span>
            </span>
          </Link>
          <p className="mt-5 text-[13.5px] leading-[1.65] text-white/70 font-manrope max-w-[300px]">
            Chennai&apos;s franchise in the AM Green Indian Golf Premier
            League. A team built for the long game.
          </p>
          <div className="ft-socials">
            <a
              href="https://instagram.com/vimtra.chennai.gc"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram · @vimtra.chennai.gc"
            >
              <Instagram />
            </a>
          </div>
        </div>

        <div className="ft-col">
          <h4>The Club</h4>
          {CLUB_LINKS.map((l) => (
            <Link key={l.href} href={l.href}>
              <ChevronRight />
              <span>{l.label}</span>
            </Link>
          ))}
        </div>

        <div className="ft-col">
          <h4>The Game</h4>
          {GAME_LINKS.map((l) => (
            <Link key={l.href} href={l.href}>
              <ChevronRight />
              <span>{l.label}</span>
            </Link>
          ))}
        </div>

        <div className="ft-col">
          <h4>Business &amp; Support</h4>
          {BUSINESS_LINKS.map((l) => (
            <Link key={l.href} href={l.href}>
              <ChevronRight />
              <span>{l.label}</span>
            </Link>
          ))}
          <a
            href="mailto:info@vimtra.com"
            style={{ marginTop: 14 }}
          >
            <Mail style={{ opacity: 1, marginRight: 0 }} />
            <span>info@vimtra.com</span>
          </a>
          <a href="tel:+16504836185">
            <Phone style={{ opacity: 1, marginRight: 0 }} />
            <span>+1 650 483 6185</span>
          </a>
          <a href="tel:+918939414030">
            <Phone style={{ opacity: 1, marginRight: 0 }} />
            <span>+91 89394 14030</span>
          </a>
          <a
            href="https://instagram.com/vimtra.chennai.gc"
            target="_blank"
            rel="noreferrer"
          >
            <MapPin style={{ opacity: 1, marginRight: 0 }} />
            <span>TNGF Cosmo · Chennai</span>
          </a>
          <Link className="cta-gold ft-cta press" href="/contact">
            <Send className="w-[14px] h-[14px]" /> LET&apos;S TALK
          </Link>
        </div>
      </div>

      <div className="ft-bottom">
        <span>
          © 2026 Vimtra Chennai Lions GC · A franchise by Vimtra Ventures.
        </span>
        <div className="flex items-center gap-4">
          {LEGAL_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-manrope text-[11px] text-white/60 hover:text-white transition-colors no-underline uppercase tracking-[0.16em]"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
