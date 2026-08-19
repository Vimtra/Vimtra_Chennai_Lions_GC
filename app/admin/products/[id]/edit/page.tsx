import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getProductById } from "@/lib/db";
import AdminShell from "@/components/admin/AdminShell";
import ProductForm from "@/components/admin/ProductForm";
import { updateProductAction } from "../../actions";

export const metadata: Metadata = {
  title: "Edit Product · Lions Admin",
  robots: { index: false, follow: false },
};

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireAdmin();
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  return (
    <AdminShell email={user.email} active="products">
      <Link href="/admin/products" className="font-manrope font-semibold text-[13px] text-crimson-600 no-underline">
        ← Back to products
      </Link>
      <h1 className="mt-3 font-sora font-extrabold text-[34px] tracking-[-0.02em] text-ink">Edit product</h1>
      <p className="font-manrope text-[14px] text-muted mt-1">
        {product.name} · <span className="text-[12.5px]">{product.id}</span>
      </p>

      <div className="mt-7 bg-cream-50 border border-black/[0.07] rounded-[18px] p-7 max-w-[760px]">
        <ProductForm action={updateProductAction} product={product} submitLabel="Save changes" />
      </div>
    </AdminShell>
  );
}
