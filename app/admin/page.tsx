import type { Metadata } from "next";
import Link from "next/link";
import { Package, Newspaper, Users as UsersIcon, ExternalLink } from "lucide-react";
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
  const products = await listProducts();
  const userCount = await prisma.user.count();

  return (
    <AdminShell email={user.email} active="dashboard">
      <h1 className="font-sora font-extrabold text-[34px] tracking-[-0.02em] text-ink">Dashboard</h1>
      <p className="font-manrope text-[15px] text-muted mt-2">
        Manage the franchise catalog and content. Changes publish to the live site.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
        <div className="bg-cream-50 border border-black/[0.07] rounded-[18px] p-6">
          <div className="font-sora font-extrabold text-[40px] text-crimson-600 leading-none">{products.length}</div>
          <div className="font-manrope text-[12.5px] text-muted mt-2 uppercase tracking-[0.08em]">Products</div>
        </div>
        <div className="bg-cream-50 border border-black/[0.07] rounded-[18px] p-6">
          <div className="font-sora font-extrabold text-[40px] text-crimson-600 leading-none">{userCount}</div>
          <div className="font-manrope text-[12.5px] text-muted mt-2 uppercase tracking-[0.08em]">Users</div>
        </div>
        <Link href="/shop" className="bg-ink text-white rounded-[18px] p-6 flex flex-col justify-between no-underline group">
          <ExternalLink className="w-5 h-5 text-[#E9CB8E]" />
          <div className="font-sora font-bold text-[16px] mt-6 group-hover:text-[#E9CB8E] transition-colors">
            View live store →
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
        <Link href="/admin/products" className="lift bg-cream-50 border border-black/[0.07] rounded-[20px] p-7 no-underline text-inherit block">
          <div className="w-12 h-12 rounded-[13px] bg-crimson-600 text-white flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
          <h2 className="mt-5 font-sora font-bold text-[20px] text-ink">Product Manager</h2>
          <p className="mt-2 font-manrope text-[14px] leading-[1.6] text-muted">
            Add, edit, and remove catalog items. Updates revalidate the shop and product pages.
          </p>
        </Link>
        <Link href="/admin/users" className="lift bg-cream-50 border border-black/[0.07] rounded-[20px] p-7 no-underline text-inherit block">
          <div className="w-12 h-12 rounded-[13px] bg-gold-500 text-[#3A1A06] flex items-center justify-center">
            <UsersIcon className="w-6 h-6" />
          </div>
          <h2 className="mt-5 font-sora font-bold text-[20px] text-ink">User Management</h2>
          <p className="mt-2 font-manrope text-[14px] leading-[1.6] text-muted">
            View members, grant or revoke admin access, and remove accounts.
          </p>
        </Link>
        <Link href="/admin/news" className="lift bg-cream-50 border border-black/[0.07] rounded-[20px] p-7 no-underline text-inherit block">
          <div className="w-12 h-12 rounded-[13px] bg-ink text-[#E9CB8E] flex items-center justify-center">
            <Newspaper className="w-6 h-6" />
          </div>
          <h2 className="mt-5 font-sora font-bold text-[20px] text-ink">News &amp; Notebook</h2>
          <p className="mt-2 font-manrope text-[14px] leading-[1.6] text-muted">
            Draft and publish posts to the /news feed. Rich-text editor coming next.
          </p>
        </Link>
      </div>
    </AdminShell>
  );
}
