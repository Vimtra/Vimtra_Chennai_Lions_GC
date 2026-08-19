"use client";

import { useState } from "react";
import { useCart } from "@/store/cart";
import { useToast } from "@/store/toast";
import type { Product } from "@/lib/products";

export default function QtyAddToCart({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const add = useCart((s) => s.add);
  const showToast = useToast((s) => s.show);

  const onAdd = () => {
    add(
      { id: product.id, name: product.name, price: product.price, img: product.img ?? "" },
      qty
    );
    showToast(`Added <span class="gold">${qty} × ${product.name}</span> to cart`);
  };

  return (
    <div className="mt-7 flex items-center gap-[22px] flex-wrap">
      <div className="flex items-center gap-[14px] bg-white border border-black/[0.12] px-3 py-[6px] rounded-[30px]">
        <button
          className="qty-btn"
          aria-label="Decrease quantity"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
        >
          –
        </button>
        <span className="font-sora font-bold text-[16px] min-w-[24px] text-center">
          {qty}
        </span>
        <button
          className="qty-btn"
          aria-label="Increase quantity"
          onClick={() => setQty((q) => q + 1)}
        >
          +
        </button>
      </div>
      <button className="add-btn add-btn--lg press flex-1" onClick={onAdd}>
        ADD TO CART
      </button>
    </div>
  );
}
