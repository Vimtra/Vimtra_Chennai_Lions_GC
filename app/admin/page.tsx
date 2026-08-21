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
        <StatTile n={userCount} label="Users" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
        <ManagerCard
          href="/admin/products"
          title="Product Manager"
          body="Add, edit, and remove catalog items. Updates revalidate the shop and product pages."
          icon={<Package className="w-6 h-6" />}
          bg="bg-crimson-600"
          fg="text-white"
        />
        <ManagerCard
          href="/admin/fixtures"
          title="Fixtures"
          body="Manage the AM Green IGPL Season 2026 calendar — status, venue, dates, presenting franchise."
          icon={<CalendarDays className="w-6 h-6" />}
          bg="bg-ink"
          fg="text-[#E9CB8E]"
        />
        <ManagerCard
          href="/admin/scores"
          title="Scores"
          body="Hand-key round-by-round leaderboard rows per fixture. Public /scores reads directly from these."
          icon={<Activity className="w-6 h-6" />}
          bg="bg-gold-500"
          fg="text-[#3A1A06]"
        />
        <ManagerCard
          href="/admin/leaderboards"
          title="Season Standings"
          body="Publish Franchise Table, Player of the Season, and Order of Merit rankings for the season."
          icon={<Trophy className="w-6 h-6" />}
          bg="bg-crimson-600"
          fg="text-white"
        />
        <ManagerCard
          href="/admin/news"
          title="News"
          body="Draft and publish posts to the /news feed. Rich-text editor coming next."
          icon={<Newspaper className="w-6 h-6" />}
          bg="bg-ink"
          fg="text-[#E9CB8E]"
        />
        <ManagerCard
          href="/admin/users"
          title="Users"
          body="View members, grant or revoke admin access, and remove accounts."
          icon={<UsersIcon className="w-6 h-6" />}
          bg="bg-gold-500"
          fg="text-[#3A1A06]"
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
    <div className="bg-cream-50 border border-black/[0.07] rounded-[18px] p-5">
      <div className="font-sora font-extrabold text-[32px] text-crimson-600 leading-none">{n}</div>
      <div className="font-manrope text-[11.5px] text-muted mt-2 uppercase tracking-[0.08em]">
        {label}
      </div>
    </div>
  );
}

function ManagerCard({
  href,
  title,
  body,
  icon,
  bg,
  fg,
}: {
  href: string;
  title: string;
  body: string;
  icon: React.ReactNode;
  bg: string;
  fg: string;
}) {
  return (
    <Link
      href={href}
      className="lift bg-cream-50 border border-black/[0.07] rounded-[20px] p-7 no-underline text-inherit block"
    >
      <div
        className={`w-12 h-12 rounded-[13px] ${bg} ${fg} flex items-center justify-center`}
      >
        {icon}
      </div>
      <h2 className="mt-5 font-sora font-bold text-[20px] text-ink">{title}</h2>
      <p className="mt-2 font-manrope text-[14px] leading-[1.6] text-muted">{body}</p>
    </Link>
  );
}
