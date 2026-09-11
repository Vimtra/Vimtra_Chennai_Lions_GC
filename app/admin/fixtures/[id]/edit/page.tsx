import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getFixture, formatFixtureDate } from "@/lib/fixtures";
import PageHeader from "@/components/admin/ui/PageHeader";
import FixtureForm from "@/components/admin/FixtureForm";
import { updateFixtureAction } from "../../actions";

export const metadata: Metadata = {
  title: "Edit fixture",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function EditFixturePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const fixture = await getFixture(id);
  if (!fixture) notFound();

  return (
    <>
      <PageHeader
        back={{ href: "/admin/fixtures", label: "Fixtures" }}
        eyebrow="Fixture"
        title={fixture.name}
        lede={
          <>
            {formatFixtureDate(fixture)} · <span className="adm-mono">{fixture.slug}</span>
          </>
        }
      />
      <div className="adm-panel adm-panel-pad" style={{ maxWidth: 880 }}>
        <FixtureForm action={updateFixtureAction} fixture={fixture} submitLabel="Save changes" />
      </div>
    </>
  );
}
