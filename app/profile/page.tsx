import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import ProfileClient from "@/components/profile/ProfileClient";

export const metadata: Metadata = {
  title: "My Account · Vimtra Chennai Lions GC",
  robots: { index: false, follow: false },
};

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const user = await requireUser("/profile");
  const { saved, error } = await searchParams;

  return <ProfileClient user={user} saved={saved === "1"} error={error} />;
}
