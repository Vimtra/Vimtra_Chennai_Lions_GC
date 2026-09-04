import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import StoryHero from "@/components/site/StoryHero";
import { Section } from "@/components/site/Section";
import ProfileClient from "@/components/profile/ProfileClient";

export const metadata: Metadata = {
  title: "My Account · Vimtra Chennai Lions GC",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const user = await requireUser("/profile");
  const { saved, error } = await searchParams;

  return (
    <>
      <StoryHero
        eyebrow="Account"
        title={["MY ACCOUNT"]}
        line={`${user.name} · ${user.email}`}
      />

      <Section surface="ivory" size="tight">
        <ProfileClient user={user} saved={saved === "1"} error={error} />
      </Section>
    </>
  );
}
