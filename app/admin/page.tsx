import type { Metadata } from "next";
import Link from "next/link";
import {
  Package,
  Newspaper,
  Users as UsersIcon,
  ExternalLink,
  CalendarDays,
  Activity,
  Trophy,
  Mail,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { listProducts } from "@/lib/db";
import { prisma } from "@/lib/prisma";
import AdminShell from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "Admin · Vimtra Chennai Lions GC",
  robots: { index: false, follow: false },
};

export default async function AdminDashboard() {
  const user = await requireAdmin();
  const [
    products,
    userCount,
    fixtureCount,
    scoreCount,
    standingCount,
    postCount,
    publishedPostCount,
    mediaTotal,
    mediaActive,
    messageTotal,
    messageNew,
  ] = await Promise.all([
    listProducts(),
    prisma.user.count(),
    prisma.fixture.count(),
    prisma.score.count(),
    prisma.standing.count(),
    prisma.post.count(),
    prisma.post.count({ where: { status: "PUBLISHED" } }),
    prisma.mediaCoverage.count(),
    prisma.mediaCoverage.count({ where: { active: true } }),
    prisma.contactMessage.count(),
    prisma.contactMessage.count({ where: { status: "NEW" } }),
  ]);

  return (
    <AdminShell email={user.email} active="dashboard">
      <h1 className="font-sora font-extrabold text-[34px] tracking-[-0.02em] text-ink">Dashboard</h1>
      <p className="font-manrope text-[15px] text-muted mt-2">
        Manage the franchise catalog, IGPL data, and content. Changes publish to the live site.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mt-8">
        <StatTile n={products.length} label="Products" />
        <StatTile n={fixtureCount} label="Fixtures" />
        <StatTile n={scoreCount} label="Score rows" />
        <StatTile n={standingCount} label="Standings" />
        <StatTile n={publishedPostCount} label={`Published posts / ${postCount} total`} />
        <StatTile n={mediaActive} label={`Media visible / ${mediaTotal} total`} />
        <StatTile n={messageNew} label={`New enquiries / ${messageTotal} total`} />
        <StatTile n={userCount} label="Users" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
        <ManagerCard
          href="/admin/products"
          title="Product Manager"
          body="Add, edit, and remove catalog items. Updates revalidate the shop and product pages."
          icon={<Package className="w-5 h-5" />}
        />
        <ManagerCard
          href="/admin/fixtures"
          title="Fixtures"
          body="Manage the AM Green IGPL Season 2026 calendar — status, venue, dates, presenting franchise."
          icon={<CalendarDays className="w-5 h-5" />}
        />
        <ManagerCard
          href="/admin/scores"
          title="Scores"
          body="Hand-key round-by-round leaderboard rows per fixture. Public /scores reads directly from these."
          icon={<Activity className="w-5 h-5" />}
        />
        <ManagerCard
          href="/admin/leaderboards"
          title="Season Standings"
          body="Publish Franchise Table, Player of the Season, and Order of Merit rankings for the season."
          icon={<Trophy className="w-5 h-5" />}
        />
        <ManagerCard
          href="/admin/news"
          title="News"
          body="Draft and publish posts to the /news feed. Rich-text editor coming next."
          icon={<Newspaper className="w-5 h-5" />}
        />
        <ManagerCard
          href="/admin/users"
          title="Users"
          body="View members, grant or revoke admin access, and remove accounts."
          icon={<UsersIcon className="w-5 h-5" />}
        />
        <ManagerCard
          href="/admin/messages"
          title="Messages"
          body={
            messageNew > 0
              ? `${messageNew} new enquir${messageNew === 1 ? "y" : "ies"} from the contact form.`
              : "Enquiries submitted through /contact — read, mark resolved, or remove."
          }
          icon={<Mail className="w-5 h-5" />}
        />
      </div>

      <div className="mt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-manrope font-semibold text-[13px] text-crimson-600 no-underline"
        >
          <ExternalLink className="w-4 h-4" /> View the live site →
        </Link>
      </div>
    </AdminShell>
  );
}

function StatTile({ n, label }: { n: number; label: string }) {
  return (
    <div className="admin-stat">
      <div className="admin-stat-n">{n}</div>
      <div className="admin-stat-l">{label}</div>
    </div>
  );
}

function ManagerCard({
  href,
  title,
  body,
  icon,
}: {
  href: string;
  title: string;
  body: string;
  icon: React.ReactNode;
}) {
  return (
    <Link href={href} className="admin-mgr-card">
      <div className="admin-mgr-icon">{icon}</div>
      <h2 className="admin-mgr-title">{title}</h2>
      <p className="admin-mgr-body">{body}</p>
    </Link>
  );
}
