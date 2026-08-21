import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getFixture } from "@/lib/fixtures";
import AdminShell from "@/components/admin/AdminShell";
import FixtureForm from "@/components/admin/FixtureForm";
import { updateFixtureAction } from "../../actions";

export const metadata: Metadata = {
  title: "Edit Fixture · Lions Admin",
  robots: { index: false, follow: false },
};

export default async function EditFixturePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireAdmin();
  const { id } = await params;
  const fixture = await getFixture(id);
  if (!fixture) notFound();

  return (
    <AdminShell email={user.email} active="fixtures">
      <Link
        href="/admin/fixtures"
        className="font-manrope font-semibold text-[13px] text-crimson-600 no-underline"
      >
        ← Back to fixtures
      </Link>
      <h1 className="mt-3 font-sora font-extrabold text-[34px] tracking-[-0.02em] text-ink">
        Edit fixture
      </h1>
      <p className="font-manrope text-[14px] text-muted mt-1">
        {fixture.name} · <span className="text-[12.5px]">{fixture.slug}</span>
      </p>

      <div className="mt-7 bg-cream-50 border border-black/[0.07] rounded-[18px] p-7 max-w-[860px]">
        <FixtureForm
          action={updateFixtureAction}
          fixture={fixture}
          submitLabel="Save changes"
        />
      </div>
    </AdminShell>
  );
}
