import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Package, Eye, EyeOff, Boxes } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { listAllProducts } from "@/lib/db";
import { inr, productImage } from "@/lib/products";
import PageHeader from "@/components/admin/ui/PageHeader";
import SearchForm from "@/components/admin/ui/SearchForm";
import EmptyState from "@/components/admin/ui/EmptyState";
import QuickActionButton from "@/components/admin/ui/QuickActionButton";
import AutoSubmitSelect from "@/components/admin/ui/AutoSubmitSelect";
import { StockPill } from "@/components/admin/ui/StatusPill";
import ProductModalButton from "@/components/admin/ProductModalButton";
import ConfirmDeleteButton from "@/components/admin/ConfirmDeleteButton";
import {
  createProductAction,
  updateProductAction,
  deleteProductAction,
  setProductActiveAction,
} from "./actions";

export const metadata: Metadata = {
  title: "Products",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Vis = "ALL" | "VISIBLE" | "HIDDEN";

/**
 * Product Manager. Lists EVERY product — hidden ones included — so a
 * product taken off the shop can always be found and restored. (The
 * previous version listed only active rows, which made hidden products
 * unreachable from the admin.)
 */
export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; vis?: string; cat?: string }>;
}) {
  await requireAdmin();
  const { q, vis: rawVis, cat } = await searchParams;
  const vis: Vis = rawVis === "VISIBLE" || rawVis === "HIDDEN" ? rawVis : "ALL";
  const all = await listAllProducts();
  const categories = Array.from(new Set(all.map((p) => p.cat).filter(Boolean))).sort();

  const needle = q?.trim().toLowerCase();
  const products = all.filter((p) => {
    if (vis === "VISIBLE" && !p.active) return false;
    if (vis === "HIDDEN" && p.active) return false;
    if (cat && p.cat !== cat) return false;
    if (needle) {
      return (
        p.name.toLowerCase().includes(needle) ||
        p.id.toLowerCase().includes(needle) ||
        (p.sku ?? "").toLowerCase().includes(needle) ||
        p.cat.toLowerCase().includes(needle)
      );
    }
    return true;
  });

  const hidden = all.filter((p) => !p.active).length;
  const href = (next: { vis?: Vis; cat?: string }) => {
    const sp = new URLSearchParams();
    const v = next.vis ?? vis;
    const c = next.cat === undefined ? cat : next.cat;
    if (q) sp.set("q", q);
    if (v !== "ALL") sp.set("vis", v);
    if (c) sp.set("cat", c);
    const qs = sp.toString();
    return qs ? `/admin/products?${qs}` : "/admin/products";
  };

  return (
    <>
      <PageHeader
        eyebrow="Commerce"
        title="Products"
        lede={
          <>
            {all.length} in the catalogue · {all.length - hidden} visible on the shop · {hidden} hidden. Stock levels are
            edited in bulk under <Link href="/admin/inventory">Inventory</Link>.
          </>
        }
        actions={
          <>
            <Link href="/admin/inventory" className="adm-btn">
              <Boxes /> Inventory
            </Link>
            <ProductModalButton action={createProductAction} categories={categories} />
          </>
        }
      />

      <div className="adm-toolbar">
        <SearchForm action="/admin/products" q={q} keep={{ vis: vis === "ALL" ? undefined : vis, cat }} placeholder="Search name, SKU or slug" />
        <div className="adm-chips">
          {(["ALL", "VISIBLE", "HIDDEN"] as Vis[]).map((v) => (
            <Link key={v} href={href({ vis: v })} className={`adm-chip ${vis === v ? "is-active" : ""}`}>
              {v === "ALL" ? "All" : v === "VISIBLE" ? "Visible" : "Hidden"}
            </Link>
          ))}
        </div>
        {categories.length > 1 && (
          <form action="/admin/products" method="get">
            {q && <input type="hidden" name="q" value={q} />}
            {vis !== "ALL" && <input type="hidden" name="vis" value={vis} />}
            <AutoSubmitSelect name="cat" defaultValue={cat ?? ""} aria-label="Filter by category">
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </AutoSubmitSelect>
            <noscript>
              <button type="submit" className="adm-btn adm-btn-sm">
                Apply
              </button>
            </noscript>
          </form>
        )}
      </div>

      <div className="adm-panel">
        {products.length === 0 ? (
          <EmptyState
            icon={<Package />}
            title={all.length === 0 ? "The catalogue is empty" : "No products match"}
            body={all.length === 0 ? "Add the first product to start selling." : "Try another search or clear the filters."}
            actions={
              all.length === 0 ? (
                <ProductModalButton action={createProductAction} categories={categories} />
              ) : (
                <Link href="/admin/products" className="adm-btn adm-btn-sm">
                  Clear filters
                </Link>
              )
            }
          />
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table is-responsive">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th className="adm-td-right">Price</th>
                  <th>Stock</th>
                  <th>Shop</th>
                  <th className="adm-td-actions">
                    <span className="adm-sr">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const img = productImage(p);
                  const hasImage = Boolean(p.img || p.images?.[0]);
                  return (
                    <tr key={p.id} className={!p.active ? "is-dim" : undefined}>
                      <td className="adm-td-primary">
                        <div className="adm-cell-media">
                          {hasImage ? (
                            <span className="adm-thumb is-contain">
                              <Image src={img} alt="" width={44} height={44} style={{ width: "100%", height: "100%" }} />
                            </span>
                          ) : (
                            <span className="adm-thumb-glyph">{p.glyph || "—"}</span>
                          )}
                          <div>
                            <div className="adm-cell-title">{p.name}</div>
                            <div className="adm-cell-sub">
                              {p.sku ? <span className="adm-mono">{p.sku}</span> : <span>{p.id}</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td data-label="Category" className="adm-td-muted">
                        {p.cat}
                      </td>
                      <td data-label="Price" className="adm-td-num adm-td-right">
                        {inr(p.price)}
                      </td>
                      <td data-label="Stock">
                        <StockPill stock={p.stock} active={p.active} />
                      </td>
                      <td data-label="Shop">
                        <QuickActionButton
                          action={setProductActiveAction}
                          fields={{ id: p.id, active: p.active ? "0" : "1" }}
                          className={`adm-btn adm-btn-sm ${p.active ? "adm-btn-ghost" : ""}`}
                          title={p.active ? "Hide from the shop" : "Show on the shop"}
                        >
                          {p.active ? (
                            <>
                              <Eye /> Visible
                            </>
                          ) : (
                            <>
                              <EyeOff /> Hidden
                            </>
                          )}
                        </QuickActionButton>
                      </td>
                      <td className="adm-td-actions">
                        <div className="adm-actions">
                          <ProductModalButton product={p} action={updateProductAction} categories={categories} />
                          <ConfirmDeleteButton
                            action={deleteProductAction}
                            id={p.id}
                            label={p.name}
                            meta={p.sku ?? p.id}
                            description="Removes the product from the catalogue, the shop and the admin. Products that appear on any order cannot be deleted — hide them instead."
                            triggerClassName="adm-btn adm-btn-sm adm-btn-ghost adm-tone-danger"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="adm-panel-foot">
          <span>
            {products.length} of {all.length} shown
          </span>
          <span className="adm-hide-sm">Hidden products stay in the catalogue and keep their order history.</span>
        </div>
      </div>
    </>
  );
}
