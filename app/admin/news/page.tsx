import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";
import { Newspaper } from "lucide-react";

export const metadata: Metadata = {
  title: "News · Lions Admin",
  robots: { index: false, follow: false },
};

export default async function AdminNewsPage() {
  const user = await requireAdmin();

  return (
    <AdminShell email={user.email} active="news">
      <h1 className="font-sora font-extrabold text-[34px] tracking-[-0.02em] text-ink">News &amp; Notebook</h1>
      <p className="font-manrope text-[15px] text-muted mt-2 max-w-[640px]">
        The rich-text editor (TipTap/Quill) with draft / publish / archive states and
        inline image uploads is the next admin milestone. It needs the database layer
        (see <code>lib/db.ts</code> → Postgres) so posts persist and sort
        chronologically on the public <code>/news</code> feed.
      </p>

      <div className="mt-8 bg-cream-50 border border-dashed border-black/[0.2] rounded-[20px] p-12 text-center">
        <Newspaper className="w-10 h-10 text-crimson-600 opacity-60 mx-auto mb-4" />
        <div className="font-sora font-bold text-[18px] text-ink">Editor coming next</div>
        <p className="font-manrope text-[14px] text-muted mt-2 max-w-[460px] mx-auto">
          Scaffolded and routed. Wire it once a database is connected so drafts and
          published posts survive across deploys.
        </p>
      </div>
    </AdminShell>
  );
}
