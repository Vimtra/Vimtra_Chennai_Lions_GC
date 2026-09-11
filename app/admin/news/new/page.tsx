import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import PageHeader from "@/components/admin/ui/PageHeader";
import CoverageForm from "@/components/admin/CoverageForm";
import { createOfficialNewsAction } from "../actions";

export const metadata: Metadata = {
  title: "Add official news",
  robots: { index: false, follow: false },
};

export default async function NewOfficialNewsPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader
        back={{ href: "/admin/news", label: "Official News" }}
        eyebrow="Official News"
        title="Add official news"
        lede="A story the league or the franchise itself published. Publish now, or save it as a draft to finish later."
      />
      <div className="adm-panel adm-panel-pad" style={{ maxWidth: 880 }}>
        <CoverageForm mode="news" action={createOfficialNewsAction} />
      </div>
    </>
  );
}
