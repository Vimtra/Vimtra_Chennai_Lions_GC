import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import PageHeader from "@/components/admin/ui/PageHeader";
import FixtureForm from "@/components/admin/FixtureForm";
import { createFixtureAction } from "../actions";

export const metadata: Metadata = {
  title: "Add fixture",
  robots: { index: false, follow: false },
};

export default async function NewFixturePage() {
  await requireAdmin();
  return (
    <>
      <PageHeader
        back={{ href: "/admin/fixtures", label: "Fixtures" }}
        eyebrow="Fixtures"
        title="Add fixture"
        lede="Enter only dates and venues verified against the official IGPL schedule or the season brochure."
      />
      <div className="adm-panel adm-panel-pad" style={{ maxWidth: 880 }}>
        <FixtureForm action={createFixtureAction} submitLabel="Add fixture" />
      </div>
    </>
  );
}
