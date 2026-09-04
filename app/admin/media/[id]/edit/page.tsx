import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";
import MediaCoverageForm from "@/components/admin/MediaCoverageForm";
import { getMediaCoverage } from "@/lib/media-coverage";
import { updateMediaCoverageAction } from "../../actions";

export const metadata: Metadata = {
  title: "Edit Coverage · Lions Admin",
  robots: { index: false, follow: false },
};

export default async function EditMediaCoveragePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireAdmin();
  const { id } = await params;
  const item = await getMediaCoverage(id);
  if (!item) notFound();

  return (
    <AdminShell email={user.email} active="media">
      <Link
        href="/admin/media"
        className="font-manrope font-semibold text-[13px] text-crimson-600 no-underline"
      >
        ← Back to Media Coverage
      </Link>
      <h1 className="mt-3 font-sora font-extrabold text-[32px] tracking-[-0.02em] text-ink">
        Edit coverage
      </h1>
      <p className="font-manrope text-[14px] text-muted mt-1">
        {item.sourceName} · {item.title}
      </p>

      <div className="admin-card mt-7 !p-7 max-w-[860px]">
        <MediaCoverageForm
          action={updateMediaCoverageAction}
          item={item}
          submitLabel="Save changes"
        />
      </div>
    </AdminShell>
  );
}
