"use client";

import { useState } from "react";
import { useCart } from "@/store/cart";
import { useToast } from "@/store/toast";
import { productImage, type Product } from "@/lib/products";

/**
 * Quantity + Add-to-Cart control used on the product detail page.
 * Clamps the requested quantity to the product's stock (minus what's
 * already in the cart), so a buyer can never pick a number that would
 * over-sell on submit.
 */
export default function QtyAddToCart({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const add = useCart((s) => s.add);
  const items = useCart((s) => s.items);
  const showToast = useToast((s) => s.show);

  const inCart = items.find((i) => i.id === product.id)?.qty ?? 0;
  const outOfStock = !product.active || product.stock <= 0;
  const remaining = Math.max(0, product.stock - inCart);
  const maxAddable = Math.max(0, remaining);
  const cappedQty = Math.min(qty, Math.max(1, maxAddable));
  const disabled = outOfStock || maxAddable === 0;

  const onAdd = () => {
    if (disabled) return;
    const useQty = Math.min(cappedQty, maxAddable);
    add(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        img: productImage(product) || "",
      },
      useQty
    );
    showToast(`Added <span class="gold">${useQty} × ${product.name}</span> to cart`);
  };

  return (
    <div className="mt-7">
      <div className="flex items-center gap-[22px] flex-wrap">
        <div className="flex items-center gap-[14px] bg-white border border-black/[0.12] px-3 py-[6px] rounded-[30px]">
          <button
            type="button"
            className="qty-btn"
            aria-label="Decrease quantity"
            disabled={disabled || cappedQty <= 1}
            onClick={() => setQty((q) => Math.max(1, q - 1))}
          >
            –
          </button>
          <span className="font-sora font-bold text-[16px] min-w-[24px] text-center">
            {disabled ? 0 : cappedQty}
          </span>
          <button
            type="button"
            className="qty-btn"
            aria-label="Increase quantity"
            disabled={disabled || cappedQty >= maxAddable}
            onClick={() => setQty((q) => Math.min(maxAddable, q + 1))}
          >
            +
          </button>
        </div>
        <button
          type="button"
          disabled={disabled}
          aria-disabled={disabled}
          onClick={onAdd}
          className={`add-btn add-btn--lg press flex-1 ${
            disabled ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          {outOfStock
            ? "OUT OF STOCK"
            : maxAddable === 0
              ? "MAX IN CART"
              : "ADD TO CART"}
        </button>
      </div>
      {!outOfStock && inCart > 0 && (
        <div className="mt-3 font-manrope text-[12.5px] text-muted">
          {inCart} already in your cart · {maxAddable} more available
        </div>
      )}
      {!outOfStock && product.stock <= 5 && product.stock > 0 && (
        <div className="mt-3 font-manrope font-semibold text-[12.5px] text-crimson-600">
          Only {product.stock} left in stock
        </div>
      )}
    </div>
  );
}
