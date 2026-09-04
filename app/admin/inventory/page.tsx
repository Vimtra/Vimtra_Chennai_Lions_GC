import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { listAllProducts } from "@/lib/db";
import AdminShell from "@/components/admin/AdminShell";
import InventoryTable from "@/components/admin/InventoryTable";

export const metadata: Metadata = {
  title: "Inventory · Lions Admin",
  robots: { index: false, follow: false },
};

// Inventory is authoritative for stock; a fresh read on every visit
// avoids showing stale numbers if two admins are editing at once.
export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  const user = await requireAdmin();
  const products = await listAllProducts();

  const active = products.filter((p) => p.active).length;
  const out = products.filter((p) => p.active && p.stock <= 0).length;
  const low = products.filter(
    (p) => p.active && p.stock > 0 && p.stock <= 5
  ).length;

  return (
    <AdminShell email={user.email} active="inventory">
      <div className="admin-head">
        <div>
          <h1>Inventory</h1>
          <p>
            {products.length} products · {active} active · {out} out of stock ·{" "}
            {low} low stock
          </p>
        </div>
        <Link href="/admin/products" className="btn-ghost">
          Product editor →
        </Link>
      </div>

      <InventoryTable products={products} />
    </AdminShell>
  );
}
