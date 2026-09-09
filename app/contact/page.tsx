import type { Metadata } from "next";
import Link from "next/link";
import ContactForm from "@/components/contact/ContactForm";
import { CONTACT_TOPICS } from "@/components/contact/topics";
import StoryHero from "@/components/site/StoryHero";
import { Section } from "@/components/site/Section";

export const metadata: Metadata = {
  alternates: { canonical: "/contact" },
  title: "Contact",
  description:
    "Talk to the franchise — partnerships, sponsorship, media, golf-development, and merchandise support for the Vimtra Chennai Lions.",
};

// Every channel below is verified from the Chennai Lions IGPL brochure
// (p. 19 "To Discuss" and p. 20 "Contact") and the Vimtra Ventures profile.
// No street address is stated in either source — the site therefore does
// not invent one.

const CHANNELS = [
  {
    label: "General & Partnerships",
    kind: "email" as const,
    value: "golfventures@vimtra.com",
    href: "mailto:golfventures@vimtra.com",
  },
  {
    label: "India",
    kind: "phone" as const,
    value: "+91 98403 34456",
    href: "tel:+919840334456",
  },
  {
    label: "Instagram",
    kind: "social" as const,
    value: "@chennailionsgc",
    href: "https://www.instagram.com/chennailionsgc/",
  },
];

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>;
}) {
  const { topic: rawTopic } = await searchParams;
  const initialTopic = (() => {
    if (!rawTopic) return CONTACT_TOPICS[0];
    const match = CONTACT_TOPICS.find(
      (t) => t.toLowerCase() === rawTopic.toLowerCase()
    );
    return match ?? CONTACT_TOPICS[0];
  })();

  return (
    <div className="contact-page">
      {/* No stock photograph stands in for "talking to the franchise" — same
          call /players makes for its own roster hero: is-plain keeps the
          full cinematic ink + aurora frame without a filler image. */}
      <StoryHero
        eyebrow="To Discuss"
        title={["CONTACT"]}
        line="Talk to the franchise — for partnerships, sponsorship, media, golf-development, and merchandise support."
      />

      <Section surface="ivory" size="default">
        <div className="cf-grid">
          <div data-rise>
            <ContactForm initialTopic={initialTopic} />
          </div>

          <div className="flex flex-col gap-5">
            <div className="hp-panel" data-rise>
              <div className="cf-panel-label">Direct Channels</div>
              <div className="cf-channel-list">
                {CHANNELS.filter((c) => c.kind !== "social").map((c) => (
                  <div key={c.value}>
                    <div className="cf-channel-k">{c.label}</div>
                    <a href={c.href} className="cf-channel-v">
                      {c.value}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div className="hp-panel" data-rise>
              <div className="cf-panel-label">Find us elsewhere</div>
              <div className="cf-social-list">
                {CHANNELS.filter((c) => c.kind === "social").map((c) => (
                  <a
                    key={c.value}
                    href={c.href}
                    target="_blank"
                    rel="noreferrer"
                    className="cf-social-pill"
                  >
                    {c.value}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* This was the one major page that just stopped after its form —
          every other chapter page closes on a considered sign-off. Rather
          than invent closing copy, this reuses /news's own end-of-page
          pattern verbatim (`.ss-links`, a plain 3-up compact list, no
          claims) pointed at the three topics the hero itself already
          names: partnerships/sponsorship, golf development, merchandise. */}
      <Section surface="paper" size="tight">
        <div className="cm-track ss-links">
          <Link href="/partners" className="ss-link">
            <span className="ss-link-k">Partnerships &amp; sponsorship</span>
            <span className="ss-link-t">Partner with the Lions</span>
          </Link>
          <Link href="/golf-development" className="ss-link">
            <span className="ss-link-k">Golf development</span>
            <span className="ss-link-t">Explore the platform</span>
          </Link>
          <Link href="/shop" className="ss-link">
            <span className="ss-link-k">Merchandise support</span>
            <span className="ss-link-t">Visit the store</span>
          </Link>
        </div>
      </Section>
    </div>
  );
}
