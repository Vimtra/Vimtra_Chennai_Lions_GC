import type { Metadata } from "next";
import ContactForm from "@/components/contact/ContactForm";
import { CONTACT_TOPICS } from "@/components/contact/topics";
import StoryHero from "@/components/site/StoryHero";
import { Section } from "@/components/site/Section";

export const metadata: Metadata = {
  title: "Contact · Vimtra Chennai Lions GC",
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

// Home practice venue — brochure p. 04. Not an HQ; it is the team's
// home practice venue in Chennai.
const HOME_VENUE = {
  label: "Home Practice Venue",
  name: "TNGF Cosmo",
  city: "Chennai · South India",
};

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
            <div className="cf-venue" data-rise>
              <div className="cf-venue-label">{HOME_VENUE.label}</div>
              <h3 className="cf-venue-name">{HOME_VENUE.name}</h3>
              <p className="cf-venue-city">{HOME_VENUE.city}</p>
            </div>

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
    </div>
  );
}
