import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import PageHero from "@/components/site/PageHero";
import { Section, IndexLabel } from "@/components/site/Section";

export const metadata: Metadata = {
  title: "Privacy Policy · Vimtra Chennai Lions GC",
  description:
    "How the Vimtra Chennai Lions GC website collects, uses, and safeguards personal data provided by visitors and customers.",
};

// Placeholder legal shell — the operational text below is a starting draft
// that must be reviewed by counsel before any real user data is collected.
// Structure, headings, and contact block are stable; the copy under each
// heading is intentionally cautious and generic.

const SECTIONS: { id: string; title: string; body: string[] }[] = [
  {
    id: "who-we-are",
    title: "Who we are",
    body: [
      "This site is operated by Vimtra Chennai Lions GC, a professional golf franchise in the AM Green Indian Golf Premier League (IGPL). The franchise is owned by Vimtra Ventures. References to “we”, “us”, and “our” in this policy refer to the franchise operating the site.",
    ],
  },
  {
    id: "what-we-collect",
    title: "What we collect",
    body: [
      "Account details you provide when you sign up: name, email address, phone number (optional), and delivery addresses you save for merchandise orders.",
      "Order details when you purchase merchandise: items, quantities, prices, order status, and the delivery address you selected.",
      "Enquiries you send through our contact forms: name, email, phone (optional), city (optional), topic, and the message content.",
      "Technical information collected automatically: IP address, browser type, device type, pages visited, and general usage patterns needed to keep the site secure and running.",
    ],
  },
  {
    id: "how-we-use-it",
    title: "How we use it",
    body: [
      "To create and manage your account and authenticate you on return visits.",
      "To process merchandise orders, deliver them, provide receipts, and respond to order-related questions.",
      "To respond to enquiries you submit — partnership, sponsorship, media, golf-development, or general messages.",
      "To operate and secure the site, prevent fraud and abuse, and comply with applicable law.",
    ],
  },
  {
    id: "who-we-share-with",
    title: "Who we share it with",
    body: [
      "Service providers who help us operate the site (for example, hosting, database, email delivery, and, in future, payment processing). These providers act on our instructions and are bound to protect your data.",
      "Delivery and logistics partners, strictly to fulfil merchandise orders you place.",
      "Regulators or law-enforcement authorities if legally required.",
      "We do not sell personal data.",
    ],
  },
  {
    id: "how-long-we-keep-it",
    title: "How long we keep it",
    body: [
      "We retain account and order records for as long as your account is active and for a reasonable period afterwards to satisfy tax, accounting, and dispute-resolution obligations.",
      "Contact-form messages are retained only as long as needed to respond to the enquiry and any related follow-up.",
    ],
  },
  {
    id: "your-rights",
    title: "Your rights",
    body: [
      "You may access, correct, or update the information in your account at any time from your profile page.",
      "You may request deletion of your account and associated data by contacting us at golfventures@vimtra.com. Some records may be retained where required by law.",
      "You may withdraw consent to future marketing communications at any time.",
    ],
  },
  {
    id: "security",
    title: "Security",
    body: [
      "Passwords are stored using industry-standard hashing (bcrypt) and are never stored in plain text.",
      "Sessions use httpOnly cookies with per-session opaque tokens; signing out revokes the session server-side.",
      "We take reasonable technical and organisational measures to protect personal data, but no system is fully immune from risk.",
    ],
  },
  {
    id: "cookies",
    title: "Cookies",
    body: [
      "We use a small number of first-party cookies strictly necessary to keep you signed in and to remember your shopping cart while you browse. We do not use advertising or cross-site tracking cookies.",
    ],
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: [
      "We may update this policy from time to time. The “Last updated” date at the top of the page will change when we do. Material changes will be communicated on this site.",
    ],
  },
  {
    id: "contact",
    title: "Contact",
    body: [
      "Questions about this policy or how we handle your data? Reach us at golfventures@vimtra.com or on the numbers listed on our contact page.",
    ],
  },
];

const LAST_UPDATED = "21 August 2026";

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        variant="compact"
        eyebrow="Legal"
        title={["PRIVACY"]}
      />

            <Section surface="ivory" size="tight">
          <Reveal variant="fade-up">
            <p className="font-manrope text-[16px] leading-[1.7] text-ink">
              This privacy policy explains what personal information the Vimtra
              Chennai Lions GC website collects, how it is used, who it is
              shared with, and the choices you have. It applies to visitors,
              signed-in customers, and anyone who contacts us through the site.
            </p>
          </Reveal>

          {SECTIONS.map((s, i) => (
            <Reveal key={s.id} variant="fade-up" delay={i * 40}>
              <article id={s.id} className="grid gap-3 scroll-mt-24">
                <h2 className="font-sora font-extrabold text-[24px] tracking-[-0.015em] text-ink">
                  {s.title}
                </h2>
                {s.body.map((p, k) => (
                  <p
                    key={k}
                    className="m-0 font-manrope text-[15.5px] leading-[1.7] text-[#3A1215]/85"
                  >
                    {p}
                  </p>
                ))}
              </article>
            </Reveal>
          ))}

          <Reveal
            variant="fade-up"
            className="mt-8 p-6 border border-black/[0.08] rounded-[16px] bg-cream-50"
          >
            <div className="font-manrope text-[13px] text-muted">
              A signed, counsel-reviewed version of this policy will replace
              this draft before the franchise begins collecting live customer
              data at scale. For any privacy question in the meantime, see the{" "}
              <Link
                href="/contact"
                className="text-crimson-600 font-semibold no-underline"
              >
                contact page
              </Link>
              .
            </div>
          </Reveal>
        </Section>
    </>
  );
}
