import Link from "next/link";
import Image from "next/image";
import {
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  Facebook,
  ChevronRight,
  Mail,
  MapPin,
  Send,
} from "lucide-react";

const CLUB_LINKS = [
  { href: "/the-club", label: "About the Club" },
  { href: "/the-pride", label: "The Pride" },
  { href: "/players", label: "Players" },
  { href: "/partners", label: "Partners" },
  { href: "/contact", label: "Contact" },
];

const GAME_LINKS = [
  { href: "/fixtures", label: "Fixtures" },
  { href: "/scores", label: "Live Scores" },
  { href: "/leaderboards", label: "Leaderboards" },
  { href: "/news", label: "News & Notebook" },
  { href: "/gallery", label: "Gallery" },
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
                GOLF&nbsp;CLUB&nbsp;·&nbsp;GC
              </span>
            </span>
          </Link>
          <p className="mt-5 text-[13.5px] leading-[1.65] text-white/70 font-manrope max-w-[300px]">
            Official IGPL franchise representing Tamil Nadu. Long-term build,
            full-throated pride.
          </p>
          <div className="ft-socials">
            <a href="#" aria-label="Instagram"><Instagram /></a>
            <a href="#" aria-label="X"><Twitter /></a>
            <a href="#" aria-label="YouTube"><Youtube /></a>
            <a href="#" aria-label="LinkedIn"><Linkedin /></a>
            <a href="#" aria-label="Facebook"><Facebook /></a>
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
          <h4>Stay In Touch</h4>
          <a href="mailto:pride@vimtrachennailions.gc">
            <Mail style={{ opacity: 1, marginRight: 0 }} />
            <span>pride@vimtrachennailions.gc</span>
          </a>
          <a href="mailto:partners@vimtrachennailions.gc">
            <Mail style={{ opacity: 1, marginRight: 0 }} />
            <span>partners@vimtrachennailions.gc</span>
          </a>
          <a href="#">
            <MapPin style={{ opacity: 1, marginRight: 0 }} />
            <span>Anna Salai, Teynampet · Chennai</span>
          </a>
          <Link className="cta-gold ft-cta press" href="/contact">
            <Send className="w-[14px] h-[14px]" /> LET&apos;S TALK
          </Link>
        </div>
      </div>

      <div className="ft-bottom">
        <span>© 2026 Vimtra Chennai Lions GC. Official IGPL Franchise.</span>
        <span className="ae-shimmer font-sora font-bold tracking-widest">
          TEE OFF · PLAY PRO
        </span>
      </div>
    </footer>
  );
}
