import type { Metadata } from "next";
import FixturesList from "@/components/fixtures/FixturesList";
import { listFixtures } from "@/lib/fixtures";
import Link from "next/link";
import PageHero from "@/components/site/PageHero";
import { Section, IndexLabel, SectionTitle, EmptyState } from "@/components/site/Section";

export const metadata: Metadata = {
  title: "Fixtures · Vimtra Chennai Lions GC",
  description:
    "The Season 2026 calendar — Am Green IGPL Invitationals, completed African swing, and the Chennai Lions season opener at Al Hamra.",
};

// Always resolve against the current DB row set so admin edits are reflected
// immediately. Fixtures are low-volume so the extra request cost is trivial.
export const dynamic = "force-dynamic";

export default async function FixturesPage() {
  const fixtures = await listFixtures();

  return (
    <>
      <PageHero
        eyebrow="AM Green IGPL · Season 2026"
        title={["FIXTURES"]}
        lead={
    <>
      The Season 2026 calendar as published in the Chennai Lions IGPL brochure. Further events populate this page as the AM Green IGPL announces them.
    </>
  }
      />

      <Section surface="ivory" size="tight">
        <FixturesList fixtures={fixtures} />

        <p className="hp-note" data-rise>
          Season 2026 spans <strong>15 events</strong> across{" "}
          <strong>10 franchises</strong> — ten in India and five international.
          The calendar shown here is the subset the Chennai Lions IGPL brochure
          publishes today. Live scoring and franchise standings unlock as each
          tournament week begins — see{" "}
          <Link href="/scores">/scores</Link> and{" "}
          <Link href="/leaderboards">/leaderboards</Link>.
        </p>
      </Section>
    </>
  );
}
