"use client";

import { useState } from "react";
import { useCart } from "@/store/cart";
import { useToast } from "@/store/toast";
import type { Product } from "@/lib/products";

export default function AddToCartButton({
  product,
  qty = 1,
  className = "",
}: {
  product: Product;
  qty?: number;
  className?: string;
}) {
  const add = useCart((s) => s.add);
  const showToast = useToast((s) => s.show);
  const [added, setAdded] = useState(false);

  const onClick = () => {
    add(
      { id: product.id, name: product.name, price: product.price, img: product.img ?? "" },
      qty
    );
    const label = qty > 1 ? `${qty} × ${product.name}` : product.name;
    showToast(`Added <span class="gold">${label}</span> to cart`);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`add-btn press ${added ? "added" : ""} ${className}`.trim()}
    >
      {added ? "ADDED ✓" : "ADD TO CART"}
    </button>
  );
}
