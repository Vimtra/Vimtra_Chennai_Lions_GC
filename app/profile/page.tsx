import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import StoryHero from "@/components/site/StoryHero";
import { Section } from "@/components/site/Section";
import ProfileClient from "@/components/profile/ProfileClient";
import { getVerificationStatus } from "@/lib/verification";
import { isSmsConfigured } from "@/lib/sms";

export const metadata: Metadata = {
  title: "My Account",
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

  // Verification state is read here rather than folded into the session:
  // getCurrentUser()/SafeUser stay exactly as they are, so nothing about
  // sign-in, middleware or the admin gate changes shape.
  const verification = await getVerificationStatus(user.id);
  const smsAvailable = isSmsConfigured();

  return (
    <>
      <StoryHero
        eyebrow="Account"
        title={["MY ACCOUNT"]}
        line={`${user.name} · ${user.email}`}
      />

      <Section surface="ivory" size="tight">
        <ProfileClient
          user={user}
          saved={saved === "1"}
          error={error}
          verification={verification}
          smsAvailable={smsAvailable}
        />
      </Section>
    </>
  );
}
