import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import PageHero from "@/components/site/PageHero";
import { Section, IndexLabel } from "@/components/site/Section";

export const metadata: Metadata = {
  title: "Terms of Service · Vimtra Chennai Lions GC",
  description:
    "The terms under which you may use the Vimtra Chennai Lions GC website, create an account, and purchase official merchandise.",
};

// Placeholder legal shell — a starting draft to be reviewed by counsel
// before the franchise begins signing up customers at scale.

const SECTIONS: { id: string; title: string; body: string[] }[] = [
  {
    id: "these-terms",
    title: "These terms",
    body: [
      "By using this website, creating an account, or placing an order for merchandise you agree to these terms. If you do not agree, please do not use the site.",
      "In these terms, “we”, “us”, and “our” refer to Vimtra Chennai Lions GC, the professional golf franchise operating this site. Vimtra Chennai Lions GC is owned by Vimtra Ventures.",
    ],
  },
  {
    id: "eligibility",
    title: "Eligibility",
    body: [
      "You must be 18 years or older, or of the legal age required to enter into a binding contract in your jurisdiction, to create an account and place orders.",
    ],
  },
  {
    id: "accounts",
    title: "Accounts",
    body: [
      "You are responsible for the accuracy of the information you provide, for keeping your password confidential, and for all activity that occurs under your account.",
      "If you believe your account has been used without your permission, sign out and contact us immediately.",
    ],
  },
  {
    id: "orders-and-merchandise",
    title: "Orders and merchandise",
    body: [
      "Product images, descriptions, and prices are provided for reference. We take reasonable care to keep them accurate but do not warrant they are error-free.",
      "Placing an order is an offer to buy the items in your cart at the prices then displayed. We may accept or decline any order at our discretion, including where we cannot fulfil the order or where the item is out of stock.",
      "Order confirmation, delivery timelines, returns, and refunds are governed by the store policies published on the merchandise section of the site at the time of purchase.",
    ],
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    body: [
      "Do not use the site to break the law, harass others, disrupt or attempt to disrupt the service, or attempt to gain unauthorised access to any part of it.",
      "Do not scrape, reverse-engineer, or attempt to bulk-download data from the site without written permission.",
    ],
  },
  {
    id: "intellectual-property",
    title: "Intellectual property",
    body: [
      "The Vimtra Chennai Lions GC name, marks, logos, kit designs, editorial content, and site design are the property of the franchise or its licensors. You may not use them without permission.",
      "Player names, likenesses, and third-party marks appear on this site with the permission of their respective owners.",
    ],
  },
  {
    id: "third-party-content",
    title: "Third-party content",
    body: [
      "The site may reference or link to information about the AM Green Indian Golf Premier League (IGPL), tournament venues, and other third parties. We do not control third-party content and are not responsible for it.",
    ],
  },
  {
    id: "disclaimers",
    title: "Disclaimers",
    body: [
      "The site is provided on an “as is” and “as available” basis. To the extent permitted by law we disclaim all warranties, express or implied, including merchantability, fitness for a particular purpose, and non-infringement.",
      "Live-scoring, standings, and fixture information published on this site may be delayed, incomplete, or subject to change. Do not rely on any information published here for wagering or other high-stakes decisions.",
    ],
  },
  {
    id: "liability",
    title: "Limitation of liability",
    body: [
      "To the maximum extent permitted by law, our aggregate liability arising out of or relating to your use of the site or the purchase of any merchandise is limited to the amounts you paid for the merchandise giving rise to the claim.",
    ],
  },
  {
    id: "changes",
    title: "Changes to the site or these terms",
    body: [
      "We may update the site, its features, or these terms from time to time. Continued use of the site after changes are posted indicates your acceptance of the updated terms.",
    ],
  },
  {
    id: "governing-law",
    title: "Governing law",
    body: [
      "These terms are governed by the laws of India. Disputes will be resolved before the courts of Chennai, Tamil Nadu, unless another forum is required by applicable law.",
    ],
  },
  {
    id: "contact",
    title: "Contact",
    body: [
      "Questions about these terms? Reach us at info@vimtra.com or on the numbers listed on our contact page.",
    ],
  },
];

const LAST_UPDATED = "21 August 2026";

export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title={["TERMS"]}
      />

            <Section surface="ivory" size="tight">
          <Reveal variant="fade-up">
            <p className="font-manrope text-[16px] leading-[1.7] text-ink">
              These terms govern your use of the Vimtra Chennai Lions GC
              website. Please read them carefully before creating an account or
              placing an order. If you have any question about them, contact us
              at{" "}
              <a
                href="mailto:info@vimtra.com"
                className="text-crimson-600 font-semibold no-underline"
              >
                info@vimtra.com
              </a>
              .
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
              A signed, counsel-reviewed version of these terms will replace
              this draft before the franchise begins accepting orders at scale.
              Until then, the shipping, returns, and refund specifics will be
              published inline on the{" "}
              <Link
                href="/shop"
                className="text-crimson-600 font-semibold no-underline"
              >
                shop
              </Link>
              .
            </div>
          </Reveal>
        </Section>
    </>
  );
}
