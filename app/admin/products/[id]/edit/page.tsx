import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getProductById, listAllProducts } from "@/lib/db";
import PageHeader from "@/components/admin/ui/PageHeader";
import ProductForm from "@/components/admin/ProductForm";
import { updateProductAction } from "../../actions";

export const metadata: Metadata = {
  title: "Edit product",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [product, all] = await Promise.all([getProductById(id), listAllProducts()]);
  if (!product) notFound();
  const categories = Array.from(new Set(all.map((p) => p.cat).filter(Boolean))).sort();

  return (
    <>
      <PageHeader
        back={{ href: "/admin/products", label: "Products" }}
        eyebrow="Product"
        title={product.name}
        lede={
          <>
            <span className="adm-mono">{product.id}</span>
            {product.sku ? (
              <>
                {" "}
                · SKU <span className="adm-mono">{product.sku}</span>
              </>
            ) : null}
          </>
        }
      />
      <div className="adm-panel adm-panel-pad" style={{ maxWidth: 820 }}>
        <ProductForm
          action={updateProductAction}
          product={product}
          categories={categories}
          submitLabel="Save changes"
          redirectOnSuccess="/admin/products"
        />
      </div>
    </>
  );
}
