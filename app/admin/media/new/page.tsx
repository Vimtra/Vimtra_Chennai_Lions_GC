import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import PageHeader from "@/components/admin/ui/PageHeader";
import CoverageForm from "@/components/admin/CoverageForm";
import { createMediaCoverageAction } from "../actions";

export const metadata: Metadata = {
  title: "Add media article",
  robots: { index: false, follow: false },
};

export default async function NewMediaCoveragePage() {
  await requireAdmin();
  return (
    <>
      <PageHeader
        back={{ href: "/admin/media", label: "Media Coverage" }}
        eyebrow="Media Coverage"
        title="Add media article"
        lede="A third-party press article or social post about the Lions. Write a short original attribution — do not paste the article text."
      />
      <div className="adm-panel adm-panel-pad" style={{ maxWidth: 880 }}>
        <CoverageForm mode="media" action={createMediaCoverageAction} />
      </div>
    </>
  );
}
