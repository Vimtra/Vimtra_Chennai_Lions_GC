import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import ContactForm from "@/components/contact/ContactForm";
import { CONTACT_TOPICS } from "@/components/contact/topics";
import PageHero from "@/components/site/PageHero";
import { Section, IndexLabel } from "@/components/site/Section";

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
    value: "info@vimtra.com",
    href: "mailto:info@vimtra.com",
  },
  {
    label: "United States",
    kind: "phone" as const,
    value: "+1 650 483 6185",
    href: "tel:+16504836185",
  },
  {
    label: "India",
    kind: "phone" as const,
    value: "+91 89394 14030",
    href: "tel:+918939414030",
  },
  {
    label: "Instagram",
    kind: "social" as const,
    value: "@vimtra.chennai.gc",
    href: "https://instagram.com/vimtra.chennai.gc",
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
      <PageHero
        variant="compact"
        eyebrow="To Discuss"
        title={["CONTACT"]}
        lead={
    <>
      Talk to the franchise — for partnerships, sponsorship, media, golf-development, and merchandise support.
    </>
  }
      />

            <Section surface="ivory" size="default">
          <Reveal variant="fade-up">
            <ContactForm initialTopic={initialTopic} />
          </Reveal>

          <div className="flex flex-col gap-5">
            <Reveal
              variant="fade-up"
              className="text-white rounded-[24px] p-8"
              style={{ background: "linear-gradient(160deg,#C9242E,#871119)" }}
            >
              <div className="font-manrope font-bold tracking-[0.22em] text-[11px] text-[#E9CB8E] uppercase">
                {HOME_VENUE.label}
              </div>
              <h3 className="mt-[10px] mb-3 font-sora font-extrabold text-[24px] tracking-[-0.02em]">
                {HOME_VENUE.name}
              </h3>
              <p className="m-0 font-manrope text-[14px] leading-[1.6] opacity-85">
                {HOME_VENUE.city}
              </p>
            </Reveal>

            <Reveal
              variant="fade-up"
              delay={80}
              className="hp-panel"
            >
              <div className="font-manrope font-bold tracking-[0.18em] text-[11px] text-crimson-600 uppercase">
                Direct Channels
              </div>
              <div className="flex flex-col gap-[14px] mt-[14px]">
                {CHANNELS.filter((c) => c.kind !== "social").map((c) => (
                  <div key={c.value}>
                    <div className="font-sora font-bold text-[13.5px]">
                      {c.label}
                    </div>
                    <a
                      href={c.href}
                      className="font-manrope text-[13.5px] text-crimson-600 no-underline"
                    >
                      {c.value}
                    </a>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal
              variant="fade-up"
              delay={160}
              className="hp-panel"
            >
              <div className="font-manrope font-bold tracking-[0.18em] text-[11px] text-crimson-600 uppercase">
                Find us elsewhere
              </div>
              <div className="flex gap-[10px] flex-wrap mt-[14px]">
                {CHANNELS.filter((c) => c.kind === "social").map((c) => (
                  <a
                    key={c.value}
                    href={c.href}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-[9px] rounded-[20px] bg-ink text-white font-sora font-bold text-[12px] no-underline tracking-[0.06em]"
                  >
                    {c.value}
                  </a>
                ))}
              </div>
            </Reveal>
          </div>
        </Section>
    </div>
  );
}
