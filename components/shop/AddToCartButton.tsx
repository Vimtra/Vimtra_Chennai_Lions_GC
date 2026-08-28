"use client";

import { useState } from "react";
import { useCart } from "@/store/cart";
import { useToast } from "@/store/toast";
import { productImage, type Product } from "@/lib/products";

export default function AddToCartButton({
  product,
  qty = 1,
  className = "",
  disabled: disabledOverride,
}: {
  product: Product;
  qty?: number;
  className?: string;
  /** External override — used by callers who've already computed a
   *  disabled state (e.g. quantity picker at max). Otherwise inferred
   *  from `product.active` + `product.stock`. */
  disabled?: boolean;
}) {
  const add = useCart((s) => s.add);
  const items = useCart((s) => s.items);
  const showToast = useToast((s) => s.show);
  const [added, setAdded] = useState(false);

  const inCart = items.find((i) => i.id === product.id)?.qty ?? 0;
  const outOfStock = !product.active || product.stock <= 0;
  const wouldExceedStock = inCart + qty > product.stock;
  const disabled =
    disabledOverride || outOfStock || wouldExceedStock;

  const onClick = () => {
    if (disabled) return;
    add(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        img: productImage(product) || "",
      },
      qty
    );
    const label = qty > 1 ? `${qty} × ${product.name}` : product.name;
    showToast(`Added <span class="gold">${label}</span> to cart`);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const label = outOfStock
    ? "OUT OF STOCK"
    : wouldExceedStock
      ? "MAX IN CART"
      : added
        ? "ADDED ✓"
        : "ADD TO CART";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
      className={`add-btn press ${added ? "added" : ""} ${className} ${
        disabled ? "opacity-60 cursor-not-allowed" : ""
      }`.trim()}
    >
      {label}
    </button>
  );
}
