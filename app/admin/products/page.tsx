import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { listProducts } from "@/lib/db";
import { inr } from "@/lib/products";
import AdminShell from "@/components/admin/AdminShell";
import ProductModalButton from "@/components/admin/ProductModalButton";
import ConfirmDeleteButton from "@/components/admin/ConfirmDeleteButton";
import { createProductAction, updateProductAction, deleteProductAction } from "./actions";

export const metadata: Metadata = {
  title: "Products · Lions Admin",
  robots: { index: false, follow: false },
};

export default async function AdminProductsPage() {
  const user = await requireAdmin();
  const products = await listProducts();

  return (
    <AdminShell email={user.email} active="products">
      <div className="admin-head">
        <div>
          <h1>Products</h1>
          <p>{products.length} items in the catalog</p>
        </div>
        <div className="admin-head-actions">
          <Link href="/admin/inventory" className="btn-ghost">
            Manage stock →
          </Link>
          <ProductModalButton action={createProductAction} />
        </div>
      </div>

      <div className="admin-card overflow-x-auto">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Image</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-[9px] bg-gradient-to-br from-[#C9242E] to-[#871119] text-white/80 font-sora font-extrabold text-[11px] flex items-center justify-center">
                      {p.glyph}
                    </span>
                    <div>
                      <div className="font-sora font-bold text-[14px] text-ink">{p.name}</div>
                      <div className="font-manrope text-[12px] text-muted">{p.id}</div>
                    </div>
                  </div>
                </td>
                <td className="font-manrope text-muted">{p.cat}</td>
                <td className="font-sora font-bold">{inr(p.price)}</td>
                <td className="font-manrope text-[12.5px] text-muted">{p.img ?? "— logo —"}</td>
                <td>
                  <div className="flex items-center gap-2 justify-end">
                    <ProductModalButton product={p} action={updateProductAction} />
                    <ConfirmDeleteButton
                      action={deleteProductAction}
                      id={p.id}
                      label={p.name}
                      description="This permanently removes the product from the catalog, the shop and the admin. It cannot be undone."
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </AdminShell>
  );
}
