import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import PageHeader from "@/components/admin/ui/PageHeader";
import CoverageForm from "@/components/admin/CoverageForm";
import { MEDIA_KINDS, getMediaCoverage } from "@/lib/media-coverage";
import { updateMediaCoverageAction } from "../../actions";

export const metadata: Metadata = {
  title: "Edit media article",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function EditMediaCoveragePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const item = await getMediaCoverage(id);
  // An OFFICIAL row is edited under /admin/news, never here.
  if (!item || !MEDIA_KINDS.includes(item.kind)) notFound();

  return (
    <>
      <PageHeader
        back={{ href: "/admin/media", label: "Media Coverage" }}
        eyebrow="Media Coverage"
        title={item.title}
        lede={`${item.sourceName} · ${item.kind.toLowerCase()}`}
      />
      <div className="adm-panel adm-panel-pad" style={{ maxWidth: 880 }}>
        <CoverageForm mode="media" action={updateMediaCoverageAction} item={item} />
      </div>
    </>
  );
}
