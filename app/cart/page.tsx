"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { useCart, cartCount, useCartHydrated } from "@/store/cart";
import { FALLBACK_LOGO, inr } from "@/lib/products";
import { computeTotals, shippingExplainer } from "@/lib/orders-totals";
import PageHero from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";

export default function CartPage() {
  const items = useCart((s) => s.items);
  const inc = useCart((s) => s.inc);
  const dec = useCart((s) => s.dec);
  const remove = useCart((s) => s.remove);
  const hydrated = useCartHydrated();

  // Totals delegated to the shared calculator so /cart, /checkout, and the
  // server-side placeOrderAction always compute the same numbers.
  const { subtotal, shipping, tax, total } = computeTotals(
    items.map((i) => ({ price: i.price, qty: i.qty }))
  );
  const count = hydrated ? cartCount(items) : 0;

  return (
    <>
      <PageHero
        variant="compact"
        eyebrow="Your Bag"
        title={["YOUR CART"]}
        lead={
          hydrated && count > 0
            ? `${count} item${count === 1 ? "" : "s"} · review and check out below.`
            : undefined
        }
      />

      <Section surface="ivory" size="tight">
          <div>
            {!hydrated ? null : items.length === 0 ? (
              <EmptyCart />
            ) : (
              items.map((it) => (
                <div className="cart-row" key={it.id}>
                  <div className="thumb">
                    <Image
                      src={it.img || FALLBACK_LOGO}
                      alt={it.name}
                      width={68}
                      height={68}
                      className="w-full h-full object-contain"
                      style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))" }}
                    />
                  </div>
                  <div>
                    <div className="font-sora font-bold text-[16px]">{it.name}</div>
                    <div className="font-manrope text-[13px] text-muted mt-1">
                      {inr(it.price)} each
                    </div>
                  </div>
                  <div className="qty">
                    <button onClick={() => dec(it.id)} aria-label="Decrease">
                      −
                    </button>
                    <span>{it.qty}</span>
                    <button onClick={() => inc(it.id)} aria-label="Increase">
                      +
                    </button>
                  </div>
                  <div className="font-sora font-extrabold text-[18px] text-crimson-600">
                    {inr(it.price * it.qty)}
                  </div>
                  <button
                    className="remove"
                    onClick={() => remove(it.id)}
                    aria-label="Remove"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="summary">
            <h3>Order Summary</h3>
            <div className="line">
              <span>Subtotal</span>
              <span>{inr(subtotal)}</span>
            </div>
            <div className="line">
              <span>Shipping</span>
              <span>{shippingExplainer(subtotal)}</span>
            </div>
            <div className="line">
              <span>GST (18%)</span>
              <span>{inr(tax)}</span>
            </div>
            <div className="total">
              <span>Total</span>
              <span>{inr(total)}</span>
            </div>
            {hydrated && items.length > 0 ? (
              <Link
                href="/checkout"
                className="cta-gold press w-full mt-[22px] py-[14px] text-[13.5px] tracking-[0.06em] justify-center inline-flex"
                style={{ textDecoration: "none" }}
              >
                PROCEED TO CHECKOUT
              </Link>
            ) : (
              <button
                type="button"
                disabled
                aria-disabled="true"
                className="cta-gold press w-full mt-[22px] py-[14px] text-[13.5px] tracking-[0.06em] justify-center opacity-60 cursor-not-allowed"
              >
                CART IS EMPTY
              </button>
            )}
            <div className="mt-4 font-manrope text-[12px] text-white/55 leading-[1.55]">
              You&apos;ll sign in on the next screen (or create an account) to
              confirm delivery details.
            </div>
          </div>
        </Section>
    </>
  );
}

function EmptyCart() {
  return (
    <div className="hp-empty">
      <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-crimson-600 opacity-70" />
      <div className="font-sora font-extrabold text-[32px] text-ink tracking-[-0.02em]">
        Your cart is empty
      </div>
      <p className="font-manrope text-[14px] text-muted my-[10px] mb-[22px]">
        Pick up Lions match kit, performance polos, and tour accessories at the
        shop.
      </p>
      <Link href="/shop" className="cta-gold">
        GO TO SHOP
      </Link>
    </div>
  );
}
