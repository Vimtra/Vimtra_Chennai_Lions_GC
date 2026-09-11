import type { Metadata } from "next";
import Link from "next/link";
import { Package } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { listAllProducts } from "@/lib/db";
import PageHeader from "@/components/admin/ui/PageHeader";
import InventoryTable, { type StockFilter, type ActiveFilter } from "@/components/admin/InventoryTable";

export const metadata: Metadata = {
  title: "Inventory",
  robots: { index: false, follow: false },
};

// Inventory is authoritative for stock; a fresh read on every visit
// avoids showing stale numbers if two admins are editing at once.
export const dynamic = "force-dynamic";

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ stock?: string; vis?: string }>;
}) {
  await requireAdmin();
  const { stock, vis } = await searchParams;
  const products = await listAllProducts();

  const active = products.filter((p) => p.active).length;
  const out = products.filter((p) => p.active && p.stock <= 0).length;
  const low = products.filter((p) => p.active && p.stock > 0 && p.stock <= 5).length;

  const initialStock: StockFilter =
    stock === "IN_STOCK" || stock === "OUT_OF_STOCK" || stock === "LOW_STOCK" ? stock : "ALL";
  const initialActive: ActiveFilter = vis === "ACTIVE" || vis === "INACTIVE" ? vis : "ALL";

  return (
    <>
      <PageHeader
        eyebrow="Commerce"
        title="Inventory"
        lede={
          <>
            {products.length} products · {active} visible · <strong>{out}</strong> out of stock ·{" "}
            <strong>{low}</strong> running low. Edit quantities inline, then save them together.
          </>
        }
        actions={
          <Link href="/admin/products" className="adm-btn">
            <Package /> Product manager
          </Link>
        }
      />
      <InventoryTable products={products} initialStockFilter={initialStock} initialActiveFilter={initialActive} />
    </>
  );
}
