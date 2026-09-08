"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap, registerGsap, revealLines, rise } from "@/components/motion/gsap";
import { FALLBACK_LOGO, inr, productImage, type Product } from "@/lib/products";

/**
 * Shop opener.
 *
 * `StoryHero` (`.cm-hero`) reserves 84svh for an eyebrow and one word over a
 * course photograph. On /shop that produced a tall empty band and — worse —
 * borrowed /golf-development's putting-green frame to stand in for a page
 * whose actual subject is the merchandise. This hero uses the franchise's
 * own product photography as its image instead: three real catalogue tiles,
 * each linking to its product page, cascading down the right of the frame.
 *
 * Everything numeric on the rail is COUNTED from the rows the page already
 * renders (see DATA INTEGRITY in CLAUDE.md) — live product count, distinct
 * category count, and the lowest price actually in the catalogue. Nothing is
 * estimated, and no product is called featured, best-selling or new, because
 * no source says so. The tiles are "from the catalogue", in catalogue order.
 *
 * `/shop` is in FLOATING_HEADER_ROUTES, so the header floats over this frame
 * and the hero reserves header height as its own top padding.
 *
 * Motion runs through the shared primitives, which are no-ops under
 * prefers-reduced-motion; GSAP sets every "from" state, so with JS off the
 * hero still renders complete.
 */
export default function ShopHero({
  tiles,
  productCount,
  categoryCount,
  lowestPrice,
}: {
  /** Catalogue-order slice used for the display case. Up to three. */
  tiles: Product[];
  productCount: number;
  categoryCount: number;
  lowestPrice: number | null;
}) {
  const root = useRef<HTMLElement | null>(null);

  useEffect(() => {
    registerGsap();
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      const e = rise("[data-sp-eyebrow]", { y: 12, duration: 0.6 });
      if (e) tl.add(e, 0.15);
      const l = revealLines("[data-sp-line] > span", { stagger: 0.1 });
      if (l) tl.add(l, 0.28);
      const t = rise("[data-sp-tail]", { y: 16, stagger: 0.08 });
      if (t) tl.add(t, 0.62);
      // The case fills one tile after another — a cabinet being dressed,
      // not a banner sliding in.
      const c = rise("[data-sp-tile]", { y: 30, stagger: 0.1, duration: 0.8 });
      if (c) tl.add(c, 0.5);
      const s = rise("[data-sp-stat]", { y: 18, stagger: 0.06 });
      if (s) tl.add(s, 0.86);
    }, el);
    return () => ctx.revert();
  }, []);

  const cells: { k: string; v: string }[] = [
    { k: "In the store", v: String(productCount) },
    { k: "Collections", v: String(categoryCount) },
  ];
  if (lowestPrice !== null) cells.push({ k: "From", v: inr(lowestPrice) });

  return (
    <section ref={root} className="sp-hero" aria-label="Shop">
      <div className="sp-hero-aurora" aria-hidden />
      <div className="v-grain" aria-hidden />

      <div className="hp-wrap sp-hero-inner">
        <div className="sp-hero-head">
          <p className="cm-eyebrow" data-sp-eyebrow>
            Official Chennai Lions Store
          </p>
          <h1 className="sp-hero-title">
            <span className="mq-line" data-sp-line>
              <span>SHOP</span>
            </span>
          </h1>
          <p className="sp-hero-line" data-sp-tail>
            Match-day kit, performance apparel and tour-tested accessories.
            Fan-priced, single units, shipped across India.
          </p>

          {cells.length > 0 && (
            <dl className="sp-hero-rail">
              {cells.map((c) => (
                <div className="sp-hero-cell" key={c.k} data-sp-stat>
                  <dt>{c.k}</dt>
                  <dd>{c.v}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        {tiles.length > 0 && (
          <div className="sp-hero-case">
            <p className="sp-hero-case-k" data-sp-tail>
              From the catalogue
            </p>
            <ul className="sp-hero-tiles">
              {tiles.slice(0, 3).map((p) => {
                const cover = productImage(p);
                const hasPhoto = cover !== FALLBACK_LOGO;
                return (
                  <li key={p.id} data-sp-tile>
                    <Link href={`/product/${p.id}`} className="sp-hero-tile">
                      <span className="sp-hero-tile-frame">
                        <Image
                          src={cover}
                          alt={hasPhoto ? p.name : "Vimtra Chennai Lions"}
                          fill
                          sizes="(max-width: 1023px) 32vw, 16vw"
                          className={`sp-hero-tile-img${
                            hasPhoto ? "" : " is-mark"
                          }`}
                        />
                      </span>
                      <span className="sp-hero-tile-name">{p.name}</span>
                      <span className="sp-hero-tile-price">{inr(p.price)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
