"use client";

import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "@/components/shop/AddToCartButton";
import { FALLBACK_LOGO, inr, productImage, type Product } from "@/lib/products";

/**
 * Shop-grid product card.
 *
 * Deliberately separate from `components/shop/ProductCard.tsx`, which the
 * product-detail page's "related" rail still renders — that page is out of
 * scope for this redesign and must keep the card it has.
 *
 * Framing. Every catalogue image sits in the SAME 1:1 well and is fitted
 * with `object-fit: contain`, not cover. The catalogue mixes square
 * packshots (most of it), one 16:9 lifestyle frame and one small portrait
 * cutout; a cover crop clipped the collar off the shirt and the lid off the
 * ball-marker tin. Contain guarantees one aspect ratio across the grid with
 * nothing cropped, and the warm paper well behind it reads as a mat rather
 * than a letterbox because most of the photography is already shot on a
 * light ground.
 *
 * Nothing here is invented: category, price and stock all come from the
 * product row, and the stock line is only drawn when the row actually says
 * something (sold out, or a low count). No sale, no discount, no "new".
 *
 * Cart behaviour is untouched — `AddToCartButton` is the same control the
 * previous card used, with the same product object.
 */
export default function ShopProductCard({ product }: { product: Product }) {
  const cover = productImage(product);
  const hasPhoto = cover !== FALLBACK_LOGO;
  const soldOut = !product.active || product.stock <= 0;
  const lowStock = !soldOut && product.stock <= 5;

  return (
    <article className={`sp-card${soldOut ? " is-out" : ""}`}>
      <Link href={`/product/${product.id}`} className="sp-card-link">
        <span className="sp-card-frame">
          <Image
            src={cover}
            alt={hasPhoto ? product.name : "Vimtra Chennai Lions"}
            fill
            sizes="(max-width: 719px) 50vw, (max-width: 1279px) 33vw, 24vw"
            className={`sp-card-img${hasPhoto ? "" : " is-mark"}`}
          />
          {soldOut && <span className="sp-card-flag is-out">Sold out</span>}
          {lowStock && (
            <span className="sp-card-flag">Only {product.stock} left</span>
          )}
        </span>

        <span className="sp-card-meta">
          <span className="sp-card-cat">{product.cat}</span>
          <span className="sp-card-name">{product.name}</span>
          <span className="sp-card-price">{inr(product.price)}</span>
        </span>
      </Link>

      <div className="sp-card-act">
        <AddToCartButton product={product} className="sp-add" />
      </div>
    </article>
  );
}
