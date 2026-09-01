"use client";

import Link from "next/link";
import type { Product } from "@/lib/products";

export default function ProductForm({
  action,
  product,
  submitLabel,
  onCancel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  product?: Product;
  submitLabel: string;
  onCancel?: () => void;
}) {
  return (
    <form action={action} className="grid gap-4">
      {product && <input type="hidden" name="id" value={product.id} />}
      <input type="hidden" name="currentImg" value={product?.img ?? product?.images?.[0] ?? ""} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="field">
          <label>Name</label>
          <input name="name" required defaultValue={product?.name} placeholder="Official Lions T-Shirt" />
        </div>
        <div className="field">
          <label>Category</label>
          <input name="cat" required defaultValue={product?.cat} placeholder="Apparel" />
        </div>
        <div className="field">
          <label>Price (₹)</label>
          <input name="price" type="number" min="0" step="1" required defaultValue={product?.price} />
        </div>
        <div className="field">
          <label>Glyph (3 letters)</label>
          <input name="glyph" maxLength={3} defaultValue={product?.glyph} placeholder="TEE" />
        </div>
      </div>
      <div className="field">
        <label>Image path (optional)</label>
        <input
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          placeholder="/assets/prod-x.png — leave blank to use the team logo"
        />
      </div>
      <div className="field">
        <label>Order range</label>
        <input name="range" defaultValue={product?.range} placeholder="100 to 500 units" />
      </div>
      <div className="field">
        <label>Description</label>
        <textarea name="desc" defaultValue={product?.desc} placeholder="Materials, fit, finish…" />
      </div>
      <div className="flex gap-3">
        <button type="submit" className="btn-dark press">{submitLabel}</button>
        {onCancel ? <button type="button" onClick={onCancel} className="btn-ghost">Cancel</button> : <Link href="/admin/products" className="btn-ghost">Cancel</Link>}
      </div>
    </form>
  );
}
